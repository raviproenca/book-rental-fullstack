import { useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Play,
  FileText,
  BarChart3,
  Bookmark,
  Settings,
  Brain,
  RotateCcw,
  Trophy,
  Users,
  ShieldCheck,
  X,
  LogOut,
} from "lucide-react";
import { cn, nameInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Praticar", icon: Play, path: "/praticar" },
  { label: "Simulados", icon: FileText, path: "/simulados" },
  { label: "Grupos", icon: Users, path: "/grupos" },
  { label: "Revisão", icon: RotateCcw, path: "/review" },
  { label: "Desempenho", icon: BarChart3, path: "/desempenho" },
  { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
  { label: "Ranking", icon: Trophy, path: "/ranking" },
  { label: "Configurações", icon: Settings, path: "/configuracoes" },
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const location = useLocation();
  const drawerRef = useRef<HTMLElement>(null);
  const { user, profile, isAdmin, signOut } = useAuth();

  const isAdminRoute =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");

  const displayName =
    profile?.nome?.trim() || user?.email?.split("@")[0] || "Conta";
  const avatarInitials = profile?.nome?.trim()
    ? nameInitials(profile.nome)
    : (user?.email?.split("@")[0]?.slice(0, 2).toUpperCase() ?? "?");

  // Close drawer on route change
  useEffect(() => {
    onMobileClose?.();
  }, [location.pathname]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  // Focus trap for mobile drawer
  const handleDrawerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onMobileClose?.(); return; }
    if (e.key !== "Tab") return;
    const container = drawerRef.current;
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
  }, [onMobileClose]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-muted">
            <Brain className="h-5 w-5 text-gold" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            MED<span className="text-gold">QUEST</span>
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onMobileClose}
          aria-label="Fechar menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground md:hidden active:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                "min-h-[44px]", // touch-friendly
                isActive
                  ? "bg-gold-muted text-foreground"
                  : "text-muted-foreground active:bg-accent md:hover:bg-accent md:hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gold" />
              )}
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-gold")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {isAdmin && (
        <div className="border-t border-border px-2 py-2">
          <Link
            to="/admin"
            className={cn(
              "group relative flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gold transition-colors duration-200",
              "active:bg-gold-muted md:hover:bg-gold-muted/50",
              isAdminRoute && "bg-gold-muted font-medium"
            )}
          >
            {isAdminRoute && (
              <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gold" />
            )}
            <ShieldCheck className="h-5 w-5 shrink-0 text-gold" />
            <span className="text-gold">Administração</span>
          </Link>
        </div>
      )}

      {/* User section */}
      <div className="border-t border-border p-3 space-y-1">
        <Link to="/profile" className="flex items-center gap-3 rounded-md px-1 py-1 min-h-[44px] transition-colors active:bg-accent md:hover:bg-accent">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
            {avatarInitials}
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors min-h-[44px] active:bg-accent md:hover:bg-accent md:hover:text-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-border bg-card md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile drawer */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        onKeyDown={handleDrawerKeyDown}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out md:hidden",
          "pb-[env(safe-area-inset-bottom)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
