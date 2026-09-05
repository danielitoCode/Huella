<script lang="ts">
  import { router, irAAdmin } from '../../lib/stores/router';
  import type { Solicitud, EstadoSolicitud } from '../../lib/types';

  // Mock: en producción se buscaría por $router.solicitudId
  const solicitud: Solicitud = {
    id: $router.solicitudId ?? '1',
    nombreFamiliar: 'María González',
    email: 'maria@example.com',
    telefono: '+53 5 123 4567',
    nombreFallecido: 'Carlos González',
    relacion: 'Madre',
    descripcion:
      'Hijo desaparecido en el frente. Última comunicación en marzo de 2024. Necesito orientación sobre cómo proceder y posibles vías de información.',
    estado: 'pendiente',
    fechaCreacion: '2026-09-01',
  };

  let estado = $state<EstadoSolicitud>(solicitud.estado);
  let notas = $state(solicitud.notasAdmin ?? '');

  function guardar() {
    // TODO: llamar API para actualizar estado y notas
    console.log('Actualizar solicitud', solicitud.id, { estado, notas });
    alert('Cambios guardados (mock)');
  }
</script>

<section class="detalle">
  <button class="back" onclick={() => irAAdmin('solicitudes')}>← Volver a solicitudes</button>

  <h1>Solicitud #{solicitud.id}</h1>

  <div class="grid">
    <div class="block">
      <h2>Datos del familiar</h2>
      <p><strong>Nombre:</strong> {solicitud.nombreFamiliar}</p>
      <p><strong>Email:</strong> {solicitud.email}</p>
      {#if solicitud.telefono}
        <p><strong>Teléfono:</strong> {solicitud.telefono}</p>
      {/if}
    </div>

    <div class="block">
      <h2>Datos del fallecido</h2>
      <p><strong>Nombre:</strong> {solicitud.nombreFallecido}</p>
      <p><strong>Relación:</strong> {solicitud.relacion}</p>
    </div>
  </div>

  <div class="block">
    <h2>Descripción</h2>
    <p>{solicitud.descripcion}</p>
  </div>

  <div class="block actions-block">
    <h2>Gestión</h2>
    <label>
      Estado
      <select bind:value={estado}>
        <option value="pendiente">Pendiente</option>
        <option value="en_revision">En revisión</option>
        <option value="en_proceso">En proceso</option>
        <option value="resuelta">Resuelta</option>
        <option value="rechazada">Rechazada</option>
      </select>
    </label>

    <label>
      Notas del operador
      <textarea bind:value={notas} rows="4" placeholder="Añade notas internas..."></textarea>
    </label>

    <button class="save" onclick={guardar}>Guardar cambios</button>
  </div>
</section>

<style>
  .back {
    background: transparent;
    border: 1px solid var(--border);
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text);
    margin-bottom: 20px;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  .block {
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 16px;
    text-align: left;
  }

  .block h2 {
    margin-bottom: 12px;
  }

  .block p {
    margin: 6px 0;
  }

  .actions-block label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
    color: var(--text-h);
  }

  select,
  textarea {
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    font: inherit;
    background: var(--bg);
    color: var(--text-h);
  }

  .save {
    background: var(--accent);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
