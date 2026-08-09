package com.colombes.atelier.web

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.webkit.WebSettings
import android.webkit.WebView
import com.colombes.atelier.AppConfig

/**
 * WebView « premium » : réglages centralisés pour une expérience fluide et native.
 * Léger et fiable, compatible avec tous les téléphones.
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
            textZoom = 100
        }

        // Fluidité
        setLayerType(View.LAYER_TYPE_HARDWARE, null)
        overScrollMode = WebView.OVER_SCROLL_IF_CONTENT_SCROLLS
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
