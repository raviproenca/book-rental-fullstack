-- Daily question goal from onboarding (nullable for legacy profiles).
alter table public.profiles
  add column if not exists meta_questoes_diarias integer;

comment on column public.profiles.meta_questoes_diarias is
  'Target number of practice questions per study day, set during onboarding.';
