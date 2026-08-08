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
    private var currentUrl: String? = null

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

        session.settings.allowJavascript = true

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
                    val url = currentUrl
                    if (url?.startsWith(AppConfig.HOME_URL) == true) {
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
                url: String?,
                perms: List<GeckoSession.PermissionDelegate.ContentPermission>
            ) {
                this@ColombesGeckoView.currentUrl = url
            }

            override fun onCanGoBack(session: GeckoSession, canGoBack: Boolean) {
                this@ColombesGeckoView.canGoBackFlag = canGoBack
            }
        }

        session.permissionDelegate = object : GeckoSession.PermissionDelegate {
            override fun onAndroidPermissionsRequest(
                session: GeckoSession,
                permissions: Array<String>?,
                callback: GeckoSession.PermissionDelegate.Callback
            ) {
                val perms = permissions ?: emptyArray()
                if (onAndroidPermissionsRequest != null) {
                    onAndroidPermissionsRequest!!(perms, { callback.grant() }, { callback.reject() })
                } else {
                    callback.reject()
                }
            }
        }

        session.promptDelegate = object : GeckoSession.PromptDelegate {
            override fun onFilePrompt(
                session: GeckoSession,
                prompt: GeckoSession.PromptDelegate.FilePrompt
            ): GeckoResult<GeckoSession.PromptDelegate.PromptResponse> {
                val result = GeckoResult<Uri?>()
                filePromptResult = result
                val accept = prompt.mimeTypes?.firstOrNull { it.isNotBlank() } ?: "*/*"
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
        val loader = GeckoSession.Loader().uri(AppConfig.HOME_URL)
        session.load(loader)
    }

    /** Charge une URL donnée. */
    fun loadUrl(url: String) {
        session.load(GeckoSession.Loader().uri(url))
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
