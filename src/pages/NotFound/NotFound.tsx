import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <SEO title="Page introuvable" noindex />
      <section className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
            className="text-7xl mb-6 inline-block"
          >
            🧵
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            <span style={{ color: "var(--color-orange)" }}>Oups,</span><br />ce fil s'est emmêlé...
          </h1>
          <p className="text-[var(--color-ink-soft)] mb-8">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
          <Link to="/">
            <Button size="lg" icon={<Home className="w-4 h-4" />}>
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}