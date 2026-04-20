import { useQuery } from "@tanstack/react-query";
import {
  getPlanKpis,
  getPlanRevenueEvolution,
  getPlanChurnComparison,
  getPlanMigrations,
} from "@/services/adminSubAnalytics";

export function usePlanKpis() {
  return useQuery({
    queryKey: ["admin-plan-kpis"],
    queryFn: getPlanKpis,
  });
}

export function usePlanRevenue() {
  return useQuery({
    queryKey: ["admin-plan-revenue"],
    queryFn: getPlanRevenueEvolution,
  });
}

export function usePlanChurn() {
  return useQuery({
    queryKey: ["admin-plan-churn"],
    queryFn: getPlanChurnComparison,
  });
}

export function usePlanMigrations() {
  return useQuery({
    queryKey: ["admin-plan-migrations"],
    queryFn: getPlanMigrations,
  });
}
