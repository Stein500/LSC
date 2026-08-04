
import { useWorldClock } from '@/hooks/useWorldClock';
import { cn } from '@/utils/cn';

const labels: Record<string, string> = {
  'porto-novo': 'Porto-Novo',
  benin: 'Bénin',
  afrique: 'Afrique',
};

export function WorldClock({ cities, compact = false }: { cities: string[]; compact?: boolean }) {
  const items = useWorldClock(cities);

  return (
    <div className={cn('flex flex-wrap gap-2', compact && 'text-xs')}>
      {items.map((item) => (
        <span
          key={item.city}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white/80 px-3 py-1.5 text-[var(--color-ink)]"
        >
          <strong>{labels[item.city] ?? item.city}</strong>
          <span className="text-[var(--color-muted)]">{item.time}</span>
        </span>
      ))}
    </div>
  );
}
