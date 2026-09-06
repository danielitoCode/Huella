<script lang="ts">
  import Header from './Header.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="layout">
  <Header />
  <main class="main">
    {@render children()}
  </main>
  <footer class="footer">
    <p class="footer-brand">Huella</p>
    <p class="footer-note">
      Plataforma documental de acompañamiento. No procesamos pagos ni garantizamos resultados.
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

  .footer {
    background: var(--header-bg);
    color: var(--header-text);
    border-top: 1px solid var(--header-border);
    padding: 1.5rem 1.25rem;
    text-align: center;
  }

  .footer-brand {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.35rem;
    color: var(--brand-gold);
  }

  .footer-note {
    margin: 0 auto;
    max-width: 36rem;
    font-size: 0.8rem;
    opacity: 0.8;
    line-height: 1.45;
  }
</style>
