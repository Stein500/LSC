package com.colombes.atelier.offline

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import com.colombes.atelier.AppConfig
import com.colombes.atelier.R
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
            openTel()
        }
        binding.btnWhatsapp.setOnClickListener {
            openWhatsApp()
        }
    }

    /** Propose de choisir le numéro puis lance l'action correspondante. */
    private fun showNumberChooser(action: (String) -> Unit) {
        val numbers = AppConfig.CONTACT_PHONES.toTypedArray()
        AlertDialog.Builder(requireContext())
            .setTitle(R.string.choose_number)
            .setItems(numbers) { _, which -> action(numbers[which]) }
            .show()
    }

    /** Ouvre le téléphone (choix du numéro). */
    private fun openTel() {
        showNumberChooser { num ->
            runCatching { startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$num"))) }
        }
    }

    /** Ouvre WhatsApp (choix du numéro). */
    private fun openWhatsApp() {
        showNumberChooser { num ->
            val wa = "https://wa.me/${num.removePrefix("+")}"
            runCatching { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(wa))) }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
