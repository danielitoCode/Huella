<script lang="ts">
  import { irAPublica } from '../../lib/stores/router';

  let nombreFamiliar = $state('');
  let email = $state('');
  let telefono = $state('');
  let nombreFallecido = $state('');
  let relacion = $state('');
  let descripcion = $state('');
  let enviado = $state(false);

  function enviar(e: Event) {
    e.preventDefault();
    // TODO: conectar con API / backend
    console.log('Nueva solicitud:', {
      nombreFamiliar,
      email,
      telefono,
      nombreFallecido,
      relacion,
      descripcion,
    });
    enviado = true;
  }
</script>

<section class="form-section">
  <h1>Enviar solicitud</h1>
  <p class="intro">
    Completa el formulario. Un operador lo recibirá en el backoffice y se pondrá en contacto contigo.
  </p>

  {#if enviado}
    <div class="success">
      <h2>Solicitud recibida</h2>
      <p>Gracias. Hemos registrado tu caso. Pronto nos pondremos en contacto.</p>
      <button onclick={() => irAPublica('home')}>Volver al inicio</button>
    </div>
  {:else}
    <form onsubmit={enviar} class="form">
      <label>
        Tu nombre completo
        <input type="text" bind:value={nombreFamiliar} required />
      </label>

      <label>
        Correo electrónico
        <input type="email" bind:value={email} required />
      </label>

      <label>
        Teléfono (opcional)
        <input type="tel" bind:value={telefono} />
      </label>

      <label>
        Nombre del ser querido fallecido
        <input type="text" bind:value={nombreFallecido} required />
      </label>

      <label>
        Relación con él/ella
        <input type="text" bind:value={relacion} placeholder="Ej: hijo, hermano, esposo..." required />
      </label>

      <label>
        Descripción / información adicional
        <textarea bind:value={descripcion} rows="5" required></textarea>
      </label>

      <div class="actions">
        <button type="button" class="secondary" onclick={() => irAPublica('home')}>Cancelar</button>
        <button type="submit">Enviar solicitud</button>
      </div>
    </form>
  {/if}
</section>

<style>
  .form-section {
    max-width: 560px;
    margin: 0 auto;
  }

  .intro {
    margin-bottom: 28px;
    color: var(--text);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
    font-size: 0.95rem;
    color: var(--text-h);
  }

  input,
  textarea {
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font: inherit;
    background: var(--bg);
    color: var(--text-h);
  }

  input:focus,
  textarea:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
  }

  button {
    padding: 10px 20px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
  }

  button[type='submit'] {
    background: var(--accent);
    color: white;
  }

  .secondary {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
  }

  .success {
    text-align: center;
    padding: 40px 20px;
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .success button {
    margin-top: 20px;
    background: var(--accent);
    color: white;
  }
</style>
