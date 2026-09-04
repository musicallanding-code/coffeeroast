-- coffeeroast — Supabase schema (MVP: roast log core; inventory tables stubbed for phase 2)
-- All data is owned by a single auth user; RLS = owner-only.

-- ─── profiles ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  locale text not null default 'zh-TW',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── reference data ────────────────────────────────────────────────────────
create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name_zh text not null,
  name_en text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  contact text,
  phone text,
  address text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.roasters (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  batch_capacity_g numeric,
  note text,
  created_at timestamptz not null default now()
);

-- ─── green bean catalog ────────────────────────────────────────────────────
create table if not exists public.green_beans (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  code text,
  name_zh text not null,
  name_en text,
  country_id uuid references public.countries (id) on delete set null,
  region text,
  farm text,
  process text,          -- 水洗 / 日曬 / 蜜處理 …
  variety text,
  altitude text,
  flavor_notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists green_beans_owner_idx on public.green_beans (owner);

-- ─── green bean inventory lots (phase 2 UI, schema ready) ───────────────────
create table if not exists public.green_bean_lots (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  green_bean_id uuid not null references public.green_beans (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  lot_code text,
  purchased_on date,
  qty_in_g numeric not null default 0,
  qty_remaining_g numeric not null default 0,
  unit_price numeric,
  currency text not null default 'TWD',
  note text,
  created_at timestamptz not null default now()
);
create index if not exists green_bean_lots_bean_idx on public.green_bean_lots (green_bean_id);

-- ─── roast batches ─────────────────────────────────────────────────────────
create table if not exists public.roast_batches (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  batch_no text,
  green_bean_id uuid references public.green_beans (id) on delete set null,
  green_bean_lot_id uuid references public.green_bean_lots (id) on delete set null,
  roaster_id uuid references public.roasters (id) on delete set null,
  bean_name_snapshot text,           -- denormalized name at roast time
  status text not null default 'completed',   -- 'roasting' | 'completed'
  started_at timestamptz not null default now(),
  -- environment / charge
  room_temp numeric,
  charge_temp numeric,
  -- event markers (seconds from charge + temp at event)
  turning_point_sec int,   turning_point_temp numeric,
  dry_end_sec int,         dry_end_temp numeric,
  first_crack_sec int,     first_crack_temp numeric,
  second_crack_sec int,    second_crack_temp numeric,
  drop_sec int,            drop_temp numeric,
  -- weights
  weight_green_g numeric,
  weight_roasted_g numeric,
  -- outcome
  roast_level text,        -- 淺焙 / 中焙 / 中深焙 / 深焙
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists roast_batches_owner_started_idx
  on public.roast_batches (owner, started_at desc);

-- ─── roast curve points ────────────────────────────────────────────────────
create table if not exists public.roast_curve_points (
  id bigint generated always as identity primary key,
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  batch_id uuid not null references public.roast_batches (id) on delete cascade,
  t_sec int not null,
  bean_temp numeric,
  drum_temp numeric,
  gas numeric,
  airflow numeric
);
create unique index if not exists roast_curve_points_batch_t_idx
  on public.roast_curve_points (batch_id, t_sec);

-- ─── roasted bean stock (phase 2) ──────────────────────────────────────────
create table if not exists public.roasted_stock_moves (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  batch_id uuid references public.roast_batches (id) on delete set null,
  moved_on date not null default current_date,
  direction text not null,      -- 'in' | 'out'
  qty_g numeric not null,
  reason text,
  note text,
  created_at timestamptz not null default now()
);

-- ─── updated_at triggers ───────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists green_beans_touch on public.green_beans;
create trigger green_beans_touch before update on public.green_beans
  for each row execute function public.touch_updated_at();

drop trigger if exists roast_batches_touch on public.roast_batches;
create trigger roast_batches_touch before update on public.roast_batches
  for each row execute function public.touch_updated_at();

-- ─── RLS: owner-only on every table ────────────────────────────────────────
alter table public.profiles            enable row level security;
alter table public.countries           enable row level security;
alter table public.suppliers           enable row level security;
alter table public.roasters            enable row level security;
alter table public.green_beans         enable row level security;
alter table public.green_bean_lots     enable row level security;
alter table public.roast_batches       enable row level security;
alter table public.roast_curve_points  enable row level security;
alter table public.roasted_stock_moves enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array[
    'countries','suppliers','roasters','green_beans','green_bean_lots',
    'roast_batches','roast_curve_points','roasted_stock_moves'
  ] loop
    execute format('drop policy if exists "owner all" on public.%I;', t);
    execute format(
      'create policy "owner all" on public.%I for all using (owner = auth.uid()) with check (owner = auth.uid());',
      t);
  end loop;
end $$;
