package com.colombes.atelier

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlarmManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.colombes.atelier.databinding.ActivityMainBinding
import com.colombes.atelier.notifications.NotificationHelper
import com.colombes.atelier.notifications.NotificationScheduler
import com.colombes.atelier.offline.OfflineFragment
import com.colombes.atelier.web.ColombesJsBridge
import com.colombes.atelier.web.ColombesWebChromeClient
import com.colombes.atelier.web.ColombesWebViewClient
import com.colombes.atelier.web.DownloadHelper

/**
 * Activité unique qui héberge la WebView « premium ».
 */
@SuppressLint("SetJavaScriptEnabled")
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var chromeClient: ColombesWebChromeClient
    private var offlineFragment: OfflineFragment? = null
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

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
                    result.resultCode == RESULT_OK && data?.data != null -> {
                        arrayOf(data.data!!)
                    }
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

        val webView = binding.webView

        chromeClient = ColombesWebChromeClient(
            onProgressChanged = { progress -> updateProgress(progress) },
            onFileChooser = { acceptType -> openFileChooser(acceptType) }
        )
        val webViewClient = ColombesWebViewClient(this) { showOffline() }

        webView.webChromeClient = chromeClient
        webView.webViewClient = webViewClient

        // Pont JavaScript (le site peut détecter qu'il est in-app + télécharger des tickets)
        webView.addJavascriptInterface(ColombesJsBridge(this), "ColombesApp")

        // Pull-to-refresh (uniquement en haut de page)
        binding.swipeRefresh.setColorSchemeResources(R.color.marron)
        binding.swipeRefresh.setOnRefreshListener { webView.reload() }
        webView.onScrollYChanged = { scrollY ->
            binding.swipeRefresh.isEnabled = scrollY == 0
        }

        // Téléchargement des tickets PDF
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            if (url.startsWith("data:application/pdf;base64,")) {
                val base64 = url.removePrefix("data:application/pdf;base64,")
                DownloadHelper.saveBase64Pdf(this, base64, "ticket.pdf")
            } else {
                DownloadHelper.enqueueDownload(this, url, userAgent, contentDisposition, mimetype)
            }
        }

        registerNetworkMonitor()

        // Notifications quotidiennes matin/soir
        NotificationHelper.ensureChannels(this)
        NotificationScheduler.schedule(this)
        requestNotificationPermission()
        requestExactAlarmOnce()

        if (isOnline()) {
            webView.loadHome()
        } else {
            showOffline()
        }
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
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
                        startActivity(
                            Intent(
                                Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
                                Uri.parse("package:$packageName")
                            ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        )
                    }
                }
            }
        }
    }

    private fun updateProgress(progress: Int) {
        if (progress >= 100) {
            binding.progressBar.visibility = View.GONE
        } else {
            if (binding.progressBar.visibility != View.VISIBLE) {
                binding.progressBar.visibility = View.VISIBLE
            }
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

    private fun showOffline() {
        runOnUiThread {
            binding.swipeRefresh.visibility = View.INVISIBLE
            binding.fragmentContainer.visibility = View.VISIBLE

            if (offlineFragment == null) {
                offlineFragment = OfflineFragment().apply {
                    onRetry = {
                        if (isOnline()) {
                            hideOffline()
                            binding.webView.loadHome()
                        }
                    }
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
            if (frag.isAdded) {
                supportFragmentManager.beginTransaction().remove(frag).commitAllowingStateLoss()
            }
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
                        hideOffline()
                        binding.webView.loadHome()
                    }
                }
            }
        }
        networkCallback = callback
        cm.registerDefaultNetworkCallback(callback)
    }

    override fun onBackPressed() {
        if (binding.fragmentContainer.visibility == View.VISIBLE) {
            finish()
        } else if (binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            finish()
        }
    }

    override fun onDestroy() {
        networkCallback?.let {
            runCatching {
                getSystemService(ConnectivityManager::class.java)
                    ?.unregisterNetworkCallback(it)
            }
        }
        binding.webView.removeJavascriptInterface("ColombesApp")
        super.onDestroy()
    }
}
