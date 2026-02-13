import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("rust")
}

val tauriProperties = Properties().apply {
    val propFile = file("tauri.properties")
    if (propFile.exists()) {
        propFile.inputStream().use { load(it) }
    }
}

android {
    compileSdk = 36
    namespace = "com.gusto.desktop"
    defaultConfig {
        manifestPlaceholders["usesCleartextTraffic"] = "false"
        applicationId = "com.gusto.desktop"
        minSdk = 24
        targetSdk = 36
        versionCode = tauriProperties.getProperty("tauri.android.versionCode", "1").toInt()
        versionName = tauriProperties.getProperty("tauri.android.versionName", "1.0")

        // Dynamic App Name Resources
        val mode = System.getenv("VITE_APP_MODE") ?: "core"
        val appNameRes = if (mode.contains("pro")) "Gusto Pro" else "Gusto"
        resValue("string", "app_name", appNameRes)
        resValue("string", "main_activity_title", appNameRes)
    }

    signingConfigs {
        create("release") {
            keyAlias = "gusto"
            keyPassword = "android"
            storeFile = file("release.jks")
            storePassword = "android"
        }
    }
    buildTypes {
        getByName("debug") {
            manifestPlaceholders["usesCleartextTraffic"] = "true"
            isDebuggable = true
            isJniDebuggable = true
            isMinifyEnabled = false
            packaging {                jniLibs.keepDebugSymbols.add("*/arm64-v8a/*.so")
                jniLibs.keepDebugSymbols.add("*/armeabi-v7a/*.so")
                jniLibs.keepDebugSymbols.add("*/x86/*.so")
                jniLibs.keepDebugSymbols.add("*/x86_64/*.so")
            }
        }
        getByName("release") {
            isMinifyEnabled = true
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(
                *fileTree(".") { include("**/*.pro") }
                    .plus(getDefaultProguardFile("proguard-android-optimize.txt"))
                    .toList().toTypedArray()
            )
        }
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        buildConfig = true
    }
}

android.applicationVariants.all {
    outputs.all {
        val output = this as com.android.build.gradle.internal.api.ApkVariantOutputImpl
        val variantName = name // e.g., "universal-debug" or "universal-release-unsigned"
        
        // Dynamic App Name based on VITE_APP_MODE
        val mode = System.getenv("VITE_APP_MODE") ?: "core"
        val appName = if (mode.contains("pro")) "Gusto-Pro" else "Gusto"
        
        val version = tauriProperties.getProperty("tauri.android.versionName", "1.0.6")
        output.outputFileName = "${appName}-${variantName}-${version}.apk"
    }
}

rust {
    rootDirRel = "../../../"
}

dependencies {
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("com.google.android.material:material:1.12.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.4")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.0")
}

apply(from = "tauri.build.gradle.kts")