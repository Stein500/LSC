package com.colombes.atelier.engine

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.View
import com.colombes.atelier.AppConfig
import com.colombes.atelier.web.DownloadHelper
import org.mozilla.geckoview.AllowOrDeny
import org.mozilla.geckoview.GeckoResult
import org.mozilla.geckoview.GeckoSession
import org.mozilla.geckoview.GeckoView

/**
 * GeckoView « Colombes » : moteur embarqué autonome (indépendant du WebView
 * et de Chrome système). Rendu identique sur tous les téléphones.
 */
class ColombesGeckoView @JvmOverloads constructor(
    context: Context,
    attrs: android.util.AttributeSet? = null
) : GeckoView(context, attrs) {

    lateinit var session: GeckoSession

    private var canGoBackFlag = false

    /** Progression 0..100. */
    var onProgress: ((Int) -> Unit)? = null

    /** Appelé quand la page d'accueil est prête. */
    var onHomeLoaded: (() -> Unit)? = null

    /** Appelé sur erreur de chargement de la page principale. */
    var onMainError: (() -> Unit)? = null

    /** Position verticale de scroll. */
    var onScrollYChanged: ((Int) -> Unit)? = null

    /** Pont pour le sélecteur de fichier (input[type=file]). */
    var onFileChooser: ((accept: String) -> Unit)? = null

    /** Pont pour demander une permission runtime Android (caméra/micro). */
    var onAndroidPermissionsRequest: ((permissions: Array<String>, grant: () -> Unit, reject: () -> Unit) -> Unit)? = null

    fun setup(runtime: org.mozilla.geckoview.GeckoRuntime) {
        session = GeckoSession()

        val settings = session.settings
        settings.allowJavascript = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        session.open(runtime)
        setSession(session)

        attachDelegates()
        setLayerType(View.LAYER_TYPE_HARDWARE, null)
    }

    private fun attachDelegates() {
        session.progressDelegate = object : GeckoSession.ProgressDelegate {
            override fun onProgressChange(session: GeckoSession, progress: Int) {
                onProgress?.invoke(progress)
            }

            override fun onPageStop(session: GeckoSession, success: Boolean) {
                if (success) {
                    val uri = session.currentUri
                    if (uri?.startsWith(AppConfig.HOME_URL) == true) {
                        onHomeLoaded?.invoke()
                    }
                } else {
                    onMainError?.invoke()
                }
            }
        }

        session.navigationDelegate = object : GeckoSession.NavigationDelegate {
            override fun onLoadRequest(
                session: GeckoSession,
                request: GeckoSession.NavigationDelegate.LoadRequest
            ): GeckoResult<AllowOrDeny> {
                return GeckoResult.fromValue(handleLink(request.uri, request.isDirectNavigation))
            }

            override fun onLocationChange(
                session: GeckoSession,
                uri: String?,
                permissions: MutableList<GeckoSession.PermissionDelegate.ContentPermission>,
                navigationType: Int
            ) {
                // navigation interne acceptée
            }

            override fun onCanGoBack(session: GeckoSession, canGoBack: Boolean) {
                this@ColombesGeckoView.canGoBackFlag = canGoBack
            }
        }

        session.downloadDelegate = object : GeckoSession.DownloadDelegate {
            override fun onDownload(session: GeckoSession, download: GeckoSession.DownloadDelegate.Download) {
                val url = download.uri
                val filename = download.filename
                val mime = download.contentType
                if (url.startsWith("data:application/pdf;base64,")) {
                    val b64 = url.removePrefix("data:application/pdf;base64,")
                    DownloadHelper.saveBase64Pdf(context, b64, filename ?: "ticket.pdf")
                } else {
                    DownloadHelper.enqueueDownload(context, url, "GeckoView", null, mime)
                }
            }
        }

        session.permissionDelegate = object : GeckoSession.PermissionDelegate {
            override fun onContentPermissionRequest(
                session: GeckoSession,
                uri: String?,
                type: Int,
                callback: GeckoSession.PermissionDelegate.Callback
            ) {
                // Caméra/micro : on demande la permission Android correspondante
                when (type) {
                    GeckoSession.PermissionDelegate.PERMISSION_CAMERA -> {
                        onAndroidPermissionsRequest?.invoke(
                            arrayOf(android.Manifest.permission.CAMERA),
                            { callback.grant() }, { callback.reject() }
                        ) ?: callback.reject()
                    }
                    GeckoSession.PermissionDelegate.PERMISSION_AUDIO_CAPTURE -> {
                        onAndroidPermissionsRequest?.invoke(
                            arrayOf(android.Manifest.permission.RECORD_AUDIO),
                            { callback.grant() }, { callback.reject() }
                        ) ?: callback.reject()
                    }
                    else -> callback.reject()
                }
            }

            override fun onAndroidPermissionsRequest(
                session: GeckoSession,
                permissions: Array<out String>?,
                callback: GeckoSession.PermissionDelegate.Callback
            ) {
                onAndroidPermissionsRequest?.invoke(
                    permissions?.toTypedArray() ?: emptyArray(),
                    { callback.grant() }, { callback.reject() }
                ) ?: callback.reject()
            }
        }

        session.promptDelegate = object : GeckoSession.PromptDelegate {
            override fun onFilePrompt(
                session: GeckoSession,
                prompt: GeckoSession.PromptDelegate.FilePrompt
            ): GeckoResult<GeckoSession.PromptDelegate.PromptResponse> {
                val result = GeckoResult<Uri?>()
                filePromptResult = result
                val accept = prompt.mimeTypes.firstOrNull { it.isNotBlank() } ?: "*/*"
                if (onFileChooser != null) {
                    onFileChooser!!(accept)
                } else {
                    result.complete(null)
                }
                return result.map { uri ->
                    if (uri != null) prompt.confirm(context, uri)
                    else prompt.dismiss()
                }
            }
        }
    }

    /** Résultat du sélecteur de fichier en attente. */
    internal var filePromptResult: GeckoResult<Uri?>? = null

    private fun handleLink(url: String, isDirect: Boolean): AllowOrDeny {
        val uri = Uri.parse(url)
        val scheme = uri.scheme?.lowercase() ?: ""

        if (scheme == "https" || scheme == "http") {
            if (uri.host == AppConfig.HOME_HOST) return AllowOrDeny.ALLOW
            // WhatsApp
            if (url.contains("wa.me") || url.contains("whatsapp.com")) {
                openExternal(url); return AllowOrDeny.DENY
            }
            // Google Maps
            if (uri.host?.contains("maps.google") == true || url.contains("maps.app.goo.gl")) {
                openExternal(url); return AllowOrDeny.DENY
            }
            // Lien https externe -> navigateur/app native
            openExternal(url); return AllowOrDeny.DENY
        }

        return when (scheme) {
            "tel", "mailto", "sms", "geo", "whatsapp", "intent" -> {
                openExternal(url); AllowOrDeny.DENY
            }
            else -> AllowOrDeny.DENY
        }
    }

    private fun openExternal(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            context.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
        }
    }

    /** Charge la page d'accueil. */
    fun loadHome() {
        session.load(AppConfig.HOME_URL)
    }

    /** Navigue en arrière si possible. */
    fun goBack() {
        session.goBack()
    }

    fun canGoBack(): Boolean = canGoBackFlag

    override fun onScrollChanged(l: Int, t: Int, oldl: Int, oldt: Int) {
        super.onScrollChanged(l, t, oldl, oldt)
        onScrollYChanged?.invoke(t)
    }
}
