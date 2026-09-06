<script lang="ts">
  import { irAPublica } from '../../lib/stores/router';
  import { executeApi, ApiError } from '../../lib/appwrite';
  import type { CreateSolicitudResult } from '../../lib/types';

  let nombreFamiliar = $state('');
  let email = $state('');
  let telefono = $state('');
  let nombrePersona = $state('');
  let relacion = $state('');
  let descripcion = $state('');

  let enviando = $state(false);
  let errorMsg = $state('');
  let resultado = $state<CreateSolicitudResult | null>(null);

  async function enviar(e: Event) {
    e.preventDefault();
    errorMsg = '';
    enviando = true;
    try {
      const data = await executeApi<CreateSolicitudResult>('solicitudes.create', {
        nombreFamiliar: nombreFamiliar.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        nombrePersona: nombrePersona.trim(),
        relacion: relacion.trim(),
        descripcion: descripcion.trim(),
      });
      resultado = data;
    } catch (err) {
      if (err instanceof ApiError) {
        errorMsg = err.message;
      } else {
        errorMsg = 'No pudimos registrar la solicitud. Inténtalo de nuevo.';
      }
    } finally {
      enviando = false;
    }
  }
</script>

<section class="form-section">
  <p class="eyebrow">Nueva búsqueda</p>
  <h1>Iniciar una solicitud</h1>
  <p class="intro">
    Cuéntanos a quién buscas. Registraremos el expediente y te daremos un código para seguir el
    avance. No hace falta crear una cuenta.
  </p>

  {#if resultado}
    <div class="success card" role="status">
      <p class="eyebrow">Solicitud recibida</p>
      <h2>Hemos registrado tu búsqueda</h2>
      <p>
        Guarda este código de seguimiento. También te lo enviamos por correo si el servicio de email
        está activo.
      </p>
      <p class="codigo" aria-label="Código de seguimiento">{resultado.codigoSeguimiento}</p>
      <div class="actions">
        <button
          type="button"
          class="btn btn-primary"
          onclick={() => irAPublica('seguimiento', resultado!.codigoSeguimiento)}
        >
          Ver seguimiento
        </button>
        <button type="button" class="btn btn-secondary" onclick={() => irAPublica('home')}>
          Volver al inicio
        </button>
      </div>
    </div>
  {:else}
    <form onsubmit={enviar} class="form card">
      {#if errorMsg}
        <p class="error" role="alert">{errorMsg}</p>
      {/if}

      <label>
        Tu nombre completo
        <input type="text" bind:value={nombreFamiliar} required autocomplete="name" disabled={enviando} />
      </label>

      <label>
        Correo electrónico
        <input type="email" bind:value={email} required autocomplete="email" disabled={enviando} />
      </label>

      <label>
        Teléfono <span class="opt">(opcional)</span>
        <input type="tel" bind:value={telefono} autocomplete="tel" disabled={enviando} />
      </label>

      <label>
        Nombre de la persona que buscas
        <input type="text" bind:value={nombrePersona} required disabled={enviando} />
      </label>

      <label>
        Relación con esa persona
        <input
          type="text"
          bind:value={relacion}
          placeholder="Ej.: madre, hermano, cónyuge…"
          required
          disabled={enviando}
        />
      </label>

      <label>
        Información que conoces
        <textarea
          bind:value={descripcion}
          rows="5"
          required
          disabled={enviando}
          placeholder="Lugar, fechas, circunstancias u otros datos relevantes…"
        ></textarea>
      </label>

      <p class="disclaimer">
        Confirmas que la información es verdadera según tu conocimiento. La averiguación no garantiza
        un resultado; si se confirma un fallecimiento, el equipo podrá orientarte sobre pasos
        posteriores fuera de esta plataforma.
      </p>

      <div class="actions">
        <button type="button" class="btn btn-secondary" onclick={() => irAPublica('home')} disabled={enviando}>
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </div>
    </form>
  {/if}
</section>

<style>
  .form-section {
    max-width: 36rem;
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
    color: var(--text);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .opt {
    font-weight: 400;
    color: var(--text-muted);
  }

  .disclaimer {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0;
  }

  .error {
    margin: 0;
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    background: rgba(184, 76, 76, 0.1);
    border: 1px solid rgba(184, 76, 76, 0.35);
    color: var(--color-alert, #b84c4c);
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .success {
    text-align: left;
  }

  .codigo {
    font-family: var(--font-mono);
    font-size: 1.35rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--text-h);
    padding: 1rem;
    background: var(--surface-muted);
    border: 1px solid var(--color-border-gold, rgba(198, 164, 106, 0.35));
    border-radius: var(--radius);
    text-align: center;
  }
</style>
