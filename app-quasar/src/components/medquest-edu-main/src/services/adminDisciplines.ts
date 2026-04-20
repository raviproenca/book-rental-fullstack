import { supabase } from "@/lib/supabase";
import type { AdminDiscipline, AdminTema } from "@/types";

/* ─── Queries ─── */

export async function getAdminDisciplines(): Promise<AdminDiscipline[]> {
  const { data: disciplines, error } = await supabase
    .from("disciplines")
    .select("*")
    .order("ordem");

  if (error) throw error;
  if (!disciplines || disciplines.length === 0) return [];

  const discIds = disciplines.map((d) => d.id);

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .in("discipline_id", discIds)
    .order("ordem");

  // Count questions per topic
  const { data: qCounts } = await supabase
    .from("questions")
    .select("topic_id")
    .in("discipline_id", discIds);

  const topicCountMap = new Map<number, number>();
  for (const q of qCounts ?? []) {
    topicCountMap.set(q.topic_id, (topicCountMap.get(q.topic_id) ?? 0) + 1);
  }

  return disciplines.map((d) => {
    const discTopics = (topics ?? [])
      .filter((t) => t.discipline_id === d.id)
      .map((t) => ({
        id: t.id,
        nome: t.nome,
        descricao: t.descricao,
        disciplinaId: t.discipline_id,
        numQuestoes: topicCountMap.get(t.id) ?? 0,
        subtemas: t.subtemas,
        ordem: t.ordem,
      }));

    return {
      id: d.id,
      nome: d.nome,
      icone: d.icone,
      descricao: d.descricao,
      status: d.status as "ativa" | "inativa",
      ordem: d.ordem,
      temas: discTopics,
    };
  });
}

/* ─── Discipline mutations ─── */

export async function createDiscipline(
  data: Omit<AdminDiscipline, "id" | "temas" | "ordem">,
): Promise<AdminDiscipline> {
  const { count } = await supabase
    .from("disciplines")
    .select("id", { count: "exact", head: true });

  const { data: disc, error } = await supabase
    .from("disciplines")
    .insert({
      nome: data.nome,
      icone: data.icone,
      descricao: data.descricao,
      status: data.status,
      ordem: count ?? 0,
    })
    .select("*")
    .single();

  if (error || !disc) throw error ?? new Error("Failed to create discipline");

  return {
    id: disc.id,
    nome: disc.nome,
    icone: disc.icone,
    descricao: disc.descricao,
    status: disc.status as "ativa" | "inativa",
    ordem: disc.ordem,
    temas: [],
  };
}

export async function updateDiscipline(
  id: number,
  data: Partial<Pick<AdminDiscipline, "nome" | "icone" | "descricao">>,
): Promise<AdminDiscipline> {
  const updatePayload: Record<string, unknown> = {};
  if (data.nome !== undefined) updatePayload.nome = data.nome;
  if (data.icone !== undefined) updatePayload.icone = data.icone;
  if (data.descricao !== undefined) updatePayload.descricao = data.descricao;

  const { error } = await supabase
    .from("disciplines")
    .update(updatePayload)
    .eq("id", id);
  if (error) throw error;

  const all = await getAdminDisciplines();
  const disc = all.find((d) => d.id === id);
  if (!disc) throw new Error("Disciplina não encontrada");
  return disc;
}

export async function toggleDisciplineStatus(
  id: number,
): Promise<AdminDiscipline> {
  const { data: current } = await supabase
    .from("disciplines")
    .select("status")
    .eq("id", id)
    .single();

  if (!current) throw new Error("Disciplina não encontrada");

  const newStatus = current.status === "ativa" ? "inativa" : "ativa";
  const { error } = await supabase
    .from("disciplines")
    .update({ status: newStatus })
    .eq("id", id);
  if (error) throw error;

  const all = await getAdminDisciplines();
  const disc = all.find((d) => d.id === id);
  if (!disc) throw new Error("Disciplina não encontrada");
  return disc;
}

export async function reorderDisciplines(orderedIds: number[]): Promise<void> {
  const updates = orderedIds.map((id, i) =>
    supabase.from("disciplines").update({ ordem: i }).eq("id", id),
  );
  await Promise.all(updates);
}

/* ─── Tema mutations ─── */

export async function createTema(
  disciplineId: number,
  data: Omit<AdminTema, "id" | "disciplinaId" | "ordem" | "numQuestoes">,
): Promise<AdminTema> {
  const { count } = await supabase
    .from("topics")
    .select("id", { count: "exact", head: true })
    .eq("discipline_id", disciplineId);

  const { data: topic, error } = await supabase
    .from("topics")
    .insert({
      discipline_id: disciplineId,
      nome: data.nome,
      descricao: data.descricao,
      subtemas: data.subtemas,
      ordem: count ?? 0,
    })
    .select("*")
    .single();

  if (error || !topic) throw error ?? new Error("Failed to create tema");

  return {
    id: topic.id,
    nome: topic.nome,
    descricao: topic.descricao,
    disciplinaId: topic.discipline_id,
    numQuestoes: 0,
    subtemas: topic.subtemas,
    ordem: topic.ordem,
  };
}

export async function updateTema(
  disciplineId: number,
  temaId: number,
  data: Partial<Pick<AdminTema, "nome" | "descricao" | "subtemas">>,
): Promise<AdminTema> {
  const updatePayload: Record<string, unknown> = {};
  if (data.nome !== undefined) updatePayload.nome = data.nome;
  if (data.descricao !== undefined) updatePayload.descricao = data.descricao;
  if (data.subtemas !== undefined) updatePayload.subtemas = data.subtemas;

  const { error } = await supabase
    .from("topics")
    .update(updatePayload)
    .eq("id", temaId)
    .eq("discipline_id", disciplineId);
  if (error) throw error;

  const { data: topic } = await supabase
    .from("topics")
    .select("*")
    .eq("id", temaId)
    .single();
  if (!topic) throw new Error("Tema não encontrado");

  const { count } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("topic_id", temaId);

  return {
    id: topic.id,
    nome: topic.nome,
    descricao: topic.descricao,
    disciplinaId: topic.discipline_id,
    numQuestoes: count ?? 0,
    subtemas: topic.subtemas,
    ordem: topic.ordem,
  };
}

export async function deleteTema(
  disciplineId: number,
  temaId: number,
): Promise<void> {
  const { error } = await supabase
    .from("topics")
    .delete()
    .eq("id", temaId)
    .eq("discipline_id", disciplineId);
  if (error) throw error;

  // Re-order remaining topics
  const { data: remaining } = await supabase
    .from("topics")
    .select("id")
    .eq("discipline_id", disciplineId)
    .order("ordem");

  if (remaining) {
    await Promise.all(
      remaining.map((t, i) =>
        supabase.from("topics").update({ ordem: i }).eq("id", t.id),
      ),
    );
  }
}

export async function reorderTemas(
  disciplineId: number,
  orderedTemaIds: number[],
): Promise<void> {
  void disciplineId;
  const updates = orderedTemaIds.map((id, i) =>
    supabase.from("topics").update({ ordem: i }).eq("id", id),
  );
  await Promise.all(updates);
}
