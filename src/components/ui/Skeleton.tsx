/**
 * Skeleton — voile de chargement de l'atelier.
 * La soie glisse (lsc-shimmer) sur des aplats rose poudré ;
 * le pulse brut est remplacé par un balayage lumineux, plus couture.
 */
export function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-8">
      <div className="lsc-skeleton h-12 rounded-2xl w-2/3 mx-auto" />
      <div className="lsc-skeleton h-4 rounded-full w-1/2 mx-auto" />
      <div className="grid md:grid-cols-3 gap-4 mt-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="lsc-skeleton h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
