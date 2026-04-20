-- Admin-managed discount coupons for future checkout integration (no Stripe in app; subscriptions live in Supabase).

CREATE TABLE public.discount_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric NOT NULL,
  max_uses int CHECK (max_uses IS NULL OR max_uses > 0),
  uses_count int NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  first_purchase_only boolean NOT NULL DEFAULT false,
  max_redemptions_per_user int CHECK (max_redemptions_per_user IS NULL OR max_redemptions_per_user > 0),
  applies_to_billing text NOT NULL DEFAULT 'both' CHECK (applies_to_billing IN ('monthly', 'annual', 'both')),
  plan_id text REFERENCES public.plans (id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT discount_coupons_code_unique UNIQUE (code),
  CONSTRAINT discount_coupons_value_valid CHECK (
    (discount_type = 'percent' AND discount_value > 0 AND discount_value <= 100)
    OR (discount_type = 'fixed' AND discount_value > 0)
  ),
  CONSTRAINT discount_coupons_valid_range CHECK (
    valid_until IS NULL OR valid_until >= valid_from
  )
);

CREATE INDEX discount_coupons_active_code_idx ON public.discount_coupons (is_active, lower(code));

COMMENT ON TABLE public.discount_coupons IS 'Discount rules; redemption enforcement happens at checkout (not yet wired).';

ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage discount coupons"
  ON public.discount_coupons
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
