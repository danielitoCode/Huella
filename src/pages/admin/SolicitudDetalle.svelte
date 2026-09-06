<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { router, irAAdmin } from '../../lib/stores/router';
  import { executeApi, ApiError } from '../../lib/appwrite';
  import type { EstadoSolicitud } from '../../lib/types';

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

  type MarcarResult = { estado: string; sessionId: string; verificationUrl: string };
  type CerrarResult = { estado: string };

  const estadoLabel: Record<string, string> = {
    pendiente: 'Pendiente',
    sin_verificar: 'Sin Verificar',
    verificado: 'Verificado',
    cerrado: 'Cerrado',
  };

  let solicitud = $state<SolicitudDetalle | null>(null);
  let cargando = $state(true);
  let errorMsg = $state('');

  // KYC
  let kycCargando = $state(false);
  let kycError = $state('');
  let kycUrl = $state('');
  let notasKyc = $state('');

  // Cerrar
  let modalCerrar = $state(false);
  let motivoCierre = $state('');
  let cerrando = $state(false);
  let cerrarError = $state('');

  const solicitudId = $derived(get(router).solicitudId ?? '');

  onMount(async () => {
    if (!solicitudId) {
      errorMsg = 'ID de solicitud no especificado.';
      cargando = false;
      return;
    }
    try {
      const res = await executeApi<SolicitudDetalle>('solicitudes.getById', { solicitudId });
      solicitud = res;
      notasKyc = solicitud.notasInternas ?? '';
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'No se pudo cargar la solicitud.';
    } finally {
      cargando = false;
    }
  });

  async function iniciarKyc() {
    if (!solicitud) return;
    kycError = '';
    kycCargando = true;
    try {
      const res = await executeApi<MarcarResult>('solicitudes.marcarSinVerificar', {
        solicitudId: solicitud.id,
        notasInternas: notasKyc || undefined,
      });
      kycUrl = res.verificationUrl;
      solicitud = { ...solicitud, estado: res.estado as EstadoSolicitud, diditSessionId: res.sessionId };
    } catch (err) {
      kycError = err instanceof ApiError ? err.message : 'Error al iniciar KYC.';
    } finally {
      kycCargando = false;
    }
  }

  async function confirmarCierre() {
    if (!solicitud || !motivoCierre.trim()) {
      cerrarError = 'El motivo de cierre es obligatorio.';
      return;
    }
    cerrarError = '';
    cerrando = true;
    try {
      await executeApi<CerrarResult>('solicitudes.cerrar', {
        solicitudId: solicitud.id,
        motivoInterno: motivoCierre.trim(),
      });
      solicitud = { ...solicitud, estado: 'cerrado' };
      modalCerrar = false;
      motivoCierre = '';
    } catch (err) {
      cerrarError = err instanceof ApiError ? err.message : 'Error al cerrar la solicitud.';
    } finally {
      cerrando = false;
    }
  }
</script>

<div class="detalle-wrap">
  <button class="btn btn-secondary back-btn" onclick={() => irAAdmin('solicitudes')}>
    ← Volver a Solicitudes
  </button>

  {#if cargando}
    <div class="card loading-card">Cargando expediente...</div>
  {:else if errorMsg}
    <div class="error-banner" role="alert">{errorMsg}</div>
  {:else if solicitud}
    <!-- CABECERA -->
    <div class="detalle-header glass-panel animate-fade-in">
      <div>
        <span class="eyebrow">Expediente Oficial</span>
        <h1 class="serif-title">
          <code class="codigo-h">{solicitud.codigoSeguimiento}</code>
        </h1>
      </div>
      <div>
        {#if solicitud.estado === 'verificado'}
          <span class="badge badge-positive">✓ Verificado</span>
        {:else if solicitud.estado === 'sin_verificar'}
          <span class="badge badge-progress">⚡ Sin Verificar (KYC)</span>
        {:else if solicitud.estado === 'cerrado'}
          <span class="badge">Cerrado</span>
        {:else}
          <span class="badge badge-progress">Pendiente</span>
        {/if}
      </div>
    </div>

    <!-- GRID INFORMACIÓN -->
    <div class="info-grid animate-fade-in">
      <!-- Datos Familiar -->
      <div class="card info-card">
        <h3>Familiar Solicitante</h3>
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

      <!-- Datos Persona Buscada -->
      <div class="card info-card">
        <h3>Persona a Localizar</h3>
        <dl>
          <dt>Nombre</dt>
          <dd><strong>{solicitud.nombrePersona}</strong></dd>
          <dt>Relación</dt>
          <dd>{solicitud.relacion}</dd>
        </dl>
      </div>
    </div>

    <!-- Descripción del Caso -->
    <div class="card block-card animate-fade-in">
      <h3>Detalles y Contexto Proporcionado</h3>
      <p class="descripcion">{solicitud.descripcion}</p>
    </div>

    <!-- Metadatos y Fechas -->
    <div class="card dates-card animate-fade-in">
      <div>
        <span class="date-label">Fecha Registro</span>
        <span class="date-val">
          {new Date(solicitud.fechaCreacion).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      </div>
      <div>
        <span class="date-label">Última Actualización</span>
        <span class="date-val">
          {new Date(solicitud.fechaActualizacion).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      </div>
    </div>

    <!-- GESTIÓN KYC E INTERNA -->
    {#if solicitud.estado !== 'cerrado'}
      <div class="card action-card animate-fade-in">
        <h3>Gestión Operativa y Verificación KYC</h3>

        {#if solicitud.notasInternas}
          <div class="notas-box">
            <span class="notas-title">Notas Internas Actuales:</span>
            <pre>{solicitud.notasInternas}</pre>
          </div>
        {/if}

        {#if solicitud.estado === 'pendiente'}
          <p class="hint-text">
            Al confirmar contacto inicial, activa la verificación de identidad (Didit KYC). Se generará una sesión Didit y se enviará notificación por correo.
          </p>
          
          <label for="notas-kyc">Notas Internas Adicionales (Privado):</label>
          <textarea
            id="notas-kyc"
            bind:value={notasKyc}
            rows="3"
            placeholder="Añade observaciones de la verificación..."
            disabled={kycCargando}
          ></textarea>

          {#if kycError}
            <div class="error-banner" role="alert">{kycError}</div>
          {/if}

          <button class="btn btn-gold" onclick={iniciarKyc} disabled={kycCargando}>
            {kycCargando ? 'Iniciando KYC...' : '🔐 Activar Verificación KYC Didit'}
          </button>
        {/if}

        {#if solicitud.estado === 'sin_verificar'}
          <div class="kyc-active-box">
            <span class="badge badge-progress">Sesión KYC Activa</span>
            <p>El familiar ha recibido las instrucciones de verificación por correo.</p>
            {#if solicitud.diditSessionId}
              <p class="session-code">Session ID: <code>{solicitud.diditSessionId}</code></p>
            {/if}
            {#if kycUrl}
              <a href={kycUrl} target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
                Enlace Directo Didit ↗
              </a>
            {/if}
          </div>
        {/if}

        {#if solicitud.estado === 'verificado'}
          <div class="kyc-verified-box">
            <span class="badge badge-positive">✓ Identidad Verificada</span>
            <p>
              Didit KYC completado exitosamente.
              {#if solicitud.kycResultado}
                Resultado: <strong>{solicitud.kycResultado}</strong>
              {/if}
            </p>
          </div>
        {/if}

        <div class="cierre-action">
          <button class="btn btn-danger" onclick={() => { modalCerrar = true; cerrarError = ''; }}>
            Cerrar Expediente
          </button>
        </div>
      </div>
    {:else}
      <div class="card block-card cerrado-card animate-fade-in">
        <span class="badge">Expediente Cerrado</span>
        {#if solicitud.notasInternas}
          <pre class="notas-pre">{solicitud.notasInternas}</pre>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<!-- MODAL CIERRE -->
{#if modalCerrar}
  <div
    class="modal-backdrop"
    role="presentation"
    onclick={() => (modalCerrar = false)}
    onkeydown={(e) => { if (e.key === 'Escape') modalCerrar = false; }}
  >
    <div
      class="modal card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <h2 id="modal-title" class="serif-title">Cerrar Expediente</h2>
      <p>Esta acción archivará definitivamente la solicitud.</p>

      <label for="motivo-cierre">
        Motivo Obligatorio de Cierre:
        <textarea
          id="motivo-cierre"
          bind:value={motivoCierre}
          rows="3"
          placeholder="Justificación del cierre del caso..."
          disabled={cerrando}
        ></textarea>
      </label>

      {#if cerrarError}
        <div class="error-banner">{cerrarError}</div>
      {/if}

      <div class="modal-actions">
        <button class="btn btn-secondary" onclick={() => (modalCerrar = false)} disabled={cerrando}>
          Cancelar
        </button>
        <button class="btn btn-danger" onclick={confirmarCierre} disabled={cerrando}>
          {cerrando ? 'Cerrando...' : 'Confirmar Cierre'}
        </button>
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
    padding: 1.75rem 2rem;
    margin-bottom: 1.5rem;
    background: var(--color-obsidian-navy);
    color: #ffffff;
    border: 1px solid var(--color-border-gold);
  }

  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.2rem;
  }

  .codigo-h {
    font-family: var(--font-mono);
    font-size: 1.6rem;
    color: #ffffff;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .info-card h3, .block-card h3, .action-card h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.6rem 1.2rem;
    margin: 0;
  }

  dt {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  dd {
    margin: 0;
    font-size: 0.95rem;
  }

  .descripcion {
    font-size: 0.98rem;
    line-height: 1.65;
    margin: 0;
    white-space: pre-wrap;
  }

  .dates-card {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 1.25rem;
    padding: 1.25rem 1.75rem;
  }

  .date-label {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    display: block;
  }

  .date-val {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text-h);
  }

  .action-card {
    margin-bottom: 1.25rem;
  }

  .hint-text {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
  }

  .notas-box {
    background: var(--surface-muted);
    padding: 1rem;
    border-radius: var(--radius);
    margin-bottom: 1.25rem;
  }

  .notas-title {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.4rem;
  }

  .notas-box pre {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    margin: 0;
    white-space: pre-wrap;
  }

  .kyc-active-box {
    background: rgba(212, 175, 55, 0.08);
    border: 1px solid var(--color-border-gold);
    padding: 1.25rem;
    border-radius: var(--radius);
    margin-bottom: 1rem;
  }

  .kyc-verified-box {
    background: rgba(42, 157, 143, 0.08);
    border: 1px solid rgba(42, 157, 143, 0.3);
    padding: 1.25rem;
    border-radius: var(--radius);
    margin-bottom: 1rem;
  }

  .cierre-action {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    text-align: right;
  }

  .modal {
    max-width: 480px;
    width: 100%;
    background: var(--surface);
    padding: 2rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  .error-banner {
    padding: 0.85rem 1rem;
    border-radius: var(--radius);
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert);
    font-size: 0.88rem;
    margin-bottom: 1rem;
  }

  .loading-card {
    text-align: center;
    padding: 3rem;
    color: var(--text-muted);
  }
</style>
