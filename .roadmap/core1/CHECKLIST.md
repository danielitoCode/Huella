# Core 1 — Checklist de objetivos

**Rama:** `core1` → merges a `master` solo por PR  
**Meta del ciclo:** flujo vertical usable: alta pública → tracking → login operador → listado/detalle → KYC Didit → webhook → emails.

**Convención:** marcar `[x]` solo cuando el criterio de aceptación del objetivo esté cumplido y el CI en verde en el PR.

---

## 0. Gobernanza del ciclo

- [x] **0.1** Rama `core1` creada desde `master`
- [x] **0.2** Directorio `.roadmap/core1` y este checklist publicados
- [x] **0.3** Primer PR de este archivo mergeado a `master` (deja el roadmap visible en la rama principal)

---

## 1. Fundación Appwrite (infra en Console)

*Sin esto el código de functions y el front no tienen backend real.*

- [x] **1.1** Proyecto Appwrite + plataforma Web (`localhost` + dominio futuro)
- [x] **1.2** Database `huella` y tabla/colección `solicitudes` (schema acordado: varchar/enum/text, sin fechas propias; índices `codigo`, `email`, `estado`, `diditSessionId`)
- [x] **1.3** Colección `kyc_verifications` + índices
- [x] **1.4** Colección `webhook_events` (`event_id` unique) + índices
- [x] **1.5** Colección `operadores` (o labels/team Appwrite Auth) lista para backoffice
- [x] **1.6** API Key de servidor con scopes mínimos + variables en `.env` local (desde `.env.example`)
- [ ] **1.7** Functions desplegadas: `huella-api` y `huella-webhooks` (entrypoint, env, execute permissions)

**Criterio de cierre §1:** un `POST` de prueba a `huella-api` con `action: "solicitudes.getByCode"` responde JSON estructurado (aunque sea NOT_FOUND).

---

## 2. Cliente Appwrite en el frontend

- [ ] **2.1** Dependencia `appwrite` (Web SDK) en el proyecto Vite
- [ ] **2.2** Cliente singleton (`src/lib/appwrite/client.ts`) con `VITE_APPWRITE_*`
- [ ] **2.3** Helper `executeApi(action, payload)` → `functions.createExecution(huella-api)`
- [ ] **2.4** IDs de functions en env (`VITE_APPWRITE_FUNCTION_API_ID`, opcional webhooks solo server)

**Criterio de cierre §2:** desde el navegador se puede invocar la function y ver respuesta success/error sin secretos en el client bundle.

---

## 3. Flujo público — crear solicitud

- [ ] **3.1** Formulario de alta cableado a `solicitudes.create` (no mock)
- [ ] **3.2** Validación de campos alineada al dominio (nombreFamiliar, email, nombrePersona, relacion, descripcion)
- [ ] **3.3** Pantalla de confirmación con **código de seguimiento** y enlace al tracking
- [ ] **3.4** Email de tracking enviado (Resend o stub documentado en logs de la function)

**Criterio de cierre §3:** un familiar completa el formulario y recibe código; el documento existe en Appwrite en estado `pendiente`.

---

## 4. Flujo público — tracking

- [ ] **4.1** Ruta/vista de seguimiento por código llama `solicitudes.getByCode`
- [ ] **4.2** UI muestra solo datos públicos (estado, mensajePublico, fechas `$createdAt`/`$updatedAt`)
- [ ] **4.3** Manejo de código inválido / no encontrado

**Criterio de cierre §4:** con el código de §3 se consulta el estado real desde Appwrite.

---

## 5. Auth operadores (backoffice)

- [ ] **5.1** Login operador con Appwrite Account (email/password o método elegido en políticas)
- [ ] **5.2** Sesión en el client SDK; guards de rutas admin
- [ ] **5.3** `ADMIN_USER_IDS` (o labels) configurado para acciones `auth: admin` en `huella-api`
- [ ] **5.4** Logout y estado de sesión en la UI

**Criterio de cierre §5:** un operador entra al área admin; un anónimo no puede ejecutar `solicitudes.marcarSinVerificar`.

---

## 6. Backoffice — listado y detalle

- [ ] **6.1** Acción API o queries Appwrite: listar solicitudes (filtros por `estado`)
- [ ] **6.2** Vista listado admin (reemplazar datos mock)
- [ ] **6.3** Vista detalle: datos de la solicitud + notas internas (solo operador)
- [ ] **6.4** Acción cerrar solicitud (motivo interno obligatorio) vía dominio/API

**Criterio de cierre §6:** el operador ve y abre solicitudes reales creadas en §3.

---

## 7. KYC Didit (inicio desde backoffice)

- [ ] **7.1** Botón/flujo “Marcar sin verificar / iniciar KYC” → `solicitudes.marcarSinVerificar`
- [ ] **7.2** Transición `pendiente` → `sin_verificar` + `diditSessionId` persistido
- [ ] **7.3** Fila en `kyc_verifications` creada
- [ ] **7.4** Email con enlace de verificación al familiar
- [ ] **7.5** (Opcional UI) mostrar URL de sesión al operador para reenvío

**Criterio de cierre §7:** tras la acción, tracking muestra estado `sin_verificar` y existe sesión Didit real (o error Didit controlado si faltan keys en staging).

---

## 8. Webhook Didit (fuente de verdad)

- [ ] **8.1** URL pública de `huella-webhooks` configurada en consola Didit
- [ ] **8.2** `DIDIT_WEBHOOK_SECRET` en la function
- [ ] **8.3** Evento `Approved` → solicitud `verificado` + `kycResultado`
- [ ] **8.4** Idempotencia: reenvío del mismo `event_id` no duplica efectos
- [ ] **8.5** Estados intermedios / Declined / Expired actualizan `kyc_verifications` sin marcar verificado por el front

**Criterio de cierre §8:** un webhook de prueba (o sesión real) deja la solicitud en `verificado` solo por el webhook.

---

## 9. Calidad y cierre del ciclo Core 1

- [ ] **9.1** Tests de dominio siguen verdes; añadir tests de adaptadores críticos si aplica
- [ ] **9.2** CI en PR a master en verde
- [ ] **9.3** README actualizado (cómo correr local + variables + IDs de functions)
- [ ] **9.4** Checklist Core 1 revisado; objetivos abiertos movidos a `core2` si quedan fuera de alcance

**Criterio de cierre Core 1:** recorrido E2E manual documentado: alta → email/código → tracking → login admin → KYC → webhook → tracking `verificado`.

---

## Orden de PRs sugerido (desde `core1` → `master`)

| PR | Objetivos | Título orientativo |
|----|-----------|--------------------|
| A | 0.3 | `docs: roadmap core1 checklist` |
| B | 1.x | `chore: appwrite schema + functions deploy notes` (si hay archivos) |
| C | 2.x–4.x | `feat: alta y tracking reales vía huella-api` |
| D | 5.x–6.x | `feat: auth operadores + backoffice real` |
| E | 7.x–8.x | `feat: KYC Didit + webhook` |
| F | 9.x | `chore: cierre core1` |

Se pueden agrupar o partir según tamaño del diff; la regla es **un PR = valor verificable**.
