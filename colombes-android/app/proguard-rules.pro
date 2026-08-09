# Keep the JS bridge methods (called from JavaScript via addJavascriptInterface)
-keepclassmembers class com.colombes.atelier.web.ColombesJsBridge {
    public *;
}

# WebView keeps
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# WorkManager instancie le Worker par réflexion
-keep class com.colombes.atelier.sync.** { *; }
-keep class com.colombes.atelier.notifications.** { *; }

# GeckoView / pont
-keep class com.colombes.atelier.engine.** { *; }
-keep class org.mozilla.geckoview.** { *; }

# SnakeYAML (dépendance) référence java.beans.* qui n'existe pas sur Android →
# on dit à R8 de ne pas en tenir compte (classes manquantes ignorées).
-dontwarn org.yaml.snakeyaml.**
-dontwarn java.beans.**
