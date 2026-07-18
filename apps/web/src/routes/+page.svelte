<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  onMount(() => {
    try {
      const last = localStorage.getItem("dh:lastPlayer");
      if (last) goto(`/player/${last}`);
    } catch {
      // ignore storage errors
    }
  });
</script>

<section class="home">
  <h1>Dota Helper</h1>
  <p class="_text-muted">
    Enter a Dota 2 account ID in the search above to see recent matches,
    statistics and heroes.
  </p>
</section>

<style>
  .home {
    text-align: center;
    padding: var(--space-5);
    max-width: 48ch;
    margin: 0 auto;
  }
  .home h1 {
    color: var(--text-strong);
  }
  .home p {
    line-height: 1.6;
  }
</style>
