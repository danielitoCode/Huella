-- BLOQUE: RLS para que un admin gestione otros operadores (Equipo).
-- Evita recursión RLS con función SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.is_operador_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.operadores
    WHERE user_id = auth.uid()
      AND lower(coalesce(rol, '')) = 'admin'
      AND (activo IS TRUE OR activo::text IN ('true', '1', 'si', 'sí'))
  );
$$;

REVOKE ALL ON FUNCTION public.is_operador_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_operador_admin() TO authenticated;

-- Admin lee todos los perfiles
DROP POLICY IF EXISTS "admin_select_operadores" ON public.operadores;
CREATE POLICY "admin_select_operadores"
ON public.operadores
FOR SELECT
TO authenticated
USING (public.is_operador_admin());

-- Admin actualiza cualquier operador (rol, activo, pin reset)
DROP POLICY IF EXISTS "admin_update_operadores" ON public.operadores;
CREATE POLICY "admin_update_operadores"
ON public.operadores
FOR UPDATE
TO authenticated
USING (public.is_operador_admin())
WITH CHECK (public.is_operador_admin());

-- Nota: operador_lee_propio y operador_update_propio deben seguir existiendo
-- para el propio perfil (login, SecurityGate, ultimo_login_at).
