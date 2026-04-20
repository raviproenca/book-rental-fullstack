import { useCallback, useRef, useState, useEffect } from "react";

/**
 * Gold Aura — cursor-tracking radial glow effect for cards.
 *
 * Returns a ref to attach to the card element and a style object
 * for the overlay element that renders the aura.
 *
 * On desktop: follows the mouse with a subtle lerp.
 * On mobile:  follows touch with identical behavior.
 *
 * Respects `prefers-reduced-motion` — disables the effect entirely.
 */

interface AuraConfig {
  /** Radius of the radial gradient in px. Default: 280 */
  radius?: number;
  /** Opacity of the glow at the center (0 – 1). Default: 0.14 */
  intensity?: number;
  /** Optional secondary ring radius multiplier. Default: 1.6 */
  ringScale?: number;
  /** Lerp factor for smooth interpolation (0 = frozen, 1 = instant). Default: 0.15 */
  lerp?: number;
  /** Whether to include a subtle border-light sweep. Default: true */
  borderGlow?: boolean;
}

interface AuraState {
  x: number;
  y: number;
  opacity: number;
}

export function useGoldAura(config: AuraConfig = {}) {
  const {
    radius = 280,
    intensity = 0.14,
    ringScale = 1.6,
    lerp = 0.15,
    borderGlow = true,
  } = config;

  const cardRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AuraState>({ x: 0, y: 0, opacity: 0 });
  const target = useRef({ x: 0, y: 0, opacity: 0 });
  const current = useRef({ x: 0, y: 0, opacity: 0 });
  const rafId = useRef<number>(0);
  const isReducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      isReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // rAF-based smooth lerp loop
  useEffect(() => {
    let running = true;

    function tick() {
      if (!running) return;
      const c = current.current;
      const t = target.current;

      c.x += (t.x - c.x) * lerp;
      c.y += (t.y - c.y) * lerp;
      c.opacity += (t.opacity - c.opacity) * lerp;

      setState({ x: c.x, y: c.y, opacity: c.opacity });
      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafId.current);
    };
  }, [lerp]);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (isReducedMotion.current) return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      target.current.x = clientX - rect.left;
      target.current.y = clientY - rect.top;
      target.current.opacity = 1;
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => updatePosition(e.clientX, e.clientY),
    [updatePosition],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    },
    [updatePosition],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    },
    [updatePosition],
  );

  const handleLeave = useCallback(() => {
    target.current.opacity = 0;
  }, []);

  // Generate the overlay style
  const auraStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    borderRadius: "inherit",
    opacity: state.opacity,
    transition: "opacity 0.4s ease-out",
    background: [
      // Hot center — bright gold-light spotlight
      `radial-gradient(${radius * 0.5}px circle at ${state.x}px ${state.y}px, hsl(var(--gold-light) / ${intensity * 1.4}) 0%, transparent 70%)`,
      // Primary gold glow — warm core
      `radial-gradient(${radius}px circle at ${state.x}px ${state.y}px, hsl(var(--gold) / ${intensity}) 0%, hsl(var(--gold) / ${intensity * 0.45}) 40%, transparent 75%)`,
      // Wider ambient ring — soft warmth
      `radial-gradient(${radius * ringScale}px circle at ${state.x}px ${state.y}px, hsl(var(--gold) / ${intensity * 0.2}) 0%, transparent 70%)`,
    ].join(", "),
  };

  // Border-glow sweep: a thin bright line that follows the cursor
  const borderGlowStyle: React.CSSProperties = borderGlow
    ? {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: "inherit",
        opacity: state.opacity * 0.9,
        transition: "opacity 0.4s ease-out",
        background: `radial-gradient(${radius * 0.65}px circle at ${state.x}px ${state.y}px, hsl(var(--gold-light) / 0.35) 0%, transparent 60%)`,
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        padding: "1px",
      }
    : { display: "none" };

  return {
    cardRef,
    auraStyle,
    borderGlowStyle,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleLeave,
      onTouchMove: handleTouchMove,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleLeave,
    },
  };
}
