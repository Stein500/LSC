package com.colombes.atelier

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.animation.DecelerateInterpolator
import androidx.appcompat.app.AppCompatActivity
import com.colombes.atelier.databinding.ActivityHomeBinding
import com.colombes.atelier.databinding.ActivityHomeSplashBinding

/**
 * Hub natif élégant « Colombes ».
 * Splash premium → accueil avec cartes services → WebView (MainActivity).
 */
class HomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding
    private var splashBinding: ActivityHomeSplashBinding? = null
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Splash élégant d'abord, puis hub
        splashBinding = ActivityHomeSplashBinding.inflate(layoutInflater)
        setContentView(splashBinding!!.root)
        animateSplash()

        handler.postDelayed({
            binding = ActivityHomeBinding.inflate(layoutInflater)
            setContentView(binding.root)
            setupCards()
            setupBottomNav()
            splashBinding = null
        }, 2000)
    }

    private fun setupBottomNav() {
        binding.bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_accueil -> true
                R.id.nav_services -> {
                    openSection("/services")
                    true
                }
                R.id.nav_contact -> {
                    openSection("/contact")
                    true
                }
                else -> false
            }
        }
    }

    private fun animateSplash() {
        // Ken Burns : zoom lent sur l'image de fond
        splashBinding?.splashKenburnsHome?.apply {
            scaleX = 1f
            scaleY = 1f
            animate().scaleX(1.15f).scaleY(1.15f).setDuration(2000)
                .setInterpolator(DecelerateInterpolator()).start()
        }
        splashBinding?.splashLogoHome?.apply {
            alpha = 0f
            scaleX = 0.8f
            scaleY = 0.8f
            animate()
                .alpha(1f).scaleX(1f).scaleY(1f)
                .setDuration(700)
                .setInterpolator(DecelerateInterpolator())
                .start()
        }
        splashBinding?.splashBrandHome?.apply {
            alpha = 0f
            translateY = 30f
            animate().alpha(1f).translationY(0f).setStartDelay(250).setDuration(600).start()
        }
        // Barre de progression
        splashBinding?.splashProgressHome?.apply {
            alpha = 0f
            animate().alpha(1f).setStartDelay(100).setDuration(300).start()
            animateProgressBar(this)
        }
    }

    private fun animateProgressBar(pb: android.widget.ProgressBar) {
        pb.progress = 0
        object : android.os.CountDownTimer(2000, 40) {
            override fun onTick(millisUntilFinished: Long) {
                pb.progress = ((2000 - millisUntilFinished) * 100 / 2000).toInt()
            }
            override fun onFinish() { pb.progress = 100 }
        }.start()
    }

    private fun setupCards() {
        binding.cardServices.setOnClickListener { openSection("/services") }
        binding.cardFormation.setOnClickListener { openSection("/formation") }
        binding.cardInspirations.setOnClickListener { openSection("/inspirations") }
        binding.cardContact.setOnClickListener { openSection("/contact") }

        binding.btnOuvrirSite.setOnClickListener { openSection("/") }
        binding.btnWhatsapp.setOnClickListener { openWhatsApp() }
        binding.btnAppeler.setOnClickListener { openTel() }
    }

    private fun openSection(path: String) {
        val intent = Intent(this, MainActivity::class.java)
        intent.putExtra("START_PATH", path)
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }

    private fun openWhatsApp() {
        val num = AppConfig.CONTACT_PHONE_1.removePrefix("+")
        val url = "https://wa.me/$num"
        runCatching { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
    }

    private fun openTel() {
        runCatching {
            startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${AppConfig.CONTACT_PHONE_1}")))
        }
    }

    // Empêche le retour vers un écran vide
    override fun onBackPressed() {
        super.onBackPressed()
    }
}
