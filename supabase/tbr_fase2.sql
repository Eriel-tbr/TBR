-- Mi TBR · copia en la nube (fase 2)
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez sin romper nada.
-- Usa el mismo proyecto que Puerco; todo lo de Mi TBR va con el prefijo tbr_ y no toca sus tablas.

-- 1) Colección: una fila por persona con todo el estado de la app
create table if not exists public.tbr_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  rev        integer not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.tbr_state enable row level security;
drop policy if exists "tbr_state propia" on public.tbr_state;
create policy "tbr_state propia" on public.tbr_state
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 2) Copias automáticas: guarda la versión anterior como mucho cada 12 h y conserva las 30 últimas
create table if not exists public.tbr_backups (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  data       jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists tbr_backups_user on public.tbr_backups(user_id, created_at desc);
alter table public.tbr_backups enable row level security;
drop policy if exists "tbr_backups leer propias" on public.tbr_backups;
create policy "tbr_backups leer propias" on public.tbr_backups for select using (user_id = auth.uid());

create or replace function public.tbr_backup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if not exists (select 1 from tbr_backups where user_id = old.user_id and created_at > now() - interval '12 hours') then
    insert into tbr_backups(user_id, data) values (old.user_id, old.data);
    delete from tbr_backups where user_id = old.user_id and id not in
      (select id from tbr_backups where user_id = old.user_id order by created_at desc limit 30);
  end if;
  return new;
end $$;
drop trigger if exists tbr_backup on public.tbr_state;
create trigger tbr_backup before update on public.tbr_state for each row execute function public.tbr_backup();

-- 3) Avisos en tiempo real entre dispositivos
do $$ begin
  alter publication supabase_realtime add table public.tbr_state;
exception when duplicate_object then null; end $$;

-- 4) Portadas subidas desde el móvil: carpeta propia por persona, lectura pública
insert into storage.buckets (id, name, public) values ('tbr-portadas', 'tbr-portadas', true)
  on conflict (id) do nothing;
drop policy if exists "tbr portadas subir" on storage.objects;
create policy "tbr portadas subir" on storage.objects for insert to authenticated
  with check (bucket_id = 'tbr-portadas' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "tbr portadas cambiar" on storage.objects;
create policy "tbr portadas cambiar" on storage.objects for update to authenticated
  using (bucket_id = 'tbr-portadas' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "tbr portadas borrar" on storage.objects;
create policy "tbr portadas borrar" on storage.objects for delete to authenticated
  using (bucket_id = 'tbr-portadas' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "tbr portadas ver propias" on storage.objects;
create policy "tbr portadas ver propias" on storage.objects for select to authenticated
  using (bucket_id = 'tbr-portadas' and (storage.foldername(name))[1] = auth.uid()::text);
