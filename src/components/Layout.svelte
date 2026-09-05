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
</div>

<style>
  .layout {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 20px;
    box-sizing: border-box;
  }
</style>
