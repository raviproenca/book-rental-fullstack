import { supabase } from "@/lib/supabase";
import type { PracticeSession, PracticeConfig } from "@/types";

async function currentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

export async function getSessionHistory(): Promise<PracticeSession[]> {
  const userId = await currentUserId();

  const { data: sessions, error } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  if (!sessions || sessions.length === 0) return [];

  const discIds = [...new Set(sessions.flatMap((s) => s.discipline_ids))];
  const { data: disciplines } = await supabase
    .from("disciplines")
    .select("id, nome")
    .in("id", discIds);

  const discMap = new Map<number, string>();
  for (const d of disciplines ?? []) discMap.set(d.id, d.nome);

  return sessions.map((s) => {
    const discName =
      s.discipline_ids.length === 1
        ? discMap.get(s.discipline_ids[0]) ?? "Prática"
        : s.mode === "simulado"
          ? "Simulado Geral"
          : `${s.discipline_ids.length} disciplinas`;

    const total = s.correct + s.wrong + s.blank;
    const acerto = total > 0 ? Math.round((s.correct / total) * 100) : 0;

    const mins = Math.floor(s.time_seconds / 60);
    const duracao =
      mins >= 60 ? `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, "0")}` : `${mins}min`;

    const started = new Date(s.started_at);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - started.getTime()) / 86_400_000,
    );

    let dateStr: string;
    if (diffDays === 0) {
      dateStr = `Hoje, ${started.getHours()}:${String(started.getMinutes()).padStart(2, "0")}`;
    } else if (diffDays === 1) {
      dateStr = `Ontem, ${started.getHours()}:${String(started.getMinutes()).padStart(2, "0")}`;
    } else {
      dateStr = `${String(started.getDate()).padStart(2, "0")}/${String(started.getMonth() + 1).padStart(2, "0")}, ${started.getHours()}:${String(started.getMinutes()).padStart(2, "0")}`;
    }

    return {
      date: dateStr,
      disciplina: discName,
      questoes: s.num_questions,
      acerto,
      duracao,
    };
  });
}

export async function getSessionById(
  id: number,
): Promise<PracticeSession | undefined> {
  const { data: s, error } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !s) return undefined;

  const discId = s.discipline_ids[0];
  const { data: disc } = discId
    ? await supabase
        .from("disciplines")
        .select("nome")
        .eq("id", discId)
        .single()
    : { data: null };

  const total = s.correct + s.wrong + s.blank;
  const acerto = total > 0 ? Math.round((s.correct / total) * 100) : 0;
  const mins = Math.floor(s.time_seconds / 60);
  const duracao =
    mins >= 60 ? `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, "0")}` : `${mins}min`;

  const started = new Date(s.started_at);
  const dateStr = `${String(started.getDate()).padStart(2, "0")}/${String(started.getMonth() + 1).padStart(2, "0")}, ${started.getHours()}:${String(started.getMinutes()).padStart(2, "0")}`;

  return {
    date: dateStr,
    disciplina: disc?.nome ?? "Prática",
    questoes: s.num_questions,
    acerto,
    duracao,
  };
}

export async function createSession(
  config: PracticeConfig,
): Promise<{ id: string }> {
  const userId = await currentUserId();

  const discNames = config.disciplinas;
  const { data: discs } = await supabase
    .from("disciplines")
    .select("id")
    .in("nome", discNames);

  const topicNames = Object.values(config.temas).flat();
  const { data: topics } = await supabase
    .from("topics")
    .select("id")
    .in("nome", topicNames);

  const { data: session, error } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: userId,
      mode: config.mode as "pratica" | "simulado" | "revisao",
      discipline_ids: (discs ?? []).map((d) => d.id),
      topic_ids: (topics ?? []).map((t) => t.id),
      dificuldades: config.dificuldades,
      num_questions: config.numQuestions,
      status: "em_andamento",
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: String(session!.id) };
}
