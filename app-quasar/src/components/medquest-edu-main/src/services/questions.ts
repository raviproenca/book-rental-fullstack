import { supabase } from "@/lib/supabase";
import type {
  Question,
  SimuladoQuestion,
  DisciplineData,
  PracticeConfig,
} from "@/types";

/* ─── Practice Questions ─── */

type QuestionsFullRow = {
  id: number | null;
  disciplina: string | null;
  dificuldade: string | null;
  tema: string | null;
  subtema: string | null;
  enunciado: string | null;
  pergunta: string | null;
  comentario: string | null;
  explicacoes: unknown;
  estatistica: number | null;
};

async function mapQuestionFullRowsToQuestions(
  rows: QuestionsFullRow[],
): Promise<Question[]> {
  if (rows.length === 0) return [];

  const questionIds = rows.map((r) => r.id!);
  const { data: alts } = await supabase
    .from("alternatives")
    .select("*")
    .in("question_id", questionIds)
    .order("ordem");

  const altsByQ = new Map<number, typeof alts>();
  for (const a of alts ?? []) {
    const list = altsByQ.get(a.question_id) ?? [];
    list.push(a);
    altsByQ.set(a.question_id, list);
  }

  return rows.map((q) => {
    const qAlts = altsByQ.get(q.id!) ?? [];
    const correctAlt = qAlts.find((a) => a.is_correct);

    const explicacoes: Record<string, string> = {};
    const expJson = q.explicacoes as Record<string, string> | null;
    if (expJson) {
      for (const [key, val] of Object.entries(expJson)) {
        explicacoes[key] = val ?? "";
      }
    }

    return {
      id: q.id!,
      disciplina: q.disciplina ?? "",
      dificuldade: (q.dificuldade ?? "Médio") as Question["dificuldade"],
      tema: q.tema ?? "",
      subtema: q.subtema ?? undefined,
      enunciado: q.enunciado ?? "",
      pergunta: q.pergunta ?? "",
      alternativas: qAlts.map((a) => ({ letra: a.letra, texto: a.texto })),
      correta: correctAlt?.letra ?? "",
      comentario: q.comentario ?? "",
      explicacoes,
      estatistica: q.estatistica ?? 0,
    };
  });
}

export async function getQuestions(
  config?: PracticeConfig,
): Promise<Question[]> {
  if (config?.questionIds?.length) {
    const ids = config.questionIds;
    const { data: rows, error } = await supabase
      .from("questions_full")
      .select("*")
      .eq("status", "publicada")
      .in("id", ids)
      .limit(ids.length);

    if (error) throw error;
    if (!rows || rows.length === 0) return [];

    const questions = await mapQuestionFullRowsToQuestions(rows as QuestionsFullRow[]);
    const byId = new Map(questions.map((q) => [q.id, q]));
    return ids
      .map((id) => byId.get(id))
      .filter((q): q is Question => q !== undefined);
  }

  const needsHistory =
    config?.status === "nao_respondidas" ||
    config?.status === "erradas" ||
    config?.status === "acertadas" ||
    config?.mode === "revisao";

  let restrictIds: number[] | null = null;
  let excludeIds: number[] | null = null;

  if (needsHistory) {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    const userId = userData.user?.id;
    if (!userId) return [];

    const wantStatus: "errou" | "acertou" | null =
      config?.status === "erradas" || config?.mode === "revisao"
        ? "errou"
        : config?.status === "acertadas"
          ? "acertou"
          : null;

    if (wantStatus) {
      const { data: rows, error } = await supabase
        .from("session_answers")
        .select("question_id")
        .eq("user_id", userId)
        .eq("status", wantStatus);
      if (error) throw error;
      const ids = [...new Set((rows ?? []).map((r) => r.question_id))];
      if (ids.length === 0) return [];
      restrictIds = ids;
    } else if (config?.status === "nao_respondidas") {
      const { data: rows, error } = await supabase
        .from("session_answers")
        .select("question_id")
        .eq("user_id", userId);
      if (error) throw error;
      excludeIds = [...new Set((rows ?? []).map((r) => r.question_id))];
    }
  }

  let query = supabase
    .from("questions_full")
    .select("*")
    .eq("status", "publicada");

  if (config?.disciplinas?.length) {
    query = query.in("disciplina", config.disciplinas);
  }
  const allTemas = Object.values(config?.temas ?? {}).flat();
  if (allTemas.length) {
    query = query.in("tema", allTemas);
  }
  if (config?.dificuldades?.length) {
    query = query.in("dificuldade", config.dificuldades);
  }
  if (restrictIds) {
    query = query.in("id", restrictIds);
  }
  if (excludeIds && excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }
  query = query.limit(config?.numQuestions ?? 50);

  const { data: rows, error } = await query;

  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  return mapQuestionFullRowsToQuestions(rows as QuestionsFullRow[]);
}

export async function getQuestionById(
  id: number,
): Promise<Question | undefined> {
  const { data: q, error } = await supabase
    .from("questions_full")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !q) return undefined;

  const { data: alts } = await supabase
    .from("alternatives")
    .select("*")
    .eq("question_id", id)
    .order("ordem");

  const qAlts = alts ?? [];
  const correctAlt = qAlts.find((a) => a.is_correct);

  const explicacoes: Record<string, string> = {};
  const expJson = q.explicacoes as Record<string, string> | null;
  if (expJson) {
    for (const [key, val] of Object.entries(expJson)) {
      explicacoes[key] = val ?? "";
    }
  }

  return {
    id: q.id!,
    disciplina: q.disciplina ?? "",
    dificuldade: q.dificuldade ?? "Médio",
    tema: q.tema ?? "",
    subtema: q.subtema ?? undefined,
    enunciado: q.enunciado ?? "",
    pergunta: q.pergunta ?? "",
    alternativas: qAlts.map((a) => ({ letra: a.letra, texto: a.texto })),
    correta: correctAlt?.letra ?? "",
    comentario: q.comentario ?? "",
    explicacoes,
    estatistica: q.estatistica ?? 0,
  };
}

export async function submitAnswer(
  questionId: number,
  answer: string,
): Promise<{ correct: boolean; correctAnswer: string }> {
  const { data: correctAlt } = await supabase
    .from("alternatives")
    .select("letra")
    .eq("question_id", questionId)
    .eq("is_correct", true)
    .single();

  const correctAnswer = correctAlt?.letra ?? "";
  return {
    correct: correctAnswer === answer,
    correctAnswer,
  };
}

/* ─── Disciplines Config ─── */

/** Disciplina → temas derived from published rows in questions_full (RLS-aligned fallback). */
async function getSimuladoDisciplinasFromQuestionsFull(): Promise<
  Record<string, string[]>
> {
  const { data, error } = await supabase
    .from("questions_full")
    .select("disciplina, tema")
    .eq("status", "publicada")
    .limit(8000);

  if (error) throw error;

  const map = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    const d = row.disciplina?.trim();
    const t = row.tema?.trim();
    if (!d || !t) continue;
    let set = map.get(d);
    if (!set) {
      set = new Set();
      map.set(d, set);
    }
    set.add(t);
  }

  const result: Record<string, string[]> = {};
  const sortedKeys = [...map.keys()].sort((a, b) => a.localeCompare(b, "pt-BR"));
  for (const k of sortedKeys) {
    result[k] = [...map.get(k)!].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }
  return result;
}

export async function getDisciplines(): Promise<
  Record<string, DisciplineData>
> {
  const { data: disciplines, error: discError } = await supabase
    .from("disciplines")
    .select("id, nome")
    .eq("status", "ativa")
    .order("ordem");

  if (discError) throw discError;
  if (!disciplines || disciplines.length === 0) return {};

  const discIds = disciplines.map((d) => d.id);
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, nome, discipline_id")
    .in("discipline_id", discIds)
    .order("ordem");

  if (topicsError) throw topicsError;

  const { data: counts, error: countsError } = await supabase
    .from("questions")
    .select("discipline_id")
    .eq("status", "publicada")
    .in("discipline_id", discIds);

  if (countsError) throw countsError;

  const countMap = new Map<number, number>();
  for (const c of counts ?? []) {
    countMap.set(c.discipline_id, (countMap.get(c.discipline_id) ?? 0) + 1);
  }

  const result: Record<string, DisciplineData> = {};
  for (const d of disciplines) {
    const discTopics = (topics ?? [])
      .filter((t) => t.discipline_id === d.id)
      .map((t) => t.nome);
    result[d.nome] = {
      count: countMap.get(d.id) ?? 0,
      temas: discTopics,
    };
  }

  return result;
}

/* ─── Simulado Disciplines (simpler map) ─── */

export async function getSimuladoDisciplinas(): Promise<
  Record<string, string[]>
> {
  const { data: disciplines, error: discError } = await supabase
    .from("disciplines")
    .select("id, nome")
    .eq("status", "ativa")
    .order("ordem");

  if (discError) throw discError;

  if (!disciplines || disciplines.length === 0) {
    return getSimuladoDisciplinasFromQuestionsFull();
  }

  const discIds = disciplines.map((d) => d.id);
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("nome, discipline_id")
    .in("discipline_id", discIds)
    .order("ordem");

  if (topicsError) throw topicsError;

  const result: Record<string, string[]> = {};
  for (const d of disciplines) {
    result[d.nome] = (topics ?? [])
      .filter((t) => t.discipline_id === d.id)
      .map((t) => t.nome);
  }

  const hasAnyTema = Object.values(result).some((temas) => temas.length > 0);
  if (!hasAnyTema) {
    const fallback = await getSimuladoDisciplinasFromQuestionsFull();
    if (Object.keys(fallback).length > 0) return fallback;
  }

  return result;
}

/* ─── Generate Simulado Questions ─── */

export async function generateSimuladoQuestions(
  n: number,
  temas: string[],
): Promise<SimuladoQuestion[]> {
  const { data: topicRows } = await supabase
    .from("topics")
    .select("id")
    .in("nome", temas);

  const topicIds = (topicRows ?? []).map((t) => t.id);

  if (topicIds.length === 0) return [];

  const { data: questions } = await supabase
    .from("questions")
    .select("id, enunciado, topic_id")
    .eq("status", "publicada")
    .in("topic_id", topicIds)
    .limit(n * 3);

  if (!questions || questions.length === 0) return [];

  // Shuffle and pick n
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, n);
  const qIds = shuffled.map((q) => q.id);

  const { data: alts } = await supabase
    .from("alternatives")
    .select("*")
    .in("question_id", qIds)
    .order("ordem");

  const { data: topicNames } = await supabase
    .from("topics")
    .select("id, nome")
    .in("id", [...new Set(shuffled.map((q) => q.topic_id))]);

  const topicMap = new Map<number, string>();
  for (const t of topicNames ?? []) topicMap.set(t.id, t.nome);

  const altsByQ = new Map<number, (typeof alts extends (infer T)[] | null ? T : never)[]>();
  for (const a of alts ?? []) {
    const list = altsByQ.get(a.question_id) ?? [];
    list.push(a);
    altsByQ.set(a.question_id, list);
  }

  return shuffled.map((q, i) => {
    const qAlts = altsByQ.get(q.id) ?? [];
    const correctAlt = qAlts.find((a) => a.is_correct);
    return {
      id: i + 1,
      dbId: q.id,
      tema: topicMap.get(q.topic_id) ?? "",
      enunciado: q.enunciado,
      alternativas: qAlts.map((a) => ({ letra: a.letra, texto: a.texto })),
      correta: correctAlt?.letra ?? "A",
    };
  });
}

/** Fetches the explanations map for a single question by its DB id. */
export async function getQuestionExplicacoes(
  questionId: number
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("questions")
    .select("explicacoes")
    .eq("id", questionId)
    .single();

  if (error) throw error;
  return (data?.explicacoes as Record<string, string>) ?? {};
}
