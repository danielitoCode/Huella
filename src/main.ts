/**
 * BLOQUE: Bootstrap de la aplicación Huella.
 * Propósito: router + montaje App + hidratar sesión operador (Supabase Auth).
 */
import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { initRouter } from './lib/stores/router';
import { loadSession } from './lib/stores/session';

initRouter();

// Restaurar sesión Supabase en paralelo al primer paint.
void loadSession();

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
