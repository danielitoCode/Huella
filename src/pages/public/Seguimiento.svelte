<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { router, irAPublica } from '../../lib/stores/router';
  import { ApiError } from '../../lib/appwrite';
  import { getHuellaRepository } from '../../lib/data/repositories';
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
      'El expediente ha sido registrado y está pendiente de atención.',
    sin_verificar:
      'Un operador está atendiendo el caso. Completa la verificación digital o contacta al equipo para una vía asistida.',
    verificado:
      'La identidad del solicitante ha sido confirmada. El equipo continúa con la investigación documental.',
    cerrado: 'El expediente ha sido archivado o finalizado.',
    cancelada: 'Esta solicitud fue cancelada. Si crees que es un error, contacta al equipo.',
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
      const res = await getHuellaRepository().request<SeguimientoPublico>('solicitudes.getByCode', { codigo: c });
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
      Introduce el código de seguimiento que recibiste al registrar tu solicitud.
    </p>

    <form class="search-card card animate-fade-in" onsubmit={onSubmit}>
      <div class="input-wrapper">
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
    <div class="error-banner card" role="alert">{errorMsg}</div>
  {/if}

  {#if data}
    {@const currentStep = getStepIndex(data.estado)}

    <article class="expediente-card glass-panel" aria-live="polite">
      <div class="expediente-header">
        <div>
          <span class="expediente-label">Expediente</span>
          <h2 class="codigo-title">{data.codigoSeguimiento}</h2>
        </div>
        <div>
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

      {#if data.estado === 'sin_verificar'}
        <div class="verify-panel">
          <h3>Verificación de identidad</h3>
          <p class="verify-intro">
            Para avanzar con tu expediente puedes usar la verificación digital (Didit) o, si no tienes
            buena conectividad, contactar al operador para una verificación asistida.
          </p>

          {#if data.verificationUrl}
            <a
              class="btn btn-gold verify-btn"
              href={data.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verificar identidad con Didit
            </a>
          {:else}
            <p class="verify-pending">
              El enlace Didit aún no está disponible. Usa el contacto del operador o espera el correo
              de verificación.
            </p>
          {/if}

          {#if data.operatorContact}
            <div class="operator-card">
              <span class="box-title">Verificación asistida (fuera de Didit)</span>
              <p>{data.operatorContact.note}</p>
              {#if data.operatorContact.name}
                <p><strong>Operador:</strong> {data.operatorContact.name}</p>
              {/if}
              {#if data.operatorContact.email}
                <p>
                  <strong>Email:</strong>
                  <a href="mailto:{data.operatorContact.email}">{data.operatorContact.email}</a>
                </p>
              {/if}
              {#if data.operatorContact.phone}
                <p><strong>Teléfono:</strong> {data.operatorContact.phone}</p>
              {/if}
            </div>
          {/if}
        </div>
      {/if}

      <div class="expediente-footer">
        <div class="date-item">
          <span class="date-label">Apertura</span>
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
    margin: 0.5rem 0 2rem;
  }
  .search-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--color-border-gold);
  }
  .input-wrapper {
    flex-grow: 1;
  }
  .input-wrapper input {
    width: 100%;
    background: transparent;
    border: none;
    color: #fff;
    font-family: var(--font-mono);
    font-size: 1.05rem;
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    box-shadow: none !important;
  }
  .results-container {
    max-width: 840px;
    margin: 2.5rem auto 5rem;
    padding: 0 1.5rem;
  }
  .error-banner {
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert);
    margin-bottom: 1rem;
  }
  .expediente-card {
    padding: 2.5rem;
    background: var(--surface);
  }
  .expediente-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
  }
  .expediente-label {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .codigo-title {
    font-family: var(--font-mono);
    font-size: 1.6rem;
    margin: 0.25rem 0 0;
  }
  .timeline-track {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .step-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid var(--border);
    display: grid;
    place-items: center;
    margin-bottom: 0.4rem;
    font-weight: 700;
  }
  .step-name {
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .step-item.completed .step-circle {
    background: var(--gold);
    border-color: var(--gold);
    color: #071927;
  }
  .step-item.active .step-circle {
    border-color: var(--positive);
    color: var(--positive);
  }
  .status-details {
    background: var(--surface-muted);
    border-radius: var(--radius);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .status-desc {
    margin: 0;
    color: var(--text);
  }
  .mensaje-publico-box {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--border);
  }
  .box-title {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.35rem;
  }
  .verify-panel {
    margin-bottom: 1.75rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border-gold);
    border-radius: var(--radius);
    background: rgba(198, 164, 106, 0.06);
  }
  .verify-panel h3 {
    margin: 0 0 0.5rem;
  }
  .verify-intro {
    margin: 0 0 1rem;
    color: var(--text);
    font-size: 0.95rem;
  }
  .verify-btn {
    display: inline-flex;
    margin-bottom: 1rem;
  }
  .verify-pending {
    color: var(--text-muted);
    font-size: 0.9rem;
  }
  .operator-card {
    margin-top: 0.75rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--border);
  }
  .operator-card p {
    margin: 0.35rem 0 0;
    font-size: 0.92rem;
  }
  .expediente-footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
  }
  .date-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    display: block;
  }
  .date-val {
    font-weight: 600;
    color: var(--text-h);
  }
</style>
