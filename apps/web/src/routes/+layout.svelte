<script lang="ts">
  import "../app.css";
  import PlayerSearch from "$lib/components/PlayerSearch.svelte";

  let { children } = $props();
</script>

<header class="topbar">
  <a href="/" class="brand">
    <img src="/image/logo-removed-bg.png" alt="Dota Helper" height="28" />
  </a>
  <PlayerSearch />
</header>

<main class="content">
  {@render children()}
</main>

<style>
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-6);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    background: var(--bg);
    z-index: 10;
  }
  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6);
  }
</style>
