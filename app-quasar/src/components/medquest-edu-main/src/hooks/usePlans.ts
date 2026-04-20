import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPlans,
  updatePlan,
  type PlanData,
  type PlanUpdateMeta,
} from "@/services/plans";

const KEY = "plans";

export function usePlans() {
  return useQuery({
    queryKey: [KEY],
    queryFn: getPlans,
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planMeta,
      data,
    }: {
      planMeta: PlanUpdateMeta;
      data: Partial<Omit<PlanData, "id" | "monthlyRowId" | "annualRowId">>;
    }) => updatePlan(planMeta, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
