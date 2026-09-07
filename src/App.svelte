<script lang="ts">
  import Layout from './components/Layout.svelte';
  import LoadingHint from './components/ui/LoadingHint.svelte';
  import { router, irAAdmin } from './lib/stores/router';
  import { sessionUser, sessionLoading } from './lib/stores/session';

  import Home from './pages/public/Home.svelte';
  import Solicitud from './pages/public/Solicitud.svelte';
  import Seguimiento from './pages/public/Seguimiento.svelte';

  import Login from './pages/admin/Login.svelte';
  import Dashboard from './pages/admin/Dashboard.svelte';
  import Solicitudes from './pages/admin/Solicitudes.svelte';
  import SolicitudDetalle from './pages/admin/SolicitudDetalle.svelte';
  import Equipo from './pages/admin/Equipo.svelte';
  import SecurityGate from './pages/admin/SecurityGate.svelte';

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

  let needsSecurityGate = $derived(
    Boolean($sessionUser?.mustChangePassword || $sessionUser?.pinNeedsReset),
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
    <div class="session-check">
      <LoadingHint message="Verificando sesión de operador…" />
    </div>
  {:else if $router.rutaAdmin === 'login' && !$sessionUser}
    <Login />
  {:else if adminReady && needsSecurityGate}
    <SecurityGate />
  {:else if adminReady}
    {#if $router.rutaAdmin === 'dashboard'}
      <Dashboard />
    {:else if $router.rutaAdmin === 'solicitudes'}
      <Solicitudes />
    {:else if $router.rutaAdmin === 'detalle'}
      <SolicitudDetalle />
    {:else if $router.rutaAdmin === 'equipo'}
      <Equipo />
    {/if}
  {/if}
</Layout>

<style>
  .session-check {
    min-height: 40vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
  }
</style>
