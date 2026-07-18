<script lang="ts">
  import type { HeroStat } from "$lib/types";
  import { formatCompact } from "$lib/format";

  let { heroStats }: { heroStats: HeroStat[] } = $props();
</script>

<div class="dh-table-wrap">
  <table class="dh-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Hero</th>
        <th>Games</th>
        <th>Winrate</th>
        <th>Networth</th>
        <th>LH</th>
        <th>GPM</th>
        <th>XPM</th>
        <th>K</th>
        <th>D</th>
        <th>A</th>
      </tr>
    </thead>
    <tbody>
      {#each heroStats as s, i (s.hero.id)}
        <tr>
          <td>{i + 1}</td>
          <td>
            <div class="hero-cell">
              <img class="hero" src={s.hero.icon} alt={s.hero.localized_name} />
              <span>{s.hero.localized_name}</span>
            </div>
          </td>
          <td>{s.games}</td>
          <td>{Math.round(s.winrate * 100)}%</td>
          <td>{formatCompact(s.networth)}</td>
          <td>{formatCompact(s.lasthits)}</td>
          <td>{formatCompact(s.gpm)}</td>
          <td>{formatCompact(s.xpm)}</td>
          <td>{Math.round(s.kills)}</td>
          <td>{Math.round(s.deaths)}</td>
          <td>{Math.round(s.assists)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .hero-cell {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .hero {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
  }
</style>
