import { supabase } from "@/lib/supabase";
import type {
  UserStats,
  EvolutionDataPoint,
  DisciplinePerformance,
  HeatmapDataPoint,
  WeakTopic,
  SimuladoHistory,
} from "@/types";

async function currentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h${String(m).padStart(2, "0")}`;
}

/* ─── Stats by period ─── */

async function computeStats(
  userId: string,
  since: Date | null,
): Promise<UserStats> {
  let answersQuery = supabase
    .from("session_answers")
    .select("status, time_seconds, created_at")
    .eq("user_id", userId);

  if (since) {
    answersQuery = answersQuery.gte("created_at", since.toISOString());
  }

  const { data: answers } = await answersQuery;
  const list = answers ?? [];

  const questoes = list.length;
  const correct = list.filter((a) => a.status === "acertou").length;
  const acerto = questoes > 0 ? Math.round((correct / questoes) * 100) : 0;
  const totalSecs = list.reduce((sum, a) => sum + a.time_seconds, 0);

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak")
    .eq("id", userId)
    .single();

  return {
    questoes,
    delta: `+${questoes}`,
    acerto,
    acertoDelta: "—",
    streak: profile?.streak ?? 0,
    tempo: formatHours(totalSecs),
  };
}

export async function getPerformanceStats(period: string): Promise<UserStats> {
  const userId = await currentUserId();
  const now = new Date();
  let since: Date | null = null;

  if (period === "7 dias") {
    since = new Date(now.getTime() - 7 * 86_400_000);
  } else if (period === "30 dias") {
    since = new Date(now.getTime() - 30 * 86_400_000);
  } else if (period === "90 dias") {
    since = new Date(now.getTime() - 90 * 86_400_000);
  }

  return computeStats(userId, since);
}

export async function getAllPerformanceStats(): Promise<
  Record<string, UserStats>
> {
  const userId = await currentUserId();
  const now = new Date();

  const [s7, s30, s90, sAll] = await Promise.all([
    computeStats(userId, new Date(now.getTime() - 7 * 86_400_000)),
    computeStats(userId, new Date(now.getTime() - 30 * 86_400_000)),
    computeStats(userId, new Date(now.getTime() - 90 * 86_400_000)),
    computeStats(userId, null),
  ]);

  return {
    "7 dias": s7,
    "30 dias": s30,
    "90 dias": s90,
    Tudo: sAll,
  };
}

/* ─── Evolution chart ─── */

export async function getEvolutionData(): Promise<EvolutionDataPoint[]> {
  const userId = await currentUserId();
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const { data: answers } = await supabase
    .from("session_answers")
    .select("status, created_at")
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());

  const result: EvolutionDataPoint[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const dayStr = d.toISOString().split("T")[0];

    const dayAnswers = (answers ?? []).filter((a) =>
      a.created_at.startsWith(dayStr),
    );
    const total = dayAnswers.length;
    const correct = dayAnswers.filter((a) => a.status === "acertou").length;

    result.push({
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      questoes: total,
      acerto: total > 0 ? Math.round((correct / total) * 100) : 0,
      meta: 20,
    });
  }

  return result;
}

/* ─── Discipline performance ─── */

export async function getDisciplinePerformance(): Promise<{
  data: DisciplinePerformance[];
  mediaGeral: number;
}> {
  const userId = await currentUserId();

  const { data: answers } = await supabase
    .from("session_answers")
    .select("question_id, status")
    .eq("user_id", userId);

  if (!answers || answers.length === 0) {
    return { data: [], mediaGeral: 0 };
  }

  const questionIds = [...new Set(answers.map((a) => a.question_id))];
  const { data: questions } = await supabase
    .from("questions_full")
    .select("id, disciplina")
    .in("id", questionIds);

  const qDiscMap = new Map<number, string>();
  for (const q of questions ?? []) {
    if (q.id && q.disciplina) qDiscMap.set(q.id, q.disciplina);
  }

  const stats = new Map<string, { correct: number; total: number }>();
  let totalCorrect = 0;
  let totalAll = 0;

  for (const a of answers) {
    const disc = qDiscMap.get(a.question_id);
    if (!disc) continue;
    const s = stats.get(disc) ?? { correct: 0, total: 0 };
    s.total++;
    totalAll++;
    if (a.status === "acertou") {
      s.correct++;
      totalCorrect++;
    }
    stats.set(disc, s);
  }

  const data: DisciplinePerformance[] = [...stats.entries()]
    .map(([name, s]) => ({
      name,
      acerto: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      feitas: s.total,
    }))
    .sort((a, b) => a.acerto - b.acerto);

  const mediaGeral =
    totalAll > 0 ? Math.round((totalCorrect / totalAll) * 100) : 0;

  return { data, mediaGeral };
}

/* ─── Heatmap ─── */

export async function getHeatmapData(): Promise<HeatmapDataPoint[]> {
  const userId = await currentUserId();
  const since = new Date();
  since.setDate(since.getDate() - 90);
  since.setHours(0, 0, 0, 0);

  const { data: answers } = await supabase
    .from("session_answers")
    .select("status, created_at")
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());

  const result: HeatmapDataPoint[] = [];

  for (let i = 0; i < 91; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const dayStr = d.toISOString().split("T")[0];

    const dayAnswers = (answers ?? []).filter((a) =>
      a.created_at.startsWith(dayStr),
    );
    const total = dayAnswers.length;
    const correct = dayAnswers.filter((a) => a.status === "acertou").length;

    result.push({
      date: new Date(d),
      questoes: total,
      acerto: total > 0 ? Math.round((correct / total) * 100) : 0,
    });
  }

  return result;
}

/* ─── Weak topics ─── */

export async function getWeakTopics(): Promise<WeakTopic[]> {
  const userId = await currentUserId();

  const { data: answers } = await supabase
    .from("session_answers")
    .select("question_id, status")
    .eq("user_id", userId);

  if (!answers || answers.length === 0) return [];

  const questionIds = [...new Set(answers.map((a) => a.question_id))];
  const { data: questions } = await supabase
    .from("questions_full")
    .select("id, disciplina, tema")
    .in("id", questionIds);

  const qMap = new Map<number, { disciplina: string; tema: string }>();
  for (const q of questions ?? []) {
    if (q.id && q.disciplina && q.tema)
      qMap.set(q.id, { disciplina: q.disciplina, tema: q.tema });
  }

  const stats = new Map<
    string,
    { tema: string; disciplina: string; correct: number; total: number }
  >();

  for (const a of answers) {
    const info = qMap.get(a.question_id);
    if (!info) continue;
    const key = `${info.disciplina}|${info.tema}`;
    const s = stats.get(key) ?? {
      tema: info.tema,
      disciplina: info.disciplina,
      correct: 0,
      total: 0,
    };
    s.total++;
    if (a.status === "acertou") s.correct++;
    stats.set(key, s);
  }

  return [...stats.values()]
    .filter((s) => s.total >= 5)
    .map((s) => ({
      tema: s.tema,
      disciplina: s.disciplina,
      acerto: Math.round((s.correct / s.total) * 100),
      feitas: s.total,
    }))
    .sort((a, b) => a.acerto - b.acerto)
    .slice(0, 5);
}

/* ─── Simulado history ─── */

export async function getSimuladoHistory(): Promise<SimuladoHistory[]> {
  const userId = await currentUserId();

  const { data: sessions, error } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("mode", "simulado")
    .eq("status", "finalizada")
    .order("finished_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  return (sessions ?? []).map((s) => {
    const total = s.correct + s.wrong + s.blank;
    const nota = total > 0 ? Math.round((s.correct / total) * 100) : 0;
    const mins = Math.floor(s.time_seconds / 60);
    const tempo =
      mins >= 60
        ? `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, "0")}`
        : `${mins}min`;

    const finished = s.finished_at ? new Date(s.finished_at) : new Date(s.started_at);

    return {
      id: s.id,
      date: finished.toLocaleDateString("pt-BR"),
      nota,
      questoes: s.num_questions,
      tempo,
    };
  });
}
