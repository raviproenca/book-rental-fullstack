import { supabase } from "@/lib/supabase";
import type { SimuladoSession, NewSimuladoSession } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = () => supabase.from("simulado_sessions" as any);

function rowToSession(row: Record<string, unknown>): SimuladoSession {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    disciplina: row.disciplina as string,
    questionIds: row.question_ids as number[],
    answers: (row.answers as Record<string, string>) ?? {},
    score: row.score as number,
    correct: row.correct as number,
    wrong: row.wrong as number,
    blank: row.blank as number,
    timeUsedSec: row.time_used_sec as number,
    createdAt: row.created_at as string,
  };
}

export async function saveSimuladoSession(
  data: NewSimuladoSession
): Promise<SimuladoSession> {
  const { data: row, error } = await table()
    .insert({
      user_id: data.userId,
      disciplina: data.disciplina,
      question_ids: data.questionIds,
      answers: data.answers,
      score: data.score,
      correct: data.correct,
      wrong: data.wrong,
      blank: data.blank,
      time_used_sec: data.timeUsedSec,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToSession(row as Record<string, unknown>);
}

export async function getSimuladoHistory(
  userId: string
): Promise<SimuladoSession[]> {
  const { data, error } = await table()
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map(rowToSession);
}

export async function getSimuladoSession(id: string): Promise<SimuladoSession> {
  const { data, error } = await table()
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return rowToSession(data as Record<string, unknown>);
}
