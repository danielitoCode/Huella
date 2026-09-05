<script lang="ts">
  import { irAAdmin } from '../../lib/stores/router';

  // Datos de ejemplo (luego vendrán de la API)
  const stats = {
    pendientes: 3,
    enRevision: 1,
    enProceso: 2,
    resueltas: 5,
  };
</script>

<section>
  <h1>Dashboard</h1>
  <p class="subtitle">Resumen de solicitudes en la plataforma</p>

  <div class="stats">
    <div class="stat">
      <span class="num">{stats.pendientes}</span>
      <span class="label">Pendientes</span>
    </div>
    <div class="stat">
      <span class="num">{stats.enRevision}</span>
      <span class="label">En revisión</span>
    </div>
    <div class="stat">
      <span class="num">{stats.enProceso}</span>
      <span class="label">En proceso</span>
    </div>
    <div class="stat">
      <span class="num">{stats.resueltas}</span>
      <span class="label">Resueltas</span>
    </div>
  </div>

  <button class="cta" onclick={() => irAAdmin('solicitudes')}>
    Ver todas las solicitudes
  </button>
</section>

<style>
  .subtitle {
    color: var(--text);
    margin-bottom: 28px;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .stat {
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
  }

  .num {
    display: block;
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-h);
  }

  .label {
    font-size: 0.9rem;
    color: var(--text);
  }

  .cta {
    background: var(--accent);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
