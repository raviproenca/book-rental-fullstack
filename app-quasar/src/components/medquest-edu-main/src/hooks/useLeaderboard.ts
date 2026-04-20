import { useQuery } from "@tanstack/react-query";
import { getLeaderboard, getUserRank } from "@/services/leaderboard";

export function useLeaderboard(tab?: string, faculdade?: string) {
  return useQuery({
    queryKey: ["leaderboard", tab, faculdade],
    queryFn: () => getLeaderboard(tab, faculdade),
  });
}

export function useUserRank() {
  return useQuery({
    queryKey: ["user-rank"],
    queryFn: getUserRank,
  });
}
