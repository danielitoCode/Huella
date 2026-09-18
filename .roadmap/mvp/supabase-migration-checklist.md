# MVP — Migración de Appwrite a Supabase

> Objetivo: migrar Huella a **Client → Supabase**, sin crear una nueva API. El cliente usará Supabase Auth, PostgreSQL, RLS y Realtime directamente. Las Edge Functions quedan reservadas para operaciones que no pueden ejecutarse de forma segura en el cliente, especialmente Didit y webhooks.

> Rama de trabajo: **`migration`**. Merge a `master` solo cuando el esquema funcional esté listo.

## 0. Preparación
- [x] Crear proyecto Supabase. *(usuario: tablas ya creadas)*
- [x] Configurar URL y publishable/anon key en el cliente. *(código: `src/lib/supabase/*` + `.env.example`)*
- [x] Crear integración/cliente Supabase. *(singleton `getSupabase()`)*
- [x] No crear una API intermedia `huella-api` para auth.
- [ ] Mantener mapa Appwrite → Supabase (datos históricos).
- [ ] Definir estrategia de corte y rollback.

## 1. Modelo de datos PostgreSQL

### 1.1 solicitudes
- [x] Crear `solicitudes`. *(usuario: tabla en Supabase)*
- [x] Mapear columnas en DTO/mapper (`codigo_seguimiento`, etc.).
- [ ] Backfill datos históricos desde Appwrite.
- [ ] Crear índices para código, sesión Didit, estado y fechas.

### 1.2 kyc_verifications
- [ ] Crear `kyc_verifications`.
- [ ] Migrar `solicitud_id`, `user_id`, `didit_session_id`, `status`, `codigo_seguimiento`.
- [ ] Conservar timestamps.
- [ ] Crear FK e índices.

### 1.3 operadores
- [x] Crear `operadores`.
- [x] Vincular `user_id` con `auth.users(id)`.
- [x] Campos email, nombre, rol, activo, pin, must_change_password, ultimo_login_at.
- [ ] Conservar timestamps / backfill datos Appwrite.
- [ ] Crear restricciones/índices de unicidad.

### 1.4 auditoria
- [ ] Crear `auditoria`.
- [ ] Migrar solicitud, código, acción, actor, estados, motivo, metadata y fechas.
- [ ] Usar `jsonb` para `metadata`.
- [ ] Crear índices para solicitud, fecha y actor.

## 2. Supabase Auth — **VALIDADO EN RUNTIME** ✅
- [x] Configurar cliente Supabase Auth en el front.
- [x] Login efectivo en local (confirmado por el equipo).
- [ ] Mapear resto de usuarios Appwrite → Supabase Auth (producción).
- [x] Resolver `operadores.user_id → auth.users.id` en login/restore.
- [x] Implementar login (`signInWithPassword`).
- [x] Implementar logout.
- [ ] Implementar recuperación/cambio de contraseña (UI SecurityGate).
- [x] Mantener `must_change_password` en entidad de sesión.
- [x] Actualizar `ultimo_login_at` al login.
- [x] No exponer secretos en variables Vite (solo anon key).

### Feature clean-architecture (`src/core/features/auth/`)
- [x] domain / data / di / ui completos.

## 3. RLS y seguridad

### Operadores
- [x] `operador_lee_propio` (SELECT).
- [x] `operador_update_propio` (UPDATE + WITH CHECK).
- [ ] Admin lista/edita otros operadores.
- [ ] Proteger columnas sensibles en UPDATE (`rol`, `activo`, `cancel_pin_hash`).

### Solicitudes
- [ ] Aplicar script `.roadmap/mvp/solicitudes-rls.sql` en SQL Editor.
- [ ] Afinar SELECT público (ideal: RPC por código, no `using (true)` permanente).
- [ ] Probar insert público, tracking por código, list/update con sesión operador.

### Auditoría
- [ ] Policies e inserción en cambios de estado.

## 4. Solicitudes — cliente directo — **EN CURSO**
- [x] Crear `SupabaseSolicitudRepository`.
- [x] `insert` (create).
- [x] `update`.
- [x] `select` getById / list / getByCode.
- [x] Mapper snake_case ↔ camelCase.
- [x] Facade `getSolicitudRepository()` apunta a Supabase.
- [ ] Validar create en formulario público (runtime).
- [ ] Validar listado y detalle en backoffice (runtime).
- [ ] Validar seguimiento por código (runtime).
- [ ] Eliminar restos Appwrite en CI cuando el corte esté listo.

## 5. Dashboard / operadores
- [ ] Verificar que Dashboard/Solicitudes/Detalle funcionan con el nuevo repo.
- [ ] Filtros, paginación, notas, cambios de estado.

## 6–12
*(sin cambios de estado — pendientes tras cerrar §4 runtime)*

---

## Siguiente paso recomendado (ahora)

1. **`git pull origin migration`**
2. Ejecutar en Supabase SQL Editor el archivo  
   **`.roadmap/mvp/solicitudes-rls.sql`**  
   (ajusta nombres de columnas si tu tabla difiere).
3. Probar en local:
   - Formulario público → crear solicitud → obtener código.
   - Seguimiento con ese código.
   - Login operador → listado y detalle → cambio de estado.
4. Si falla por RLS o columna inexistente, copiar el error y lo alineamos al schema real.
