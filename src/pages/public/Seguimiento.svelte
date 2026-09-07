<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { router, irAPublica } from '../../lib/stores/router';
  import { executeApi, ApiError } from '../../lib/appwrite';
  import type { EstadoSolicitud, SeguimientoPublico } from '../../lib/types';

  let codigoInput = $state('');
  let cargando = $state(false);
  let errorMsg = $state('');
  let data = $state<SeguimientoPublico | null>(null);
  let ultimoConsultado = $state('');

  const etiquetasEstado: Record<EstadoSolicitud, string> = {
    pendiente: 'Solicitud recibida',
    sin_verificar: 'Atendido · sin verificar',
    verificado: 'Identidad verificada — en investigación',
    cerrado: 'Expediente cerrado',
    cancelada: 'Solicitud cancelada',
  };

  const descripcionesEstado: Record<EstadoSolicitud, string> = {
    pendiente:
      'El expediente ha sido registrado correctamente en la plataforma y está pendiente de atención.',
    sin_verificar:
      'Un operador está atendiendo el caso. La identidad del solicitante aún no está confirmada.',
    verificado:
      'La identidad del solicitante ha sido confirmada. El equipo continúa con la investigación documental.',
    cerrado: 'El expediente ha sido archivado o finalizado por el operador asignado.',
    cancelada: 'Esta solicitud fue cancelada. Si crees que se trata de un error, contacta al equipo.',
  };

  function getStepIndex(estado: EstadoSolicitud): number {
    switch (estado) {
      case 'pendiente':
        return 1;
      case 'sin_verificar':
        return 2;
      case 'verificado':
        return 3;
      case 'cerrado':
        return 4;
      case 'cancelada':
        return 0;
      default:
        return 1;
    }
  }

  async function consultar(codigo: string, syncUrl = false) {
    const c = codigo.trim().toUpperCase();
    if (!c) {
      errorMsg = 'Por favor, introduce un código de seguimiento válido.';
      return;
    }
    if (c === ultimoConsultado && data) return;

    errorMsg = '';
    data = null;
    cargando = true;
    try {
      const res = await executeApi<SeguimientoPublico>('solicitudes.getByCode', { codigo: c });
      data = res;
      ultimoConsultado = res.codigoSeguimiento;
      codigoInput = res.codigoSeguimiento;
      if (syncUrl && get(router).codigoSeguimiento !== res.codigoSeguimiento) {
        irAPublica('seguimiento', res.codigoSeguimiento);
      }
    } catch (err) {
      ultimoConsultado = '';
      if (err instanceof ApiError) {
        errorMsg =
          err.code === 'NOT_FOUND'
            ? 'No se encontró ningún expediente registrado con ese código.'
            : err.message;
      } else {
        errorMsg = 'No pudimos consultar el seguimiento en este momento. Inténtalo más tarde.';
      }
    } finally {
      cargando = false;
    }
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    void consultar(codigoInput, true);
  }

  onMount(() => {
    const codigo = get(router).codigoSeguimiento;
    if (codigo) {
      codigoInput = codigo;
      void consultar(codigo, false);
    }
  });
</script>

<div class="page-header">
  <div class="header-container">
    <span class="eyebrow">Consulta de expediente</span>
    <h1 class="serif-title">Seguimiento confidencial</h1>
    <p class="header-desc">
      Introduce el código de seguimiento que recibiste al registrar tu solicitud para conocer el
      avance.
    </p>

    <form class="search-card card animate-fade-in" onsubmit={onSubmit}>
      <div class="input-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          bind:value={codigoInput}
          placeholder="Código ej. HUE-2026-XXXXXX"
          autocomplete="off"
          spellcheck="false"
          disabled={cargando}
        />
      </div>
      <button type="submit" class="btn btn-gold" disabled={cargando}>
        {cargando ? 'Consultando...' : 'Consultar estado'}
      </button>
    </form>
  </div>
</div>

<section class="results-container">
  {#if errorMsg}
    <div class="error-banner card animate-fade-in" role="alert">
      <span>{errorMsg}</span>
    </div>
  {/if}

  {#if data}
    {@const currentStep = getStepIndex(data.estado)}

    <article class="expediente-card glass-panel animate-fade-in" aria-live="polite">
      <div class="expediente-header">
        <div>
          <span class="expediente-label">Expediente</span>
          <h2 class="codigo-title">{data.codigoSeguimiento}</h2>
        </div>
        <div class="status-badge-wrap">
          {#if data.estado === 'verificado'}
            <span class="badge badge-positive">Verificado</span>
          {:else if data.estado === 'sin_verificar'}
            <span class="badge badge-progress">Atendido · sin verificar</span>
          {:else if data.estado === 'cerrado'}
            <span class="badge">Cerrado</span>
          {:else if data.estado === 'cancelada'}
            <span class="badge badge-error">Cancelada</span>
          {:else}
            <span class="badge badge-progress">Pendiente</span>
          {/if}
        </div>
      </div>

      {#if data.estado !== 'cancelada'}
        <div class="timeline-wrapper">
          <div class="timeline-track">
            <div class="step-item" class:completed={currentStep >= 1} class:active={currentStep === 1}>
              <div class="step-circle">1</div>
              <span class="step-name">Recibida</span>
            </div>
            <div class="step-item" class:completed={currentStep >= 2} class:active={currentStep === 2}>
              <div class="step-circle">2</div>
              <span class="step-name">Atención</span>
            </div>
            <div class="step-item" class:completed={currentStep >= 3} class:active={currentStep === 3}>
              <div class="step-circle">3</div>
              <span class="step-name">Investigación</span>
            </div>
            <div class="step-item" class:completed={currentStep === 4} class:active={currentStep === 4}>
              <div class="step-circle">4</div>
              <span class="step-name">Cierre</span>
            </div>
          </div>
        </div>
      {/if}

      <div class="status-details">
        <h3>{etiquetasEstado[data.estado]}</h3>
        <p class="status-desc">{descripcionesEstado[data.estado]}</p>

        {#if data.mensajePublico}
          <div class="mensaje-publico-box">
            <span class="box-title">Nota del equipo</span>
            <p>{data.mensajePublico}</p>
          </div>
        {/if}
      </div>

      <div class="expediente-footer">
        <div class="date-item">
          <span class="date-label">Fecha de apertura</span>
          <span class="date-val">
            {new Date(data.fechaCreacion).toLocaleString('es', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        </div>
        <div class="date-item">
          <span class="date-label">Última actualización</span>
          <span class="date-val">
            {new Date(data.fechaActualizacion).toLocaleString('es', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        </div>
      </div>
    </article>
  {/if}
</section>

<style>
  .page-header {
    background: var(--color-obsidian-navy);
    color: #ffffff;
    padding: 3.5rem 1.5rem 4.5rem;
    text-align: center;
    border-bottom: 1px solid var(--color-border-gold);
  }

  .header-container {
    max-width: 640px;
    margin: 0 auto;
  }

  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.5rem;
  }

  .header-desc {
    color: #a4b4c0;
    font-size: 1.05rem;
    margin: 0.5rem 0 2rem;
  }

  .search-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.6rem 0.6rem 1.25rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--color-border-gold);
    backdrop-filter: blur(16px);
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-grow: 1;
    color: var(--gold);
  }

  .input-wrapper input {
    background: transparent;
    border: none;
    color: #ffffff;
    font-family: var(--font-mono);
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 0.5rem 0;
    box-shadow: none !important;
    width: 100%;
  }

  .input-wrapper input::placeholder {
    font-family: var(--font-sans);
    font-weight: 400;
    color: rgba(255, 255, 255, 0.45);
  }

  .results-container {
    width: 100%;
    max-width: 840px;
    margin: 2.5rem auto 5rem;
    padding: 0 1.5rem;
    box-sizing: border-box;
    position: relative;
    z-index: 10;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert);
    font-weight: 500;
  }

  .expediente-card {
    padding: 2.5rem;
    background: var(--surface);
  }

  .expediente-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  .expediente-label {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.25rem;
  }

  .codigo-title {
    font-family: var(--font-mono);
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    margin: 0;
  }

  .timeline-wrapper {
    margin-bottom: 3rem;
  }

  .timeline-track {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    position: relative;
    gap: 1rem;
  }

  .timeline-track::before {
    content: '';
    position: absolute;
    top: 18px;
    left: 10%;
    right: 10%;
    height: 3px;
    background: var(--border);
    z-index: 1;
  }

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    z-index: 2;
  }

  .step-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-elevated);
    border: 2px solid var(--border);
    color: var(--text-muted);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
  }

  .step-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .step-item.completed .step-circle {
    background: var(--gold);
    border-color: var(--gold);
    color: #071927;
  }

  .step-item.completed .step-name {
    color: var(--text-h);
  }

  .step-item.active .step-circle {
    border-color: var(--positive);
    color: var(--positive);
    background: rgba(42, 157, 143, 0.15);
  }

  .status-details {
    background: var(--surface-muted);
    border-radius: var(--radius);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .status-details h3 {
    margin-bottom: 0.5rem;
  }

  .status-desc {
    color: var(--text);
    font-size: 0.95rem;
    margin: 0;
  }

  .mensaje-publico-box {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--border);
  }

  .box-title {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.3rem;
  }

  .expediente-footer {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
  }

  .date-label {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    display: block;
  }

  .date-val {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-h);
  }

  @media (max-width: 640px) {
    .search-card {
      flex-direction: column;
      align-items: stretch;
      padding: 1rem;
    }
    .timeline-track {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    .timeline-track::before {
      display: none;
    }
  }
</style>
