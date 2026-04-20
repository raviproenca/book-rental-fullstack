import { useState, useEffect, useRef } from "react";

/* ─── Animated Counter (rAF-based with easeOutExpo) ─── */
export function AnimatedCounter({
  target,
  suffix = "",
  className,
}: {
  target: number;
  suffix?: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          let start: number | null = null;

          function step(timestamp: number) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          }

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      ref={ref}
      className={
        className ??
        "font-mono-stats text-3xl font-bold text-foreground sm:text-4xl"
      }
    >
      {count.toLocaleString("pt-BR")}
      {suffix}
    </div>
  );
}

/* ─── Grid Background (legacy, kept for other sections) ─── */
export function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--gold)) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gold/[0.04] blur-[120px]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 70% 50%, hsl(var(--gold) / 0.05) 0%, transparent 60%),
            radial-gradient(ellipse at 30% 30%, hsl(var(--gold) / 0.03) 0%, transparent 50%)
          `,
        }}
      />
      <div className="absolute right-0 top-1/2 hidden h-[500px] w-[500px] -translate-y-1/2 translate-x-[-20%] rounded-full bg-gold/[0.06] blur-[100px] lg:block" />
    </div>
  );
}

/* ─── Step Bars Background (wave-style animated bars) ─── */

const BAR_COUNT = 64;

function generateBarHeights(count: number): number[] {
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1); // 0 → 1
    // Smooth cosine valley: 1 at edges, ~0.2 at center
    const cosVal = (1 + Math.cos(t * Math.PI * 2 - Math.PI)) / 2; // 0 at edges, 1 at center
    const valley = 1 - cosVal * 0.75; // 1 at edges → 0.25 at center
    // Gentle sine ripple for organic feel
    const ripple = Math.sin(t * Math.PI * 5) * 0.04;
    const height = valley + ripple;
    heights.push(Math.max(0.18, Math.min(0.95, height)));
  }
  return heights;
}

const BAR_HEIGHTS = generateBarHeights(BAR_COUNT);

export function StepBarsBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className="mx-auto flex h-full w-full max-w-[1800px] items-end justify-center gap-0"
        style={{
          maskImage:
            "linear-gradient(to top, black 0%, black 75%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          maskComposite: "intersect",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 75%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskComposite: "destination-in",
        }}
      >
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="step-bar-gold flex-1"
            style={{
              height: `${h * 100}%`,
              opacity: 0.5 + h * 0.4,
              animationDelay: `${(i * 0.12) % 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Legacy alias ─── */
export const LightBarsBackground = StepBarsBackground;
