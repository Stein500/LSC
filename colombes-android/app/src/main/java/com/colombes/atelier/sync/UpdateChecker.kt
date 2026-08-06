package com.colombes.atelier.sync

import android.content.Context
import com.colombes.atelier.AppConfig
import com.colombes.atelier.notifications.NotificationHelper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Vérifie si le contenu du site a été mis à jour en comparant la version
 * dans `app-manifest.json` avec la version connue localement.
 *
 * ⚠️ Aucune URL du site n'est jamais affichée dans une notification.
 */
object UpdateChecker {

    private const val PREFS = "colombes_prefs"
    private const val KEY_VERSION = "site_content_version"

    /**
     * Retourne `true` si une mise à jour du site a été détectée et notifiée.
     * Premier passage (version inconnue) : mémorise sans notifier.
     */
    fun checkForUpdates(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val lastKnown = prefs.getString(KEY_VERSION, null)
        val manifest = fetchManifest() ?: return false

        val version = manifest.optString("content_version", "")
        if (version.isBlank()) return false

        if (lastKnown == null) {
            prefs.edit().putString(KEY_VERSION, version).apply()
            return false
        }
        if (version == lastKnown) return false

        // Nouvelle version : mémorise + notifie
        prefs.edit().putString(KEY_VERSION, version).apply()
        val body = changelogOf(manifest).ifBlank { "Le contenu de l'atelier a été mis à jour." }
        NotificationHelper.ensureChannels(context)
        NotificationHelper.show(
            context,
            NotificationHelper.CHANNEL_EVENTS,
            NotificationHelper.NOTIF_ID_EVENT,
            "✨ Nouveautés Colombes",
            body
        )
        return true
    }

    private fun changelogOf(manifest: JSONObject): String {
        val arr = manifest.optJSONArray("changelog") ?: return ""
        val sb = StringBuilder()
        for (i in 0 until arr.length()) {
            sb.append("• ").append(arr.optString(i, "")).append('\n')
        }
        return sb.toString().trim()
    }

    private fun fetchManifest(): JSONObject? {
        return try {
            val conn = URL(AppConfig.MANIFEST_URL).openConnection() as HttpURLConnection
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.requestMethod = "GET"
            conn.useCaches = true
            val text = conn.inputStream.bufferedReader().use { it.readText() }
            JSONObject(text)
        } catch (_: Exception) {
            null
        }
    }
}
