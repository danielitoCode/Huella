<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { router, irAAdmin } from '../../lib/stores/router';
  import { ApiError } from '../../lib/appwrite';
  import { getSolicitudRepository } from '../../lib/data/repositories';
  import {
    ESTADO_DESCRIPCION_OPERADOR,
    ESTADO_LABEL,
    type EstadoSolicitud,
    type Solicitud,
  } from '../../lib/types';
  import Skeleton from '../../components/ui/Skeleton.svelte';
  import LoadingHint from '../../components/ui/LoadingHint.svelte';

  /** Orden del flujo feliz (cancelada es rama aparte). */
  const PIPELINE: EstadoSolicitud[] = [
    'pendiente',
    'sin_verificar',
    'verificado',
    'cerrado',
  ];

  let solicitud = $state<Solicitud | null>(null);
  let cargando = $state(true);
  let errorMsg = $state('');
  let actionError = $state('');
  let actionLoading = $state(false);
  let notasGuardadasOk = $state(false);

  /** Notas del operador: detalles importantes del expediente (solo backoffice). */
  let notas = $state('');
  /** Mensaje visible en seguimiento público. */
  let mensajePublico = $state('');

  let modal: 'none' | 'verificar' | 'cerrar' | 'cancelar' = $state('none');
  let motivo = $state('');

  const solicitudId = $derived(get(router).solicitudId ?? '');

  const esTerminal = $derived(
    solicitud?.estado === 'cerrado' || solicitud?.estado === 'cancelada',
  );

  function pipelineIndex(estado: EstadoSolicitud): number {
    if (estado === 'cancelada') return -1;
    return PIPELINE.indexOf(estado);
  }

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
    if (estado === 'cerrado') return 'badge badge-positive';
    if (estado === 'cancelada') return 'badge badge-error';
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
        notasInternas: notas.trim() || null,
        mensajePublico: mensajePublico.trim() || null,
      });
      solicitud = updated;
      notas = updated.notasInternas ?? '';
      mensajePublico = updated.mensajePublico ?? '';
      notasGuardadasOk = true;
      setTimeout(() => {
        notasGuardadasOk = false;
      }, 2500);
    });
  }

  /** pendiente → atendido · no verificado */
  async function marcarAtendido() {
    if (!solicitud || solicitud.estado !== 'pendiente') return;
    await runAction(async () => {
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        estado: 'sin_verificar',
        notasInternas: notas.trim() || solicitud!.notasInternas,
        mensajePublico:
          mensajePublico.trim() ||
          'Tu caso está siendo atendido. Pronto te indicaremos cómo verificar identidad.',
      });
      solicitud = updated;
      mensajePublico = updated.mensajePublico ?? '';
    });
  }

  /** sin_verificar → verificado */
  async function confirmarVerificado() {
    if (!solicitud || solicitud.estado !== 'sin_verificar') return;
    if (!motivo.trim()) {
      actionError = 'Indica cómo se verificó la identidad (Didit, asistida, etc.).';
      return;
    }
    await runAction(async () => {
      const note = [notas.trim(), `Verificación: ${motivo.trim()}`].filter(Boolean).join('\n');
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        estado: 'verificado',
        kycResultado: 'manual',
        notasInternas: note || null,
        mensajePublico:
          mensajePublico.trim() ||
          'Identidad confirmada. El equipo continúa con la investigación del familiar.',
      });
      solicitud = updated;
      notas = updated.notasInternas ?? '';
    });
  }

  /** verificado → cerrado (proceso completado correctamente) */
  async function confirmarCierre() {
    if (!solicitud || solicitud.estado !== 'verificado') return;
    if (!motivo.trim()) {
      actionError = 'Describe el resultado final del expediente (cierre exitoso).';
      return;
    }
    await runAction(async () => {
      const note = [notas.trim(), `Cierre completado: ${motivo.trim()}`].filter(Boolean).join('\n');
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        estado: 'cerrado',
        motivoCierre: motivo.trim(),
        notasInternas: note || null,
        mensajePublico:
          mensajePublico.trim() ||
          'Expediente cerrado: el proceso se completó correctamente.',
      });
      solicitud = updated;
      notas = updated.notasInternas ?? '';
    });
  }

  /** → cancelada (no es un cierre exitoso) */
  async function confirmarCancelacion() {
    if (!solicitud || esTerminal) return;
    if (!motivo.trim()) {
      actionError = 'El motivo de cancelación es obligatorio.';
      return;
    }
    await runAction(async () => {
      const note = [notas.trim(), `Cancelada: ${motivo.trim()}`].filter(Boolean).join('\n');
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        estado: 'cancelada',
        motivoCierre: motivo.trim(),
        notasInternas: note || null,
        mensajePublico: mensajePublico.trim() || 'Esta solicitud fue cancelada.',
      });
      solicitud = updated;
      notas = updated.notasInternas ?? '';
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
    {@const step = pipelineIndex(solicitud.estado)}

    <div class="detalle-header glass-panel">
      <div>
        <span class="eyebrow">Expediente</span>
        <h1 class="serif-title">
          <code class="codigo-h">{solicitud.codigoSeguimiento}</code>
        </h1>
        <p class="estado-desc">{ESTADO_DESCRIPCION_OPERADOR[solicitud.estado]}</p>
      </div>
      <span class={badgeFor(solicitud.estado)}>
        {ESTADO_LABEL[solicitud.estado]}
      </span>
    </div>

    <!-- Pipeline visual de estados -->
    <div class="pipeline card" aria-label="Flujo de estados">
      {#if solicitud.estado === 'cancelada'}
        <p class="pipeline-cancel">Solicitud <strong>cancelada</strong> (fuera del flujo de cierre exitoso).</p>
      {:else}
        <ol class="pipeline-steps">
          {#each PIPELINE as est, i}
            <li
              class="pipe-step"
              class:done={step > i}
              class:current={step === i}
            >
              <span class="pipe-dot">{step > i ? '✓' : i + 1}</span>
              <span class="pipe-label">{ESTADO_LABEL[est]}</span>
            </li>
          {/each}
        </ol>
      {/if}
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
      <h3>Contexto de la solicitud</h3>
      <p class="descripcion">{solicitud.descripcion || '—'}</p>
    </div>

    <!-- Notas del operador: siempre visibles -->
    <div class="card notes-card">
      <h3>Notas del operador</h3>
      <p class="hint-text">
        Detalles internos del caso (hallazgos, contactos, incidencias). <strong>No se muestran</strong> en el
        seguimiento público del familiar.
      </p>
      <textarea
        id="notas-op"
        bind:value={notas}
        rows="5"
        placeholder="Ej.: Contactado por WhatsApp el 09/09; familiar en Matanzas; documentación pendiente…"
        disabled={actionLoading}
      ></textarea>

      <label for="msg-pub" class="msg-label">Mensaje público (opcional, visible en seguimiento)</label>
      <textarea
        id="msg-pub"
        bind:value={mensajePublico}
        rows="2"
        placeholder="Nota breve que verá el familiar al consultar su código…"
        disabled={actionLoading}
      ></textarea>

      <div class="notes-actions">
        <button type="button" class="btn btn-secondary" disabled={actionLoading} onclick={() => guardarNotas()}>
          {notasGuardadasOk ? '✓ Guardado' : 'Guardar notas'}
        </button>
        {#if actionError && modal === 'none'}
          <span class="inline-err">{actionError}</span>
        {/if}
      </div>
    </div>

    {#if !esTerminal}
      <div class="card action-card">
        <h3>Cambiar estado</h3>
        <p class="hint-text">
          <strong>Pendiente</strong> → <strong>Atendido · no verificado</strong> → <strong>Verificado</strong> →
          <strong>Cerrado</strong> (todo completado correctamente). <strong>Cancelada</strong> interrumpe el proceso.
        </p>

        {#if actionLoading}
          <LoadingHint message="Guardando en Appwrite…" compact />
        {/if}

        <div class="actions-row">
          {#if solicitud.estado === 'pendiente'}
            <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={() => marcarAtendido()}>
              Pasar a: Atendido · no verificado
            </button>
          {/if}

          {#if solicitud.estado === 'sin_verificar'}
            <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={() => openModal('verificar')}>
              Pasar a: Verificado
            </button>
          {/if}

          {#if solicitud.estado === 'verificado'}
            <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={() => openModal('cerrar')}>
              Cerrar (proceso completado)
            </button>
          {/if}

          {#if solicitud.estado === 'pendiente' || solicitud.estado === 'sin_verificar' || solicitud.estado === 'verificado'}
            <button type="button" class="btn btn-danger" disabled={actionLoading} onclick={() => openModal('cancelar')}>
              Cancelar solicitud
            </button>
          {/if}
        </div>
      </div>
    {:else}
      <div class="card block-card terminal-card">
        <span class={badgeFor(solicitud.estado)}>{ESTADO_LABEL[solicitud.estado]}</span>
        <p class="hint-text">
          {#if solicitud.estado === 'cerrado'}
            Estado terminal de <strong>éxito</strong>: el proceso se completó. Puedes seguir editando notas si hace falta.
          {:else}
            Estado terminal: la solicitud fue <strong>cancelada</strong>. Puedes conservar las notas para auditoría.
          {/if}
        </p>
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
        <h2>Marcar como verificado</h2>
        <p class="hint-text">Confirma la identidad del solicitante (Didit, llamada, documentos, etc.).</p>
        <label>Cómo se verificó<textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea></label>
      {:else if modal === 'cerrar'}
        <h2>Cerrar expediente (completado)</h2>
        <p class="hint-text">
          Usa este estado solo cuando el proceso terminó <strong>correctamente</strong> (averiguación y gestiones asociadas).
        </p>
        <label>Resultado final<textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea></label>
      {:else if modal === 'cancelar'}
        <h2>Cancelar solicitud</h2>
        <p class="hint-text">No es un cierre exitoso: el expediente no continúa.</p>
        <label>Motivo de cancelación<textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea></label>
      {/if}
      {#if actionError}<div class="error-banner">{actionError}</div>{/if}
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" disabled={actionLoading} onclick={() => (modal = 'none')}>Volver</button>
        {#if modal === 'verificar'}
          <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={confirmarVerificado}>Confirmar verificado</button>
        {:else if modal === 'cerrar'}
          <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={confirmarCierre}>Cerrar completado</button>
        {:else if modal === 'cancelar'}
          <button type="button" class="btn btn-danger" disabled={actionLoading} onclick={confirmarCancelacion}>Confirmar cancelación</button>
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
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem 2rem;
    margin-bottom: 1rem;
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
  .estado-desc {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    color: #a4b4c0;
    max-width: 36rem;
  }
  .pipeline {
    padding: 1rem 1.25rem;
    margin-bottom: 1.25rem;
  }
  .pipeline-steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  .pipe-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.35rem;
    opacity: 0.45;
  }
  .pipe-step.done,
  .pipe-step.current {
    opacity: 1;
  }
  .pipe-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--border);
    display: grid;
    place-items: center;
    font-size: 0.8rem;
    font-weight: 700;
  }
  .pipe-step.done .pipe-dot {
    background: var(--gold);
    border-color: var(--gold);
    color: #071927;
  }
  .pipe-step.current .pipe-dot {
    border-color: var(--positive);
    color: var(--positive);
  }
  .pipe-label {
    font-size: 0.72rem;
    color: var(--text-muted);
    line-height: 1.25;
  }
  .pipeline-cancel {
    margin: 0;
    color: var(--color-alert, #b84c4c);
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
    line-height: 1.45;
  }
  .notes-card {
    margin-bottom: 1.25rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid var(--color-border-gold);
    background: rgba(198, 164, 106, 0.05);
  }
  .notes-card textarea {
    width: 100%;
    margin-top: 0.5rem;
    font-family: inherit;
  }
  .msg-label {
    display: block;
    margin-top: 1rem;
    font-size: 0.85rem;
  }
  .notes-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.85rem;
  }
  .inline-err {
    color: var(--color-alert, #b84c4c);
    font-size: 0.85rem;
  }
  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .block-card,
  .action-card {
    margin-bottom: 1.25rem;
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
  .modal label {
    display: block;
    margin-top: 0.75rem;
    font-size: 0.9rem;
  }
  .modal textarea {
    width: 100%;
    margin-top: 0.35rem;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  @media (max-width: 640px) {
    .pipeline-steps {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
