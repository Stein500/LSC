import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type Props = {
  end: number;
  suffix?: string;
  label: string;
  icon?: string;
  className?: string;
};

export function Counter({ end, suffix = "", label, icon, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(end * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setCount(end);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end]);

  return (
    <div ref={ref} className={cn("text-center p-5 rounded-2xl bg-white border border-[var(--color-line)]", className)}>
      {icon && <span className="text-3xl block mb-2">{icon}</span>}
      <p className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-orange)" }}>
        {count}
        {suffix}
      </p>
      <p className="text-xs mt-1 text-[var(--color-muted)]">{label}</p>
    </div>
  );
}