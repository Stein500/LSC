plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.colombes.atelier"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.colombes.atelier"
        minSdk = 24
        targetSdk = 35
        versionCode = 4
        versionName = "2.1.0"

        // APK name: colombes-atelier-2.1.0-debug.apk / -release.apk
        setProperty("archivesBaseName", "colombes-atelier-${versionName}")

        // Restreindre à l'architecture réelle du téléphone (arm64-v8a) →
        // GeckoView n'inclut que le moteur arm64, APK nettement plus léger.
        ndk {
            abiFilters += listOf("arm64-v8a")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.work:work-runtime-ktx:2.10.0")

    // GeckoView — moteur embarqué, autonome (indépendant du WebView/Chrome système).
    // 115 ESR = version stable Long-Term-Support, adaptée à l'embarquement.
    implementation("org.mozilla.geckoview:geckoview:115.0.20230726201356")
}
