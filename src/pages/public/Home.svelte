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

<!-- HERO PRINCIPAL CINEMATOGRÁFICO AJUSTADO AL VIEWPORT (100% ZOOM) -->
<section class="hero-section">
  <div class="hero-backdrop">
    <div class="hero-light-glow"></div>
    <div class="hero-radial-mesh"></div>
  </div>

  <div class="hero-container">
    <div class="cuban-tribute-tag animate-fade-in">
      <svg class="flag-mini" viewBox="0 0 300 200" width="16" height="11">
        <rect width="300" height="40" fill="#002a8f"/>
        <rect y="40" width="300" height="40" fill="#ffffff"/>
        <rect y="80" width="300" height="40" fill="#002a8f"/>
        <rect y="120" width="300" height="40" fill="#ffffff"/>
        <rect y="160" width="300" height="40" fill="#002a8f"/>
        <polygon points="0,0 173.2,100 0,200" fill="#cf2e2e"/>
        <polygon points="57.7,65 65.5,89 90.7,89 70.3,103.8 78.1,127.8 57.7,113 37.3,127.8 45.1,103.8 24.7,89 49.9,89" fill="#ffffff"/>
      </svg>
      <span>Localización, Verificación e Indemnizaciones a Familias Cubanas</span>
    </div>

    <h1 class="hero-title serif-title animate-fade-in">
      Para quienes buscan <span class="text-gradient-gold">respuestas</span>.<br />
      Para quienes merecen <span class="highlight-dignity">sus derechos</span>.
    </h1>

    <p class="hero-subtitle animate-fade-in">
      Huella es la plataforma de acompañamiento a familias cubanas con allegados en el conflicto Rusia-Ucrania. Verificamos documentalmente el estado de su familiar y orientamos en la reclamación de primas o indemnizaciones por fallecimiento.
    </p>

    <div class="hero-actions animate-fade-in">
      <button type="button" class="btn btn-gold btn-hero" onclick={() => irAPublica('solicitud')}>
        <span>Iniciar una solicitud de búsqueda</span>
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>

      <!-- Buscador Rápido de Seguimiento -->
      <form onsubmit={handleQuickSearch} class="quick-search-box">
        <input
          type="text"
          bind:value={quickCode}
          placeholder="Código de seguimiento (ej. HUE-2026-...)"
          aria-label="Código de seguimiento rápido"
        />
        <button type="submit" class="btn btn-secondary btn-search-quick">
          Consultar
        </button>
      </form>
    </div>

    <!-- Indicadores de Confianza -->
    <div class="trust-bar animate-fade-in">
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>Identidad Verificada Didit KYC</span>
      </div>
      <div class="trust-divider"></div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>Averiguación Documental</span>
      </div>
      <div class="trust-divider"></div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <span>Gestión de Primas e Indemnizaciones</span>
      </div>
    </div>
  </div>

  <!-- Indicador visual de desplazamiento hacia abajo -->
  <a href="#proceso" class="scroll-indicator animate-fade-in" aria-label="Desplazarse hacia el proceso">
    <span>Conoce más</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
      <path d="M12 5v14M19 12l-7 7-7-7"/>
    </svg>
  </a>
</section>

<!-- SECCIÓN PROCESO METÓDICO -->
<section class="process-section" id="proceso">
  <div class="section-header">
    <span class="section-tag">Rigor e Investigación</span>
    <h2 class="serif-title">Proceso de Averiguación y Gestión de Derechos</h2>
    <p class="section-desc">
      Acompañamos a la familia cubana desde la verificación inicial del estado del familiar hasta la eventual orientación en el cobro de la prima o indemnización de ley.
    </p>
  </div>

  <div class="process-grid">
    <!-- Pilar 1 -->
    <div class="process-card card">
      <div class="process-num">01</div>
      <h3>Averiguación Documental</h3>
      <p>
        Registramos los antecedentes conocidos. Investigamos si la persona se encuentra en servicio activo, no localizada o si existe reporte oficial de fallecimiento.
      </p>
      <div class="card-footer-badge">
        <span class="badge">Apertura Expediente</span>
      </div>
    </div>

    <!-- Pilar 2 -->
    <div class="process-card card highlight">
      <div class="process-num gold">02</div>
      <h3>Verificación Didit KYC</h3>
      <p>
        Confirmamos la identidad del familiar solicitante mediante Didit KYC para validar la legitimidad de su representación como beneficiario directo en la isla.
      </p>
      <div class="card-footer-badge">
        <span class="badge badge-progress">Acreditación Beneficiario</span>
      </div>
    </div>

    <!-- Pilar 3 -->
    <div class="process-card card">
      <div class="process-num">03</div>
      <h3>Orientación sobre Primas</h3>
      <p>
        Si se confirma el deceso, orientamos y acompañamos los trámites para que la familia pueda reclamar la prima o indemnización correspondiente sin barreras geográficas.
      </p>
      <div class="card-footer-badge">
        <span class="badge badge-positive">Derechos e Indemnización</span>
      </div>
    </div>
  </div>
</section>

<!-- SECCIÓN MANIFIESTO Y VALORES -->
<section class="manifesto-section">
  <div class="manifesto-card glass-panel">
    <div class="manifesto-content">
      <span class="manifesto-tag">Principios Rectores</span>
      <h2 class="serif-title">"Detrás de cada expediente hay un ser humano, una familia y el derecho inalienable a la verdad."</h2>
      <p class="manifesto-body">
        Huella nace para dar respuesta a las familias de ciudadanos cubanos en situaciones de vulnerabilidad o conflicto internacional, proporcionando una herramienta institucional libre de desinformación.
      </p>
      <div class="manifesto-bullets">
        <div class="bullet-item">
          <div class="bullet-icon">✓</div>
          <div>
            <strong>Confidencialidad absoluta</strong>
            <p>Los datos sensibles solo son accesibles por operadores autorizados.</p>
          </div>
        </div>
        <div class="bullet-item">
          <div class="bullet-icon">✓</div>
          <div>
            <strong>Sin intermediarios ni costo</strong>
            <p>Servicio directo orientado al interés humanitario del familiar.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- BANNER CTA FINAL CINEMATOGRÁFICO -->
<section class="cta-banner">
  <div class="cta-inner">
    <h2 class="serif-title text-gradient-gold">¿Necesitas iniciar una búsqueda?</h2>
    <p>
      El proceso toma menos de 3 minutos. Recibirás inmediatamente tu código único de seguimiento confidencial.
    </p>
    <button type="button" class="btn btn-gold btn-hero" onclick={() => irAPublica('solicitud')}>
      Comenzar Solicitud de Búsqueda
    </button>
  </div>
</section>

<style>
  /* HERO AJUSTADO AL 100% DEL VIEWPORT (100% ZOOM) */
  .hero-section {
    position: relative;
    background: var(--color-obsidian-deep);
    color: var(--color-stone);
    min-height: calc(100vh - 65px);
    min-height: calc(100svh - 65px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: clamp(1.5rem, 3vh, 3.5rem) 1.5rem clamp(1.5rem, 2.5vh, 2.5rem);
    overflow: hidden;
    box-sizing: border-box;
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
    width: 60vw;
    height: 60vw;
    max-width: 800px;
    max-height: 800px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(14, 39, 56, 0.2) 40%, transparent 70%);
    filter: blur(40px);
  }

  .hero-radial-mesh {
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 1px),
      radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 32px 32px;
    background-position: 0 0, 16px 16px;
    opacity: 0.6;
  }

  .hero-container {
    position: relative;
    z-index: 10;
    max-width: 960px;
    margin: 0 auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .cuban-tribute-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 1rem;
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(212, 175, 55, 0.3);
    backdrop-filter: blur(12px);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--color-stone);
    margin-bottom: 1.25rem;
  }

  .flag-mini {
    border-radius: 2px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  }

  .hero-title {
    font-size: clamp(2.2rem, 5vw, 3.8rem);
    line-height: 1.12;
    margin-bottom: 1rem;
    color: #ffffff;
  }

  .highlight-dignity {
    color: #ffffff;
    position: relative;
  }

  .highlight-dignity::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-cuban-red), var(--color-memorial-gold));
    border-radius: 2px;
  }

  .hero-subtitle {
    font-size: clamp(0.95rem, 1.8vw, 1.15rem);
    color: #a4b4c0;
    max-width: 700px;
    margin: 0 auto 1.75rem;
    line-height: 1.55;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2.25rem;
  }

  .btn-hero {
    padding: 0.85rem 1.8rem;
    font-size: 0.98rem;
  }

  .quick-search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(12px);
    padding: 0.35rem 0.35rem 0.35rem 0.9rem;
    border-radius: var(--radius);
    width: 100%;
    max-width: 420px;
  }

  .quick-search-box input {
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 0.9rem;
    padding: 0.4rem 0;
    box-shadow: none !important;
  }

  .quick-search-box input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .btn-search-quick {
    min-height: 38px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  /* TRUST BAR */
  .trust-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    padding: 0.75rem 1.5rem;
    background: rgba(14, 39, 56, 0.6);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: var(--radius-pill);
    backdrop-filter: blur(12px);
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--color-stone);
  }

  .trust-item svg {
    color: var(--gold);
  }

  .trust-divider {
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 0.2);
  }

  .scroll-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 1.5rem;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
    opacity: 0.8;
    text-decoration: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .scroll-indicator:hover {
    opacity: 1;
    transform: translateY(3px);
  }

  .trust-item svg {
    color: var(--gold);
  }

  .trust-divider {
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 0.2);
  }

  /* SECCIÓN PROCESO */
  .process-section {
    max-width: 1140px;
    margin: 0 auto;
    padding: 5rem 1.5rem;
  }

  .section-header {
    text-align: center;
    max-width: 640px;
    margin: 0 auto 3.5rem;
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
    font-size: 1.05rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
  }

  .process-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.75rem;
  }

  .process-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .process-card.highlight {
    border-color: var(--color-border-gold);
    background: linear-gradient(180deg, var(--surface) 0%, rgba(212, 175, 55, 0.04) 100%);
  }

  .process-num {
    font-family: var(--font-serif);
    font-size: 2.8rem;
    font-weight: 700;
    line-height: 1;
    color: var(--text-muted);
    opacity: 0.4;
    margin-bottom: 1rem;
  }

  .process-num.gold {
    color: var(--gold);
    opacity: 1;
  }

  .process-card h3 {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
  }

  .process-card p {
    font-size: 0.95rem;
    color: var(--text);
    flex-grow: 1;
  }

  .card-footer-badge {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  /* MANIFIESTO */
  .manifesto-section {
    max-width: 1140px;
    margin: 0 auto 5rem;
    padding: 0 1.5rem;
  }

  .manifesto-card {
    padding: clamp(2.5rem, 5vw, 4rem);
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
    font-size: clamp(1.6rem, 3.2vw, 2.4rem);
    margin-bottom: 1.25rem;
  }

  .manifesto-body {
    font-size: 1.1rem;
    color: var(--color-stone);
    max-width: 780px;
    margin-bottom: 2rem;
  }

  .manifesto-bullets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .bullet-item {
    display: flex;
    gap: 1rem;
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

  /* CTA FINAL */
  .cta-banner {
    background: radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.12) 0%, var(--color-obsidian-deep) 80%);
    padding: 5rem 1.5rem;
    text-align: center;
    border-top: 1px solid var(--color-border-gold);
  }

  .cta-inner {
    max-width: 640px;
    margin: 0 auto;
  }

  .cta-banner h2 {
    font-size: clamp(2rem, 4vw, 3rem);
    margin-bottom: 1rem;
  }

  .cta-banner p {
    font-size: 1.1rem;
    color: var(--color-stone);
    margin-bottom: 2rem;
  }

  @media (max-width: 640px) {
    .trust-bar {
      flex-direction: column;
      border-radius: var(--radius);
    }
    .trust-divider {
      display: none;
    }
    .quick-search-box {
      flex-direction: column;
      align-items: stretch;
    }
    .btn-search-quick {
      width: 100%;
    }
  }
</style>
