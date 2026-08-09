package com.colombes.atelier.sync

import com.colombes.atelier.BuildConfig
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/** Une mise à jour de l'application disponible sur GitHub Releases. */
data class AppUpdate(
    val versionName: String,
    val downloadUrl: String
)

/**
 * Interroge la dernière Release GitHub du repo et compare avec la version
 * installée. Retourne null si aucune mise à jour.
 */
object AppUpdateChecker {

    private const val RELEASES_API = "https://api.github.com/repos/Stein500/LSC/releases/latest"

    fun checkForUpdate(): AppUpdate? {
        return try {
            val conn = URL(RELEASES_API).openConnection() as HttpURLConnection
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.setRequestProperty("Accept", "application/vnd.github+json")
            val text = conn.inputStream.bufferedReader().use { it.readText() }
            val json = JSONObject(text)

            val tag = json.optString("tag_name", "").removePrefix("v")
            if (tag.isBlank()) return null
            if (!isNewer(tag, BuildConfig.VERSION_NAME)) return null

            val assets = json.optJSONArray("assets")
            if (assets == null || assets.length() == 0) return null

            // Choisit le premier asset APK (une seule release APK par tag)
            var downloadUrl: String? = null
            for (i in 0 until assets.length()) {
                val a = assets.optJSONObject(i)
                val name = a?.optString("name", "") ?: ""
                if (name.endsWith(".apk")) {
                    downloadUrl = a.optString("browser_download_url", "")
                    break
                }
            }
            val url = downloadUrl ?: return null
            AppUpdate(tag, url)
        } catch (_: Exception) {
            null
        }
    }

    /** Compare deux versions semver "x.y.z". */
    private fun isNewer(remote: String, current: String): Boolean {
        val a = remote.split('.').mapNotNull { it.toIntOrNull() }
        val b = current.split('.').mapNotNull { it.toIntOrNull() }
        val len = maxOf(a.size, b.size)
        for (i in 0 until len) {
            val av = a.getOrNull(i) ?: 0
            val bv = b.getOrNull(i) ?: 0
            if (av != bv) return av > bv
        }
        return false
    }
}
