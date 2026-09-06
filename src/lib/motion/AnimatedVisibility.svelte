<script lang="ts">
  /**
   * Contenedor de visibilidad para transiciones de navegación.
   * API mínima: visible + slot (compatible Svelte 4/5).
   */
  export let visible: boolean = true;
</script>

{#if visible}
  <div class="animated-visibility">
    <slot />
  </div>
{/if}

<style>
  .animated-visibility {
    display: contents;
  }
</style>
