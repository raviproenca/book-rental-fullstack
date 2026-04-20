import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Bookmark, Star, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════
   1. Streak Increment
   ═══════════════════════════════════════════ */
export function StreakCounter({ value, className }: { value: number; className?: string }) {
  const [prev, setPrev] = useState(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value > prev) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      setPrev(value);
      return () => clearTimeout(t);
    }
    setPrev(value);
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.3 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={cn(
        "font-mono-stats font-bold transition-colors duration-300",
        flash ? "text-gold" : "text-foreground",
        className
      )}
    >
      {value}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════
   2. XP Float Animation
   ═══════════════════════════════════════════ */
export function XPFloat({ amount, show }: { amount: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -40 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pointer-events-none absolute font-mono-stats text-sm font-bold text-gold"
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   3. Confetti (correct answer – subtle)
   ═══════════════════════════════════════════ */
function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x, scale: 1, rotate: 0 }}
      animate={{ opacity: 0, y: -60, x: x + (Math.random() - 0.5) * 40, scale: 0.4, rotate: 180 + Math.random() * 180 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="absolute h-2 w-2 rounded-sm bg-success"
    />
  );
}

export function CorrectConfetti({ show }: { show: boolean }) {
  if (!show) return null;
  const particles = [-20, -8, 4, 16, 28];
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {particles.map((x, i) => (
        <ConfettiParticle key={i} delay={i * 0.06} x={x} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   4. Shake (wrong answer)
   ═══════════════════════════════════════════ */
export function ShakeWrapper({ shake, children }: { shake: boolean; children: ReactNode }) {
  return (
    <motion.div
      animate={
        shake
          ? { x: [0, -2, 2, -2, 2, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   5. Bookmark Toggle
   ═══════════════════════════════════════════ */
export function BookmarkToggle({
  active,
  onToggle,
  className,
}: {
  active: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onToggle}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-gold-muted text-gold"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
    >
      <motion.div
        key={active ? "filled" : "outline"}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <Bookmark className={cn("h-4 w-4", active && "fill-current")} />
      </motion.div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════
   6. Level Up Modal
   ═══════════════════════════════════════════ */
interface LevelUpProps {
  open: boolean;
  onClose: () => void;
  level: number;
  badge?: string;
}

function LevelUpConfettiParticle({ delay, idx }: { delay: number; idx: number }) {
  const colors = ["bg-gold", "bg-success", "bg-warning", "bg-gold-light"];
  const angle = (idx / 12) * Math.PI * 2;
  const dist = 60 + Math.random() * 40;
  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        scale: 0.3,
      }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      className={cn("absolute h-2 w-2 rounded-full", colors[idx % colors.length])}
    />
  );
}

export function LevelUpModal({ open, onClose, level, badge }: LevelUpProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-gold/30 bg-card p-8 text-center shadow-2xl"
          >
            {/* Close */}
            <button onClick={onClose} className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>

            {/* Confetti burst */}
            <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
              {[...Array(12)].map((_, i) => (
                <LevelUpConfettiParticle key={i} idx={i} delay={0.1 + i * 0.04} />
              ))}
            </div>

            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 400 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/15 text-3xl"
            >
              {badge || "🏆"}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <h2 className="text-lg font-bold text-foreground">Level Up!</h2>
                <Sparkles className="h-5 w-5 text-gold" />
              </div>

              <p className="mt-2 text-2xl font-bold text-gold">Nível {level}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Parabéns! Você alcançou o Nível {level}! Continue assim.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-gold py-3 text-sm font-semibold text-background shadow-lg shadow-[hsl(var(--gold)/0.25)] transition-shadow hover:shadow-xl"
            >
              Continuar Estudando
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   7. Card hover wrapper (lift + shadow)
   ═══════════════════════════════════════════ */
export function HoverCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px -8px hsl(var(--gold) / 0.08)" }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   8. Page transition wrapper
   ═══════════════════════════════════════════ */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
