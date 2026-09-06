<script lang="ts">
  import { onMount } from 'svelte';
  import { irAAdmin } from '../../lib/stores/router';
  import { executeApi, ApiError } from '../../lib/appwrite';
  import type { EstadoSolicitud } from '../../lib/types';

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
    { value: 'sin_verificar', label: 'Sin Verificar (KYC)' },
    { value: 'verificado', label: 'Verificados' },
    { value: 'cerrado', label: 'Cerrados' },
  ];

  const estadoLabel: Record<string, string> = {
    pendiente: 'Pendiente',
    sin_verificar: 'Sin Verificar',
    verificado: 'Verificado',
    cerrado: 'Cerrado',
  };

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
    cargar(0);
  }

  onMount(() => cargar(0));
</script>

<div class="list-wrap">
  <div class="list-header">
    <div>
      <span class="eyebrow">Gestión de Casos</span>
      <h1 class="serif-title">Expedientes de Solicitudes</h1>
    </div>
    <button class="btn btn-secondary" onclick={() => irAAdmin('dashboard')}>
      ← Volver al Dashboard
    </button>
  </div>

  <!-- BARRA DE FILTROS -->
  <div class="filter-card card animate-fade-in">
    <div class="filter-controls">
      <div class="select-group">
        <label for="filtro-estado">Filtrar Estado:</label>
        <select id="filtro-estado" bind:value={filtroEstado} onchange={aplicarFiltro} disabled={cargando}>
          {#each ESTADOS as e}
            <option value={e.value}>{e.label}</option>
          {/each}
        </select>
      </div>

      <span class="count-badge">{total} expediente{total !== 1 ? 's' : ''}</span>
    </div>
  </div>

  {#if errorMsg}
    <div class="error-banner" role="alert">{errorMsg}</div>
  {/if}

  <!-- TABLA DE EXPEDIENTES -->
  <div class="table-card card animate-fade-in" class:loading={cargando}>
    {#if solicitudes.length === 0 && !cargando}
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <h3>No se encontraron expedientes</h3>
        <p>No existen solicitudes registradas{filtroEstado ? ` en estado "${estadoLabel[filtroEstado]}"` : ''}.</p>
      </div>
    {:else}
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Familiar Solicitante</th>
              <th>Persona Buscada</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {#each solicitudes as s (s.id)}
              <tr onclick={() => irAAdmin('detalle', s.id)} class="clickable-row">
                <td>
                  <code class="codigo">{s.codigoSeguimiento}</code>
                </td>
                <td>
                  <span class="name">{s.nombreFamiliar}</span>
                  <span class="email-sub">{s.email}</span>
                </td>
                <td>
                  <span class="buscado-name">{s.nombrePersona}</span>
                  <span class="relacion-tag">{s.relacion}</span>
                </td>
                <td>
                  {#if s.estado === 'verificado'}
                    <span class="badge badge-positive">✓ Verificado</span>
                  {:else if s.estado === 'sin_verificar'}
                    <span class="badge badge-progress">⚡ Sin Verificar</span>
                  {:else if s.estado === 'cerrado'}
                    <span class="badge">Cerrado</span>
                  {:else}
                    <span class="badge badge-progress">Pendiente</span>
                  {/if}
                </td>
                <td class="date">
                  {new Date(s.fechaCreacion).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick={(e) => { e.stopPropagation(); irAAdmin('detalle', s.id); }}>
                    Ver Expediente →
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- PAGINACIÓN -->
      {#if total > limit}
        <div class="pagination">
          <span class="pag-info">Mostrando {offset + 1}–{Math.min(offset + limit, total)} de {total}</span>
          <div class="pag-buttons">
            <button
              class="btn btn-secondary btn-sm"
              disabled={offset === 0 || cargando}
              onclick={() => cargar(offset - limit)}
            >
              ← Anterior
            </button>
            <button
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

  .table-card.loading {
    opacity: 0.6;
  }

  .table-responsive {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  th, td {
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
    transition: background 0.2s ease;
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

  .name {
    display: block;
    font-weight: 600;
    color: var(--text-h);
  }

  .email-sub {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .buscado-name {
    display: block;
    font-weight: 600;
    color: var(--text-h);
  }

  .relacion-tag {
    font-size: 0.78rem;
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

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
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
</style>
