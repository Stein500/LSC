package com.colombes.atelier.web

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.util.Base64
import android.webkit.MimeTypeMap
import android.webkit.URLUtil
import androidx.core.content.FileProvider
import com.colombes.atelier.notifications.NotificationHelper
import java.io.File

/**
 * Gestion des téléchargements (tickets PDF).
 */
object DownloadHelper {

    /** Déclenche un téléchargement via DownloadManager vers le dossier Téléchargements. */
    fun enqueueDownload(
        context: Context,
        url: String,
        userAgent: String,
        contentDisposition: String?,
        mimeType: String?
    ) {
        try {
            val filename = URLUtil.guessFileName(url, contentDisposition, mimeType)
            val type = mimeType ?: MimeTypeMap.getSingleton()
                .getMimeTypeFromExtension(MimeTypeMap.getFileExtensionFromUrl(url))
                ?: "application/octet-stream"

            val request = DownloadManager.Request(Uri.parse(url))
                .setTitle(filename)
                .setDescription("Ticket reçu")
                .setMimeType(type)
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setAllowedOverMetered(true)
                .setAllowedOverRoaming(true)
                .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)

            val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
        } catch (_: Exception) {
            // ignore les liens non téléchargeables
        }
    }

    /**
     * Décode un PDF base64 (renvoyé par le site) et le stocke dans le dossier
     * app-spécifique, puis l'ouvre via FileProvider.
     */
    fun saveBase64Pdf(context: Context, base64: String, filename: String) {
        try {
            val dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                ?: context.filesDir
            dir.mkdirs()

            val clean = base64.substringAfter(",", base64)
            val bytes = Base64.decode(clean, Base64.DEFAULT)
            val file = File(dir, sanitize(filename))

            file.outputStream().use { it.write(bytes) }
            NotificationHelper.ensureChannels(context)
            NotificationHelper.show(
                context,
                NotificationHelper.CHANNEL_EVENTS,
                NotificationHelper.NOTIF_ID_TICKET,
                "Ticket reçu",
                "Ton ticket est téléchargé. Appuie pour l'ouvrir."
            )
            openPdf(context, file)
        } catch (_: Exception) {
            // fichier illisible : on ne montre rien
        }
    }

    private fun openPdf(context: Context, file: File) {
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/pdf")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        runCatching {
            context.startActivity(Intent.createChooser(intent, "Ouvrir le ticket"))
        }
    }

    private fun sanitize(name: String): String {
        val cleaned = name.replace(Regex("[^A-Za-z0-9._-]"), "_")
        return if (cleaned.endsWith(".pdf")) cleaned else "$cleaned.pdf"
    }
}
