<script lang="ts">
  import { onMount } from 'svelte';
  import Header from './Header.svelte';
  import DevLoggerPanel from './DevLoggerPanel.svelte';
  import type { Snippet } from 'svelte';
  import { router } from '../lib/stores/router';
  import { loadSession } from '../lib/stores/session';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  onMount(() => {
    loadSession();
  });
</script>

<div class="layout">
  <Header />
  <main class="main">
    {@render children()}
  </main>
  <footer class="footer">
    <p class="footer-brand">Huella</p>
    <p class="footer-tag">Verdad · Memoria · Dignidad</p>
    <p class="footer-note">
      Espacio digital de memoria e investigación documental. No procesamos pagos ni garantizamos
      resultados.
    </p>
  </footer>

  <!-- Dev Logger flotante en tiempo real (solo en desarrollo) -->
  <DevLoggerPanel />
</div>

<style>
  .layout {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }

  .main {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .footer {
    background: var(--header-bg);
    color: var(--header-text);
    border-top: 1px solid var(--header-border);
    padding: 2.5rem 1.5rem;
    text-align: center;
    margin-top: auto;
  }

  .footer-brand {
    font-family: var(--font-display);
    font-size: 1.4rem;
    margin: 0 0 0.25rem;
    color: var(--gold);
  }

  .footer-tag {
    margin: 0 0 0.75rem;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.75;
  }

  .footer-note {
    margin: 0 auto;
    max-width: 32rem;
    font-size: 0.82rem;
    opacity: 0.7;
    line-height: 1.5;
  }
</style>
