# Política de autenticación

## Objetivo

Separar claramente la identidad del **operador/administrador** (backoffice) de la del **familiar** (solo tracking por código).

## 1. Familiares (web pública)

- **No hay login ni registro de cuenta.**
- Acceso a su caso únicamente mediante:
  - Código de seguimiento, o
  - Enlace firmado recibido por correo (JWT o token opaco con expiración).
- El token de enlace:
  - Debe ser de un solo uso o de corta duración (ej. 7–30 días, renovable pidiendo un nuevo enlace al email registrado).
  - No otorga privilegios de escritura salvo los explícitamente permitidos (ej. adjuntar un documento si el operador lo pide).
- Rate limiting estricto en el endpoint de consulta por código.

## 2. Operadores / administradores (backoffice)

### Requisitos

- Autenticación obligatoria antes de cualquier acción de gestión.
- Roles mínimos:
  - `operador`: ver y actualizar solicitudes asignadas o de la cola general.
  - `admin`: además, gestionar usuarios operadores, ver auditoría y configuración.

### Mecanismo recomendado (fase 1)

- Email + contraseña con hash seguro (Argon2id o bcrypt cost alto).
- Sesión mediante cookie httpOnly + Secure + SameSite, o token JWT de corta duración + refresh.
- Bloqueo tras N intentos fallidos.
- Recuperación de contraseña solo por enlace de un solo uso al email del operador.

### Mecanismo recomendado (fase 2+)

- MFA (TOTP o email OTP) obligatorio para `admin` y opcional/forzado para `operador`.
- Posible SSO / OAuth si el equipo crece.

### Qué no hacer

- No reutilizar el mismo sistema de sesión entre la web pública y el backoffice.
- No exponer endpoints de administración sin autenticación.
- No almacenar contraseñas en texto plano ni en logs.

## 3. Secrets y API keys

- Claves de Didit, proveedores de email, base de datos, etc. **solo en variables de entorno** del entorno serverless / backend.
- Nunca en el frontend ni en el repositorio.
- Rotación documentada y acceso restringido.

## 4. Auditoría de acceso

- Registrar: login exitoso/fallido, IP, user-agent, timestamp.
- Registrar acciones sensibles del backoffice (cambio de estado, descarte, visualización de datos KYC).
