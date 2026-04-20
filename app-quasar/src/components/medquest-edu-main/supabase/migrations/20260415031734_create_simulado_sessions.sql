-- Migration: create_simulado_sessions
-- Recovered from DB drift (applied directly without local file)

CREATE TABLE IF NOT EXISTS public.simulado_sessions (
  id             uuid        NOT NULL DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL,
  disciplina     text        NOT NULL,
  question_ids   integer[]   NOT NULL,
  answers        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  score          integer     NOT NULL,
  correct        integer     NOT NULL,
  wrong          integer     NOT NULL,
  blank          integer     NOT NULL,
  time_used_sec  integer     NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT simulado_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT simulado_sessions_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Index for user history queries (ordered by most recent)
CREATE INDEX IF NOT EXISTS simulado_sessions_user_created
  ON public.simulado_sessions (user_id, created_at DESC);

-- RLS
ALTER TABLE public.simulado_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own simulado sessions"
  ON public.simulado_sessions
  FOR ALL
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
