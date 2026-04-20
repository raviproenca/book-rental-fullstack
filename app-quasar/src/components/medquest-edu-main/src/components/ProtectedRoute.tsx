import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingFallback } from "@/components/LoadingFallback";
import { TermsConsentModal } from "@/components/auth/TermsConsentModal";
import { hasAcceptedTerms, isProfileComplete } from "@/lib/profileCompletion";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  /** When true (default), block until Terms + Privacy are accepted in-app (incl. OAuth). */
  requireTermsAccepted?: boolean;
  /** When true (default), users without faculdade/período/nome are sent to onboarding. */
  requireCompleteProfile?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireTermsAccepted = true,
  requireCompleteProfile = true,
}: ProtectedRouteProps) {
  const { user, profile, isAdmin, loading, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingFallback />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireTermsAccepted && profile && !hasAcceptedTerms(profile)) {
    return <TermsConsentModal onAccepted={() => void refreshProfile()} />;
  }

  if (requireCompleteProfile && !isProfileComplete(profile)) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
