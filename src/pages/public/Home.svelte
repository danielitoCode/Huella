<script lang="ts">
  import { irAPublica } from '../../lib/stores/router';
</script>

<section class="hero-section">
  <h1>Huella</h1>
  <p class="lead">
    Plataforma de apoyo para familiares cubanos que han perdido seres queridos
    en el conflicto Rusia-Ucrania.
  </p>
  <p>
    Aquí puedes registrar tu caso de forma segura. Un equipo especializado
    revisará tu solicitud y te acompañará en el proceso.
  </p>
  <button class="cta" onclick={() => irAPublica('solicitud')}>
    Enviar una solicitud
  </button>
</section>

<section class="info">
  <div class="card">
    <h2>¿Para quién es?</h2>
    <p>Familiares residentes en Cuba o en el exterior que necesitan orientación y acompañamiento.</p>
  </div>
  <div class="card">
    <h2>¿Cómo funciona?</h2>
    <p>Completas un formulario, el equipo lo recibe en el backoffice y te contacta para dar seguimiento.</p>
  </div>
  <div class="card">
    <h2>Privacidad</h2>
    <p>Tus datos se tratan con confidencialidad y solo se usan para gestionar tu caso.</p>
  </div>
</section>

<style>
  .hero-section {
    text-align: center;
    max-width: 640px;
    margin: 0 auto 48px;
  }

  .lead {
    font-size: 1.2rem;
    color: var(--text-h);
    margin-bottom: 16px;
  }

  .cta {
    margin-top: 24px;
    background: var(--accent);
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
  }

  .cta:hover {
    filter: brightness(1.05);
  }

  .info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
  }

  .card {
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    background: var(--bg);
    text-align: left;
  }

  .card h2 {
    margin-bottom: 8px;
  }
</style>
