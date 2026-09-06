<script lang="ts">
  import { onMount } from 'svelte';
  import { router, irAPublica } from '../../lib/stores/router';
  import { executeApi, ApiError } from '../../lib/appwrite';
  import type { EstadoSolicitud, SeguimientoPublico } from '../../lib/types';

  let codigoInput = $state('');
  let cargando = $state(false);
  let errorMsg = $state('');
  let data = $state<SeguimientoPublico | null>(null);

  const etiquetasEstado: Record<EstadoSolicitud, string> = {
    pendiente: 'Solicitud recibida',
    sin_verificar: 'Pendiente de verificación de identidad',
    verificado: 'Identidad verificada — en investigación',
    cerrado: 'Expediente cerrado',
  };

  function badgeClass(estado: EstadoSolicitud): string {
    if (estado === 'verificado') return 'badge badge-positive';
    if (estado === 'sin_verificar') return 'badge badge-progress';
    if (estado === 'cerrado') return 'badge';
    return 'badge badge-progress';
  }

  async function consultar(codigo: string) {
    const c = codigo.trim().toUpperCase();
    if (!c) {
      errorMsg = 'Introduce un código de seguimiento.';
      return;
    }
    errorMsg = '';
    data = null;
    cargando = true;
    try {
      data = await executeApi<SeguimientoPublico>('solicitudes.getByCode', { codigo: c });
      // Sincroniza URL si se consultó desde el formulario vacío
      if ($router.codigoSeguimiento !== data.codigoSeguimiento) {
        irAPublica('seguimiento', data.codigoSeguimiento);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        errorMsg =
          err.code === 'NOT_FOUND'
            ? 'No encontramos ninguna solicitud con ese código.'
            : err.message;
      } else {
        errorMsg = 'No pudimos consultar el seguimiento. Inténtalo más tarde.';
      }
    } finally {
      cargando = false;
    }
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    void consultar(codigoInput);
  }

  onMount(() => {
    const unsub = router.subscribe((s) => {
      if (s.rutaPublica === 'seguimiento' && s.codigoSeguimiento) {
        codigoInput = s.codigoSeguimiento;
        void consultar(s.codigoSeguimiento);
      }
    });
    return unsub;
  });
</script>

<section class="wrap">
  <p class="eyebrow">Seguimiento</p>
  <h1>Consulta tu expediente</h1>
  <p class="intro">
    Introduce el código que recibiste al registrar la solicitud. Solo mostramos información pública
    del estado del caso.
  </p>

  <form class="card form" onsubmit={onSubmit}>
    <label>
      Código de seguimiento
      <input
        type="text"
        bind:value={codigoInput}
        placeholder="HUE-2026-XXXXXX"
        autocomplete="off"
        spellcheck="false"
        disabled={cargando}
      />
    </label>
    <button type="submit" class="btn btn-primary" disabled={cargando}>
      {cargando ? 'Consultando…' : 'Consultar'}
    </button>
  </form>

  {#if errorMsg}
    <p class="error" role="alert">{errorMsg}</p>
  {/if}

  {#if data}
    <article class="card result" aria-live="polite">
      <p class="meta">Expediente</p>
      <p class="codigo">{data.codigoSeguimiento}</p>
      <p class={badgeClass(data.estado)}>{etiquetasEstado[data.estado] ?? data.estado}</p>
      {#if data.mensajePublico}
        <p class="mensaje">{data.mensajePublico}</p>
      {/if}
      <dl class="dates">
        <div>
          <dt>Registrado</dt>
          <dd>{new Date(data.fechaCreacion).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
        </div>
        <div>
          <dt>Última actualización</dt>
          <dd>
            {new Date(data.fechaActualizacion).toLocaleString('es', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </dd>
        </div>
      </dl>
    </article>
  {/if}

  <p class="back">
    <button type="button" class="btn btn-tertiary" onclick={() => irAPublica('home')}>Volver al inicio</button>
  </p>
</section>

<style>
  .wrap {
    max-width: 32rem;
    margin: 0 auto;
  }

  .eyebrow {
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    margin: 0 0 0.5rem;
  }

  .intro {
    margin-bottom: 1.5rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .error {
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    background: rgba(184, 76, 76, 0.1);
    border: 1px solid rgba(184, 76, 76, 0.35);
    color: var(--color-alert, #b84c4c);
    font-size: 0.9rem;
  }

  .result {
    margin-top: 1rem;
  }

  .meta {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 0 0 0.35rem;
  }

  .codigo {
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--text-h);
    margin: 0 0 1rem;
  }

  .mensaje {
    margin: 1rem 0 0;
    color: var(--text);
  }

  .dates {
    display: grid;
    gap: 0.75rem;
    margin: 1.25rem 0 0;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .dates dt {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
  }

  .dates dd {
    margin: 0.15rem 0 0;
    color: var(--text-h);
    font-size: 0.95rem;
  }

  .back {
    margin-top: 1.5rem;
  }
</style>
