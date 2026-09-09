<script lang="ts">
  import { irAPublica } from '../../lib/stores/router';
  import { ApiError } from '../../lib/appwrite';
  import { getSolicitudRepository } from '../../lib/data/repositories';
  import type { CreateSolicitudResult } from '../../lib/types';

  let nombreFamiliar = $state('');
  let email = $state('');
  let telefono = $state('');
  let nombrePersona = $state('');
  let relacion = $state('');
  let descripcion = $state('');
  let aceptaTerminos = $state(false);

  let enviando = $state(false);
  let errorMsg = $state('');
  let resultado = $state<CreateSolicitudResult | null>(null);
  let copiado = $state(false);

  async function enviar(e: Event) {
    e.preventDefault();
    errorMsg = '';

    if (!aceptaTerminos) {
      errorMsg =
        'Debes leer y aceptar los Términos y condiciones para registrar la solicitud.';
      return;
    }

    enviando = true;
    try {
      const solicitud = await getSolicitudRepository().create({
        nombreFamiliar: nombreFamiliar.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        nombrePersona: nombrePersona.trim(),
        relacion: relacion.trim(),
        descripcion: descripcion.trim(),
      });
      resultado = {
        id: solicitud.id,
        codigoSeguimiento: solicitud.codigoSeguimiento,
        estado: solicitud.estado,
        trackingUrl: `/seguimiento/${solicitud.codigoSeguimiento}`,
      };
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

  function copiarCodigo() {
    if (resultado?.codigoSeguimiento) {
      navigator.clipboard.writeText(resultado.codigoSeguimiento);
      copiado = true;
      setTimeout(() => (copiado = false), 3000);
    }
  }
</script>

<div class="page-header">
  <div class="header-container">
    <span class="eyebrow">Apertura de Expediente</span>
    <h1 class="serif-title">Iniciar una Solicitud de Búsqueda</h1>
    <p class="header-desc">
      Averiguación sobre el estado de un familiar. Si el caso lo permite, el equipo podrá orientarte
      también sobre la prima de compensación. No se procesan pagos en esta plataforma.
    </p>
  </div>
</div>

<section class="form-container">
  {#if resultado}
    <div class="success-card glass-panel animate-fade-in" role="status">
      <div class="success-header">
        <div class="success-icon">✓</div>
        <div>
          <span class="badge badge-positive">Expediente Creado Con Éxito</span>
          <h2 class="serif-title text-gradient-gold">Solicitud Registrada</h2>
        </div>
      </div>

      <p class="success-intro">
        Hemos asignado un expediente confidencial a tu búsqueda. Guarda tu código de seguimiento
        personal para consultar el estado en todo momento.
      </p>

      <div class="codigo-box">
        <span class="codigo-label">Código Único de Seguimiento</span>
        <div class="codigo-display">
          <span class="codigo-text">{resultado.codigoSeguimiento}</span>
          <button type="button" class="btn btn-secondary btn-copy" onclick={copiarCodigo}>
            {copiado ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <div class="success-info-grid">
        <div class="info-item">
          <dt>Próximo paso</dt>
          <dd>
            Un operador revisará tu caso. Puede solicitarse verificación de identidad antes de
            avanzar.
          </dd>
        </div>
        <div class="info-item">
          <dt>Privacidad</dt>
          <dd>Tu información se usa para la averiguación y la gestión del expediente.</dd>
        </div>
      </div>

      <div class="actions-group">
        <button
          type="button"
          class="btn btn-gold"
          onclick={() => irAPublica('seguimiento', resultado!.codigoSeguimiento)}
        >
          Ir al Seguimiento
        </button>
        <button type="button" class="btn btn-secondary" onclick={() => irAPublica('home')}>
          Volver al Inicio
        </button>
      </div>
    </div>
  {:else}
    <form onsubmit={enviar} class="form-card card animate-fade-in">
      {#if errorMsg}
        <div class="error-banner" role="alert">
          <span>{errorMsg}</span>
        </div>
      {/if}

      <fieldset class="form-section">
        <legend class="section-legend">
          <span class="legend-num">1</span>
          <span>Datos del Familiar Solicitante</span>
        </legend>

        <div class="field-grid">
          <label>
            Tu Nombre Completo
            <input
              type="text"
              bind:value={nombreFamiliar}
              placeholder="Ej.: María Elena Rodríguez"
              required
              autocomplete="name"
              disabled={enviando}
            />
          </label>

          <label>
            Correo Electrónico de Contacto
            <input
              type="email"
              bind:value={email}
              placeholder="tu-correo@ejemplo.com"
              required
              autocomplete="email"
              disabled={enviando}
            />
          </label>
        </div>

        <label>
          Teléfono o WhatsApp <span class="opt">(Opcional)</span>
          <input
            type="tel"
            bind:value={telefono}
            placeholder="+53 52123456"
            autocomplete="tel"
            disabled={enviando}
          />
        </label>
      </fieldset>

      <fieldset class="form-section">
        <legend class="section-legend">
          <span class="legend-num">2</span>
          <span>Persona a Localizar</span>
        </legend>

        <div class="field-grid">
          <label>
            Nombre Completo de la Persona Buscada
            <input
              type="text"
              bind:value={nombrePersona}
              placeholder="Nombre y apellidos"
              required
              disabled={enviando}
            />
          </label>

          <label>
            Relación / Parentesco
            <input
              type="text"
              bind:value={relacion}
              placeholder="Ej.: Hijo, Hermano, Cónyuge..."
              required
              disabled={enviando}
            />
          </label>
        </div>

        <label>
          Detalles, Lugar o Datos de Interés
          <textarea
            bind:value={descripcion}
            rows="5"
            required
            disabled={enviando}
            placeholder="Última ubicación conocida, fechas, referencias útiles para el operador…"
          ></textarea>
        </label>
      </fieldset>

      <div class="disclaimer-box">
        <div class="disclaimer-icon">🔒</div>
        <p>
          Al enviar, declaras que los datos son fidedignos en la medida de tu conocimiento. El
          servicio principal es la <strong>averiguación</strong> del estado del familiar; si
          resulta en fallecimiento verificado, el equipo podrá orientarte sobre la
          <strong>prima de compensación</strong>. Los pagos no se realizan en esta aplicación.
        </p>
      </div>

      <div class="terms-accept">
        <label class="terms-label">
          <input
            type="checkbox"
            bind:checked={aceptaTerminos}
            disabled={enviando}
            required
          />
          <span>
            He leído y acepto los
            <button
              type="button"
              class="terms-link"
              onclick={() => irAPublica('terminos')}
            >
              Términos y condiciones
            </button>
            de Huella. Entiendo el alcance del servicio y que no se garantizan resultados ni cobros.
          </span>
        </label>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          onclick={() => irAPublica('home')}
          disabled={enviando}
        >
          Cancelar
        </button>
        <button type="submit" class="btn btn-gold" disabled={enviando || !aceptaTerminos}>
          {#if enviando}
            <span>Registrando...</span>
          {:else}
            <span>Enviar Solicitud de Búsqueda</span>
          {/if}
        </button>
      </div>
    </form>
  {/if}
</section>

<style>
  .page-header {
    background: var(--color-obsidian-navy);
    color: #ffffff;
    padding: 3rem 1.5rem 2.5rem;
    text-align: center;
    border-bottom: 1px solid var(--color-border-gold);
    width: 100%;
    box-sizing: border-box;
  }

  .header-container {
    max-width: 720px;
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
    margin: 0.5rem 0 0;
    line-height: 1.5;
  }

  .form-container {
    width: 100%;
    max-width: 800px;
    margin: 2.5rem auto 5rem;
    padding: 0 1.5rem;
    box-sizing: border-box;
    position: relative;
    z-index: 10;
  }

  .form-card {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-section {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .section-legend {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-h);
    margin-bottom: 0.5rem;
  }

  .legend-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--accent-bg);
    border: 1px solid var(--color-border-gold);
    color: var(--gold);
    display: grid;
    place-items: center;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.2rem;
  }

  .opt {
    font-weight: 400;
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  .disclaimer-box {
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    border-radius: var(--radius);
    background: rgba(212, 175, 55, 0.08);
    border: 1px solid rgba(212, 175, 55, 0.25);
    font-size: 0.88rem;
    color: var(--text);
  }

  .disclaimer-icon {
    font-size: 1.2rem;
  }

  .disclaimer-box p {
    margin: 0;
  }

  .terms-accept {
    padding: 1rem 1.15rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface-muted);
  }

  .terms-label {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    cursor: pointer;
    font-size: 0.92rem;
    line-height: 1.45;
    color: var(--text);
  }

  .terms-label input {
    margin-top: 0.2rem;
    width: 1.1rem;
    height: 1.1rem;
    flex-shrink: 0;
  }

  .terms-link {
    background: none;
    border: none;
    padding: 0;
    color: var(--gold);
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
    font: inherit;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius);
    background: rgba(217, 56, 58, 0.1);
    border: 1px solid rgba(217, 56, 58, 0.35);
    color: var(--color-alert);
    font-size: 0.92rem;
    font-weight: 500;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .success-card {
    padding: 2.5rem;
    background: var(--color-obsidian-navy);
    color: #ffffff;
    border: 1px solid var(--color-border-gold);
  }

  .success-header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .success-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(42, 157, 143, 0.2);
    border: 2px solid var(--positive);
    color: var(--positive);
    display: grid;
    place-items: center;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .success-intro {
    font-size: 1.05rem;
    color: var(--color-stone);
    margin-bottom: 2rem;
  }

  .codigo-box {
    background: rgba(0, 0, 0, 0.35);
    border: 1px dashed var(--color-border-gold);
    border-radius: var(--radius);
    padding: 1.25rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .codigo-label {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.5rem;
  }

  .codigo-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .codigo-text {
    font-family: var(--font-mono);
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #ffffff;
  }

  .btn-copy {
    min-height: 38px;
    padding: 0.4rem 0.9rem;
    font-size: 0.82rem;
  }

  .success-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .info-item dt {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.3rem;
  }

  .info-item dd {
    margin: 0;
    font-size: 0.9rem;
    color: #a4b4c0;
  }

  .actions-group {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  @media (max-width: 640px) {
    .actions-group,
    .form-actions {
      flex-direction: column;
    }
    .codigo-display {
      flex-direction: column;
    }
  }
</style>
