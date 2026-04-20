# Simulados Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the monolithic `SimuladoPage.tsx` with a 4-route feature module (hub, config, exam, results) backed by a new `simulado_sessions` Supabase table for persistent history.

**Architecture:** Feature module at `/simulados/*` with dedicated page components per phase. Pure utility functions extracted for testability. Service layer talks to Supabase; hooks wrap with TanStack Query. Config is passed to exam via React Router location state; exam saves on finish and navigates to results by session id.

**Tech Stack:** React 18 + TypeScript, React Router v6, TanStack Query v5, Supabase JS v2, Tailwind CSS, shadcn/ui, Vitest + @testing-library/react

**Design reference:** mockups committed to `.superpowers/brainstorm/` (hub-design.html, config-design.html, exam-design.html, results-design.html). Open in browser for visual spec.

---

## File Map

**Create:**
- `src/types/index.ts` — add `SimuladoSession`, `NewSimuladoSession`, `SimuladoTemaPerf`, `SimuladoExamConfig`; update `SimuladoQuestion`
- `src/lib/simuladoUtils.ts` — pure calculation functions
- `src/lib/simuladoUtils.test.ts` — unit tests for utils
- `src/services/simulados.ts` — `saveSimuladoSession`, `getSimuladoHistory`, `getSimuladoSession`
- `src/hooks/useSimuladoHistory.ts` — TanStack Query hook for history list
- `src/hooks/useSimuladoSession.ts` — TanStack Query hook for single session
- `src/components/simulado/SimuladoCard.tsx` — card used in hub
- `src/components/simulado/ExamSidebar.tsx` — stats + grid sidebar during exam
- `src/components/simulado/QuestionReviewList.tsx` — expandable question list in results
- `src/pages/SimuladosHubPage.tsx` — `/simulados`
- `src/pages/SimuladoConfigPage.tsx` — `/simulados/novo`
- `src/pages/SimuladoExamPage.tsx` — `/simulados/ativo`
- `src/pages/SimuladoResultsPage.tsx` — `/simulados/:id`

**Modify:**
- `src/types/index.ts` — add new types / update `SimuladoQuestion`
- `src/services/questions.ts` — add `getQuestionExplicacoes`; fix `generateSimuladoQuestions` to return `dbId`
- `src/App.tsx` — swap routes

**Delete (after routes are wired):**
- `src/pages/SimuladoPage.tsx`

---

## Task 1: Supabase Migration

Run this SQL in the Supabase dashboard (SQL editor). No code changes yet.

**Files:** none (DB only)

- [ ] **Step 1: Run migration SQL**

Open Supabase dashboard → SQL editor → new query → paste and run:

```sql
create table if not exists simulado_sessions (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  disciplina    text        not null,
  question_ids  integer[]   not null,
  answers       jsonb       not null default '{}',
  score         integer     not null,
  correct       integer     not null,
  wrong         integer     not null,
  blank         integer     not null,
  time_used_sec integer     not null,
  created_at    timestamptz not null default now()
);

create index if not exists simulado_sessions_user_created
  on simulado_sessions (user_id, created_at desc);

alter table simulado_sessions enable row level security;

create policy "Users manage own simulado sessions"
  on simulado_sessions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Expected: "Success. No rows returned."

- [ ] **Step 2: Verify table exists**

In Supabase dashboard → Table Editor: confirm `simulado_sessions` appears with the correct columns.

---

## Task 2: Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Update `SimuladoQuestion` — add `dbId`**

In `src/types/index.ts`, find the `SimuladoQuestion` interface (line ~31) and replace it:

```typescript
export interface SimuladoQuestion {
  /** 1-based display index used in the exam UI. */
  id: number;
  /** Real database question id — used for saving sessions and fetching explanations. */
  dbId: number;
  tema: string;
  enunciado: string;
  alternativas: Alternative[];
  correta: string;
}
```

- [ ] **Step 2: Add new simulado types**

After the `SimuladoResult` interface, add:

```typescript
/** Per-theme performance within a simulado session. */
export interface SimuladoTemaPerf {
  tema: string;
  correct: number;
  total: number;
  /** 0–100 */
  pct: number;
}

/** A persisted simulado session returned from the database. */
export interface SimuladoSession {
  id: string;
  userId: string;
  disciplina: string;
  /** Real DB question ids in display order. */
  questionIds: number[];
  /** Maps question DB id (as string key) to the letter the user answered, or absent if blank. */
  answers: Record<string, string>;
  score: number;
  correct: number;
  wrong: number;
  blank: number;
  timeUsedSec: number;
  createdAt: string;
}

/** Payload for creating a new session. */
export interface NewSimuladoSession {
  userId: string;
  disciplina: string;
  questionIds: number[];
  answers: Record<string, string>;
  score: number;
  correct: number;
  wrong: number;
  blank: number;
  timeUsedSec: number;
}

/** Config passed via React Router location state from config → exam. */
export interface SimuladoExamConfig {
  disciplina: string;
  questionCount: number;
  durationSeconds: number;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors on the new types.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(simulados): add SimuladoSession, NewSimuladoSession, SimuladoExamConfig types; add dbId to SimuladoQuestion"
```

---

## Task 3: Utility Functions + Tests

**Files:**
- Create: `src/lib/simuladoUtils.ts`
- Create: `src/lib/simuladoUtils.test.ts`

- [ ] **Step 1: Create `src/lib/simuladoUtils.ts`**

```typescript
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
```

- [ ] **Step 2: Write failing tests**

Create `src/lib/simuladoUtils.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  computeTemaPerf,
  computeHubStats,
  formatTime,
  secondsToHumanShort,
  scoreColorClass,
} from "./simuladoUtils";
import type { SimuladoSession } from "@/types";

const makeSession = (overrides: Partial<SimuladoSession> = {}): SimuladoSession => ({
  id: "s1",
  userId: "u1",
  disciplina: "Clínica",
  questionIds: [1, 2],
  answers: {},
  score: 70,
  correct: 7,
  wrong: 2,
  blank: 1,
  timeUsedSec: 1800,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("computeTemaPerf", () => {
  it("returns empty array for no questions", () => {
    expect(computeTemaPerf([], {})).toEqual([]);
  });

  it("counts correct answers per tema", () => {
    const questions = [
      { dbId: 1, tema: "Cardio", correta: "A" },
      { dbId: 2, tema: "Cardio", correta: "B" },
      { dbId: 3, tema: "Pneumo", correta: "C" },
    ];
    const answers = { "1": "A", "2": "A", "3": "C" }; // Cardio: 1/2, Pneumo: 1/1
    const result = computeTemaPerf(questions, answers);
    const cardio = result.find((t) => t.tema === "Cardio")!;
    const pneumo = result.find((t) => t.tema === "Pneumo")!;
    expect(cardio.correct).toBe(1);
    expect(cardio.total).toBe(2);
    expect(cardio.pct).toBe(50);
    expect(pneumo.pct).toBe(100);
  });

  it("sorts worst first (ascending pct)", () => {
    const questions = [
      { dbId: 1, tema: "A", correta: "X" },
      { dbId: 2, tema: "B", correta: "X" },
    ];
    const answers = { "1": "X", "2": "Y" }; // A=100%, B=0%
    const [first] = computeTemaPerf(questions, answers);
    expect(first.tema).toBe("B"); // worst first
  });

  it("counts blank answers as wrong", () => {
    const questions = [{ dbId: 1, tema: "A", correta: "X" }];
    const result = computeTemaPerf(questions, {}); // no answer
    expect(result[0].correct).toBe(0);
    expect(result[0].pct).toBe(0);
  });
});

describe("computeHubStats", () => {
  it("returns zeros for empty sessions", () => {
    expect(computeHubStats([])).toEqual({
      total: 0,
      avgScore: 0,
      evolution: 0,
      totalQuestions: 0,
    });
  });

  it("sums total questions across sessions", () => {
    const sessions = [
      makeSession({ questionIds: [1, 2, 3] }),
      makeSession({ questionIds: [4, 5] }),
    ];
    expect(computeHubStats(sessions).totalQuestions).toBe(5);
  });

  it("computes average score", () => {
    const sessions = [
      makeSession({ score: 60 }),
      makeSession({ score: 80 }),
    ];
    expect(computeHubStats(sessions).avgScore).toBe(70);
  });
});

describe("formatTime", () => {
  it("formats seconds to HH:MM:SS", () => {
    expect(formatTime(3661)).toBe("01:01:01");
    expect(formatTime(0)).toBe("00:00:00");
    expect(formatTime(90)).toBe("00:01:30");
  });
});

describe("secondsToHumanShort", () => {
  it("shows minutes only when under 1 hour", () => {
    expect(secondsToHumanShort(45 * 60)).toBe("45min");
  });
  it("shows hours and minutes", () => {
    expect(secondsToHumanShort(90 * 60)).toBe("1h30min");
  });
  it("shows hours only when minutes are zero", () => {
    expect(secondsToHumanShort(60 * 60)).toBe("1h");
  });
});

describe("scoreColorClass", () => {
  it("returns success for ≥70", () => {
    expect(scoreColorClass(70)).toBe("text-success");
    expect(scoreColorClass(100)).toBe("text-success");
  });
  it("returns warning for 50–69", () => {
    expect(scoreColorClass(50)).toBe("text-warning");
    expect(scoreColorClass(69)).toBe("text-warning");
  });
  it("returns destructive for <50", () => {
    expect(scoreColorClass(49)).toBe("text-destructive");
    expect(scoreColorClass(0)).toBe("text-destructive");
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL (file doesn't exist yet)**

```bash
npx vitest run src/lib/simuladoUtils.test.ts
```

Expected: FAIL with "Cannot find module './simuladoUtils'"

- [ ] **Step 4: Verify tests pass after creating utils**

```bash
npx vitest run src/lib/simuladoUtils.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/simuladoUtils.ts src/lib/simuladoUtils.test.ts
git commit -m "feat(simulados): add pure utility functions with tests"
```

---

## Task 4: Service Layer

**Files:**
- Create: `src/services/simulados.ts`
- Modify: `src/services/questions.ts`

- [ ] **Step 1: Create `src/services/simulados.ts`**

```typescript
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
```

- [ ] **Step 2: Add `getQuestionExplicacoes` to `src/services/questions.ts`**

At the end of `src/services/questions.ts`, add:

```typescript
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
```

- [ ] **Step 3: Fix `generateSimuladoQuestions` to return `dbId`**

In `src/services/questions.ts`, find the `generateSimuladoQuestions` return mapping (around line 299) and update it to include `dbId`:

```typescript
return shuffled.map((q, i) => {
  const qAlts = altsByQ.get(q.id) ?? [];
  const correctAlt = qAlts.find((a) => a.is_correct);
  return {
    id: i + 1,
    dbId: q.id,          // ← ADD THIS
    tema: topicMap.get(q.topic_id) ?? "",
    enunciado: q.enunciado,
    alternativas: qAlts.map((a) => ({ letra: a.letra, texto: a.texto })),
    correta: correctAlt?.letra ?? "A",
  };
});
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/services/simulados.ts src/services/questions.ts
git commit -m "feat(simulados): add simulados service, fix generateSimuladoQuestions to include dbId"
```

---

## Task 5: Hooks

**Files:**
- Create: `src/hooks/useSimuladoHistory.ts`
- Create: `src/hooks/useSimuladoSession.ts`

- [ ] **Step 1: Create `src/hooks/useSimuladoHistory.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getSimuladoHistory } from "@/services/simulados";

export function useSimuladoHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["simulado-history", user?.id],
    queryFn: () => getSimuladoHistory(user!.id),
    enabled: !!user?.id,
  });
}
```

- [ ] **Step 2: Create `src/hooks/useSimuladoSession.ts`**

```typescript
import { useQuery } from "@tanstack/react-query";
import { getSimuladoSession } from "@/services/simulados";

export function useSimuladoSession(id: string | undefined) {
  return useQuery({
    queryKey: ["simulado-session", id],
    queryFn: () => getSimuladoSession(id!),
    enabled: !!id,
  });
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useSimuladoHistory.ts src/hooks/useSimuladoSession.ts
git commit -m "feat(simulados): add useSimuladoHistory and useSimuladoSession hooks"
```

---

## Task 6: SimuladoCard Component

**Files:**
- Create: `src/components/simulado/SimuladoCard.tsx`

- [ ] **Step 1: Create `src/components/simulado/SimuladoCard.tsx`**

```typescript
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { secondsToHumanShort, scoreColorClass, computeTemaPerf } from "@/lib/simuladoUtils";
import type { SimuladoSession, SimuladoQuestion } from "@/types";

interface SimuladoCardProps {
  session: SimuladoSession;
  /** Reconstructed questions needed for tema bars. Pass empty array if not available — tema bars will be hidden. */
  questions?: Pick<SimuladoQuestion, "dbId" | "tema" | "correta">[];
}

export function SimuladoCard({ session, questions = [] }: SimuladoCardProps) {
  const navigate = useNavigate();
  const isLowScore = session.score < 50;
  const temaPerf = questions.length > 0
    ? computeTemaPerf(questions, session.answers).slice(0, 3)
    : [];

  const formattedDate = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })
    .format(
      Math.round((new Date(session.createdAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day"
    );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-border/80 transition-colors flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-foreground">{session.disciplina}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {formattedDate} · {session.questionIds.length} questões ·{" "}
            {secondsToHumanShort(session.timeUsedSec)}
          </div>
        </div>
        <span className={cn("font-mono-stats text-2xl font-black leading-none", scoreColorClass(session.score))}>
          {session.score}%
        </span>
      </div>

      {/* Low score badge */}
      {isLowScore && (
        <div className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 w-fit">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
          <span className="text-[10px] font-semibold text-destructive">Revisar — desempenho baixo</span>
        </div>
      )}

      {/* Tema bars */}
      {temaPerf.length > 0 && (
        <div className="space-y-1.5">
          {temaPerf.map((t) => (
            <div key={t.tema} className="flex items-center gap-2">
              <span className="w-16 shrink-0 truncate text-[10px] text-muted-foreground">{t.tema}</span>
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    t.pct >= 70 ? "bg-success" : t.pct >= 50 ? "bg-warning" : "bg-destructive"
                  )}
                  style={{ width: `${t.pct}%` }}
                />
              </div>
              <span className={cn("w-8 text-right font-mono-stats text-[10px] font-semibold", scoreColorClass(t.pct))}>
                {t.pct}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          type="button"
          onClick={() => navigate(`/simulados/${session.id}`)}
          className="flex-1 rounded-lg border border-border bg-secondary py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Ver Resultado
        </button>
        <button
          type="button"
          onClick={() => navigate("/simulados/novo", { state: { disciplina: session.disciplina } })}
          className={cn(
            "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
            isLowScore
              ? "bg-gold text-background hover:bg-gold-hover"
              : "border border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          Refazer
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/simulado/SimuladoCard.tsx
git commit -m "feat(simulados): add SimuladoCard component"
```

---

## Task 7: SimuladosHubPage

**Files:**
- Create: `src/pages/SimuladosHubPage.tsx`

- [ ] **Step 1: Create `src/pages/SimuladosHubPage.tsx`**

```typescript
import { useNavigate } from "react-router-dom";
import { Play, Brain } from "lucide-react";
import { useSimuladoHistory } from "@/hooks/useSimuladoHistory";
import { SimuladoCard } from "@/components/simulado/SimuladoCard";
import { computeHubStats } from "@/lib/simuladoUtils";
import { DashboardSkeleton } from "@/components/Skeletons";
import { cn } from "@/lib/utils";

export default function SimuladosHubPage() {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSimuladoHistory();

  const stats = sessions ? computeHubStats(sessions) : null;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Page content inside AppLayout — no full-screen header needed */}
      <div className="mx-auto w-full max-w-[1100px] px-6 py-8 space-y-8">

        {/* Title row */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Simulados</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Provas cronometradas por disciplina com histórico de evolução
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/simulados/novo")}
            className="flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-background shadow-lg shadow-gold/20 transition-colors hover:bg-gold-hover"
          >
            <Play className="h-4 w-4" />
            Novo Simulado
          </button>
        </div>

        {/* Global stats */}
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "simulados feitos", value: String(stats.total), color: "text-gold" },
              { label: "média geral", value: `${stats.avgScore}%`, color: stats.avgScore >= 70 ? "text-success" : stats.avgScore >= 50 ? "text-warning" : "text-destructive" },
              { label: "evolução (30 dias)", value: `${stats.evolution >= 0 ? "+" : ""}${stats.evolution}%`, color: stats.evolution >= 0 ? "text-success" : "text-destructive" },
              { label: "questões respondidas", value: String(stats.totalQuestions), color: "text-foreground" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <p className={cn("font-mono-stats text-2xl font-black", s.color)}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {sessions && sessions.length > 0 ? (
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Histórico
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <SimuladoCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-muted">
              <Brain className="h-7 w-7 text-gold" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Nenhum simulado feito ainda</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Faça seu primeiro simulado e acompanhe sua evolução ao longo do tempo.
            </p>
            <button
              type="button"
              onClick={() => navigate("/simulados/novo")}
              className="mt-6 flex items-center gap-2 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover"
            >
              <Play className="h-4 w-4" />
              Começar agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/SimuladosHubPage.tsx
git commit -m "feat(simulados): add SimuladosHubPage with history grid and global stats"
```

---

## Task 8: SimuladoConfigPage

**Files:**
- Create: `src/pages/SimuladoConfigPage.tsx`

- [ ] **Step 1: Create `src/pages/SimuladoConfigPage.tsx`**

```typescript
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Timer, Play } from "lucide-react";
import { useSimuladoDisciplinas } from "@/hooks/useQuestions";
import { useSimuladoHistory } from "@/hooks/useSimuladoHistory";
import { secondsToHumanShort } from "@/lib/simuladoUtils";
import { DashboardSkeleton } from "@/components/Skeletons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SimuladoExamConfig } from "@/types";

const QUESTION_PRESETS = [20, 30, 50] as const;
const TIME_PRESETS = [
  { label: "45 min", sec: 45 * 60 },
  { label: "1h", sec: 60 * 60 },
  { label: "1h30", sec: 90 * 60 },
  { label: "2h", sec: 120 * 60 },
] as const;
const MIN_Q = 5; const MAX_Q = 100;
const MIN_DUR_MIN = 5; const MAX_DUR_MIN = 360;

function autoTime(n: number) { return n * 3 * 60; }

export default function SimuladoConfigPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: disciplinasData, isLoading } = useSimuladoDisciplinas();
  const { data: history } = useSimuladoHistory();

  // Pre-select discipline if arriving from "Refazer" button
  const preselected = (location.state as { disciplina?: string } | null)?.disciplina ?? "";

  const [selectedDisc, setSelectedDisc] = useState(preselected);
  const [questionCount, setQuestionCount] = useState(30);
  const [durationSeconds, setDurationSeconds] = useState(autoTime(30));
  const [autoMode, setAutoMode] = useState(true);

  // Sync auto-time with question count
  useEffect(() => {
    if (autoMode) setDurationSeconds(autoTime(questionCount));
  }, [questionCount, autoMode]);

  // Default to first discipline if none preselected
  useEffect(() => {
    if (!selectedDisc && disciplinasData) {
      const keys = Object.keys(disciplinasData);
      if (keys.length > 0) setSelectedDisc(keys[0]);
    }
  }, [disciplinasData, selectedDisc]);

  if (isLoading || !disciplinasData) return <DashboardSkeleton />;

  const allDiscs = Object.keys(disciplinasData);
  const temas = selectedDisc ? disciplinasData[selectedDisc] ?? [] : [];
  const canStart = !!selectedDisc && temas.length > 0 && questionCount >= MIN_Q && questionCount <= MAX_Q;

  // Last simulado in this discipline for the hint panel
  const lastForDisc = history?.find((s) => s.disciplina === selectedDisc);

  const handleStart = () => {
    if (!canStart) return;
    const config: SimuladoExamConfig = { disciplina: selectedDisc, questionCount, durationSeconds };
    navigate("/simulados/ativo", { state: config });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-6 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate("/simulados")}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Simulados
        </button>
        <span className="text-muted-foreground/40">|</span>
        <span className="text-sm font-bold text-foreground">Novo Simulado</span>
      </header>

      {/* Two-panel layout */}
      <div className="flex-1 grid lg:grid-cols-[1fr_340px] min-h-0">

        {/* LEFT: Config options */}
        <div className="overflow-y-auto px-6 py-8 space-y-8 border-r border-border">

          {/* Discipline */}
          <section className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Disciplina</h2>
            <div className="flex flex-wrap gap-2">
              {allDiscs.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedDisc(name)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-all",
                    selectedDisc === name
                      ? "border-gold/40 bg-gold-muted text-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground hover:border-gold/20 hover:text-foreground"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
            {selectedDisc && (
              <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
                {(disciplinasData[selectedDisc] ?? []).length > 0
                  ? `${temas.length} temas disponíveis${lastForDisc ? ` · Último simulado: ${lastForDisc.score}%` : ""}`
                  : "Nenhum tema disponível"}
              </p>
            )}
          </section>

          {/* Question count */}
          <section className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Número de questões</h2>
            <div className="grid grid-cols-3 gap-3 max-w-sm">
              {QUESTION_PRESETS.map((n) => {
                const active = questionCount === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionCount(n)}
                    className={cn(
                      "rounded-xl border p-4 text-center transition-all",
                      active ? "border-gold/40 bg-gold-muted" : "border-border bg-card hover:border-gold/20 hover:bg-accent/30"
                    )}
                  >
                    <span className={cn("font-mono-stats text-2xl font-black block", active ? "text-gold" : "text-foreground")}>{n}</span>
                    <span className="text-xs text-muted-foreground mt-1 block">questões</span>
                    <span className={cn("flex items-center justify-center gap-1 font-mono-stats text-[10px] mt-1", active ? "text-gold" : "text-muted-foreground/60")}>
                      <Timer className="h-3 w-3" />
                      {secondsToHumanShort(autoTime(n))}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Personalizar ({MIN_Q}–{MAX_Q})</p>
              <Input
                type="number"
                min={MIN_Q}
                max={MAX_Q}
                value={questionCount}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (!isNaN(n)) setQuestionCount(Math.min(MAX_Q, Math.max(MIN_Q, n)));
                }}
                className="max-w-[160px] font-mono-stats"
              />
            </div>
          </section>

          {/* Duration */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tempo</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={cn("h-5 w-9 rounded-full transition-colors relative", autoMode ? "bg-gold" : "bg-muted")}
                  onClick={() => setAutoMode((v) => !v)}
                >
                  <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform", autoMode ? "translate-x-4" : "translate-x-0.5")} />
                </div>
                <span className={cn("text-xs font-medium", autoMode ? "text-gold" : "text-muted-foreground")}>
                  Auto (3 min/questão)
                </span>
              </label>
            </div>
            <div className={cn("flex flex-wrap gap-2 transition-opacity", autoMode ? "opacity-40 pointer-events-none" : "")}>
              {TIME_PRESETS.map(({ label, sec }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setDurationSeconds(sec); setAutoMode(false); }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-all",
                    !autoMode && durationSeconds === sec
                      ? "border-gold/40 bg-gold-muted text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-gold/20"
                  )}
                >
                  {label}
                </button>
              ))}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">min:</span>
                <Input
                  type="number"
                  min={MIN_DUR_MIN}
                  max={MAX_DUR_MIN}
                  value={Math.round(durationSeconds / 60)}
                  disabled={autoMode}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n)) {
                      setDurationSeconds(Math.min(MAX_DUR_MIN, Math.max(MIN_DUR_MIN, n)) * 60);
                      setAutoMode(false);
                    }
                  }}
                  className="w-20 font-mono-stats disabled:opacity-40"
                />
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT: Live summary */}
        <div className="hidden lg:flex flex-col px-6 py-8 bg-card/50 gap-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resumo</h3>

          {selectedDisc ? (
            <>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div>
                  <p className="text-base font-bold text-foreground">{selectedDisc}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{temas.length} temas disponíveis</p>
                </div>
                <div className="border-t border-border pt-3 space-y-2.5">
                  {[
                    { label: "Questões", value: String(questionCount) },
                    { label: "Tempo", value: secondsToHumanShort(durationSeconds) },
                    { label: "Ritmo", value: `${Math.round(durationSeconds / questionCount / 60)} min / questão` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-sm font-semibold text-foreground font-mono-stats">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {lastForDisc && (
                <div className="rounded-xl border border-success/20 bg-success/5 p-4 space-y-1">
                  <p className="text-[10px] font-semibold text-success">Último simulado nesta disciplina</p>
                  <p className="text-xs text-muted-foreground">
                    {lastForDisc.score}% · {lastForDisc.questionIds.length} questões
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma disciplina para ver o resumo.</p>
          )}

          <div className="mt-auto space-y-2">
            <button
              type="button"
              disabled={!canStart}
              onClick={handleStart}
              className={cn(
                "flex w-full h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-lg transition-all",
                canStart
                  ? "bg-gold text-background shadow-gold/20 hover:bg-gold-hover"
                  : "cursor-not-allowed bg-muted text-muted-foreground opacity-60 shadow-none"
              )}
            >
              <Play className="h-4 w-4" />
              Iniciar Simulado
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              Questões selecionadas aleatoriamente dos temas da disciplina
            </p>
          </div>
        </div>

      </div>

      {/* Mobile CTA (below config) */}
      <div className="lg:hidden sticky bottom-0 border-t border-border bg-background p-4">
        <button
          type="button"
          disabled={!canStart}
          onClick={handleStart}
          className={cn(
            "flex w-full h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-lg",
            canStart ? "bg-gold text-background" : "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
          )}
        >
          <Play className="h-4 w-4" />
          Iniciar Simulado · {questionCount}q · {secondsToHumanShort(durationSeconds)}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/SimuladoConfigPage.tsx
git commit -m "feat(simulados): add SimuladoConfigPage with two-panel layout and live summary"
```

---

## Task 9: ExamSidebar Component

**Files:**
- Create: `src/components/simulado/ExamSidebar.tsx`

- [ ] **Step 1: Create `src/components/simulado/ExamSidebar.tsx`**

```typescript
import { cn } from "@/lib/utils";

export interface QState {
  answered: string | null;
  flagged: boolean;
}

interface ExamSidebarProps {
  states: QState[];
  currentIdx: number;
  onGoTo: (idx: number) => void;
  onFinish: () => void;
}

export function ExamSidebar({ states, currentIdx, onGoTo, onFinish }: ExamSidebarProps) {
  const total = states.length;
  const answered = states.filter((s) => s.answered).length;
  const flagged = states.filter((s) => s.flagged).length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <aside className="hidden w-[260px] shrink-0 border-l border-border bg-card/50 p-5 lg:flex flex-col gap-4">
      {/* Stats */}
      <div className="space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-success/20 bg-success/5 p-2.5 text-center">
            <p className="font-mono-stats text-xl font-black text-success leading-none">{answered}</p>
            <p className="text-[9px] text-success/70 mt-1">respondidas</p>
          </div>
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-2.5 text-center">
            <p className="font-mono-stats text-xl font-black text-warning leading-none">{flagged}</p>
            <p className="text-[9px] text-warning/70 mt-1">marcadas</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
          <div className="flex justify-between text-[9px]">
            <span className="text-muted-foreground">Progresso</span>
            <span className="text-gold font-mono-stats font-bold">{pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-yellow-400 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground text-right">{answered} de {total}</p>
        </div>
      </div>

      {/* Question grid */}
      <div className="space-y-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Questões</p>
        <div className="grid grid-cols-6 gap-1">
          {states.map((s, i) => {
            const isCurrent = i === currentIdx;
            const base = "flex aspect-square items-center justify-center rounded font-mono-stats text-[9px] font-semibold cursor-pointer transition-all relative";
            let variant = "bg-secondary/50 border border-border text-muted-foreground hover:border-gold/30";
            if (isCurrent) variant = "bg-white text-black ring-2 ring-gold ring-offset-1";
            else if (s.answered) variant = "bg-gold text-background";
            return (
              <button
                key={i}
                type="button"
                onClick={() => onGoTo(i)}
                className={cn(base, variant)}
              >
                {i + 1}
                {s.flagged && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-warning border border-background" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {[
            { swatch: "bg-gold", label: "Respondida" },
            { swatch: "bg-white ring-1 ring-gold", label: "Atual" },
            { swatch: "bg-warning h-2 w-2 rounded-full", label: "Marcada (dot)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={cn("h-2.5 w-2.5 rounded-sm", l.swatch)} />
              <span className="text-[9px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Finish button */}
      <button
        type="button"
        onClick={onFinish}
        className="mt-auto h-10 w-full rounded-xl bg-gold text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover transition-colors"
      >
        Finalizar Simulado
      </button>
    </aside>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/simulado/ExamSidebar.tsx
git commit -m "feat(simulados): add ExamSidebar component with stats and question grid"
```

---

## Task 10: SimuladoExamPage

**Files:**
- Create: `src/pages/SimuladoExamPage.tsx`

- [ ] **Step 1: Create `src/pages/SimuladoExamPage.tsx`**

```typescript
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Clock, Play, Pause, Flag, ArrowLeft, ArrowRight, X, AlertTriangle, Brain,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSimuladoDisciplinas } from "@/hooks/useQuestions";
import { generateSimuladoQuestions } from "@/services/questions";
import { saveSimuladoSession } from "@/services/simulados";
import { ExamSidebar } from "@/components/simulado/ExamSidebar";
import type { QState } from "@/components/simulado/ExamSidebar";
import { formatTime } from "@/lib/simuladoUtils";
import { DashboardSkeleton } from "@/components/Skeletons";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { SimuladoQuestion, SimuladoExamConfig } from "@/types";

export default function SimuladoExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: disciplinasData, isLoading: isDiscsLoading } = useSimuladoDisciplinas();

  const config = location.state as SimuladoExamConfig | null;

  // Guard: redirect if arrived without config state
  useEffect(() => {
    if (!config) navigate("/simulados/novo", { replace: true });
  }, [config, navigate]);

  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  const [states, setStates] = useState<QState[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState<"loading" | "exam" | "saving">("loading");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNavSheet, setShowNavSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load questions on mount
  useEffect(() => {
    if (!config || !disciplinasData) return;
    const temas = disciplinasData[config.disciplina] ?? [];
    if (temas.length === 0) { navigate("/simulados/novo", { replace: true }); return; }

    generateSimuladoQuestions(config.questionCount, temas).then((qs) => {
      if (qs.length === 0) { navigate("/simulados/novo", { replace: true }); return; }
      setQuestions(qs);
      setStates(qs.map(() => ({ answered: null, flagged: false })));
      setTimeLeft(config.durationSeconds);
      setTotalTime(config.durationSeconds);
      setPhase("exam");
    });
  }, [config, disciplinasData, navigate]);

  // Timer
  useEffect(() => {
    if (phase !== "exam" || paused) return;
    if (timeLeft <= 0) { handleFinish(); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, paused, phase]);

  // Mark visited (using answered state — simpler than separate visited flag)
  const selectAnswer = (letra: string) => {
    setStates((prev) => {
      const copy = [...prev];
      copy[currentIdx] = { ...copy[currentIdx], answered: letra };
      return copy;
    });
  };

  const toggleFlag = () => {
    setStates((prev) => {
      const copy = [...prev];
      copy[currentIdx] = { ...copy[currentIdx], flagged: !copy[currentIdx].flagged };
      return copy;
    });
  };

  const handleFinish = useCallback(async () => {
    if (saving || !config || !user) return;
    setSaving(true);
    setShowConfirm(false);
    setPhase("saving");

    const answersMap: Record<string, string> = {};
    questions.forEach((q, i) => {
      if (states[i].answered) answersMap[String(q.dbId)] = states[i].answered!;
    });

    const correct = questions.filter((q, i) => states[i].answered === q.correta).length;
    const wrong = questions.filter((q, i) => states[i].answered && states[i].answered !== q.correta).length;
    const blank = questions.filter((_, i) => !states[i].answered).length;
    const score = Math.round((correct / questions.length) * 100);

    try {
      const session = await saveSimuladoSession({
        userId: user.id,
        disciplina: config.disciplina,
        questionIds: questions.map((q) => q.dbId),
        answers: answersMap,
        score,
        correct,
        wrong,
        blank,
        timeUsedSec: totalTime - timeLeft,
      });
      navigate(`/simulados/${session.id}`, { replace: true });
    } catch {
      // If save fails, navigate to hub — don't lose the user
      navigate("/simulados", { replace: true });
    }
  }, [saving, config, user, questions, states, totalTime, timeLeft, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    if (phase !== "exam") return;
    const handler = (e: KeyboardEvent) => {
      if (showConfirm) return;
      if (e.key >= "1" && e.key <= "5") {
        const idx = parseInt(e.key) - 1;
        if (questions[currentIdx]?.alternativas[idx])
          selectAnswer(questions[currentIdx].alternativas[idx].letra);
      }
      if (e.key === "ArrowRight") setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
      if (e.key === "ArrowLeft") setCurrentIdx((i) => Math.max(0, i - 1));
      if (e.key.toLowerCase() === "f") toggleFlag();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, currentIdx, showConfirm, questions]);

  if (isDiscsLoading || phase === "loading") return <DashboardSkeleton />;

  if (phase === "saving") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-gold" />
          <p className="text-sm font-semibold text-foreground">Salvando resultado...</p>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  const st = states[currentIdx];
  const isLowTime = timeLeft <= 300;
  const answered = states.filter((s) => s.answered).length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b border-border bg-background/90 px-4 md:px-6 backdrop-blur-md">
        {/* Left: brand + context */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-muted">
            <Brain className="h-3.5 w-3.5 text-gold" />
          </div>
          <span className="hidden text-sm font-black text-foreground md:inline">
            MED<span className="text-gold">QUEST</span>
          </span>
          <span className="hidden text-muted-foreground/40 md:inline">|</span>
          <span className="hidden text-xs text-muted-foreground md:inline">{config?.disciplina}</span>
          <span className="rounded border border-border bg-secondary px-2 py-0.5 font-mono-stats text-[10px] text-muted-foreground">
            {currentIdx + 1}/{questions.length}
          </span>
        </div>

        {/* Center: timer */}
        <div className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all",
          isLowTime ? "animate-pulse border-destructive/40 bg-destructive/10" : "border-border bg-card"
        )}>
          <span className={cn("h-2 w-2 rounded-full", isLowTime ? "bg-destructive" : "bg-success")} />
          <Clock className={cn("h-3.5 w-3.5", isLowTime ? "text-destructive" : "text-muted-foreground")} />
          <span className={cn("font-mono-stats text-base font-black tracking-wide", isLowTime ? "text-destructive" : "text-foreground")}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{paused ? "Retomar" : "Pausar"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive"
          >
            <X className="h-3.5 w-3.5 md:hidden" />
            <span className="hidden md:inline">Encerrar</span>
          </button>
        </div>
      </header>

      {/* Pause overlay */}
      {paused && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="text-center animate-fade-in">
            <Pause className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">Simulado Pausado</h2>
            <p className="mt-1 text-sm text-muted-foreground">O timer está congelado</p>
            <button
              type="button"
              onClick={() => setPaused(false)}
              className="mt-6 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover"
            >
              Retomar Simulado
            </button>
          </div>
        </div>
      )}

      {/* Main content + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
          <div className="mx-auto max-w-[720px] animate-fade-in" key={currentIdx}>
            {/* Tema badge */}
            <div className="mb-4">
              <span className="inline-flex rounded-md border border-gold/20 bg-gold-muted px-2.5 py-1 text-[10px] font-semibold text-gold">
                {q.tema}
              </span>
            </div>

            {/* Enunciado */}
            <div className="mb-6 rounded-r-lg border-l-2 border-l-gold bg-gold-muted/40 px-4 py-4 md:px-5">
              <p className="text-sm leading-[1.8] text-foreground md:text-[15px]">{q.enunciado}</p>
            </div>

            {/* Alternativas */}
            <div className="space-y-2.5">
              {q.alternativas.map((alt) => {
                const selected = st.answered === alt.letra;
                return (
                  <button
                    key={alt.letra}
                    type="button"
                    onClick={() => selectAnswer(alt.letra)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-150 min-h-[44px] md:px-4 md:py-3.5",
                      selected ? "border-gold/50 bg-gold-muted" : "border-border bg-card hover:border-gold/20 hover:bg-accent/40"
                    )}
                  >
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono-stats text-xs font-bold transition-colors",
                      selected ? "border-gold/50 bg-gold/15 text-gold" : "border-border bg-secondary text-muted-foreground"
                    )}>
                      {alt.letra}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-foreground">{alt.texto}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom nav */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground disabled:opacity-30 hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden md:inline">Anterior</span>
              </button>

              <button
                type="button"
                onClick={toggleFlag}
                className={cn(
                  "flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  st.flagged ? "border-warning/40 bg-warning/10 text-warning" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Flag className={cn("h-3.5 w-3.5", st.flagged && "fill-current")} />
                <span className="hidden md:inline">{st.flagged ? "Marcada" : "Marcar"}</span>
              </button>

              {/* Mobile: open nav sheet */}
              <button
                type="button"
                onClick={() => setShowNavSheet(true)}
                className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground lg:hidden"
              >
                {answered}/{questions.length}
              </button>

              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                disabled={currentIdx === questions.length - 1}
                className={cn(
                  "flex min-h-[44px] items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-30 transition-colors",
                  st.answered ? "text-gold hover:text-gold/80 font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="hidden md:inline">Próxima</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <ExamSidebar
          states={states}
          currentIdx={currentIdx}
          onGoTo={setCurrentIdx}
          onFinish={() => setShowConfirm(true)}
        />
      </div>

      {/* Mobile bottom sheet */}
      <Drawer open={showNavSheet} onOpenChange={setShowNavSheet}>
        <DrawerContent className="max-h-[70vh] lg:hidden">
          <DrawerTitle className="sr-only">Navegação de questões</DrawerTitle>
          <div className="overflow-y-auto p-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {states.map((s, i) => {
                const isCurrent = i === currentIdx;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setCurrentIdx(i); setShowNavSheet(false); }}
                    className={cn(
                      "flex h-11 w-full items-center justify-center rounded-lg border font-mono-stats text-xs font-semibold relative",
                      isCurrent ? "bg-white text-black ring-2 ring-gold" : s.answered ? "bg-gold text-background border-gold/30" : "border-border bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    {i + 1}
                    {s.flagged && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning border-2 border-background" />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => { setShowNavSheet(false); setShowConfirm(true); }}
              className="h-12 w-full rounded-xl bg-gold text-sm font-bold text-background shadow-lg shadow-gold/20"
            >
              Finalizar Simulado
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Finalizar simulado?</h2>
            </div>
            <div className="mb-6 space-y-2 rounded-lg border border-border bg-secondary/30 p-4">
              {[
                { label: "Respondidas", value: `${answered}/${questions.length}`, color: "text-foreground" },
                { label: "Não respondidas", value: String(questions.length - answered), color: "text-warning" },
                { label: "Marcadas", value: String(states.filter((s) => s.flagged).length), color: "text-foreground" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-mono-stats font-semibold", color)}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-border bg-secondary py-2.5 text-sm font-medium text-foreground hover:bg-accent">
                Revisar Pendentes
              </button>
              <button type="button" onClick={handleFinish}
                className="flex-1 rounded-xl bg-gold py-2.5 text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover">
                Finalizar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/SimuladoExamPage.tsx
git commit -m "feat(simulados): add SimuladoExamPage with save on finish and route guard"
```

---

## Task 11: QuestionReviewList Component

**Files:**
- Create: `src/components/simulado/QuestionReviewList.tsx`

- [ ] **Step 1: Create `src/components/simulado/QuestionReviewList.tsx`**

```typescript
import { useState } from "react";
import { Check, X, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { getQuestionExplicacoes } from "@/services/questions";
import { cn } from "@/lib/utils";

export interface ReviewQuestion {
  dbId: number;
  displayId: number; // 1-based
  tema: string;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  correta: string;
  userAnswer: string | null;
}

interface QuestionReviewListProps {
  questions: ReviewQuestion[];
}

function QuestionReviewItem({ q }: { q: ReviewQuestion }) {
  const [expanded, setExpanded] = useState(false);
  const [explicacoes, setExplicacoes] = useState<Record<string, string> | null>(null);
  const [loadingExp, setLoadingExp] = useState(false);

  const isCorrect = q.userAnswer === q.correta;
  const isBlank = !q.userAnswer;

  const handleToggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !explicacoes) {
      setLoadingExp(true);
      try {
        const data = await getQuestionExplicacoes(q.dbId);
        setExplicacoes(data);
      } finally {
        setLoadingExp(false);
      }
    }
  };

  const rowBg = isBlank
    ? "border-border bg-secondary/20"
    : isCorrect
      ? "border-success/20 bg-success/5"
      : "border-destructive/20 bg-destructive/5";

  const icon = isBlank
    ? <Minus className="h-3 w-3 text-muted-foreground" />
    : isCorrect
      ? <Check className="h-3 w-3 text-background" />
      : <X className="h-3 w-3 text-background" />;

  const iconBg = isBlank ? "bg-muted" : isCorrect ? "bg-success" : "bg-destructive";

  return (
    <div className={cn("rounded-xl border overflow-hidden", rowBg, isBlank && "opacity-80")}>
      {/* Collapsed row */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md", iconBg)}>
          {icon}
        </div>
        <span className="font-mono-stats text-[10px] text-muted-foreground w-4 shrink-0">{q.displayId.toString().padStart(2, "0")}</span>
        <span className="flex-1 truncate text-xs text-muted-foreground">{q.enunciado}</span>
        <span className="shrink-0 text-[10px] text-muted-foreground hidden sm:inline">{q.tema}</span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50">
          {/* Alternatives */}
          <div className="space-y-1.5 pt-3">
            {q.alternativas.map((alt) => {
              const isUserAnswer = alt.letra === q.userAnswer;
              const isCorrectAlt = alt.letra === q.correta;
              let style = "border-border bg-secondary/20";
              if (isUserAnswer && !isCorrectAlt) style = "border-destructive/50 bg-destructive/10";
              if (isCorrectAlt) style = "border-success/50 bg-success/10";
              return (
                <div key={alt.letra} className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2", style)}>
                  <span className={cn(
                    "font-mono-stats text-xs font-bold shrink-0 w-4",
                    isCorrectAlt ? "text-success" : isUserAnswer ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {alt.letra}
                  </span>
                  <span className="text-xs text-foreground flex-1">{alt.texto}</span>
                  {isCorrectAlt && (
                    <span className="text-[9px] font-semibold text-success shrink-0">← correta</span>
                  )}
                  {isUserAnswer && !isCorrectAlt && (
                    <span className="text-[9px] font-semibold text-destructive shrink-0">← sua resposta</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {loadingExp && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-3 w-3 animate-spin rounded-full border border-border border-t-muted-foreground" />
              Carregando explicação...
            </div>
          )}
          {explicacoes && (
            <div className="rounded-lg border border-border bg-background/50 p-3 space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Explicação</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {explicacoes[q.correta] ?? Object.values(explicacoes)[0] ?? "Sem explicação disponível."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuestionReviewList({ questions }: QuestionReviewListProps) {
  return (
    <div className="space-y-2">
      {questions.map((q) => (
        <QuestionReviewItem key={q.dbId} q={q} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/simulado/QuestionReviewList.tsx
git commit -m "feat(simulados): add QuestionReviewList with on-demand explanation fetch"
```

---

## Task 12: SimuladoResultsPage

**Files:**
- Create: `src/pages/SimuladoResultsPage.tsx`

- [ ] **Step 1: Create `src/pages/SimuladoResultsPage.tsx`**

```typescript
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play } from "lucide-react";
import { useSimuladoSession } from "@/hooks/useSimuladoSession";
import { QuestionReviewList } from "@/components/simulado/QuestionReviewList";
import type { ReviewQuestion } from "@/components/simulado/QuestionReviewList";
import { computeTemaPerf, formatTime, scoreColorClass, secondsToHumanShort } from "@/lib/simuladoUtils";
import { DashboardSkeleton } from "@/components/Skeletons";
import { cn } from "@/lib/utils";
// NOTE: To show question text in the review list we need to re-fetch questions
// by their DB ids. For the MVP, we show enunciado from a secondary query.
// This hook fetches them:
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

function useQuestionsByIds(ids: number[]) {
  return useQuery({
    queryKey: ["questions-by-ids", ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data: qRows, error: qErr } = await supabase
        .from("questions")
        .select("id, enunciado, topic_id")
        .in("id", ids);
      if (qErr) throw qErr;

      const { data: alts, error: altErr } = await supabase
        .from("alternatives")
        .select("*")
        .in("question_id", ids)
        .order("ordem");
      if (altErr) throw altErr;

      const { data: topics } = await supabase
        .from("topics")
        .select("id, nome")
        .in("id", (qRows ?? []).map((q) => q.topic_id));
      const topicMap = new Map((topics ?? []).map((t) => [t.id, t.nome]));

      const altsByQ = new Map<number, { letra: string; texto: string; is_correct: boolean }[]>();
      for (const a of alts ?? []) {
        const list = altsByQ.get(a.question_id) ?? [];
        list.push(a);
        altsByQ.set(a.question_id, list);
      }

      return (qRows ?? []).map((q) => {
        const qAlts = altsByQ.get(q.id) ?? [];
        const correctAlt = qAlts.find((a) => a.is_correct);
        return {
          id: q.id,
          enunciado: q.enunciado as string,
          tema: topicMap.get(q.topic_id) ?? "",
          alternativas: qAlts.map((a) => ({ letra: a.letra, texto: a.texto })),
          correta: correctAlt?.letra ?? "A",
        };
      });
    },
    enabled: ids.length > 0,
  });
}

export default function SimuladoResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading: isSessionLoading } = useSimuladoSession(id);
  const { data: fetchedQuestions, isLoading: isQLoading } = useQuestionsByIds(session?.questionIds ?? []);

  const temaPerf = useMemo(() => {
    if (!fetchedQuestions || !session) return [];
    const qs = fetchedQuestions.map((q) => ({ dbId: q.id, tema: q.tema, correta: q.correta }));
    return computeTemaPerf(qs, session.answers);
  }, [fetchedQuestions, session]);

  const reviewQuestions: ReviewQuestion[] = useMemo(() => {
    if (!fetchedQuestions || !session) return [];
    return session.questionIds.map((dbId, i) => {
      const fq = fetchedQuestions.find((q) => q.id === dbId);
      return {
        dbId,
        displayId: i + 1,
        tema: fq?.tema ?? "",
        enunciado: fq?.enunciado ?? "",
        alternativas: fq?.alternativas ?? [],
        correta: fq?.correta ?? "",
        userAnswer: session.answers[String(dbId)] ?? null,
      };
    });
  }, [fetchedQuestions, session]);

  const createdDate = session
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(session.createdAt))
    : "";

  const feedbackMsg =
    !session ? "" :
    session.score >= 70 ? "Parabéns! 🎉" :
    session.score >= 50 ? "Bom trabalho! 💪" :
    "Continue praticando! 📚";

  if (isSessionLoading || isQLoading) return <DashboardSkeleton />;
  if (!session) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Sessão não encontrada.</p>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-6 backdrop-blur-md">
        <button type="button" onClick={() => navigate("/simulados")}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />
          Simulados
        </button>
        <span className="text-muted-foreground/40">|</span>
        <span className="text-sm font-bold text-foreground">Resultado — {session.disciplina}</span>
        <span className="ml-auto text-xs text-muted-foreground">{createdDate} · {secondsToHumanShort(session.timeUsedSec)}</span>
      </header>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

        {/* LEFT: Score panel */}
        <div className="lg:w-[360px] lg:shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card/30 p-6 lg:p-8 flex flex-col gap-5 lg:overflow-y-auto">

          {/* Score hero */}
          <div className="text-center py-4">
            <p className={cn("font-mono-stats text-7xl font-black leading-none", scoreColorClass(session.score))}>
              {session.score}%
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{session.correct} de {session.questionIds.length} acertos</p>
            <p className={cn("mt-1 text-sm font-semibold", scoreColorClass(session.score))}>{feedbackMsg}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "acertos", value: String(session.correct), color: "text-success bg-success/5 border-success/20" },
              { label: "erros", value: String(session.wrong), color: "text-destructive bg-destructive/5 border-destructive/20" },
              { label: "em branco", value: String(session.blank), color: "text-muted-foreground bg-secondary/30 border-border" },
              { label: "tempo usado", value: formatTime(session.timeUsedSec), color: "text-foreground bg-secondary/30 border-border" },
            ].map(({ label, value, color }) => (
              <div key={label} className={cn("rounded-xl border p-3 text-center", color)}>
                <p className="font-mono-stats text-xl font-black">{value}</p>
                <p className="text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tema bars */}
          {temaPerf.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Por tema</p>
              {temaPerf.map((t) => (
                <div key={t.tema} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">{t.tema}</span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700",
                        t.pct >= 70 ? "bg-success" : t.pct >= 50 ? "bg-warning" : "bg-destructive")}
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                  <span className={cn("w-8 text-right font-mono-stats text-xs font-bold", scoreColorClass(t.pct))}>
                    {t.pct}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto space-y-2.5">
            <button
              type="button"
              onClick={() => navigate("/simulados/novo", { state: { disciplina: session.disciplina } })}
              className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-bold text-background shadow-lg shadow-gold/20 hover:bg-gold-hover transition-colors"
            >
              <Play className="h-4 w-4" />
              Refazer este Simulado
            </button>
            <button
              type="button"
              onClick={() => navigate("/simulados")}
              className="flex w-full h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              ← Voltar ao Hub
            </button>
          </div>
        </div>

        {/* RIGHT: Question review */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Revisão de questões — clique para expandir
          </p>
          <QuestionReviewList questions={reviewQuestions} />
        </div>

      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/SimuladoResultsPage.tsx
git commit -m "feat(simulados): add SimuladoResultsPage with score panel and expandable question review"
```

---

## Task 13: Wire Routes in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add lazy imports for new pages**

In `src/App.tsx`, after the existing `SimuladoPage` import, add:

```typescript
const SimuladosHubPage = lazy(() => import("./pages/SimuladosHubPage"));
const SimuladoConfigPage = lazy(() => import("./pages/SimuladoConfigPage"));
const SimuladoExamPage = lazy(() => import("./pages/SimuladoExamPage"));
const SimuladoResultsPage = lazy(() => import("./pages/SimuladoResultsPage"));
```

- [ ] **Step 2: Replace the simulados route**

Find and replace the existing simulados route (line ~92):

```typescript
// REMOVE:
<Route path="/simulados" element={<ProtectedRoute><SimuladoPage /></ProtectedRoute>} />

// REPLACE WITH:
<Route path="/simulados" element={<ProtectedRoute><AppLayout><SimuladosHubPage /></AppLayout></ProtectedRoute>} />
<Route path="/simulados/novo" element={<ProtectedRoute><SimuladoConfigPage /></ProtectedRoute>} />
<Route path="/simulados/ativo" element={<ProtectedRoute><SimuladoExamPage /></ProtectedRoute>} />
<Route path="/simulados/:id" element={<ProtectedRoute><SimuladoResultsPage /></ProtectedRoute>} />
```

Note: `/simulados` uses `AppLayout` (sidebar navigation). `/simulados/novo`, `/simulados/ativo`, `/simulados/:id` are full-screen (no `AppLayout`), matching the existing pattern for `SimuladoPage`.

- [ ] **Step 3: Remove old `SimuladoPage` import and file**

Remove the lazy import line for `SimuladoPage` from `App.tsx`:
```typescript
// DELETE this line:
const SimuladoPage = lazy(() => import("./pages/SimuladoPage"));
```

Then delete the old file:
```bash
rm src/pages/SimuladoPage.tsx
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 6: Smoke test in browser**

```bash
npm run dev
```

Visit:
1. `http://localhost:8080/simulados` → hub page loads, empty state or history cards visible
2. Click "Novo Simulado" → config page with two panels
3. Select discipline, click "Iniciar Simulado" → exam page loads with questions
4. Answer some questions, click "Finalizar Simulado" → confirm modal → saving screen → results page
5. On results page, click a question row → expands with alternativas + explanation
6. Click "Refazer" → back to config with discipline pre-selected
7. Click "← Voltar ao Hub" → hub shows the new session card

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat(simulados): wire new routes, remove legacy SimuladoPage"
```

---

## Self-Review Checklist

- [x] **Hub** — stats + card grid + empty state: Task 7
- [x] **SimuladoCard** — score color, tema bars (worst first), Refazer pre-selects discipline: Task 6
- [x] **Config** — two-panel, last simulado hint, auto-time toggle, mobile CTA: Task 8
- [x] **Exam** — route guard, save on finish, sidebar stats, keyboard shortcuts, mobile drawer: Task 10
- [x] **ExamSidebar** — answered/flagged stats, progress bar, grid with dot indicator: Task 9
- [x] **Results** — score panel, tema bars, expandable questions with correct/wrong highlight + explanation: Tasks 11–12
- [x] **`dbId` on SimuladoQuestion** — fixed in `generateSimuladoQuestions` Task 4
- [x] **`simulado_sessions` table** — migration in Task 1, service in Task 4, hooks in Task 5
- [x] **Explanations fetched on-demand** — implemented in `QuestionReviewList` Task 11
- [x] **Utility functions tested** — Task 3
- [x] **Routes registered** — Task 13
