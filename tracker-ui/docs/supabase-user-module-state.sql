create table if not exists public.user_module_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_key text not null,
  mode text not null default 'GLOBAL',
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_key, mode)
);

alter table public.user_module_state enable row level security;

drop policy if exists "Users can read own module state" on public.user_module_state;
create policy "Users can read own module state"
on public.user_module_state
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own module state" on public.user_module_state;
create policy "Users can insert own module state"
on public.user_module_state
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own module state" on public.user_module_state;
create policy "Users can update own module state"
on public.user_module_state
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own module state" on public.user_module_state;
create policy "Users can delete own module state"
on public.user_module_state
for delete
using (auth.uid() = user_id);
