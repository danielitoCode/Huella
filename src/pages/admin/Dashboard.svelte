<script lang="ts">
  import { onMount } from 'svelte';
  import { irAAdmin, irAPublica } from '../../lib/stores/router';
  import { sessionUser, sessionLoading, logout } from '../../lib/stores/session';
  import { getSolicitudRepository } from '../../lib/data/repositories';
  import Skeleton from '../../components/ui/Skeleton.svelte';
  import LoadingHint from '../../components/ui/LoadingHint.svelte';

  type StatsResult = {
    solicitudes: { estado: string }[];
    total: number;
  };

  let stats = $state({
    pendientes: 0,
    sin_verificar: 0,
    verificado: 0,
    cerrado: 0,
    cancelada: 0,
    total: 0,
  });
  let cargando = $state(true);
  let saliendo = $state(false);

  onMount(async () => {
    try {
      const results = await Promise.allSettled([
        getSolicitudRepository().list({ estado: 'pendiente', limit: 1 }),
        getSolicitudRepository().list({ estado: 'sin_verificar', limit: 1 }),
        getSolicitudRepository().list({ estado: 'verificado', limit: 1 }),
        getSolicitudRepository().list({ estado: 'cerrado', limit: 1 }),
        getSolicitudRepository().list({ estado: 'cancelada', limit: 1 }),
      ]);
      const totals = results.map((r) => (r.status === 'fulfilled' ? r.value.total : 0));
      stats = {
        pendientes: totals[0],
        sin_verificar: totals[1],
        verificado: totals[2],
        cerrado: totals[3],
        cancelada: totals[4],
        total: totals.reduce((a, b) => a + b, 0),
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
      <span class="eyebrow">Módulo operativo</span>
      <h1 class="serif-title text-gradient-gold">Dashboard de gestión</h1>
      {#if $sessionLoading}
        <p class="welcome loading-line">
          <Skeleton width="14rem" height="0.95rem" />
        </p>
      {:else if $sessionUser}
        <p class="welcome">
          Operador activo: <strong>{$sessionUser.name || $sessionUser.email}</strong>
        </p>
      {/if}
    </div>

    <div class="dash-actions">
      <button type="button" class="btn btn-secondary" onclick={() => irAPublica('home')}>
        Sitio público
      </button>
      <button type="button" class="btn btn-danger" onclick={handleLogout} disabled={saliendo}>
        {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
      </button>
    </div>
  </div>

  {#if cargando}
    <div class="load-banner">
      <LoadingHint message="Sincronizando métricas con Appwrite…" />
    </div>
  {/if}

  <div class="kpi-grid animate-fade-in" aria-busy={cargando}>
    {#each [
      { key: 'pendientes', label: 'Pendientes', class: '' },
      { key: 'sin_verificar', label: 'Atendidos · sin verificar', class: 'amber' },
      { key: 'verificado', label: 'Verificados', class: 'teal' },
      { key: 'cerrado', label: 'Cerrados', class: 'muted' },
    ] as card}
      <div class="kpi-card card">
        <div class="kpi-icon {card.class || 'gold'}"></div>
        <div class="kpi-body">
          {#if cargando}
            <Skeleton width="3rem" height="2rem" radius="8px" />
            <Skeleton width="6.5rem" height="0.75rem" />
          {:else}
            <span class="num {card.class}">
              {stats[card.key as keyof typeof stats]}
            </span>
            <span class="kpi-label">{card.label}</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div class="action-banner card animate-fade-in">
    <div>
      <h3>Administración de expedientes</h3>
      <p>
        Revisa solicitudes pendientes, activa KYC Didit o registra notas internas de seguimiento.
      </p>
    </div>
    <button type="button" class="btn btn-gold" onclick={() => irAAdmin('solicitudes')}>
      Gestionar expedientes
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
    margin-bottom: 1.25rem;
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

  .loading-line {
    display: flex;
    align-items: center;
    min-height: 1.2rem;
  }

  .dash-actions {
    display: flex;
    gap: 0.75rem;
  }

  .load-banner {
    margin-bottom: 1rem;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .kpi-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
  }

  .kpi-body {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  .kpi-icon {
    width: 46px;
    height: 46px;
    border-radius: var(--radius);
    flex-shrink: 0;
    background: rgba(212, 175, 55, 0.15);
  }

  .kpi-icon.amber {
    background: rgba(230, 160, 40, 0.15);
  }
  .kpi-icon.teal {
    background: rgba(42, 157, 143, 0.15);
  }
  .kpi-icon.muted {
    background: rgba(120, 135, 148, 0.15);
  }

  .num {
    display: block;
    font-family: var(--font-serif, var(--font-display));
    font-size: 2.2rem;
    font-weight: 700;
    line-height: 1;
    color: var(--text-h);
  }

  .num.amber {
    color: #d97706;
  }
  .num.teal {
    color: var(--positive);
  }
  .num.muted {
    color: var(--text-muted);
  }

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
