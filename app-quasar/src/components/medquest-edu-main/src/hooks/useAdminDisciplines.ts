import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminDisciplines,
  createDiscipline,
  updateDiscipline,
  toggleDisciplineStatus,
  reorderDisciplines,
  createTema,
  updateTema,
  deleteTema,
  reorderTemas,
} from "@/services/adminDisciplines";
import type { AdminDiscipline, AdminTema } from "@/types";

const KEY = "admin-disciplines";

export function useAdminDisciplines() {
  return useQuery({
    queryKey: [KEY],
    queryFn: getAdminDisciplines,
  });
}

export function useCreateDiscipline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDiscipline,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateDiscipline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Pick<AdminDiscipline, "nome" | "icone" | "descricao">> }) =>
      updateDiscipline(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useToggleDisciplineStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleDisciplineStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReorderDisciplines() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reorderDisciplines,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCreateTema() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ disciplineId, data }: { disciplineId: number; data: Omit<AdminTema, "id" | "disciplinaId" | "ordem" | "numQuestoes"> }) =>
      createTema(disciplineId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateTema() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ disciplineId, temaId, data }: { disciplineId: number; temaId: number; data: Partial<Pick<AdminTema, "nome" | "descricao" | "subtemas">> }) =>
      updateTema(disciplineId, temaId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteTema() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ disciplineId, temaId }: { disciplineId: number; temaId: number }) =>
      deleteTema(disciplineId, temaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReorderTemas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ disciplineId, orderedTemaIds }: { disciplineId: number; orderedTemaIds: number[] }) =>
      reorderTemas(disciplineId, orderedTemaIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
