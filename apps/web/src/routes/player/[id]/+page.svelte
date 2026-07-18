<script lang="ts">
  import type { PageData } from "./$types";
  import Profile from "$lib/components/Profile.svelte";
  import StatsGrid from "$lib/components/StatsGrid.svelte";
  import MatchesTable from "$lib/components/MatchesTable.svelte";
  import HeroesTable from "$lib/components/HeroesTable.svelte";

  let { data }: { data: PageData } = $props();
</script>

<Profile
  profile={data.profile}
  statistics={data.statistics}
  accountId={data.accountId}
/>

<div class="main-content content-container">
  <h2>Stats of recently played matches (avg / max)</h2>
  <StatsGrid statistics={data.statistics} />

  <h2>Recent matches ({data.matches.length})</h2>
  <MatchesTable matches={data.matches} />

  <h2>Recently played on heroes</h2>
  <HeroesTable heroStats={data.heroStats} />
</div>

<style>
  .main-content {
    padding: 0 var(--space-5) var(--space-5);
  }
  h2 {
    text-align: center;
    padding: var(--space-3);
    color: var(--text-strong);
    font-weight: 500;
  }
</style>
