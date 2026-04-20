import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, LogIn, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGroupByInviteCode, useJoinGroup } from "@/hooks/useGroups";
import { toast } from "@/hooks/use-toast";

interface JoinByCodeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function JoinByCodeModal({ open, onOpenChange }: JoinByCodeModalProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const query = useGroupByInviteCode(code);
  const joinGroup = useJoinGroup();

  if (!open) return null;

  function resetAndClose() {
    setCode("");
    onOpenChange(false);
  }

  async function handleJoin() {
    if (!query.data || joinGroup.isPending) return;
    const groupId = query.data.id;
    try {
      if (!query.data.myRole) {
        await joinGroup.mutateAsync(groupId);
      }
      toast({ title: "Entrou no grupo!" });
      resetAndClose();
      navigate(`/grupos/${groupId}`);
    } catch (err) {
      toast({
        title: "Erro ao entrar",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    }
  }

  const showPreview = code.length === 8;
  const group = query.data;
  const notFound = showPreview && !query.isLoading && !group;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={resetAndClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Entrar em grupo por código"
        className="relative z-10 mx-4 w-full max-w-md animate-scale-in rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <button
          onClick={resetAndClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-bold text-foreground">Entrar por código</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cole o código de convite de 8 caracteres.
        </p>

        <div className="mt-5">
          <input
            type="text"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\s/g, "").toUpperCase().slice(0, 8))
            }
            placeholder="XXXXXXXX"
            maxLength={8}
            autoFocus
            className="h-14 w-full rounded-lg border border-border bg-background text-center font-mono-stats text-2xl font-bold uppercase tracking-[0.4em] text-foreground outline-none transition-colors placeholder:text-muted-foreground/30 focus:border-gold/50"
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mt-4">
            {query.isLoading ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-secondary" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-secondary" />
                </div>
              </div>
            ) : group ? (
              <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-gold-muted p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-xl">
                  {group.avatarEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {group.name}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {group.memberCount ?? 0}{" "}
                    {group.memberCount === 1 ? "membro" : "membros"}
                  </p>
                </div>
              </div>
            ) : notFound ? (
              <p className="text-center text-sm text-destructive">
                Código não encontrado. Confira se está correto.
              </p>
            ) : null}
          </div>
        )}

        <button
          type="button"
          onClick={handleJoin}
          disabled={!group || joinGroup.isPending}
          className={cn(
            "mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover",
            (!group || joinGroup.isPending) &&
              "cursor-not-allowed opacity-40 shadow-none"
          )}
        >
          <LogIn className="h-4 w-4" />
          {joinGroup.isPending ? "Entrando..." : "Entrar no grupo"}
        </button>
      </div>
    </div>
  );
}
