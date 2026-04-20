import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Zap,
  Clock,
  RotateCcw,
  LayoutDashboard,
  Moon,
  Sun,
  BookOpen,
  BarChart3,
  Trophy,
  Bookmark,
  FileText,
  User,
  Settings,
  CreditCard,
  ArrowRight,
  Brain,
  Keyboard,
  Play,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/* ─── Data ─── */
const quickActions = [
  { id: "quick-practice", label: "Iniciar Prática Rápida", desc: "10 questões aleatórias", icon: Zap, path: "/praticar/sessao", shortcut: "⌘P" },
  { id: "new-simulado", label: "Novo Simulado", desc: "Iniciar simulado cronometrado", icon: Clock, path: "/simulados", shortcut: "⌘S" },
  { id: "review-errors", label: "Revisar Erros", desc: "Refazer questões erradas", icon: RotateCcw, path: "/review" },
  { id: "dashboard", label: "Ver Dashboard", desc: "Painel principal", icon: LayoutDashboard, path: "/dashboard", shortcut: "⌘D" },
  { id: "toggle-theme", label: "Alternar Dark/Light Mode", desc: "Mudar aparência", icon: Moon, action: "toggle-theme" },
  { id: "shortcuts", label: "Atalhos de Teclado", desc: "Ver todos os atalhos", icon: Keyboard, action: "show-shortcuts" },
];

const disciplines = [
  { name: "Farmacologia", count: 342, icon: BookOpen },
  { name: "Cardiologia", count: 289, icon: BookOpen },
  { name: "Pediatria", count: 256, icon: BookOpen },
  { name: "Cirurgia Geral", count: 198, icon: BookOpen },
  { name: "Obstetrícia", count: 187, icon: BookOpen },
  { name: "Neurologia", count: 165, icon: BookOpen },
  { name: "Ortopedia", count: 143, icon: BookOpen },
  { name: "Infectologia", count: 134, icon: BookOpen },
];

const mockQuestions = [
  { id: 1, trecho: "Paciente masculino, 58 anos, hipertenso, tosse seca persistente com enalapril...", disciplina: "Farmacologia", tema: "Anti-hipertensivos" },
  { id: 2, trecho: "Paciente feminina, 67 anos, IC com FE reduzida, dispneia ao subir escada...", disciplina: "Cardiologia", tema: "Insuficiência Cardíaca" },
  { id: 3, trecho: "Criança de 4 anos com febre alta há 5 dias, conjuntivite bilateral...", disciplina: "Pediatria", tema: "Doença de Kawasaki" },
  { id: 4, trecho: "Homem de 45 anos, tabagista, dor torácica aguda, supra de ST difuso...", disciplina: "Cardiologia", tema: "Pericardite" },
  { id: 5, trecho: "Gestante de 32 semanas com PA 160x110 mmHg, proteinúria 3+...", disciplina: "Obstetrícia", tema: "Pré-eclâmpsia" },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Praticar", icon: Play, path: "/praticar" },
  { label: "Simulados", icon: FileText, path: "/simulados" },
  { label: "Revisão", icon: RotateCcw, path: "/review" },
  { label: "Desempenho", icon: BarChart3, path: "/desempenho" },
  { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
  { label: "Ranking", icon: Trophy, path: "/ranking" },
  { label: "Perfil", icon: User, path: "/profile" },
  { label: "Planos", icon: CreditCard, path: "/pricing" },
  { label: "Configurações", icon: Settings, path: "/configuracoes" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onShowShortcuts: () => void;
}

export function CommandPalette({ open, onClose, onShowShortcuts }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Build flat list of all items filtered by query
  const sections = useMemo(() => {
    const q = query.toLowerCase().trim();
    const result: {
      title: string;
      items: { id: string; label: string; desc: string; icon: LucideIcon; path?: string; action?: string; shortcut?: string }[];
    }[] = [];

    // Quick actions
    const filteredActions = quickActions.filter(
      (a) => !q || a.label.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)
    );
    if (filteredActions.length) result.push({ title: "Ações Rápidas", items: filteredActions });

    // Disciplines
    const filteredDisc = disciplines
      .filter((d) => !q || d.name.toLowerCase().includes(q))
      .map((d) => ({ id: `disc-${d.name}`, label: d.name, desc: `${d.count} questões`, icon: d.icon, path: "/praticar" }));
    if (filteredDisc.length) result.push({ title: "Disciplinas", items: filteredDisc });

    // Questions (only when searching)
    if (q.length >= 2) {
      const filteredQ = mockQuestions
        .filter((qn) => qn.trecho.toLowerCase().includes(q) || qn.disciplina.toLowerCase().includes(q) || qn.tema.toLowerCase().includes(q))
        .map((qn) => ({ id: `q-${qn.id}`, label: qn.trecho.slice(0, 70) + "...", desc: `${qn.disciplina} • ${qn.tema}`, icon: FileText, path: "/praticar/sessao" }));
      if (filteredQ.length) result.push({ title: "Questões", items: filteredQ });
    }

    // Navigation
    const filteredNav = navItems
      .filter((n) => !q || n.label.toLowerCase().includes(q))
      .map((n) => ({ id: `nav-${n.path}`, label: n.label, desc: n.path, icon: n.icon, path: n.path }));
    if (filteredNav.length) result.push({ title: "Navegação", items: filteredNav });

    return result;
  }, [query]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  // Reset on open/query change
  useEffect(() => { setSelectedIdx(0); }, [query]);
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const executeItem = useCallback(
    (item: (typeof flatItems)[0]) => {
      onClose();
      if (item.action === "toggle-theme") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        return;
      }
      if (item.action === "show-shortcuts") {
        onShowShortcuts();
        return;
      }
      if (item.path) navigate(item.path);
    },
    [navigate, onClose, onShowShortcuts, resolvedTheme, setTheme]
  );

  // Keyboard nav + focus trap
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, flatItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && flatItems[selectedIdx]) {
        e.preventDefault();
        executeItem(flatItems[selectedIdx]);
      }
      if (e.key === "Tab") {
        const container = dialogRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, flatItems, selectedIdx, onClose, executeItem]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  if (!open) return null;

  let globalIdx = -1;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-4 md:pt-[15vh]">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Command palette" className="relative z-10 mx-0 flex h-full w-full max-w-[640px] animate-scale-in flex-col overflow-hidden border-border bg-card shadow-2xl md:mx-4 md:h-auto md:rounded-2xl md:border">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar questões, disciplinas, ações..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-full flex-1 overflow-y-auto p-2 md:max-h-[400px] md:flex-none">
          {sections.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Search className="mb-2 h-6 w-6 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhum resultado para "{query}"</p>
            </div>
          )}

          {sections.map((section, sIdx) => (
            <div key={section.title} className={cn(sIdx > 0 && "mt-2")}>
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.title}
              </p>
              {section.items.map((item) => {
                globalIdx++;
                const idx = globalIdx;
                const isSelected = idx === selectedIdx;
                return (
                  <button
                    key={item.id}
                    data-idx={idx}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      isSelected ? "bg-gold-muted/30 text-foreground" : "text-foreground/80 hover:bg-secondary/50"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-gold" : "text-muted-foreground")} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{item.label}</p>
                      {item.desc && <p className="truncate text-[11px] text-muted-foreground">{item.desc}</p>}
                    </div>
                    {item.shortcut && (
                      <kbd className="shrink-0 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="h-3 w-3 shrink-0 text-gold" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
            <span><kbd className="rounded border border-border px-1 font-mono">↑↓</kbd> navegar</span>
            <span><kbd className="rounded border border-border px-1 font-mono">↵</kbd> selecionar</span>
            <span><kbd className="rounded border border-border px-1 font-mono">esc</kbd> fechar</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
            <Brain className="h-3 w-3" />
            MEDQUEST
          </div>
        </div>
      </div>
    </div>
  );
}
