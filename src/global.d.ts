// Declaraciones globales para Svelte
// Evita errores de "No se puede encontrar el módulo '*.svelte'" en svelte-check/TypeScript
declare module '*.svelte' {
  import { SvelteComponentTyped } from 'svelte';
  export default class Component<Props = any, Events = any, Slots = any> extends SvelteComponentTyped<Props, Events, Slots> {}
}
