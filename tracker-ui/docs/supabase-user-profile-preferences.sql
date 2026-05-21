-- Info Tarkov - user profile preferences
-- Run this in Supabase SQL editor before relying on cloud storage for Tarkov username and main mode.

alter table public.user_profiles
add column if not exists tarkov_username text,
add column if not exists primary_game_mode text default 'PVP';

create unique index if not exists user_profiles_username_lower_unique
on public.user_profiles (lower(username))
where username is not null;

create unique index if not exists user_profiles_tarkov_username_lower_unique
on public.user_profiles (lower(tarkov_username))
where tarkov_username is not null;

update public.user_profiles
set
  tarkov_username = coalesce(tarkov_username, username),
  primary_game_mode = coalesce(primary_game_mode, 'PVP')
where tarkov_username is null
   or primary_game_mode is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_primary_game_mode_check'
  ) then
    alter table public.user_profiles
    add constraint user_profiles_primary_game_mode_check
    check (primary_game_mode in ('PVP', 'PVE', 'BOTH'));
  end if;
end $$;

create or replace function public.is_username_available(candidate_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.user_profiles
    where lower(username) = lower(trim(candidate_username))
       or lower(tarkov_username) = lower(trim(candidate_username))
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_username text;
  metadata_mode text;
begin
  metadata_username := coalesce(
    nullif(new.raw_user_meta_data->>'tarkov_username', ''),
    nullif(new.raw_user_meta_data->>'username', '')
  );

  metadata_mode := upper(coalesce(nullif(new.raw_user_meta_data->>'primary_game_mode', ''), 'PVP'));

  if metadata_mode not in ('PVP', 'PVE', 'BOTH') then
    metadata_mode := 'PVP';
  end if;

  if metadata_username is not null then
    insert into public.user_profiles (
      user_id,
      username,
      tarkov_username,
      primary_game_mode,
      updated_at
    )
    values (
      new.id,
      metadata_username,
      metadata_username,
      metadata_mode,
      now()
    )
    on conflict (user_id) do update
    set
      username = coalesce(public.user_profiles.username, excluded.username),
      tarkov_username = coalesce(public.user_profiles.tarkov_username, excluded.tarkov_username),
      primary_game_mode = coalesce(public.user_profiles.primary_game_mode, excluded.primary_game_mode),
      updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

drop function if exists public.list_admin_users();

create function public.list_admin_users()
returns table (
  user_id uuid,
  email text,
  username text,
  tarkov_username text,
  auth_username text,
  auth_tarkov_username text,
  role text,
  created_at timestamptz,
  last_seen timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.user_roles
    where public.user_roles.user_id = auth.uid()
      and public.user_roles.role = 'admin'
  ) then
    raise exception 'Not authorized';
  end if;

  return query
  select
    users.id as user_id,
    users.email::text as email,
    coalesce(profiles.username, profiles.tarkov_username, users.raw_user_meta_data->>'username', users.raw_user_meta_data->>'tarkov_username')::text as username,
    profiles.tarkov_username::text as tarkov_username,
    (users.raw_user_meta_data->>'username')::text as auth_username,
    (users.raw_user_meta_data->>'tarkov_username')::text as auth_tarkov_username,
    coalesce(roles.role, 'user')::text as role,
    users.created_at,
    max(sessions.last_seen) as last_seen
  from auth.users as users
  left join public.user_profiles as profiles
    on profiles.user_id = users.id
  left join public.user_roles as roles
    on roles.user_id = users.id
  left join public.app_active_sessions as sessions
    on sessions.user_id = users.id
  group by users.id, users.email, users.raw_user_meta_data, users.created_at, profiles.username, profiles.tarkov_username, roles.role
  order by users.created_at desc;
end;
$$;

grant execute on function public.list_admin_users() to authenticated;

drop function if exists public.admin_get_user_progress(uuid);

create function public.admin_get_user_progress(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  module_states jsonb := '[]'::jsonb;
  quest_progress_rows jsonb := '[]'::jsonb;
begin
  if not exists (
    select 1
    from public.user_roles
    where public.user_roles.user_id = auth.uid()
      and public.user_roles.role = 'admin'
  ) then
    raise exception 'Not authorized';
  end if;

  if to_regclass('public.user_module_state') is not null then
    execute $query$
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'module_key', module_key,
            'mode', mode,
            'updated_at', updated_at
          )
          order by updated_at desc
        ),
        '[]'::jsonb
      )
      from public.user_module_state
      where user_id = $1
    $query$
    using target_user_id
    into module_states;
  end if;

  if to_regclass('public.quest_progress') is not null then
    execute $query$
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'mode', mode,
            'completed_count',
              case
                when jsonb_typeof(completed_task_ids) = 'array' then jsonb_array_length(completed_task_ids)
                else 0
              end,
            'updated_at', updated_at
          )
          order by mode
        ),
        '[]'::jsonb
      )
      from public.quest_progress
      where user_id = $1
    $query$
    using target_user_id
    into quest_progress_rows;
  end if;

  return jsonb_build_object(
    'module_states', module_states,
    'quest_progress', quest_progress_rows
  );
end;
$$;

grant execute on function public.admin_get_user_progress(uuid) to authenticated;
