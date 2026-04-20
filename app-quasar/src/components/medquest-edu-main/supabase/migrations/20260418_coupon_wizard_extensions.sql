-- Influencers (minimal) + coupon wizard fields (checkout redemption still future work).

CREATE TABLE public.influencers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.influencers IS 'Marketing partners linked to discount coupons for admin attribution.';

CREATE INDEX influencers_name_idx ON public.influencers (lower(name));

ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage influencers"
  ON public.influencers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.discount_coupons DROP CONSTRAINT IF EXISTS discount_coupons_discount_type_check;
ALTER TABLE public.discount_coupons DROP CONSTRAINT IF EXISTS discount_coupons_value_valid;

ALTER TABLE public.discount_coupons
  ADD CONSTRAINT discount_coupons_discount_type_check CHECK (
    discount_type IN ('percent', 'fixed', 'extended_trial', 'first_month_free')
  );

-- App validates per-type rules; DB keeps basic safety rails.
ALTER TABLE public.discount_coupons
  ADD CONSTRAINT discount_coupons_value_valid CHECK (
    (discount_type = 'percent' AND discount_value > 0 AND discount_value <= 100)
    OR (discount_type = 'fixed' AND discount_value > 0)
    OR (discount_type = 'extended_trial' AND discount_value > 0 AND discount_value = floor(discount_value))
    OR (discount_type = 'first_month_free' AND discount_value >= 0)
  );

ALTER TABLE public.discount_coupons
  ADD COLUMN influencer_id uuid REFERENCES public.influencers (id) ON DELETE SET NULL,
  ADD COLUMN eligible_plan_ids text[],
  ADD COLUMN discount_charge_scope text NOT NULL DEFAULT 'first_invoice'
    CHECK (discount_charge_scope IN ('first_invoice', 'recurring')),
  ADD COLUMN recurring_months int CHECK (recurring_months IS NULL OR recurring_months > 0),
  ADD COLUMN min_purchase_amount numeric CHECK (min_purchase_amount IS NULL OR min_purchase_amount >= 0),
  ADD COLUMN email_allowlist text[];

CREATE INDEX discount_coupons_influencer_id_idx ON public.discount_coupons (influencer_id);

COMMENT ON COLUMN public.discount_coupons.eligible_plan_ids IS 'When NULL or empty, coupon applies to all active plans; otherwise restrict to these plan IDs.';
COMMENT ON COLUMN public.discount_coupons.discount_charge_scope IS 'first_invoice: discount once; recurring: discount for recurring_months cycles.';
COMMENT ON COLUMN public.discount_coupons.recurring_months IS 'When discount_charge_scope is recurring, number of billing cycles the discount applies.';
COMMENT ON COLUMN public.discount_coupons.min_purchase_amount IS 'Minimum cart/subtotal (BRL) before coupon applies; NULL = no minimum.';
COMMENT ON COLUMN public.discount_coupons.email_allowlist IS 'When set, only these emails (lowercase) may redeem; NULL = no email gate.';
