-- Profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  is_anonymous boolean not null default false,
  country text,
  state text,
  city text,
  created_at timestamptz not null default now()
);

-- Billing
create table if not exists public.billing (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text,
  amount_cents integer default 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- Monthly spend
create table if not exists public.monthly_spend (
  user_id uuid references public.profiles(user_id) on delete cascade,
  month_key text not null,
  amount_cents integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, month_key)
);

-- Hall of Fame
create table if not exists public.hall_of_fame (
  month_key text primary key,
  user_id uuid references public.profiles(user_id) on delete cascade,
  username_snapshot text,
  amount_cents integer not null default 0,
  link_url text,
  created_at timestamptz not null default now()
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.billing enable row level security;
alter table public.monthly_spend enable row level security;
alter table public.hall_of_fame enable row level security;

-- Profiles policies
create policy "Public read profiles" on public.profiles
for select using (true);

create policy "Users update own profile" on public.profiles
for update using (auth.uid() = user_id);

create policy "Users insert own profile" on public.profiles
for insert with check (auth.uid() = user_id);

-- Billing policies
create policy "Users read own billing" on public.billing
for select using (auth.uid() = user_id);

-- Monthly spend policies
create policy "Public read monthly spend" on public.monthly_spend
for select using (true);

-- Hall of fame policies
create policy "Public read hall of fame" on public.hall_of_fame
for select using (true);
