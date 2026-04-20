-- Landing page stats table (admin-editable counters)
CREATE TABLE IF NOT EXISTS public.landing_stats (
  id          SERIAL PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  value       INTEGER NOT NULL DEFAULT 0,
  suffix      TEXT NOT NULL DEFAULT '',
  label       TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'hash',
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default rows
INSERT INTO public.landing_stats (key, value, suffix, label, icon, display_order) VALUES
  ('questions_count',   2000, '+', 'Questões comentadas', 'book-open', 1),
  ('students_count',    500,  '+', 'Estudantes ativos',   'users',     2),
  ('disciplines_count', 15,   '',  'Disciplinas cobertas', 'library',  3)
ON CONFLICT (key) DO NOTHING;

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS landing_stats_updated_at ON public.landing_stats;
CREATE TRIGGER landing_stats_updated_at
  BEFORE UPDATE ON public.landing_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.landing_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.landing_stats
  FOR SELECT USING (true);

CREATE POLICY "Admin update access" ON public.landing_stats
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin insert access" ON public.landing_stats
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete access" ON public.landing_stats
  FOR DELETE USING (public.is_admin());
