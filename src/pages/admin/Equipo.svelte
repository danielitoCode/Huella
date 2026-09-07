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

  // crear
  let nuevo = $state({
    nombre: '',
    email: '',
    password: '',
    rol: 'operador' as OperadorRol,
    cancelPin: '',
  });

  // modales simples
  let editId = $state<string | null>(null);
  let editPin = $state('');
  let editPassword = $state('');
  let ownPin = $state('');

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
    setTimeout(() => (okMsg = ''), 2500);
  }

  async function crearUsuario(e: Event) {
    e.preventDefault();
    if (!isAdmin) return;
    busy = true;
    errorMsg = '';
    try {
      await executeApi('operadores.create', {
        nombre: nuevo.nombre.trim(),
        email: nuevo.email.trim(),
        password: nuevo.password,
        rol: nuevo.rol,
        cancelPin: nuevo.cancelPin || undefined,
      });
      nuevo = { nombre: '', email: '', password: '', rol: 'operador', cancelPin: '' };
      flash('Usuario creado');
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

  async function guardarPin(operadorId?: string) {
    const pin = operadorId ? editPin : ownPin;
    if (!/^\d{4}$/.test(pin)) {
      errorMsg = 'El PIN debe ser exactamente 4 dígitos';
      return;
    }
    busy = true;
    errorMsg = '';
    try {
      await executeApi('operadores.setCancelPin', {
        operadorId,
        pin,
      });
      editPin = '';
      ownPin = '';
      editId = null;
      flash('PIN de cancelación actualizado');
      await loadSession();
      await cargar();
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Error al guardar PIN';
    } finally {
      busy = false;
    }
  }

  async function guardarPassword(operadorId: string) {
    if (editPassword.length < 8) {
      errorMsg = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }
    busy = true;
    errorMsg = '';
    try {
      await executeApi('operadores.setPassword', {
        operadorId,
        password: editPassword,
      });
      editPassword = '';
      editId = null;
      flash('Contraseña actualizada');
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Error al cambiar contraseña';
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
      <p class="sub">Cuentas, roles, contraseñas y PINs de cancelación de la plataforma.</p>
    </div>
    <button type="button" class="btn btn-secondary" onclick={() => irAAdmin('dashboard')}>
      ← Dashboard
    </button>
  </div>

  {#if errorMsg}
    <div class="error-banner" role="alert">{errorMsg}</div>
  {/if}
  {#if okMsg}
    <div class="ok-banner" role="status">{okMsg}</div>
  {/if}

  <!-- PIN propio (todos) -->
  <div class="card block">
    <h2>Tu PIN de cancelación</h2>
    <p class="hint">
      Este PIN (4 dígitos) se exige al cancelar una solicitud. Es personal: el de cada operador o
      administrador.
      {#if $sessionUser?.tienePin}
        <strong> Ya tienes PIN configurado.</strong>
      {:else}
        <strong> Aún no tienes PIN — configúralo ahora.</strong>
      {/if}
    </p>
    <div class="inline-form">
      <input
        type="password"
        inputmode="numeric"
        maxlength="4"
        placeholder="••••"
        bind:value={ownPin}
        disabled={busy}
      />
      <button type="button" class="btn btn-primary" disabled={busy} onclick={() => guardarPin()}>
        Guardar mi PIN
      </button>
    </div>
  </div>

  {#if isAdmin}
    <div class="card block">
      <h2>Crear cuenta</h2>
      <form class="create-form" onsubmit={crearUsuario}>
        <label>
          Nombre
          <input bind:value={nuevo.nombre} required disabled={busy} />
        </label>
        <label>
          Email
          <input type="email" bind:value={nuevo.email} required disabled={busy} />
        </label>
        <label>
          Contraseña (mín. 8)
          <input type="password" bind:value={nuevo.password} required minlength="8" disabled={busy} />
        </label>
        <label>
          Rol
          <select bind:value={nuevo.rol} disabled={busy}>
            <option value="operador">Operador</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        <label>
          PIN cancelación (opcional)
          <input
            type="password"
            inputmode="numeric"
            maxlength="4"
            bind:value={nuevo.cancelPin}
            placeholder="4 dígitos"
            disabled={busy}
          />
        </label>
        <button type="submit" class="btn btn-gold" disabled={busy}>Crear usuario</button>
      </form>
    </div>
  {/if}

  <div class="card block">
    <h2>{isAdmin ? 'Miembros del equipo' : 'Tu perfil'}</h2>
    {#if cargando}
      <LoadingHint message="Cargando operadores…" />
    {:else if operadores.length === 0}
      <p class="hint">No hay operadores registrados.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>PIN</th>
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
                <td>
                  <span class="badge" class:badge-positive={op.activo}>
                    {op.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>{op.tienePin ? 'Sí' : 'No'}</td>
                {#if isAdmin}
                  <td class="actions-cell">
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      disabled={busy}
                      onclick={() => toggleActivo(op)}
                    >
                      {op.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary btn-sm"
                      disabled={busy}
                      onclick={() => {
                        editId = editId === op.id ? null : op.id;
                        editPin = '';
                        editPassword = '';
                      }}
                    >
                      PIN / Password
                    </button>
                  </td>
                {/if}
              </tr>
              {#if isAdmin && editId === op.id}
                <tr class="edit-row">
                  <td colspan="6">
                    <div class="edit-panel">
                      <div class="inline-form">
                        <label>
                          Nuevo PIN (4 dígitos)
                          <input
                            type="password"
                            inputmode="numeric"
                            maxlength="4"
                            bind:value={editPin}
                            disabled={busy}
                          />
                        </label>
                        <button
                          type="button"
                          class="btn btn-primary btn-sm"
                          disabled={busy}
                          onclick={() => guardarPin(op.id)}
                        >
                          Guardar PIN
                        </button>
                      </div>
                      <div class="inline-form">
                        <label>
                          Nueva contraseña
                          <input type="password" bind:value={editPassword} minlength="8" disabled={busy} />
                        </label>
                        <button
                          type="button"
                          class="btn btn-primary btn-sm"
                          disabled={busy}
                          onclick={() => guardarPassword(op.id)}
                        >
                          Guardar password
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              {/if}
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
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .sub {
    color: var(--text-muted);
    margin: 0.35rem 0 0;
  }
  .block {
    margin-bottom: 1.25rem;
    padding: 1.5rem;
  }
  .hint {
    font-size: 0.9rem;
    color: var(--text-muted);
  }
  .create-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    align-items: end;
  }
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
    font-size: 0.9rem;
  }
  .actions-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .btn-sm {
    min-height: 32px;
    padding: 0.3rem 0.65rem;
    font-size: 0.8rem;
  }
  .edit-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem 0;
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
