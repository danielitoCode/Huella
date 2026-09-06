<script lang="ts">
  import Header from './Header.svelte';
  import type { Snippet } from 'svelte';
  import { router } from '../lib/stores/router';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  let isHome = $derived($router.zona === 'public' && $router.rutaPublica === 'home');
</script>

<div class="layout" class:home={isHome}>
  <Header />
  <main class="main" class:full={isHome}>
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
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.75rem 1.25rem 2.5rem;
  }

  .main.full {
    max-width: none;
    padding: 0;
  }

  .footer {
    background: var(--header-bg);
    color: var(--header-text);
    border-top: 1px solid var(--header-border);
    padding: 2rem 1.25rem;
    text-align: center;
  }

  .footer-brand {
    font-family: var(--font-display);
    font-size: 1.35rem;
    margin: 0 0 0.25rem;
    color: var(--gold);
  }

  .footer-tag {
    margin: 0 0 0.75rem;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.75;
  }

  .footer-note {
    margin: 0 auto;
    max-width: 28rem;
    font-size: 0.8rem;
    opacity: 0.7;
    line-height: 1.45;
  }
</style>
