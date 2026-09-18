/**
 * BLOQUE: Bootstrap de la aplicación Huella.
 * Propósito: montar App.svelte e hidratar sesión de operador (Supabase Auth).
 */
import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { loadSession } from './lib/stores/session';

// Restaurar sesión Supabase antes/mientras se monta la UI admin.
void loadSession();

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
