# Políticas de dominio — Huella

Este directorio define las **reglas de negocio y de seguridad** de la plataforma.
Son la fuente de verdad antes de escribir código de frontend o de functions.

Cualquier cambio de comportamiento (quién puede qué, cuándo se acepta o se descarta una petición, cómo se autentica un operador, cuándo se exige KYC) debe reflejarse primero aquí.

## Documentos

| Archivo | Alcance |
|---------|---------|
| [01-peticiones-usuario.md](./01-peticiones-usuario.md) | Ciclo de vida de una solicitud enviada por un familiar |
| [02-autenticacion.md](./02-autenticacion.md) | Autenticación de operadores (backoffice) y acceso de familiares (tracking) |
| [03-administracion-peticiones.md](./03-administracion-peticiones.md) | Aceptación, rechazo, cambio de estado y descarte desde el backoffice |
| [04-kyc-didit.md](./04-kyc-didit.md) | Verificación de identidad (KYC) con Didit |

## Principios transversales

1. **Mínima fricción para el familiar** — no se exige cuenta ni login para enviar o consultar una solicitud.
2. **Confidencialidad** — datos sensibles solo visibles para operadores autenticados y para el titular mediante código de seguimiento.
3. **Trazabilidad** — todo cambio de estado queda registrado (quién, cuándo, por qué).
4. **KYC selectivo** — la verificación de identidad no bloquea el envío inicial; se solicita cuando el caso lo requiere.
5. **Separación de zonas** — la web pública y el backoffice comparten dominio, pero nunca comparten sesión ni privilegios.
