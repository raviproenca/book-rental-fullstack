import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type AuthBackLinkProps = {
  className?: string;
};

export function AuthBackLink({ className = "" }: AuthBackLinkProps) {
  return (
    <Link
      to="/"
      className={`mb-5 inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-gold sm:justify-start ${className}`}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      Voltar ao início
    </Link>
  );
}
