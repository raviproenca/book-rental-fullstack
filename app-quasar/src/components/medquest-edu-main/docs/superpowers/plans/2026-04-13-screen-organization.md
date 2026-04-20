# Screen Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Design System de Densidade to the Dashboard and all secondary screens, reducing information overload through editorial hierarchy, list limits, and a 2-column layout.

**Architecture:** No new components or routes. Changes are isolated to page-level files and one shared hook. Collapsed/expanded state for tertiary content is persisted via `localStorage` through a shared `useLocalStorageState` hook. Each page change is a self-contained commit.

**Tech Stack:** React 18, Tailwind CSS v3, shadcn/ui, Lucide React, Vitest + React Testing Library

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `src/hooks/useLocalStorageState.ts` | Create | Typed hook for localStorage-backed boolean state |
| `src/test/useLocalStorageState.test.ts` | Create | Unit tests for the hook |
| `src/pages/Index.tsx` | Modify | Spacing, quick actions, 2-col layout, disciplines limit, remove recent sessions |
| `src/pages/PerformancePage.tsx` | Modify | List limits (disciplinePerf, weakTopics, simuladoHistory), collapsible heatmap |
| `src/pages/LeaderboardPage.tsx` | Modify | Compact podium on small screens |
| `src/pages/BookmarksPage.tsx` | Modify | Uniform spacing |

---

## Task 1: Create `useLocalStorageState` hook

**Files:**
- Create: `src/hooks/useLocalStorageState.ts`
- Create: `src/test/useLocalStorageState.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/test/useLocalStorageState.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

describe("useLocalStorageState", () => {
  beforeEach(() => localStorage.clear());

  it("returns initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorageState("test-key", false));
    expect(result.current[0]).toBe(false);
  });

  it("returns initial value of a different type (string)", () => {
    const { result } = renderHook(() => useLocalStorageState("test-str", "hello"));
    expect(result.current[0]).toBe("hello");
  });

  it("persists new value to localStorage on update", () => {
    const { result } = renderHook(() => useLocalStorageState("test-key", false));
    act(() => result.current[1](true));
    expect(JSON.parse(localStorage.getItem("test-key")!)).toBe(true);
  });

  it("reads persisted value on mount, ignoring initialValue", () => {
    localStorage.setItem("test-key", JSON.stringify(true));
    const { result } = renderHook(() => useLocalStorageState("test-key", false));
    expect(result.current[0]).toBe(true);
  });

  it("updates state correctly on successive calls", () => {
    const { result } = renderHook(() => useLocalStorageState("test-key", 0));
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    act(() => result.current[1](10));
    expect(result.current[0]).toBe(10);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
bun run test src/test/useLocalStorageState.test.ts
```

Expected: FAIL — "Cannot find module '@/hooks/useLocalStorageState'"

- [ ] **Step 3: Implement the hook**

```ts
// src/hooks/useLocalStorageState.ts
import { useState, useEffect } from "react";

export function useLocalStorageState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage quota exceeded or private browsing — fail silently
    }
  }, [key, state]);

  return [state, setState];
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
bun run test src/test/useLocalStorageState.test.ts
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useLocalStorageState.ts src/test/useLocalStorageState.test.ts
git commit -m "feat: add useLocalStorageState hook with tests"
```

---

## Task 2: Dashboard — Spacing, Quick Actions, 2-Column Layout, Remove Recent Sessions

**Files:**
- Modify: `src/pages/Index.tsx`

This task restructures `Index.tsx` with all layout changes in one commit:
- `space-y-8` → `space-y-6`
- Quick Actions: 4 equal buttons → 1 primary + 3 compact secondary
- Grid layout: disciplines move inside the main col of the 3-col grid
- "Atividade Recente" section removed entirely

- [ ] **Step 1: Replace the outer wrapper spacing**

In `src/pages/Index.tsx`, find:
```tsx
return (
  <div className="space-y-8 animate-fade-in">
```

Replace with:
```tsx
return (
  <div className="space-y-6 animate-fade-in">
```

- [ ] **Step 2: Replace the Quick Actions section**

Find and replace the entire `{/* ── Section 2: Quick Actions ── */}` block:

```tsx
{/* ── Section 2: Quick Actions ── */}
<div>
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
    Ações Rápidas
  </h2>
  <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
    {quickActions.map((action) => (
      <button
        key={action.title}
        onClick={action.onClick}
        className="group flex min-w-[200px] shrink-0 items-center gap-3.5 rounded-xl border border-border bg-card p-4 text-left transition-all duration-200 md:min-w-0 md:hover:-translate-y-0.5 md:hover:border-gold/25 md:hover:shadow-lg md:hover:shadow-gold/[0.04] active:scale-[0.98]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-muted">
          <action.icon className="h-5 w-5 text-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{action.title}</p>
          <p className="truncate text-xs text-muted-foreground">{action.desc}</p>
        </div>
        <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gold md:block" />
      </button>
    ))}
  </div>
</div>
```

Replace with:

```tsx
{/* ── Section 2: Quick Actions ── */}
<div>
  <button
    onClick={() => navigate('/praticar/sessao', { state: { mode: 'quick' } })}
    className="mb-3 flex items-center gap-2.5 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-background shadow-md shadow-gold/20 transition-all hover:bg-gold-hover active:scale-[0.98]"
  >
    <Zap className="h-4 w-4 shrink-0" />
    Prática Rápida — 10 questões aleatórias
  </button>
  <div className="flex flex-wrap gap-2">
    {[
      { icon: RotateCcw, title: "Revisão de Erros", onClick: () => navigate('/review') },
      { icon: Clock,     title: "Simulado",          onClick: () => navigate('/simulados') },
      { icon: Play,      title: "Continuar",          onClick: () => navigate('/praticar/sessao', { state: { mode: 'continue' } }) },
    ].map((action) => (
      <button
        key={action.title}
        onClick={action.onClick}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-gold/20 hover:bg-accent hover:text-foreground active:scale-[0.98]"
      >
        <action.icon className="h-3.5 w-3.5 shrink-0" />
        {action.title}
      </button>
    ))}
  </div>
</div>
```

Also remove the now-unused `quickActions` array and the `Star`, `BookOpen`, `TrendingUp` imports if they are no longer used after all changes in this task. Keep only what's used.

- [ ] **Step 3: Restructure the 3-column grid to include disciplines**

Find and replace the entire `{/* ── Section 3 + 6 ── */}` block through the end of `{/* ── Section 5 ── */}`:

```tsx
      {/* ── Section 3 + 6: Weekly Chart + Leaderboard ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Chart */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          ...chart...
        </div>

        {/* Leaderboard */}
        <div className="rounded-xl border border-border bg-card p-5">
          ...leaderboard...
        </div>
      </div>

      {/* ── Section 4: Discipline Performance ── */}
      <div className="rounded-xl border border-border bg-card p-5">
        ...disciplines...
      </div>

      {/* ── Section 5: Recent Activity ── */}
      <div className="rounded-xl border border-border bg-card p-5">
        ...sessions...
      </div>
```

Replace with (keeping the chart and leaderboard JSX internals intact — only the wrapper structure changes, and Section 5 is removed):

```tsx
      {/* ── Section 3+4: Main col (chart + disciplines) / Sidebar (leaderboard) ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column — 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Weekly Chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Progresso da Semana
              </h2>
              <span className="font-mono-stats text-xs text-muted-foreground">
                {weeklyData.reduce((a, d) => a + d.questoes, 0)} questões
              </span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.gold} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColors.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridLine} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: chartColors.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: chartColors.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine
                    y={20}
                    stroke={chartColors.border}
                    strokeDasharray="6 4"
                    label={{ value: "Meta", position: "right", fill: chartColors.muted, fontSize: 10 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="questoes"
                    stroke={chartColors.gold}
                    strokeWidth={2}
                    fill="url(#goldGrad)"
                    dot={{ r: 3, fill: chartColors.gold, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: chartColors.gold, strokeWidth: 2, stroke: chartColors.background }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Discipline Performance — limited to 4, ver mais handled in Task 3 */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Desempenho por Disciplina
              </h2>
              <span className="text-xs text-muted-foreground">
                {disciplines.reduce((a, d) => a + d.feitas, 0)} questões no total
              </span>
            </div>
            <div className="space-y-3.5">
              {sortedDisciplines.map((d, i) => (
                <div key={d.name} className="flex items-center gap-4">
                  {i < 3 && (
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-gold" />
                  )}
                  {i >= 3 && <div className="w-3.5" />}
                  <span className="w-36 shrink-0 text-sm text-foreground">{d.name}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", acertoColor(d.acerto))}
                      style={{ width: `${d.acerto}%` }}
                    />
                  </div>
                  <span className={cn("w-10 text-right font-mono-stats text-xs font-semibold", acertoText(d.acerto))}>
                    {d.acerto}%
                  </span>
                  <span className="w-16 text-right font-mono-stats text-xs text-muted-foreground">
                    {d.feitas}q
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar — 1/3: Leaderboard */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ranking Semanal
            </h2>
            <Trophy className="h-4 w-4 text-gold" />
          </div>
          <div className="space-y-2.5">
            {leaderboard.map((user) => (
              <div
                key={user.pos}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  user.isUser ? "bg-gold-muted border border-gold/15" : "hover:bg-accent"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-mono-stats text-xs font-bold",
                    user.pos <= 3 ? "bg-gold/15 text-gold" : "text-muted-foreground"
                  )}
                >
                  {user.pos}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                  {user.avatar}
                </div>
                <span className={cn("flex-1 text-sm", user.isUser ? "font-semibold text-foreground" : "text-foreground")}>
                  {user.name}
                  {user.isUser && <span className="ml-1 text-[10px] text-gold">(você)</span>}
                </span>
                <span className="font-mono-stats text-xs text-muted-foreground">{user.xp.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/ranking')}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
          >
            Ver ranking completo
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
```

Note: "Atividade Recente" (Section 5) is omitted — do not add it back.

- [ ] **Step 4: Remove unused code**

After the JSX changes:

1. Remove the `quickActions` array declaration (it was the `const quickActions = [...]` block inside the component — the new JSX inlines the actions directly).
2. Remove any `lucide-react` imports no longer referenced: `BookOpen` and `Star` were only used in the removed sections — verify and remove if unused. Keep `Zap`, `RotateCcw`, `Clock`, `Play`, `ArrowRight`, `Trophy`, `TrendingUp` — all still used.

- [ ] **Step 5: Run the full test suite**

```bash
bun run test
```

Expected: All existing tests pass (no new assertions yet).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "refactor(dashboard): compact quick actions, 2-col layout, remove recent sessions"
```

---

## Task 3: Dashboard — Disciplines "ver mais" (4 visible by default)

**Files:**
- Modify: `src/pages/Index.tsx`

- [ ] **Step 1: Import `useLocalStorageState`**

In `src/pages/Index.tsx`, add to the import block:

```tsx
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
```

- [ ] **Step 2: Add state for disciplines expansion**

Inside the `Dashboard` component, after the existing state declarations (after `const sortedDisciplines = ...`):

```tsx
const [showAllDisciplines, setShowAllDisciplines] = useLocalStorageState(
  "dashboard:showAllDisciplines",
  false
);
const visibleDisciplines = showAllDisciplines
  ? sortedDisciplines
  : sortedDisciplines.slice(0, 4);
```

- [ ] **Step 3: Replace `sortedDisciplines.map(...)` with `visibleDisciplines.map(...)` and add toggle button**

In the Discipline Performance section (inside the main column div from Task 2), replace:

```tsx
<div className="space-y-3.5">
  {sortedDisciplines.map((d, i) => (
```

with:

```tsx
<div className="space-y-3.5">
  {visibleDisciplines.map((d, i) => (
```

And after the closing `</div>` of the `space-y-3.5` div, add:

```tsx
{sortedDisciplines.length > 4 && (
  <button
    onClick={() => setShowAllDisciplines(!showAllDisciplines)}
    className="mt-3 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
  >
    {showAllDisciplines
      ? "Ver menos"
      : `Ver todas (${sortedDisciplines.length})`}
  </button>
)}
```

- [ ] **Step 4: Run tests**

```bash
bun run test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "feat(dashboard): limit disciplines to 4 with localStorage-persisted ver mais"
```

---

## Task 4: PerformancePage — Limit Lists to 4 with "ver mais"

**Files:**
- Modify: `src/pages/PerformancePage.tsx`

The lists to limit: `disciplinePerf` (Card 3), `weakTopics` (Card 5), `simuladoHistory` (Card 6). Each gets its own `useLocalStorageState` key.

- [ ] **Step 1: Import `useLocalStorageState` and `ChevronDown`**

In `src/pages/PerformancePage.tsx`, update the imports:

```tsx
// Add to lucide-react imports:
import {
  BookOpen, Target, Flame, Clock, TrendingUp, TrendingDown,
  ArrowRight, Play, FileText, Download, ChevronDown,
} from "lucide-react";

// Add after other hook imports:
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
```

- [ ] **Step 2: Add the three "ver mais" states inside `PerformancePage`**

After `const simuladoHistory = ...`, add:

```tsx
const [showAllDisciplinePerf, setShowAllDisciplinePerf] = useLocalStorageState(
  "perf:showAllDisciplinePerf",
  false
);
const [showAllWeakTopics, setShowAllWeakTopics] = useLocalStorageState(
  "perf:showAllWeakTopics",
  false
);
const [showAllSimuladoHistory, setShowAllSimuladoHistory] = useLocalStorageState(
  "perf:showAllSimuladoHistory",
  false
);

const visibleDisciplinePerf = showAllDisciplinePerf
  ? disciplinePerf
  : disciplinePerf.slice(0, 4);
const visibleWeakTopics = showAllWeakTopics
  ? weakTopics
  : weakTopics.slice(0, 4);
const visibleSimuladoHistory = showAllSimuladoHistory
  ? simuladoHistory
  : simuladoHistory.slice(0, 4);
```

- [ ] **Step 3: Update Card 3 (Discipline Performance) to use `visibleDisciplinePerf`**

Find in Card 3:
```tsx
{disciplinePerf.map((d, i) => (
```

Replace with:
```tsx
{visibleDisciplinePerf.map((d, i) => (
```

After the closing `</div>` of the map's parent `<div className="space-y-3">`, add:

```tsx
{disciplinePerf.length > 4 && (
  <button
    onClick={() => setShowAllDisciplinePerf(!showAllDisciplinePerf)}
    className="mt-3 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
  >
    {showAllDisciplinePerf ? "Ver menos" : `Ver todas (${disciplinePerf.length})`}
  </button>
)}
```

- [ ] **Step 4: Update Card 5 (Weak Topics) to use `visibleWeakTopics`**

Find in Card 5:
```tsx
{weakTopics.map((t) => (
```

Replace with:
```tsx
{visibleWeakTopics.map((t) => (
```

After the closing `</div>` of the map's parent `<div className="space-y-2">`, add:

```tsx
{weakTopics.length > 4 && (
  <button
    onClick={() => setShowAllWeakTopics(!showAllWeakTopics)}
    className="mt-3 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
  >
    {showAllWeakTopics ? "Ver menos" : `Ver todos (${weakTopics.length})`}
  </button>
)}
```

- [ ] **Step 5: Update Card 6 (Simulado History) to use `visibleSimuladoHistory`**

Find in Card 6:
```tsx
{simuladoHistory.map((s) => (
```

Replace with:
```tsx
{visibleSimuladoHistory.map((s) => (
```

After the closing `</div>` of the map's parent `<div className="space-y-2">`, add:

```tsx
{simuladoHistory.length > 4 && (
  <button
    onClick={() => setShowAllSimuladoHistory(!showAllSimuladoHistory)}
    className="mt-3 text-xs font-medium text-gold transition-colors hover:text-gold-hover"
  >
    {showAllSimuladoHistory ? "Ver menos" : `Ver todos (${simuladoHistory.length})`}
  </button>
)}
```

- [ ] **Step 6: Run tests**

```bash
bun run test
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/pages/PerformancePage.tsx
git commit -m "feat(performance): limit discipline, weak topics and simulado lists to 4 with ver mais"
```

---

## Task 5: PerformancePage — Collapsible Heatmap (Tertiary Content)

**Files:**
- Modify: `src/pages/PerformancePage.tsx`

The heatmap is tertiary (historical data). It should be collapsed by default on all breakpoints, with toggle state persisted to localStorage.

- [ ] **Step 1: Add heatmap collapsed state**

Inside `PerformancePage`, after the `visibleSimuladoHistory` declaration from Task 4, add:

```tsx
const [heatmapOpen, setHeatmapOpen] = useLocalStorageState("perf:heatmapOpen", false);
```

- [ ] **Step 2: Replace the Heatmap card with a collapsible version**

Find the entire Card 4 block:

```tsx
{/* Card 4 — Heatmap */}
<div className="rounded-xl border border-border bg-card p-5">
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
    Atividade (últimos 90 dias)
  </h2>
  <Heatmap heatmapData={heatmapData} />
  <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
    <span>Menos</span>
    {["bg-secondary", "bg-gold/20", "bg-gold/40", "bg-gold/60", "bg-gold/80"].map((c) => (
      <div key={c} className={cn("h-[10px] w-[10px] rounded-[2px]", c)} />
    ))}
    <span>Mais</span>
  </div>
</div>
```

Replace with:

```tsx
{/* Card 4 — Heatmap (tertiary, collapsed by default) */}
<div className="rounded-xl border border-border bg-card p-5">
  <button
    onClick={() => setHeatmapOpen(!heatmapOpen)}
    className="flex w-full items-center justify-between"
    aria-expanded={heatmapOpen}
  >
    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      Atividade (últimos 90 dias)
    </h2>
    <ChevronDown
      className={cn(
        "h-4 w-4 text-muted-foreground transition-transform duration-200",
        heatmapOpen && "rotate-180"
      )}
    />
  </button>
  {heatmapOpen && (
    <div className="mt-4">
      <Heatmap heatmapData={heatmapData} />
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Menos</span>
        {["bg-secondary", "bg-gold/20", "bg-gold/40", "bg-gold/60", "bg-gold/80"].map((c) => (
          <div key={c} className={cn("h-[10px] w-[10px] rounded-[2px]", c)} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  )}
</div>
```

- [ ] **Step 3: Run tests**

```bash
bun run test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PerformancePage.tsx
git commit -m "feat(performance): collapsible heatmap, collapsed by default"
```

---

## Task 6: LeaderboardPage — Compact Podium on Small Screens

**Files:**
- Modify: `src/pages/LeaderboardPage.tsx`

The podium cards use fixed widths (`w-44`, `w-36`) that are fine on desktop but visually heavy on smaller viewports. Scale them down below `sm` breakpoint.

- [ ] **Step 1: Update podium card widths to be responsive**

Find the podium card className:
```tsx
className={cn(
  "flex flex-col items-center rounded-2xl border border-border p-4 transition-all",
  isFirst ? "w-44 pb-6" : "w-36",
  colors.bg
)}
```

Replace with:
```tsx
className={cn(
  "flex flex-col items-center rounded-2xl border border-border p-3 transition-all sm:p-4",
  isFirst ? "w-32 pb-4 sm:w-44 sm:pb-6" : "w-24 sm:w-36",
  colors.bg
)}
```

- [ ] **Step 2: Scale avatar sizes responsively**

Find:
```tsx
className={cn(
  "mb-2 flex items-center justify-center rounded-full ring-2 font-semibold",
  isFirst ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm",
  colors.ring, "bg-secondary text-foreground"
)}
```

Replace with:
```tsx
className={cn(
  "mb-2 flex items-center justify-center rounded-full ring-2 font-semibold",
  isFirst ? "h-10 w-10 text-base sm:h-16 sm:w-16 sm:text-lg" : "h-8 w-8 text-xs sm:h-12 sm:w-12 sm:text-sm",
  colors.ring, "bg-secondary text-foreground"
)}
```

- [ ] **Step 3: Scale XP value font size responsively**

Find:
```tsx
<div className={cn("mt-2 font-mono-stats font-bold", isFirst ? "text-lg" : "text-sm", colors.text)}>
```

Replace with:
```tsx
<div className={cn("mt-2 font-mono-stats font-bold", isFirst ? "text-sm sm:text-lg" : "text-xs sm:text-sm", colors.text)}>
```

- [ ] **Step 4: Run tests**

```bash
bun run test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/LeaderboardPage.tsx
git commit -m "refactor(ranking): responsive podium sizing for small screens"
```

---

## Task 7: BookmarksPage — Uniform Spacing

**Files:**
- Modify: `src/pages/BookmarksPage.tsx`

Read the full file and apply `space-y-6` between top-level sections and `p-5` for card padding where inconsistent.

- [ ] **Step 1: Read the full BookmarksPage**

Open `src/pages/BookmarksPage.tsx` and identify any `space-y-4`, `space-y-8`, `p-4`, or `p-6` on card/section wrappers (not on list items or inner elements).

- [ ] **Step 2: Apply uniform spacing**

For any top-level section wrapper using `space-y-4` or `space-y-8`, change to `space-y-6`.

For any card-level div using `p-4` or `p-6` as the primary padding (not an inner list item), change to `p-5`.

Example pattern to find and fix:
```tsx
// Before (example)
<div className="rounded-xl border border-border bg-card p-4">
// After
<div className="rounded-xl border border-border bg-card p-5">
```

- [ ] **Step 3: Run tests**

```bash
bun run test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/BookmarksPage.tsx
git commit -m "refactor(bookmarks): uniform p-5 card padding and space-y-6 section spacing"
```

---

## Verification

After all tasks are done, run the full suite once more and verify the app starts:

```bash
bun run test
bun run dev
```

Open `http://localhost:5173` and verify:
- [ ] Dashboard shows 1 primary action + 3 compact secondary actions
- [ ] Dashboard desktop shows 2-column layout (chart + disciplines left, leaderboard right)
- [ ] Disciplines list shows max 4 items with "ver todas (X)" button
- [ ] "Atividade Recente" section is absent from Dashboard
- [ ] PerformancePage discipline list shows max 4 with "ver todas"
- [ ] PerformancePage weak topics list shows max 4 with "ver todos"
- [ ] PerformancePage simulado history shows max 4 with "ver todos"
- [ ] Heatmap card is collapsed by default; clicking expands it
- [ ] State persists across page refreshes (localStorage)
- [ ] LeaderboardPage podium is compact on narrow windows
