import { useQuery, useMutation } from "@tanstack/react-query";
import { getSessionHistory, createSession } from "@/services/sessions";
import type { PracticeConfig } from "@/types";

export function usePracticeSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: getSessionHistory,
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: (config: PracticeConfig) => createSession(config),
  });
}
