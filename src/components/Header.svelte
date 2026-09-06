<script lang="ts">
  import { router, irAPublica, irAAdmin } from '../lib/stores/router';

  let { zona } = $derived($router);
</script>

<header class="header">
  <button type="button" class="brand" onclick={() => irAPublica('home')}>
    <img src="/icon_huellas.svg" alt="" class="logo" width="28" height="28" />
    <span class="name">Huella</span>
  </button>

  <nav aria-label="Principal">
    {#if zona === 'public'}
      <button type="button" class="nav-link" onclick={() => irAPublica('home')}>Inicio</button>
      <button type="button" class="nav-link" onclick={() => irAPublica('solicitud')}>Buscar</button>
      <button type="button" class="nav-link primary" onclick={() => irAPublica('solicitud')}>
        Comenzar una búsqueda
      </button>
      <button type="button" class="nav-link subtle" onclick={() => irAAdmin('login')}>
        Operadores
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
    padding: 0.85rem 1.35rem;
    background: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0.2rem;
    border-radius: var(--radius-sm);
    color: var(--header-text);
  }

  .brand:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
  }

  .logo {
    width: 28px;
    height: 28px;
  }

  .name {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    align-items: center;
    justify-content: flex-end;
  }

  .nav-link {
    border: 1px solid transparent;
    background: transparent;
    color: var(--header-text);
    padding: 0.45rem 0.75rem;
    border-radius: var(--radius);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    font-weight: 500;
    min-height: 40px;
  }

  .nav-link:hover {
    color: var(--gold);
  }

  .nav-link:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
  }

  .nav-link.primary {
    background: var(--color-stone);
    color: var(--color-obsidian-navy);
    font-weight: 600;
    border-color: var(--color-stone);
  }

  .nav-link.primary:hover {
    background: var(--color-ivory);
    color: var(--color-obsidian-navy);
  }

  .nav-link.subtle {
    opacity: 0.65;
    font-size: 0.78rem;
    font-weight: 400;
  }

  @media (max-width: 640px) {
    .nav-link:not(.primary):not(.subtle) {
      display: none;
    }
  }
</style>
