<script lang="ts">
  import { sessionUser, loadSession } from '../../lib/stores/session';
  import { executeApi, ApiError } from '../../lib/appwrite';

  let passwordActual = $state('12345678');
  let passwordNueva = $state('');
  let passwordConfirm = $state('');
  let pinActual = $state('0000');
  let pinNuevo = $state('');
  let pinConfirm = $state('');
  let errorMsg = $state('');
  let busy = $state(false);

  const needPassword = $derived(Boolean($sessionUser?.mustChangePassword));
  const needPin = $derived(Boolean($sessionUser?.pinNeedsReset));

  async function submitPassword(e: Event) {
    e.preventDefault();
    errorMsg = '';
    if (passwordNueva.length < 8) {
      errorMsg = 'La nueva contraseña debe tener al menos 8 caracteres';
      return;
    }
    if (passwordNueva === '12345678') {
      errorMsg = 'No uses la contraseña temporal 12345678';
      return;
    }
    if (passwordNueva !== passwordConfirm) {
      errorMsg = 'Las contraseñas no coinciden';
      return;
    }
    busy = true;
    try {
      await executeApi('operadores.changeOwnPassword', {
        passwordActual,
        passwordNueva,
      });
      await loadSession();
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'No se pudo cambiar la contraseña';
    } finally {
      busy = false;
    }
  }

  async function submitPin(e: Event) {
    e.preventDefault();
    errorMsg = '';
    if (!/^\d{4}$/.test(pinNuevo) || pinNuevo === '0000') {
      errorMsg = 'El nuevo PIN debe ser 4 dígitos y distinto de 0000';
      return;
    }
    if (pinNuevo !== pinConfirm) {
      errorMsg = 'Los PIN no coinciden';
      return;
    }
    busy = true;
    try {
      await executeApi('operadores.setOwnCancelPin', {
        pinActual,
        pin: pinNuevo,
      });
      await loadSession();
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'No se pudo guardar el PIN';
    } finally {
      busy = false;
    }
  }
</script>

<div class="gate">
  <div class="card panel">
    <span class="eyebrow">Seguridad de cuenta</span>
    <h1 class="serif-title">Actualización obligatoria</h1>
    <p class="lead">
      Un administrador ha reseteado credenciales de tu cuenta. Debes establecer valores propios antes de
      continuar.
    </p>

    {#if errorMsg}
      <div class="error-banner" role="alert">{errorMsg}</div>
    {/if}

    {#if needPassword}
      <form class="block" onsubmit={submitPassword}>
        <h2>Nueva contraseña de acceso</h2>
        <p class="hint">La temporal tras reset es <code>12345678</code>.</p>
        <label>
          Contraseña actual (temporal)
          <input type="password" bind:value={passwordActual} disabled={busy} />
        </label>
        <label>
          Nueva contraseña
          <input type="password" bind:value={passwordNueva} minlength="8" disabled={busy} required />
        </label>
        <label>
          Confirmar
          <input type="password" bind:value={passwordConfirm} minlength="8" disabled={busy} required />
        </label>
        <button type="submit" class="btn btn-gold" disabled={busy}>Guardar contraseña</button>
      </form>
    {/if}

    {#if needPin && !needPassword}
      <form class="block" onsubmit={submitPin}>
        <h2>PIN de cancelación personal</h2>
        <p class="hint">
          Tras un reseteo el PIN es <code>0000</code>. Elige uno personal de 4 dígitos (no puede ser
          0000).
        </p>
        <label>
          PIN actual (0000)
          <input type="password" inputmode="numeric" maxlength="4" bind:value={pinActual} disabled={busy} />
        </label>
        <label>
          Nuevo PIN
          <input type="password" inputmode="numeric" maxlength="4" bind:value={pinNuevo} disabled={busy} required />
        </label>
        <label>
          Confirmar PIN
          <input type="password" inputmode="numeric" maxlength="4" bind:value={pinConfirm} disabled={busy} required />
        </label>
        <button type="submit" class="btn btn-gold" disabled={busy}>Guardar PIN</button>
      </form>
    {/if}
  </div>
</div>

<style>
  .gate {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
  }
  .panel {
    max-width: 440px;
    width: 100%;
    padding: 2rem;
  }
  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .lead,
  .hint {
    color: var(--text-muted);
    font-size: 0.92rem;
  }
  .block {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  .error-banner {
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert, #b84c4c);
    margin-top: 1rem;
  }
</style>
