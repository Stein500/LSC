package com.colombes.atelier

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlarmManager
import android.content.ActivityNotFoundException
import android.content.Context
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
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.colombes.atelier.databinding.ActivityMainBinding
import com.colombes.atelier.notifications.NotificationHelper
import com.colombes.atelier.notifications.NotificationScheduler
import com.colombes.atelier.offline.OfflineFragment
import com.colombes.atelier.sync.UpdateWorker
import com.colombes.atelier.web.ColombesJsBridge
import com.colombes.atelier.web.ColombesWebChromeClient
import com.colombes.atelier.web.ColombesWebView
import com.colombes.atelier.web.ColombesWebViewClient
import com.colombes.atelier.web.DownloadHelper
import java.util.concurrent.TimeUnit

/**
 * Activité unique « Colombes ».
 *
 * Héberge le moteur (WebView), le splash cinématique SYNCHRONISÉ (l'overlay reste
 * affiché jusqu'à ce que la page d'accueil soit réellement rendue, puis ouvre les
 * rideaux : aucune impression de « site qui charge »), l'écran hors connexion et
 * les notifications.
 */
@SuppressLint("SetJavaScriptEnabled")
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var chromeClient: ColombesWebChromeClient
    private lateinit var webView: ColombesWebView
    private var offlineFragment: OfflineFragment? = null
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    // --- Synchro splash ---
    private val handler = Handler(Looper.getMainLooper())
    private var splashOpened = false
    private var pageReady = false
    private var minSplashElapsed = false
    private val curtainInterpolator = PathInterpolator(0.4f, 0.0f, 0.2f, 1.0f)
    private val goldRamp = intArrayOf(
        Color.parseColor("#F4E3C9"), Color.parseColor("#F0D9B0"),
        Color.parseColor("#ECCF9B"), Color.parseColor("#E8C48C"),
        Color.parseColor("#E4BA7F"), Color.parseColor("#DFB072"),
        Color.parseColor("#DBA65F"), Color.parseColor("#F4B860")
    )

    private val notificationPermissionLauncher: ActivityResultLauncher<String> =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    private val fileChooserLauncher: ActivityResultLauncher<Intent> =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val callback = chromeClient.filePathCallback
            if (callback != null) {
                val data = result.data
                val uris: Array<Uri>? = when {
                    result.resultCode == RESULT_OK && data?.clipData != null -> {
                        val clip = data.clipData!!
                        Array(clip.itemCount) { i -> clip.getItemAt(i).uri }
                    }
                    result.resultCode == RESULT_OK && data?.data != null -> arrayOf(data.data!!)
                    else -> null
                }
                callback.onReceiveValue(uris)
                chromeClient.filePathCallback = null
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupEngine()
        registerNetworkMonitor()
        setupNotifications()

        // Splash cinématique uniquement au démarrage à froid
        if (savedInstanceState == null) {
            startSplash()
            loadHomeWithSplash()
        } else {
            loadHome()
        }

        scheduleUpdateCheck()
    }

    // ------------------------------------------------------------------
    // Moteur (WebView)
    // ------------------------------------------------------------------
    private fun setupEngine() {
        webView = ColombesWebView(this)
        binding.engineContainer.addView(
            webView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        )

        chromeClient = ColombesWebChromeClient(
            onProgressChanged = { progress -> updateProgress(progress) },
            onFileChooser = { acceptType -> openFileChooser(acceptType) }
        )
        val webViewClient = ColombesWebViewClient(
            context = this,
            onMainError = { showOffline() },
            onHomeLoaded = { onHomePageReady() }
        )
        webView.webChromeClient = chromeClient
        webView.webViewClient = webViewClient

        webView.addJavascriptInterface(ColombesJsBridge(this), "ColombesApp")

        binding.swipeRefresh.setColorSchemeResources(R.color.marron)
        binding.swipeRefresh.setOnRefreshListener { webView.reload() }
        webView.onScrollYChanged = { scrollY -> binding.swipeRefresh.isEnabled = scrollY == 0 }

        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            if (url.startsWith("data:application/pdf;base64,")) {
                val base64 = url.removePrefix("data:application/pdf;base64,")
                DownloadHelper.saveBase64Pdf(this, base64, "ticket.pdf")
            } else {
                DownloadHelper.enqueueDownload(this, url, userAgent, contentDisposition, mimetype)
            }
        }
    }

    private fun loadHome() = webView.loadHome()
    private fun loadHomeWithSplash() = webView.loadHome()

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

        // Skip au tap
        overlay.setOnClickListener { openSplash() }

        // Durée minimale cinématique (premium) avant ouverture
        handler.postDelayed({
            minSplashElapsed = true
            maybeOpenSplash()
        }, 3200)
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

    /** Appelé quand la page d'accueil est rendue (onPageFinished). */
    private fun onHomePageReady() {
        pageReady = true
        runOnUiThread {
            showSplashStatus(getString(R.string.splash_status_ready))
            maybeOpenSplash()
        }
    }

    /** N'ouvre que si la durée min est écoulée ET la page prête. */
    private fun maybeOpenSplash() {
        if (splashOpened) return
        if (minSplashElapsed && pageReady) openSplash()
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
            chromeClient.filePathCallback?.onReceiveValue(null)
            chromeClient.filePathCallback = null
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
                    onRetry = { if (isOnline()) { hideOffline(); webView.loadHome() } }
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
                        hideOffline(); webView.loadHome()
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
            webView.canGoBack() -> webView.goBack()
            else -> finish()
        }
    }

    override fun onDestroy() {
        networkCallback?.let {
            runCatching { getSystemService(ConnectivityManager::class.java)?.unregisterNetworkCallback(it) }
        }
        webView.removeJavascriptInterface("ColombesApp")
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }
}
