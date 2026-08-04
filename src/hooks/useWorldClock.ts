
import { useEffect, useMemo, useState } from 'react';

const TIMEZONES: Record<string, string> = {
  'porto-novo': 'Africa/Porto-Novo',
  benin: 'Africa/Porto-Novo',
  afrique: 'Africa/Porto-Novo',
};

function formatCityTime(city: string) {
  const tz = TIMEZONES[city] ?? 'UTC';
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(new Date());
}

export function useWorldClock(cities: string[], refreshMs = 60000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), refreshMs);
    return () => window.clearInterval(id);
  }, [refreshMs]);

  return useMemo(
    () => cities.map((city) => ({ city, time: formatCityTime(city), open: now })),
    [cities, now],
  );
}
