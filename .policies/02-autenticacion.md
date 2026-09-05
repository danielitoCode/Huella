# Política de autenticación

## Familiares

- Sin registro ni login.
- Acceso solo por código de seguimiento o enlace firmado (caducidad / renovación por email).
- Rate limit en consulta por código.

## Operadores (backoffice)

- Login obligatorio (email + contraseña en fase 1; MFA en fase 2).
- Roles: `operador`, `admin`.
- Sesión separada de cualquier token de tracking público.
- Auditoría de logins y acciones sensibles.

## Secrets

- `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET`, credenciales de email y DB solo en entorno serverless.
- Nunca en frontend ni en git.
