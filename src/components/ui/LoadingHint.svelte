<script lang="ts">
  type Props = {
    message?: string;
    compact?: boolean;
  };

  let {
    message = 'Obteniendo información de los servidores…',
    compact = false,
  }: Props = $props();
</script>

<div class="hint" class:compact role="status" aria-live="polite">
  <span class="spinner" aria-hidden="true"></span>
  <span class="text">{message}</span>
</div>

<style>
  .hint {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1.1rem;
    border-radius: var(--radius);
    background: rgba(198, 164, 106, 0.08);
    border: 1px solid rgba(198, 164, 106, 0.28);
    color: var(--text, #c5d0d8);
    font-size: 0.9rem;
  }

  .hint.compact {
    padding: 0.45rem 0.75rem;
    font-size: 0.8rem;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(198, 164, 106, 0.25);
    border-top-color: var(--gold, #c6a46a);
    border-radius: 50%;
    flex-shrink: 0;
    animation: spin 0.7s linear infinite;
  }

  .text {
    line-height: 1.35;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
      border-top-color: rgba(198, 164, 106, 0.5);
    }
  }
</style>
