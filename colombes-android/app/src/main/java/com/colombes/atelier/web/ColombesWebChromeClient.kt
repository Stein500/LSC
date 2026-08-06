package com.colombes.atelier.web

import android.net.Uri
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView

/**
 * ChromeClient : progression + sélecteur de fichiers pour les formulaires.
 */
class ColombesWebChromeClient(
    private val onProgressChanged: (Int) -> Unit,
    private val onFileChooser: (String) -> Unit
) : WebChromeClient() {

    /** Callback à remplir avec le résultat du sélecteur de fichiers. */
    var filePathCallback: ValueCallback<Array<Uri>>? = null

    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        onProgressChanged(newProgress)
    }

    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        this.filePathCallback = filePathCallback
        val acceptType = fileChooserParams?.acceptTypes
            ?.firstOrNull { it.isNotBlank() }
            ?: "*/*"
        onFileChooser(acceptType)
        return true
    }
}
