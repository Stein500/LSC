package com.colombes.atelier.web

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import com.colombes.atelier.AppConfig

/**
 * Gestion des liens : navigation interne dans la WebView, liens externes
 * (tel:, mailto:, WhatsApp, Google Maps, navigateur) dans les apps natives.
 */
class ColombesWebViewClient(
    private val context: Context,
    private val onMainError: () -> Unit,
    private val onHomeLoaded: (() -> Unit)? = null
) : WebViewClient() {

    @Deprecated("Deprecated in API 24")
    override fun shouldOverrideUrlLoading(view: WebView?, url: String): Boolean {
        return handleLink(url)
    }

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        return request?.url?.toString()?.let { handleLink(it) } ?: false
    }

    private fun handleLink(url: String): Boolean {
        val uri = Uri.parse(url)
        val scheme = uri.scheme?.lowercase() ?: ""

        if (scheme == "https" || scheme == "http") {
            if (uri.host == AppConfig.HOME_HOST) return false
            if (url.contains("wa.me") || url.contains("whatsapp.com")) {
                openExternal(url); return true
            }
            if (uri.host?.contains("maps.google") == true || url.contains("maps.app.goo.gl")) {
                openExternal(url); return true
            }
            openExternal(url); return true
        }

        return when (scheme) {
            "tel", "mailto", "sms", "geo", "whatsapp", "intent" -> {
                openExternal(url); true
            }
            else -> false
        }
    }

    private fun openExternal(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            context.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
        }
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        // Injecte l'observateur d'événements (formulaires, appels, WhatsApp)
        view?.let { JsInjector.inject(it, url) }
        // Synchro splash : notifie quand la page d'accueil est rendue
        if (onHomeLoaded != null && url?.startsWith(AppConfig.HOME_URL) == true) {
            onHomeLoaded()
        }
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: android.webkit.WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        if (request?.isForMainFrame == true) onMainError()
    }

    override fun onReceivedHttpError(
        view: WebView?,
        request: WebResourceRequest?,
        errorResponse: WebResourceResponse?
    ) {
        super.onReceivedHttpError(view, request, errorResponse)
        if (request?.isForMainFrame == true && (errorResponse?.statusCode ?: 0) >= 400) {
            onMainError()
        }
    }
}
