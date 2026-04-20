import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { DbProfile } from "@/lib/supabase";

interface AuthState {
  user: User | null;
  profile: DbProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  /** Re-authenticate with current password, then set a new password. */
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAdmin: false,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    if (profile) {
      setState((prev) => ({ ...prev, profile }));
    }
  }, [state.user, fetchProfile]);

  // Listen to auth state changes
  useEffect(() => {
    const cleared: AuthState = {
      user: null,
      profile: null,
      session: null,
      loading: false,
      isAdmin: false,
    };

    const applySession = async (session: Session | null, event?: string) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        const isAdmin = session.user.app_metadata?.role === "admin";
        setState({ user: session.user, profile, session, loading: false, isAdmin });
        if (event === "SIGNED_IN") {
          void supabase
            .from("profiles")
            .update({ ultimo_acesso: new Date().toISOString() })
            .eq("id", session.user.id);
        }
      } else {
        setState(cleared);
      }
    };

    const safeApply = (session: Session | null, event?: string) => {
      void applySession(session, event).catch(() => setState(cleared));
    };

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        safeApply(session);
      })
      .catch(() => setState(cleared));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      safeApply(session, event);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = useCallback(
    async (email: string, password: string, metadata?: Record<string, unknown>) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      return { error };
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      // Land on dashboard; ProtectedRoute sends incomplete profiles to /onboarding.
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { error };
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const email = state.user?.email;
      if (!email) {
        return {
          error: { message: "Sessão inválida.", name: "AuthError", status: 401 } as AuthError,
        };
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) return { error: signInError };
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      return { error: updateError };
    },
    [state.user?.email],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
