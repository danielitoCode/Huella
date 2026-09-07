<script lang="ts">
  import { onMount } from 'svelte';
  import Header from './Header.svelte';
  import DevLoggerPanel from './DevLoggerPanel.svelte';
  import LightRays from './effects/LightRays.svelte';
  import type { Snippet } from 'svelte';
  import { router } from '../lib/stores/router';
  import { loadSession } from '../lib/stores/session';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let isPublic = $derived($router.zona === 'public');

  onMount(() => {
    loadSession();
  });
</script>

<div class="layout" class:public-zone={isPublic}>
  {#if isPublic}
    <div class="public-bg" aria-hidden="true">
      <LightRays
        raysOrigin="top-center"
        raysColor="#C6A46A"
        raysSpeed={0.5}
        lightSpread={1.2}
        rayLength={2}
        fadeDistance={1.2}
        saturation={0.8}
        followMouse={true}
        mouseInfluence={0.07}
        noiseAmount={0.03}
        distortion={0.06}
      />
      <div class="public-bg-veil"></div>
    </div>
  {/if}

  <div class="layout-chrome">
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
  </div>

  <DevLoggerPanel />
</div>

<style>
  .layout {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    position: relative;
  }

  .layout.public-zone {
    background: var(--color-obsidian-navy, #071923);
  }

  .public-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .public-bg-veil {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(198, 164, 106, 0.08), transparent 55%),
      linear-gradient(180deg, rgba(7, 25, 35, 0.35) 0%, rgba(7, 25, 35, 0.75) 55%, rgba(7, 25, 35, 0.92) 100%);
  }

  .layout-chrome {
    position: relative;
    z-index: 2;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
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
