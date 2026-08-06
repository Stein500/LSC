package com.colombes.atelier.web

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.util.AttributeSet
import android.view.View
import android.webkit.WebSettings
import android.webkit.WebView
import com.colombes.atelier.AppConfig

/**
 * WebView « ultra » : réglages centralisés pour une expérience fluide et premium.
 */
@SuppressLint("SetJavaScriptEnabled")
class ColombesWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : WebView(context, attrs, defStyleAttr) {

    /** Callback déclenché quand la position verticale de scroll change. */
    var onScrollYChanged: ((Int) -> Unit)? = null

    init {
        setup()
    }

    private fun setup() {
        settings.run {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            safeBrowsingEnabled = true
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            setSupportMultipleWindows(false)
            allowFileAccess = false
            allowContentAccess = false
        }

        // Pas de débuggage WebView en release
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(false)
        }

        // Fluidité matérielle
        setLayerType(View.LAYER_TYPE_HARDWARE, null)
    }

    /** Charge la page d'accueil. */
    fun loadHome() {
        loadUrl(AppConfig.HOME_URL)
    }

    override fun onScrollChanged(l: Int, t: Int, oldl: Int, oldt: Int) {
        super.onScrollChanged(l, t, oldl, oldt)
        onScrollYChanged?.invoke(t)
    }
}
