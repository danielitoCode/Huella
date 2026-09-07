<script lang="ts">
  import { onMount } from 'svelte';
  import { irAAdmin } from '../../lib/stores/router';
  import { executeApi, ApiError } from '../../lib/appwrite';
  import { ESTADO_LABEL, type EstadoSolicitud } from '../../lib/types';
  import Skeleton from '../../components/ui/Skeleton.svelte';
  import LoadingHint from '../../components/ui/LoadingHint.svelte';

  type SolicitudItem = {
    id: string;
    codigoSeguimiento: string;
    nombreFamiliar: string;
    email: string;
    nombrePersona: string;
    relacion: string;
    estado: EstadoSolicitud;
    fechaCreacion: string;
    fechaActualizacion: string;
  };

  type ListResult = {
    solicitudes: SolicitudItem[];
    total: number;
    limit: number;
    offset: number;
  };

  const ESTADOS: { value: string; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'sin_verificar', label: 'Atendidos · sin verificar' },
    { value: 'verificado', label: 'Verificados' },
    { value: 'cerrado', label: 'Cerrados' },
    { value: 'cancelada', label: 'Canceladas' },
  ];

  let filtroEstado = $state('');
  let solicitudes = $state<SolicitudItem[]>([]);
  let total = $state(0);
  let offset = $state(0);
  const limit = 20;
  let cargando = $state(true);
  let errorMsg = $state('');

  async function cargar(nuevoOffset = 0) {
    cargando = true;
    errorMsg = '';
    try {
      const payload: Record<string, unknown> = { limit, offset: nuevoOffset };
      if (filtroEstado) payload.estado = filtroEstado;
      const res = await executeApi<ListResult>('solicitudes.list', payload);
      solicitudes = res.solicitudes;
      total = res.total;
      offset = nuevoOffset;
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'No se pudieron cargar las solicitudes.';
    } finally {
      cargando = false;
    }
  }

  function aplicarFiltro() {
    void cargar(0);
  }

  onMount(() => {
    void cargar(0);
  });
</script>

<div class="list-wrap">
  <div class="list-header">
    <div>
      <span class="eyebrow">Gestión de casos</span>
      <h1 class="serif-title">Expedientes de solicitudes</h1>
    </div>
    <button type="button" class="btn btn-secondary" onclick={() => irAAdmin('dashboard')}>
      ← Volver al dashboard
    </button>
  </div>

  <div class="filter-card card">
    <div class="filter-controls">
      <div class="select-group">
        <label for="filtro-estado">Filtrar estado</label>
        <select id="filtro-estado" bind:value={filtroEstado} onchange={aplicarFiltro} disabled={cargando}>
          {#each ESTADOS as e}
            <option value={e.value}>{e.label}</option>
          {/each}
        </select>
      </div>

      {#if cargando}
        <Skeleton width="7rem" height="1rem" />
      {:else}
        <span class="count-badge">{total} expediente{total !== 1 ? 's' : ''}</span>
      {/if}
    </div>
  </div>

  {#if errorMsg}
    <div class="error-banner" role="alert">{errorMsg}</div>
  {/if}

  <div class="table-card card" aria-busy={cargando}>
    {#if cargando}
      <div class="loading-block">
        <LoadingHint message="Cargando listado de expedientes desde Appwrite…" />
        <div class="skel-rows">
          {#each [1, 2, 3, 4, 5] as i (i)}
            <div class="skel-row">
              <Skeleton width="8rem" height="0.9rem" />
              <Skeleton width="40%" height="0.9rem" />
              <Skeleton width="30%" height="0.9rem" />
              <Skeleton width="5rem" height="1.4rem" radius="999px" />
            </div>
          {/each}
        </div>
      </div>
    {:else if solicitudes.length === 0}
      <div class="empty-state">
        <h3>No se encontraron expedientes</h3>
        <p>
          No hay solicitudes{filtroEstado ? ` en estado «${ESTADO_LABEL[filtroEstado as EstadoSolicitud] ?? filtroEstado}»` : ''}.
        </p>
      </div>
    {:else}
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Familiar</th>
              <th>Persona buscada</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {#each solicitudes as s (s.id)}
              <tr class="clickable-row" onclick={() => irAAdmin('detalle', s.id)}>
                <td><code class="codigo">{s.codigoSeguimiento}</code></td>
                <td>
                  <span class="name">{s.nombreFamiliar}</span>
                  <span class="email-sub">{s.email}</span>
                </td>
                <td>
                  <span class="buscado-name">{s.nombrePersona}</span>
                  <span class="relacion-tag">{s.relacion}</span>
                </td>
                <td>
                  <span class="badge">
                    {ESTADO_LABEL[s.estado] ?? s.estado}
                  </span>
                </td>
                <td class="date">
                  {new Date(s.fechaCreacion).toLocaleDateString('es', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    onclick={(e) => {
                      e.stopPropagation();
                      irAAdmin('detalle', s.id);
                    }}
                  >
                    Ver →
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if total > limit}
        <div class="pagination">
          <span class="pag-info">
            Mostrando {offset + 1}–{Math.min(offset + limit, total)} de {total}
          </span>
          <div class="pag-buttons">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              disabled={offset === 0 || cargando}
              onclick={() => cargar(offset - limit)}
            >
              ← Anterior
            </button>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              disabled={offset + limit >= total || cargando}
              onclick={() => cargar(offset + limit)}
            >
              Siguiente →
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .list-wrap {
    max-width: 1140px;
    margin: 2rem auto 5rem;
    padding: 0 1.5rem;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }

  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 0.3rem;
  }

  .list-header h1 {
    font-size: 2rem;
    margin: 0;
  }

  .filter-card {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .filter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .select-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .select-group label {
    margin: 0;
    font-size: 0.88rem;
  }

  select {
    width: auto;
    padding: 0.5rem 1rem;
  }

  .count-badge {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .table-card {
    padding: 0;
    overflow: hidden;
  }

  .loading-block {
    padding: 1.25rem 1.5rem 1.75rem;
  }

  .skel-rows {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .skel-row {
    display: grid;
    grid-template-columns: 8rem 1fr 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--border);
  }

  .table-responsive {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  th,
  td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border);
  }

  th {
    background: var(--surface-muted);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .clickable-row {
    cursor: pointer;
  }

  .clickable-row:hover {
    background: var(--accent-bg);
  }

  .codigo {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--gold);
  }

  .name,
  .buscado-name {
    display: block;
    font-weight: 600;
    color: var(--text-h);
  }

  .email-sub,
  .relacion-tag {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .date {
    font-size: 0.85rem;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .btn-sm {
    min-height: 36px;
    padding: 0.35rem 0.85rem;
    font-size: 0.82rem;
  }

  .empty-state {
    padding: 4rem 2rem;
    text-align: center;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
  }

  .pag-info {
    font-size: 0.88rem;
    color: var(--text-muted);
  }

  .pag-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .error-banner {
    padding: 0.85rem 1rem;
    margin-bottom: 1rem;
    border-radius: var(--radius);
    background: rgba(217, 56, 58, 0.12);
    border: 1px solid rgba(217, 56, 58, 0.4);
    color: var(--color-alert, #b84c4c);
  }
</style>
