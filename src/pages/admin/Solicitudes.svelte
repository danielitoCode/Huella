<script lang="ts">
  import { irAAdmin } from '../../lib/stores/router';
  import type { EstadoSolicitud, Solicitud } from '../../lib/types';

  // Mock temporal. El esquema C reemplazará esta fuente por el caso de uso/API de backoffice.
  const solicitudes: Solicitud[] = [
    {
      id: '1',
      nombreFamiliar: 'María González',
      email: 'maria@example.com',
      nombreFallecido: 'Carlos González',
      relacion: 'Madre',
      descripcion: 'Necesito orientación sobre el caso de mi familiar.',
      estado: 'pendiente',
      fechaCreacion: '2026-09-01',
    },
    {
      id: '2',
      nombreFamiliar: 'José Pérez',
      email: 'jose@example.com',
      nombreFallecido: 'Luis Pérez',
      relacion: 'Hermano',
      descripcion: 'Solicitud en espera de verificación de identidad.',
      estado: 'sin_verificar',
      fechaCreacion: '2026-08-28',
    },
    {
      id: '3',
      nombreFamiliar: 'Ana Rodríguez',
      email: 'ana@example.com',
      nombreFallecido: 'Pedro Rodríguez',
      relacion: 'Esposa',
      descripcion: 'Expediente con identidad verificada.',
      estado: 'verificado',
      fechaCreacion: '2026-08-20',
    },
  ];

  const estadoLabel: Record<EstadoSolicitud, string> = {
    pendiente: 'Pendiente',
    sin_verificar: 'Sin verificar',
    verificado: 'Verificado',
    cerrado: 'Cerrado',
  };
</script>

<section>
  <div class="top">
    <h1>Solicitudes</h1>
    <button class="back" onclick={() => irAAdmin('dashboard')}>← Dashboard</button>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Familiar</th>
          <th>Persona buscada</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each solicitudes as s}
          <tr>
            <td>{s.nombreFamiliar}</td>
            <td>{s.nombreFallecido}</td>
            <td><span class="badge {s.estado}">{estadoLabel[s.estado]}</span></td>
            <td>{s.fechaCreacion}</td>
            <td>
              <button class="link" onclick={() => irAAdmin('detalle', s.id)}>
                Ver
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .back { background: transparent; border: 1px solid var(--border); padding: 8px 14px; border-radius: 6px; cursor: pointer; color: var(--text); }
  .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; }
  table { width: 100%; border-collapse: collapse; text-align: left; }
  th, td { padding: 12px 16px; border-bottom: 1px solid var(--border); }
  th { background: var(--code-bg); font-weight: 500; color: var(--text-h); }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 0.8rem; }
  .pendiente { background: #fef3c7; color: #92400e; }
  .sin_verificar { background: #dbeafe; color: #1e40af; }
  .verificado { background: #d1fae5; color: #065f46; }
  .cerrado { background: #e5e7eb; color: #374151; }
  .link { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 0.95rem; }
</style>
