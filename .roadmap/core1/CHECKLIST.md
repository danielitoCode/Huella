# Core 1 — Checklist de objetivos

**Rama:** `core1` → merges a `master` solo por PR  
**Meta del ciclo:** flujo vertical usable: alta pública → tracking → login operador → listado/detalle → KYC Didit → webhook → emails.

**Convención:** marcar `[x]` solo cuando el criterio de aceptación del objetivo esté cumplido y el CI en verde en el PR.

---

## 0. Gobernanza del ciclo

- [x] **0.1** Rama `core1` creada desde `master`
- [x] **0.2** Directorio `.roadmap/core1` y este checklist publicados
- [x] **0.3** Primer PR de este archivo mergeado a `master`

---

## 1. Fundación Appwrite (infra en Console)

- [x] **1.1** Proyecto Appwrite + plataforma Web
- [x] **1.2** Database `huella` + `solicitudes`
- [x] **1.3** Colección `kyc_verifications` + índices
- [x] **1.4** Colección `webhook_events` + índices
- [x] **1.5** Colección `operadores`
- [x] **1.5b** Colección `auditoria`
- [x] **1.6** API Key + `.env` local
- [ ] **1.6b** Marco de pruebas unitarias + CI independientes (web / api / webhooks) — **en curso en core1**
- [ ] **1.7** Functions desplegadas: `huella-api` y `huella-webhooks` (solo tras 1.6b verde)

**Criterio de cierre §1:** tests de functions en verde + `POST` de prueba a `huella-api` responde JSON estructurado.

**Estado:** schema OK. Pruebas/CI en rama `core1`. Deploy (1.7) después de CI verde.

### Guía rápida deploy 1.7

| Function | Root | Entrypoint |
|----------|------|------------|
| `huella-api` | `functions/huella-api` | `src/index.js` |
| `huella-webhooks` | `functions/huella-webhooks` | `src/index.js` |

**Prerequisito:** `cd functions/huella-api && npm test` y `cd functions/huella-webhooks && npm test` en verde.

---

## 2. Cliente Appwrite en el frontend

- [ ] **2.1** Dependencia `appwrite` (Web SDK)
- [ ] **2.2** Cliente singleton `src/lib/appwrite/client.ts`
- [ ] **2.3** Helper `executeApi(action, payload)`
- [ ] **2.4** IDs de functions en env

---

## 3. Flujo público — crear solicitud

- [ ] **3.1** Formulario → `solicitudes.create`
- [ ] **3.2** Validación dominio
- [ ] **3.3** Confirmación con código
- [ ] **3.4** Email tracking

---

## 4. Flujo público — tracking

- [ ] **4.1** Vista → `solicitudes.getByCode`
- [ ] **4.2** Solo datos públicos
- [ ] **4.3** Código inválido / no encontrado

---

## 5. Auth operadores

- [ ] **5.1** Login Appwrite Account
- [ ] **5.2** Guards admin
- [ ] **5.3** `ADMIN_USER_IDS`
- [ ] **5.4** Logout

---

## 6. Backoffice — listado y detalle

- [ ] **6.1** Listar solicitudes
- [ ] **6.2** Vista listado real
- [ ] **6.3** Detalle + notas
- [ ] **6.4** Cerrar solicitud

---

## 7. KYC Didit

- [ ] **7.1** `marcarSinVerificar`
- [ ] **7.2** Estado `sin_verificar` + sessionId
- [ ] **7.3** Fila `kyc_verifications`
- [ ] **7.4** Email KYC
- [ ] **7.5** URL al operador (opcional)

---

## 8. Webhook Didit

- [ ] **8.1** URL en Didit
- [ ] **8.2** `DIDIT_WEBHOOK_SECRET`
- [ ] **8.3** Approved → `verificado`
- [ ] **8.4** Idempotencia `event_id`
- [ ] **8.5** Estados intermedios sin marcar verificado desde el front

---

## 9. Calidad y cierre Core 1

- [ ] **9.1** Tests dominio + functions verdes
- [ ] **9.2** CI gate (web + api + webhooks) en verde en PR a master
- [ ] **9.3** README actualizado
- [ ] **9.4** Objetivos abiertos → core2 si aplica
