package com.colombes.atelier

import com.colombes.atelier.BuildConfig

/**
 * Configuration centrale de l'application.
 *
 * ⚠️ L'URL est définie UNE SEULE FOIS ici. Nulle part ailleurs dans le code
 * elle ne doit être affichée à l'utilisateur.
 */
object AppConfig {

    /** URL d'accueil (jamais affichée dans l'UI). */
    const val HOME_URL = "https://couturecolombe.vercel.app/"

    /** Version de l'application (source unique : le Gradle `versionName`). */
    val APP_VERSION: String = BuildConfig.VERSION_NAME

    /** Nom affiché. */
    const val BRAND = "Colombes"

    /** Slogan. */
    const val SLOGAN = "Atelier de Couture d'Exception — Porto-Novo"

    /** Numéros de l'atelier (appels ET WhatsApp). */
    const val CONTACT_PHONE_1 = "+2290167409408"
    const val CONTACT_PHONE_2 = "+2290195763601"

    /** Numéro principal (utilisé par défaut pour les appels). */
    const val CONTACT_PHONE = CONTACT_PHONE_1

    /** Liens WhatsApp directs (dérivés des numéros, sans le "+"). */
    val WHATSAPP_1: String by lazy { "https://wa.me/" + CONTACT_PHONE_1.removePrefix("+") }
    val WHATSAPP_2: String by lazy { "https://wa.me/" + CONTACT_PHONE_2.removePrefix("+") }

    /** Tous les numéros (utile pour un sélecteur de contact). */
    val CONTACT_PHONES: List<String> by lazy { listOf(CONTACT_PHONE_1, CONTACT_PHONE_2) }

    /** Host autorisé pour la navigation interne (dérivé de HOME_URL). */
    val HOME_HOST: String by lazy {
        val host = HOME_URL.substringAfter("://").substringBefore("/")
        host.ifBlank { HOME_URL }
    }
}
