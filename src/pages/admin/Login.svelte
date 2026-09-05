<script lang="ts">
  import { irAAdmin } from '../../lib/stores/router';

  let email = $state('');
  let password = $state('');
  let error = $state('');

  function login(e: Event) {
    e.preventDefault();
    // TODO: autenticación real
    if (email && password) {
      error = '';
      irAAdmin('dashboard');
    } else {
      error = 'Introduce correo y contraseña';
    }
  }
</script>

<section class="login">
  <h1>Acceso al backoffice</h1>
  <p>Solo para operadores y administradores de Huella.</p>

  <form onsubmit={login} class="form">
    <label>
      Correo
      <input type="email" bind:value={email} required />
    </label>
    <label>
      Contraseña
      <input type="password" bind:value={password} required />
    </label>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <button type="submit">Entrar</button>
  </form>
</section>

<style>
  .login {
    max-width: 380px;
    margin: 40px auto;
    text-align: center;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 24px;
    text-align: left;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.95rem;
    color: var(--text-h);
  }

  input {
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font: inherit;
    background: var(--bg);
    color: var(--text-h);
  }

  button {
    margin-top: 8px;
    padding: 12px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }

  .error {
    color: #dc2626;
    font-size: 0.9rem;
  }
</style>
