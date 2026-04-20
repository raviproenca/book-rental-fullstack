import type { SimuladoTemaPerf, SimuladoSession } from "@/types";

/**
 * Computes per-theme performance from a list of questions and the user's answers.
 * Returns themes sorted ascending by pct (worst first) — for display in cards and results.
 */
export function computeTemaPerf(
  questions: { dbId: number; tema: string; correta: string }[],
  answers: Record<string, string>
): SimuladoTemaPerf[] {
  const map: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    if (!map[q.tema]) map[q.tema] = { correct: 0, total: 0 };
    map[q.tema].total++;
    if (answers[String(q.dbId)] === q.correta) map[q.tema].correct++;
  }
  return Object.entries(map)
    .map(([tema, { correct, total }]) => ({
      tema,
      correct,
      total,
      pct: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct); // worst first
}

/**
 * Computes global stats shown in the hub header from the full history array.
 */
export function computeHubStats(sessions: SimuladoSession[]): {
  total: number;
  avgScore: number;
  evolution: number;
  totalQuestions: number;
} {
  if (sessions.length === 0) {
    return { total: 0, avgScore: 0, evolution: 0, totalQuestions: 0 };
  }

  const total = sessions.length;
  const totalQuestions = sessions.reduce((s, x) => s + x.questionIds.length, 0);
  const avgScore = Math.round(
    sessions.reduce((s, x) => s + x.score, 0) / sessions.length
  );

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const last30 = sessions.filter(
    (s) => now - new Date(s.createdAt).getTime() <= thirtyDaysMs
  );
  const prev30 = sessions.filter((s) => {
    const age = now - new Date(s.createdAt).getTime();
    return age > thirtyDaysMs && age <= 2 * thirtyDaysMs;
  });

  const avgLast30 =
    last30.length > 0
      ? Math.round(last30.reduce((s, x) => s + x.score, 0) / last30.length)
      : avgScore;
  const avgPrev30 =
    prev30.length > 0
      ? Math.round(prev30.reduce((s, x) => s + x.score, 0) / prev30.length)
      : avgLast30;

  return {
    total,
    avgScore,
    evolution: avgLast30 - avgPrev30,
    totalQuestions,
  };
}

/** Formats seconds as HH:MM:SS. */
export function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Short human-readable duration label, e.g. "1h30min", "45min". */
export function secondsToHumanShort(totalSec: number): string {
  const mTotal = Math.round(totalSec / 60);
  const h = Math.floor(mTotal / 60);
  const m = mTotal % 60;
  if (h > 0) return m > 0 ? `${h}h${String(m).padStart(2, "0")}min` : `${h}h`;
  return `${m}min`;
}

/** Returns green / warning / destructive class based on score. */
export function scoreColorClass(pct: number): string {
  if (pct >= 70) return "text-success";
  if (pct >= 50) return "text-warning";
  return "text-destructive";
}
