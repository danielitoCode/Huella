<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { router, irAAdmin } from '../../lib/stores/router';
  import { sessionUser } from '../../lib/stores/session';
  import { ApiError } from '../../lib/appwrite';
  import {
    getSolicitudRepository,
    getAuditoriaRepository,
    type EventoAuditoria,
    type AccionAuditoria,
  } from '../../lib/data/repositories';
  import {
    ESTADO_DESCRIPCION_OPERADOR,
    ESTADO_LABEL,
    KYC_RESULTADO_OPTIONS,
    KYC_RESULTADO_LABEL,
    type EstadoSolicitud,
    type KycResultado,
    type Solicitud,
  } from '../../lib/types';
  import Skeleton from '../../components/ui/Skeleton.svelte';
  import LoadingHint from '../../components/ui/LoadingHint.svelte';

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

  let notas = $state('');
  let mensajePublico = $state('');

  let modal: 'none' | 'verificar' | 'cerrar' | 'cancelar' = $state('none');
  let motivo = $state('');
  /** Resultado KYC permitido por el enum de Appwrite */
  let kycResultado = $state<KycResultado>('approved');
  /** Canal de verificación (solo notas/auditoría) */
  let canalVerificacion = $state<'didit' | 'asistida' | 'documentos' | 'otro'>('asistida');

  let auditoria = $state<EventoAuditoria[]>([]);
  let auditoriaLoading = $state(false);
  let auditoriaError = $state('');

  const solicitudId = $derived(get(router).solicitudId ?? '');

  const esTerminal = $derived(
    solicitud?.estado === 'cerrado' || solicitud?.estado === 'cancelada',
  );

  function pipelineIndex(estado: EstadoSolicitud): number {
    if (estado === 'cancelada') return -1;
    return PIPELINE.indexOf(estado);
  }

  function actorId(): string {
    return $sessionUser?.$id || $sessionUser?.operadorId || $sessionUser?.email || 'operador';
  }

  function actorTipo(): 'operador' | 'admin' {
    return $sessionUser?.rol === 'admin' ? 'admin' : 'operador';
  }

  async function cargarAuditoria(id: string) {
    auditoriaLoading = true;
    auditoriaError = '';
    try {
      auditoria = await getAuditoriaRepository().listBySolicitud(id);
    } catch (err) {
      auditoria = [];
      auditoriaError =
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar la auditoría (revisa permisos de la colección).';
    } finally {
      auditoriaLoading = false;
    }
  }

  async function registrarAudit(opts: {
    accion: AccionAuditoria;
    estadoAnterior?: EstadoSolicitud | null;
    estadoNuevo?: EstadoSolicitud | null;
    motivo?: string | null;
  }) {
    if (!solicitud) return;
    await getAuditoriaRepository().registrar({
      solicitudId: solicitud.id,
      codigoSeguimiento: solicitud.codigoSeguimiento,
      accion: opts.accion,
      actorTipo: actorTipo(),
      actorId: actorId(),
      estadoAnterior: opts.estadoAnterior ?? null,
      estadoNuevo: opts.estadoNuevo ?? null,
      motivo: opts.motivo ?? null,
    });
    await cargarAuditoria(solicitud.id);
  }

  function formatFecha(iso: string | undefined | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function labelAccion(a: string): string {
    const map: Record<string, string> = {
      crear_solicitud: 'Creación',
      cambio_estado: 'Cambio de estado',
      actualizar_notas: 'Notas / mensaje',
      verificar: 'Verificación',
      cerrar: 'Cierre',
      cancelar: 'Cancelación',
    };
    return map[a] || a;
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
      void cargarAuditoria(res.id);
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
      void registrarAudit({
        accion: 'actualizar_notas',
        estadoAnterior: updated.estado,
        estadoNuevo: updated.estado,
        motivo: 'Actualización de notas internas y/o mensaje público',
      });
    });
  }

  async function marcarAtendido() {
    if (!solicitud || solicitud.estado !== 'pendiente') return;
    const prev = solicitud.estado;
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
      void registrarAudit({
        accion: 'cambio_estado',
        estadoAnterior: prev,
        estadoNuevo: 'sin_verificar',
        motivo: 'Marcado como atendido · pendiente de verificación',
      });
    });
  }

  async function confirmarVerificado() {
    if (!solicitud || solicitud.estado !== 'sin_verificar') return;
    if (!kycResultado) {
      actionError = 'Selecciona el resultado de la verificación KYC.';
      return;
    }
    if (kycResultado !== 'approved') {
      actionError =
        'Para marcar como Verificado el resultado KYC debe ser «Aprobada». Si no aprobó, anota el resultado y cancela o deja el estado actual.';
      return;
    }
    const prev = solicitud.estado;
    const canalLabel =
      canalVerificacion === 'didit'
        ? 'Didit (digital)'
        : canalVerificacion === 'asistida'
          ? 'Asistida (operador)'
          : canalVerificacion === 'documentos'
            ? 'Documentos'
            : 'Otro';
    const detalle = motivo.trim();
    const motivoAudit = [
      `KYC: ${KYC_RESULTADO_LABEL[kycResultado]}`,
      `Canal: ${canalLabel}`,
      detalle ? `Detalle: ${detalle}` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    await runAction(async () => {
      const note = [notas.trim(), `Verificación — ${motivoAudit}`].filter(Boolean).join('\n');
      const updated = await getSolicitudRepository().update(solicitud!.id, {
        estado: 'verificado',
        kycResultado: 'approved',
        notasInternas: note || null,
        mensajePublico:
          mensajePublico.trim() ||
          'Identidad confirmada. El equipo continúa con la investigación del familiar.',
      });
      solicitud = updated;
      notas = updated.notasInternas ?? '';
      void registrarAudit({
        accion: 'verificar',
        estadoAnterior: prev,
        estadoNuevo: 'verificado',
        motivo: motivoAudit,
      });
    });
  }

  async function confirmarCierre() {
    if (!solicitud || solicitud.estado !== 'verificado') return;
    if (!motivo.trim()) {
      actionError = 'Describe el resultado final del expediente (cierre exitoso).';
      return;
    }
    const prev = solicitud.estado;
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
      void registrarAudit({
        accion: 'cerrar',
        estadoAnterior: prev,
        estadoNuevo: 'cerrado',
        motivo: motivo.trim(),
      });
    });
  }

  async function confirmarCancelacion() {
    if (!solicitud || esTerminal) return;
    if (!motivo.trim()) {
      actionError = 'El motivo de cancelación es obligatorio.';
      return;
    }
    const prev = solicitud.estado;
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
      void registrarAudit({
        accion: 'cancelar',
        estadoAnterior: prev,
        estadoNuevo: 'cancelada',
        motivo: motivo.trim(),
      });
    });
  }

  function openModal(m: typeof modal) {
    actionError = '';
    motivo = '';
    kycResultado = 'approved';
    canalVerificacion = 'asistida';
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

    <div class="pipeline card" aria-label="Flujo de estados">
      {#if solicitud.estado === 'cancelada'}
        <p class="pipeline-cancel">Solicitud <strong>cancelada</strong> (fuera del flujo de cierre exitoso).</p>
      {:else}
        <ol class="pipeline-steps">
          {#each PIPELINE as est, i}
            <li class="pipe-step" class:done={step > i} class:current={step === i}>
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
      {#if solicitud.kycResultado}
        <p class="kyc-line">
          KYC registrado:
          <strong>{KYC_RESULTADO_LABEL[solicitud.kycResultado as KycResultado] ?? solicitud.kycResultado}</strong>
        </p>
      {/if}
    </div>

    <div class="card notes-card">
      <h3>Notas del operador</h3>
      <p class="hint-text">
        Detalles internos del caso. <strong>No se muestran</strong> en el seguimiento público.
      </p>
      <textarea
        id="notas-op"
        bind:value={notas}
        rows="5"
        placeholder="Ej.: Contactado por WhatsApp; documentación pendiente…"
        disabled={actionLoading}
      ></textarea>

      <label for="msg-pub" class="msg-label">Mensaje público (opcional)</label>
      <textarea
        id="msg-pub"
        bind:value={mensajePublico}
        rows="2"
        placeholder="Nota breve visible al consultar el código…"
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
          <strong>Cerrado</strong>. <strong>Cancelada</strong> interrumpe el proceso.
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
            Estado terminal de <strong>éxito</strong>. Puedes seguir editando notas.
          {:else}
            Estado terminal: <strong>cancelada</strong>. Las notas quedan para auditoría.
          {/if}
        </p>
      </div>
    {/if}

    <div class="card audit-card">
      <div class="audit-head">
        <h3>Auditoría del expediente</h3>
        <button
          type="button"
          class="btn-ghost-sm"
          disabled={auditoriaLoading}
          onclick={() => {
            if (solicitud) void cargarAuditoria(solicitud.id);
          }}
        >
          {auditoriaLoading ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>
      <p class="hint-text">Registro de cambios de estado, verificación, cierre y notas (solo backoffice).</p>

      {#if auditoriaError}
        <div class="error-banner">{auditoriaError}</div>
      {/if}

      {#if auditoriaLoading && auditoria.length === 0}
        <LoadingHint message="Cargando historial de auditoría…" compact />
      {:else if auditoria.length === 0}
        <p class="empty-audit">Aún no hay eventos registrados para este expediente.</p>
      {:else}
        <ol class="audit-list">
          {#each auditoria as ev}
            <li class="audit-item">
              <div class="audit-meta">
                <span class="audit-accion">{labelAccion(ev.accion)}</span>
                <time datetime={ev.fecha}>{formatFecha(ev.fecha)}</time>
              </div>
              <div class="audit-body">
                {#if ev.estadoAnterior || ev.estadoNuevo}
                  <p class="audit-estados">
                    {#if ev.estadoAnterior}
                      <span class="badge badge-progress">{ESTADO_LABEL[ev.estadoAnterior]}</span>
                      <span class="arrow">→</span>
                    {/if}
                    {#if ev.estadoNuevo}
                      <span class={badgeFor(ev.estadoNuevo)}>{ESTADO_LABEL[ev.estadoNuevo]}</span>
                    {/if}
                  </p>
                {/if}
                {#if ev.motivo}
                  <p class="audit-motivo">{ev.motivo}</p>
                {/if}
                <p class="audit-actor">
                  {ev.actorTipo}: <code>{ev.actorId}</code>
                </p>
              </div>
            </li>
          {/each}
        </ol>
      {/if}
    </div>
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
        <p class="hint-text">
          El resultado KYC debe ser uno de los valores del enum de Appwrite. Solo con
          <strong>Aprobada</strong> se cambia el estado a Verificado.
        </p>
        <label class="field-label">
          Resultado KYC
          <select bind:value={kycResultado} disabled={actionLoading}>
            {#each KYC_RESULTADO_OPTIONS as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </label>
        <label class="field-label">
          Canal de verificación
          <select bind:value={canalVerificacion} disabled={actionLoading}>
            <option value="didit">Didit (digital)</option>
            <option value="asistida">Asistida (operador / baja conectividad)</option>
            <option value="documentos">Documentos revisados</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label class="field-label">
          Detalle opcional (notas / auditoría)
          <textarea
            bind:value={motivo}
            rows="2"
            placeholder="Ej.: videollamada el 9/9, carnet revisado…"
            disabled={actionLoading}
          ></textarea>
        </label>
      {:else if modal === 'cerrar'}
        <h2>Cerrar expediente (completado)</h2>
        <p class="hint-text">Solo cuando el proceso terminó <strong>correctamente</strong>.</p>
        <label class="field-label">Resultado final<textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea></label>
      {:else if modal === 'cancelar'}
        <h2>Cancelar solicitud</h2>
        <p class="hint-text">No es un cierre exitoso.</p>
        <label class="field-label">Motivo de cancelación<textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea></label>
      {/if}
      {#if actionError}<div class="error-banner">{actionError}</div>{/if}
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" disabled={actionLoading} onclick={() => (modal = 'none')}>Volver</button>
        {#if modal === 'verificar'}
          <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={confirmarVerificado}>Confirmar verificado</button>
        {:else if modal === 'cerrar'}
          <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={confirmarCierre}>Confirmar cierre</button>
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
    margin: 0 auto;
    padding: 1.5rem var(--page-pad-x, 1rem) 3rem;
  }
  .back-btn {
    margin-bottom: 1rem;
  }
  .load-panel {
    padding: 1.5rem;
  }
  .skel-header {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  .detalle-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    margin-bottom: 1.25rem;
  }
  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .codigo-h {
    font-family: var(--font-mono);
    font-size: clamp(1.1rem, 3vw, 1.5rem);
  }
  .estado-desc {
    margin: 0.35rem 0 0;
    color: var(--text-muted);
    font-size: 0.92rem;
  }
  .pipeline {
    margin-bottom: 1.25rem;
    padding: 1rem 1.25rem;
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
    opacity: 0.55;
  }
  .pipe-step.done,
  .pipe-step.current {
    opacity: 1;
  }
  .pipe-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--border);
    display: grid;
    place-items: center;
    font-size: 0.75rem;
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
    font-size: 0.75rem;
  }
  .pipeline-cancel {
    margin: 0;
    color: var(--color-alert);
  }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .info-card dl {
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
  .kyc-line {
    margin: 0.75rem 0 0;
    font-size: 0.9rem;
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
    flex-wrap: wrap;
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
  .audit-card {
    margin-top: 0.5rem;
    margin-bottom: 2rem;
  }
  .audit-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }
  .btn-ghost-sm {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 0.8rem;
    padding: 0.35rem 0.65rem;
    border-radius: var(--radius);
    cursor: pointer;
  }
  .empty-audit {
    margin: 0.75rem 0 0;
    color: var(--text-muted);
    font-size: 0.9rem;
  }
  .audit-list {
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .audit-item {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.85rem 1rem;
    background: var(--surface-muted);
  }
  .audit-meta {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.35rem;
  }
  .audit-accion {
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--gold);
  }
  .audit-meta time {
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .audit-estados {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin: 0.25rem 0;
  }
  .arrow {
    color: var(--text-muted);
  }
  .audit-motivo {
    margin: 0.35rem 0;
    font-size: 0.9rem;
  }
  .audit-actor {
    margin: 0;
    font-size: 0.78rem;
    color: var(--text-muted);
  }
  .audit-actor code {
    font-size: 0.78rem;
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
  .field-label {
    display: block;
    margin-top: 0.75rem;
    font-size: 0.9rem;
    font-weight: 600;
  }
  .field-label select,
  .field-label textarea {
    margin-top: 0.35rem;
    width: 100%;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  @media (max-width: 640px) {
    .pipeline-steps {
      grid-template-columns: repeat(2, 1fr);
    }
    .detalle-header {
      flex-direction: column;
      padding: 1.25rem;
    }
  }
</style>
