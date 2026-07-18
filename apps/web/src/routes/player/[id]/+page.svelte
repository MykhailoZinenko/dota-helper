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

<section>
  <h2>Recent matches — averages & max</h2>
  <StatsGrid statistics={data.statistics} />
</section>

<section>
  <h2>Recent matches ({data.matches.length})</h2>
  <MatchesTable matches={data.matches} />
</section>

<section>
  <h2>Heroes played</h2>
  <HeroesTable heroStats={data.heroStats} />
</section>

<style>
  section {
    margin-top: var(--space-8);
  }
  h2 {
    margin-bottom: var(--space-4);
    font-size: 1.15rem;
  }
</style>
