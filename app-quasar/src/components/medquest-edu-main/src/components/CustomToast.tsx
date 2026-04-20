import { toast as sonnerToast } from "sonner";
import { Check, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* ─── Progress Bar ─── */
function ToastProgress({ duration = 4000, color }: { duration?: number; color: string }) {
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setWidth(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [duration]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-lg bg-secondary">
      <div className={cn("h-full transition-none", color)} style={{ width: `${width}%` }} />
    </div>
  );
}

/* ─── Toast Presets ─── */
const presets = {
  success: {
    icon: <Check className="h-4 w-4 text-success" />,
    borderColor: "border-l-success",
    progressColor: "bg-success",
  },
  error: {
    icon: <X className="h-4 w-4 text-destructive" />,
    borderColor: "border-l-destructive",
    progressColor: "bg-destructive",
  },
  info: {
    icon: <Info className="h-4 w-4 text-gold" />,
    borderColor: "border-l-gold",
    progressColor: "bg-gold",
  },
} as const;

type ToastType = keyof typeof presets;

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

function showToast(type: ToastType, { title, description, duration = 4000 }: ToastOptions) {
  const preset = presets[type];

  sonnerToast.custom(
    (id) => (
      <div
        className={cn(
          "relative w-[356px] overflow-hidden rounded-lg border border-border border-l-4 bg-card p-4 shadow-lg",
          preset.borderColor
        )}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            {preset.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={() => sonnerToast.dismiss(id)}
            className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <ToastProgress duration={duration} color={preset.progressColor} />
      </div>
    ),
    {
      duration,
      position: "bottom-right",
    }
  );
}

export const customToast = {
  success: (opts: ToastOptions) => showToast("success", opts),
  error: (opts: ToastOptions) => showToast("error", opts),
  info: (opts: ToastOptions) => showToast("info", opts),
};
