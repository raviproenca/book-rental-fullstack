import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play } from "lucide-react";
import { useSimuladoSession } from "@/hooks/useSimuladoSession";
import { QuestionReviewList } from "@/components/simulado/QuestionReviewList";
import type { ReviewQuestion } from "@/components/simulado/QuestionReviewList";
import { computeTemaPerf, formatTime, scoreColorClass, secondsToHumanShort } from "@/lib/simuladoUtils";
import { DashboardSkeleton } from "@/components/Skeletons";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

function useQuestionsByIds(ids: number[]) {
  return useQuery({
    queryKey: ["questions-by-ids", ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data: qRows, error: qErr } = await supabase
        .from("questions")
        .select("id, enunciado, topic_id")
        .in("id", ids);
      if (qErr) throw qErr;

      const { data: alts, error: altErr } = await supabase
        .from("alternatives")
        .select("*")
        .in("question_id", ids)
        .order("ordem");
      if (altErr) throw altErr;

      const { data: topics } = await supabase
        .from("topics")
        .select("id, nome")
        .in("id", (qRows ?? []).map((q) => q.topic_id));
      const topicMap = new Map((topics ?? []).map((t) => [t.id, t.nome]));

      const altsByQ = new Map<number, { letra: string; texto: string; is_correct: boolean }[]>();
      for (const a of alts ?? []) {
        const list = altsByQ.get(a.question_id) ?? [];
        list.push(a);
        altsByQ.set(a.question_id, list);
      }

      return (qRows ?? []).map((q) => {
        const qAlts = altsByQ.get(q.id) ?? [];
        const correctAlt = qAlts.find((a) => a.is_correct);
        return {
          id: q.id,
          enunciado: q.enunciado as string,
          tema: topicMap.get(q.topic_id) ?? "",
          alternativas: qAlts.map((a) => ({ letra: a.letra, texto: a.texto })),
          correta: correctAlt?.letra ?? "A",
        };
      });
    },
    enabled: ids.length > 0,
  });
}

export default function SimuladoResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading: isSessionLoading } = useSimuladoSession(id);
  const { data: fetchedQuestions, isLoading: isQLoading } = useQuestionsByIds(session?.questionIds ?? []);

  const temaPerf = useMemo(() => {
    if (!fetchedQuestions || !session) return [];
    const qs = fetchedQuestions.map((q) => ({ dbId: q.id, tema: q.tema, correta: q.correta }));
    return computeTemaPerf(qs, session.answers);
  }, [fetchedQuestions, session]);

  const reviewQuestions: ReviewQuestion[] = useMemo(() => {
    if (!fetchedQuestions || !session) return [];
    return session.questionIds.map((dbId, i) => {
      const fq = fetchedQuestions.find((q) => q.id === dbId);
      return {
        dbId,
        displayId: i + 1,
        tema: fq?.tema ?? "",
        enunciado: fq?.enunciado ?? "",
        alternativas: fq?.alternativas ?? [],
        correta: fq?.correta ?? "",
        userAnswer: session.answers[String(dbId)] ?? null,
      };
    });
  }, [fetchedQuestions, session]);

  const createdDate = session
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(session.createdAt))
    : "";

  const feedbackMsg =
    !session ? "" :
    session.score >= 70 ? "Parabéns! 🎉" :
    session.score >= 50 ? "Bom trabalho! 💪" :
    "Continue praticando! 📚";

  if (isSessionLoading || isQLoading) return <DashboardSkeleton />;
  if (!session) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Sessão não encontrada.</p>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-6 backdrop-blur-md">
        <button type="button" onClick={() => navigate("/simulados")}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />
          Simulados
        </button>
        <span className="text-muted-foreground/40">|</span>
        <span className="text-sm font-bold text-foreground">Resultado — {session.disciplina}</span>
        <span className="ml-auto text-xs text-muted-foreground">{createdDate} · {secondsToHumanShort(session.timeUsedSec)}</span>
      </header>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

        {/* LEFT: Score panel */}
        <div className="lg:w-[400px] lg:shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card/30 p-6 lg:p-8 flex flex-col gap-5 lg:overflow-y-auto">

          {/* Score hero */}
          <div className="text-center py-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={cn("h-32 w-32 rounded-full border-[6px] opacity-10", scoreColorClass(session.score).replace("text-", "border-"))} />
              </div>
              <p className={cn("relative font-mono-stats text-7xl font-black leading-none", scoreColorClass(session.score))}>
                {session.score}%
              </p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{session.correct} de {session.questionIds.length} acertos</p>
            <p className={cn("mt-1 text-sm font-semibold", scoreColorClass(session.score))}>{feedbackMsg}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "acertos", value: String(session.correct), color: "text-success bg-success/5 border-success/20" },
              { label: "erros", value: String(session.wrong), color: "text-destructive bg-destructive/5 border-destructive/20" },
              { label: "em branco", value: String(session.blank), color: "text-muted-foreground bg-secondary/30 border-border" },
              { label: "tempo usado", value: formatTime(session.timeUsedSec), color: "text-foreground bg-secondary/30 border-border" },
            ].map(({ label, value, color }) => (
              <div key={label} className={cn("rounded-xl border p-3 text-center", color)}>
                <p className="font-mono-stats text-xl font-black">{value}</p>
                <p className="text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tema bars */}
          {temaPerf.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Por tema</p>
              {temaPerf.map((t) => (
                <div key={t.tema} className="flex items-center gap-2">
                  <span className="w-28 md:w-32 shrink-0 truncate text-[11px] text-muted-foreground">{t.tema}</span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700",
                        t.pct >= 70 ? "bg-success" : t.pct >= 50 ? "bg-warning" : "bg-destructive")}
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                  <span className={cn("w-8 text-right font-mono-stats text-xs font-bold", scoreColorClass(t.pct))}>
                    {t.pct}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              onClick={() => navigate("/simulados/novo", { state: { disciplina: session.disciplina } })}
              className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover transition-colors"
            >
              <Play className="h-4 w-4" />
              Refazer este Simulado
            </button>
            <button
              type="button"
              onClick={() => navigate("/simulados")}
              className="flex w-full h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              ← Voltar ao Hub
            </button>
          </div>
        </div>

        {/* RIGHT: Question review */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="flex items-baseline justify-between gap-2 mb-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-semibold text-foreground">Revisão de questões</h2>
              <span className="text-xs text-muted-foreground">clique para expandir</span>
            </div>
            <span className="font-mono-stats text-xs text-muted-foreground">{reviewQuestions.length} questões</span>
          </div>
          <QuestionReviewList questions={reviewQuestions} />
        </div>

      </div>
    </div>
  );
}
