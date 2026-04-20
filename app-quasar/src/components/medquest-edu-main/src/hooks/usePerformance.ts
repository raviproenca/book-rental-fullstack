import { useQuery } from "@tanstack/react-query";
import {
  getAllPerformanceStats,
  getEvolutionData,
  getDisciplinePerformance,
  getHeatmapData,
  getWeakTopics,
  getSimuladoHistory,
} from "@/services/performance";

export function usePerformanceStats() {
  return useQuery({
    queryKey: ["performance-stats"],
    queryFn: getAllPerformanceStats,
  });
}

export function useEvolutionData() {
  return useQuery({
    queryKey: ["evolution-data"],
    queryFn: getEvolutionData,
  });
}

export function useDisciplinePerf() {
  return useQuery({
    queryKey: ["discipline-performance"],
    queryFn: getDisciplinePerformance,
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ["heatmap-data"],
    queryFn: getHeatmapData,
  });
}

export function useWeakTopics() {
  return useQuery({
    queryKey: ["weak-topics"],
    queryFn: getWeakTopics,
  });
}

export function useSimuladoHistory() {
  return useQuery({
    queryKey: ["simulado-history"],
    queryFn: getSimuladoHistory,
  });
}
