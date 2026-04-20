import { useState, type KeyboardEvent } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import { cn, nameInitials } from "@/lib/utils";
import { useGroupComments, useAddComment } from "@/hooks/useGroups";
import { toast } from "@/hooks/use-toast";
import type { GroupSharedQuestion } from "@/types";

interface GroupSharedQuestionCardProps {
  sharedQuestion: GroupSharedQuestion;
}

export function GroupSharedQuestionCard({
  sharedQuestion: sq,
}: GroupSharedQuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");

  const comments = useGroupComments(expanded ? sq.id : "");
  const addComment = useAddComment();

  async function handleSend() {
    const text = draft.trim();
    if (!text || addComment.isPending) return;
    try {
      await addComment.mutateAsync({
        sharedQuestionId: sq.id,
        content: text,
      });
      setDraft("");
    } catch (err) {
      toast({
        title: "Erro ao comentar",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-foreground">
          {sq.userAvatar ? (
            <img
              src={sq.userAvatar}
              alt={sq.userName}
              className="h-full w-full object-cover"
            />
          ) : (
            nameInitials(sq.userName)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {sq.userName}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(sq.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>
      </div>

      {/* Message */}
      {sq.message && (
        <p className="mt-2 text-sm italic text-muted-foreground">
          "{sq.message}"
        </p>
      )}

      {/* Enunciado */}
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground">
        {sq.questionEnunciado}
      </p>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {sq.commentCount}{" "}
        {sq.commentCount === 1 ? "comentário" : "comentários"}
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Comments */}
      {expanded && (
        <div className="mt-3 border-t border-border pt-3">
          {comments.isLoading ? (
            <p className="text-center text-xs text-muted-foreground">
              Carregando comentários...
            </p>
          ) : (comments.data?.length ?? 0) === 0 ? (
            <p className="text-center text-xs text-muted-foreground">
              Seja o primeiro a comentar.
            </p>
          ) : (
            <div className="space-y-3">
              {comments.data!.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "flex flex-col gap-1",
                    c.isCurrentUser ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-secondary text-[9px] font-semibold text-foreground">
                      {c.userAvatar ? (
                        <img
                          src={c.userAvatar}
                          alt={c.userName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        nameInitials(c.userName)
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {c.userName}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-1.5 text-sm leading-snug",
                      c.isCurrentUser
                        ? "rounded-br-sm bg-gold text-background"
                        : "rounded-bl-sm border border-border bg-card text-foreground"
                    )}
                  >
                    {c.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva um comentário..."
              className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim() || addComment.isPending}
              aria-label="Enviar comentário"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-background transition-colors hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
