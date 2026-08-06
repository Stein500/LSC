package com.colombes.atelier.web

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceError
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
    private val onMainError: () -> Unit
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

        // Navigation interne : même host HTTPS -> charger dans la WebView
        if (scheme == "https" || scheme == "http") {
            if (uri.host == AppConfig.HOME_HOST) return false

            // WhatsApp
            if (url.contains("wa.me") || url.contains("whatsapp.com")) {
                openExternal(url)
                return true
            }
            // Google Maps
            if (uri.host?.contains("maps.google") == true || url.contains("maps.app.goo.gl")) {
                openExternal(url)
                return true
            }
            // Autre lien https externe -> navigateur / app native
            openExternal(url)
            return true
        }

        return when (scheme) {
            "tel", "mailto", "sms", "geo", "whatsapp" -> {
                openExternal(url)
                true
            }
            "intent" -> {
                handleIntent(uri)
                true
            }
            else -> false
        }
    }

    private fun openExternal(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            // Pas de résolveur -> ouvrir dans le navigateur par défaut
            runCatching {
                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
            }
        }
    }

    private fun handleIntent(uri: Uri) {
        try {
            val intent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        } catch (e: Exception) {
            // Fallback Play Store ou navigateur
            val fallback = uri.getQueryParameter("url")
                ?: uri.getQueryParameter("browser_fallback_url")
            if (fallback != null) openExternal(fallback)
        }
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        // Injecte l'observateur d'événements (formulaires, appels, WhatsApp)
        view?.let { JsInjector.inject(it, url) }
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        // Erreur sur le document principal -> écran hors-connexion (jamais d'URL affichée)
        if (request?.isForMainFrame == true) {
            onMainError()
        }
    }

    override fun onReceivedHttpError(
        view: WebView?,
        request: WebResourceRequest?,
        errorResponse: WebResourceResponse?
    ) {
        super.onReceivedHttpError(view, request, errorResponse)
        if (request?.isForMainFrame == true) {
            val code = errorResponse?.statusCode ?: 0
            if (code >= 400) {
                onMainError()
            }
        }
    }
}
