import { useLocation } from "react-router-dom";
import { Search, Flame, Sun, Moon, Menu, Brain } from "lucide-react";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";

const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/praticar": "Praticar",
  "/simulados": "Simulados",
  "/desempenho": "Desempenho",
  "/bookmarks": "Bookmarks",
  "/configuracoes": "Configurações",
  "/ranking": "Ranking",
  "/review": "Revisão",
  "/profile": "Perfil",
};

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const { profile } = useAuth();
  const streak = profile?.streak ?? 0;
  const currentPage = breadcrumbMap[location.pathname] || "Página";
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Hamburger (mobile) + Breadcrumb (desktop) */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground active:bg-accent md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Compact logo — mobile only */}
        <div className="flex items-center gap-1.5 md:hidden">
          <Brain className="h-5 w-5 text-gold" />
          <span className="text-base font-bold text-foreground">
            M<span className="text-gold">Q</span>
          </span>
        </div>

        {/* Breadcrumb — desktop only */}
        <div className="hidden items-center gap-2 text-sm md:flex">
          <span className="text-muted-foreground">MEDQUEST</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{currentPage}</span>
        </div>
      </div>

      {/* Search — desktop only */}
      <button className="hidden h-9 w-72 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-muted-foreground transition-colors hover:border-gold/30 hover:bg-secondary md:flex">
        <Search className="h-4 w-4" />
        <span>Buscar...</span>
        <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 font-mono-stats text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Streak */}
        <div className="mr-1 flex items-center gap-1 rounded-lg bg-gold-muted px-2 py-1.5 md:mr-2 md:px-3">
          <Flame className="h-4 w-4 text-gold" />
          <span className="font-mono-stats text-sm font-semibold text-gold">{streak}</span>
        </div>

        <NotificationPopover />

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Alternar tema"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors md:flex md:hover:bg-accent md:hover:text-foreground"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
