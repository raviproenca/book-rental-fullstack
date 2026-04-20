import { DashboardSkeleton } from "@/components/Skeletons";

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <DashboardSkeleton />
    </div>
  );
}
