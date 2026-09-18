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
- [ ] Crear `solicitudes`.
- [ ] Mapear `$id` → `id`.
- [ ] Mapear `codigoSeguimiento` → `codigo_seguimiento`.
- [ ] Migrar `nombre_familiar`, `email`, `telefono`, `nombre_persona`, `relacion`, `descripcion`.
- [ ] Migrar `estado`, `mensaje_publico`, `notas_internas`.
- [ ] Migrar `diditSessionId`, `diditVerificationUrl`, `kycResultado`, `motivoCierre`, `verificationUrl`.
- [ ] Conservar timestamps de Appwrite.
- [ ] Crear índices para código, sesión Didit, estado y fechas.

### 1.2 kyc_verifications
- [ ] Crear `kyc_verifications`.
- [ ] Migrar `solicitud_id`, `user_id`, `didit_session_id`, `status`, `codigo_seguimiento`.
- [ ] Conservar timestamps.
- [ ] Crear FK e índices.

### 1.3 operadores
- [x] Crear `operadores`. *(usuario: ya en Supabase)*
- [x] Vincular `user_id` con `auth.users(id)`. *(repo espera `user_id`)*
- [x] Migrar `email`, `nombre`, `rol`. *(mapper + DTO)*
- [x] Convertir `activo` de string a boolean. *(mapper `asBool`)*
- [x] Migrar `cancel_pin_hash`, `must_change_password`, `ultimo_login_at`.
- [ ] Conservar timestamps / backfill datos Appwrite.
- [ ] Crear restricciones/índices de unicidad.

### 1.4 auditoria
- [ ] Crear `auditoria`.
- [ ] Migrar solicitud, código, acción, actor, estados, motivo, metadata y fechas.
- [ ] Usar `jsonb` para `metadata`.
- [ ] Crear índices para solicitud, fecha y actor.

## 2. Supabase Auth — **cerrado en código; falta validar en runtime**
- [x] Configurar cliente Supabase Auth en el front.
- [ ] Mapear usuarios Appwrite → Supabase Auth *(crear usuarios en Auth + filas operadores).*
- [x] Resolver `operadores.user_id → auth.users.id` en login/restore.
- [x] Implementar login desde el cliente (`signInWithPassword`).
- [x] Implementar logout.
- [ ] Implementar recuperación/cambio de contraseña (UI SecurityGate).
- [x] Mantener `must_change_password` en entidad de sesión.
- [x] Actualizar `ultimo_login_at` al login. *(requiere policy UPDATE propia)*
- [x] No exponer secretos en variables Vite (solo anon key).

### Feature clean-architecture (`src/core/features/auth/`)
- [x] `domain/entities` — OperadorAuth
- [x] `domain/repositories` — contrato AuthRepository
- [x] `domain/use-cases` — Login, Logout, RestoreSession
- [x] `data/dto` — OperadorRowDto
- [x] `data/mappers` — operadorMapper
- [x] `data/repositories` — SupabaseAuthRepository
- [x] `di` — auth.module
- [x] `ui/store` — authStore (+ facade session.ts)
- [x] `ui/screens` — LoginScreen

## 3. RLS y seguridad
> RLS será la frontera principal entre el cliente y PostgreSQL.

### Operadores
- [x] Crear patrón seguro para identificar operador autenticado. *(`auth.uid() = user_id`)*
- [x] Restringir lectura de `operadores`. *(policy `operador_lee_propio` FOR SELECT)*
- [x] Permitir update del propio perfil (p. ej. `ultimo_login_at`). *(policy `operador_update_propio` FOR UPDATE + WITH CHECK)*
- [ ] Permitir administración solo a `admin` *(listar/editar otros operadores).*
- [ ] Permitir operaciones operativas según rol *(cuando existan policies en `solicitudes`).*
- [ ] Proteger columnas sensibles en UPDATE (`rol`, `activo`, `cancel_pin_hash`) — idealmente con trigger o policy que impida auto-escalada.
- [x] No exponer hashes/datos internos a usuarios públicos. *(anon sin SELECT en operadores)*

### Solicitudes públicas
- [ ] Definir campos públicos exactos.
- [ ] No exponer la fila completa para tracking.
- [ ] Crear vista segura o RPC de lectura mínima por `codigo_seguimiento`.
- [ ] Evitar enumeración de solicitudes.

### Solicitudes de operadores
- [ ] Restringir dashboard a operadores autorizados.
- [ ] Permitir CRUD según rol.
- [ ] Proteger notas internas y KYC.
- [ ] Validar estados en DB.
- [ ] Probar usuario sin rol, operador inactivo y no autenticado.

### Auditoría
- [ ] Impedir edición/eliminación libre del histórico.
- [ ] Evaluar trigger PostgreSQL para cambios críticos.
- [ ] Garantizar auditoría de transiciones importantes.

## 4. Solicitudes — cliente directo
- [ ] Crear `solicitudesRepository` con Supabase.
- [ ] Sustituir `createDocument` por `insert`.
- [ ] Sustituir `updateDocument` por `update`.
- [ ] Sustituir `getDocument` por `select/eq`.
- [ ] Sustituir búsquedas por código y sesión Didit.
- [ ] Sustituir listados filtrados por estado.
- [ ] Mantener orden descendente y paginación.
- [ ] Centralizar mapeo Appwrite → PostgreSQL.
- [ ] Eliminar llamadas al API anterior.

## 5. Dashboard / operadores
- [ ] Carga inicial directa desde Supabase.
- [ ] Filtros por estado.
- [ ] Búsqueda.
- [ ] Paginación.
- [ ] Detalle de solicitud.
- [ ] Actualización de estado.
- [ ] Cierre/cancelación.
- [ ] Notas internas.
- [ ] Acciones de operador con RLS.
- [ ] Acciones de admin protegidas.

## 6. Realtime
- [ ] Habilitar Realtime para tablas necesarias.
- [ ] Suscribirse a cambios de `solicitudes`.
- [ ] Actualizar UI ante INSERT/UPDATE.
- [ ] Evitar duplicados entre estado local y eventos.
- [ ] Implementar reconexión.
- [ ] Sincronizar tras reconexión.
- [ ] Mantener carga inicial independiente de Realtime.

## 7. KYC / Didit

### Cliente
- [ ] Mantener solo información no secreta.
- [ ] Crear capa cliente para iniciar KYC.
- [ ] Persistir/leer desde Supabase los datos permitidos.

### Edge Function didit-create-session
- [ ] Crear `supabase/functions/didit-create-session`.
- [ ] Guardar credencial Didit en Supabase Secrets.
- [ ] Validar autenticación/autorización.
- [ ] Crear sesión Didit.
- [ ] Persistir `didit_session_id` y URL.
- [ ] Crear `kyc_verifications`.
- [ ] Nunca exponer la API key de Didit.

### Edge Function didit-webhook
- [ ] Crear `supabase/functions/didit-webhook`.
- [ ] Validar autenticidad del webhook.
- [ ] Localizar solicitud por `didit_session_id`.
- [ ] Actualizar resultado KYC.
- [ ] Cambiar `sin_verificar` → `verificado` cuando corresponda.
- [ ] Registrar auditoría.
- [ ] Hacer procesamiento idempotente.

## 8. Operaciones atómicas
- [ ] Identificar operaciones con varias escrituras.
- [ ] Mantener CRUD directo cuando no necesite transacción.
- [ ] Crear RPC PostgreSQL solo para operaciones que requieran atomicidad.
- [ ] Evitar RPC genéricas con permisos excesivos.
- [ ] Validar rol dentro de operaciones sensibles.
- [ ] Revisar `SECURITY DEFINER`, `search_path` y permisos.
- [ ] Probar rollback.

## 9. Migración de datos Appwrite → Supabase
- [ ] Exportar datos Appwrite.
- [ ] Mapear IDs y relaciones.
- [ ] Normalizar booleanos y timestamps.
- [ ] Validar estados.
- [ ] Importar `operadores`.
- [ ] Importar `solicitudes`.
- [ ] Importar `kyc_verifications`.
- [ ] Importar `auditoria`.
- [ ] Comparar conteos Appwrite/Supabase.
- [ ] Verificar huérfanos.
- [ ] Verificar unicidad de códigos.
- [ ] Verificar relaciones solicitud/KYC.
- [ ] Verificar fechas históricas.
- [ ] Validar datos sensibles antes del corte.

## 10. Pruebas MVP

### Auth
- [ ] Login válido/inválido.
- [ ] Logout.
- [ ] Sesión persistente.
- [ ] Cambio de contraseña.
- [ ] Usuario sin operador.
- [ ] Operador inactivo.
- [ ] Admin.

### Solicitudes
- [ ] Crear.
- [ ] Consultar por ID.
- [ ] Tracking por código.
- [ ] Actualizar autorizado.
- [ ] Filtrar.
- [ ] Paginar.
- [ ] Rechazar estados inválidos.

### Seguridad
- [ ] Público no puede listar solicitudes.
- [ ] Público no puede leer notas internas.
- [ ] Público no puede leer KYC sensible.
- [ ] Operador no puede ejecutar acciones admin.
- [ ] Operador no puede modificar campos protegidos.
- [ ] No autenticado no accede al dashboard.
- [ ] Auditoría no es manipulable por CRUD público.

### Didit
- [ ] Crear sesión.
- [ ] Persistir sesión.
- [ ] Recibir webhook.
- [ ] Actualizar KYC/estado.
- [ ] Repetir webhook sin duplicar efectos.

### Realtime
- [ ] Cambio de otro operador aparece en dashboard.
- [ ] Reconexión recupera estado correcto.
- [ ] No aparecen duplicados.

## 11. Corte y eliminación de Appwrite
- [ ] Ejecutar migración final.
- [ ] Congelar escrituras Appwrite durante el corte.
- [ ] Validar conteos y relaciones.
- [ ] Cambiar cliente a Supabase.
- [ ] Probar MVP en producción.
- [ ] Confirmar Didit y webhooks.
- [ ] Monitorizar errores posteriores.
- [ ] Eliminar dependencias Appwrite.
- [ ] Eliminar configuración Appwrite de CI/CD.
- [ ] Eliminar variables obsoletas.
- [ ] Mantener respaldo original.

## 12. Definition of Done — MVP
- [ ] Huella funciona sin API anterior.
- [ ] Cliente → Supabase es el flujo principal.
- [ ] Auth funciona.
- [ ] CRUD de solicitudes funciona con RLS.
- [ ] Tracking público solo expone información pública.
- [ ] Dashboard funciona directamente contra Supabase.
- [ ] Roles `admin` / `operador` están protegidos.
- [ ] Auditoría crítica funciona.
- [ ] Didit no expone secretos.
- [ ] Webhook Didit e idempotencia están validados.
- [ ] Realtime funciona.
- [ ] Datos históricos fueron reconciliados.
- [ ] Tests críticos pasan.
- [ ] Appwrite puede retirarse sin romper el MVP.

---

## Siguiente paso recomendado

**Validar auth end-to-end** (antes de abrir otra feature):

1. Crear 1 usuario en Supabase Auth.
2. Insertar fila en `operadores` con el mismo `user_id`.
3. `npm install` + `VITE_SUPABASE_*` en `.env`.
4. Probar en rama `migration`: login OK, restore al recargar, logout, `ultimo_login_at` actualizado.
5. Casos negativos: password mala, usuario sin fila en `operadores`, `activo = false`.

Cuando eso esté verde → **feature `solicitudes`** (mismo esquema data/domain/ui + RLS de lectura pública por código y CRUD de operadores).
