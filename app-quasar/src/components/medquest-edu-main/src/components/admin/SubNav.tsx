import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Visão Geral", path: "/admin/assinaturas" },
  { label: "Métricas por Plano", path: "/admin/assinaturas/analytics" },
  { label: "Gerenciar Planos", path: "/admin/assinaturas/planos" },
];

export function SubNav() {
  const { pathname } = useLocation();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
