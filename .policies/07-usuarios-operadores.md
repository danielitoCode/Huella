# Política de usuarios, roles, contraseñas y PINs

## Objetivo

Gestionar el equipo del backoffice sin secretos de bootstrap en variables de entorno: la colección **`operadores`** es la fuente de roles, actividad y PIN de cancelación.

## Colección `operadores` (Appwrite)

| Campo | Tipo | Notas |
|-------|------|-------|
| `userId` | varchar | Id de Appwrite Auth |
| `email` | email | |
| `nombre` | text | |
| `rol` | enum `admin` \| `operador` | |
| `activo` | text | `"true"` / `"false"` |
| `cancelPinHash` | varchar(64) | Hash del PIN; nunca el PIN en claro si está personalizado |
| `mustChangePassword` | text (recomendado) | `"true"` tras reset de password |
| `ultimoLoginAt` | datetime | opcional |

## Roles

| Rol | Puede |
|-----|--------|
| **operador** | Trabajar solicitudes; **establecer su propio** PIN y contraseña; ver solo su perfil en Equipo. |
| **admin** | Todo lo de operador + **crear cuentas**, cambiar **roles**, **activar/desactivar**, **resetear** PIN y password de cualquier miembro; ver estado de PIN en auditoría. |

No hay lista `ADMIN_USER_IDS` en env. Sin fila activa en `operadores`, no hay acceso al backoffice API.

## Contraseñas de acceso (Appwrite Auth)

| Acción | Quién | Comportamiento |
|--------|--------|----------------|
| Crear usuario | Admin | Password inicial fija **`12345678`** + `mustChangePassword = true`. El admin **no elige** la password definitiva. |
| Reset password | Admin | Vuelve a **`12345678`** + `mustChangePassword = true`. |
| Cambiar password | **Titular** | `operadores.changeOwnPassword`. Obligatoria en SecurityGate si hubo reset. No puede reutilizar `12345678`. |

## PIN de cancelación (plataforma)

Usado solo para confirmar **cancelación de solicitudes** (`solicitudes.cancelar`).

| Acción | Quién | Comportamiento |
|--------|--------|----------------|
| Reset PIN | **Solo admin** | PIN → **`0000`** (se guarda el hash). Auditoría admin muestra `0000` / estado *reseteado*. |
| Establecer PIN | **Solo el titular** | Desde `0000` (tras reset) o cambiando con PIN actual. El nuevo PIN **no puede ser `0000`**. |
| Cancelar solicitud | Operador/admin con PIN **personal configurado** | Si el PIN sigue en `0000`, error `PIN_RESET_REQUIRED`. **Sin PIN global** en env. |

### Auditoría de PIN (vista admin)

- PIN reseteado: se muestra el valor de fábrica **`0000`**.
- PIN personalizado: se muestra solo **«configurado»** (no el valor en claro).

### Hash

- `cancelPinHash = SHA-256(PIN_SALT + ":" + pin)`.
- `PIN_SALT` en env de la function (no es un PIN de usuario).

## Flujo SecurityGate (UI)

Tras login exitoso, si `mustChangePassword` **o** `pinNeedsReset`:

1. Pantalla obligatoria de actualización.
2. Primero password (si aplica), luego PIN (si aplica).
3. Hasta completar, no se navega al resto del backoffice.

## Acciones API (`huella-api`)

| Action | Rol |
|--------|-----|
| `operadores.me` | operador/admin |
| `operadores.list` | admin |
| `operadores.create` | admin |
| `operadores.setRole` | admin |
| `operadores.setActive` | admin |
| `operadores.resetCancelPin` | admin (→ 0000) |
| `operadores.setOwnCancelPin` | titular |
| `operadores.resetPassword` | admin (→ 12345678) |
| `operadores.changeOwnPassword` | titular |

## Primer administrador

1. Crear usuario en Appwrite Auth.
2. Crear documento en `operadores` con `rol: admin`, `activo: "true"`.
3. Opcional: `cancelPinHash` vacío o hash de `0000`; `mustChangePassword: "true"` si la password es temporal.
4. Entrar al panel y completar SecurityGate.

## Prohibiciones

- El admin **no** asigna un PIN arbitrario a un operador (solo reset a `0000`).
- El admin **no** define la password definitiva de un usuario (solo reset a `12345678`).
- No almacenar PIN ni password en variables de entorno por usuario.
- No exponer hashes ni secretos al frontend más allá de flags (`pinNeedsReset`, `mustChangePassword`, `pinEstado`).
