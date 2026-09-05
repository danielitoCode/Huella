<script lang="ts">
  import { router, irAPublica, irAAdmin } from '../lib/stores/router';

  let { zona } = $derived($router);
</script>

<header class="header">
  <div class="brand" onclick={() => irAPublica('home')} role="button" tabindex="0">
    <img src="/icon_huellas.svg" alt="Huella" class="logo" />
    <span>Huella</span>
  </div>

  <nav>
    {#if zona === 'public'}
      <button class="nav-link" onclick={() => irAPublica('home')}>Inicio</button>
      <button class="nav-link primary" onclick={() => irAPublica('solicitud')}>
        Enviar solicitud
      </button>
      <button class="nav-link subtle" onclick={() => irAAdmin('login')}>
        Acceso admin
      </button>
    {:else}
      <button class="nav-link" onclick={() => irAAdmin('dashboard')}>Dashboard</button>
      <button class="nav-link" onclick={() => irAAdmin('solicitudes')}>Solicitudes</button>
      <button class="nav-link subtle" onclick={() => irAPublica('home')}>
        Ver sitio público
      </button>
    {/if}
  </nav>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: var(--text-h);
    cursor: pointer;
    border: none;
    background: none;
    font-size: 1.1rem;
  }

  .logo {
    width: 28px;
    height: 28px;
  }

  nav {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .nav-link {
    border: none;
    background: transparent;
    color: var(--text);
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .nav-link:hover {
    background: var(--accent-bg);
    color: var(--text-h);
  }

  .nav-link.primary {
    background: var(--accent);
    color: white;
  }

  .nav-link.primary:hover {
    filter: brightness(1.05);
  }

  .nav-link.subtle {
    opacity: 0.7;
    font-size: 0.85rem;
  }
</style>
