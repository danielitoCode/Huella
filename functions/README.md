# Functions serverless — Huella

Espacio de **diseño e implementación** de funciones backend.
Aquí viven las operaciones que no deben ejecutarse en el navegador: secretos, Didit, envío de correos, escritura privilegiada, webhooks, etc.

## Principios

1. Una function = un caso de uso claro (crear sesión KYC, enviar email de tracking, recibir webhook, …).
2. Sin secretos en el repo: solo variables de entorno.
3. Diseño primero en `.md`; implementación en TypeScript (o el runtime que se elija) cuando el contrato esté estable.
4. Independientes del framework del frontend (Vite/Svelte): se despliegan en Vercel, Cloudflare Workers, Netlify, Supabase Edge, AWS Lambda, etc.

## Mapa de functions previstas

```
functions/
├── README.md                 ← este archivo
├── _shared/                  ← tipos, helpers, validación de env (diseño)
│   └── contracts.md
├── kyc/
│   ├── create-session.md     ← crear sesión Didit y vincular a solicitud
│   └── webhook.md            ← recibir resultado Didit
├── email/
│   ├── send-tracking.md      ← correo con código + enlace al crear solicitud
│   ├── send-status-update.md ← cambio de estado al familiar
│   └── send-kyc-link.md      ← enlace de verificación Didit
├── solicitudes/
│   ├── create.md             ← alta desde web pública (genera código)
│   ├── get-by-code.md        ← tracking público por código
│   └── admin-update.md       ← cambio de estado / notas (backoffice, auth)
└── auth/
    └── operator-login.md     ← login de operadores (fase 1)
```

## Variables de entorno (referencia)

| Variable | Uso |
|----------|-----|
| `DIDIT_API_KEY` | Clave API Didit |
| `DIDIT_WORKFLOW_ID` | Workflow de verificación configurado en consola Didit |
| `DIDIT_WEBHOOK_SECRET` | Validación de firma del webhook |
| `EMAIL_PROVIDER_*` | Credenciales del proveedor de correo (Resend, SES, …) |
| `DATABASE_URL` / equivalente | Persistencia |
| `JWT_SECRET` / `SESSION_SECRET` | Tokens de tracking y sesión de operadores |
| `PUBLIC_APP_URL` | Base URL para construir enlaces de seguimiento y KYC |

## Orden de implementación sugerido

1. Contratos compartidos (`_shared/contracts.md`)
2. `solicitudes/create` + `email/send-tracking`
3. `solicitudes/get-by-code`
4. `auth/operator-login` + `solicitudes/admin-update`
5. `kyc/create-session` + `kyc/webhook` + `email/send-kyc-link`
6. Resto de emails de estado

Los archivos `.md` de cada function describen: trigger, input, output, efectos, errores y dependencias de políticas.
