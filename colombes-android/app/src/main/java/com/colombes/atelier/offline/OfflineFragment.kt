package com.colombes.atelier.offline

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.colombes.atelier.AppConfig
import com.colombes.atelier.databinding.FragmentOfflineBinding

/**
 * Écran « hors connexion » brandé — aucune URL n'est affichée.
 */
class OfflineFragment : Fragment() {

    /** Callback du bouton « Réessayer ». */
    var onRetry: (() -> Unit)? = null

    private var _binding: FragmentOfflineBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOfflineBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.btnRetry.setOnClickListener { onRetry?.invoke() }
        binding.btnCall.setOnClickListener {
            runCatching {
                startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${AppConfig.CONTACT_PHONE}")))
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
