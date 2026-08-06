package com.colombes.atelier.web

import android.content.Context
import android.content.Intent
import android.webkit.JavascriptInterface
import com.colombes.atelier.AppConfig
import com.colombes.atelier.notifications.NotificationHelper

/**
 * Pont JavaScript exposé au site sous le nom global `ColombesApp`.
 *
 * Seules ces méthodes sont exposées — jamais de donnée sensible.
 */
class ColombesJsBridge(private val context: Context) {

    /** Le site peut personnaliser son rendu in-app. */
    @JavascriptInterface
    fun isApp(): Boolean = true

    /** Version de l'application. */
    @JavascriptInterface
    fun getAppVersion(): String = AppConfig.APP_VERSION

    /** Télécharge et ouvre un ticket PDF fourni en base64. */
    @JavascriptInterface
    fun downloadBase64Pdf(base64: String, filename: String) {
        DownloadHelper.saveBase64Pdf(context, base64, filename)
    }

    /** Ouvre le panneau de partage Android (sans l'URL). */
    @JavascriptInterface
    fun share(text: String) {
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
        }
        runCatching {
            context.startActivity(Intent.createChooser(send, "Partager"))
        }
    }

    /** Affiche une notification locale (utilisée par le script injecté). */
    @JavascriptInterface
    fun notify(title: String, body: String) {
        NotificationHelper.ensureChannels(context)
        val id = (System.currentTimeMillis() % 100000).toInt()
        NotificationHelper.show(context, NotificationHelper.CHANNEL_EVENTS, id, title, body)
    }
}
