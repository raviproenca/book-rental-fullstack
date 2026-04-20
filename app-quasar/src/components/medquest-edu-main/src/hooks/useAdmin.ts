import { useQuery } from "@tanstack/react-query";
import {
  getAdminStats,
  getAdminChartData,
  getRecentActivity,
} from "@/services/admin";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });
}

export function useAdminChartData() {
  return useQuery({
    queryKey: ["admin-chart-data"],
    queryFn: getAdminChartData,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: getRecentActivity,
  });
}
