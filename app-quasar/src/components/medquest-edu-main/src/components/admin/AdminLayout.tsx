import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileQuestion,
  Users,
  BookOpen,
  CreditCard,
  Tag,
  Flag,
  Globe,
  ArrowLeft,
  Brain,
  X,
  Menu,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { usePendingReportsCount } from "@/hooks/useReports";
import { useAuth } from "@/contexts/AuthContext";
import { AdminMocksProvider, useAdminMocks } from "@/contexts/AdminMocksContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Questões", icon: FileQuestion, path: "/admin/questoes" },
  { label: "Usuários", icon: Users, path: "/admin/usuarios" },
  { label: "Disciplinas", icon: BookOpen, path: "/admin/disciplinas" },
  { label: "Assinaturas", icon: CreditCard, path: "/admin/assinaturas" },
  { label: "Cupons", icon: Tag, path: "/admin/cupons" },
  { label: "Influenciadores", icon: Users, path: "/admin/influenciadores" },
  { label: "Reportes", icon: Flag, path: "/admin/reportes", badgeKey: "reports" as const },
  { label: "Landing Page", icon: Globe, path: "/admin/landing" },
];

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/questoes": "Questões",
  "/admin/usuarios": "Usuários",
  "/admin/disciplinas": "Disciplinas",
  "/admin/assinaturas": "Assinaturas",
  "/admin/assinaturas/analytics": "Assinaturas / Métricas",
  "/admin/assinaturas/planos": "Assinaturas / Planos",
  "/admin/assinaturas/cupons": "Assinaturas / Cupons",
  "/admin/cupons": "Cupons",
  "/admin/influenciadores": "Influenciadores",
  "/admin/influenciadores/visao-geral": "Influenciadores / Visão Geral",
  "/admin/reportes": "Reportes",
  "/admin/landing": "Landing Page",
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { adminMocksEnabled, setAdminMocksEnabled } = useAdminMocks();
  const location = useLocation();
  const couponDetailPath = /^\/admin\/cupons\/[^/]+$/.test(location.pathname);
  const influencerDetailPath = /^\/admin\/influenciadores\/[^/]+$/.test(location.pathname);
  const currentPage = couponDetailPath
    ? "Cupons / Detalhe"
    : influencerDetailPath
      ? "Influenciadores / Detalhe"
      : breadcrumbMap[location.pathname] || "Admin";
  const drawerRef = useRef<HTMLElement>(null);
  const { data: pendingReportsCount } = usePendingReportsCount();
  const { signOut } = useAuth();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  // Focus trap for mobile drawer
  const handleDrawerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setMobileOpen(false); return; }
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
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-muted">
            <Brain className="h-5 w-5 text-gold" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground">
              MED<span className="text-gold">QUEST</span>
            </span>
            <span className="rounded bg-gold-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
              Admin
            </span>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground md:hidden active:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path + "/"));
          const badgeCount = item.badgeKey === "reports" ? pendingReportsCount : undefined;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                "min-h-[44px]",
                isActive
                  ? "bg-gold-muted text-foreground"
                  : "text-muted-foreground active:bg-accent md:hover:bg-accent md:hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gold" />
              )}
              <item.icon
                className={cn("h-5 w-5 shrink-0", isActive && "text-gold")}
              />
              <span>{item.label}</span>
              {badgeCount != null && badgeCount > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — back to app */}
      <div className="border-t border-border p-3 space-y-1">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors min-h-[44px] active:bg-accent md:hover:bg-accent md:hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          <span>Voltar ao App</span>
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
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-border bg-card md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile drawer */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação admin"
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

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-56">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-md">
          {/* Left: Hamburger (mobile) + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
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
              <span className="rounded bg-gold-muted px-1 py-0.5 text-[9px] font-semibold uppercase text-gold">
                Admin
              </span>
            </div>

            {/* Breadcrumb — desktop only */}
            <div className="hidden items-center gap-2 text-sm md:flex">
              <span className="text-muted-foreground">Admin</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">{currentPage}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-2 py-1 md:px-2.5"
              title="Persiste neste navegador. O valor inicial segue VITE_ADMIN_COUPONS_LIST_MOCK e VITE_ADMIN_INFLUENCERS_LIST_MOCK."
            >
              <Switch
                id="admin-mocks-toggle"
                checked={adminMocksEnabled}
                onCheckedChange={setAdminMocksEnabled}
                aria-label="Usar dados de demonstração no admin"
              />
              <Label
                htmlFor="admin-mocks-toggle"
                className="cursor-pointer text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline"
              >
                Dados demo
              </Label>
            </div>

            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Alternar tema"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-accent md:hover:bg-accent md:hover:text-foreground"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Admin user */}
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-muted text-xs font-semibold text-gold">
                AD
              </div>
              <span className="hidden text-sm font-medium text-foreground md:block">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminMocksProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminMocksProvider>
  );
}
