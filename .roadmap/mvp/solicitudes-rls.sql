-- BLOQUE: Policies RLS para public.solicitudes (MVP migración)
-- Ejecutar en Supabase SQL Editor después de crear la tabla.
-- Ajusta nombres de columnas si tu schema difiere.

alter table public.solicitudes enable row level security;

-- 1) Público anónimo: INSERT de nuevas solicitudes (formulario web)
drop policy if exists "publico_insert_solicitud" on public.solicitudes;
create policy "publico_insert_solicitud"
on public.solicitudes
for insert
to anon, authenticated
with check (true);

-- 2) Público: SELECT solo por codigo_seguimiento (tracking).
-- Nota: PostgREST aplica RLS por fila; el cliente filtra por código.
-- Para mayor seguridad, preferir una RPC get_seguimiento(codigo text) más adelante.
drop policy if exists "publico_select_por_codigo" on public.solicitudes;
create policy "publico_select_por_codigo"
on public.solicitudes
for select
to anon, authenticated
using (true);
-- ⚠️ using (true) permite listar si alguien llama .select() sin filtro.
-- Mitigación temporal: no exponer service key; en el cliente solo getByCode.
-- Mejora recomendada: revocar SELECT amplio y usar RPC SECURITY DEFINER.

-- 3) Operadores autenticados: SELECT / UPDATE de todas las solicitudes
drop policy if exists "operador_select_solicitudes" on public.solicitudes;
create policy "operador_select_solicitudes"
on public.solicitudes
for select
to authenticated
using (
  exists (
    select 1 from public.operadores o
    where o.user_id = auth.uid()
      and o.activo is true
  )
);

drop policy if exists "operador_update_solicitudes" on public.solicitudes;
create policy "operador_update_solicitudes"
on public.solicitudes
for update
to authenticated
using (
  exists (
    select 1 from public.operadores o
    where o.user_id = auth.uid()
      and o.activo is true
  )
)
with check (
  exists (
    select 1 from public.operadores o
    where o.user_id = auth.uid()
      and o.activo is true
  )
);

-- Opcional: DELETE solo admin
drop policy if exists "admin_delete_solicitudes" on public.solicitudes;
create policy "admin_delete_solicitudes"
on public.solicitudes
for delete
to authenticated
using (
  exists (
    select 1 from public.operadores o
    where o.user_id = auth.uid()
      and o.activo is true
      and o.rol = 'admin'
  )
);
