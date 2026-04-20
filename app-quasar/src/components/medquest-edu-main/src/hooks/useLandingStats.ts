import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, type DbLandingStat } from "@/lib/supabase";

const QUERY_KEY = ["landing-stats"];

const DEFAULT_STATS: DbLandingStat[] = [
  { id: 1, key: "questions_count", value: 2000, suffix: "+", label: "Questões comentadas", icon: "book-open", display_order: 1, updated_at: "" },
  { id: 2, key: "students_count", value: 500, suffix: "+", label: "Estudantes ativos", icon: "users", display_order: 2, updated_at: "" },
  { id: 3, key: "disciplines_count", value: 15, suffix: "", label: "Disciplinas cobertas", icon: "library", display_order: 3, updated_at: "" },
];

async function fetchLandingStats(): Promise<DbLandingStat[]> {
  const { data, error } = await supabase
    .from("landing_stats")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data;
}

export function useLandingStats() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchLandingStats,
    staleTime: 5 * 60 * 1000,
    placeholderData: DEFAULT_STATS,
    retry: 1,
  });
}

export function useLandingStatsWithFallback() {
  const { data, isError } = useLandingStats();
  return isError || !data ? DEFAULT_STATS : data;
}

async function updateLandingStat(
  updates: { id: number; value: number; label: string; suffix: string }[]
) {
  for (const u of updates) {
    const { error } = await supabase
      .from("landing_stats")
      .update({ value: u.value, label: u.label, suffix: u.suffix })
      .eq("id", u.id);
    if (error) throw error;
  }
}

export function useUpdateLandingStats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLandingStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
