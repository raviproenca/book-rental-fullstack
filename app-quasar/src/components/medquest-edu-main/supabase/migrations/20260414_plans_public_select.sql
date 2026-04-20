-- Landing and paywall load plans with the anon key; allow reading active rows only.
-- If RLS was off, enabling it requires both public SELECT and admin policies so updates keep working.

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active plans" ON public.plans;
CREATE POLICY "Public read active plans"
  ON public.plans
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage plans" ON public.plans;
CREATE POLICY "Admins manage plans"
  ON public.plans
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
