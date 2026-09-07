<script lang="ts">
  import { router, irAPublica, irAAdmin } from '../lib/stores/router';
  import { sessionUser, sessionLoading, logout } from '../lib/stores/session';

  let { zona, rutaAdmin } = $derived($router);
  let mobileMenuOpen = $state(false);
  let loggingOut = $state(false);

  let isOperator = $derived(!$sessionLoading && $sessionUser !== null);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function accesoOperadores() {
    mobileMenuOpen = false;
    if (isOperator) irAAdmin('dashboard');
    else irAAdmin('login');
  }

  async function handleLogout() {
    loggingOut = true;
    mobileMenuOpen = false;
    try {
      await logout();
      irAAdmin('login');
    } finally {
      loggingOut = false;
    }
  }
</script>

<header class="header">
  <div class="header-inner">
    <button type="button" class="brand" onclick={() => irAPublica('home')}>
      <div class="logo-wrapper">
        <img src="/icon_huellas.svg" alt="" class="logo" width="30" height="30" />
      </div>
      <div class="brand-text">
        <span class="name">Huella</span>
        <span class="subname">Memorial Digital</span>
      </div>
    </button>

    <nav class="desktop-nav" aria-label="Navegación principal">
      {#if zona === 'public'}
        <button type="button" class="nav-link" onclick={() => irAPublica('home')}>Inicio</button>
        <button type="button" class="nav-link" onclick={() => irAPublica('seguimiento')}>Seguimiento</button>
        <button type="button" class="btn btn-gold nav-btn" onclick={() => irAPublica('solicitud')}>
          Comenzar una búsqueda
        </button>
        <button type="button" class="nav-link subtle" onclick={accesoOperadores}>
          {isOperator ? 'Panel operadores' : 'Acceso operadores'}
        </button>
      {:else if isOperator}
        <button
          type="button"
          class="nav-link"
          class:active={rutaAdmin === 'dashboard'}
          onclick={() => irAAdmin('dashboard')}
        >
          Dashboard
        </button>
        <button
          type="button"
          class="nav-link"
          class:active={rutaAdmin === 'solicitudes' || rutaAdmin === 'detalle'}
          onclick={() => irAAdmin('solicitudes')}
        >
          Solicitudes
        </button>
        <button
          type="button"
          class="nav-link"
          class:active={rutaAdmin === 'equipo'}
          onclick={() => irAAdmin('equipo')}
        >
          Equipo
        </button>
        <button type="button" class="nav-link subtle" onclick={() => irAPublica('home')}>
          Sitio público
        </button>
        <button type="button" class="nav-link subtle" disabled={loggingOut} onclick={handleLogout}>
          {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      {:else}
        <button type="button" class="nav-link subtle" onclick={() => irAPublica('home')}>
          Sitio público
        </button>
      {/if}
    </nav>

    <button type="button" class="mobile-toggle" onclick={toggleMobileMenu} aria-label="Menú">
      ☰
    </button>
  </div>

  {#if mobileMenuOpen}
    <div class="mobile-drawer">
      {#if zona === 'public'}
        <button type="button" class="mobile-link" onclick={() => { irAPublica('home'); mobileMenuOpen = false; }}>Inicio</button>
        <button type="button" class="mobile-link" onclick={() => { irAPublica('seguimiento'); mobileMenuOpen = false; }}>Seguimiento</button>
        <button type="button" class="btn btn-gold mobile-btn" onclick={() => { irAPublica('solicitud'); mobileMenuOpen = false; }}>Comenzar búsqueda</button>
        <button type="button" class="mobile-link" onclick={accesoOperadores}>{isOperator ? 'Panel' : 'Operadores'}</button>
      {:else if isOperator}
        <button type="button" class="mobile-link" onclick={() => { irAAdmin('dashboard'); mobileMenuOpen = false; }}>Dashboard</button>
        <button type="button" class="mobile-link" onclick={() => { irAAdmin('solicitudes'); mobileMenuOpen = false; }}>Solicitudes</button>
        <button type="button" class="mobile-link" onclick={() => { irAAdmin('equipo'); mobileMenuOpen = false; }}>Equipo</button>
        <button type="button" class="mobile-link" onclick={handleLogout}>Cerrar sesión</button>
      {:else}
        <button type="button" class="mobile-link" onclick={() => { irAPublica('home'); mobileMenuOpen = false; }}>Sitio público</button>
      {/if}
    </div>
  {/if}
</header>

<style>
  .header {
    background: var(--header-bg);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--header-border);
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .header-inner {
    max-width: 1240px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--header-text);
  }
  .name {
    font-family: var(--font-serif, var(--font-display));
    font-size: 1.35rem;
    font-weight: 700;
    color: #fff;
  }
  .subname {
    display: block;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .nav-link {
    background: transparent;
    border: 1px solid transparent;
    color: var(--header-text);
    padding: 0.5rem 0.85rem;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 0.88rem;
  }
  .nav-link.active {
    color: var(--gold);
    background: rgba(212, 175, 55, 0.12);
    border-color: rgba(212, 175, 55, 0.3);
  }
  .nav-link.subtle {
    opacity: 0.8;
    font-size: 0.8rem;
  }
  .nav-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  .mobile-toggle {
    display: none;
    background: none;
    border: none;
    color: #fff;
    font-size: 1.4rem;
    cursor: pointer;
  }
  .mobile-drawer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 1.5rem 1.5rem;
  }
  .mobile-link {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--header-text);
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    text-align: left;
    cursor: pointer;
  }
  @media (max-width: 860px) {
    .desktop-nav {
      display: none;
    }
    .mobile-toggle {
      display: block;
    }
  }
</style>
