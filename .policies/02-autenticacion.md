# Política de autenticación

## Familiares (zona pública)

- Sin registro ni login.
- Acceso solo por **código de seguimiento**.
- No comparten sesión con el backoffice.

## Operadores y administradores (backoffice)

### Fuente de verdad de acceso

- Autenticación: **Appwrite Account** (email + contraseña).
- Autorización: documento en colección **`operadores`** vinculado por `userId`.
- Debe existir fila con `activo = "true"` y `rol` ∈ {`operador`, `admin`}.
- **No** se usa `ADMIN_USER_IDS` en variables de entorno.
- **No** hay PIN global de cancelación en env; el PIN es **por usuario**.

### Roles

| Rol | Capacidades |
|-----|-------------|
| `operador` | Gestionar solicitudes (estados, KYC, notas). Establecer su propio PIN y password. |
| `admin` | Todo lo de operador + gestión de equipo (crear cuentas, roles, activar/desactivar, **reset** de PIN/password). |

### Sesión

- Login en `/admin/login`.
- Si hay sesión activa y se entra desde “Acceso operadores”, ir al dashboard según rol.
- Sin sesión: no mostrar navegación interna del backoffice; solo enlace al sitio público.
- Tras login, si `mustChangePassword` o `pinNeedsReset`, se muestra **SecurityGate** y se bloquea el resto del panel hasta completar el cambio.

### Secrets (solo functions / Appwrite)

- `DIDIT_*`, `RESEND_*` / email, `APPWRITE_API_KEY`, `PIN_SALT`.
- Nunca en frontend ni en git.
