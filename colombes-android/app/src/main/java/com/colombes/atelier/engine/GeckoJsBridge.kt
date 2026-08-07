package com.colombes.atelier.engine

import android.content.Context
import android.content.Intent
import com.colombes.atelier.AppConfig
import com.colombes.atelier.notifications.NotificationHelper
import com.colombes.atelier.web.DownloadHelper
import org.json.JSONObject
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.WebExtension

/**
 * Reçoit les messages du site (via la WebExtension content script) et les
 * transforme en actions natives. Aucune URL du site n'est jamais affichée.
 */
class GeckoJsBridge(private val context: Context) {

    /** Gère un message venant de la WebExtension. */
    fun onMessage(nativeApp: String?, message: Any?): GeckoResult<Any>? {
        val json = message as? JSONObject ?: return GeckoResult.fromValue(null)
        return when (json.optString("type")) {
            "getAppVersion" -> GeckoResult.fromValue(AppConfig.APP_VERSION)

            "notify" -> {
                NotificationHelper.ensureChannels(context)
                NotificationHelper.show(
                    context,
                    NotificationHelper.CHANNEL_EVENTS,
                    NotificationHelper.NOTIF_ID_EVENT,
                    json.optString("title", "Colombes"),
                    json.optString("body", "")
                )
                GeckoResult.fromValue(null)
            }

            "downloadPdf" -> {
                DownloadHelper.saveBase64Pdf(
                    context,
                    json.optString("base64", ""),
                    json.optString("filename", "ticket.pdf")
                )
                GeckoResult.fromValue(null)
            }

            "share" -> {
                shareText(json.optString("text", ""))
                GeckoResult.fromValue(null)
            }

            else -> GeckoResult.fromValue(null)
        }
    }

    private fun shareText(text: String) {
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
        }
        runCatching { context.startActivity(Intent.createChooser(send, "Partager")) }
    }

    /** MessageDelegate à enregistrer sur la WebExtension. */
    val messageDelegate = object : WebExtension.MessageDelegate {
        override fun onMessage(nativeApp: String?, message: Any?): GeckoResult<Any>? {
            return this@GeckoJsBridge.onMessage(nativeApp, message)
        }
    }
}
