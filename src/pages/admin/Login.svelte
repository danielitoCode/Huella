<script lang="ts">
  import { getAccount, getPublicConfig } from '../../lib/appwrite/client';
  import { sessionUser } from '../../lib/stores/session';
  import { irAAdmin } from '../../lib/stores/router';
  import { addDevLog } from '../../lib/stores/devLogger';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let cargando = $state(false);

  async function login(e: Event) {
    e.preventDefault();
    error = '';
    cargando = true;

    const config = getPublicConfig();

    addDevLog({
      type: 'info',
      title: '🔐 [AUTH] Inicio de Sesión Iniciado',
      payload: {
        email: email.trim(),
        endpoint: config.endpoint,
        projectId: config.projectId,
      },
    });

    try {
      const account = getAccount();

      addDevLog({
        type: 'info',
        title: '🔐 [AUTH] Invocando createEmailPasswordSession...',
        action: 'account.createEmailPasswordSession',
      });

      await account.createEmailPasswordSession(email.trim(), password);

      addDevLog({
        type: 'info',
        title: '🔐 [AUTH] Sesión creada. Obteniendo datos de cuenta (account.get)...',
        action: 'account.get',
      });

      const user = await account.get();

      addDevLog({
        type: 'info',
        title: '✅ [AUTH_SUCCESS] Usuario autenticado correctamente',
        response: { userId: user.$id, email: user.email, name: user.name },
      });

      sessionUser.set({ $id: user.$id, email: user.email, name: user.name });
      irAAdmin('dashboard');
    } catch (err: unknown) {
      console.error('[Appwrite Login Error]', err);

      const errObj = err as Record<string, unknown>;
      const rawMessage = err instanceof Error ? err.message : String(err);
      const code = errObj?.code ? String(errObj.code) : '';
      const type = errObj?.type ? String(errObj.type) : '';

      addDevLog({
        type: 'error',
        title: `❌ [AUTH_FAIL] Error en inicio de sesión [${code || 'ERR'}]: ${rawMessage}`,
        reason: `${rawMessage} ${type ? `(Tipo: ${type})` : ''}`,
        payload: { email: email.trim(), endpoint: config.endpoint, projectId: config.projectId },
        error: err,
        stack: err instanceof Error ? err.stack : undefined,
      });

      if (rawMessage.includes('<REGION>') || rawMessage.includes('<PROJECT_ID>')) {
        error = 'Configuración de Appwrite incompleta: Modifica .env con tu Endpoint y Project ID reales.';
      } else if (rawMessage.toLowerCase().includes('invalid credentials') || code === '401' || type.includes('invalid_credentials')) {
        error = 'Correo o contraseña incorrectos en Appwrite Auth.';
      } else if (code === '409' || type.includes('session_already_exists')) {
        error = 'Ya existe una sesión activa en este navegador. Redirigiendo...';
        setTimeout(() => irAAdmin('dashboard'), 1500);
      } else if (rawMessage.toLowerCase().includes('fetch') || rawMessage.toLowerCase().includes('network')) {
        error = `Error de red al conectar con Appwrite (${config.endpoint}). Revisa tu conexión o CORS.`;
      } else {
        // En desarrollo, mostrar el mensaje real exacto de Appwrite
        error = import.meta.env.DEV
          ? `Error de Appwrite [${code || 'DEV'}]: ${rawMessage}`
          : 'Error al iniciar sesión. Inténtalo de nuevo.';
      }
    } finally {
      cargando = false;
    }
  }
</script>

<section class="login-wrap">
  <div class="login-card glass-panel animate-fade-in">
    <div class="login-header">
      <div class="shield-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <span class="eyebrow">Acceso Restringido</span>
      <h1 class="serif-title text-gradient-gold">Panel de Operadores</h1>
      <p class="subtitle">Módulo administrativo para atención de solicitudes e investigación documental.</p>
    </div>

    <form onsubmit={login} class="form" id="login-form">
      {#if error}
        <div class="error-banner" role="alert">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <span>{error}</span>
        </div>
      {/if}

      <label for="login-email">
        Correo Electrónico
        <input
          id="login-email"
          type="email"
          bind:value={email}
          required
          autocomplete="email"
          disabled={cargando}
          placeholder="operador@huella.org"
        />
      </label>

      <label for="login-password">
        Contraseña
        <input
          id="login-password"
          type="password"
          bind:value={password}
          required
          autocomplete="current-password"
          disabled={cargando}
        />
      </label>

      <button type="submit" class="btn btn-gold btn-login" disabled={cargando}>
        {cargando ? 'Iniciando Sesión...' : 'Ingresar al Dashboard'}
      </button>
    </form>
  </div>
</section>

<style>
  .login-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 75vh;
    width: 100%;
    box-sizing: border-box;
    padding: 3rem 1.5rem;
    background: radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.1) 0%, var(--color-obsidian-deep) 70%);
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    background: var(--color-obsidian-navy);
    color: #ffffff;
    border: 1px solid var(--color-border-gold);
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .shield-badge {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(212, 175, 55, 0.15);
    border: 1px solid var(--gold);
    color: var(--gold);
    display: grid;
    place-items: center;
    margin: 0 auto 1rem;
  }

  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.35rem;
  }

  .login-header h1 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #a4b4c0;
    font-size: 0.88rem;
    margin: 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--color-stone);
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.85rem 1rem;
    border-radius: var(--radius);
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert);
    font-size: 0.88rem;
  }

  .btn-login {
    margin-top: 0.5rem;
    width: 100%;
  }
</style>
