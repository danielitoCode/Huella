# Core 1 — Checklist por esquemas funcionales

**Rama:** `core1` · PR a `master` solo al cerrar un esquema completo.

| ID | Esquema | Estado |
|----|---------|--------|
| **F0** | Fundación | Cerrado |
| **U0** | Base visual DESIGN.md | Parcial (memorial aplicado) |
| **A** | Solicitud pública + tracking | **Implementado en código — validar en entorno real** |
| **B** | Auth operadores | Pendiente |
| **C** | Backoffice | Pendiente |
| **D** | KYC Didit | Pendiente |
| **U** | UI polish | Pendiente |
| **Z** | Cierre | Pendiente |

---

## A — Solicitud pública + tracking

### A.1 Alta

- [x] **A.1.1** Formulario → `solicitudes.create` vía `executeApi`
- [x] **A.1.2** Validación cliente + errores API (`ApiError`)
- [x] **A.1.3** Confirmación con `codigoSeguimiento` + enlace a tracking
- [x] **A.1.4** Email tracking disparado en `huella-api` (Resend o stub en logs)

### A.2 Seguimiento

- [x] **A.2.1** Ruta `/seguimiento` y `/seguimiento/:codigo` → `solicitudes.getByCode`
- [x] **A.2.2** Solo datos públicos (estado, mensaje, fechas)
- [x] **A.2.3** Código inválido / no encontrado

### A.3 Navegación

- [x] Historial HTML5 (`pushState` / `popstate`) para SPA + fallback `index.html` en Appwrite Sites

**Criterio de cierre A (manual en staging):**

1. Completar formulario con `VITE_APPWRITE_*` correctos.
2. Documento en Appwrite estado `pendiente`.
3. Código visible + consulta en `/seguimiento/HUE-…`.
4. CI web en verde.

Marcar el esquema **cerrado** solo tras esa validación en el entorno desplegado.
