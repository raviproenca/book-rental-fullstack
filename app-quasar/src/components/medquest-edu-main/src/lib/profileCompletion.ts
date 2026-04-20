import type { DbProfile } from "@/lib/supabase";

/** User has accepted in-app Terms + Privacy (required for OAuth and unified with post-login gate). */
export function hasAcceptedTerms(profile: DbProfile | null | undefined): boolean {
  return Boolean(profile?.terms_accepted_at);
}

/** Profile is ready for the main app: faculdade, período (semestre) e nome para exibição. */
export function isProfileComplete(profile: DbProfile | null | undefined): boolean {
  if (!profile) return false;
  const faculdadeOk = Boolean(profile.faculdade?.trim());
  const periodoOk = typeof profile.periodo === "number" && profile.periodo > 0;
  const nomeOk = Boolean(profile.nome?.trim());
  return faculdadeOk && periodoOk && nomeOk;
}
