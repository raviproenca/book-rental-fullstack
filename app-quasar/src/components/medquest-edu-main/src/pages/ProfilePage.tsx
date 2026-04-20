import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Flame,
  Target,
  Clock,
  Lock,
  Check,
  ListChecks,
  Pencil,
  Loader2,
  Settings,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  META_QUESTOES_DIARIAS_MAX,
  META_QUESTOES_DIARIAS_MIN,
} from "@/lib/metaDiaria";
import { useUserProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/useUser";
import { useAchievements } from "@/hooks/useAchievements";
import { DashboardSkeleton } from "@/components/Skeletons";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: achievements = [] } = useAchievements();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [hoveredAchievement, setHoveredAchievement] = useState<number | null>(null);
  const [metaDialogOpen, setMetaDialogOpen] = useState(false);
  const [metaInput, setMetaInput] = useState("");
  const [metaFieldError, setMetaFieldError] = useState<string | null>(null);
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);

  const avatarSrc = profile?.avatarUrl?.trim() ?? "";

  useEffect(() => {
    setAvatarImageFailed(false);
  }, [avatarSrc]);

  const openMetaDialog = () => {
    setMetaInput(
      profile?.metaQuestoesDiarias != null ? String(profile.metaQuestoesDiarias) : "",
    );
    setMetaFieldError(null);
    setMetaDialogOpen(true);
  };

  const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadAvatarMutation.mutateAsync(file);
      toast.success("Foto do perfil atualizada.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível enviar a foto.";
      toast.error(msg);
    }
  };

  const saveMetaDiaria = async () => {
    const raw = metaInput.trim();
    const n = parseInt(raw, 10);
    if (!raw || Number.isNaN(n)) {
      setMetaFieldError("Informe um número válido.");
      return;
    }
    if (n < META_QUESTOES_DIARIAS_MIN || n > META_QUESTOES_DIARIAS_MAX) {
      setMetaFieldError(
        `Informe um número entre ${META_QUESTOES_DIARIAS_MIN} e ${META_QUESTOES_DIARIAS_MAX}.`,
      );
      return;
    }
    setMetaFieldError(null);
    try {
      await updateProfileMutation.mutateAsync({ metaQuestoesDiarias: n });
      toast.success("Meta diária atualizada.");
      setMetaDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível salvar.";
      toast.error(msg);
    }
  };

  if (isProfileLoading || !profile) return <DashboardSkeleton />;

  const showAvatarImage = avatarSrc.length > 0 && !avatarImageFailed;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="group relative">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={onAvatarFileChange}
              />
              {showAvatarImage ? (
                <img
                  src={avatarSrc}
                  alt=""
                  className="h-24 w-24 rounded-2xl object-cover ring-2 ring-gold/30"
                  onError={() => setAvatarImageFailed(true)}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gold/15 text-2xl font-bold text-gold ring-2 ring-gold/30">
                  {profile.avatar}
                </div>
              )}
              <button
                type="button"
                aria-label="Alterar foto do perfil"
                disabled={uploadAvatarMutation.isPending}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                {uploadAvatarMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-foreground">{profile.nome}</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
                  {profile.faculdade}
                </span>
                <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                  {profile.periodo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:justify-end">
            <Link
              to="/configuracoes"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-gold/30 hover:text-gold"
            >
              <Settings className="h-4 w-4 shrink-0" />
              Configurações da conta
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Streak", value: `${profile.streak} dias`, icon: Flame, iconColor: "text-warning" },
          { label: "Questões", value: profile.questoesTotais.toLocaleString(), icon: Target, iconColor: "text-primary" },
          { label: "Taxa de Acerto", value: `${profile.taxaAcerto}%`, icon: Check, iconColor: "text-success" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="mt-2 font-mono-stats text-xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <ListChecks className="h-4 w-4 shrink-0 text-gold" />
              <span className="text-xs text-muted-foreground">Meta (dia)</span>
            </div>
            <button
              type="button"
              onClick={openMetaDialog}
              aria-label="Editar meta diária"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 font-mono-stats text-xl font-bold text-foreground">
            {profile.metaQuestoesDiarias != null
              ? `${profile.metaQuestoesDiarias} questões`
              : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Horas de Estudo</span>
          </div>
          <p className="mt-2 font-mono-stats text-xl font-bold text-foreground">{profile.horasEstudo}h</p>
        </div>
      </div>

      <Dialog open={metaDialogOpen} onOpenChange={setMetaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Meta diária</DialogTitle>
            <DialogDescription>
              Quantas questões você quer resolver em dias de estudo? Entre {META_QUESTOES_DIARIAS_MIN} e{" "}
              {META_QUESTOES_DIARIAS_MAX}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="meta-diaria-input" className="text-xs text-muted-foreground">
              Questões por dia
            </label>
            <input
              id="meta-diaria-input"
              type="number"
              min={META_QUESTOES_DIARIAS_MIN}
              max={META_QUESTOES_DIARIAS_MAX}
              value={metaInput}
              onChange={(e) => {
                setMetaInput(e.target.value);
                setMetaFieldError(null);
              }}
              className={cn(
                "w-full rounded-lg border bg-secondary px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold/40",
                metaFieldError ? "border-destructive" : "border-border",
              )}
            />
            {metaFieldError && <p className="text-xs text-destructive">{metaFieldError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setMetaDialogOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={updateProfileMutation.isPending}
              onClick={() => void saveMetaDiaria()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-gold-hover disabled:pointer-events-none disabled:opacity-50"
            >
              {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Conquistas</h2>
          <span className="text-xs text-muted-foreground">
            {achievements.filter((a) => a.unlocked).length}/{achievements.length} desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="relative"
              onMouseEnter={() => setHoveredAchievement(a.id)}
              onMouseLeave={() => setHoveredAchievement(null)}
            >
              <div
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                  a.unlocked
                    ? "border-gold/20 bg-gold-muted/20 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10"
                    : "border-border bg-secondary/30 opacity-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    a.unlocked ? "bg-gold/15" : "bg-secondary"
                  )}
                >
                  {a.unlocked ? (
                    <a.icon className={cn("h-5 w-5", a.color)} />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
                <span className={cn("text-center text-[10px] font-medium leading-tight", a.unlocked ? "text-foreground" : "text-muted-foreground/60")}>
                  {a.nome}
                </span>
              </div>

              {hoveredAchievement === a.id && (
                <div className="absolute -top-2 left-1/2 z-30 -translate-x-1/2 -translate-y-full animate-fade-in">
                  <div className="w-48 rounded-lg border border-border bg-popover p-3 shadow-lg">
                    <p className="text-xs font-semibold text-foreground">{a.nome}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{a.desc}</p>
                    {a.unlocked && a.date && (
                      <p className="mt-1 text-[10px] text-gold">Desbloqueada em {a.date}</p>
                    )}
                    {!a.unlocked && (
                      <p className="mt-1 text-[10px] text-muted-foreground/60">Bloqueada</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
