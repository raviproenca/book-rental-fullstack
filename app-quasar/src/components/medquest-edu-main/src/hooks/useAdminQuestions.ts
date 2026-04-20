import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminQuestions,
  getAdminQuestionById,
  createQuestion,
  updateQuestion,
  duplicateQuestion,
  archiveQuestions,
  deleteQuestions,
  getDisciplinasTemasMap,
  type AdminQuestionsFilter,
} from "@/services/adminQuestions";
import type { AdminQuestion } from "@/types";

const KEY = "admin-questions";

export function useDisciplinasTemasMap() {
  return useQuery({
    queryKey: ["disciplinas-temas-map"],
    queryFn: getDisciplinasTemasMap,
  });
}

export function useAdminQuestions(filters: AdminQuestionsFilter) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => getAdminQuestions(filters),
    placeholderData: (prev) => prev,
  });
}

export function useAdminQuestion(id: number) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => getAdminQuestionById(id),
    enabled: id > 0,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<AdminQuestion, "id">> }) =>
      updateQuestion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDuplicateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: duplicateQuestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useArchiveQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveQuestions,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestions,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
