<script lang="ts">
  import Layout from './components/Layout.svelte';
  import { router, irAAdmin } from './lib/stores/router';
  import { sessionUser, sessionLoading } from './lib/stores/session';

  import Home from './pages/public/Home.svelte';
  import Solicitud from './pages/public/Solicitud.svelte';
  import Seguimiento from './pages/public/Seguimiento.svelte';

  import Login from './pages/admin/Login.svelte';
  import Dashboard from './pages/admin/Dashboard.svelte';
  import Solicitudes from './pages/admin/Solicitudes.svelte';
  import SolicitudDetalle from './pages/admin/SolicitudDetalle.svelte';

  /**
   * Guard: si la zona es admin y la ruta no es 'login',
   * pero no hay sesión activa → redirige a login.
   * Se evalúa solo cuando la carga de sesión ya terminó.
   */
  $effect(() => {
    if (!$sessionLoading && $router.zona === 'admin' && $router.rutaAdmin !== 'login') {
      if (!$sessionUser) {
        irAAdmin('login');
      }
    }
  });

  /** Muestra el contenido admin solo cuando hay sesión confirmada. */
  let adminReady = $derived(
    $router.zona === 'admin' &&
      $router.rutaAdmin !== 'login' &&
      !$sessionLoading &&
      $sessionUser !== null,
  );
</script>

<Layout>
  {#if $router.zona === 'public'}
    {#if $router.rutaPublica === 'home'}
      <Home />
    {:else if $router.rutaPublica === 'solicitud'}
      <Solicitud />
    {:else if $router.rutaPublica === 'seguimiento'}
      <Seguimiento />
    {/if}
  {:else if $router.rutaAdmin === 'login'}
    <Login />
  {:else if $sessionLoading}
    <!-- Espera silenciosa mientras se verifica la sesión -->
    <div class="session-check" aria-live="polite" aria-label="Verificando sesión…"></div>
  {:else if adminReady}
    {#if $router.rutaAdmin === 'dashboard'}
      <Dashboard />
    {:else if $router.rutaAdmin === 'solicitudes'}
      <Solicitudes />
    {:else if $router.rutaAdmin === 'detalle'}
      <SolicitudDetalle />
    {/if}
  {/if}
</Layout>

<style>
  .session-check {
    min-height: 40vh;
  }
</style>
