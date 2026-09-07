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
      <div class="rays-boost">
        <LightRays
          raysOrigin="top-center"
          raysColor="#E8C97A"
          raysSpeed={0.65}
          lightSpread={0.75}
          rayLength={2.4}
          fadeDistance={1.35}
          saturation={1.15}
          followMouse={true}
          mouseInfluence={0.12}
          noiseAmount={0.05}
          distortion={0.1}
          pulsating={false}
        />
      </div>
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

  /* Amplifica el canvas sin tocar el shader */
  .rays-boost {
    position: absolute;
    inset: 0;
    filter: brightness(1.55) contrast(1.25) saturate(1.2);
    opacity: 0.95;
  }

  /* Velo más abierto arriba (donde se ven los rayos); más denso abajo para texto */
  .public-bg-veil {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      radial-gradient(
        ellipse 80% 55% at 50% -5%,
        rgba(232, 201, 122, 0.14) 0%,
        transparent 50%
      ),
      linear-gradient(
        180deg,
        rgba(7, 25, 35, 0.15) 0%,
        rgba(7, 25, 35, 0.4) 40%,
        rgba(7, 25, 35, 0.72) 70%,
        rgba(7, 25, 35, 0.88) 100%
      );
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

  @media (prefers-reduced-motion: reduce) {
    .rays-boost {
      display: none;
    }
  }
</style>
