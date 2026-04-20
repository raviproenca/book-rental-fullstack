import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminUsers,
  getAdminUserById,
  banUser,
  grantPro,
  resetPassword,
  sendEmail,
  getAllFaculdades,
  type AdminUsersFilter,
} from "@/services/adminUsers";

const KEY = "admin-users";

export function useAllFaculdades() {
  return useQuery({
    queryKey: ["all-faculdades"],
    queryFn: getAllFaculdades,
  });
}

export function useAdminUsers(filters: AdminUsersFilter) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => getAdminUsers(filters),
    placeholderData: (prev) => prev,
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => getAdminUserById(id),
    enabled: id > 0,
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: banUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useGrantPro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: grantPro,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

export function useSendEmail() {
  return useMutation({ mutationFn: sendEmail });
}
