import { supabase } from "@/lib/supabase";
import type {
  ReviewQuestion,
  UpcomingDay,
  UpcomingReview,
  SRSRating,
} from "@/types";

async function currentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

export async function getUpcomingDays(): Promise<UpcomingDay[]> {
  const userId = await currentUserId();
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Count questions user got wrong, grouped by day, for the next 7 days.
  // Without a dedicated SRS table, we estimate review load from recent wrong answers.
  const { data: wrongAnswers } = await supabase
    .from("session_answers")
    .select("question_id, created_at")
    .eq("user_id", userId)
    .eq("status", "errou")
    .order("created_at", { ascending: false })
    .limit(200);

  const uniqueQuestionIds = new Set<number>();
  for (const a of wrongAnswers ?? []) {
    uniqueQuestionIds.add(a.question_id);
  }

  const totalToReview = uniqueQuestionIds.size;
  const perDay = Math.ceil(totalToReview / 7);

  const result: UpcomingDay[] = [];
  const today = new Date();
  let remaining = totalToReview;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const count = Math.min(perDay, remaining);
    remaining -= count;

    result.push({
      day: dayNames[d.getDay()],
      date: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      count,
      isToday: i === 0 ? true : undefined,
    });
  }

  return result;
}

export async function getReviewQuestions(): Promise<ReviewQuestion[]> {
  const userId = await currentUserId();

  // Get questions user got wrong recently
  const { data: wrongAnswers } = await supabase
    .from("session_answers")
    .select("question_id, created_at")
    .eq("user_id", userId)
    .eq("status", "errou")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!wrongAnswers || wrongAnswers.length === 0) return [];

  const uniqueIds = [...new Set(wrongAnswers.map((a) => a.question_id))].slice(
    0,
    10,
  );

  const { data: questions } = await supabase
    .from("questions_full")
    .select("*")
    .in("id", uniqueIds);

  if (!questions || questions.length === 0) return [];

  const { data: alts } = await supabase
    .from("alternatives")
    .select("*")
    .in("question_id", uniqueIds)
    .order("ordem");

  const altsByQ = new Map<number, (typeof alts extends (infer T)[] | null ? T : never)[]>();
  for (const a of alts ?? []) {
    const list = altsByQ.get(a.question_id) ?? [];
    list.push(a);
    altsByQ.set(a.question_id, list);
  }

  // Count how many times each question was answered
  const answerCounts = new Map<number, { count: number; lastDate: string }>();
  for (const a of wrongAnswers) {
    const existing = answerCounts.get(a.question_id);
    if (!existing) {
      answerCounts.set(a.question_id, { count: 1, lastDate: a.created_at });
    } else {
      existing.count++;
    }
  }

  return questions.map((q) => {
    const qAlts = altsByQ.get(q.id!) ?? [];
    const correctAlt = qAlts.find((a) => a.is_correct);
    const stats = answerCounts.get(q.id!);

    return {
      id: q.id!,
      enunciado: q.enunciado ?? "",
      pergunta: q.pergunta ?? "",
      alternativas: qAlts.map((a) => ({ letra: a.letra, texto: a.texto })),
      correta: correctAlt?.letra ?? "",
      comentario: q.comentario ?? "",
      disciplina: q.disciplina ?? "",
      tema: q.tema ?? "",
      dificuldade: q.dificuldade ?? "Médio",
      estatistica: q.estatistica ?? 0,
      revisoes: stats?.count ?? 1,
      ultimaRevisao: stats?.lastDate?.split("T")[0] ?? "",
    };
  });
}

export async function getUpcomingReviews(): Promise<UpcomingReview[]> {
  const userId = await currentUserId();

  const { data: wrongAnswers } = await supabase
    .from("session_answers")
    .select("question_id, created_at")
    .eq("user_id", userId)
    .eq("status", "errou")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!wrongAnswers || wrongAnswers.length === 0) return [];

  const uniqueMap = new Map<
    number,
    { count: number; lastDate: string }
  >();
  for (const a of wrongAnswers) {
    const existing = uniqueMap.get(a.question_id);
    if (!existing) {
      uniqueMap.set(a.question_id, { count: 1, lastDate: a.created_at });
    } else {
      existing.count++;
    }
  }

  const questionIds = [...uniqueMap.keys()].slice(0, 10);

  const { data: questions } = await supabase
    .from("questions_full")
    .select("id, enunciado, disciplina")
    .in("id", questionIds);

  const today = new Date();

  return (questions ?? []).map((q) => {
    const info = uniqueMap.get(q.id!);
    const lastDate = info ? new Date(info.lastDate) : today;
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + (info?.count ?? 1) * 2);

    return {
      trecho: (q.enunciado ?? "").slice(0, 60) + "...",
      disciplina: q.disciplina ?? "",
      ultimaRevisao: lastDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      proximaRevisao: nextDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      nRevisoes: info?.count ?? 1,
    };
  });
}

export async function submitReviewRating(
  _questionId: number,
  _rating: SRSRating,
): Promise<{ nextReview: string }> {
  // Full SRS scheduling requires a dedicated DB table (e.g. user_srs_cards).
  // For now, return a placeholder next review date.
  const next = new Date();
  next.setDate(next.getDate() + 7);
  return { nextReview: next.toISOString().split("T")[0] };
}
