package com.colombes.atelier.engine

import android.content.Context
import org.mozilla.geckoview.WebExtension

/**
 * Installe la WebExtension « colombes-bridge » dans le runtime GeckoView
 * et connecte son MessageDelegate au pont natif.
 */
object BridgeInstaller {

    private const val EXTENSION_LOCATION = "resource://android/assets/extensions/colombes-bridge/"
    private const val EXTENSION_ID = "colombes-bridge@colombes.atelier"
    private const val NATIVE_APP = "colombesApp"

    /** Installe l'extension et le pont. Appelé une fois au démarrage. */
    fun install(context: Context, bridge: GeckoJsBridge, onReady: () -> Unit = {}) {
        val runtime = GeckoRuntimeHolder.runtime
        runtime.webExtensionController.ensureBuiltIn(EXTENSION_LOCATION, EXTENSION_ID)
            .accept({ ext ->
                ext?.setMessageDelegate(bridge.messageDelegate, NATIVE_APP)
                onReady()
            }, { onReady() })
    }
}
