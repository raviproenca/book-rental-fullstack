import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const shortcutCategories = [
  {
    title: "Geral",
    shortcuts: [
      { keys: ["⌘", "K"], desc: "Abrir Command Palette" },
      { keys: ["⌘", "D"], desc: "Ir para Dashboard" },
      { keys: ["⌘", "P"], desc: "Prática Rápida" },
      { keys: ["⌘", "S"], desc: "Novo Simulado" },
      { keys: ["?"], desc: "Atalhos de teclado" },
    ],
  },
  {
    title: "Questões",
    shortcuts: [
      { keys: ["1-5"], desc: "Selecionar alternativa" },
      { keys: ["Enter"], desc: "Confirmar resposta" },
      { keys: ["→"], desc: "Próxima questão" },
      { keys: ["←"], desc: "Questão anterior" },
      { keys: ["B"], desc: "Bookmark" },
      { keys: ["F"], desc: "Marcar para revisão" },
    ],
  },
  {
    title: "Simulado",
    shortcuts: [
      { keys: ["1-5"], desc: "Selecionar alternativa" },
      { keys: ["→"], desc: "Próxima questão" },
      { keys: ["←"], desc: "Questão anterior" },
      { keys: ["F"], desc: "Marcar para revisão" },
      { keys: ["Esc"], desc: "Pausar simulado" },
    ],
  },
  {
    title: "Navegação",
    shortcuts: [
      { keys: ["G", "D"], desc: "Dashboard" },
      { keys: ["G", "P"], desc: "Praticar" },
      { keys: ["G", "S"], desc: "Simulados" },
      { keys: ["G", "R"], desc: "Ranking" },
      { keys: ["G", "B"], desc: "Bookmarks" },
    ],
  },
];

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Atalhos de teclado" className="relative z-10 mx-4 w-full max-w-[600px] animate-scale-in rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Atalhos de Teclado</h2>
          <button onClick={onClose} aria-label="Fechar" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid gap-6 p-5 sm:grid-cols-2">
          {shortcutCategories.map((cat) => (
            <div key={cat.title}>
              <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {cat.title}
              </h3>
              <div className="space-y-2">
                {cat.shortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{s.desc}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i}>
                          <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-border bg-secondary px-1.5 font-mono text-[11px] font-medium text-muted-foreground shadow-sm">
                            {k}
                          </kbd>
                          {i < s.keys.length - 1 && <span className="mx-0.5 text-[10px] text-muted-foreground/30">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-5 py-3">
          <p className="text-[10px] text-muted-foreground/40 text-center">
            Pressione <kbd className="rounded border border-border px-1 font-mono">?</kbd> a qualquer momento para ver os atalhos
          </p>
        </div>
      </div>
    </div>
  );
}
