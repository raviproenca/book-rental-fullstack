import { supabase } from "@/lib/supabase";
import type {
  AdminQuestion,
  AdminQuestionStatus,
  QuestionDifficulty,
} from "@/types";

/* ─── Disciplines / Temas map (fetched from DB) ─── */

export async function getDisciplinasTemasMap(): Promise<
  Record<string, string[]>
> {
  const { data: disciplines } = await supabase
    .from("disciplines")
    .select("id, nome")
    .order("ordem");

  if (!disciplines) return {};

  const discIds = disciplines.map((d) => d.id);
  const { data: topics } = await supabase
    .from("topics")
    .select("nome, discipline_id")
    .in("discipline_id", discIds)
    .order("ordem");

  const result: Record<string, string[]> = {};
  for (const d of disciplines) {
    result[d.nome] = (topics ?? [])
      .filter((t) => t.discipline_id === d.id)
      .map((t) => t.nome);
  }
  return result;
}

// For backward compat with sync imports, we provide a getter.
// Components should migrate to the async version above.
export const disciplinasTemasMap: Record<string, string[]> = {};

/* ─── Filter / Pagination types ─── */

export interface AdminQuestionsFilter {
  disciplina?: string;
  dificuldade?: QuestionDifficulty;
  status?: AdminQuestionStatus;
  search?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ─── Helpers ─── */

async function rowToAdminQuestion(
  q: Record<string, unknown>,
  alts: { letra: string; texto: string; is_correct: boolean }[],
): Promise<AdminQuestion> {
  const correctAlt = alts.find((a) => a.is_correct);

  const explicacoes: Record<string, string> = {};
  const expJson = q.explicacoes as Record<string, string> | null;
  if (expJson) {
    for (const [key, val] of Object.entries(expJson)) {
      explicacoes[key] = val ?? "";
    }
  }

  return {
    id: q.id as number,
    disciplina: (q.disciplina as string) ?? "",
    tema: (q.tema as string) ?? "",
    subtema: (q.subtema as string) ?? undefined,
    dificuldade: (q.dificuldade as QuestionDifficulty) ?? "Médio",
    enunciado: (q.enunciado as string) ?? "",
    pergunta: (q.pergunta as string) ?? "",
    alternativas: alts.map((a) => ({ letra: a.letra, texto: a.texto })),
    correta: correctAlt?.letra ?? "",
    comentario: (q.comentario as string) ?? "",
    explicacoes,
    estatistica: (q.estatistica as number) ?? 0,
    status: (q.status as AdminQuestionStatus) ?? "rascunho",
    dataCriacao: ((q.created_at as string) ?? "").split("T")[0],
    tags: (q.tags as string[]) ?? [],
  };
}

/* ─── Queries ─── */

export async function getAdminQuestions(
  filters: AdminQuestionsFilter,
): Promise<PaginatedResult<AdminQuestion>> {
  let query = supabase
    .from("questions_full")
    .select("*", { count: "exact" });

  if (filters.disciplina) {
    query = query.eq("disciplina", filters.disciplina);
  }
  if (filters.dificuldade) {
    query = query.eq("dificuldade", filters.dificuldade);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.or(
      `enunciado.ilike.%${filters.search}%,pergunta.ilike.%${filters.search}%,tema.ilike.%${filters.search}%`,
    );
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  const { data: rows, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  if (!rows || rows.length === 0) {
    return {
      data: [],
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages,
    };
  }

  const questionIds = rows.map((r) => r.id!);
  const { data: alts } = await supabase
    .from("alternatives")
    .select("question_id, letra, texto, is_correct")
    .in("question_id", questionIds)
    .order("ordem");

  const altsByQ = new Map<number, (typeof alts extends (infer T)[] | null ? T : never)[]>();
  for (const a of alts ?? []) {
    const list = altsByQ.get(a.question_id) ?? [];
    list.push(a);
    altsByQ.set(a.question_id, list);
  }

  const data = await Promise.all(
    rows.map((q) =>
      rowToAdminQuestion(
        q as unknown as Record<string, unknown>,
        (altsByQ.get(q.id!) ?? []) as { letra: string; texto: string; is_correct: boolean }[],
      ),
    ),
  );

  return {
    data,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
  };
}

export async function getAdminQuestionById(
  id: number,
): Promise<AdminQuestion | undefined> {
  const { data: q, error } = await supabase
    .from("questions_full")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !q) return undefined;

  const { data: alts } = await supabase
    .from("alternatives")
    .select("letra, texto, is_correct")
    .eq("question_id", id)
    .order("ordem");

  return rowToAdminQuestion(
    q as unknown as Record<string, unknown>,
    (alts ?? []) as { letra: string; texto: string; is_correct: boolean }[],
  );
}

/* ─── Mutations ─── */

export async function createQuestion(
  data: Omit<AdminQuestion, "id" | "estatistica" | "dataCriacao">,
): Promise<AdminQuestion> {
  // Resolve discipline_id and topic_id from names
  const { data: disc } = await supabase
    .from("disciplines")
    .select("id")
    .eq("nome", data.disciplina)
    .single();

  const { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("nome", data.tema)
    .eq("discipline_id", disc?.id ?? 0)
    .single();

  const { data: question, error } = await supabase
    .from("questions")
    .insert({
      discipline_id: disc?.id ?? 0,
      topic_id: topic?.id ?? 0,
      enunciado: data.enunciado,
      pergunta: data.pergunta,
      comentario: data.comentario,
      explicacoes: data.explicacoes,
      dificuldade: data.dificuldade,
      status: data.status,
      tags: data.tags,
      subtema: data.subtema ?? null,
    })
    .select("id")
    .single();

  if (error || !question) throw error ?? new Error("Failed to create question");

  // Insert alternatives
  const altInserts = data.alternativas.map((alt, i) => ({
    question_id: question.id,
    letra: alt.letra,
    texto: alt.texto,
    is_correct: alt.letra === data.correta,
    ordem: i,
  }));

  await supabase.from("alternatives").insert(altInserts);

  const created = await getAdminQuestionById(question.id);
  return created!;
}

export async function updateQuestion(
  id: number,
  data: Partial<Omit<AdminQuestion, "id">>,
): Promise<AdminQuestion> {
  const updatePayload: Record<string, unknown> = {};

  if (data.enunciado !== undefined) updatePayload.enunciado = data.enunciado;
  if (data.pergunta !== undefined) updatePayload.pergunta = data.pergunta;
  if (data.comentario !== undefined) updatePayload.comentario = data.comentario;
  if (data.explicacoes !== undefined) updatePayload.explicacoes = data.explicacoes;
  if (data.dificuldade !== undefined) updatePayload.dificuldade = data.dificuldade;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.tags !== undefined) updatePayload.tags = data.tags;
  if (data.subtema !== undefined) updatePayload.subtema = data.subtema;

  if (data.disciplina) {
    const { data: disc } = await supabase
      .from("disciplines")
      .select("id")
      .eq("nome", data.disciplina)
      .single();
    if (disc) updatePayload.discipline_id = disc.id;
  }

  if (data.tema) {
    const { data: topic } = await supabase
      .from("topics")
      .select("id")
      .eq("nome", data.tema)
      .single();
    if (topic) updatePayload.topic_id = topic.id;
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase
      .from("questions")
      .update(updatePayload)
      .eq("id", id);
    if (error) throw error;
  }

  // Update alternatives if provided
  if (data.alternativas && data.correta) {
    await supabase.from("alternatives").delete().eq("question_id", id);
    const altInserts = data.alternativas.map((alt, i) => ({
      question_id: id,
      letra: alt.letra,
      texto: alt.texto,
      is_correct: alt.letra === data.correta,
      ordem: i,
    }));
    await supabase.from("alternatives").insert(altInserts);
  }

  const updated = await getAdminQuestionById(id);
  if (!updated) throw new Error("Questão não encontrada");
  return updated;
}

export async function duplicateQuestion(id: number): Promise<AdminQuestion> {
  const source = await getAdminQuestionById(id);
  if (!source) throw new Error("Questão não encontrada");

  return createQuestion({
    ...source,
    status: "rascunho",
  });
}

export async function archiveQuestions(ids: number[]): Promise<void> {
  const { error } = await supabase
    .from("questions")
    .update({ status: "arquivada" })
    .in("id", ids);
  if (error) throw error;
}

export async function deleteQuestions(ids: number[]): Promise<void> {
  // Delete alternatives first (FK constraint)
  await supabase.from("alternatives").delete().in("question_id", ids);
  const { error } = await supabase.from("questions").delete().in("id", ids);
  if (error) throw error;
}
