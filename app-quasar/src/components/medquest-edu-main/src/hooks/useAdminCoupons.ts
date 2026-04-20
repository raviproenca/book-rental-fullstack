import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDiscountCoupon,
  deleteDiscountCoupon,
  getDiscountCouponById,
  getInfluencerById,
  listDiscountCoupons,
  listInfluencers,
  listPlanOptionsForCoupons,
  updateDiscountCoupon,
  type DiscountCouponInput,
} from "@/services/adminCoupons";

const couponsKey = ["admin-discount-coupons"] as const;
const planOptionsKey = ["admin-discount-coupon-plan-options"] as const;
const influencersKey = ["admin-influencers"] as const;

export function useDiscountCoupons(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: couponsKey,
    queryFn: listDiscountCoupons,
    enabled: options?.enabled ?? true,
  });
}

export function useDiscountCoupon(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...couponsKey, "detail", id] as const,
    queryFn: () => getDiscountCouponById(id!),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useCouponPlanOptions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: planOptionsKey,
    queryFn: listPlanOptionsForCoupons,
    enabled: options?.enabled ?? true,
  });
}

export function useInfluencersForCoupons(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: influencersKey,
    queryFn: listInfluencers,
    enabled: options?.enabled ?? true,
  });
}

export function useInfluencerBasics(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...influencersKey, "basics", id] as const,
    queryFn: () => getInfluencerById(id!),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useCreateDiscountCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DiscountCouponInput) => createDiscountCoupon(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: couponsKey });
    },
  });
}

export function useUpdateDiscountCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DiscountCouponInput> }) =>
      updateDiscountCoupon(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: couponsKey });
    },
  });
}

export function useDeleteDiscountCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDiscountCoupon(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: couponsKey });
    },
  });
}
