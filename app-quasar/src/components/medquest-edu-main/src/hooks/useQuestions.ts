import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getQuestions,
  getQuestionById,
  submitAnswer,
  getDisciplines,
  getSimuladoDisciplinas,
} from "@/services/questions";
import type { PracticeConfig } from "@/types";

export function useQuestions(config?: PracticeConfig) {
  return useQuery({
    queryKey: ["questions", config],
    queryFn: () => getQuestions(config),
  });
}

export function useQuestionById(id: number) {
  return useQuery({
    queryKey: ["questions", id],
    queryFn: () => getQuestionById(id),
    enabled: id > 0,
  });
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({ questionId, answer }: { questionId: number; answer: string }) =>
      submitAnswer(questionId, answer),
  });
}

export function useDisciplines() {
  return useQuery({
    queryKey: ["disciplines"],
    queryFn: getDisciplines,
  });
}

export function useSimuladoDisciplinas() {
  return useQuery({
    queryKey: ["simulado-disciplinas"],
    queryFn: getSimuladoDisciplinas,
  });
}
