-- Info Tarkov - add Seasonal PVP as an independent account preference.
-- Run once in the Supabase SQL editor before publishing the third game mode.

alter table public.user_profiles
drop constraint if exists user_profiles_primary_game_mode_check;

alter table public.user_profiles
add constraint user_profiles_primary_game_mode_check
check (primary_game_mode in ('PVP', 'PVE', 'SEASONAL_PVP', 'BOTH'));

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

  if metadata_mode not in ('PVP', 'PVE', 'SEASONAL_PVP', 'BOTH') then
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
