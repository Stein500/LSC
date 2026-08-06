package com.colombes.atelier

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.view.animation.LinearInterpolator
import android.view.animation.OvershootInterpolator
import android.view.animation.PathInterpolator
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.colombes.atelier.databinding.ActivitySplashBinding

/**
 * Splash natif animé — signature de l'app. L'utilisateur ne voit JAMAIS l'URL.
 */
class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding
    private val handler = Handler(Looper.getMainLooper())
    private var opened = false
    private val curtainInterpolator = PathInterpolator(0.4f, 0.0f, 0.2f, 1.0f)

    // Dégradé fil d'or : #F4E3C9 -> #C9A87C -> #F4B860
    private val goldRamp = intArrayOf(
        Color.parseColor("#F4E3C9"),
        Color.parseColor("#F0D9B0"),
        Color.parseColor("#ECCF9B"),
        Color.parseColor("#E8C48C"),
        Color.parseColor("#E4BA7F"),
        Color.parseColor("#DFB072"),
        Color.parseColor("#DBA65F"),
        Color.parseColor("#F4B860")
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Pas de re-splash au retour de background / recréation
        if (savedInstanceState != null) {
            goToMain()
            return
        }

        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupCurtains()
        startSplash()
    }

    private fun setupCurtains() {
        // Deux panneaux occupant chacun la moitié de l'écran
        binding.leftCurtain.pivotX = 0f
        binding.leftCurtain.scaleX = 0.5f
        binding.rightCurtain.pivotX = 1f
        binding.rightCurtain.scaleX = 0.5f
    }

    private fun startSplash() {
        animateLogo()
        animateLetters()
        binding.stitchingLine.sew(900)
        animateProgress()

        binding.tapHint.alpha = 0f
        binding.tapHint.animate().alpha(1f).setStartDelay(700).setDuration(400).start()

        // Skippable au tap
        binding.splashRoot.setOnClickListener { openSplash() }

        // Ouverture automatique après ~1,8 s
        handler.postDelayed({ openSplash() }, 1800)
    }

    private fun animateLogo() {
        binding.splashLogo.alpha = 0f
        binding.splashLogo.scaleX = 0.8f
        binding.splashLogo.scaleY = 0.8f
        binding.splashLogo.animate()
            .scaleX(1f).scaleY(1f).alpha(1f)
            .setDuration(550)
            .setInterpolator(DecelerateInterpolator())
            .start()
    }

    private fun animateLetters() {
        val word = AppConfig.BRAND // "Colombes"
        for ((i, ch) in word.withIndex()) {
            val tv = TextView(this).apply {
                text = ch.toString()
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 34f)
                typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
                setTextColor(goldRamp[i % goldRamp.size])
                alpha = 0f
                translationY = 60f
            }
            binding.lettersContainer.addView(
                tv,
                LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            )
            // Montée lettre par lettre (~60 ms d'intervalle)
            tv.postDelayed({
                tv.animate()
                    .alpha(1f).translationY(0f)
                    .setStartDelay(i * 60L)
                    .setDuration(380)
                    .setInterpolator(OvershootInterpolator(2f))
                    .start()
            }, 180)
        }
    }

    private fun animateProgress() {
        binding.progressBar.pivotX = 0f
        binding.progressBar.scaleX = 0f
        binding.progressBar.animate()
            .scaleX(1f)
            .setDuration(1600)
            .setInterpolator(LinearInterpolator())
            .start()
    }

    private fun openSplash() {
        if (opened) return
        opened = true

        val width = binding.splashRoot.width.toFloat()
        binding.leftCurtain.animate()
            .translationX(-width)
            .setDuration(550)
            .setInterpolator(curtainInterpolator)
            .start()
        binding.rightCurtain.animate()
            .translationX(width)
            .setDuration(550)
            .setInterpolator(curtainInterpolator)
            .start()

        handler.postDelayed({ goToMain() }, 600)
    }

    private fun goToMain() {
        if (isFinishing || isDestroyed) return
        startActivity(Intent(this, MainActivity::class.java))
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        finish()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }
}
