package com.colombes.atelier.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.colombes.atelier.MainActivity
import com.colombes.atelier.R

/**
 * Création des canaux et affichage des notifications « élégantes ».
 *
 * ⚠️ Aucune notification ne contient jamais l'URL d'hébergement du site.
 */
object NotificationHelper {

    /** Notifications programmées matin/soir. */
    const val CHANNEL_ALERTS = "colombes_alerts"

    /** Notifications d'événements captés sur la WebView. */
    const val CHANNEL_EVENTS = "colombes_events"

    const val NOTIF_ID_MORNING = 1
    const val NOTIF_ID_EVENING = 2
    const val NOTIF_ID_EVENT = 3
    const val NOTIF_ID_TICKET = 4

    /** Crée les canaux de notification (Android 8+). À appeler au lancement. */
    fun ensureChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = context.getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_ALERTS, "Actualités Colombes", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "Messages programmés matin et soir"
                }
            )
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_EVENTS, "Actions & événements", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "Événements importants détectés sur le site"
                }
            )
        }
    }

    /** Affiche une notification. Renvoie silencieusement si la permission manque. */
    fun show(context: Context, channelId: String, id: Int, title: String, body: String) {
        if (Build.VERSION.SDK_INT >= 33 && !NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            return
        }
        val contentIntent = PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_stat_colombes)
            .setColor(androidx.core.content.ContextCompat.getColor(context, R.color.rouge_colombe))
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(contentIntent)

        try {
            NotificationManagerCompat.from(context).notify(id, builder.build())
        } catch (_: SecurityException) {
            // permission non accordée : on ignore
        }
    }
}
