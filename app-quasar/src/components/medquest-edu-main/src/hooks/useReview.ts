import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getUpcomingDays,
  getReviewQuestions,
  getUpcomingReviews,
  submitReviewRating,
} from "@/services/review";
import type { SRSRating } from "@/types";

export function useUpcomingDays() {
  return useQuery({
    queryKey: ["review-upcoming-days"],
    queryFn: getUpcomingDays,
  });
}

export function useReviewQuestions() {
  return useQuery({
    queryKey: ["review-questions"],
    queryFn: getReviewQuestions,
  });
}

export function useUpcomingReviews() {
  return useQuery({
    queryKey: ["upcoming-reviews"],
    queryFn: getUpcomingReviews,
  });
}

export function useSubmitReviewRating() {
  return useMutation({
    mutationFn: ({ questionId, rating }: { questionId: number; rating: SRSRating }) =>
      submitReviewRating(questionId, rating),
  });
}
