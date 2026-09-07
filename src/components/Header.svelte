<script lang="ts">
  import { router, irAPublica, irAAdmin } from '../lib/stores/router';
  import { sessionUser, sessionLoading, logout } from '../lib/stores/session';

  let { zona, rutaPublica, rutaAdmin } = $derived($router);
  let mobileMenuOpen = $state(false);
  let loggingOut = $state(false);

  /** Sesión de operador confirmada (no en loading). */
  let isOperator = $derived(!$sessionLoading && $sessionUser !== null);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  /** Desde público: si hay sesión → dashboard; si no → login. */
  function accesoOperadores() {
    mobileMenuOpen = false;
    if (isOperator) {
      irAAdmin('dashboard');
    } else {
      irAAdmin('login');
    }
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
      <div class="cuban-badge" title="Plataforma de Apoyo a Familias Cubanas">
        <svg class="cuban-flag-icon" viewBox="0 0 300 200" width="18" height="12">
          <rect width="300" height="40" fill="#002a8f"/>
          <rect y="40" width="300" height="40" fill="#ffffff"/>
          <rect y="80" width="300" height="40" fill="#002a8f"/>
          <rect y="120" width="300" height="40" fill="#ffffff"/>
          <rect y="160" width="300" height="40" fill="#002a8f"/>
          <polygon points="0,0 173.2,100 0,200" fill="#cf2e2e"/>
          <polygon points="57.7,65 65.5,89 90.7,89 70.3,103.8 78.1,127.8 57.7,113 37.3,127.8 45.1,103.8 24.7,89 49.9,89" fill="#ffffff"/>
        </svg>
        <span>Cuba</span>
      </div>
    </button>

    <nav class="desktop-nav" aria-label="Navegación principal">
      {#if zona === 'public'}
        <button
          type="button"
          class="nav-link"
          class:active={rutaPublica === 'home'}
          onclick={() => irAPublica('home')}
        >
          Inicio
        </button>
        <button
          type="button"
          class="nav-link"
          class:active={rutaPublica === 'seguimiento'}
          onclick={() => irAPublica('seguimiento')}
        >
          Seguimiento
        </button>
        <button type="button" class="btn btn-gold nav-btn" onclick={() => irAPublica('solicitud')}>
          <span>Comenzar una búsqueda</span>
        </button>
        <button type="button" class="nav-link subtle" onclick={accesoOperadores}>
          {isOperator ? 'Panel operadores' : 'Acceso operadores'}
        </button>
      {:else if isOperator}
        <!-- Solo con sesión: navegación interna del backoffice -->
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
        <button type="button" class="nav-link subtle" onclick={() => irAPublica('home')}>
          Sitio público
        </button>
        <button type="button" class="nav-link subtle" disabled={loggingOut} onclick={handleLogout}>
          {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      {:else}
        <!-- Admin sin sesión (login): solo volver al público -->
        <button type="button" class="nav-link subtle" onclick={() => irAPublica('home')}>
          Sitio público
        </button>
      {/if}
    </nav>

    <button
      type="button"
      class="mobile-toggle"
      onclick={toggleMobileMenu}
      aria-label="Abrir menú de navegación"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
        {#if mobileMenuOpen}
          <path d="M6 18L18 6M6 6l12 12"/>
        {:else}
          <path d="M4 6h16M4 12h16M4 18h16"/>
        {/if}
      </svg>
    </button>
  </div>

  {#if mobileMenuOpen}
    <div class="mobile-drawer animate-fade-in">
      {#if zona === 'public'}
        <button type="button" class="mobile-link" onclick={() => { irAPublica('home'); mobileMenuOpen = false; }}>
          Inicio
        </button>
        <button type="button" class="mobile-link" onclick={() => { irAPublica('seguimiento'); mobileMenuOpen = false; }}>
          Seguimiento de expediente
        </button>
        <button type="button" class="btn btn-gold mobile-btn" onclick={() => { irAPublica('solicitud'); mobileMenuOpen = false; }}>
          Comenzar una búsqueda
        </button>
        <button type="button" class="mobile-link subtle" onclick={accesoOperadores}>
          {isOperator ? 'Panel operadores' : 'Acceso operadores'}
        </button>
      {:else if isOperator}
        <button type="button" class="mobile-link" onclick={() => { irAAdmin('dashboard'); mobileMenuOpen = false; }}>
          Dashboard
        </button>
        <button type="button" class="mobile-link" onclick={() => { irAAdmin('solicitudes'); mobileMenuOpen = false; }}>
          Solicitudes
        </button>
        <button type="button" class="mobile-link subtle" onclick={() => { irAPublica('home'); mobileMenuOpen = false; }}>
          Sitio público
        </button>
        <button type="button" class="mobile-link subtle" disabled={loggingOut} onclick={handleLogout}>
          {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      {:else}
        <button type="button" class="mobile-link subtle" onclick={() => { irAPublica('home'); mobileMenuOpen = false; }}>
          Sitio público
        </button>
      {/if}
    </div>
  {/if}
</header>

<style>
  .header {
    background: var(--header-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
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
    padding: 0.2rem;
    color: var(--header-text);
    text-align: left;
  }

  .logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.35rem;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 70%);
    border-radius: var(--radius-sm);
  }

  .logo {
    filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.4));
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-family: var(--font-serif, var(--font-display));
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #ffffff;
    line-height: 1;
  }

  .subname {
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    opacity: 0.9;
    margin-top: 0.2rem;
  }

  .cuban-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: #e8e4dc;
    margin-left: 0.5rem;
  }

  .cuban-flag-icon {
    border-radius: 2px;
  }

  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .nav-link {
    background: transparent;
    border: 1px solid transparent;
    color: var(--header-text);
    padding: 0.5rem 0.9rem;
    border-radius: var(--radius);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    font-weight: 500;
  }

  .nav-link:hover:not(:disabled) {
    color: var(--gold);
    background: rgba(255, 255, 255, 0.06);
  }

  .nav-link.active {
    color: var(--gold);
    background: rgba(212, 175, 55, 0.12);
    border-color: rgba(212, 175, 55, 0.3);
    font-weight: 600;
  }

  .nav-btn {
    padding: 0.55rem 1.2rem;
    font-size: 0.85rem;
    min-height: 40px;
  }

  .nav-link.subtle {
    opacity: 0.75;
    font-size: 0.8rem;
  }

  .mobile-toggle {
    display: none;
    background: none;
    border: none;
    color: var(--header-text);
    cursor: pointer;
    padding: 0.4rem;
  }

  .mobile-drawer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 1.5rem 1.5rem;
    background: var(--color-obsidian-navy);
    border-bottom: 1px solid var(--header-border);
  }

  .mobile-link {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--header-text);
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    text-align: left;
    font-size: 0.95rem;
    cursor: pointer;
  }

  .mobile-btn {
    width: 100%;
    margin-top: 0.5rem;
  }

  @media (max-width: 860px) {
    .desktop-nav {
      display: none;
    }
    .mobile-toggle {
      display: block;
    }
    .cuban-badge {
      display: none;
    }
  }
</style>
