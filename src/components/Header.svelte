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

  function closeMobile() {
    mobileMenuOpen = false;
  }

  function accesoOperadores() {
    closeMobile();
    if (isOperator) irAAdmin('dashboard');
    else irAAdmin('login');
  }

  async function handleLogout() {
    loggingOut = true;
    closeMobile();
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
    <button type="button" class="brand" onclick={() => { irAPublica('home'); closeMobile(); }}>
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
          Comenzar búsqueda
        </button>
        <button type="button" class="nav-link subtle" onclick={accesoOperadores}>
          {isOperator ? 'Panel' : 'Operadores'}
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
          {loggingOut ? 'Saliendo…' : 'Salir'}
        </button>
      {:else}
        <button type="button" class="nav-link subtle" onclick={() => irAPublica('home')}>
          Sitio público
        </button>
      {/if}
    </nav>

    <button
      type="button"
      class="mobile-toggle"
      onclick={toggleMobileMenu}
      aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={mobileMenuOpen}
    >
      {mobileMenuOpen ? '✕' : '☰'}
    </button>
  </div>

  {#if mobileMenuOpen}
    <div class="mobile-drawer" role="navigation" aria-label="Menú móvil">
      {#if zona === 'public'}
        <button type="button" class="mobile-link" onclick={() => { irAPublica('home'); closeMobile(); }}>Inicio</button>
        <button type="button" class="mobile-link" onclick={() => { irAPublica('seguimiento'); closeMobile(); }}>Seguimiento</button>
        <button type="button" class="mobile-link" onclick={() => { irAPublica('terminos'); closeMobile(); }}>Términos</button>
        <button type="button" class="btn btn-gold mobile-btn" onclick={() => { irAPublica('solicitud'); closeMobile(); }}>
          Comenzar búsqueda
        </button>
        <button type="button" class="mobile-link" onclick={accesoOperadores}>
          {isOperator ? 'Panel operadores' : 'Acceso operadores'}
        </button>
      {:else if isOperator}
        <button type="button" class="mobile-link" onclick={() => { irAAdmin('dashboard'); closeMobile(); }}>Dashboard</button>
        <button type="button" class="mobile-link" onclick={() => { irAAdmin('solicitudes'); closeMobile(); }}>Solicitudes</button>
        <button type="button" class="mobile-link" onclick={() => { irAAdmin('equipo'); closeMobile(); }}>Equipo</button>
        <button type="button" class="mobile-link" onclick={() => { irAPublica('home'); closeMobile(); }}>Sitio público</button>
        <button type="button" class="mobile-link" onclick={handleLogout} disabled={loggingOut}>
          {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      {:else}
        <button type="button" class="mobile-link" onclick={() => { irAPublica('home'); closeMobile(); }}>Sitio público</button>
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
    padding-top: env(safe-area-inset-top, 0);
  }
  .header-inner {
    max-width: 1240px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.65rem var(--page-pad-x, 1rem);
    min-height: 56px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--header-text);
    min-width: 0;
    padding: 0;
  }
  .logo-wrapper {
    flex-shrink: 0;
  }
  .logo {
    display: block;
  }
  .brand-text {
    min-width: 0;
    text-align: left;
  }
  .name {
    font-family: var(--font-serif, var(--font-display));
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    display: block;
    line-height: 1.15;
  }
  .subname {
    display: block;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .nav-link {
    background: transparent;
    border: 1px solid transparent;
    color: var(--header-text);
    padding: 0.45rem 0.7rem;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 0.85rem;
    white-space: nowrap;
  }
  .nav-link.active {
    color: var(--gold);
    background: rgba(212, 175, 55, 0.12);
    border-color: rgba(212, 175, 55, 0.3);
  }
  .nav-link.subtle {
    opacity: 0.85;
    font-size: 0.8rem;
  }
  .nav-btn {
    padding: 0.45rem 0.9rem;
    font-size: 0.82rem;
    min-height: 40px;
    width: auto;
  }
  .mobile-toggle {
    display: none;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    font-size: 1.15rem;
    cursor: pointer;
    width: 44px;
    height: 44px;
    border-radius: var(--radius);
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }
  .mobile-drawer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem var(--page-pad-x, 1rem) 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    max-height: min(70vh, 420px);
    overflow-y: auto;
  }
  .mobile-link {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--header-text);
    padding: 0.85rem 1rem;
    border-radius: var(--radius);
    text-align: left;
    cursor: pointer;
    font-size: 0.95rem;
    min-height: 48px;
  }
  .mobile-btn {
    width: 100%;
  }
  @media (max-width: 920px) {
    .desktop-nav {
      display: none;
    }
    .mobile-toggle {
      display: inline-flex;
    }
  }
  @media (max-width: 380px) {
    .subname {
      display: none;
    }
    .name {
      font-size: 1.15rem;
    }
  }
</style>
