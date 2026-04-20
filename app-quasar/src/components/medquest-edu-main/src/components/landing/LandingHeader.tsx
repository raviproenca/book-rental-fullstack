import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Brain, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthCTA } from "@/hooks/useAuthCTA";

export function LandingHeader() {
  const { user } = useAuth();
  const startHref = useAuthCTA();
  const loginHref = user ? "/dashboard" : "/login";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1 transition-all duration-300",
          scrolled
            ? "border-white/[0.12] bg-black/70 shadow-lg shadow-black/20 backdrop-blur-xl"
            : "border-white/[0.08] bg-black/40 backdrop-blur-md"
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 pl-3 pr-5">
          <Brain className="h-6 w-6 text-gold" />
          <span className="text-[15px] font-bold tracking-tight text-white">
            MED<span className="text-gold">QUEST</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="#recursos"
            className="rounded-full px-5 py-2.5 text-sm text-white/55 transition-colors hover:text-white"
          >
            Recursos
          </a>
          <a
            href="#precos"
            className="rounded-full px-5 py-2.5 text-sm text-white/55 transition-colors hover:text-white"
          >
            Preços
          </a>
          <a
            href="#faq"
            className="rounded-full px-5 py-2.5 text-sm text-white/55 transition-colors hover:text-white"
          >
            FAQ
          </a>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-1.5 pl-3 md:flex">
          <Link
            to={loginHref}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-white/55 transition-colors hover:text-white"
          >
            Entrar
          </Link>
          <Link
            to={startHref}
            className="rounded-full border border-white/[0.12] bg-white px-5 py-2 text-sm font-semibold text-[#09090b] transition-all duration-200 hover:bg-white/90"
          >
            Começar Grátis
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 md:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute left-4 right-4 top-[calc(100%+8px)] rounded-2xl border border-white/[0.08] bg-black/90 px-6 pb-6 pt-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 text-sm">
            <a
              href="#recursos"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              Recursos
            </a>
            <a
              href="#precos"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              Preços
            </a>
            <a
              href="#faq"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              FAQ
            </a>
            <hr className="my-2 border-white/[0.08]" />
            <Link
              to={loginHref}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              Entrar
            </Link>
            <Link
              to={startHref}
              onClick={() => setMobileOpen(false)}
              className="mt-1 rounded-full bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#09090b]"
            >
              Começar Grátis
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
