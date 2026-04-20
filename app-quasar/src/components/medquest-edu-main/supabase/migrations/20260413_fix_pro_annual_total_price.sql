-- When Pro annual `price` was mistakenly set near the monthly amount (e.g. 29.90 total/year),
-- realign to 12× the Pro monthly price. Skips rows that already look like a full-year total.
UPDATE public.plans AS p_anual
SET price = m.price * 12
FROM public.plans AS m
WHERE p_anual.name = 'Pro'
  AND p_anual.interval = 'anual'
  AND m.name = 'Pro'
  AND m.interval = 'mensal'
  AND m.price > 0
  AND p_anual.price < m.price * 6;
