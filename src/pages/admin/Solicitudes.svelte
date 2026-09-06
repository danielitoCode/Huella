<script lang="ts">
  import { irAAdmin } from '../../lib/stores/router';
  import type { Solicitud } from '../../lib/types';

  // Datos de ejemplo (mock)
  const solicitudes: Solicitud[] = [
    {
      id: '1',
      nombreFamiliar: 'María González',
      email: 'maria@example.com',
      nombreFallecido: 'Carlos González',
      relacion: 'Madre',
      descripcion: 'Hijo desaparecido en el frente...',
      estado: 'pendiente',
      fechaCreacion: '2026-09-01',
    },
    {
      id: '2',
      nombreFamiliar: 'José Pérez',
      email: 'jose@example.com',
      nombreFallecido: 'Luis Pérez',
      relacion: 'Hermano',
      descripcion: 'Necesito información sobre el paradero...',
      estado: 'en_revision',
      fechaCreacion: '2026-08-28',
    },
    {
      id: '3',
      nombreFamiliar: 'Ana Rodríguez',
      email: 'ana@example.com',
      nombreFallecido: 'Pedro Rodríguez',
      relacion: 'Esposa',
      descripcion: 'Confirmación de fallecimiento y repatriación...',
      estado: 'en_proceso',
      fechaCreacion: '2026-08-20',
    },
  ];

  const estadoLabel: Record<string, string> = {
    pendiente: 'Pendiente',
    en_revision: 'En revisión',
    en_proceso: 'En proceso',
    resuelta: 'Resuelta',
    rechazada: 'Rechazada',
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
          <th>Fallecido</th>
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
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .back {
    background: transparent;
    border: 1px solid var(--border);
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text);
  }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  th,
  td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }

  th {
    background: var(--code-bg);
    font-weight: 500;
    color: var(--text-h);
  }

  .badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.8rem;
  }

  .pendiente {
    background: #fef3c7;
    color: #92400e;
  }
  .en_revision {
    background: #dbeafe;
    color: #1e40af;
  }
  .en_proceso {
    background: #e0e7ff;
    color: #3730a3;
  }
  .resuelta {
    background: #d1fae5;
    color: #065f46;
  }
  .rechazada {
    background: #fee2e2;
    color: #991b1b;
  }

  .link {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: 0.95rem;
  }
</style>
