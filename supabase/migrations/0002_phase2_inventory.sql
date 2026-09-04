-- coffeeroast — Phase 2: blends + inventory helper functions.
-- (suppliers, green_bean_lots, roasted_stock_moves tables were created in 0001.)

-- ─── blends (拼配配方) ─────────────────────────────────────────────────────
create table if not exists public.blends (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  note text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blends_owner_idx on public.blends (owner);

create table if not exists public.blend_components (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  blend_id uuid not null references public.blends (id) on delete cascade,
  green_bean_id uuid not null references public.green_beans (id) on delete cascade,
  parts numeric not null default 1,
  sort_order int not null default 0
);
create index if not exists blend_components_blend_idx on public.blend_components (blend_id);

drop trigger if exists blends_touch on public.blends;
create trigger blends_touch before update on public.blends
  for each row execute function public.touch_updated_at();

alter table public.blends            enable row level security;
alter table public.blend_components  enable row level security;

do $$
declare tname text;
begin
  foreach tname in array array['blends', 'blend_components'] loop
    execute format('drop policy if exists "owner all" on public.%I;', tname);
    execute format(
      'create policy "owner all" on public.%I for all using (owner = auth.uid()) with check (owner = auth.uid());',
      tname);
  end loop;
end $$;

-- roasted_stock_moves: track which bean the move is for (denormalised from batch)
alter table public.roasted_stock_moves
  add column if not exists green_bean_id uuid references public.green_beans (id) on delete set null;

-- ─── stock helpers ────────────────────────────────────────────────────────

-- Deduct grams from a green-bean lot, never below zero. Returns the new balance.
create or replace function public.consume_green_lot(p_lot_id uuid, p_grams numeric)
returns numeric
language plpgsql
security invoker
as $$
declare
  new_remaining numeric;
begin
  update public.green_bean_lots
    set qty_remaining_g = greatest(0, qty_remaining_g - coalesce(p_grams, 0))
    where id = p_lot_id and owner = auth.uid()
    returning qty_remaining_g into new_remaining;
  return new_remaining;
end;
$$;

-- Current green-bean stock (sum of remaining across lots), per bean.
create or replace view public.green_bean_stock as
  select
    b.id            as green_bean_id,
    b.owner         as owner,
    b.name_zh       as name_zh,
    b.name_en       as name_en,
    coalesce(sum(l.qty_remaining_g), 0) as remaining_g,
    coalesce(sum(l.qty_in_g), 0)        as total_in_g,
    count(l.id)                          as lot_count
  from public.green_beans b
  left join public.green_bean_lots l on l.green_bean_id = b.id
  where b.archived = false
  group by b.id, b.owner, b.name_zh, b.name_en;

-- Roasted-bean stock, per green bean (in − out).
create or replace view public.roasted_stock as
  select
    m.green_bean_id as green_bean_id,
    m.owner         as owner,
    b.name_zh       as name_zh,
    coalesce(sum(
      case when m.direction = 'in' then m.qty_g else -m.qty_g end
    ), 0)           as remaining_g
  from public.roasted_stock_moves m
  left join public.green_beans b on b.id = m.green_bean_id
  group by m.green_bean_id, m.owner, b.name_zh;

-- Run views with the caller's privileges so table RLS is enforced.
alter view public.green_bean_stock set (security_invoker = on);
alter view public.roasted_stock set (security_invoker = on);
