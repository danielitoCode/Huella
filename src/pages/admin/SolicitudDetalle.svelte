<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { router, irAAdmin } from '../../lib/stores/router';
  import { ApiError } from '../../lib/appwrite';
  import { getHuellaRepository, getSolicitudRepository } from '../../lib/data/repositories';
  import { ESTADO_LABEL, type EstadoSolicitud, type OperatorContact } from '../../lib/types';
  import Skeleton from '../../components/ui/Skeleton.svelte';
  import LoadingHint from '../../components/ui/LoadingHint.svelte';

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
    diditVerificationUrl?: string | null;
    kycResultado: string | null;
    fechaCreacion: string;
    fechaActualizacion: string;
    operatorContact?: OperatorContact;
  };

  type KycTemplateResult = {
    to: string;
    subject: string;
    verificationUrl: string;
    emailHtml: string;
  };

  let solicitud = $state<SolicitudDetalle | null>(null);
  let cargando = $state(true);
  let errorMsg = $state('');
  let actionError = $state('');
  let actionLoading = $state(false);

  let notas = $state('');
  let kycUrl = $state('');
  let emailHtml = $state('');
  let emailSubject = $state('');
  let copyOk = $state(false);
  let templateLoading = $state(false);

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
      const res = await getSolicitudRepository().getById(solicitudId);
      solicitud = res as SolicitudDetalle;
      notas = solicitud.notasInternas ?? '';
      if (solicitud.diditVerificationUrl) kycUrl = solicitud.diditVerificationUrl;
      if (solicitud.estado === 'sin_verificar' && solicitud.diditVerificationUrl) {
        void cargarPlantilla();
      }
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

  async function cargarPlantilla() {
    if (!solicitud) return;
    templateLoading = true;
    try {
      const res = await getHuellaRepository().request<KycTemplateResult>('solicitudes.getKycEmailTemplate', {
        solicitudId: solicitud.id,
      });
      emailHtml = res.emailHtml;
      emailSubject = res.subject;
      kycUrl = res.verificationUrl;
    } catch {
      // sin plantilla si aún no hay URL
    } finally {
      templateLoading = false;
    }
  }

  async function copiarHtml() {
    if (!emailHtml) return;
    try {
      await navigator.clipboard.writeText(emailHtml);
      copyOk = true;
      setTimeout(() => (copyOk = false), 2000);
    } catch {
      actionError = 'No se pudo copiar al portapapeles.';
    }
  }

  async function marcarAtendido(conKyc: boolean) {
    if (!solicitud) return;
    await runAction(async () => {
      const res = await getHuellaRepository().request<{
        estado: EstadoSolicitud;
        verificationUrl?: string;
        sessionId?: string;
        emailHtml?: string;
      }>(conKyc ? 'solicitudes.marcarSinVerificar' : 'solicitudes.marcarAtendido', {
        solicitudId: solicitud!.id,
        notasInternas: notas || undefined,
        iniciarKyc: conKyc,
      });
      solicitud = {
        ...solicitud!,
        estado: res.estado,
        diditSessionId: res.sessionId ?? solicitud!.diditSessionId,
        diditVerificationUrl: res.verificationUrl ?? solicitud!.diditVerificationUrl,
      };
      if (res.verificationUrl) kycUrl = res.verificationUrl;
      if (res.emailHtml) emailHtml = res.emailHtml;
      else if (conKyc) await cargarPlantilla();
    });
  }

  async function iniciarKyc() {
    if (!solicitud) return;
    await runAction(async () => {
      const res = await getHuellaRepository().request<{
        estado: EstadoSolicitud;
        verificationUrl?: string;
        sessionId?: string;
        emailHtml?: string;
      }>('solicitudes.iniciarKyc', {
        solicitudId: solicitud!.id,
        notasInternas: notas || undefined,
      });
      solicitud = {
        ...solicitud!,
        estado: res.estado,
        diditSessionId: res.sessionId ?? solicitud!.diditSessionId,
        diditVerificationUrl: res.verificationUrl ?? solicitud!.diditVerificationUrl,
      };
      if (res.verificationUrl) kycUrl = res.verificationUrl;
      if (res.emailHtml) emailHtml = res.emailHtml;
      else await cargarPlantilla();
    });
  }

  async function reenviarEmail() {
    if (!solicitud) return;
    await runAction(async () => {
      const res = await getHuellaRepository().request<{ emailHtml?: string; verificationUrl?: string }>(
        'solicitudes.reenviarKycEmail',
        { solicitudId: solicitud!.id },
      );
      if (res.emailHtml) emailHtml = res.emailHtml;
      if (res.verificationUrl) kycUrl = res.verificationUrl;
    });
  }

  async function confirmarVerificado() {
    if (!solicitud || !motivo.trim()) {
      actionError = 'El motivo de verificación manual es obligatorio.';
      return;
    }
    await runAction(async () => {
      const res = await getHuellaRepository().request<{ estado: EstadoSolicitud }>('solicitudes.marcarVerificado', {
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
      const res = await getHuellaRepository().request<{ estado: EstadoSolicitud }>('solicitudes.cerrar', {
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
      const res = await getHuellaRepository().request<{ estado: EstadoSolicitud }>('solicitudes.cancelar', {
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
          Flujo: pendiente → atendido (sin verificar) → verificado → cerrado. Cancelar exige PIN.
        </p>

        {#if actionError && modal === 'none'}
          <div class="error-banner" role="alert">{actionError}</div>
        {/if}

        {#if actionLoading}
          <LoadingHint message="Aplicando cambio en el servidor…" compact />
        {/if}

        <label for="notas-op">Notas (se anexan en la siguiente acción)</label>
        <textarea id="notas-op" bind:value={notas} rows="2" disabled={actionLoading}></textarea>

        <div class="actions-row">
          {#if solicitud.estado === 'pendiente'}
            <button type="button" class="btn btn-primary" disabled={actionLoading} onclick={() => marcarAtendido(false)}>
              Marcar atendido
            </button>
            <button type="button" class="btn btn-secondary" disabled={actionLoading} onclick={() => marcarAtendido(true)}>
              Atender + iniciar KYC Didit
            </button>
          {/if}

          {#if solicitud.estado === 'sin_verificar'}
            <button type="button" class="btn btn-secondary" disabled={actionLoading} onclick={() => iniciarKyc()}>
              Iniciar / regenerar KYC Didit
            </button>
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
      </div>

      {#if solicitud.estado === 'sin_verificar'}
        <div class="card template-card">
          <h3>Verificación — enlace y correo</h3>
          <p class="hint-text">
            1) Enlace Didit para el familiar · 2) Email automático (Resend) · 3) Plantilla HTML para
            copiar y pegar en tu cliente de correo si el envío automático no está disponible.
          </p>

          {#if kycUrl || solicitud.diditVerificationUrl}
            <p>
              <strong>Enlace Didit:</strong>
              <a href={kycUrl || solicitud.diditVerificationUrl || '#'} target="_blank" rel="noopener">
                {kycUrl || solicitud.diditVerificationUrl}
              </a>
            </p>
          {:else}
            <p class="hint-text">Aún no hay enlace. Usa «Iniciar / regenerar KYC Didit».</p>
          {/if}

          <div class="actions-row">
            <button
              type="button"
              class="btn btn-secondary"
              disabled={actionLoading || !solicitud.diditVerificationUrl && !kycUrl}
              onclick={() => reenviarEmail()}
            >
              Reenviar email KYC
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              disabled={templateLoading}
              onclick={() => cargarPlantilla()}
            >
              {templateLoading ? 'Cargando plantilla…' : 'Cargar plantilla HTML'}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              disabled={!emailHtml}
              onclick={() => copiarHtml()}
            >
              {copyOk ? '✓ Copiado' : 'Copiar HTML al portapapeles'}
            </button>
          </div>

          {#if emailSubject}
            <p class="subject-line"><strong>Asunto:</strong> {emailSubject}</p>
          {/if}

          {#if emailHtml}
            <label for="html-tpl">Plantilla HTML (copiar y pegar en el correo)</label>
            <textarea id="html-tpl" readonly rows="12" value={emailHtml}></textarea>
          {/if}

          {#if solicitud.operatorContact}
            <div class="operator-box">
              <span class="eyebrow-sm">Contacto verificación asistida</span>
              <p>{solicitud.operatorContact.note}</p>
              {#if solicitud.operatorContact.name}
                <p><strong>{solicitud.operatorContact.name}</strong></p>
              {/if}
              {#if solicitud.operatorContact.email}
                <p>{solicitud.operatorContact.email}</p>
              {/if}
              {#if solicitud.operatorContact.phone}
                <p>{solicitud.operatorContact.phone}</p>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="card block-card">
        <span class={badgeFor(solicitud.estado)}>{ESTADO_LABEL[solicitud.estado]}</span>
        <p class="hint-text">Estado terminal: no admite más cambios.</p>
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
        <h2>Cancelar</h2>
        <label>Motivo<textarea bind:value={motivo} rows="3" disabled={actionLoading}></textarea></label>
        <label>PIN<input type="password" inputmode="numeric" maxlength="4" bind:value={cancelPin} disabled={actionLoading} /></label>
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
  .eyebrow-sm {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.35rem;
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
  .descripcion,
  .notas-pre {
    white-space: pre-wrap;
    margin: 0;
  }
  .notas-pre {
    font-family: var(--font-mono);
    font-size: 0.85rem;
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
  .template-card {
    margin-top: 1.25rem;
  }
  .template-card textarea {
    width: 100%;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }
  .subject-line {
    margin: 1rem 0 0.5rem;
    font-size: 0.9rem;
  }
  .operator-box {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    font-size: 0.9rem;
  }
  .error-banner {
    padding: 0.85rem 1rem;
    border-radius: var(--radius);
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert, #b84c4c);
    margin: 0.75rem 0;
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
