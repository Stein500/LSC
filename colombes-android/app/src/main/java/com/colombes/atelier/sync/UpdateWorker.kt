package com.colombes.atelier.sync

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters

/**
 * Vérifie périodiquement les mises à jour du site (planifié toutes les 6 h
 * par WorkManager, et au lancement).
 */
class UpdateWorker(context: Context, params: WorkerParameters) : Worker(context, params) {

    override fun doWork(): Result {
        return try {
            UpdateChecker.checkForUpdates(applicationContext)
            Result.success()
        } catch (_: Exception) {
            Result.retry()
        }
    }
}
