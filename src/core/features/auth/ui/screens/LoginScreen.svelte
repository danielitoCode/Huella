<!--
  BLOQUE: Pantalla de login de operadores (feature auth / UI).
  Propósito: formulario de acceso al backoffice; delega en authStore.login (Supabase).
  Reemplaza el flujo Appwrite createEmailPasswordSession del Login.svelte legacy.

  Rutas: screens → ui → auth → features → core → src  ⇒  ../../../../../lib/...
-->
<script lang="ts">
  import { login as authLogin } from '../store/authStore';
  import { irAAdmin } from '../../../../../lib/stores/router';
  import { addDevLog } from '../../../../../lib/stores/devLogger';
  import { getSupabaseConfig } from '../../../../../lib/supabase/config';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let cargando = $state(false);

  async function onSubmit(e: Event) {
    e.preventDefault();
    error = '';
    cargando = true;

    let supabaseUrl = '';
    try {
      supabaseUrl = getSupabaseConfig().url;
    } catch {
      error = 'Falta configuración Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).';
      cargando = false;
      return;
    }

    addDevLog({
      type: 'info',
      title: '🔐 [AUTH] Login operador (Supabase)',
      payload: { email: email.trim(), supabaseUrl },
    });

    try {
      await authLogin(email.trim(), password);
      addDevLog({
        type: 'info',
        title: '✅ [AUTH_SUCCESS] Sesión Supabase + perfil operadores',
      });
      irAAdmin('dashboard');
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : String(err);
      addDevLog({
        type: 'error',
        title: `❌ [AUTH_FAIL] ${rawMessage}`,
        error: err,
        payload: { email: email.trim(), supabaseUrl },
      });
      error = rawMessage;
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <span class="eyebrow">Acceso Restringido</span>
      <h1 class="serif-title text-gradient-gold">Panel de Operadores</h1>
      <p class="subtitle">Módulo administrativo para atención de solicitudes e investigación documental.</p>
    </div>

    <form onsubmit={onSubmit} class="form" id="login-form">
      {#if error}
        <div class="error-banner" role="alert">
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
    background: radial-gradient(
      circle at 50% 30%,
      rgba(212, 175, 55, 0.1) 0%,
      var(--color-obsidian-deep) 70%
    );
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
