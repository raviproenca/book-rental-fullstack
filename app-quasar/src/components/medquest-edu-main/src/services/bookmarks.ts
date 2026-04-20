import { supabase } from "@/lib/supabase";
import type { Bookmark } from "@/types";

async function currentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const userId = await currentUserId();

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("id, question_id, created_at, ultimo_status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!bookmarks || bookmarks.length === 0) return [];

  const questionIds = bookmarks.map((b) => b.question_id);
  const { data: questions } = await supabase
    .from("questions_full")
    .select("id, enunciado, disciplina, tema, dificuldade")
    .in("id", questionIds);

  const qMap = new Map<number, (typeof questions extends (infer T)[] | null ? T : never)>();
  for (const q of questions ?? []) {
    if (q.id) qMap.set(q.id, q);
  }

  return bookmarks.map((b) => {
    const q = qMap.get(b.question_id);
    return {
      id: b.question_id,
      enunciado: q?.enunciado ?? "",
      disciplina: q?.disciplina ?? "",
      tema: q?.tema ?? "",
      dificuldade: (q?.dificuldade as Bookmark["dificuldade"]) ?? "Médio",
      dataSalva: b.created_at.split("T")[0],
      ultimoStatus: (b.ultimo_status as Bookmark["ultimoStatus"]) ?? "acertou",
    };
  });
}

export async function toggleBookmark(
  questionId: number,
): Promise<{ bookmarked: boolean }> {
  const userId = await currentUserId();

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
    return { bookmarked: false };
  }

  const { error } = await supabase.from("bookmarks").insert({
    user_id: userId,
    question_id: questionId,
  });

  if (error) throw error;
  return { bookmarked: true };
}
