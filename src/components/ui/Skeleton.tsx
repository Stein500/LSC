export function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-8 animate-pulse">
      <div className="h-12 bg-[var(--color-line)] rounded-2xl w-2/3 mx-auto" />
      <div className="h-4 bg-[var(--color-line)] rounded-full w-1/2 mx-auto" />
      <div className="grid md:grid-cols-3 gap-4 mt-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-[var(--color-line)] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}