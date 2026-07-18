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
  <p>
    Enter a Dota 2 account ID in the search above to see recent matches,
    statistics and heroes.
  </p>
</section>

<style>
  .home {
    padding: var(--space-8) 0;
    max-width: 42ch;
  }
  .home p {
    color: var(--text-muted);
    line-height: 1.6;
  }
</style>
