# Function: `auth/operator-login`

## Propósito

Autenticar a un operador del backoffice y emitir sesión/token.

## Trigger

- HTTP `POST` (rate limited).
- Body: `{ email, password }`

## Flujo (fase 1)

1. Buscar operador por email.
2. Verificar hash de contraseña.
3. Comprobar bloqueo por intentos.
4. Emitir cookie httpOnly o JWT de acceso (+ refresh si aplica).
5. Registrar login en auditoría.

## Output

- Sesión establecida + datos mínimos del operador (`id`, `nombre`, `rol`).

## Errores

- `INVALID_CREDENTIALS` (mensaje genérico)
- `RATE_LIMITED` / `LOCKED`

## Políticas relacionadas

- `.policies/02-autenticacion.md`
