import { useAuth } from "@/contexts/AuthContext";

/**
 * Destino dos CTAs da landing:
 * - logado → /dashboard
 * - não-logado (ou loading) → /signup
 */
export function useAuthCTA() {
  const { user, loading } = useAuth();
  if (loading) return "/signup";
  return user ? "/dashboard" : "/signup";
}
