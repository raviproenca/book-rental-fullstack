/// <reference types="vite/client" />

/** Set to the string `false` to load coupon rows from Supabase instead of mock data on `/admin/cupons`. */
interface ImportMetaEnv {
  readonly VITE_ADMIN_COUPONS_LIST_MOCK?: string;
  /** Set to `false` to skip mock seed on `/admin/influenciadores` (starts empty in mock mode). */
  readonly VITE_ADMIN_INFLUENCERS_LIST_MOCK?: string;
  /** Set to `true` to open `/admin/influenciadores` with an empty list (empty-state QA). */
  readonly VITE_ADMIN_INFLUENCERS_EMPTY?: string;
}
