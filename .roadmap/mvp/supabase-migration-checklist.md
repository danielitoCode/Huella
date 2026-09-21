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
- [x] Campos usados por login.
- [ ] Índices/unicidad y backfill histórico.

### 1.4 auditoria
- [x] Tabla + repo Supabase + policies INSERT/SELECT.
- [x] **Escritura y lectura validadas en runtime (backoffice).**

## 2. Auth — **VALIDADO** ✅
- [x] Feature clean-arch, login, logout, restore, perfil operadores.
- [x] RLS propio (SELECT/UPDATE).
- [x] Prueba local OK.
- [ ] SecurityGate cambio de contraseña / PIN sobre Supabase.
- [ ] Migrar resto de usuarios Appwrite → Auth (prod).

## 3. RLS solicitudes / auditoría
- [x] INSERT/SELECT públicos solicitudes.
- [x] UPDATE operadores activos (cambio de estado OK).
- [x] INSERT/SELECT auditoría (operador + lectura timeline).
- [ ] Endurecer SELECT público (RPC por código).

## 4. Solicitudes — cliente directo — **VALIDADO núcleo MVP** ✅
- [x] Create público.
- [x] Seguimiento por código.
- [x] Listado + detalle admin.
- [x] Cambio de estado (incl. verificado + notas / kyc_resultado).
- [x] Auditoría en cambios de estado (Supabase, no Appwrite).

## 5. Dashboard / backoffice
- [x] Listado, detalle, transiciones con repo Supabase.
- [ ] Pulir mensajes de error / skeletons si hace falta.

## 6. Realtime
- [ ] Suscripción a cambios de `solicitudes` en dashboard.

## 7. KYC / Didit
- [ ] Edge Function create-session.
- [ ] Edge Function webhook + idempotencia.

## 8–9. Datos históricos / corte
- [ ] Backfill Appwrite → Supabase.
- [ ] Quitar dependencias Appwrite del front y CI.

## 10. Pruebas MVP
- [x] Auth login.
- [x] Crear + tracking.
- [x] Listar / detalle / update operador.
- [x] Auditoría registrar + listar.
- [ ] Casos negativos (inactivo, sin perfil, etc.).

---

## Hecho (resumen)

| Área | Estado |
|------|--------|
| Auth operadores | ✅ |
| Create + seguimiento público | ✅ |
| Backoffice list/detalle/estados | ✅ |
| Auditoría Supabase | ✅ |
| Appwrite en flujo principal solicitudes/auth/audit | ❌ ya no |

---

## Siguiente paso recomendado

1. **Cerrar ciclo público de hitos** — en `/seguimiento`, tras un cambio de estado, confirmar que aparecen hitos de auditoría (no solo sintéticos).
2. **SecurityGate** — cambio de contraseña / `must_change_password` con Supabase Auth.
3. **Quitar restos Appwrite** del bundle (imports muertos, `package.json` cuando no quede nada).
4. **Didit** solo cuando haga falta KYC real (Edge Functions + secrets).

Opcional de calidad: RPC `get_seguimiento(codigo)` y Realtime en el dashboard.
