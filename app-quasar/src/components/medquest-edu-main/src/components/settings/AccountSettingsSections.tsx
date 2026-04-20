import { useEffect, useState } from "react";
import {
  Lock,
  Sun,
  Moon,
  Bell,
  Mail,
  Trash2,
  ChevronDown,
  Loader2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { FacultySelect } from "@/components/onboarding/FacultySelect";
import { PricingPlansContent } from "@/components/landing/PricingSection";
import { useUserProfile, useUpdateProfile, useActiveSubscriptionPeriodEnd } from "@/hooks/useUser";
import { DashboardSkeleton } from "@/components/Skeletons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SEMESTRE_OPTIONS = Array.from({ length: 12 }, (_, i) => `${i + 1}º semestre`);

const profileLabelClass = "mb-1 block text-xs font-medium text-muted-foreground";

export function AccountSettingsSections() {
  const { resolvedTheme, setTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: proPeriodEndIso } = useActiveSubscriptionPeriodEnd(profile?.plano === "pro");
  const { user, changePassword, signOut } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const [emailDigest, setEmailDigest] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [nome, setNome] = useState("");
  const [faculdade, setFaculdade] = useState("");
  const [periodoSemestre, setPeriodoSemestre] = useState("");
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pwdStep, setPwdStep] = useState(0);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const canChangePassword =
    user?.identities?.some((i) => i.provider === "email") ?? false;

  useEffect(() => {
    if (!profile) return;
    setNome(profile.nome);
    setFaculdade(profile.faculdade);
    const n = Math.min(12, Math.max(1, profile.periodoNumero));
    setPeriodoSemestre(`${n}º semestre`);
  }, [profile]);

  const resetPasswordDialog = () => {
    setPwdStep(0);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setPwdError(null);
    setPwdSubmitting(false);
  };

  const saveProfileFields = async () => {
    if (!periodoSemestre) {
      toast.error("Selecione o semestre.");
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({
        nome: nome.trim(),
        faculdade: faculdade.trim(),
        periodo: periodoSemestre,
      });
      toast.success("Perfil atualizado.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível salvar.";
      toast.error(msg);
    }
  };

  const submitNewPassword = async () => {
    setPwdError(null);
    if (newPwd.length < 8) {
      setPwdError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("As senhas não conferem.");
      return;
    }
    setPwdSubmitting(true);
    const { error } = await changePassword(currentPwd, newPwd);
    setPwdSubmitting(false);
    if (error) {
      const raw = (error.message ?? "").toLowerCase();
      const msg =
        raw.includes("invalid") || raw.includes("credential")
          ? "Senha atual incorreta."
          : error.message || "Não foi possível alterar a senha.";
      toast.error(msg);
      return;
    }
    toast.success("Senha atualizada.");
    setPasswordDialogOpen(false);
    resetPasswordDialog();
  };

  const subscriptionTitle =
    profile?.plano === "pro" ? "Plano Pro" : "Plano Gratuito";
  const subscriptionSubtitle =
    profile?.plano === "pro"
      ? proPeriodEndIso
        ? `Renovação em ${new Date(proPeriodEndIso).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}`
        : "Assinatura Pro ativa"
      : "Faça upgrade para desbloquear o Pro.";

  if (isProfileLoading || !profile) return <DashboardSkeleton />;

  return (
    <>
      <div className="rounded-2xl border border-border bg-card px-5 pb-5">
        <div className="space-y-4 py-5">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Perfil</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="settings-profile-nome" className={profileLabelClass}>
                Nome
              </label>
              <input
                id="settings-profile-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
                className="h-11 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold/40"
              />
            </div>
            <div>
              <label htmlFor="settings-profile-periodo" className={profileLabelClass}>
                Período
              </label>
              <div className="relative">
                <select
                  id="settings-profile-periodo"
                  value={periodoSemestre}
                  onChange={(e) => setPeriodoSemestre(e.target.value)}
                  className={cn(
                    "h-11 w-full appearance-none rounded-lg border border-border bg-secondary px-3 py-2 pr-10 text-sm text-foreground outline-none transition-colors focus:border-gold/40",
                    !periodoSemestre && "text-muted-foreground",
                  )}
                >
                  <option value="">Selecione o semestre</option>
                  {SEMESTRE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <FacultySelect
                label="Faculdade"
                value={faculdade}
                onChange={setFaculdade}
                placeholder="Selecione sua faculdade"
                labelClassName={profileLabelClass}
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={updateProfileMutation.isPending}
              onClick={() => void saveProfileFields()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-gold-hover disabled:pointer-events-none disabled:opacity-50"
            >
              {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar alterações
            </button>
          </div>
        </div>

        <div className="border-t border-border py-5">
          <h3 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Segurança
          </h3>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Senha da conta</p>
                <p className="text-[11px] text-muted-foreground">
                  Confirme sua identidade antes de definir uma nova senha.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                resetPasswordDialog();
                setPasswordDialogOpen(true);
              }}
              className="shrink-0 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-gold/30 hover:text-gold"
            >
              Alterar senha
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Encerrar sessão</p>
                <p className="text-[11px] text-muted-foreground">
                  Sair deste dispositivo. Você poderá entrar de novo quando quiser.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="shrink-0 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-gold/30 hover:text-gold"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="border-t border-border py-5">
          <h3 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Assinatura</h3>
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
                       <div>
              <p className="text-sm font-medium text-foreground">{subscriptionTitle}</p>
              <p className="text-[11px] text-muted-foreground">{subscriptionSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setPricingModalOpen(true)}
              className="text-xs font-medium text-gold transition-colors hover:text-gold-hover"
            >
              Gerenciar
            </button>
          </div>
        </div>

        <div className="border-t border-border py-5">
          <h3 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferências</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-warning" />}
                <span className="text-sm text-foreground">Modo escuro</span>
              </div>
              <button
                type="button"
                onClick={() => setTheme(darkMode ? "light" : "dark")}
                aria-label="Alternar modo escuro"
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  darkMode ? "bg-gold" : "bg-secondary"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform",
                    darkMode ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Resumo semanal por email</span>
              </div>
              <button
                type="button"
                onClick={() => setEmailDigest(!emailDigest)}
                className={cn("relative h-6 w-11 rounded-full transition-colors", emailDigest ? "bg-gold" : "bg-secondary")}
              >
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform", emailDigest ? "left-[22px]" : "left-0.5")} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Lembrete diário de estudo</span>
              </div>
              <button
                type="button"
                onClick={() => setDailyReminder(!dailyReminder)}
                className={cn("relative h-6 w-11 rounded-full transition-colors", dailyReminder ? "bg-gold" : "bg-secondary")}
              >
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform", dailyReminder ? "left-[22px]" : "left-0.5")} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="mb-3 text-xs font-medium text-destructive uppercase tracking-wider">Zona de Perigo</h3>
          {!deleteConfirm ? (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Excluir minha conta
            </button>
          ) : (
            <div className="animate-fade-in rounded-lg border border-destructive/30 bg-destructive/[0.05] p-4">
              <p className="text-sm font-medium text-destructive">Tem certeza?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
                >
                  Confirmar exclusão
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) resetPasswordDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {!canChangePassword
                ? "Senha indisponível"
                : pwdStep === 0
                  ? "Alterar senha"
                  : pwdStep === 1
                    ? "Verificar identidade"
                    : "Nova senha"}
            </DialogTitle>
            <DialogDescription className="text-left">
              {!canChangePassword ? (
                <span>
                  Esta conta usa login social ou não possui senha definida no MedQuest. Gerencie o acesso pela
                  conta do provedor (por exemplo, Google).
                </span>
              ) : pwdStep === 0 ? (
                <>
                  Por segurança, confirmaremos sua senha atual antes de criar uma nova. Não compartilhe sua senha
                  com ninguém.
                </>
              ) : pwdStep === 1 ? (
                <>Digite a senha que você usa hoje para entrar no MedQuest.</>
              ) : (
                <>Escolha uma nova senha forte (mínimo 8 caracteres), diferente da anterior.</>
              )}
            </DialogDescription>
          </DialogHeader>

          {canChangePassword && pwdStep >= 1 && (
            <div className="space-y-3">
              {pwdStep === 1 && (
                <>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <input
                      readOnly
                      value={profile.email}
                      className="w-full rounded-lg border border-border bg-secondary/80 px-3 py-2 text-sm text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="settings-pwd-current" className="text-xs text-muted-foreground">
                      Senha atual
                    </label>
                    <input
                      id="settings-pwd-current"
                      type="password"
                      autoComplete="current-password"
                      value={currentPwd}
                      onChange={(e) => {
                        setCurrentPwd(e.target.value);
                        setPwdError(null);
                      }}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-gold/40"
                    />
                  </div>
                </>
              )}
              {pwdStep === 2 && (
                <>
                  <div className="space-y-1">
                    <label htmlFor="settings-pwd-new" className="text-xs text-muted-foreground">
                      Nova senha
                    </label>
                    <input
                      id="settings-pwd-new"
                      type="password"
                      autoComplete="new-password"
                      value={newPwd}
                      onChange={(e) => {
                        setNewPwd(e.target.value);
                        setPwdError(null);
                      }}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-gold/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="settings-pwd-confirm" className="text-xs text-muted-foreground">
                      Confirmar nova senha
                    </label>
                    <input
                      id="settings-pwd-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPwd}
                      onChange={(e) => {
                        setConfirmPwd(e.target.value);
                        setPwdError(null);
                      }}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-gold/40"
                    />
                  </div>
                </>
              )}
              {pwdError && <p className="text-xs text-destructive">{pwdError}</p>}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setPasswordDialogOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {canChangePassword ? "Cancelar" : "Fechar"}
            </button>
            {canChangePassword && pwdStep === 0 && (
              <button
                type="button"
                onClick={() => setPwdStep(1)}
                className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-gold-hover"
              >
                Continuar
              </button>
            )}
            {canChangePassword && pwdStep === 1 && (
              <button
                type="button"
                disabled={!currentPwd.trim()}
                onClick={() => {
                  setPwdError(null);
                  setPwdStep(2);
                }}
                className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-gold-hover disabled:pointer-events-none disabled:opacity-50"
              >
                Continuar
              </button>
            )}
            {canChangePassword && pwdStep === 2 && (
              <button
                type="button"
                disabled={pwdSubmitting || !newPwd || !confirmPwd}
                onClick={() => void submitNewPassword()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-gold-hover disabled:pointer-events-none disabled:opacity-50"
              >
                {pwdSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar nova senha
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pricingModalOpen} onOpenChange={setPricingModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Planos e preços</DialogTitle>
            <DialogDescription>
              Compare os planos e atualize sua assinatura quando quiser.
            </DialogDescription>
          </DialogHeader>
          <PricingPlansContent compact toggleLayoutId="pricing-toggle-modal" ctaTo="/pricing" />
        </DialogContent>
      </Dialog>
    </>
  );
}
