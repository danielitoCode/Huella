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
| **U0** | Base visual DESIGN.md + tema sistema | **En curso / parcial** |
| **A** | Solicitud pública + tracking | **Siguiente funcional** |
| **B** | Auth operadores | Pendiente |
| **C** | Backoffice de solicitudes | Pendiente (después de B) |
| **D** | KYC Didit (inicio + webhook) | Pendiente (después de C) |
| **U** | UI/UX polish restante | Pendiente |
| **Z** | Calidad y cierre Core 1 | Pendiente |

---

## F0 — Fundación *(cerrado)*

- [x] **F0.1–F0.12** Infra Appwrite, functions, Site, CI, cliente `executeApi`, fix NavHost

---

## U0 — Base visual (DESIGN.md) *(parcial)*

Antes de esquemas funcionales de negocio, la identidad visual mínima del MVP.

- [x] **U0.1** Tokens de color marca (azul profundo, acero, verde esperanza, dorado, gris, blanco)
- [x] **U0.2** Tema **claro/oscuro** vía `prefers-color-scheme` (sin toggle manual aún)
- [x] **U0.3** Tipografía: Inter (UI) + Cormorant Garamond (titulares / marca)
- [x] **U0.4** Header institucional, footer, landing alineada a voz DESIGN.md
- [x] **U0.5** Utilidades globales: `.btn-*`, `.card`, formularios, badges, `prefers-reduced-motion`
- [ ] **U0.6** Revisión visual de todas las vistas admin/solicitud con los mismos tokens (al cablear A–C)
- [ ] **U** resto (animaciones entre vistas, ortografía exhaustiva) — ver esquema U

**Criterio parcial U0:** la app ya no usa la paleta genérica Vite/púrpura; respeta marca y el modo del SO.

---

## A — Solicitud pública + tracking *(siguiente)*

### A.1 Alta

- [ ] **A.1.1** Formulario público → `solicitudes.create`
- [ ] **A.1.2** Validación dominio / API
- [ ] **A.1.3** Confirmación con `codigoSeguimiento` + enlace tracking
- [ ] **A.1.4** Email tracking (Resend o stub en logs)

### A.2 Seguimiento

- [ ] **A.2.1** Tracking → `solicitudes.getByCode`
- [ ] **A.2.2** Solo datos públicos
- [ ] **A.2.3** Código inválido / no encontrado

**Criterio de cierre A:** alta real + tracking real; UI con tokens U0.

---

## B — Auth operadores

- [ ] **B.1** Login Appwrite Account
- [ ] **B.2** Sesión persistente
- [ ] **B.3** Guards admin
- [ ] **B.4** `ADMIN_USER_IDS` en `huella-api`
- [ ] **B.5** Logout

---

## C — Backoffice de solicitudes

- [ ] **C.1** Listado real
- [ ] **C.2** Filtros por estado
- [ ] **C.3** Detalle + notas
- [ ] **C.4** Cerrar solicitud
- [ ] **C.5** Sin mocks

---

## D — KYC Didit

- [ ] **D.1.*** Inicio desde backoffice (`marcarSinVerificar`, email, kyc row)
- [ ] **D.2.*** Webhook fuente de verdad + idempotencia

---

## U — UI / UX restante

- [ ] **U.1** Toggle manual tema (opcional; sistema ya cubierto en U0.2)
- [ ] **U.2** Animaciones / transiciones 150–300ms entre vistas
- [ ] **U.3** Revisión ortográfica y tono en todo el copy
- [ ] **U.4** Componentes reutilizables listados en DESIGN.md según necesidad de A–D

---

## Z — Cierre Core 1

- [ ] **Z.1** Tests + CI gate en PR a `master`
- [ ] **Z.2** README actualizado
- [ ] **Z.3** E2E documentado
- [ ] **Z.4** Sobrantes → core2
