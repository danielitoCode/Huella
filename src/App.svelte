<script lang="ts">
  import Layout from './components/Layout.svelte';
  import { router } from './lib/stores/router';

  // Páginas públicas
  import Home from './pages/public/Home.svelte';
  import Solicitud from './pages/public/Solicitud.svelte';

  // Páginas admin
  import Login from './pages/admin/Login.svelte';
  import Dashboard from './pages/admin/Dashboard.svelte';
  import Solicitudes from './pages/admin/Solicitudes.svelte';
  import SolicitudDetalle from './pages/admin/SolicitudDetalle.svelte';
</script>

<Layout>
  {#if $router.zona === 'public'}
    {#if $router.rutaPublica === 'home'}
      <Home />
    {:else if $router.rutaPublica === 'solicitud'}
      <Solicitud />
    {/if}
  {:else}
    {#if $router.rutaAdmin === 'login'}
      <Login />
    {:else if $router.rutaAdmin === 'dashboard'}
      <Dashboard />
    {:else if $router.rutaAdmin === 'solicitudes'}
      <Solicitudes />
    {:else if $router.rutaAdmin === 'detalle'}
      <SolicitudDetalle />
    {/if}
  {/if}
</Layout>