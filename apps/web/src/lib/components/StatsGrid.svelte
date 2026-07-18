<script lang="ts">
  import type { Statistics, StatKey } from "$lib/types";
  import { formatCompact, formatDuration } from "$lib/format";

  let { statistics }: { statistics: Statistics } = $props();

  const cells: { key: StatKey; label: string; duration?: boolean; color?: string }[] = [
    { key: "kills", label: "KILLS", color: "_text-succes" },
    { key: "deaths", label: "DEATHS", color: "_text-danger" },
    { key: "assists", label: "ASSISTS" },
    { key: "gpm", label: "GPM" },
    { key: "xpm", label: "XPM" },
    { key: "lasthits", label: "LASTHITS" },
    { key: "heroes_damage", label: "HERO DAMAGE" },
    { key: "allies_heal", label: "ALLIES HEAL" },
    { key: "tower_damage", label: "TOWER DAMAGE" },
    { key: "duration", label: "DURATION", duration: true },
  ];

  const fmt = (value: number, duration?: boolean) =>
    duration ? formatDuration(value) : formatCompact(value);
</script>

<div class="recently-played">
  <ul class="recent-matches-list">
    {#each cells as cell}
      <li class="recent-matches-list__item">
        <span class="_text-muted">{cell.label}</span>
        <p class={cell.color ?? ""}>
          {fmt(statistics.average[cell.key], cell.duration)}
          <span class="_text-muted">{fmt(statistics.max[cell.key].value, cell.duration)}</span>
          {#if statistics.max[cell.key].hero}
            <img src={statistics.max[cell.key].hero?.icon} alt="" />
          {/if}
        </p>
      </li>
    {/each}
  </ul>
</div>

<style>
  .recently-played {
    background-color: var(--panel-subtle);
    padding: var(--space-4);
    display: flex;
    justify-content: center;
  }
  .recent-matches-list {
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    column-gap: 20px;
    row-gap: 30px;
  }
  .recent-matches-list__item {
    list-style: none;
  }
  .recent-matches-list__item span {
    font-size: var(--fs-sm);
  }
  .recent-matches-list__item p {
    font-size: var(--fs-lg);
    margin: 0;
    padding-top: var(--space-2);
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }
  .recent-matches-list__item p img {
    width: 20px;
    height: 20px;
  }
</style>
