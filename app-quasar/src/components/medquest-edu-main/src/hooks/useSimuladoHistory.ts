import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getSimuladoHistory } from "@/services/simulados";

export function useSimuladoHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["simulado-history", user?.id],
    queryFn: () => getSimuladoHistory(user!.id),
    enabled: !!user?.id,
  });
}
