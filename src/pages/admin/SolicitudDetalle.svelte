<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { router, irAAdmin } from '../../lib/stores/router';
  import { executeApi, ApiError } from '../../lib/appwrite';
  import { ESTADO_LABEL, type EstadoSolicitud } from '../../lib/types';

  type SolicitudDetalle = {
    id: string;
    codigoSeguimiento: string;
    nombreFamiliar: string;
    email: string;
    telefono: string | null;
    nombrePersona: string;
    relacion: string;
    descripcion: string;
    estado: EstadoSolicitud;
    mensajePublico: string | null;
    notasInternas: string | null;
    diditSessionId: string | null;
    kycResultado: string | null;
    fechaCreacion: string;
    fechaActualizacion: string;
  };

  let solicitud = $state<SolicitudDetalle | null>(null);
  let cargando = $state(true);
  let errorMsg = $state('');
  let actionError = $state('');
  let actionLoading = $state(false);

  let notas = $state('');
  let kycUrl = $state('');

  // Modales
  let modal: 'none' | 'verificar' | 'cerrar' | 'cancelar' = $state('none');
  let motivo = $state('');
  let cancelPin = $state('');

  const solicitudId = $derived(get(router).solicitudId ?? '');

  const esTerminal = $derived(
    solicitud?.estado === 'cerrado' || solicitud?.estado === 'cancelada',
  );

  onMount(async () => {
    if (!solicitudId) {
      errorMsg = 'ID de solicitud no especificado.';
      cargando = false;
      return;
    }
    try {
      const res = await executeApi<SolicitudDetalle>('solicitudes.getById', { solicitudId });
      solicitud = res;
      notas = solicitud.notasInternas ?? '';
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'No se pudo cargar la solicitud.';
    } finally {
      cargando = false;
    }
  });

  function badgeFor(estado: EstadoSolicitud): string {
    if (estado === 'verificado') return 'badge badge-positive';
    if (estado === 'cancelada') return 'badge badge-error';
    if (estado === 'cerrado') return 'badge';
    return 'badge badge-progress';
  }

  async function runAction(fn: () => Promise<void>) {
    actionError = '';
    actionLoading = true;
    try {
      await fn();
      modal = 'none';
      motivo = '';
      cancelPin = '';
    } catch (err) {
      actionError = err instanceof ApiError ? err.message : 'No se pudo completar la acción.';
    } finally {
      actionLoading = false;
    }
  }

  async function marcarAtendido(conKyc: boolean) {
    if (!solicitud) return;
    await runAction(async () => {
      const res = await executeApi<{ estado: EstadoSolicitud; verificationUrl?: string; sessionId?: string }>(
        conKyc ? 'solicitudes.marcarSinVerificar' : 'solicitudes.marcarAtendido',
        {
          solicitudId: solicitud!.id,
          notasInternas: notas || undefined,
          iniciarKyc: conKyc,
        },
      );
      solicitud = {
        ...solicitud!,
        estado: res.estado,
        diditSessionId: res.sessionId ?? solicitud!.diditSessionId,
      };
      if (res.verificationUrl) kycUrl = res.verificationUrl;
    });
  }

  async function iniciarKyc() {
    if (!solicitud) return;
    await runAction(async () => {
      const res = await executeApi<{ estado: EstadoSolicitud; verificationUrl?: string; sessionId?: string }>(
        'solicitudes.iniciarKyc',
        { solicitudId: solicitud!.id, notasInternas: notas || undefined },
      );
      solicitud = {
        ...solicitud!,
        estado: res.estado,
        diditSessionId: res.sessionId ?? solicitud!.diditSessionId,
      };
      if (res.verificationUrl) kycUrl = res.verificationUrl;
    });
  }

  async function confirmarVerificado() {
    if (!solicitud || !motivo.trim()) {
      actionError = 'El motivo de verificación manual es obligatorio.';
      return;
    }
    await runAction(async () => {
      const res = await executeApi<{ estado: EstadoSolicitud }>('solicitudes.marcarVerificado', {
        solicitudId: solicitud!.id,
        motivo: motivo.trim(),
      });
      solicitud = { ...solicitud!, estado: res.estado, kycResultado: 'manual' };
    });
  }

  async function confirmarCierre() {
    if (!solicitud || !motivo.trim()) {
      actionError = 'El motivo de cierre es obligatorio.';
      return;
    }
    await runAction(async () => {
      const res = await executeApi<{ estado: EstadoSolicitud }>('solicitudes.cerrar', {
        solicitudId: solicitud!.id,
        motivoInterno: motivo.trim(),
      });
      solicitud = { ...solicitud!, estado: res.estado };
    });
  }

  async function confirmarCancelacion() {
    if (!solicitud || !motivo.trim()) {
      actionError = 'El motivo de cancelación es obligatorio.';
      return;
    }
    if (!/^\d{4}$/.test(cancelPin)) {
      actionError = 'Introduce el PIN de cancelación (4 dígitos).';
      return;
    }
    await runAction(async () => {
      const res = await executeApi<{ estado: EstadoSolicitud }>('solicitudes.cancelar', {
        solicitudId: solicitud!.id,
        motivoInterno: motivo.trim(),
        pin: cancelPin,
      });
      solicitud = { ...solicitud!, estado: res.estado };
    });
  }

  function openModal(m: typeof modal) {
    actionError = '';
    motivo = '';
    cancelPin = '';
    modal = m;
  }
</script>

<div class="detalle-wrap">
  <button type="button" class="btn btn-secondary back-btn" onclick={() => irAAdmin('solicitudes')}>
    ← Volver a Solicitudes
  </button>

  {#if cargando}
    <div class="card loading-card">Cargando expediente…</div>
  {:else if errorMsg}
    <div class="error-banner" role="alert">{errorMsg}</div>
  {:else if solicitud}
    <div class="detalle-header glass-panel">
      <div>
        <span class="eyebrow">Expediente</span>
        <h1 class="serif-title">
          <code class="codigo-h">{solicitud.codigoSeguimiento}</code>
        </h1>
      </div>
      <span class={badgeFor(solicitud.estado)}>
        {ESTADO_LABEL[solicitud.estado] ?? solicitud.estado}
      </span>
    </div>

    <div class="info-grid">
      <div class="card info-card">
        <h3>Familiar solicitante</h3>
        <dl>
          <dt>Nombre</dt>
          <dd><strong>{solicitud.nombreFamiliar}</strong></dd>
          <dt>Email</dt>
          <dd><a href="mailto:{solicitud.email}">{solicitud.email}</a></dd>
          {#if solicitud.telefono}
            <dt>Teléfono</dt>
            <dd>{solicitud.telefono}</dd>
          {/if}
        </dl>
      </div>
      <div class="card info-card">
        <h3>Persona buscada</h3>
        <dl>
          <dt>Nombre</dt>
          <dd><strong>{solicitud.nombrePersona}</strong></dd>
          <dt>Relación</dt>
          <dd>{solicitud.relacion}</dd>
        </dl>
      </div>
    </div>

    <div class="card block-card">
      <h3>Contexto</h3>
      <p class="descripcion">{solicitud.descripcion}</p>
    </div>

    {#if solicitud.notasInternas}
      <div class="card block-card">
        <h3>Notas internas</h3>
        <pre class="notas-pre">{solicitud.notasInternas}</pre>
      </div>
    {/if}

    {#if !esTerminal}
      <div class="card action-card">
        <h3>Gestión de estado</h3>
        <p class="hint-text">
          Flujo: pendiente → atendido (sin verificar) → verificado → cerrado. Cancelar exige PIN de
          auditoría.
        </p>

        {#if actionError && modal === 'none'}
          <div class="error-banner" role="alert">{actionError}</div>
        {/if}

        <label for="notas-op">Notas (se anexan en la siguiente acción)</label>
        <textarea id="notas-op" bind:value={notas} rows="2" disabled={actionLoading}></textarea>

        <div class="actions-row">
          {#if solicitud.estado === 'pendiente'}
            <button
              type="button"
              class="btn btn-primary"
              disabled={actionLoading}
              onclick={() => marcarAtendido(false)}
            >
              Marcar atendido
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              disabled={actionLoading}
              onclick={() => marcarAtendido(true)}
            >
              Atender + iniciar KYC Didit
            </button>
          {/if}

          {#if solicitud.estado === 'sin_verificar'}
            <button
              type="button"
              class="btn btn-secondary"
              disabled={actionLoading}
              onclick={() => iniciarKyc()}
            >
              Iniciar / reenviar KYC Didit
            </button>
            <button
              type="button"
              class="btn btn-primary"
              disabled={actionLoading}
              onclick={() => openModal('verificar')}
            >
              Marcar verificado (manual)
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              disabled={actionLoading}
              onclick={() => openModal('cerrar')}
            >
              Cerrar expediente
            </button>
          {/if}

          {#if solicitud.estado === 'verificado'}
            <button
              type="button"
              class="btn btn-primary"
              disabled={actionLoading}
              onclick={() => openModal('cerrar')}
            >
              Cerrar expediente
            </button>
          {/if}

          {#if solicitud.estado === 'pendiente' || solicitud.estado === 'sin_verificar' || solicitud.estado === 'verificado'}
            <button
              type="button"
              class="btn btn-danger"
              disabled={actionLoading}
              onclick={() => openModal('cancelar')}
            >
              Cancelar solicitud
            </button>
          {/if}
        </div>

        {#if solicitud.diditSessionId || kycUrl}
          <div class="kyc-box">
            {#if solicitud.diditSessionId}
              <p>Didit session: <code>{solicitud.diditSessionId}</code></p>
            {/if}
            {#if kycUrl}
              <a class="btn btn-secondary" href={kycUrl} target="_blank" rel="noopener">Abrir enlace Didit</a>
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      <div class="card block-card">
        <span class={badgeFor(solicitud.estado)}>
          {ESTADO_LABEL[solicitud.estado]}
        </span>
        <p class="hint-text">Este expediente está en estado terminal; no admite más cambios de estado.</p>
      </div>
    {/if}
  {/if}
</div>

{#if modal !== 'none'}
  <div
    class="modal-backdrop"
    role="presentation"
    onclick={() => (modal = 'none')}
    onkeydown={(e) => {
      if (e.key === 'Escape') modal = 'none';
    }}
  >
    <div
      class="modal card"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      {#if modal === 'verificar'}
        <h2>Verificación manual</h2>
        <p>
          Usa esta opción cuando Didit no sea viable (p. ej. baja conectividad) y la identidad se haya
          confirmado por otra vía documentada.
        </p>
        <label>
          Motivo obligatorio
          <textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea>
        </label>
      {:else if modal === 'cerrar'}
        <h2>Cerrar expediente</h2>
        <p>El proceso negociado o la investigación se dan por terminados.</p>
        <label>
          Motivo interno obligatorio
          <textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea>
        </label>
      {:else if modal === 'cancelar'}
        <h2>Cancelar solicitud</h2>
        <p>
          Requiere el PIN de cancelación del backoffice (4 dígitos). No elimina el expediente; queda
          auditado.
        </p>
        <label>
          Motivo obligatorio
          <textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea>
        </label>
        <label>
          PIN de cancelación
          <input
            type="password"
            inputmode="numeric"
            maxlength="4"
            pattern="\d{{4}}"
            bind:value={cancelPin}
            disabled={actionLoading}
            autocomplete="one-time-code"
          />
        </label>
      {/if}

      {#if actionError}
        <div class="error-banner">{actionError}</div>
      {/if}

      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" disabled={actionLoading} onclick={() => (modal = 'none')}>
          Volver
        </button>
        {#if modal === 'verificar'}
          <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={confirmarVerificado}>
            {actionLoading ? 'Guardando…' : 'Confirmar verificado'}
          </button>
        {:else if modal === 'cerrar'}
          <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={confirmarCierre}>
            {actionLoading ? 'Cerrando…' : 'Confirmar cierre'}
          </button>
        {:else if modal === 'cancelar'}
          <button type="button" class="btn btn-danger" disabled={actionLoading} onclick={confirmarCancelacion}>
            {actionLoading ? 'Cancelando…' : 'Confirmar cancelación'}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .detalle-wrap {
    width: 100%;
    max-width: 960px;
    margin: 2rem auto 5rem;
    padding: 0 1.5rem;
    box-sizing: border-box;
  }
  .back-btn {
    margin-bottom: 1.5rem;
  }
  .detalle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    background: var(--color-obsidian-navy);
    color: #fff;
    border: 1px solid var(--color-border-gold);
  }
  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .codigo-h {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    color: #fff;
  }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    margin: 0;
  }
  dt {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
  }
  dd {
    margin: 0;
  }
  .descripcion {
    white-space: pre-wrap;
    margin: 0;
  }
  .notas-pre {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    white-space: pre-wrap;
    margin: 0;
  }
  .hint-text {
    font-size: 0.9rem;
    color: var(--text-muted);
  }
  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .kyc-box {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }
  .error-banner {
    padding: 0.85rem 1rem;
    border-radius: var(--radius);
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert, #b84c4c);
    font-size: 0.88rem;
    margin: 0.75rem 0;
  }
  .loading-card {
    text-align: center;
    padding: 3rem;
    color: var(--text-muted);
  }
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(7, 25, 35, 0.55);
    display: grid;
    place-items: center;
    z-index: 50;
    padding: 1rem;
  }
  .modal {
    max-width: 480px;
    width: 100%;
    padding: 1.75rem;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }
</style>
