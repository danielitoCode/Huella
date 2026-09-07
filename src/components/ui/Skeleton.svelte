<script lang="ts">
  type Props = {
    width?: string;
    height?: string;
    radius?: string;
    class?: string;
  };

  let {
    width = '100%',
    height = '1rem',
    radius = '6px',
    class: className = '',
  }: Props = $props();
</script>

<span
  class="skeleton {className}"
  style="width: {width}; height: {height}; border-radius: {radius};"
  aria-hidden="true"
></span>

<style>
  .skeleton {
    display: inline-block;
    background: linear-gradient(
      90deg,
      rgba(198, 164, 106, 0.08) 0%,
      rgba(198, 164, 106, 0.18) 50%,
      rgba(198, 164, 106, 0.08) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.25s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton {
      animation: none;
      background: rgba(198, 164, 106, 0.12);
    }
  }
</style>
