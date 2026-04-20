import { motion } from "framer-motion";

/** Subtle floating specks; full-viewport, pointer-events none */
export function GoldenParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${(i * 19 + 11) % 100}%`,
    top: `${(i * 29 + 7) % 100}%`,
    size: i % 4 === 0 ? "h-1 w-1" : "h-0.5 w-0.5",
    duration: 5 + (i % 4) * 1.2,
    delay: i * 0.4,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full bg-gold/20 ${p.size}`}
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -18, 0], opacity: [0, 0.45, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function AuthAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 bg-background"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 55% at 50% -15%, hsl(var(--gold) / 0.14), transparent 55%),
            radial-gradient(ellipse 60% 45% at 100% 50%, hsl(var(--gold) / 0.06), transparent 50%),
            radial-gradient(ellipse 50% 40% at 0% 80%, hsl(var(--gold) / 0.05), transparent 45%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <motion.div
        className="absolute left-1/2 top-[18%] h-[min(520px,70vh)] w-[min(520px,85vw)] -translate-x-1/2 rounded-full bg-gold/[0.09] blur-[120px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.65, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <GoldenParticles />
    </div>
  );
}
