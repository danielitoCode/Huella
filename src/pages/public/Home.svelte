<script lang="ts">
  import { irAPublica } from '../../lib/stores/router';
</script>

<!-- SECCIÓN 01 — HERO -->
<section class="hero-full">
  <p class="mark">Huella</p>
  <p class="tagline">Verdad · Memoria · Dignidad</p>
  <hr class="trail-line" />
  <h1>
    Para quienes esperan<br />
    respuestas.
  </h1>
  <p class="sub">
    Para quienes merecen<br />
    ser encontrados.
  </p>
  <div class="hero-cta">
    <button type="button" class="btn btn-primary hero-btn" onclick={() => irAPublica('solicitud')}>
      Comenzar una búsqueda
    </button>
  </div>
</section>

<!-- SECCIÓN 02 — DECLARACIÓN -->
<section class="band-ivory declaration">
  <div class="inner">
    <h2 class="display-block">
      Una búsqueda<br />
      comienza con<br />
      una historia.
    </h2>
  </div>
</section>

<!-- SECCIÓN 03 — IDENTIFICACIÓN -->
<section class="band-ivory block">
  <div class="inner">
    <p class="section-num" aria-hidden="true">01</p>
    <hr class="trail-line" />
    <h2>
      Identificamos<br />
      la información<br />
      disponible.
    </h2>
    <p class="desc">
      Registramos lo que la familia conoce y lo que aún no está confirmado, sin convertir una
      declaración en un hecho.
    </p>
  </div>
</section>

<!-- SECCIÓN 04 — EVIDENCIAS -->
<section class="band-dark block">
  <div class="inner">
    <p class="section-num" aria-hidden="true">02</p>
    <hr class="trail-line" />
    <h2>
      Recopilamos<br />
      las huellas<br />
      que permanecen.
    </h2>
    <p class="desc on-dark">
      Documentos, referencias y evidencias se organizan con trazabilidad. Nunca se marcan como
      verificadas de forma automática.
    </p>
  </div>
</section>

<!-- SECCIÓN 05 — INVESTIGACIÓN -->
<section class="band-ivory block">
  <div class="inner">
    <p class="section-num" aria-hidden="true">03</p>
    <hr class="trail-line" />
    <h2>
      Buscamos<br />
      respuestas<br />
      con rigor.
    </h2>
    <p class="desc">
      El equipo investiga y comunica solo lo que la información documental permite sostener, con
      claridad sobre lo que aún no sabemos.
    </p>
  </div>
</section>

<!-- SECCIÓN — NO SON SOLO DATOS -->
<section class="band-ivory block names">
  <div class="inner wide">
    <h2 class="names-title">
      No son solo datos.<br />
      Son personas.<br />
      Son historias.<br />
      <span class="soft">Son familias que esperan respuestas.</span>
    </h2>
    <div class="abstract-grid" aria-hidden="true">
      <div class="abstract-card"><span class="sym">○</span><span>Historia</span></div>
      <div class="abstract-card"><span class="sym">◇</span><span>Historia</span></div>
      <div class="abstract-card"><span class="sym">◌</span><span>Historia</span></div>
    </div>
  </div>
</section>

<!-- SECCIÓN 06 — CTA -->
<section class="band-midnight cta-band">
  <div class="inner">
    <h2>
      Si estás buscando<br />
      a alguien,
    </h2>
    <p class="cta-line">empieza aquí.</p>
    <button type="button" class="btn btn-primary hero-btn" onclick={() => irAPublica('solicitud')}>
      Iniciar solicitud
    </button>
  </div>
</section>

<style>
  .mark {
    font-family: var(--font-display);
    font-size: 1rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    margin: 0 0 0.75rem;
  }

  .tagline {
    margin: 0;
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.7;
    color: var(--color-stone);
  }

  .sub {
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 2.5vw, 1.65rem);
    color: rgba(232, 229, 223, 0.75);
    margin: 0.5rem 0 0;
    line-height: 1.35;
  }

  .hero-cta {
    margin-top: 2rem;
  }

  .hero-btn {
    background: var(--color-stone);
    color: var(--color-obsidian-navy);
    border-color: var(--color-stone);
  }

  .hero-btn:hover:not(:disabled) {
    background: var(--color-ivory);
    border-color: var(--color-ivory);
    color: var(--color-obsidian-navy);
  }

  .inner {
    max-width: 40rem;
    margin: 0 auto;
  }

  .inner.wide {
    max-width: 52rem;
  }

  .declaration {
    text-align: left;
  }

  .display-block {
    font-size: clamp(2.5rem, 7vw, 4.5rem);
    line-height: 1.05;
    margin: 0;
  }

  .block h2 {
    margin-bottom: 1rem;
  }

  .desc {
    color: var(--color-text-secondary);
    font-size: 1.05rem;
    margin: 0;
    max-width: 32rem;
  }

  .desc.on-dark {
    color: rgba(232, 229, 223, 0.78);
  }

  .names-title {
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    line-height: 1.2;
    margin-bottom: 2rem;
  }

  .soft {
    color: var(--color-text-muted);
  }

  @media (prefers-color-scheme: dark) {
    .soft {
      color: rgba(232, 229, 223, 0.55);
    }
  }

  .abstract-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .abstract-card {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    background: var(--surface);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .sym {
    font-size: 1.75rem;
    color: var(--gold);
    opacity: 0.85;
  }

  .cta-band {
    text-align: left;
  }

  .cta-band h2 {
    margin-bottom: 0.25rem;
  }

  .cta-line {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2rem);
    color: var(--gold);
    margin: 0 0 1.75rem;
  }
</style>
