package com.colombes.atelier

/**
 * Configuration centrale de l'application.
 *
 * ⚠️ L'URL est définie UNE SEULE FOIS ici. Nulle part ailleurs dans le code
 * elle ne doit être affichée à l'utilisateur.
 */
object AppConfig {

    /** URL d'accueil (jamais affichée dans l'UI). */
    const val HOME_URL = "https://couturecolombe.vercel.app/"

    /** Version de l'application (exposée via le pont JS). */
    const val APP_VERSION = "1.0.0"

    /** Nom affiché. */
    const val BRAND = "Colombes"

    /** Slogan. */
    const val SLOGAN = "Atelier de Couture d'Exception — Porto-Novo"

    /** Téléphone de l'atelier (remplace avec le vrai numéro). */
    const val CONTACT_PHONE = "+22900000000"

    /** Host autorisé pour la navigation interne (dérivé de HOME_URL). */
    val HOME_HOST: String by lazy {
        val host = HOME_URL.substringAfter("://").substringBefore("/")
        host.ifBlank { HOME_URL }
    }
}
