-- Study groups: tables, indexes, RLS, slug function, invite-code trigger, rankings view.

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────
-- unaccent is needed by generate_group_slug to strip diacritics.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ─── TABLES ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.study_groups (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL CHECK (char_length(name) BETWEEN 3 AND 60),
  slug          text        NOT NULL UNIQUE,
  description   text        CHECK (description IS NULL OR char_length(description) <= 280),
  avatar_emoji  text        NOT NULL DEFAULT '🧠',
  type          text        NOT NULL CHECK (type IN ('private', 'public')),
  owner_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  invite_code   text        UNIQUE,
  max_members   integer     NOT NULL DEFAULT 50 CHECK (max_members > 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.study_groups             IS 'Study groups that users can create and join.';
COMMENT ON COLUMN public.study_groups.slug        IS 'URL-friendly identifier; auto-generated from name via generate_group_slug().';
COMMENT ON COLUMN public.study_groups.invite_code IS 'Auto-generated 8-char uppercase code used to join private groups.';
COMMENT ON COLUMN public.study_groups.type        IS 'public: discoverable by anyone; private: invite-only.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.group_members (
  group_id  uuid        NOT NULL REFERENCES public.study_groups (id) ON DELETE CASCADE,
  user_id   uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role      text        NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

COMMENT ON TABLE  public.group_members      IS 'Membership relation between users and study groups.';
COMMENT ON COLUMN public.group_members.role IS 'owner: can delete group; admin: can manage members; member: read/share only.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.group_shared_questions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid        NOT NULL REFERENCES public.study_groups (id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  question_id integer     NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  message     text        CHECK (message IS NULL OR char_length(message) <= 500),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.group_shared_questions         IS 'Questions that members surface for group discussion.';
COMMENT ON COLUMN public.group_shared_questions.message IS 'Optional context or question from the sharer (max 500 chars).';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.group_question_comments (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_shared_question_id uuid        NOT NULL REFERENCES public.group_shared_questions (id) ON DELETE CASCADE,
  user_id                  uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  content                  text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at               timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.group_question_comments IS 'Threaded comments on a shared question within a group.';

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.group_activity_feed (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   uuid        NOT NULL REFERENCES public.study_groups (id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type       text        NOT NULL CHECK (type IN (
               'session_completed',
               'streak_milestone',
               'achievement_unlocked',
               'joined_group',
               'question_shared'
             )),
  payload    jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.group_activity_feed         IS 'App-generated activity events shown in the group feed.';
COMMENT ON COLUMN public.group_activity_feed.type    IS 'Event type; drives how the frontend renders the feed item.';
COMMENT ON COLUMN public.group_activity_feed.payload IS 'Structured event data (e.g. session stats, achievement id, streak count).';

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- group_members
CREATE INDEX IF NOT EXISTS group_members_user_id_idx
  ON public.group_members (user_id);

CREATE INDEX IF NOT EXISTS group_members_group_id_idx
  ON public.group_members (group_id);

-- group_shared_questions
CREATE INDEX IF NOT EXISTS group_shared_questions_group_created_idx
  ON public.group_shared_questions (group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS group_shared_questions_user_id_idx
  ON public.group_shared_questions (user_id);

-- group_question_comments
CREATE INDEX IF NOT EXISTS group_question_comments_shared_question_idx
  ON public.group_question_comments (group_shared_question_id, created_at);

-- group_activity_feed
CREATE INDEX IF NOT EXISTS group_activity_feed_group_created_idx
  ON public.group_activity_feed (group_id, created_at DESC);

-- study_groups — partial index for public discovery queries
CREATE INDEX IF NOT EXISTS study_groups_public_idx
  ON public.study_groups (type)
  WHERE type = 'public';

-- ─── SLUG FUNCTION ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_group_slug(group_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  suffix    INT := 0;
BEGIN
  -- lowercase → strip accents → spaces to hyphens → remove non-alphanumeric → truncate
  base_slug := substring(
    regexp_replace(
      regexp_replace(
        lower(unaccent(group_name)),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    ),
    1, 50
  );
  -- strip trailing hyphens left by truncation
  base_slug := regexp_replace(base_slug, '-+$', '');

  -- fallback if name was entirely stripped (e.g. pure punctuation)
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'grupo';
  END IF;

  candidate := base_slug;
  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.study_groups WHERE slug = candidate
    );
    suffix    := suffix + 1;
    candidate := base_slug || '-' || suffix::text;
  END LOOP;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- ─── INVITE CODE TRIGGER ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_group_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    LOOP
      NEW.invite_code := upper(substring(md5(gen_random_uuid()::text), 1, 8));
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.study_groups WHERE invite_code = NEW.invite_code
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS study_groups_invite_code ON public.study_groups;
CREATE TRIGGER study_groups_invite_code
  BEFORE INSERT ON public.study_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_group_invite_code();

-- ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

-- SECURITY DEFINER bypasses RLS so policies that check group membership
-- don't recurse infinitely into the group_members table.
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = auth.uid()
  );
$$;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

-- study_groups
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public groups readable by all authenticated" ON public.study_groups;
CREATE POLICY "Public groups readable by all authenticated"
  ON public.study_groups FOR SELECT
  TO authenticated
  USING (type = 'public');

DROP POLICY IF EXISTS "Private groups readable by members" ON public.study_groups;
CREATE POLICY "Private groups readable by members"
  ON public.study_groups FOR SELECT
  TO authenticated
  USING (
    type = 'private'
    AND public.is_group_member(study_groups.id)
  );

DROP POLICY IF EXISTS "Authenticated users create groups" ON public.study_groups;
CREATE POLICY "Authenticated users create groups"
  ON public.study_groups FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners and admins update groups" ON public.study_groups;
CREATE POLICY "Owners and admins update groups"
  ON public.study_groups FOR UPDATE
  TO authenticated
  USING (
    public.is_group_member(study_groups.id)
    AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = study_groups.id
        AND group_members.user_id = auth.uid()
        AND group_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    public.is_group_member(study_groups.id)
    AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = study_groups.id
        AND group_members.user_id = auth.uid()
        AND group_members.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Only owner deletes group" ON public.study_groups;
CREATE POLICY "Only owner deletes group"
  ON public.study_groups FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────

-- group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Group members read membership list" ON public.group_members;
CREATE POLICY "Group members read membership list"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_id));

DROP POLICY IF EXISTS "Authenticated users join groups" ON public.group_members;
CREATE POLICY "Authenticated users join groups"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users leave their own groups" ON public.group_members;
CREATE POLICY "Users leave their own groups"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────

-- group_shared_questions
ALTER TABLE public.group_shared_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Group members read shared questions" ON public.group_shared_questions;
CREATE POLICY "Group members read shared questions"
  ON public.group_shared_questions FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_shared_questions.group_id));

DROP POLICY IF EXISTS "Group members share questions" ON public.group_shared_questions;
CREATE POLICY "Group members share questions"
  ON public.group_shared_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_group_member(group_shared_questions.group_id)
  );

DROP POLICY IF EXISTS "Author deletes own shared question" ON public.group_shared_questions;
CREATE POLICY "Author deletes own shared question"
  ON public.group_shared_questions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────

-- group_question_comments
ALTER TABLE public.group_question_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Group members read comments" ON public.group_question_comments;
CREATE POLICY "Group members read comments"
  ON public.group_question_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_shared_questions gsq
      WHERE gsq.id = group_question_comments.group_shared_question_id
        AND public.is_group_member(gsq.group_id)
    )
  );

DROP POLICY IF EXISTS "Group members post comments" ON public.group_question_comments;
CREATE POLICY "Group members post comments"
  ON public.group_question_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.group_shared_questions gsq
      WHERE gsq.id = group_question_comments.group_shared_question_id
        AND public.is_group_member(gsq.group_id)
    )
  );

DROP POLICY IF EXISTS "Author deletes own comment" ON public.group_question_comments;
CREATE POLICY "Author deletes own comment"
  ON public.group_question_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────

-- group_activity_feed
ALTER TABLE public.group_activity_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Group members read activity feed" ON public.group_activity_feed;
CREATE POLICY "Group members read activity feed"
  ON public.group_activity_feed FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_activity_feed.group_id));

DROP POLICY IF EXISTS "Users insert own activity events" ON public.group_activity_feed;
CREATE POLICY "Users insert own activity events"
  ON public.group_activity_feed FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_group_member(group_activity_feed.group_id)
  );

-- ─── RANKINGS VIEW ───────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.group_member_rankings
  WITH (security_invoker = true)
AS
SELECT
  gm.group_id,
  gm.user_id,
  gm.role,
  gm.joined_at,
  p.nome,
  p.avatar_url,
  p.nivel,
  p.xp_atual                            AS xp_total,
  p.streak,
  COALESCE(sa_week.answer_count, 0)     AS xp_week,
  RANK() OVER (
    PARTITION BY gm.group_id
    ORDER BY p.xp_atual DESC
  )                                     AS rank_xp_total,
  RANK() OVER (
    PARTITION BY gm.group_id
    ORDER BY COALESCE(sa_week.answer_count, 0) DESC
  )                                     AS rank_xp_week
FROM public.group_members gm
JOIN public.profiles p ON p.id = gm.user_id
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) AS answer_count
  FROM public.session_answers
  WHERE created_at >= now() - INTERVAL '7 days'
  GROUP BY user_id
) sa_week ON sa_week.user_id = gm.user_id;

COMMENT ON VIEW public.group_member_rankings IS
  'Per-member stats for group leaderboards. xp_week counts session_answers in the last 7 days as an XP proxy.';
