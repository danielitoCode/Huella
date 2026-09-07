<script lang="ts">
  import { onMount } from 'svelte';
  import { irAAdmin } from '../../lib/stores/router';
  import { sessionUser, loadSession } from '../../lib/stores/session';
  import { executeApi, ApiError } from '../../lib/appwrite';
  import type { Operador, OperadorRol } from '../../lib/types';
  import LoadingHint from '../../components/ui/LoadingHint.svelte';

  type ListResult = { operadores: Operador[]; total: number };

  let operadores = $state<Operador[]>([]);
  let cargando = $state(true);
  let errorMsg = $state('');
  let okMsg = $state('');
  let busy = $state(false);

  let nuevo = $state({ nombre: '', email: '', rol: 'operador' as OperadorRol });

  // titular: cambiar PIN cuando no está en gate
  let pinActual = $state('');
  let pinNuevo = $state('');

  const isAdmin = $derived($sessionUser?.rol === 'admin');

  async function cargar() {
    cargando = true;
    errorMsg = '';
    try {
      if (isAdmin) {
        const res = await executeApi<ListResult>('operadores.list', { limit: 100 });
        operadores = res.operadores;
      } else {
        const me = await executeApi<Operador>('operadores.me', {});
        operadores = [me];
      }
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'No se pudo cargar el equipo.';
    } finally {
      cargando = false;
    }
  }

  onMount(() => {
    void cargar();
  });

  function flash(msg: string) {
    okMsg = msg;
    setTimeout(() => (okMsg = ''), 3200);
  }

  async function crearUsuario(e: Event) {
    e.preventDefault();
    if (!isAdmin) return;
    busy = true;
    errorMsg = '';
    try {
      const res = await executeApi<Operador>('operadores.create', {
        nombre: nuevo.nombre.trim(),
        email: nuevo.email.trim(),
        rol: nuevo.rol,
      });
      nuevo = { nombre: '', email: '', rol: 'operador' };
      flash(
        res.mensaje ||
          'Usuario creado. Password temporal 12345678 · PIN 0000 (debe cambiarlos al entrar).',
      );
      await cargar();
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Error al crear usuario';
    } finally {
      busy = false;
    }
  }

  async function setRole(op: Operador, rol: OperadorRol) {
    busy = true;
    errorMsg = '';
    try {
      await executeApi('operadores.setRole', { operadorId: op.id, rol });
      flash('Rol actualizado');
      await cargar();
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Error al cambiar rol';
    } finally {
      busy = false;
    }
  }

  async function toggleActivo(op: Operador) {
    busy = true;
    errorMsg = '';
    try {
      await executeApi('operadores.setActive', { operadorId: op.id, activo: !op.activo });
      flash(op.activo ? 'Usuario desactivado' : 'Usuario activado');
      await cargar();
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Error al cambiar estado';
    } finally {
      busy = false;
    }
  }

  async function resetPin(op: Operador) {
    if (!confirm(`¿Resetear PIN de ${op.nombre} a 0000? Deberá establecer uno nuevo.`)) return;
    busy = true;
    errorMsg = '';
    try {
      const res = await executeApi<Operador>('operadores.resetCancelPin', { operadorId: op.id });
      flash(res.mensaje || 'PIN reseteado a 0000');
      await cargar();
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Error al resetear PIN';
    } finally {
      busy = false;
    }
  }

  async function resetPassword(op: Operador) {
    if (!confirm(`¿Resetear contraseña de ${op.nombre} a 12345678?`)) return;
    busy = true;
    errorMsg = '';
    try {
      const res = await executeApi<Operador>('operadores.resetPassword', { operadorId: op.id });
      flash(res.mensaje || 'Contraseña reseteada a 12345678');
      await cargar();
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Error al resetear contraseña';
    } finally {
      busy = false;
    }
  }

  async function setOwnPin(e: Event) {
    e.preventDefault();
    if (!/^\d{4}$/.test(pinNuevo) || pinNuevo === '0000') {
      errorMsg = 'PIN nuevo: 4 dígitos, distinto de 0000';
      return;
    }
    busy = true;
    errorMsg = '';
    try {
      await executeApi('operadores.setOwnCancelPin', {
        pinActual: pinActual || ($sessionUser?.pinNeedsReset ? '0000' : ''),
        pin: pinNuevo,
      });
      pinActual = '';
      pinNuevo = '';
      flash('PIN personal actualizado');
      await loadSession();
      await cargar();
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Error al guardar PIN';
    } finally {
      busy = false;
    }
  }
</script>

<div class="wrap">
  <div class="page-head">
    <div>
      <span class="eyebrow">Administración</span>
      <h1 class="serif-title">Equipo y seguridad</h1>
      <p class="sub">
        Los administradores resetean (PIN → 0000, password → 12345678). Cada usuario establece los suyos.
      </p>
    </div>
    <button type="button" class="btn btn-secondary" onclick={() => irAAdmin('dashboard')}>
      ← Dashboard
    </button>
  </div>

  {#if errorMsg}<div class="error-banner" role="alert">{errorMsg}</div>{/if}
  {#if okMsg}<div class="ok-banner" role="status">{okMsg}</div>{/if}

  <div class="card block">
    <h2>Mi PIN de cancelación</h2>
    <p class="hint">
      {#if $sessionUser?.pinNeedsReset}
        Tu PIN está en <strong>0000</strong> (reseteado). Debes poner uno personal.
      {:else}
        Estado: <strong>configurado</strong>. Puedes cambiarlo indicando el actual.
      {/if}
    </p>
    <form class="inline-form" onsubmit={setOwnPin}>
      <label>
        PIN actual
        <input type="password" inputmode="numeric" maxlength="4" bind:value={pinActual} disabled={busy} placeholder={$sessionUser?.pinNeedsReset ? '0000' : '····'} />
      </label>
      <label>
        PIN nuevo
        <input type="password" inputmode="numeric" maxlength="4" bind:value={pinNuevo} disabled={busy} required />
      </label>
      <button type="submit" class="btn btn-primary" disabled={busy}>Guardar mi PIN</button>
    </form>
  </div>

  {#if isAdmin}
    <div class="card block">
      <h2>Crear cuenta</h2>
      <p class="hint">Se crea con password <code>12345678</code> y PIN <code>0000</code>; el usuario los cambia al entrar.</p>
      <form class="create-form" onsubmit={crearUsuario}>
        <label>Nombre<input bind:value={nuevo.nombre} required disabled={busy} /></label>
        <label>Email<input type="email" bind:value={nuevo.email} required disabled={busy} /></label>
        <label>
          Rol
          <select bind:value={nuevo.rol} disabled={busy}>
            <option value="operador">Operador</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        <button type="submit" class="btn btn-gold" disabled={busy}>Crear usuario</button>
      </form>
    </div>
  {/if}

  <div class="card block">
    <h2>{isAdmin ? 'Miembros del equipo' : 'Tu perfil'}</h2>
    {#if cargando}
      <LoadingHint message="Cargando…" />
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Activo</th>
              <th>PIN (auditoría)</th>
              {#if isAdmin}<th>Acciones</th>{/if}
            </tr>
          </thead>
          <tbody>
            {#each operadores as op (op.id)}
              <tr>
                <td><strong>{op.nombre}</strong></td>
                <td>{op.email}</td>
                <td>
                  {#if isAdmin}
                    <select
                      value={op.rol}
                      disabled={busy}
                      onchange={(e) =>
                        setRole(op, (e.currentTarget as HTMLSelectElement).value as OperadorRol)}
                    >
                      <option value="operador">operador</option>
                      <option value="admin">admin</option>
                    </select>
                  {:else}
                    {op.rol}
                  {/if}
                </td>
                <td>{op.activo ? 'Sí' : 'No'}</td>
                <td>
                  {#if op.pinNeedsReset}
                    <code title="Valor de fábrica tras reset">0000</code>
                    <span class="muted"> (reseteado)</span>
                  {:else}
                    <span class="muted">configurado</span>
                  {/if}
                </td>
                {#if isAdmin}
                  <td class="actions-cell">
                    <button type="button" class="btn btn-secondary btn-sm" disabled={busy} onclick={() => toggleActivo(op)}>
                      {op.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" disabled={busy} onclick={() => resetPin(op)}>
                      Reset PIN → 0000
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" disabled={busy} onclick={() => resetPassword(op)}>
                      Reset pass → 12345678
                    </button>
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<style>
  .wrap {
    max-width: 960px;
    margin: 2rem auto 5rem;
    padding: 0 1.5rem;
  }
  .page-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .sub,
  .hint,
  .muted {
    color: var(--text-muted);
    font-size: 0.9rem;
  }
  .block {
    margin-bottom: 1.25rem;
    padding: 1.5rem;
  }
  .create-form,
  .inline-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-end;
  }
  .table-wrap {
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--border);
    text-align: left;
    font-size: 0.88rem;
  }
  .actions-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .btn-sm {
    min-height: 32px;
    padding: 0.3rem 0.55rem;
    font-size: 0.78rem;
  }
  .error-banner {
    padding: 0.85rem 1rem;
    margin-bottom: 1rem;
    border-radius: var(--radius);
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert, #b84c4c);
  }
  .ok-banner {
    padding: 0.85rem 1rem;
    margin-bottom: 1rem;
    border-radius: var(--radius);
    background: rgba(42, 157, 143, 0.12);
    border: 1px solid rgba(42, 157, 143, 0.35);
    color: var(--positive, #2a9d8f);
  }
</style>
