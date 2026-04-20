import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGoldAura } from "@/hooks/useGoldAura";

interface GoldAuraCardProps
  extends Omit<HTMLMotionProps<"div">, "ref" | "children"> {
  children: ReactNode;
  /** Radius of the gold glow in px. Default: 280 */
  auraRadius?: number;
  /** Intensity (center opacity) 0–1. Default: 0.14 */
  auraIntensity?: number;
  /** Enable/disable the border-edge highlight sweep. Default: true */
  borderGlow?: boolean;
  /** Extra className for the wrapper */
  className?: string;
}

/**
 * Premium card wrapper with a cursor-tracking gold aura effect.
 *
 * On hover/touch, a soft golden radial gradient follows the pointer,
 * creating a premium "aura" effect that uses the design system's gold tokens.
 *
 * Children are rendered directly inside (no wrapping div) so that
 * absolute-positioned decorative elements (e.g. top-line gradients,
 * badges) remain positioned relative to the card.
 *
 * The aura uses z-[1] and z-[2]; card content should use z-10 or
 * higher (which the existing cards already do).
 */
export const GoldAuraCard = forwardRef<HTMLDivElement, GoldAuraCardProps>(
  (
    {
      children,
      auraRadius = 280,
      auraIntensity = 0.14,
      borderGlow = true,
      className,
      ...motionProps
    },
    _ref,
  ) => {
    const {
      cardRef,
      auraStyle,
      borderGlowStyle,
      handlers,
    } = useGoldAura({
      radius: auraRadius,
      intensity: auraIntensity,
      borderGlow,
    });

    return (
      <motion.div
        ref={cardRef}
        className={cn("relative", className)}
        {...handlers}
        {...motionProps}
      >
        {/* ─── Aura overlay (radial gold glow) ─── */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit]"
          style={auraStyle}
          aria-hidden="true"
        />

        {/* ─── Border-edge highlight sweep ─── */}
        {borderGlow && (
          <div
            className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
            style={borderGlowStyle}
            aria-hidden="true"
          />
        )}

        {/* ─── Card content (rendered directly, not wrapped) ─── */}
        {children}
      </motion.div>
    );
  },
);

GoldAuraCard.displayName = "GoldAuraCard";
