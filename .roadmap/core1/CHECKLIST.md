# Core 1 — Checklist por esquemas funcionales

**Rama de trabajo:** `core1` (no PR a `master` hasta cerrar un esquema completo)  
**Meta del ciclo:** familiar crea y sigue solicitud; operador autentica, gestiona y dispara KYC; Didit cierra verificación por webhook.

**Convención**

- Marcar `[x]` solo con criterio de aceptación cumplido **y** tests/CI del área en verde en `core1`.
- Un **esquema funcional** se considera cerrado cuando todos sus ítems están `[x]` y es demostrable de punta a punta.
- `master` recibe un PR por esquema cerrado (o agrupación coherente), no por fixes sueltos.

---

## Resumen de esquemas

| ID | Esquema | Estado |
|----|---------|--------|
| **F0** | Fundación (Appwrite + functions + CI + cliente web) | **Cerrado** |
| **A** | Solicitud pública + tracking | **Siguiente** |
| **B** | Auth operadores | Pendiente |
| **C** | Backoffice de solicitudes | Pendiente (después de B) |
| **D** | KYC Didit (inicio + webhook) | Pendiente (después de C) |
| **U** | UI/UX (temas, animaciones, ortografía) | Pendiente (puede ir en paralelo al final) |
| **Z** | Calidad y cierre Core 1 | Pendiente |

---

## F0 — Fundación *(cerrado)*

Infra y cable base. Sin esto no hay esquemas de negocio reales.

### Infra Appwrite (Console)

- [x] **F0.1** Proyecto + plataforma Web
- [x] **F0.2** Database `huella` + colección `solicitudes` (+ índices)
- [x] **F0.3** Colección `kyc_verifications` (+ índices)
- [x] **F0.4** Colección `webhook_events` (`event_id` unique)
- [x] **F0.5** Colecciones `operadores` y `auditoria`
- [x] **F0.6** API Key + `.env` / variables de Site y Functions
- [x] **F0.7** Functions desplegadas: `huella-api`, `huella-webhooks` (Git → `master` o deploy activo)
- [x] **F0.8** Site estático Vite (`dist`, fallback `index.html`)

### Calidad de base + cliente

- [x] **F0.9** Tests unitarios + CI independientes (`web` / `huella-api` / `huella-webhooks`)
- [x] **F0.10** Dependencia `appwrite` + singleton `src/lib/appwrite/`
- [x] **F0.11** `executeApi` / `executeApiSafe` + `VITE_APPWRITE_FUNCTION_API_ID`
- [x] **F0.12** Fix typecheck `AnimatedVisibility` / `NavHost`

**Criterio de cierre F0:** cliente puede invocar la function sin secretos en el bundle; CI web typecheck/tests en verde en `core1`.

---

## A — Solicitud pública + tracking *(siguiente)*

Familiar **sin cuenta**: crea solicitud y consulta estado por código.

### A.1 Alta

- [ ] **A.1.1** Formulario público cableado a `solicitudes.create` (no mock)
- [ ] **A.1.2** Validación de campos alineada al dominio / validator de la API
- [ ] **A.1.3** Pantalla de confirmación con `codigoSeguimiento` + enlace a tracking
- [ ] **A.1.4** Email de tracking (Resend real o stub documentado en logs de `huella-api`)

### A.2 Seguimiento

- [ ] **A.2.1** Vista/ruta de tracking llama `solicitudes.getByCode`
- [ ] **A.2.2** UI solo datos públicos (estado, mensajePublico, `$createdAt` / `$updatedAt`)
- [ ] **A.2.3** Manejo de código inválido y no encontrado (`ApiError` / `executeApiSafe`)

**Criterio de cierre A:** un familiar completa el formulario, recibe código, el documento existe en Appwrite en `pendiente`, y con ese código ve el estado real en tracking. CI web en verde.

---

## B — Auth operadores

Acceso al backoffice con Appwrite Account.

- [ ] **B.1** Login operador (email/password u método acordado en `.policies`)
- [ ] **B.2** Sesión en Web SDK; persistencia y recuperación al recargar
- [ ] **B.3** Guards de rutas admin (anónimo no entra al área privada)
- [ ] **B.4** `ADMIN_USER_IDS` (o labels) configurado en `huella-api` para acciones `auth: admin`
- [ ] **B.5** Logout y estado de sesión visible en UI

**Criterio de cierre B:** operador entra y sale; anónimo no ejecuta `solicitudes.marcarSinVerificar`. CI web en verde.

---

## C — Backoffice de solicitudes

Operador gestiona casos reales creados en **A**. Requiere **B**.

- [ ] **C.1** Listado de solicitudes (API o queries Appwrite con sesión)
- [ ] **C.2** Filtros por `estado`
- [ ] **C.3** Vista detalle: datos + notas internas (solo operador)
- [ ] **C.4** Acción cerrar solicitud (motivo interno obligatorio) vía dominio/API
- [ ] **C.5** Sustituir datos mock del admin por datos reales

**Criterio de cierre C:** operador ve, abre y cierra solicitudes creadas en el flujo A. CI web en verde.

---

## D — KYC Didit (inicio + webhook)

Verificación solo cuando hay familiar/contacto y se inicia negociación. Requiere **C**.

### D.1 Inicio desde backoffice

- [ ] **D.1.1** Acción “Marcar sin verificar / iniciar KYC” → `solicitudes.marcarSinVerificar`
- [ ] **D.1.2** Transición `pendiente` → `sin_verificar` + `diditSessionId`
- [ ] **D.1.3** Fila en `kyc_verifications`
- [ ] **D.1.4** Email con enlace de verificación al familiar
- [ ] **D.1.5** (Opcional) mostrar URL de sesión al operador para reenvío

### D.2 Webhook (fuente de verdad)

- [ ] **D.2.1** URL pública de `huella-webhooks` en consola Didit
- [ ] **D.2.2** `DIDIT_WEBHOOK_SECRET` en la function
- [ ] **D.2.3** Evento `Approved` → solicitud `verificado` + `kycResultado`
- [ ] **D.2.4** Idempotencia por `event_id`
- [ ] **D.2.5** Declined / Expired / intermedios actualizan KYC sin marcar `verificado` desde el front

**Criterio de cierre D:** tracking muestra `sin_verificar` tras la acción admin y `verificado` solo tras webhook Didit. CI api + webhooks + web en verde.

---

## U — UI / UX *(puede paralelizarse al final de A–D)*

- [ ] **U.1** Esquema de colores por temas acorde al propósito de Huella
- [ ] **U.2** Colores alineados + cambio de tema (claro/oscuro o sistema)
- [ ] **U.3** Análisis y aplicación de animaciones / transiciones entre vistas
- [ ] **U.4** Revisión ortográfica, caracteres y concordancia en copy de UI

**Criterio de cierre U:** UI coherente en público y admin sin romper flujos A–D.

---

## Z — Calidad y cierre del ciclo Core 1

- [ ] **Z.1** Tests dominio + functions verdes
- [ ] **Z.2** CI gate (`web` + `huella-api` + `huella-webhooks`) en verde en el PR de cierre a `master`
- [ ] **Z.3** README actualizado (local, env, IDs de functions/site)
- [ ] **Z.4** Recorrido E2E documentado: alta → tracking → login → backoffice → KYC → webhook → `verificado`
- [ ] **Z.5** Ítems abiertos movidos a `core2` si quedan fuera de alcance

**Criterio de cierre Core 1:** esquemas **A + B + C + D** cerrados; PR a `master` con CI en verde.

---

## Orden de trabajo y PRs a `master`

| Orden | Esquema | PR orientativo |
|-------|---------|----------------|
| 1 | **A** | `feat(core1): solicitud pública + tracking reales` |
| 2 | **B** | `feat(core1): auth operadores` |
| 3 | **C** | `feat(core1): backoffice solicitudes` |
| 4 | **D** | `feat(core1): KYC Didit + webhook` |
| 5 | **U** (si aplica) | `feat(core1): UI/UX temas y polish` |
| 6 | **Z** | `chore(core1): cierre ciclo` |

Fixes de soporte (typecheck, tests) permanecen en `core1` sin PR hasta el esquema correspondiente.
