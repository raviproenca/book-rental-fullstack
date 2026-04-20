import { useQuery } from "@tanstack/react-query";
import {
  getSubKpis,
  getMrrEvolution,
  getSubFlow,
  getSubscriptions,
  type SubFilters,
} from "@/services/adminSubscriptions";

export function useSubKpis() {
  return useQuery({
    queryKey: ["admin-sub-kpis"],
    queryFn: getSubKpis,
  });
}

export function useMrrEvolution() {
  return useQuery({
    queryKey: ["admin-mrr-evolution"],
    queryFn: getMrrEvolution,
  });
}

export function useSubFlow() {
  return useQuery({
    queryKey: ["admin-sub-flow"],
    queryFn: getSubFlow,
  });
}

export function useSubscriptions(filters: SubFilters) {
  return useQuery({
    queryKey: ["admin-subscriptions", filters],
    queryFn: () => getSubscriptions(filters),
  });
}
