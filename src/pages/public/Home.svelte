<script lang="ts">
  import { irAPublica } from '../../lib/stores/router';

  let quickCode = $state('');

  function handleQuickSearch(e: Event) {
    e.preventDefault();
    if (quickCode.trim()) {
      irAPublica('seguimiento', quickCode.trim().toUpperCase());
    }
  }
</script>

<section class="hero-section">
  <div class="hero-backdrop">
    <div class="hero-light-glow"></div>
    <div class="hero-radial-mesh"></div>
  </div>

  <div class="hero-container">
    <div class="cuban-tribute-tag animate-fade-in">
      <svg class="flag-mini" viewBox="0 0 300 200" width="16" height="11" aria-hidden="true">
        <rect width="300" height="40" fill="#002a8f"/>
        <rect y="40" width="300" height="40" fill="#ffffff"/>
        <rect y="80" width="300" height="40" fill="#002a8f"/>
        <rect y="120" width="300" height="40" fill="#ffffff"/>
        <rect y="160" width="300" height="40" fill="#002a8f"/>
        <polygon points="0,0 173.2,100 0,200" fill="#cf2e2e"/>
        <polygon points="57.7,65 65.5,89 90.7,89 70.3,103.8 78.1,127.8 57.7,113 37.3,127.8 45.1,103.8 24.7,89 49.9,89" fill="#ffffff"/>
      </svg>
      <span>Localización, verificación e indemnizaciones a familias cubanas</span>
    </div>

    <h1 class="hero-title serif-title animate-fade-in">
      Para quienes buscan <span class="text-gradient-gold">respuestas</span>.<br />
      Para quienes merecen <span class="highlight-dignity">sus derechos</span>.
    </h1>

    <p class="hero-subtitle animate-fade-in">
      Huella acompaña a familias cubanas con allegados en el conflicto Rusia-Ucrania: averiguación
      documental del estado del familiar y, cuando corresponde, orientación sobre primas o indemnizaciones.
    </p>

    <div class="hero-actions animate-fade-in">
      <button type="button" class="btn btn-gold btn-hero" onclick={() => irAPublica('solicitud')}>
        <span>Iniciar una solicitud de búsqueda</span>
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" aria-hidden="true">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>

      <form onsubmit={handleQuickSearch} class="quick-search-box">
        <input
          type="text"
          bind:value={quickCode}
          placeholder="Código HUE-2026-…"
          aria-label="Código de seguimiento rápido"
          autocomplete="off"
        />
        <button type="submit" class="btn btn-secondary btn-search-quick">Consultar</button>
      </form>
    </div>

    <div class="trust-bar animate-fade-in">
      <div class="trust-item">
        <span>Identidad verificada (KYC)</span>
      </div>
      <div class="trust-divider"></div>
      <div class="trust-item">
        <span>Averiguación documental</span>
      </div>
      <div class="trust-divider"></div>
      <div class="trust-item">
        <span>Orientación sobre primas</span>
      </div>
    </div>
  </div>

  <a href="#proceso" class="scroll-indicator animate-fade-in">Conoce más ↓</a>
</section>

<section class="process-section" id="proceso">
  <div class="section-header">
    <span class="section-tag">Rigor e investigación</span>
    <h2 class="serif-title">Proceso de averiguación y gestión de derechos</h2>
    <p class="section-desc">
      Desde la verificación inicial hasta la orientación en primas, cuando el caso lo permite.
    </p>
  </div>

  <div class="process-grid">
    <div class="process-card card">
      <div class="process-num">01</div>
      <h3>Averiguación documental</h3>
      <p>
        Registramos antecedentes e investigamos si la persona está activa, no localizada o con reporte de
        fallecimiento.
      </p>
      <div class="card-footer-badge"><span class="badge">Apertura</span></div>
    </div>

    <div class="process-card card highlight">
      <div class="process-num gold">02</div>
      <h3>Verificación de identidad</h3>
      <p>
        Confirmamos la identidad del solicitante (Didit o vía asistida) para proteger el expediente y a la
        familia.
      </p>
      <div class="card-footer-badge"><span class="badge badge-progress">Acreditación</span></div>
    </div>

    <div class="process-card card">
      <div class="process-num">03</div>
      <h3>Orientación sobre primas</h3>
      <p>
        Si se confirma el deceso, orientamos los trámites de prima o indemnización. Los pagos no se hacen
        en esta web.
      </p>
      <div class="card-footer-badge"><span class="badge badge-positive">Derechos</span></div>
    </div>
  </div>
</section>

<section class="manifesto-section">
  <div class="manifesto-card glass-panel">
    <span class="manifesto-tag">Principios</span>
    <h2 class="serif-title">
      "Detrás de cada expediente hay un ser humano, una familia y el derecho a la verdad."
    </h2>
    <p class="manifesto-body">
      Huella ordena la búsqueda de información para familias en situaciones de vulnerabilidad o conflicto
      internacional, con rigor y sin promesas vacías.
    </p>
    <div class="manifesto-bullets">
      <div class="bullet-item">
        <div class="bullet-icon">✓</div>
        <div>
          <strong>Confidencialidad</strong>
          <p>Datos sensibles solo para operadores autorizados.</p>
        </div>
      </div>
      <div class="bullet-item">
        <div class="bullet-icon">✓</div>
        <div>
          <strong>Sin pagos en la app</strong>
          <p>La plataforma no procesa ni retiene primas.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="cta-banner">
  <div class="cta-inner">
    <h2 class="serif-title text-gradient-gold">¿Necesitas iniciar una búsqueda?</h2>
    <p>El registro toma pocos minutos. Recibirás un código de seguimiento confidencial.</p>
    <button type="button" class="btn btn-gold btn-hero" onclick={() => irAPublica('solicitud')}>
      Comenzar solicitud
    </button>
  </div>
</section>

<style>
  .hero-section {
    position: relative;
    background: transparent;
    color: var(--color-stone);
    min-height: calc(100svh - 65px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: clamp(1.25rem, 3vh, 3rem) var(--page-pad-x, 1rem) 1.5rem;
    overflow: hidden;
  }

  .hero-backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .hero-light-glow {
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: min(60vw, 800px);
    height: min(60vw, 800px);
    background: radial-gradient(circle, rgba(232, 201, 122, 0.12) 0%, transparent 65%);
    filter: blur(40px);
  }

  .hero-radial-mesh {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(rgba(212, 175, 55, 0.06) 1px, transparent 1px),
      radial-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 32px 32px;
    background-position: 0 0, 16px 16px;
    opacity: 0.5;
  }

  .hero-container {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    text-align: center;
  }

  .cuban-tribute-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    max-width: 100%;
    padding: 0.4rem 0.9rem;
    border-radius: var(--radius-pill);
    background: rgba(7, 25, 35, 0.5);
    border: 1px solid rgba(212, 175, 55, 0.35);
    backdrop-filter: blur(12px);
    font-size: clamp(0.68rem, 2.4vw, 0.78rem);
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--color-stone);
    margin-bottom: 1.15rem;
    text-align: left;
  }

  .cuban-tribute-tag span {
    line-height: 1.35;
  }

  .flag-mini {
    flex-shrink: 0;
    border-radius: 2px;
  }

  .hero-title {
    font-size: clamp(1.75rem, 5.5vw, 3.6rem);
    line-height: 1.15;
    margin-bottom: 0.85rem;
    color: #ffffff;
    text-shadow: 0 2px 24px rgba(7, 25, 35, 0.55);
  }

  .highlight-dignity {
    color: #ffffff;
    position: relative;
  }

  .highlight-dignity::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-cuban-red), var(--color-memorial-gold));
    border-radius: 2px;
  }

  .hero-subtitle {
    font-size: clamp(0.92rem, 2.2vw, 1.12rem);
    color: #c5d0d8;
    max-width: 38rem;
    margin: 0 auto 1.5rem;
    line-height: 1.55;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1.75rem;
    width: 100%;
  }

  .btn-hero {
    padding: 0.85rem 1.5rem;
    font-size: 0.95rem;
  }

  .quick-search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(7, 25, 35, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(12px);
    padding: 0.35rem;
    padding-left: 0.85rem;
    border-radius: var(--radius);
    width: 100%;
    max-width: 420px;
  }

  .quick-search-box input {
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 16px;
    padding: 0.45rem 0;
    min-width: 0;
    flex: 1;
    box-shadow: none !important;
  }

  .quick-search-box input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .btn-search-quick {
    min-height: 40px;
    padding: 0.45rem 0.9rem;
    font-size: 0.85rem;
    white-space: nowrap;
    width: auto;
    flex-shrink: 0;
  }

  .trust-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem 1.25rem;
    padding: 0.7rem 1.15rem;
    background: rgba(7, 25, 35, 0.55);
    border: 1px solid rgba(212, 175, 55, 0.25);
    border-radius: var(--radius-pill);
    backdrop-filter: blur(12px);
    max-width: 100%;
  }

  .trust-item {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-stone);
  }

  .trust-divider {
    width: 1px;
    height: 14px;
    background: rgba(255, 255, 255, 0.2);
  }

  .scroll-indicator {
    margin-top: 1.25rem;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
    opacity: 0.9;
    text-decoration: none;
  }

  .process-section {
    max-width: var(--content-max, 1140px);
    margin: 0 auto;
    padding: clamp(2.5rem, 6vw, 5rem) var(--page-pad-x, 1rem);
    position: relative;
    z-index: 2;
  }

  .section-header {
    text-align: center;
    max-width: 640px;
    margin: 0 auto 2.5rem;
  }

  .section-tag {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.5rem;
    display: block;
  }

  .section-desc {
    font-size: 1rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
  }

  .process-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    gap: 1.25rem;
  }

  .process-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .process-card.highlight {
    border-color: var(--color-border-gold);
  }

  .process-num {
    font-family: var(--font-serif);
    font-size: 2.4rem;
    font-weight: 700;
    line-height: 1;
    color: var(--text-muted);
    opacity: 0.4;
    margin-bottom: 0.75rem;
  }

  .process-num.gold {
    color: var(--gold);
    opacity: 1;
  }

  .card-footer-badge {
    margin-top: 1.25rem;
    padding-top: 0.85rem;
    border-top: 1px solid var(--border);
  }

  .manifesto-section {
    max-width: var(--content-max, 1140px);
    margin: 0 auto clamp(2.5rem, 6vw, 5rem);
    padding: 0 var(--page-pad-x, 1rem);
    position: relative;
    z-index: 2;
  }

  .manifesto-card {
    padding: clamp(1.5rem, 4vw, 3.5rem);
    background: linear-gradient(135deg, var(--color-obsidian-navy) 0%, #0d2a3c 100%);
    color: #ffffff;
    border: 1px solid var(--color-border-gold);
  }

  .manifesto-tag {
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 1rem;
  }

  .manifesto-card h2 {
    color: #ffffff;
    font-size: clamp(1.35rem, 3.2vw, 2.2rem);
    margin-bottom: 1rem;
  }

  .manifesto-body {
    font-size: 1rem;
    color: var(--color-stone);
    max-width: 780px;
    margin-bottom: 1.5rem;
  }

  .manifesto-bullets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .bullet-item {
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
  }

  .bullet-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(212, 175, 55, 0.2);
    border: 1px solid var(--gold);
    color: var(--gold);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .bullet-item strong {
    color: #ffffff;
    display: block;
    margin-bottom: 0.2rem;
  }

  .bullet-item p {
    font-size: 0.88rem;
    color: #a4b4c0;
    margin: 0;
  }

  .cta-banner {
    background: radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.12) 0%, rgba(7, 25, 35, 0.92) 80%);
    padding: clamp(2.5rem, 6vw, 5rem) var(--page-pad-x, 1rem);
    text-align: center;
    border-top: 1px solid var(--color-border-gold);
    position: relative;
    z-index: 2;
  }

  .cta-inner {
    max-width: 640px;
    margin: 0 auto;
  }

  .cta-banner h2 {
    font-size: clamp(1.6rem, 4vw, 2.75rem);
    margin-bottom: 0.85rem;
  }

  .cta-banner p {
    font-size: 1rem;
    color: var(--color-stone);
    margin-bottom: 1.5rem;
  }

  @media (max-width: 640px) {
    .hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .btn-hero {
      width: 100%;
    }

    .quick-search-box {
      max-width: none;
      flex-direction: column;
      align-items: stretch;
      padding: 0.65rem;
    }

    .btn-search-quick {
      width: 100%;
    }

    .trust-bar {
      flex-direction: column;
      border-radius: var(--radius);
      gap: 0.5rem;
    }

    .trust-divider {
      display: none;
    }

    .cuban-tribute-tag {
      border-radius: var(--radius);
    }
  }
</style>
