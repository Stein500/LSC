import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, Scissors } from "lucide-react";
import { SmartImage } from "./SmartImage";
import { cn } from "@/utils/cn";

/**
 * Une photo dans la galerie.
 * - `src` est le chemin WebP de l'image (toutes les images du site sont en WebP)
 * - `caption` est une légende optionnelle affichée en bas
 */
export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

type ScissorGalleryProps = {
  images: GalleryImage[];
  /** Intervalle d'auto-défilement en ms (défaut : 5000) */
  autoPlayInterval?: number;
  /** Classes CSS additionnelles pour le conteneur racine */
  className?: string;
  /** Affiche les flèches gauche/droite au survol */
  showArrows?: boolean;
  /** Affiche les points de navigation */
  showDots?: boolean;
  /** Affiche la légende sous l'image */
  showCaptions?: boolean;
  /** Hauteur max en CSS (ex. "70vh", "600px") */
  maxHeight?: string;
};

/**
 * ScissorGallery — Galerie plein écran avec effet "ciseaux qui découpent".
 *
 * Animation :
 *   - Une lame diagonale (TL → BR) balaye l'image pour révéler la suivante.
 *   - Clip-path à 3 keyframes pour une vraie coupe à 45°.
 *   - Auto-rotation + pause au survol + swipe tactile + flèches + dots.
 *   - Le conteneur s'adapte automatiquement au ratio de l'image courante
 *     (portrait, paysage, carré — sans crop).
 */
export function ScissorGallery({
  images,
  autoPlayInterval = 5000,
  className,
  showArrows = true,
  showDots = true,
  showCaptions = true,
  maxHeight = "min(80vh, 720px)",
}: ScissorGalleryProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAspect, setCurrentAspect] = useState<number>(4 / 3);
  const [loaded, setLoaded] = useState<Set<number>>(new Set([0]));
  const timerRef = useRef<number | null>(null);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goTo = useCallback((newIndex: number) => {
    setDirection(newIndex > index ? 1 : -1);
    setIndex(newIndex);
  }, [index]);

  // Auto-rotation
  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    timerRef.current = window.setTimeout(next, autoPlayInterval);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, isPaused, next, autoPlayInterval, images.length]);

  // Précharge toutes les images + récupère le ratio de la courante
  useEffect(() => {
    images.forEach((img, i) => {
      const preload = new Image();
      preload.onload = () => {
        setLoaded((prev) => {
          if (prev.has(i)) return prev;
          return new Set([...prev, i]);
        });
        if (i === index) {
          const ratio = preload.width / preload.height;
          if (Number.isFinite(ratio) && ratio > 0) setCurrentAspect(ratio);
        }
      };
      preload.src = img.src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, index]);

  // Drag/swipe
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 60;
    const velocity = 500;
    if (info.offset.x < -threshold || info.velocity.x < -velocity) next();
    else if (info.offset.x > threshold || info.velocity.x > velocity) prev();
  };

  if (images.length === 0) return null;

  // Conteneur adaptatif : s'ajuste au ratio de l'image, borné par maxHeight
  const containerStyle: React.CSSProperties = {
    aspectRatio: currentAspect.toString(),
    maxHeight,
  };

  // Easing "cisaille" : démarrage franc, fin nette — pour donner le tranchant du geste
  const scissorEase = [0.77, 0, 0.175, 1] as const;

  return (
    <div
      className={cn("relative w-full group/gal", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Conteneur image — ratio adaptatif */}
      <div
        className="relative w-full overflow-hidden rounded-3xl bg-[var(--color-cream)] shadow-2xl border-4 border-white mx-auto"
        style={containerStyle}
      >
        {/* Empilement : chaque image garde son ratio via object-contain */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            initial={{ clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)" }}
            animate={{
              clipPath: [
                "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)", // départ : point au coin TL
                "polygon(0% 0%, 100% 0%, 0% 100%, 0% 0%)", // mi-course : triangle demi-carré
                "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // fin : carré plein
              ],
            }}
            exit={{
              clipPath:
                direction === 1
                  ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
                  : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
              opacity: 0,
            }}
            transition={{
              duration: 0.95,
              ease: scissorEase,
              times: [0, 0.55, 1],
              opacity: { duration: 0.3 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ willChange: "clip-path" }}
          >
            <SmartImage
              src={images[index].src}
              alt={images[index].alt}
              className="w-full h-full object-contain bg-[var(--color-cream)]"
              loading={index === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Lame de ciseaux — trait diagonal qui balaie en synchro avec le clip */}
        <ScissorBlade
          trigger={index}
          direction={direction}
          isLoaded={loaded.has(index)}
        />

        {/* Légende en bas */}
        {showCaptions && images[index].caption && (
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none">
            <motion.p
              key={`caption-${index}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
              className="text-white text-base md:text-xl font-medium italic max-w-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {images[index].caption}
            </motion.p>
          </div>
        )}

        {/* Compteur + bouton play/pause en haut à droite */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {images.length > 1 && (
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-colors"
              aria-label={isPaused ? "Reprendre le défilement" : "Mettre en pause"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          )}
          <div className="px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
            {index + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Flèches gauche/droite (apparaissent au survol) */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-xl flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-orange)] hover:text-white transition-all z-10 opacity-0 group-hover/gal:opacity-100 -translate-x-2 group-hover/gal:translate-x-0"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-xl flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-orange)] hover:text-white transition-all z-10 opacity-0 group-hover/gal:opacity-100 translate-x-2 group-hover/gal:translate-x-0"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Points de navigation */}
      {showDots && images.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === index
                  ? "w-8 bg-[var(--color-orange)]"
                  : "w-2 bg-[var(--color-line)] hover:bg-[var(--color-ink-soft)]",
              )}
              aria-label={`Aller à l'image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Lame de ciseaux décorative.
 * Un fin trait orange glisse en diagonale pendant la transition,
 * avec un petit pictogramme ciseaux qui chevauche la lame.
 * La lame disparaît une fois la coupe terminée.
 */
function ScissorBlade({
  trigger,
  direction,
  isLoaded,
}: {
  trigger: number;
  direction: 1 | -1;
  isLoaded: boolean;
}) {
  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.div
          key={trigger}
          className="absolute inset-0 pointer-events-none overflow-hidden z-[5]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, delay: 0.75, ease: "easeOut" }}
        >
          {/* Trait diagonal qui balaie — la "lame" */}
          <motion.div
            className="absolute"
            style={{
              top: "-30%",
              left: "-30%",
              width: "160%",
              height: "160%",
              transformOrigin: "center",
            }}
            initial={{
              x: direction === 1 ? "-30%" : "30%",
              y: direction === 1 ? "-30%" : "30%",
              rotate: 45,
            }}
            animate={{
              x: direction === 1 ? "30%" : "-30%",
              y: direction === 1 ? "30%" : "-30%",
              rotate: 45,
            }}
            transition={{ duration: 0.95, ease: [0.77, 0, 0.175, 1] }}
          >
            {/* Le trait — ligne fine orange avec glow subtil */}
            <div
              className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,140,80,0.3) 20%, rgba(255,140,80,0.95) 50%, rgba(255,140,80,0.3) 80%, transparent 100%)",
                boxShadow: "0 0 18px rgba(255,140,80,0.55)",
              }}
            />
            {/* Petit pictogramme ciseaux au centre de la lame */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center"
              style={{ transform: "translate(-50%, -50%) rotate(-45deg)" }}
            >
              <Scissors className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
