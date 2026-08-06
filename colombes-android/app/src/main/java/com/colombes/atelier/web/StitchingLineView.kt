package com.colombes.atelier.web

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.PathEffect
import android.util.AttributeSet
import android.view.View
import android.view.animation.DecelerateInterpolator

/**
 * Fil doré pointillé qui se « coud » de gauche à droite pendant le splash.
 */
class StitchingLineView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#F4B860")
        style = Paint.Style.STROKE
        strokeWidth = 4f
        strokeCap = Paint.Cap.ROUND
    }

    private var progress = 0f
    private var phase = 0f
    private var animator: ValueAnimator? = null

    /** Lance l'animation de couture. */
    fun sew(sewDuration: Long = 900) {
        animator?.cancel()
        val anim = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = sewDuration
            interpolator = DecelerateInterpolator()
            addUpdateListener { a ->
                progress = a.animatedValue as Float
                phase = progress * 24f
                invalidate()
            }
            start()
        }
        animator = anim
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val endX = width * progress
        if (endX <= 0f) return
        val dash = (5f.dp() to 5f.dp())
        val effect: PathEffect = DashPathEffect(floatArrayOf(dash.first, dash.second), phase)
        paint.pathEffect = effect
        canvas.drawLine(0f, height / 2f, endX, height / 2f, paint)
    }

    private fun Float.dp(): Float = this * resources.displayMetrics.density

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
    }
}
