# Keep the JS bridge methods (called from JavaScript via addJavascriptInterface)
-keepclassmembers class com.colombes.atelier.web.ColombesJsBridge {
    public *;
}

# WebView keeps
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
