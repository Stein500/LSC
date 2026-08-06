package com.colombes.atelier.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

/**
 * Programme les notifications quotidiennes matin (08h00) et soir (19h00).
 *
 * - Alarme exacte si l'autorisation est accordée, sinon repli en alarme
 *   approximative (quelques minutes de marge) — « les deux au cas où ».
 * - L'alarme est reprogrammée automatiquement après chaque déclenchement
 *   et après un redémarrage du téléphone (BootReceiver).
 */
object NotificationScheduler {

    const val ACTION_MORNING = "com.colombes.atelier.action.MORNING"
    const val ACTION_EVENING = "com.colombes.atelier.action.EVENING"

    private const val REQ_MORNING = 1001
    private const val REQ_EVENING = 1002

    private const val HOUR_MORNING = 8
    private const val MIN_MORNING = 0
    private const val HOUR_EVENING = 19
    private const val MIN_EVENING = 0

    /** Programme (ou reprogramme) les deux notifications quotidiennes. */
    fun schedule(context: Context) {
        val am = context.getSystemService(AlarmManager::class.java) ?: return
        scheduleOne(context, am, HOUR_MORNING, MIN_MORNING, ACTION_MORNING, REQ_MORNING)
        scheduleOne(context, am, HOUR_EVENING, MIN_EVENING, ACTION_EVENING, REQ_EVENING)
    }

    private fun scheduleOne(
        context: Context,
        am: AlarmManager,
        hour: Int,
        minute: Int,
        action: String,
        requestCode: Int
    ) {
        val pi = pending(context, action, requestCode)
        val now = System.currentTimeMillis()
        val cal = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        if (cal.timeInMillis <= now) {
            cal.add(Calendar.DAY_OF_MONTH, 1)
        }
        val trigger = cal.timeInMillis
        val exact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
        try {
            if (exact) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pi)
            } else {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pi)
            }
        } catch (_: SecurityException) {
            runCatching { am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pi) }
        }
    }

    private fun pending(context: Context, action: String, requestCode: Int): PendingIntent {
        val intent = Intent(context, NotificationReceiver::class.java).setAction(action)
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
