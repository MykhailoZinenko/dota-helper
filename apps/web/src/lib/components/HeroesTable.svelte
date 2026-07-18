<script lang="ts">
  import type { HeroStat } from "$lib/types";
  import { formatCompact } from "$lib/format";

  let { heroStats }: { heroStats: HeroStat[] } = $props();
</script>

<div class="responsive-table-container">
  <table class="data-table">
    <thead>
      <tr>
        <th>№</th>
        <th>Hero</th>
        <th>Matches</th>
        <th>Winrate</th>
        <th>Networth</th>
        <th>Lasthits</th>
        <th>GPM</th>
        <th>XPM</th>
        <th>Kills</th>
        <th>Deaths</th>
        <th>Assists</th>
      </tr>
    </thead>
    <tbody>
      {#each heroStats as s, i (s.hero.id)}
        <tr>
          <td data-label="№">{i + 1}</td>
          <td data-label="Hero">
            <div class="hero-cell">
              <img class="hero" src={s.hero.icon} alt={s.hero.localized_name} />
              <span>{s.hero.localized_name}</span>
            </div>
          </td>
          <td data-label="Matches">{s.games}</td>
          <td data-label="Winrate">{Math.round(s.winrate * 100)}%</td>
          <td data-label="Networth">{formatCompact(s.networth)}</td>
          <td data-label="Lasthits">{formatCompact(s.lasthits)}</td>
          <td data-label="GPM">{formatCompact(s.gpm)}</td>
          <td data-label="XPM">{formatCompact(s.xpm)}</td>
          <td data-label="Kills">{Math.round(s.kills)}</td>
          <td data-label="Deaths">{Math.round(s.deaths)}</td>
          <td data-label="Assists">{Math.round(s.assists)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .responsive-table-container {
    min-width: 320px;
    max-width: 100%;
  }
  .hero-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
  }
  .hero {
    width: 28px;
    height: 28px;
  }
</style>
