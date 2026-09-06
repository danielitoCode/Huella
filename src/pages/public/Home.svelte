<script lang="ts">
  import { irAPublica } from '../../lib/stores/router';
</script>

<section class="hero-institutional">
  <p class="tagline">Verdad · Dignidad · Regreso</p>
  <h1>Buscamos respuestas. Protegemos la verdad.</h1>
  <p class="lead">
    Una plataforma documental para ayudar a familias a localizar, verificar y documentar
    información sobre sus seres queridos.
  </p>
  <div class="hero-actions">
    <button type="button" class="btn btn-primary" onclick={() => irAPublica('solicitud')}>
      Iniciar una solicitud
    </button>
    <a class="btn btn-secondary hero-secondary" href="#como-funciona">Cómo funciona</a>
  </div>
</section>

<section id="como-funciona" class="section">
  <h2>Cómo funciona</h2>
  <ol class="steps">
    <li>
      <span class="step-n">01</span>
      <div>
        <h3>Cuéntanos a quién buscas</h3>
        <p>Registras los datos de la persona y tu relación con ella.</p>
      </div>
    </li>
    <li>
      <span class="step-n">02</span>
      <div>
        <h3>Verificamos identidad cuando corresponde</h3>
        <p>KYC protege a las familias y reduce solicitudes fraudulentas.</p>
      </div>
    </li>
    <li>
      <span class="step-n">03</span>
      <div>
        <h3>Investigamos y documentamos</h3>
        <p>El equipo revisa evidencias y distingue lo declarado de lo verificado.</p>
      </div>
    </li>
    <li>
      <span class="step-n">04</span>
      <div>
        <h3>Comunicamos con transparencia</h3>
        <p>Solo confirmamos lo que la información documental permite sostener.</p>
      </div>
    </li>
  </ol>
</section>

<section class="section">
  <h2>Qué hacemos y qué no</h2>
  <div class="grid">
    <article class="card">
      <h3>Qué podemos hacer</h3>
      <p>
        Acompañar la búsqueda, organizar evidencias, verificar identidad del solicitante y
        comunicar resultados con distintos niveles de certeza.
      </p>
    </article>
    <article class="card">
      <h3>Qué no hacemos</h3>
      <p>
        No custodiamos dinero, no procesamos pagos, no garantizamos localizar a una persona ni
        sustituimos a una autoridad o tribunal.
      </p>
    </article>
    <article class="card">
      <h3>Privacidad</h3>
      <p>
        Los datos se usan para gestionar el expediente. No mostramos información biométrica del
        KYC en la interfaz familiar.
      </p>
    </article>
  </div>
</section>

<style>
  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  /* Secondary sobre fondo institucional: borde claro */
  .hero-secondary {
    color: var(--text-on-deep);
    border-color: rgba(232, 238, 242, 0.45);
  }

  .hero-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--brand-gold);
    color: var(--text-on-deep);
  }

  .section {
    margin-bottom: 2.5rem;
  }

  .section h2 {
    margin-bottom: 1.25rem;
  }

  .steps {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .steps li {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem 1.15rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .step-n {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.35rem;
    color: var(--brand-gold);
    line-height: 1;
    min-width: 2rem;
  }

  .steps h3 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
  }

  .steps p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  .card h3 {
    margin-top: 0;
  }

  .card p {
    margin-bottom: 0;
    color: var(--text);
  }
</style>
