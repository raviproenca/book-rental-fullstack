import { useQuery } from "@tanstack/react-query";
import { getAchievements, checkNewAchievements } from "@/services/achievements";

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: getAchievements,
  });
}

export function useCheckNewAchievements() {
  return useQuery({
    queryKey: ["new-achievements"],
    queryFn: checkNewAchievements,
    enabled: false,
  });
}
