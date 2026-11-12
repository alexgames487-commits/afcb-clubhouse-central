create type public.app_role as enum ('superadmin','club_manager','player');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  platform_id text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'superadmin'));
create policy "superadmin manages roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'superadmin')) with check (public.has_role(auth.uid(),'superadmin'));
create policy "superadmin reads profiles" on public.profiles for select to authenticated
  using (public.has_role(auth.uid(),'superadmin'));

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  crest_url text,
  manager_id uuid,
  coins numeric not null default 0,
  created_at timestamptz not null default now()
);
create table public.players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  sport_name text not null,
  platform_id text,
  position text,
  club_id uuid references public.clubs(id) on delete set null,
  market_value numeric not null default 0,
  created_at timestamptz not null default now()
);
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status text not null default 'planned',
  season text,
  created_at timestamptz not null default now()
);
create table public.competition_clubs (
  competition_id uuid references public.competitions(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  primary key (competition_id, club_id)
);
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  published_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['clubs','players','competitions','competition_clubs','news'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "superadmin write" on public.%I for all to authenticated using (public.has_role(auth.uid(),''superadmin'')) with check (public.has_role(auth.uid(),''superadmin''))', t);
  end loop;
end $$;

create policy "manager updates own club" on public.clubs for update to authenticated
  using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "player updates own profile" on public.players for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare r text := coalesce(new.raw_user_meta_data->>'account_type','player');
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, case when r = 'club_manager' then 'club_manager'::app_role else 'player'::app_role end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();