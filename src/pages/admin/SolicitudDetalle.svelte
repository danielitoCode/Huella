<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { router, irAAdmin } from '../../lib/stores/router';
  import { ApiError } from '../../lib/appwrite';
  import { getSolicitudRepository } from '../../lib/data/repositories';
  import { ESTADO_LABEL, type EstadoSolicitud, type Solicitud } from '../../lib/types';
  import Skeleton from '../../components/ui/Skeleton.svelte';
  import LoadingHint from '../../components/ui/LoadingHint.svelte';

  let solicitud = $state<Solicitud | null>(null);
  let cargando = $state(true);
  let errorMsg = $state('');
  let actionError = $state('');
  let actionLoading = $state(false);

  let notas = $state('');
  let mensajePublico = $state('');

  let modal: 'none' | 'verificar' | 'cerrar' | 'cancelar' = $state('none');
  let motivo = $state('');

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
      const res = await getSolicitudRepository().getById(solicitudId);
      solicitud = res;
      notas = res.notasInternas ?? '';
      mensajePublico = res.mensajePublico ?? '';
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
    } catch (err) {
      actionError = err instanceof ApiError ? err.message : 'No se pudo completar la acción.';
    } finally {
      actionLoading = false;
    }
  }

  async function guardarNotas() {
    if (!solicitud) return;
    await runAction(async () => {
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        notasInternas: notas || null,
        mensajePublico: mensajePublico || null,
      });
      solicitud = updated;
    });
  }

  async function marcarAtendido() {
    if (!solicitud) return;
    await runAction(async () => {
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        estado: 'sin_verificar',
        notasInternas: notas || solicitud!.notasInternas,
        mensajePublico:
          mensajePublico ||
          'Tu caso está siendo atendido. Pronto te indicaremos cómo verificar identidad.',
      });
      solicitud = updated;
      mensajePublico = updated.mensajePublico ?? '';
    });
  }

  async function confirmarVerificado() {
    if (!solicitud || !motivo.trim()) {
      actionError = 'El motivo de verificación manual es obligatorio.';
      return;
    }
    await runAction(async () => {
      const note = [notas, `Verificado manual: ${motivo.trim()}`].filter(Boolean).join('\n');
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        estado: 'verificado',
        kycResultado: 'manual',
        notasInternas: note,
        mensajePublico:
          mensajePublico ||
          'Identidad confirmada. El equipo continúa con la investigación del familiar.',
      });
      solicitud = updated;
    });
  }

  async function confirmarCierre() {
    if (!solicitud || !motivo.trim()) {
      actionError = 'El motivo de cierre es obligatorio.';
      return;
    }
    await runAction(async () => {
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        estado: 'cerrado',
        motivoCierre: motivo.trim(),
        notasInternas: [notas, `Cierre: ${motivo.trim()}`].filter(Boolean).join('\n'),
        mensajePublico: mensajePublico || 'Expediente cerrado.',
      });
      solicitud = updated;
    });
  }

  async function confirmarCancelacion() {
    if (!solicitud || !motivo.trim()) {
      actionError = 'El motivo de cancelación es obligatorio.';
      return;
    }
    await runAction(async () => {
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        estado: 'cancelada',
        motivoCierre: motivo.trim(),
        notasInternas: [notas, `Cancelada: ${motivo.trim()}`].filter(Boolean).join('\n'),
        mensajePublico: mensajePublico || 'Esta solicitud fue cancelada.',
      });
      solicitud = updated;
    });
  }

  function openModal(m: typeof modal) {
    actionError = '';
    motivo = '';
    modal = m;
  }
</script>

<div class="detalle-wrap">
  <button type="button" class="btn btn-secondary back-btn" onclick={() => irAAdmin('solicitudes')}>
    ← Volver a solicitudes
  </button>

  {#if cargando}
    <div class="load-panel card">
      <LoadingHint message="Recuperando el expediente desde Appwrite…" />
      <div class="skel-header">
        <Skeleton width="12rem" height="1.6rem" />
        <Skeleton width="6rem" height="1.5rem" radius="999px" />
      </div>
    </div>
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

    {#if !esTerminal}
      <div class="card action-card">
        <h3>Gestión de estado (SDK Appwrite)</h3>
        <p class="hint-text">
          Flujo: pendiente → atendido (sin verificar) → verificado → cerrado. Sin Worker: Didit y PIN
          quedan fuera de esta pantalla por ahora.
        </p>

        {#if actionError && modal === 'none'}
          <div class="error-banner" role="alert">{actionError}</div>
        {/if}

        {#if actionLoading}
          <LoadingHint message="Guardando en Appwrite…" compact />
        {/if}

        <label for="notas-op">Notas internas</label>
        <textarea id="notas-op" bind:value={notas} rows="2" disabled={actionLoading}></textarea>

        <label for="msg-pub">Mensaje público (visible en seguimiento)</label>
        <textarea id="msg-pub" bind:value={mensajePublico} rows="2" disabled={actionLoading}></textarea>

        <div class="actions-row">
          <button type="button" class="btn btn-secondary" disabled={actionLoading} onclick={() => guardarNotas()}>
            Guardar notas / mensaje
          </button>

          {#if solicitud.estado === 'pendiente'}
            <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={() => marcarAtendido()}>
              Marcar atendido (sin verificar)
            </button>
          {/if}

          {#if solicitud.estado === 'sin_verificar'}
            <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={() => openModal('verificar')}>
              Marcar verificado (manual)
            </button>
            <button type="button" class="btn btn-secondary" disabled={actionLoading} onclick={() => openModal('cerrar')}>
              Cerrar expediente
            </button>
          {/if}

          {#if solicitud.estado === 'verificado'}
            <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={() => openModal('cerrar')}>
              Cerrar expediente
            </button>
          {/if}

          {#if solicitud.estado === 'pendiente' || solicitud.estado === 'sin_verificar' || solicitud.estado === 'verificado'}
            <button type="button" class="btn btn-danger" disabled={actionLoading} onclick={() => openModal('cancelar')}>
              Cancelar solicitud
            </button>
          {/if}
        </div>

        {#if solicitud.diditVerificationUrl}
          <p class="hint-text" style="margin-top: 1rem">
            Enlace Didit guardado:
            <a href={solicitud.diditVerificationUrl} target="_blank" rel="noopener">{solicitud.diditVerificationUrl}</a>
          </p>
        {/if}
      </div>
    {:else}
      <div class="card block-card">
        <span class={badgeFor(solicitud.estado)}>{ESTADO_LABEL[solicitud.estado]}</span>
        <p class="hint-text">Estado terminal: no admite más cambios desde la app.</p>
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
        <label>Motivo<textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea></label>
      {:else if modal === 'cerrar'}
        <h2>Cerrar expediente</h2>
        <label>Motivo<textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea></label>
      {:else if modal === 'cancelar'}
        <h2>Cancelar solicitud</h2>
        <p class="hint-text">PIN de cancelación: gestión temporal vía consola Appwrite (congelado en app).</p>
        <label>Motivo<textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea></label>
      {/if}
      {#if actionError}<div class="error-banner">{actionError}</div>{/if}
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" disabled={actionLoading} onclick={() => (modal = 'none')}>Volver</button>
        {#if modal === 'verificar'}
          <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={confirmarVerificado}>Confirmar</button>
        {:else if modal === 'cerrar'}
          <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={confirmarCierre}>Cerrar</button>
        {:else if modal === 'cancelar'}
          <button type="button" class="btn btn-danger" disabled={actionLoading} onclick={confirmarCancelacion}>Cancelar</button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .detalle-wrap {
    max-width: 960px;
    margin: 2rem auto 5rem;
    padding: 0 1.5rem;
  }
  .back-btn {
    margin-bottom: 1.5rem;
  }
  .load-panel {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .skel-header {
    display: flex;
    justify-content: space-between;
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
    color: var(--text-muted);
  }
  dd {
    margin: 0;
  }
  .descripcion {
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
  .action-card textarea,
  .block-card {
    margin-bottom: 1rem;
  }
  .action-card label {
    display: block;
    margin-top: 0.75rem;
    font-size: 0.85rem;
  }
  .error-banner {
    padding: 0.85rem 1rem;
    margin: 0.75rem 0;
    border-radius: var(--radius);
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert, #b84c4c);
  }
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: center;
    z-index: 50;
    padding: 1rem;
  }
  .modal {
    width: min(480px, 100%);
    padding: 1.5rem;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
  }
</style>
