import { cn } from "@/lib/utils";

/* ─── Base shimmer skeleton ─── */
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-secondary",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.04] before:to-transparent",
        className
      )}
      style={style}
    />
  );
}

/* ─── Dashboard Card Skeleton ─── */
export function DashboardCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Shimmer className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-5 w-20" />
          <Shimmer className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard Stat Cards Row ─── */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─── Question List Skeleton ─── */
export function QuestionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-3/4" />
              <div className="flex gap-2 pt-1">
                <Shimmer className="h-5 w-20 rounded-md" />
                <Shimmer className="h-5 w-16 rounded-md" />
                <Shimmer className="h-5 w-14 rounded-md" />
              </div>
            </div>
            <Shimmer className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Chart Skeleton ─── */
export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-4 w-16" />
      </div>
      <div className="flex h-52 items-end gap-2">
        {[40, 65, 45, 80, 55, 70, 30].map((h, i) => (
          <Shimmer key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Leaderboard Skeleton ─── */
export function LeaderboardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <Shimmer className="h-4 w-28" />
        <Shimmer className="h-4 w-4 rounded-full" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <Shimmer className="h-6 w-6 rounded-full" />
            <Shimmer className="h-8 w-8 rounded-full" />
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Discipline Bar Skeleton ─── */
export function DisciplineBarsSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Shimmer className="mb-5 h-4 w-44" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Shimmer className="h-3.5 w-3.5" />
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-2 flex-1 rounded-full" />
            <Shimmer className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Full Dashboard Skeleton ─── */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <Shimmer className="h-7 w-56" />
          <Shimmer className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-4">
          <Shimmer className="h-14 w-24 rounded-xl" />
          <Shimmer className="h-14 w-24 rounded-xl" />
          <Shimmer className="h-14 w-40 rounded-xl" />
        </div>
      </div>

      <DashboardStatsSkeleton />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <LeaderboardSkeleton />
      </div>

      <DisciplineBarsSkeleton />
    </div>
  );
}
