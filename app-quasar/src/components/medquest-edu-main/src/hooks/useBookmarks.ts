import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookmarks, toggleBookmark } from "@/services/bookmarks";

export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: number) => toggleBookmark(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
