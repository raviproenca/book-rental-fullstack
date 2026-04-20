import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updateProfile,
  uploadUserAvatar,
  getActiveSubscriptionPeriodEnd,
  getDashboardData,
  getDashboardLeaderboard,
} from "@/services/user";
import type { UserProfile } from "@/types";

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });
}

export function useActiveSubscriptionPeriodEnd(enabled: boolean) {
  return useQuery({
    queryKey: ["subscription-period-end"],
    queryFn: getActiveSubscriptionPeriodEnd,
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateProfile(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      if (variables.metaQuestoesDiarias !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      }
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadUserAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: getDashboardData,
  });
}

export function useDashboardLeaderboard() {
  return useQuery({
    queryKey: ["dashboard-leaderboard"],
    queryFn: getDashboardLeaderboard,
  });
}
