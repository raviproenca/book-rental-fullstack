import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Flame,
  Link as LinkIcon,
  LogOut,
  MessageSquare,
  Trophy,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import {
  useMyGroups,
  useGroupRankings,
  useGroupActivityFeed,
  useGroupSharedQuestions,
  useLeaveGroup,
} from "@/hooks/useGroups";
import { DashboardSkeleton, LeaderboardSkeleton } from "@/components/Skeletons";
import { GroupSharedQuestionCard } from "@/components/groups/GroupSharedQuestionCard";
import { toast } from "@/hooks/use-toast";
import { cn, nameInitials } from "@/lib/utils";
import type { GroupActivityEvent } from "@/types";

type Tab = "ranking" | "activity" | "questions";

function formatEvent(ev: GroupActivityEvent): {
  icon: LucideIcon;
  color: string;
  text: string;
} {
  const name = ev.userName;
  const payload = ev.payload as Record<string, unknown>;
  switch (ev.type) {
    case "session_completed": {
      const correct = Number(payload.correct ?? 0);
      const total = Number(payload.total ?? payload.questions ?? 0);
      return {
        icon: CheckCircle2,
        color: "text-gold",
        text: `${name} completou sessão: ${correct}/${total} corretas`,
      };
    }
    case "streak_milestone":
      return {
        icon: Flame,
        color: "text-orange-400",
        text: `${name} atingiu ${payload.days ?? 0} dias de streak!`,
      };
    case "achievement_unlocked":
      return {
        icon: Award,
        color: "text-purple-400",
        text: `${name} desbloqueou: ${payload.name ?? "conquista"}`,
      };
    case "joined_group":
      return {
        icon: UserPlus,
        color: "text-blue-400",
        text: `${name} entrou no grupo`,
      };
    case "question_shared":
      return {
        icon: MessageSquare,
        color: "text-gold",
        text: `${name} compartilhou uma questão`,
      };
  }
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("ranking");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const myGroups = useMyGroups();
  const rankings = useGroupRankings(id ?? "");
  const activity = useGroupActivityFeed(id ?? "");
  const questions = useGroupSharedQuestions(id ?? "");
  const leaveGroup = useLeaveGroup();

  const group = useMemo(
    () => myGroups.data?.find((g) => g.id === id),
    [myGroups.data, id]
  );

  function toggleExpand(sqId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(sqId)) next.delete(sqId);
      else next.add(sqId);
      return next;
    });
  }

  async function handleCopyInvite() {
    if (!group?.inviteCode) return;
    const url = `${window.location.origin}/grupos/entrar/${group.inviteCode}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copiado!" });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Copie manualmente: " + url,
        variant: "destructive",
      });
    }
  }

  async function handleLeave() {
    if (!group) return;
    if (!window.confirm("Tem certeza que deseja sair do grupo?")) return;
    try {
      await leaveGroup.mutateAsync(group.id);
      toast({ title: "Você saiu do grupo" });
      navigate("/grupos");
    } catch (err) {
      toast({
        title: "Erro ao sair",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    }
  }

  if (myGroups.isLoading) {
    return <DashboardSkeleton />;
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-[900px] px-6 py-10">
        <button
          type="button"
          onClick={() => navigate("/grupos")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Grupo não encontrado ou você não faz parte dele.
          </p>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: LucideIcon }[] = [
    { key: "ranking", label: "Ranking", icon: Trophy },
    { key: "activity", label: "Atividade", icon: Activity },
    { key: "questions", label: "Questões", icon: BookOpen },
  ];

  return (
    <div className="mx-auto max-w-[900px] space-y-6 px-6 py-10">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/grupos")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{group.avatarEmoji}</span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {group.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {group.memberCount ?? 0} membros
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {group.type === "private" && group.inviteCode && (
            <button
              type="button"
              onClick={handleCopyInvite}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <LinkIcon className="h-4 w-4" />
              Convidar
            </button>
          )}
          {group.myRole !== "owner" && (
            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === t.key
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "ranking" && (
            <>
              {rankings.isLoading ? (
                <LeaderboardSkeleton />
              ) : (rankings.data?.length ?? 0) === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Ninguém pontuou nesta semana ainda.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rankings.data!.map((member, idx) => (
                    <div
                      key={member.userId}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
                        member.isCurrentUser && "bg-gold/15 ring-1 ring-gold/40"
                      )}
                    >
                      <div className="w-8 text-center text-lg font-bold">
                        {idx === 0 ? (
                          "🥇"
                        ) : idx === 1 ? (
                          "🥈"
                        ) : idx === 2 ? (
                          "🥉"
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-foreground">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.nome}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          nameInitials(member.nome)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {member.nome}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Nível {member.nivel} · 🔥 {member.streak} dias
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gold">
                        {member.xpWeek} XP
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "activity" && (
            <>
              {(activity.data?.length ?? 0) === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade recente.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.data!.map((ev) => {
                    const { icon: Icon, color, text } = formatEvent(ev);
                    return (
                      <div
                        key={ev.id}
                        className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <Icon className={cn("mt-0.5 h-4 w-4", color)} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">{text}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(ev.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "questions" && (
            <>
              {(questions.data?.length ?? 0) === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma questão compartilhada ainda. Compartilhe questões
                    da sua sessão de prática usando o botão no post-answer.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.data!.map((sq) => (
                    <div
                      key={sq.id}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
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
                      {sq.message && (
                        <p className="mt-2 text-sm italic text-muted-foreground">
                          "{sq.message}"
                        </p>
                      )}
                      <p className="mt-3 line-clamp-3 text-sm text-foreground">
                        {sq.questionEnunciado}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleExpand(sq.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {sq.commentCount}{" "}
                        {sq.commentCount === 1 ? "comentário" : "comentários"}
                      </button>
                      {expanded.has(sq.id) && (
                        <div className="mt-3">
                          <GroupSharedQuestionCard sharedQuestion={sq} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
