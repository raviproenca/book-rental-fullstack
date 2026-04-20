import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content — offset for desktop sidebar */}
      <div className="flex flex-1 flex-col md:pl-60">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 px-4 py-6 pb-20 md:px-6 md:py-8 md:pb-8">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
