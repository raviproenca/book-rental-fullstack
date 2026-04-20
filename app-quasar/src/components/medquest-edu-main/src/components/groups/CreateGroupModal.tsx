import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Lock, Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateGroup } from "@/hooks/useGroups";
import { toast } from "@/hooks/use-toast";
import type { GroupType } from "@/types";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const EMOJIS = ["🧠", "🩺", "💊", "🔬", "🫀", "🦷", "👁️", "🧬", "⚕️", "📚", "🏆", "🔥"];

export function CreateGroupModal({ open, onOpenChange }: CreateGroupModalProps) {
  const navigate = useNavigate();
  const createGroup = useCreateGroup();

  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GroupType>("private");

  if (!open) return null;

  function resetAndClose() {
    setEmoji(EMOJIS[0]);
    setName("");
    setDescription("");
    setType("private");
    onOpenChange(false);
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (trimmed.length < 3 || createGroup.isPending) return;
    try {
      const group = await createGroup.mutateAsync({
        name: trimmed,
        description: description.trim() || undefined,
        avatarEmoji: emoji,
        type,
      });
      toast({ title: "Grupo criado!" });
      resetAndClose();
      navigate(`/grupos/${group.id}`);
    } catch (err) {
      toast({
        title: "Erro ao criar grupo",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    }
  }

  const nameTooShort = name.trim().length < 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={resetAndClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Criar grupo"
        className="relative z-10 mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto animate-scale-in rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <button
          onClick={resetAndClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-bold text-foreground">Criar grupo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Estude junto, rankeie semanalmente e compartilhe questões.
        </p>

        {/* Emoji picker */}
        <div className="mt-5">
          <label className="text-xs font-medium text-muted-foreground">Ícone</label>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors",
                  emoji === e
                    ? "border-gold/50 bg-gold-muted"
                    : "border-border bg-secondary/50 hover:bg-secondary"
                )}
                aria-label={`Emoji ${e}`}
                aria-pressed={emoji === e}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mt-4">
          <label htmlFor="group-name" className="text-xs font-medium text-muted-foreground">
            Nome do grupo
          </label>
          <input
            id="group-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 60))}
            placeholder="Ex: Turma 2024 — Anatomia"
            maxLength={60}
            className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/50"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>Mínimo 3 caracteres</span>
            <span className="font-mono-stats">{name.length}/60</span>
          </div>
        </div>

        {/* Description */}
        <div className="mt-3">
          <label htmlFor="group-desc" className="text-xs font-medium text-muted-foreground">
            Descrição <span className="text-muted-foreground/60">(opcional)</span>
          </label>
          <textarea
            id="group-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 280))}
            placeholder="Sobre o que é o grupo?"
            maxLength={280}
            rows={3}
            className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/50"
          />
          <div className="mt-1 flex justify-end text-[11px] text-muted-foreground">
            <span className="font-mono-stats">{description.length}/280</span>
          </div>
        </div>

        {/* Visibility */}
        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">Visibilidade</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("private")}
              aria-pressed={type === "private"}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                type === "private"
                  ? "border-gold/40 bg-gold-muted"
                  : "border-border bg-secondary/30 hover:bg-secondary/60"
              )}
            >
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Lock className="h-3.5 w-3.5" />
                Privado
              </div>
              <span className="text-[11px] leading-snug text-muted-foreground">
                Somente via link de convite
              </span>
            </button>
            <button
              type="button"
              onClick={() => setType("public")}
              aria-pressed={type === "public"}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                type === "public"
                  ? "border-gold/40 bg-gold-muted"
                  : "border-border bg-secondary/30 hover:bg-secondary/60"
              )}
            >
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Globe className="h-3.5 w-3.5" />
                Público
              </div>
              <span className="text-[11px] leading-snug text-muted-foreground">
                Qualquer um pode entrar
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={nameTooShort || createGroup.isPending}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Users className="h-4 w-4" />
          {createGroup.isPending ? "Criando..." : "Criar grupo"}
        </button>
      </div>
    </div>
  );
}
