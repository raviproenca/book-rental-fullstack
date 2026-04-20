import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReports,
  getPendingReportsCount,
  updateReportStatus,
  respondToReport,
  type ReportsFilter,
} from "@/services/reports";
import type { ReportStatus } from "@/types";

const KEY = "admin-reports";
const COUNT_KEY = "admin-reports-count";

export function useReports(filters?: ReportsFilter) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => getReports(filters),
  });
}

export function usePendingReportsCount() {
  return useQuery({
    queryKey: [COUNT_KEY],
    queryFn: getPendingReportsCount,
  });
}

export function useUpdateReportStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReportStatus }) =>
      updateReportStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [COUNT_KEY] });
    },
  });
}

export function useRespondToReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) =>
      respondToReport(id, response),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
