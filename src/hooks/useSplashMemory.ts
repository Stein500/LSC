import { useCallback, useEffect, useState } from "react";

type MemoryPayload = {
  ts: number;
};

function readTimestamp(raw: string | null): number | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === "number") return parsed;
    if (parsed && typeof parsed === "object" && "ts" in parsed) {
      const ts = Number((parsed as MemoryPayload).ts);
      return Number.isFinite(ts) ? ts : null;
    }
    return null;
  } catch {
    const ts = Number(raw);
    return Number.isFinite(ts) ? ts : null;
  }
}

export function useSplashMemory(key: string, ttlMs: number) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let show = true;
    try {
      const ts = readTimestamp(localStorage.getItem(key));
      if (ts != null && Date.now() - ts < ttlMs) show = false;
    } catch {
      show = true;
    }

    setShouldShow(show);
  }, [key, ttlMs]);

  const markSeen = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now() }));
    } catch {
      // ignore storage failures
    }
  }, [key]);

  return { shouldShow, markSeen };
}
