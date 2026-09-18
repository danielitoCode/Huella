# MVP — Migración de Appwrite a Supabase

> Objetivo: migrar Huella a **Client → Supabase**, sin crear una nueva API intermedia. Auth, PostgreSQL y RLS desde el cliente. Edge Functions solo para secretos (Didit, webhooks).

> Rama: **`migration`**. Merge a `master` cuando el esquema funcional esté estable.

---

## 0. Preparación
- [x] Proyecto Supabase creado.
- [x] `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` en cliente.
- [x] Cliente singleton `getSupabase()`.
- [x] Sin API intermedia para auth ni CRUD de solicitudes.
- [ ] Mapa Appwrite → Supabase (backfill histórico).
- [ ] Estrategia de corte y rollback documentada.

## 1. Modelo de datos

### 1.1 solicitudes
- [x] Tabla `solicitudes` en Supabase.
- [x] DTO + mapper snake_case ↔ camelCase.
- [x] Ajuste de columnas al schema real (sin `creado_por_ip`).
- [ ] Índices (código, estado, fechas, didit).
- [ ] Backfill desde Appwrite.

### 1.2 kyc_verifications
- [ ] Tabla + FK + índices.

### 1.3 operadores
- [x] Tabla + vínculo `user_id` → `auth.users`.
- [x] Campos usados por login (rol, activo, pin, must_change_password, ultimo_login_at).
- [ ] Índices/unicidad y backfill histórico.

### 1.4 auditoria
- [ ] Tabla + policies + escritura en cambios de estado.

## 2. Auth — **VALIDADO EN RUNTIME** ✅
- [x] Feature clean-arch `src/core/features/auth/` (domain, data, di, ui).
- [x] Login `signInWithPassword`.
- [x] Logout + restore session al boot.
- [x] Perfil desde `operadores` por `user_id`.
- [x] `ultimo_login_at` al login.
- [x] Solo anon key en Vite (sin service_role).
- [x] **Prueba local: autenticación efectiva.**
- [ ] Cambio de contraseña / SecurityGate sobre Supabase.
- [ ] Migrar resto de usuarios Appwrite → Auth (prod).

## 3. RLS

### Operadores
- [x] `operador_lee_propio` (SELECT, `auth.uid() = user_id`).
- [x] `operador_update_propio` (UPDATE + WITH CHECK).
- [ ] Admin gestiona otros operadores.
- [ ] Bloqueo de auto-escalada de `rol` / `activo` / pin.

### Solicitudes
- [x] `publico_insert_solicitud` (INSERT, anon + authenticated, `WITH CHECK (true)`).
- [x] `publico_select_solicitudes` (SELECT; necesario para `.select()` post-insert y tracking).
- [x] **Prueba local: crear solicitud desde formulario público OK.**
- [ ] Policy UPDATE solo operadores activos.
- [ ] Endurecer SELECT público (RPC por `codigo_seguimiento`, evitar listado total).
- [ ] Validar list/update en backoffice con sesión operador.

### Auditoría
- [ ] Policies + triggers o insert desde cliente autenticado.

## 4. Solicitudes — cliente directo — **parcialmente validado**
- [x] `SupabaseSolicitudRepository` (create, getById, getByCode, list, update, delete).
- [x] Facade `getSolicitudRepository()` → Supabase.
- [x] **Create desde UI pública validado (runtime).**
- [ ] Seguimiento por código (UI pública) validado.
- [ ] Listado + detalle admin validados.
- [ ] Cambio de estado (pendiente → sin_verificar → verificado → cerrado / cancelada).
- [ ] Notas internas en update.

## 5. Dashboard / backoffice
- [ ] Confirmar listado, filtros, detalle, transiciones con repo Supabase.
- [ ] Skeletons / errores alineados a mensajes Supabase.

## 6. Realtime
- [ ] Suscripción a cambios de `solicitudes` en dashboard.

## 7. KYC / Didit
- [ ] Edge Function create-session (secreto Didit).
- [ ] Edge Function webhook + idempotencia.

## 8–9. RPC atómicas / migración de datos
- [ ] Solo si hace falta atomicidad multi-tabla.
- [ ] Export/import Appwrite → Supabase y reconciliación.

## 10. Pruebas MVP (runtime)

### Auth
- [x] Login válido.
- [ ] Logout, sesión persistente, credenciales inválidas, sin perfil operador, inactivo.

### Solicitudes
- [x] Crear (público).
- [ ] Tracking por código.
- [ ] Listar / detalle / update (operador).
- [ ] Rechazo de estados inválidos.

### Seguridad
- [ ] Público no lista todo el inventario de forma trivial (mejorar con RPC).
- [ ] Notas internas no en tracking.
- [ ] Dashboard sin sesión bloqueado (ya en App.svelte).

## 11–12. Corte Appwrite / Definition of Done
- [ ] Pendiente hasta cerrar §4–5 y Didit mínimo.

---

## Hecho en esta fase (resumen)

| Área | Estado |
|------|--------|
| Auth operadores (código + login local) | ✅ |
| RLS operadores (SELECT/UPDATE propio) | ✅ |
| Repo solicitudes Supabase + facade | ✅ |
| Create solicitud pública + RLS INSERT/SELECT | ✅ |
| CI paths / exports rotos | ✅ corregidos |

---

## Siguiente paso recomendado

**Cerrar el circuito de solicitudes en runtime (mismo día, alto impacto):**

1. **Seguimiento público** — abrir `/seguimiento` con el código `HUE-…` recién creado; confirmar estado y mensaje.
2. **Backoffice** — login operador → listado de solicitudes → abrir detalle.
3. **Transición de estado** — p. ej. `pendiente` → `sin_verificar` (y opcionalmente notas internas); confirmar que el UPDATE no da 403.
4. Si el UPDATE falla: añadir policy:
   ```sql
   CREATE POLICY "operador_update_solicitudes"
   ON public.solicitudes FOR UPDATE TO authenticated
   USING (EXISTS (SELECT 1 FROM operadores o WHERE o.user_id = auth.uid() AND o.activo IS TRUE))
   WITH CHECK (EXISTS (SELECT 1 FROM operadores o WHERE o.user_id = auth.uid() AND o.activo IS TRUE));
   ```
5. Cuando 1–3 estén verdes → **auditoría** en cambios de estado (tabla + insert desde el detalle admin).

Opcional en paralelo: RPC `get_seguimiento(codigo)` para no dejar SELECT abierto a todo el mundo.
