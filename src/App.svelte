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
   * Guards de zona admin:
   * - Sin sesión en rutas internas → login
   * - Con sesión en login → dashboard (un solo login / sesión persistente)
   */
  $effect(() => {
    if ($sessionLoading || $router.zona !== 'admin') return;

    if (!$sessionUser && $router.rutaAdmin !== 'login') {
      irAAdmin('login');
      return;
    }

    if ($sessionUser && $router.rutaAdmin === 'login') {
      irAAdmin('dashboard');
    }
  });

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
  {:else if $sessionLoading && $router.rutaAdmin !== 'login'}
    <div class="session-check" aria-live="polite" aria-label="Verificando sesión…"></div>
  {:else if $router.rutaAdmin === 'login' && !$sessionUser}
    <Login />
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
