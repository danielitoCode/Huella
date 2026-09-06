<script lang="ts">
  import { router, irAPublica, irAAdmin } from '../lib/stores/router';

  let { zona } = $derived($router);
</script>

<header class="header">
  <button type="button" class="brand" onclick={() => irAPublica('home')}>
    <img src="/icon_huellas.svg" alt="" class="logo" width="32" height="32" />
    <span class="brand-text">
      <span class="name">Huella</span>
      <span class="tag">Verdad · Dignidad · Regreso</span>
    </span>
  </button>

  <nav aria-label="Principal">
    {#if zona === 'public'}
      <button type="button" class="nav-link" onclick={() => irAPublica('home')}>Inicio</button>
      <button type="button" class="nav-link primary" onclick={() => irAPublica('solicitud')}>
        Iniciar una solicitud
      </button>
      <button type="button" class="nav-link subtle" onclick={() => irAAdmin('login')}>
        Acceso operadores
      </button>
    {:else}
      <button type="button" class="nav-link" onclick={() => irAAdmin('dashboard')}>Dashboard</button>
      <button type="button" class="nav-link" onclick={() => irAAdmin('solicitudes')}>Solicitudes</button>
      <button type="button" class="nav-link subtle" onclick={() => irAPublica('home')}>
        Sitio público
      </button>
    {/if}
  </nav>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1.25rem;
    background: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--radius-sm);
    color: var(--header-text);
    text-align: left;
  }

  .brand:focus-visible {
    outline: 2px solid var(--brand-gold);
    outline-offset: 2px;
  }

  .logo {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
  }

  .name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.35rem;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .tag {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--brand-gold);
    opacity: 0.9;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    align-items: center;
    justify-content: flex-end;
  }

  .nav-link {
    border: 1.5px solid transparent;
    background: transparent;
    color: var(--header-text);
    padding: 0.5rem 0.85rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    font-weight: 500;
    min-height: 40px;
  }

  .nav-link:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .nav-link:focus-visible {
    outline: 2px solid var(--brand-gold);
    outline-offset: 2px;
  }

  .nav-link.primary {
    background: var(--accent);
    color: var(--text-on-accent);
    font-weight: 600;
  }

  .nav-link.primary:hover {
    background: var(--accent-hover);
  }

  .nav-link.subtle {
    opacity: 0.75;
    font-size: 0.8rem;
    font-weight: 400;
  }

  @media (max-width: 640px) {
    .tag {
      display: none;
    }

    .nav-link.subtle {
      display: none;
    }
  }
</style>
