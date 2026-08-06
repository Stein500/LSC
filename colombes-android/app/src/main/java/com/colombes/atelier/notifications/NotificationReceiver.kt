package com.colombes.atelier.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Reçoit les alarmes matin/soir, affiche la notification puis reprogramme le jour suivant.
 */
class NotificationReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        NotificationHelper.ensureChannels(context)
        when (intent.action) {
            NotificationScheduler.ACTION_MORNING -> {
                NotificationHelper.show(
                    context,
                    NotificationHelper.CHANNEL_ALERTS,
                    NotificationHelper.NOTIF_ID_MORNING,
                    "Bonjour ☀️",
                    "L'Atelier Colombes est ouvert. Découvre nos nouveautés couture et prends rendez-vous."
                )
            }
            NotificationScheduler.ACTION_EVENING -> {
                NotificationHelper.show(
                    context,
                    NotificationHelper.CHANNEL_ALERTS,
                    NotificationHelper.NOTIF_ID_EVENING,
                    "Bonsoir ✨",
                    "Une idée pour tes prochains projets couture ? Pense à commander tes pièces à l'atelier."
                )
            }
        }
        // Reprogramme le lendemain
        NotificationScheduler.schedule(context)
    }
}
