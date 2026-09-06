<script lang="ts">
  import { onMount } from 'svelte';
  import { irAAdmin, irAPublica } from '../../lib/stores/router';
  import { sessionUser, logout } from '../../lib/stores/session';
  import { executeApi } from '../../lib/appwrite';

  type StatsResult = {
    solicitudes: { estado: string }[];
    total: number;
  };

  let stats = $state({ pendientes: 0, sin_verificar: 0, verificado: 0, cerrado: 0, total: 0 });
  let cargando = $state(true);
  let saliendo = $state(false);

  onMount(async () => {
    try {
      const [p, sv, v, c] = await Promise.allSettled([
        executeApi<StatsResult>('solicitudes.list', { estado: 'pendiente', limit: 1 }),
        executeApi<StatsResult>('solicitudes.list', { estado: 'sin_verificar', limit: 1 }),
        executeApi<StatsResult>('solicitudes.list', { estado: 'verificado', limit: 1 }),
        executeApi<StatsResult>('solicitudes.list', { estado: 'cerrado', limit: 1 }),
      ]);
      stats = {
        pendientes: p.status === 'fulfilled' ? p.value.total : 0,
        sin_verificar: sv.status === 'fulfilled' ? sv.value.total : 0,
        verificado: v.status === 'fulfilled' ? v.value.total : 0,
        cerrado: c.status === 'fulfilled' ? c.value.total : 0,
        total:
          (p.status === 'fulfilled' ? p.value.total : 0) +
          (sv.status === 'fulfilled' ? sv.value.total : 0) +
          (v.status === 'fulfilled' ? v.value.total : 0) +
          (c.status === 'fulfilled' ? c.value.total : 0),
      };
    } catch {
      // silencioso
    } finally {
      cargando = false;
    }
  });

  async function handleLogout() {
    saliendo = true;
    await logout();
    irAAdmin('login');
  }
</script>

<div class="dash-wrap">
  <div class="dash-header glass-panel animate-fade-in">
    <div>
      <span class="eyebrow">Módulo Operativo</span>
      <h1 class="serif-title text-gradient-gold">Dashboard de Gestión</h1>
      {#if $sessionUser}
        <p class="welcome">
          Operador Activo: <strong>{$sessionUser.name || $sessionUser.email}</strong>
        </p>
      {/if}
    </div>

    <div class="dash-actions">
      <button class="btn btn-secondary" onclick={() => irAPublica('home')}>
        Sitio Público
      </button>
      <button class="btn btn-danger" onclick={handleLogout} disabled={saliendo}>
        {saliendo ? 'Saliendo...' : 'Cerrar Sesión'}
      </button>
    </div>
  </div>

  <!-- METRICAS KPI -->
  <div class="kpi-grid animate-fade-in" class:loading={cargando}>
    <div class="kpi-card card">
      <div class="kpi-icon gold">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div>
        <span class="num">{cargando ? '–' : stats.pendientes}</span>
        <span class="kpi-label">Pendientes</span>
      </div>
    </div>

    <div class="kpi-card card">
      <div class="kpi-icon amber">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
      <div>
        <span class="num amber">{cargando ? '–' : stats.sin_verificar}</span>
        <span class="kpi-label">Sin Verificar (KYC)</span>
      </div>
    </div>

    <div class="kpi-card card">
      <div class="kpi-icon teal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div>
        <span class="num teal">{cargando ? '–' : stats.verificado}</span>
        <span class="kpi-label">Verificados</span>
      </div>
    </div>

    <div class="kpi-card card">
      <div class="kpi-icon muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <div>
        <span class="num muted">{cargando ? '–' : stats.cerrado}</span>
        <span class="kpi-label">Cerrados</span>
      </div>
    </div>
  </div>

  <div class="action-banner card animate-fade-in">
    <div>
      <h3>Administración de Expedientes</h3>
      <p>Revisa solicitudes pendientes, activa sesiones KYC Didit o asigna notas internas de seguimiento.</p>
    </div>
    <button class="btn btn-gold" onclick={() => irAAdmin('solicitudes')}>
      <span>Gestionar Expedientes</span>
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .dash-wrap {
    width: 100%;
    max-width: 1080px;
    margin: 2rem auto 5rem;
    padding: 0 1.5rem;
    box-sizing: border-box;
  }

  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding: 2rem 2.5rem;
    margin-bottom: 2rem;
    background: var(--color-obsidian-navy);
    color: #ffffff;
    border: 1px solid var(--color-border-gold);
  }

  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.35rem;
  }

  .dash-header h1 {
    font-size: 2rem;
    margin: 0 0 0.35rem;
  }

  .welcome {
    margin: 0;
    color: #a4b4c0;
    font-size: 0.92rem;
  }

  .dash-actions {
    display: flex;
    gap: 0.75rem;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .kpi-grid.loading {
    opacity: 0.6;
  }

  .kpi-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
  }

  .kpi-icon {
    width: 46px;
    height: 46px;
    border-radius: var(--radius);
    display: grid;
    place-items: center;
    background: var(--surface-muted);
    color: var(--text-h);
  }

  .kpi-icon.gold { background: rgba(212, 175, 55, 0.15); color: var(--gold); }
  .kpi-icon.amber { background: rgba(230, 160, 40, 0.15); color: #d97706; }
  .kpi-icon.teal { background: rgba(42, 157, 143, 0.15); color: var(--positive); }
  .kpi-icon.muted { background: rgba(120, 135, 148, 0.15); color: var(--text-muted); }

  .num {
    display: block;
    font-family: var(--font-serif);
    font-size: 2.2rem;
    font-weight: 700;
    line-height: 1;
    color: var(--text-h);
  }

  .num.amber { color: #d97706; }
  .num.teal { color: var(--positive); }
  .num.muted { color: var(--text-muted); }

  .kpi-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .action-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding: 2rem;
    background: linear-gradient(135deg, var(--surface) 0%, rgba(212, 175, 55, 0.05) 100%);
    border-color: var(--color-border-gold);
  }

  .action-banner h3 {
    font-size: 1.25rem;
    margin-bottom: 0.4rem;
  }

  .action-banner p {
    color: var(--text-muted);
    margin: 0;
    max-width: 540px;
  }
</style>
