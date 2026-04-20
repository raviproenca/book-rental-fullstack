import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyGroups,
  getPublicGroups,
  getGroupByInviteCode,
  getGroupRankings,
  getGroupSharedQuestions,
  getQuestionComments,
  getGroupActivityFeed,
  createGroup,
  joinGroup,
  leaveGroup,
  shareQuestionToGroup,
  addComment,
} from "@/services/groups";
import type { GroupType } from "@/types";

export function useMyGroups() {
  return useQuery({
    queryKey: ["groups", "mine"],
    queryFn: getMyGroups,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePublicGroups() {
  return useQuery({
    queryKey: ["groups", "public"],
    queryFn: getPublicGroups,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGroupByInviteCode(code: string) {
  return useQuery({
    queryKey: ["groups", "invite", code],
    queryFn: () => getGroupByInviteCode(code),
    enabled: code.length === 8,
    staleTime: 0,
  });
}

export function useGroupRankings(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "rankings"],
    queryFn: () => getGroupRankings(groupId),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGroupSharedQuestions(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "questions"],
    queryFn: () => getGroupSharedQuestions(groupId),
    enabled: !!groupId,
    staleTime: 30 * 1000,
  });
}

export function useGroupComments(sharedQuestionId: string) {
  return useQuery({
    queryKey: ["groups", "comments", sharedQuestionId],
    queryFn: () => getQuestionComments(sharedQuestionId),
    enabled: !!sharedQuestionId,
    staleTime: 0,
  });
}

export function useGroupActivityFeed(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "feed"],
    queryFn: () => getGroupActivityFeed(groupId),
    enabled: !!groupId,
    staleTime: 60 * 1000,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      description?: string;
      avatarEmoji: string;
      type: GroupType;
    }) => createGroup(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useShareQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      groupId: string;
      questionId: number;
      message?: string;
    }) => shareQuestionToGroup(vars.groupId, vars.questionId, vars.message),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["groups", vars.groupId, "questions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", vars.groupId, "feed"],
      });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { sharedQuestionId: string; content: string }) =>
      addComment(vars.sharedQuestionId, vars.content),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["groups", "comments", vars.sharedQuestionId],
      });
    },
  });
}
