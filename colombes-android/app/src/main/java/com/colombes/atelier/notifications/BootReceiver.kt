package com.colombes.atelier.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Reprogramme les notifications quotidiennes après un redémarrage du téléphone.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            NotificationScheduler.schedule(context)
        }
    }
}
