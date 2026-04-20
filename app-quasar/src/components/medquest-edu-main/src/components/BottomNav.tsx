import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Play, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Praticar", icon: Play, path: "/praticar" },
  { label: "Desempenho", icon: BarChart3, path: "/desempenho" },
  { label: "Perfil", icon: User, path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              "min-h-[44px] justify-center",
              isActive ? "text-gold" : "text-muted-foreground active:text-foreground"
            )}
          >
            <tab.icon className={cn("h-5 w-5", isActive && "text-gold")} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
