-- BLOQUE: RLS para public.auditoria
-- Ejecutar en Supabase SQL Editor.
-- Columnas esperadas (snake_case):
--   id, solicitud_id, codigo_seguimiento, accion, actor_tipo, actor_id,
--   estado_anterior, estado_nuevo, motivo, metadata, fecha, created_at

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.auditoria TO authenticated;
GRANT SELECT ON TABLE public.auditoria TO anon;

-- Operador activo: INSERT (registrar cambio de estado desde backoffice)
DROP POLICY IF EXISTS "operador_insert_auditoria" ON public.auditoria;
CREATE POLICY "operador_insert_auditoria"
ON public.auditoria
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.operadores o
    WHERE o.user_id = auth.uid()
      AND o.activo IS TRUE
  )
);

-- Operador activo: SELECT (timeline en detalle de solicitud)
DROP POLICY IF EXISTS "operador_select_auditoria" ON public.auditoria;
CREATE POLICY "operador_select_auditoria"
ON public.auditoria
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.operadores o
    WHERE o.user_id = auth.uid()
      AND o.activo IS TRUE
  )
);

-- Público (anon): SELECT para hitos de seguimiento por codigo_seguimiento
-- (el cliente filtra por código; no expone notas internas en el mapper de hitos)
DROP POLICY IF EXISTS "publico_select_auditoria" ON public.auditoria;
CREATE POLICY "publico_select_auditoria"
ON public.auditoria
FOR SELECT
TO anon, authenticated
USING (true);

-- Sin UPDATE/DELETE públicos: el histórico no se edita desde el cliente.
