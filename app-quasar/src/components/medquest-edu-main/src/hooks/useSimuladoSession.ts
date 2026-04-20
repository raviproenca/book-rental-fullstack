import { useQuery } from "@tanstack/react-query";
import { getSimuladoSession } from "@/services/simulados";

export function useSimuladoSession(id: string | undefined) {
  return useQuery({
    queryKey: ["simulado-session", id],
    queryFn: () => getSimuladoSession(id!),
    enabled: !!id,
  });
}
