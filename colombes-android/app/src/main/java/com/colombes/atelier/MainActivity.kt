package com.colombes.atelier

import android.Manifest
import android.app.AlarmManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Typeface
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.TypedValue
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.view.animation.LinearInterpolator
import android.view.animation.OvershootInterpolator
import android.view.animation.PathInterpolator
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.colombes.atelier.databinding.ActivityMainBinding
import com.colombes.atelier.engine.BridgeInstaller
import com.colombes.atelier.engine.ColombesGeckoView
import com.colombes.atelier.engine.GeckoJsBridge
import com.colombes.atelier.engine.GeckoRuntimeHolder
import com.colombes.atelier.notifications.NotificationHelper
import com.colombes.atelier.notifications.NotificationScheduler
import com.colombes.atelier.offline.OfflineFragment
import com.colombes.atelier.sync.AppUpdate
import com.colombes.atelier.sync.AppUpdateChecker
import com.colombes.atelier.sync.UpdateWorker
import java.io.File
import java.net.URL
import java.util.concurrent.TimeUnit

/**
 * Activité unique « Colombes » basée sur **GeckoView** (moteur embarqué,
 * autonome, indépendant du WebView/Chrome système).
 *
 * Splash cinématique synchronisé : l'overlay reste affiché jusqu'au rendu
 * réel de la page d'accueil, puis ouvre les rideaux — aucune impression de
 * « site qui charge ».
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var gecko: ColombesGeckoView
    private var offlineFragment: OfflineFragment? = null
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    // --- Synchro splash ---
    private val handler = Handler(Looper.getMainLooper())
    private var splashOpened = false
    private var pageReady = false
    private var minSplashElapsed = false
    private var splashForceOpen = false
    private val curtainInterpolator = PathInterpolator(0.4f, 0.0f, 0.2f, 1.0f)
    private val goldRamp = intArrayOf(
        Color.parseColor("#F4E3C9"), Color.parseColor("#F0D9B0"),
        Color.parseColor("#ECCF9B"), Color.parseColor("#E8C48C"),
        Color.parseColor("#E4BA7F"), Color.parseColor("#DFB072"),
        Color.parseColor("#DBA65F"), Color.parseColor("#F4B860")
    )

    private val notificationPermissionLauncher: ActivityResultLauncher<String> =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    private var pendingGrant: (() -> Unit)? = null
    private var pendingReject: (() -> Unit)? = null
    private val androidPermissionsLauncher: ActivityResultLauncher<Array<String>> =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { results ->
            val allGranted = results.values.all { it }
            if (allGranted) pendingGrant?.invoke() else pendingReject?.invoke()
            pendingGrant = null
            pendingReject = null
        }

    private val fileChooserLauncher: ActivityResultLauncher<Intent> =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val uri = when {
                result.resultCode == RESULT_OK && result.data?.clipData != null ->
                    result.data!!.clipData!!.getItemAt(0).uri
                result.resultCode == RESULT_OK && result.data?.data != null -> result.data!!.data
                else -> null
            }
            gecko.filePromptResult?.complete(uri)
            gecko.filePromptResult = null
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        GeckoRuntimeHolder.ensure(this)
        setupEngine()
        BridgeInstaller.install(this, GeckoJsBridge(this))

        registerNetworkMonitor()
        setupNotifications()

        if (savedInstanceState == null) {
            startSplash()
            gecko.loadHome()
        } else {
            gecko.loadHome()
        }

        scheduleUpdateCheck()
        checkAppUpdate()
    }

    // ------------------------------------------------------------------
    // Mise à jour de l'application (GitHub Releases)
    // ------------------------------------------------------------------
    /** Vérifie en arrière-plan si une nouvelle version existe, puis propose la MAJ. */
    private fun checkAppUpdate() {
        Thread {
            val update = AppUpdateChecker.checkForUpdate()
            runOnUiThread {
                if (update != null) promptUpdate(update)
            }
        }.start()
    }

    /** Dialogue discret, affiché une seule fois par version. */
    private fun promptUpdate(update: AppUpdate) {
        val prefs = getSharedPreferences("colombes_prefs", MODE_PRIVATE)
        if (prefs.getString("ignored_version", null) == update.versionName) return

        AlertDialog.Builder(this)
            .setTitle("✨ Nouvelle version disponible")
            .setMessage(
                "Vous utilisez la version ${BuildConfig.VERSION_NAME}.\n" +
                        "La version ${update.versionName} est disponible."
            )
            .setPositiveButton("Mettre à jour") { _, _ -> downloadAndInstall(update) }
            .setNegativeButton("Plus tard") { _, _ -> /* silencieux */ }
            .setNeutralButton("Ignorer cette version") { _, _ ->
                prefs.edit().putString("ignored_version", update.versionName).apply()
            }
            .setCancelable(true)
            .show()
    }

    /** Télécharge l'APK puis lance l'installation. */
    private fun downloadAndInstall(update: AppUpdate) {
        Toast.makeText(this, "Téléchargement de la mise à jour…", Toast.LENGTH_SHORT).show()
        Thread {
            try {
                val conn = URL(update.downloadUrl).openConnection()
                conn.connect()
                val input = conn.getInputStream()
                val dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: filesDir
                dir.mkdirs()
                val file = File(dir, "colombes-atelier-${update.versionName}.apk")
                file.outputStream().use { out -> input.copyTo(out) }
                runOnUiThread { installApk(file) }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "Téléchargement impossible. Réessaie plus tard.", Toast.LENGTH_LONG).show()
                }
            }
        }.start()
    }

    /** Lance l'installateur système sur l'APK téléchargé. */
    private fun installApk(file: File) {
        try {
            val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", file)
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Impossible d'ouvrir l'installation.", Toast.LENGTH_LONG).show()
        }
    }

    private fun setupEngine() {
        gecko = ColombesGeckoView(this)
        binding.engineContainer.addView(
            gecko,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        )

        // Focus pour que le clavier s'affiche dans les champs des formulaires
        gecko.isFocusable = true
        gecko.isFocusableInTouchMode = true

        gecko.onProgress = { progress -> updateProgress(progress) }
        gecko.onHomeLoaded = { onHomePageReady() }
        gecko.onMainError = { showOffline() }
        gecko.onScrollYChanged = { scrollY -> binding.swipeRefresh.isEnabled = scrollY == 0 }
        gecko.onFileChooser = { accept -> openFileChooser(accept) }
        gecko.onAndroidPermissionsRequest = { permissions, grant, reject ->
            pendingGrant = grant
            pendingReject = reject
            androidPermissionsLauncher.launch(permissions)
        }

        gecko.setup(GeckoRuntimeHolder.runtime)
        gecko.requestFocus()

        binding.swipeRefresh.setColorSchemeResources(R.color.marron)
        binding.swipeRefresh.setOnRefreshListener { gecko.reload() }
    }

    // ------------------------------------------------------------------
    // Splash cinématique synchronisé
    // ------------------------------------------------------------------
    private fun startSplash() {
        val overlay = binding.splashOverlay.root
        overlay.visibility = View.VISIBLE

        setupCurtains()
        animateLogo()
        animateLetters()
        binding.splashOverlay.stitchingLine.sew(900)
        animateProgress()
        showSplashStatus(getString(R.string.splash_status_loading))

        binding.splashOverlay.tapHint.alpha = 0f
        binding.splashOverlay.tapHint.animate().alpha(1f).setStartDelay(700).setDuration(400).start()

        overlay.setOnClickListener { openSplash() }

        handler.postDelayed({
            minSplashElapsed = true
            maybeOpenSplash()
        }, 3200)

        // Garde-temps max : si la page n'est toujours pas rendue (hors connexion
        // ou lenteur), on affiche l'écran hors-connexion au lieu d'un écran blanc.
        handler.postDelayed({
            if (!pageReady && !splashOpened) {
                showOffline()
            }
            splashForceOpen = true
            maybeOpenSplash()
        }, 6000)
    }

    private fun setupCurtains() {
        binding.splashOverlay.leftCurtain.pivotX = 0f
        binding.splashOverlay.leftCurtain.scaleX = 0.5f
        binding.splashOverlay.rightCurtain.pivotX = 1f
        binding.splashOverlay.rightCurtain.scaleX = 0.5f
    }

    private fun animateLogo() {
        binding.splashOverlay.splashLogo.alpha = 0f
        binding.splashOverlay.splashLogo.scaleX = 0.8f
        binding.splashOverlay.splashLogo.scaleY = 0.8f
        binding.splashOverlay.splashLogo.animate()
            .scaleX(1f).scaleY(1f).alpha(1f)
            .setDuration(550).setInterpolator(DecelerateInterpolator()).start()
    }

    private fun animateLetters() {
        val word = AppConfig.BRAND
        val container = binding.splashOverlay.lettersContainer
        for ((i, ch) in word.withIndex()) {
            val tv = TextView(this).apply {
                text = ch.toString()
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 34f)
                typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
                setTextColor(goldRamp[i % goldRamp.size])
                alpha = 0f
                translationY = 60f
            }
            container.addView(
                tv,
                LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            )
            tv.postDelayed({
                tv.animate()
                    .alpha(1f).translationY(0f)
                    .setStartDelay(i * 60L)
                    .setDuration(380)
                    .setInterpolator(OvershootInterpolator(2f))
                    .start()
            }, 180)
        }
    }

    private fun animateProgress() {
        binding.splashOverlay.progressBar.pivotX = 0f
        binding.splashOverlay.progressBar.scaleX = 0f
        binding.splashOverlay.progressBar.animate()
            .scaleX(1f).setDuration(3000).setInterpolator(LinearInterpolator()).start()
    }

    private fun showSplashStatus(text: String) {
        binding.splashOverlay.splashStatus.text = text
    }

    private fun onHomePageReady() {
        pageReady = true
        runOnUiThread {
            showSplashStatus(getString(R.string.splash_status_ready))
            maybeOpenSplash()
        }
    }

    private fun maybeOpenSplash() {
        if (splashOpened) return
        if (splashForceOpen || (minSplashElapsed && pageReady)) openSplash()
    }

    private fun openSplash() {
        if (splashOpened) return
        splashOpened = true

        val width = binding.splashOverlay.root.width.toFloat()
        binding.splashOverlay.leftCurtain.animate()
            .translationX(-width).setDuration(520).setInterpolator(curtainInterpolator).start()
        binding.splashOverlay.rightCurtain.animate()
            .translationX(width).setDuration(520).setInterpolator(curtainInterpolator).start()

        handler.postDelayed({
            binding.splashOverlay.root.visibility = View.GONE
        }, 560)
    }

    // ------------------------------------------------------------------
    // Progression / fichiers / notifications
    // ------------------------------------------------------------------
    private fun updateProgress(progress: Int) {
        if (progress >= 100) {
            binding.progressBar.visibility = View.GONE
        } else {
            if (binding.progressBar.visibility != View.VISIBLE) binding.progressBar.visibility = View.VISIBLE
            binding.progressBar.progress = progress
        }
    }

    private fun openFileChooser(acceptType: String) {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = if (acceptType.isNullOrBlank()) "*/*" else acceptType
        }
        try {
            fileChooserLauncher.launch(intent)
        } catch (e: ActivityNotFoundException) {
            gecko.filePromptResult?.complete(null)
            gecko.filePromptResult = null
        }
    }

    private fun setupNotifications() {
        NotificationHelper.ensureChannels(this)
        NotificationScheduler.schedule(this)
        requestNotificationPermission()
        requestExactAlarmOnce()
    }

    private fun scheduleUpdateCheck() {
        val request = PeriodicWorkRequestBuilder<UpdateWorker>(6, TimeUnit.HOURS).build()
        WorkManager.getInstance(this)
            .enqueueUniquePeriodicWork("colombes_update_check", ExistingPeriodicWorkPolicy.KEEP, request)
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private fun requestExactAlarmOnce() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val am = getSystemService(AlarmManager::class.java) ?: return
            if (!am.canScheduleExactAlarms()) {
                val prefs = getSharedPreferences("colombes_prefs", MODE_PRIVATE)
                if (!prefs.getBoolean("asked_exact_alarm", false)) {
                    prefs.edit().putBoolean("asked_exact_alarm", true).apply()
                    runCatching {
                        startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:$packageName")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------------
    // Hors connexion / réseau
    // ------------------------------------------------------------------
    private fun showOffline() {
        runOnUiThread {
            binding.swipeRefresh.visibility = View.INVISIBLE
            binding.fragmentContainer.visibility = View.VISIBLE
            if (offlineFragment == null) {
                offlineFragment = OfflineFragment().apply {
                    onRetry = { if (isOnline()) { hideOffline(); gecko.loadHome() } }
                }
            }
            if (offlineFragment?.isAdded != true) {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.fragment_container, offlineFragment!!)
                    .commitAllowingStateLoss()
            }
        }
    }

    private fun hideOffline() {
        binding.swipeRefresh.visibility = View.VISIBLE
        binding.fragmentContainer.visibility = View.GONE
        offlineFragment?.let { frag ->
            if (frag.isAdded) supportFragmentManager.beginTransaction().remove(frag).commitAllowingStateLoss()
        }
    }

    private fun isOnline(): Boolean {
        val cm = getSystemService(ConnectivityManager::class.java) ?: return false
        val net = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(net) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    private fun registerNetworkMonitor() {
        val cm = getSystemService(ConnectivityManager::class.java) ?: return
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                runOnUiThread {
                    if (binding.fragmentContainer.visibility == View.VISIBLE) {
                        hideOffline(); gecko.loadHome()
                    }
                }
            }
        }
        networkCallback = callback
        cm.registerDefaultNetworkCallback(callback)
    }

    override fun onBackPressed() {
        when {
            binding.fragmentContainer.visibility == View.VISIBLE -> finish()
            gecko.canGoBack() -> gecko.goBack()
            else -> finish()
        }
    }

    override fun onDestroy() {
        networkCallback?.let {
            runCatching { getSystemService(ConnectivityManager::class.java)?.unregisterNetworkCallback(it) }
        }
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }
}
