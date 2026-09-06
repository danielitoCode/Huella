<script lang="ts">
  import {
    devLogs,
    unreadErrorCount,
    clearDevLogs,
    formatLogsForClipboard,
    type LogEntry,
    type LogType,
  } from '../lib/stores/devLogger';
  import { getAppwriteConfig } from '../lib/appwrite/config';

  const isDev = import.meta.env.DEV;

  let expanded = $state(false);
  let filterType = $state<'all' | 'net' | 'api' | 'error'>('all');
  let searchQuery = $state('');
  let selectedLogId = $state<string | null>(null);
  let copiedStatus = $state('');
  let showConfig = $state(false);

  let appwriteConfig = $derived.by(() => {
    try {
      return getAppwriteConfig();
    } catch {
      return null;
    }
  });

  function toggleExpanded() {
    expanded = !expanded;
    if (expanded) {
      unreadErrorCount.set(0);
    }
  }

  function handleClear() {
    clearDevLogs();
    selectedLogId = null;
  }

  function copyAll() {
    const text = formatLogsForClipboard($devLogs);
    navigator.clipboard.writeText(text);
    copiedStatus = '¡Todos los logs copiados al portapapeles!';
    setTimeout(() => (copiedStatus = ''), 3000);
  }

  function copyLogDetail(log: LogEntry) {
    let content = `[${log.timestamp.toLocaleTimeString()}] ${log.title}\n`;
    if (log.page) content += `Página: ${log.page}\n`;
    if (log.method && log.url) content += `Petición: ${log.method} ${log.url}\n`;
    if (log.status) content += `Estado HTTP: ${log.status}\n`;
    if (log.reason) content += `Razón / Detalle: ${log.reason}\n`;
    if (log.latencyMs) content += `Latencia: ${log.latencyMs}ms\n`;
    if (log.payload !== undefined) content += `Payload Enviado:\n${JSON.stringify(log.payload, null, 2)}\n`;
    if (log.response !== undefined) content += `Respuesta API:\n${JSON.stringify(log.response, null, 2)}\n`;
    if (log.error !== undefined) content += `Detalle Error:\n${JSON.stringify(log.error, null, 2)}\n`;
    if (log.stack) content += `Stack Trace:\n${log.stack}\n`;

    navigator.clipboard.writeText(content);
    copiedStatus = `¡Log copiado!`;
    setTimeout(() => (copiedStatus = ''), 3000);
  }

  let filteredLogs = $derived(
    $devLogs.filter((log) => {
      // Filtro de categoría
      if (filterType === 'net' && !log.type.startsWith('net_')) return false;
      if (filterType === 'api' && !log.type.startsWith('api_')) return false;
      if (filterType === 'error' && log.type !== 'net_err' && log.type !== 'api_err' && log.type !== 'error') return false;

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = log.title.toLowerCase().includes(q);
        const actionMatch = log.action?.toLowerCase().includes(q) ?? false;
        const urlMatch = log.url?.toLowerCase().includes(q) ?? false;
        const reasonMatch = log.reason?.toLowerCase().includes(q) ?? false;
        return titleMatch || actionMatch || urlMatch || reasonMatch;
      }
      return true;
    }),
  );

  function getBadgeClass(type: LogType): string {
    switch (type) {
      case 'net_req':
      case 'api_req': return 'type-req';
      case 'net_res':
      case 'api_res': return 'type-res';
      case 'net_err':
      case 'api_err':
      case 'error': return 'type-err';
      case 'warn': return 'type-warn';
      default: return 'type-info';
    }
  }
</script>

{#if isDev}
  <div class="dev-logger-root">
    {#if !expanded}
      <!-- BOTÓN MINIMIZADO FLOTANTE -->
      <button
        type="button"
        class="minimized-pill"
        onclick={toggleExpanded}
        title="Abrir consola de depuración en tiempo real (solo Dev)"
      >
        <span class="pill-icon">🐛</span>
        <span class="pill-text">Dev Console</span>
        <span class="pill-count">({$devLogs.length})</span>
        {#if $unreadErrorCount > 0}
          <span class="error-badge">{$unreadErrorCount} err</span>
        {/if}
      </button>
    {:else}
      <!-- PANEL EXPANDIDO -->
      <div class="expanded-panel glass-panel animate-fade-in">
        <!-- BARRA SUPERIOR -->
        <div class="panel-header">
          <div class="header-title">
            <span class="pill-icon">⚡</span>
            <strong>Runtime Dev Console & Appwrite Logger</strong>
            <span class="dev-tag">DEV MODE</span>
          </div>
          <div class="header-controls">
            {#if copiedStatus}
              <span class="copied-msg">{copiedStatus}</span>
            {/if}
            <button type="button" class="btn-tool" onclick={() => (showConfig = !showConfig)} title="Ver variables de entorno Appwrite">
              ⚙️ Env Config
            </button>
            <button type="button" class="btn-tool" onclick={copyAll} title="Copiar historial completo en Markdown">
              📋 Copiar Todo
            </button>
            <button type="button" class="btn-tool" onclick={handleClear} title="Limpiar todos los logs">
              🗑️ Limpiar
            </button>
            <button type="button" class="btn-close" onclick={toggleExpanded} title="Minimizar panel">
              ✕
            </button>
          </div>
        </div>

        {#if showConfig && appwriteConfig}
          <div class="config-banner animate-fade-in">
            <span><strong>Endpoint:</strong> {appwriteConfig.endpoint}</span>
            <span><strong>Project ID:</strong> {appwriteConfig.projectId}</span>
            <span><strong>Function API ID:</strong> {appwriteConfig.functionApiId}</span>
            {#if appwriteConfig.endpoint.includes('<REGION>') || appwriteConfig.projectId.includes('<PROJECT_ID>')}
              <div class="config-warn">⚠️ ALERTA: Tienes valores por defecto &lt;REGION&gt; o &lt;PROJECT_ID&gt; en tu .env. Rellénalos con los de Appwrite Console.</div>
            {/if}
          </div>
        {/if}

        <!-- BARRA DE PESTAÑAS Y BÚSQUEDA -->
        <div class="panel-toolbar">
          <div class="tab-group">
            <button
              class="tab-btn"
              class:active={filterType === 'all'}
              onclick={() => (filterType = 'all')}
            >
              Todos ({$devLogs.length})
            </button>
            <button
              class="tab-btn"
              class:active={filterType === 'net'}
              onclick={() => (filterType = 'net')}
            >
              Appwrite SDK / Red
            </button>
            <button
              class="tab-btn"
              class:active={filterType === 'api'}
              onclick={() => (filterType = 'api')}
            >
              Functions API
            </button>
            <button
              class="tab-btn"
              class:active={filterType === 'error'}
              onclick={() => (filterType = 'error')}
            >
              Errores ({$devLogs.filter((l) => l.type === 'net_err' || l.type === 'api_err' || l.type === 'error').length})
            </button>
          </div>

          <div class="search-input-wrap">
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Filtrar por URL, error o acción..."
            />
          </div>
        </div>

        <!-- LISTA DE LOGS -->
        <div class="logs-list">
          {#if filteredLogs.length === 0}
            <div class="empty-logs">
              <span>No hay registros coincidentes. Las llamadas a Appwrite SDK o Functions aparecerán en tiempo real.</span>
            </div>
          {:else}
            {#each filteredLogs as log (log.id)}
              <div class="log-item" class:selected={selectedLogId === log.id} class:is-error={log.type.endsWith('err') || log.type === 'error'}>
                <!-- CABECERA DE FILA -->
                <button
                  type="button"
                  class="log-row"
                  onclick={() => (selectedLogId = selectedLogId === log.id ? null : log.id)}
                >
                  <span class="log-time">{log.timestamp.toLocaleTimeString()}</span>
                  <span class="log-type {getBadgeClass(log.type)}">{log.type.toUpperCase()}</span>
                  <span class="log-title">{log.title}</span>

                  {#if log.status}
                    <span class="log-status-badge" class:status-err={String(log.status).startsWith('4') || String(log.status).startsWith('5') || log.status === 'NETWORK_ERROR'}>
                      {log.status}
                    </span>
                  {/if}

                  {#if log.latencyMs !== undefined}
                    <span class="log-latency">{log.latencyMs}ms</span>
                  {/if}
                  <span class="expand-arrow">{selectedLogId === log.id ? '▲' : '▼'}</span>
                </button>

                <!-- DETALLE EXPANDIDO DEL LOG -->
                {#if selectedLogId === log.id}
                  <div class="log-detail animate-fade-in">
                    <div class="detail-actions">
                      <button type="button" class="btn-copy-sm" onclick={() => copyLogDetail(log)}>
                        📋 Copiar este Log y Stack Trace
                      </button>
                      {#if log.page}
                        <span class="meta-tag">Página: {log.page}</span>
                      {/if}
                    </div>

                    {#if log.url}
                      <div class="detail-block">
                        <span class="block-label">Endpoint URL:</span>
                        <code class="url-code">{log.method} {log.url}</code>
                      </div>
                    {/if}

                    {#if log.reason}
                      <div class="detail-block error-block">
                        <span class="block-label">Razón / Causa del Error:</span>
                        <p class="reason-text">{log.reason}</p>
                      </div>
                    {/if}

                    {#if log.payload !== undefined}
                      <div class="detail-block">
                        <span class="block-label">Parámetros Enviados (Payload):</span>
                        <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                      </div>
                    {/if}

                    {#if log.response !== undefined}
                      <div class="detail-block">
                        <span class="block-label">Respuesta de la API / SDK:</span>
                        <pre>{JSON.stringify(log.response, null, 2)}</pre>
                      </div>
                    {/if}

                    {#if log.error !== undefined}
                      <div class="detail-block error-block">
                        <span class="block-label">Objeto de Error Completo:</span>
                        <pre>{JSON.stringify(log.error, null, 2)}</pre>
                      </div>
                    {/if}

                    {#if log.stack}
                      <div class="detail-block stack-block">
                        <span class="block-label">Pila de Error (Stack Trace):</span>
                        <pre>{log.stack}</pre>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .dev-logger-root {
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    z-index: 99999;
    font-family: var(--font-sans);
  }

  /* BOTÓN MINIMIZADO FLOTANTE */
  .minimized-pill {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.6rem 1.1rem;
    border-radius: var(--radius-pill);
    background: #051119;
    color: #f4d068;
    border: 1px solid rgba(244, 208, 104, 0.4);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 700;
    backdrop-filter: blur(16px);
    transition: all 0.25s ease;
  }

  .minimized-pill:hover {
    transform: translateY(-2px);
    border-color: #f4d068;
    box-shadow: 0 12px 35px rgba(244, 208, 104, 0.35);
  }

  .pill-count {
    color: #a4b4c0;
    font-weight: 400;
  }

  .error-badge {
    background: #d9383a;
    color: #ffffff;
    padding: 0.15rem 0.55rem;
    border-radius: var(--radius-pill);
    font-size: 0.72rem;
    font-weight: 700;
    animation: pulse-dot 1.5s infinite;
  }

  /* PANEL EXPANDIDO */
  .expanded-panel {
    width: 720px;
    max-width: calc(100vw - 2.5rem);
    height: 520px;
    max-height: calc(100vh - 4rem);
    background: #030a0f;
    color: #e8e4dc;
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.2rem;
    background: #071927;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.95rem;
  }

  .dev-tag {
    background: rgba(244, 208, 104, 0.15);
    border: 1px solid #f4d068;
    color: #f4d068;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.12rem 0.45rem;
    border-radius: 4px;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .copied-msg {
    font-size: 0.75rem;
    color: #36bfae;
    font-weight: 600;
  }

  .btn-tool {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #ffffff;
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-sm);
    font-size: 0.78rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-tool:hover {
    background: rgba(255, 255, 255, 0.18);
  }

  .btn-close {
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.2rem 0.5rem;
    opacity: 0.75;
  }

  .btn-close:hover {
    opacity: 1;
  }

  /* TOOLBAR */
  .panel-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.65rem 1.2rem;
    background: #081d2e;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tab-group {
    display: flex;
    gap: 0.35rem;
  }

  .tab-btn {
    background: transparent;
    border: none;
    color: #a4b4c0;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
  }

  .tab-btn.active {
    background: rgba(212, 175, 55, 0.2);
    color: #f4d068;
    font-weight: 700;
  }

  .search-input-wrap input {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #ffffff;
    font-size: 0.8rem;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-sm);
    width: 210px;
  }

  /* LISTA DE LOGS */
  .logs-list {
    flex-grow: 1;
    overflow-y: auto;
    padding: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .empty-logs {
    padding: 3.5rem 1.5rem;
    text-align: center;
    color: #748694;
    font-size: 0.9rem;
  }

  .log-item {
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-sm);
    background: #061623;
    overflow: hidden;
  }

  .log-item.is-error {
    border-color: rgba(217, 56, 58, 0.35);
  }

  .log-item.selected {
    border-color: rgba(212, 175, 55, 0.6);
  }

  .log-row {
    width: 100%;
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.55rem 0.85rem;
    background: transparent;
    border: none;
    color: #ffffff;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    text-align: left;
    cursor: pointer;
    box-sizing: border-box;
  }

  .log-row:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .log-time {
    color: #748694;
    font-size: 0.72rem;
  }

  .log-type {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.12rem 0.4rem;
    border-radius: 3px;
    white-space: nowrap;
  }

  .type-req { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
  .type-res { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
  .type-err { background: rgba(239, 68, 68, 0.25); color: #f87171; }
  .type-warn { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
  .type-info { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }

  .log-title {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  .log-status-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  .log-status-badge.status-err {
    background: rgba(239, 68, 68, 0.25);
    color: #f87171;
  }

  .log-latency {
    color: #f4d068;
    font-size: 0.75rem;
  }

  .expand-arrow {
    color: #748694;
    font-size: 0.7rem;
  }

  /* DETALLE EXPANDIDO */
  .log-detail {
    padding: 0.85rem;
    background: #030a0f;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .detail-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .btn-copy-sm {
    background: rgba(212, 175, 55, 0.18);
    border: 1px solid rgba(212, 175, 55, 0.4);
    color: #f4d068;
    padding: 0.35rem 0.7rem;
    border-radius: 4px;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
  }

  .btn-copy-sm:hover {
    background: rgba(212, 175, 55, 0.28);
  }

  .meta-tag {
    font-size: 0.75rem;
    color: #a4b4c0;
  }

  .detail-block {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .block-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #a4b4c0;
  }

  .url-code {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: #60a5fa;
    word-break: break-all;
  }

  .reason-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: #f87171;
    margin: 0;
  }

  pre {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    background: #05121b;
    padding: 0.7rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e8e4dc;
    margin: 0;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .error-block pre {
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .stack-block pre {
    color: #fca5a5;
    background: #190909;
    border-color: rgba(239, 68, 68, 0.4);
  }

  .config-banner {
    background: #081d2e;
    padding: 0.65rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.78rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: #a4b4c0;
  }

  .config-banner strong {
    color: #f4d068;
  }

  .config-warn {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #f87171;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    font-weight: 600;
    margin-top: 0.25rem;
  }
</style>
