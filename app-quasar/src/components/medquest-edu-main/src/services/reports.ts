import { supabase } from "@/lib/supabase";
import type { QuestionReport, ReportStatus, ReportReason } from "@/types";

export type ReportsFilter = {
  status?: ReportStatus;
  reason?: ReportReason;
  search?: string;
};

export async function getReports(
  filters?: ReportsFilter,
): Promise<QuestionReport[]> {
  let query = supabase
    .from("question_reports")
    .select("*, profiles!question_reports_user_id_fkey(nome, id)")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.reason) {
    query = query.eq("reason", filters.reason);
  }

  const { data: reports, error } = await query;
  if (error) throw error;
  if (!reports || reports.length === 0) return [];

  const questionIds = [...new Set(reports.map((r) => r.question_id))];

  const [{ data: questions }, { data: alts }] = await Promise.all([
    supabase
      .from("questions_full")
      .select("id, enunciado, disciplina, tema")
      .in("id", questionIds),
    supabase
      .from("alternatives")
      .select("question_id, letra, texto, is_correct")
      .in("question_id", questionIds)
      .order("ordem"),
  ]);

  const qMap = new Map<
    number,
    {
      enunciado: string;
      disciplina: string;
      tema: string;
    }
  >();
  for (const q of questions ?? []) {
    if (q.id)
      qMap.set(q.id, {
        enunciado: q.enunciado ?? "",
        disciplina: q.disciplina ?? "",
        tema: q.tema ?? "",
      });
  }

  const altsByQ = new Map<number, { letra: string; texto: string }[]>();
  const correctByQ = new Map<number, string>();
  for (const a of alts ?? []) {
    const list = altsByQ.get(a.question_id) ?? [];
    list.push({ letra: a.letra, texto: a.texto });
    altsByQ.set(a.question_id, list);
    if (a.is_correct) correctByQ.set(a.question_id, a.letra);
  }

  // Get user emails via auth admin, falling back to profile data
  const userIds = [...new Set(reports.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nome")
    .in("id", userIds);

  const profileMap = new Map<string, string>();
  for (const p of profiles ?? []) {
    profileMap.set(p.id, p.nome);
  }

  let result: QuestionReport[] = reports.map((r) => {
    const q = qMap.get(r.question_id);
    const enunciado = q?.enunciado ?? "";
    const profileData = r.profiles as { nome: string; id: string } | null;

    return {
      id: r.id,
      questionId: r.question_id,
      questionTrecho: enunciado.slice(0, 80) + (enunciado.length > 80 ? "..." : ""),
      questionEnunciado: enunciado,
      questionDisciplina: q?.disciplina ?? "",
      questionTema: q?.tema ?? "",
      questionAlternativas: altsByQ.get(r.question_id) ?? [],
      questionCorreta: correctByQ.get(r.question_id) ?? "",
      userId: r.id,
      userName: profileData?.nome ?? profileMap.get(r.user_id) ?? "Usuário",
      userEmail: "",
      reason: r.reason as ReportReason,
      comment: r.comment,
      adminResponse: r.admin_response ?? undefined,
      status: r.status as ReportStatus,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.questionTrecho.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.questionDisciplina.toLowerCase().includes(q),
    );
  }

  return result;
}

export async function getPendingReportsCount(): Promise<number> {
  const { count, error } = await supabase
    .from("question_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "pendente");

  if (error) throw error;
  return count ?? 0;
}

export async function updateReportStatus(
  id: number,
  status: ReportStatus,
): Promise<QuestionReport> {
  const { error } = await supabase
    .from("question_reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;

  const reports = await getReports();
  const report = reports.find((r) => r.id === id);
  if (!report) throw new Error("Report not found");
  return report;
}

export async function respondToReport(
  id: number,
  response: string,
): Promise<QuestionReport> {
  const { error } = await supabase
    .from("question_reports")
    .update({
      admin_response: response,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  const reports = await getReports();
  const report = reports.find((r) => r.id === id);
  if (!report) throw new Error("Report not found");
  return report;
}
