<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { router, irAPublica } from '../../lib/stores/router';
  import { ApiError } from '../../lib/appwrite';
  import { getPublicConfig } from '../../lib/appwrite/client';
  import {
    getSolicitudRepository,
    getAuditoriaRepository,
    hitosSinteticos,
    type HitoPublico,
  } from '../../lib/data/repositories';
  import type { EstadoSolicitud, SeguimientoPublico } from '../../lib/types';

  let codigoInput = $state('');
  let cargando = $state(false);
  let errorMsg = $state('');
  let data = $state<SeguimientoPublico | null>(null);
  let ultimoConsultado = $state('');
  let copiado = $state(false);
  let enlaceCopiado = $state(false);
  let hitos = $state<HitoPublico[]>([]);

  const etiquetasEstado: Record<EstadoSolicitud, string> = {
    pendiente: 'Solicitud recibida',
    sin_verificar: 'Atendido · pendiente de verificación',
    verificado: 'Identidad verificada — investigación en curso',
    cerrado: 'Expediente cerrado',
    cancelada: 'Solicitud cancelada',
  };

  const descripcionesEstado: Record<EstadoSolicitud, string> = {
    pendiente:
      'Tu solicitud de averiguación sobre el familiar ya está registrada. Un operador la revisará en breve.',
    sin_verificar:
      'El equipo ya está atendiendo el caso. Para continuar, confirma tu identidad (verificación digital o asistida).',
    verificado:
      'Tu identidad quedó confirmada. El equipo avanza con la investigación documental. Si corresponde, se orientará sobre la prima.',
    cerrado:
      'Este expediente fue cerrado. Si el equipo dejó una nota, la verás abajo.',
    cancelada:
      'Esta solicitud fue cancelada. Si crees que es un error, contacta al equipo con tu código.',
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

  function formatFecha(iso: string | undefined | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function trackingUrl(codigo: string): string {
    const base =
      getPublicConfig().publicAppUrl ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base.replace(/\/$/, '')}/seguimiento/${encodeURIComponent(codigo)}`;
  }

  async function cargarHitos(seg: SeguimientoPublico) {
    const fromDb = await getAuditoriaRepository().listHitosPublicos(seg.codigoSeguimiento);
    if (fromDb.length > 0) {
      hitos = fromDb;
      return;
    }
    hitos = hitosSinteticos({
      codigo: seg.codigoSeguimiento,
      estado: seg.estado,
      fechaCreacion: seg.fechaCreacion,
      fechaActualizacion: seg.fechaActualizacion,
    });
  }

  async function consultar(codigo: string, syncUrl = false) {
    const c = codigo.trim().toUpperCase();
    if (!c) {
      errorMsg = 'Introduce el código de seguimiento que recibiste al registrar la solicitud.';
      return;
    }

    errorMsg = '';
    data = null;
    hitos = [];
    cargando = true;
    try {
      const normalized = await getSolicitudRepository().getByCode(c);
      data = normalized;
      ultimoConsultado = normalized.codigoSeguimiento;
      codigoInput = normalized.codigoSeguimiento;
      await cargarHitos(normalized);
      if (syncUrl && get(router).codigoSeguimiento !== normalized.codigoSeguimiento) {
        irAPublica('seguimiento', normalized.codigoSeguimiento);
      }
    } catch (err) {
      ultimoConsultado = '';
      if (err instanceof ApiError) {
        errorMsg =
          err.code === 'NOT_FOUND'
            ? 'No encontramos ningún expediente con ese código. Revisa que esté completo (sin espacios).'
            : err.message;
      } else {
        errorMsg = 'No pudimos consultar el seguimiento ahora. Inténtalo de nuevo en unos minutos.';
      }
    } finally {
      cargando = false;
    }
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    void consultar(codigoInput, true);
  }

  function refrescar() {
    if (ultimoConsultado) void consultar(ultimoConsultado, false);
    else if (codigoInput.trim()) void consultar(codigoInput, true);
  }

  async function copiarCodigo() {
    if (!data?.codigoSeguimiento) return;
    try {
      await navigator.clipboard.writeText(data.codigoSeguimiento);
      copiado = true;
      setTimeout(() => {
        copiado = false;
      }, 2000);
    } catch {
      /* ignore */
    }
  }

  async function copiarEnlace() {
    if (!data?.codigoSeguimiento) return;
    try {
      await navigator.clipboard.writeText(trackingUrl(data.codigoSeguimiento));
      enlaceCopiado = true;
      setTimeout(() => {
        enlaceCopiado = false;
      }, 2000);
    } catch {
      /* ignore */
    }
  }

  function imprimirEstado() {
    if (typeof window !== 'undefined') window.print();
  }

  onMount(() => {
    const codigo = get(router).codigoSeguimiento;
    if (codigo) {
      codigoInput = codigo;
      void consultar(codigo, false);
    }
  });
</script>

<div class="page-header no-print">
  <div class="header-container">
    <span class="eyebrow">Consulta de expediente</span>
    <h1 class="serif-title">Seguimiento confidencial</h1>
    <p class="header-desc">
      Introduce el código que recibiste al registrar tu solicitud — no necesitas crear una cuenta.
    </p>

    <form class="search-card card animate-fade-in" onsubmit={onSubmit}>
      <div class="input-wrapper">
        <input
          type="text"
          bind:value={codigoInput}
          placeholder="Ej. HUE-2026-…"
          autocomplete="off"
          spellcheck="false"
          disabled={cargando}
          aria-label="Código de seguimiento"
        />
      </div>
      <button type="submit" class="btn btn-gold" disabled={cargando}>
        {cargando ? 'Consultando…' : 'Consultar'}
      </button>
    </form>
  </div>
</div>

<section class="results-container">
  {#if errorMsg}
    <div class="error-banner card no-print" role="alert">{errorMsg}</div>
  {/if}

  {#if cargando && !data}
    <div class="skeleton-card card no-print" aria-busy="true">
      <div class="sk-line sk-w40"></div>
      <div class="sk-line sk-w70"></div>
      <p class="sk-hint">Consultando en Appwrite…</p>
    </div>
  {/if}

  {#if data}
    {@const currentStep = getStepIndex(data.estado)}

    <article class="expediente-card glass-panel print-sheet" aria-live="polite">
      <div class="print-brand">
        <strong>Huella</strong> · Comprobante de seguimiento
      </div>

      <div class="expediente-header">
        <div>
          <span class="expediente-label">Expediente</span>
          <div class="codigo-row">
            <h2 class="codigo-title">{data.codigoSeguimiento}</h2>
            <button type="button" class="btn-ghost-sm no-print" onclick={copiarCodigo}>
              {copiado ? 'Copiado' : 'Copiar código'}
            </button>
          </div>
        </div>
        <div class="header-actions no-print">
          <button type="button" class="btn-ghost-sm" onclick={copiarEnlace}>
            {enlaceCopiado ? 'Enlace copiado' : 'Copiar enlace'}
          </button>
          <button type="button" class="btn-ghost-sm" onclick={imprimirEstado}>Imprimir / PDF</button>
          <button type="button" class="btn-ghost-sm" onclick={refrescar} disabled={cargando}>
            {cargando ? 'Actualizando…' : 'Actualizar'}
          </button>
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
        <div class="timeline-wrapper no-print">
          <div class="timeline-track">
            <div class="step-item" class:completed={currentStep >= 1} class:active={currentStep === 1}>
              <div class="step-circle">{currentStep > 1 ? '✓' : '1'}</div>
              <span class="step-name">Recibida</span>
            </div>
            <div class="step-item" class:completed={currentStep >= 2} class:active={currentStep === 2}>
              <div class="step-circle">{currentStep > 2 ? '✓' : '2'}</div>
              <span class="step-name">Atención</span>
            </div>
            <div class="step-item" class:completed={currentStep >= 3} class:active={currentStep === 3}>
              <div class="step-circle">{currentStep > 3 ? '✓' : '3'}</div>
              <span class="step-name">Investigación</span>
            </div>
            <div class="step-item" class:completed={currentStep === 4} class:active={currentStep === 4}>
              <div class="step-circle">{currentStep === 4 ? '✓' : '4'}</div>
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

      {#if hitos.length > 0}
        <div class="hitos-block">
          <h3 class="hitos-title">Historial del expediente</h3>
          <ol class="hitos-list">
            {#each hitos as h}
              <li class="hito-item">
                <div class="hito-dot" aria-hidden="true"></div>
                <div class="hito-content">
                  <div class="hito-head">
                    <strong>{h.titulo}</strong>
                    <time datetime={h.fecha}>{formatFecha(h.fecha)}</time>
                  </div>
                  <p>{h.descripcion}</p>
                </div>
              </li>
            {/each}
          </ol>
        </div>
      {/if}

      {#if data.estado === 'sin_verificar'}
        <div class="verify-panel no-print">
          <h3>Verificación de identidad</h3>
          <p class="verify-intro">
            Paso de seguridad antes de profundizar en la investigación.
          </p>
          {#if data.verificationUrl}
            <a
              class="btn btn-gold verify-btn"
              href={data.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verificar identidad ahora
            </a>
          {:else}
            <p class="verify-pending">
              El enlace digital aún no está disponible. El equipo puede enviártelo o atenderte de forma asistida.
            </p>
          {/if}
          {#if data.operatorContact}
            <div class="operator-card">
              <span class="box-title">Verificación asistida</span>
              {#if data.operatorContact.note}<p>{data.operatorContact.note}</p>{/if}
              {#if data.operatorContact.email}
                <p>
                  <strong>Email:</strong>
                  <a href="mailto:{data.operatorContact.email}?subject=Verificación%20{data.codigoSeguimiento}"
                    >{data.operatorContact.email}</a
                  >
                </p>
              {/if}
              {#if data.operatorContact.phone}
                <p>
                  <strong>Teléfono:</strong>
                  <a href="tel:{data.operatorContact.phone}">{data.operatorContact.phone}</a>
                </p>
              {/if}
            </div>
          {/if}
        </div>
      {/if}

      <div class="expediente-footer">
        <div class="date-item">
          <span class="date-label">Apertura</span>
          <span class="date-val">{formatFecha(data.fechaCreacion)}</span>
        </div>
        <div class="date-item">
          <span class="date-label">Última actualización</span>
          <span class="date-val">{formatFecha(data.fechaActualizacion)}</span>
        </div>
      </div>

      <p class="print-footnote">
        Documento orientativo de Huella. No sustituye documentación oficial. Generado el
        {formatFecha(new Date().toISOString())}.
      </p>
    </article>
  {/if}
</section>

<style>
  .page-header {
    background: var(--color-obsidian-navy);
    color: #ffffff;
    padding: 3rem var(--page-pad-x, 1rem) 4rem;
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
    line-height: 1.55;
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
    min-width: 0;
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
    padding: 0 var(--page-pad-x, 1rem);
  }
  .error-banner {
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert);
    margin-bottom: 1rem;
  }
  .skeleton-card {
    padding: 2rem;
  }
  .sk-line {
    height: 0.85rem;
    border-radius: 4px;
    background: var(--border);
    margin-bottom: 0.75rem;
  }
  .sk-w40 {
    width: 40%;
  }
  .sk-w70 {
    width: 70%;
  }
  .sk-hint {
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .expediente-card {
    padding: 2rem;
    background: var(--surface);
  }
  .print-brand {
    display: none;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #333;
  }
  .expediente-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.75rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--border);
  }
  .expediente-label {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .codigo-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .codigo-title {
    font-family: var(--font-mono);
    font-size: clamp(1.15rem, 4vw, 1.6rem);
    margin: 0.25rem 0 0;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .btn-ghost-sm {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 0.8rem;
    padding: 0.4rem 0.7rem;
    border-radius: var(--radius);
    cursor: pointer;
    min-height: 36px;
  }
  .btn-ghost-sm:hover:not(:disabled) {
    border-color: var(--gold);
    color: var(--gold);
  }
  .timeline-track {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.75rem;
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
    font-size: 0.9rem;
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
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }
  .status-desc {
    margin: 0;
    line-height: 1.55;
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
  .hitos-block {
    margin-bottom: 1.5rem;
  }
  .hitos-title {
    margin: 0 0 0.85rem;
    font-size: 1rem;
  }
  .hitos-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 2px solid var(--color-border-gold);
  }
  .hito-item {
    display: flex;
    gap: 0.85rem;
    padding: 0 0 1rem 0;
    position: relative;
  }
  .hito-dot {
    position: absolute;
    left: -6px;
    top: 0.35rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--gold);
    border: 2px solid var(--surface);
  }
  .hito-content {
    margin-left: 1rem;
    flex: 1;
  }
  .hito-head {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.25rem;
  }
  .hito-head time {
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .hito-content p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text);
  }
  .verify-panel {
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border-gold);
    border-radius: var(--radius);
    background: rgba(198, 164, 106, 0.06);
  }
  .verify-intro,
  .verify-pending {
    margin: 0 0 0.75rem;
    font-size: 0.95rem;
  }
  .operator-card {
    margin-top: 0.75rem;
    padding-top: 0.85rem;
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
    flex-wrap: wrap;
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
  .print-footnote {
    display: none;
    margin-top: 1.5rem;
    font-size: 0.75rem;
    color: #666;
  }

  @media (max-width: 560px) {
    .search-card {
      flex-direction: column;
      align-items: stretch;
    }
    .timeline-track {
      gap: 0.35rem;
    }
    .step-name {
      font-size: 0.7rem;
    }
    .expediente-card {
      padding: 1.25rem;
    }
  }

  @media print {
    :global(body) {
      background: #fff !important;
      color: #111 !important;
    }
    .no-print {
      display: none !important;
    }
    .print-brand,
    .print-footnote {
      display: block !important;
    }
    .results-container {
      margin: 0;
      max-width: none;
      padding: 0;
    }
    .print-sheet {
      box-shadow: none !important;
      border: 1px solid #ccc !important;
      background: #fff !important;
      color: #111 !important;
      backdrop-filter: none !important;
    }
    .status-details {
      background: #f5f5f5 !important;
    }
    .hito-dot {
      background: #333 !important;
    }
  }
</style>
