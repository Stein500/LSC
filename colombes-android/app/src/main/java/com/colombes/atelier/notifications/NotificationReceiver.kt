package com.colombes.atelier.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import kotlin.random.Random

/**
 * Reçoit les alarmes matin/soir, affiche une notification bienveillante
 * et variée, puis reprogramme le jour suivant.
 */
class NotificationReceiver : BroadcastReceiver() {

    private val morningMessages = listOf(
        Triple("Bonjour ☀️", "Rappelle-toi : tu es belle, élégante et pleine de talents. L'Atelier Colombes est là pour sublimer ta beauté.", "Atelier Colombes"),
        Triple("Bonjour ✨", "Une nouvelle journée commence. Prends soin de toi et pense à ton prochain look sur-mesure.", "Colombes"),
        Triple("Bonjour 🌸", "Ta beauté mérite un écrin. L'Atelier Colombes te prépare des créations qui te ressemblent.", "Atelier Colombes"),
        Triple("Bonjour 💛", "N'oublie pas : tu es unique. Viens découvrir nos nouveautés et réserver ta pièce.", "Colombes")
    )

    private val eveningMessages = listOf(
        Triple("Bonsoir 🌙", "Tu as été magnifique aujourd'hui. Pour tes prochaines occasions, l'Atelier Colombes pense à toi.", "Atelier Colombes"),
        Triple("Bonsoir ✨", "Une petite pensée pour toi : tu mérites de te sentir belle à chaque instant. Contacte-nous pour ton prochain projet couture.", "Colombes"),
        Triple("Bonsoir 💖", "Envie d'une nouvelle pièce élégante ? L'Atelier Colombes est à ton écoute pour du sur-mesure.", "Atelier Colombes"),
        Triple("Bonsoir 🌷", "Prends soin de toi ce soir. Et si tu rêves d'une tenue d'exception, pense à nous.", "Colombes")
    )

    override fun onReceive(context: Context, intent: Intent) {
        NotificationHelper.ensureChannels(context)
        val daySeed = (System.currentTimeMillis() / 86400000L).toInt()
        when (intent.action) {
            NotificationScheduler.ACTION_MORNING -> {
                val m = morningMessages[Random(daySeed).nextInt(morningMessages.size)]
                NotificationHelper.show(
                    context,
                    NotificationHelper.CHANNEL_ALERTS,
                    NotificationHelper.NOTIF_ID_MORNING,
                    m.first,
                    m.second
                )
            }
            NotificationScheduler.ACTION_EVENING -> {
                val m = eveningMessages[Random(daySeed).nextInt(eveningMessages.size)]
                NotificationHelper.show(
                    context,
                    NotificationHelper.CHANNEL_ALERTS,
                    NotificationHelper.NOTIF_ID_EVENING,
                    m.first,
                    m.second
                )
            }
        }
        // Reprogramme le lendemain
        NotificationScheduler.schedule(context)
    }
}
