-- When the user accepts Terms + Privacy in-app (including OAuth users).
alter table public.profiles
  add column if not exists terms_accepted_at timestamptz null;

comment on column public.profiles.terms_accepted_at is 'Timestamp when the user accepted Terms of Use and Privacy Policy in the app.';
