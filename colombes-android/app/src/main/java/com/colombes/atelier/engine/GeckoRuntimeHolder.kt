package com.colombes.atelier.engine

import android.content.Context
import org.mozilla.geckoview.GeckoRuntime
import org.mozilla.geckoview.GeckoRuntimeSettings

/**
 * Runtime GeckoView global (une seule instance par application).
 * Créé paresseusement, configuré pour un rendu premium et sécurisé.
 */
object GeckoRuntimeHolder {

    private var _runtime: GeckoRuntime? = null

    val runtime: GeckoRuntime
        get() = requireNotNull(_runtime) { "GeckoRuntime non initialisé" }

    fun ensure(context: Context) {
        if (_runtime != null) return
        val settings = GeckoRuntimeSettings.Builder()
            .remoteDebuggingEnabled(false)
            .allowInsecureConnections(GeckoRuntimeSettings.ALLOW_INSECURE_NONE)
            .aboutConfigEnabled(false)
            .build()
        _runtime = GeckoRuntime.create(context.applicationContext, settings)
    }
}
