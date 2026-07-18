<script lang="ts">
  import type { Statistics, StatKey } from "$lib/types";
  import { formatCompact, formatDuration } from "$lib/format";

  let { statistics }: { statistics: Statistics } = $props();

  const cells: { key: StatKey; label: string; duration?: boolean }[] = [
    { key: "kills", label: "Kills" },
    { key: "deaths", label: "Deaths" },
    { key: "assists", label: "Assists" },
    { key: "gpm", label: "GPM" },
    { key: "xpm", label: "XPM" },
    { key: "lasthits", label: "Last Hits" },
    { key: "heroes_damage", label: "Hero Damage" },
    { key: "allies_heal", label: "Allies Heal" },
    { key: "tower_damage", label: "Tower Damage" },
    { key: "duration", label: "Duration", duration: true },
  ];

  function fmt(value: number, duration?: boolean) {
    return duration ? formatDuration(value) : formatCompact(value);
  }
</script>

<ul class="stats">
  {#each cells as cell}
    <li class="stat">
      <span class="stat__label">{cell.label}</span>
      <div class="stat__values">
        <span class="stat__avg">{fmt(statistics.average[cell.key], cell.duration)}</span>
        <span class="stat__max">{fmt(statistics.max[cell.key].value, cell.duration)}</span>
        {#if statistics.max[cell.key].hero}
          <img
            class="stat__hero"
            src={statistics.max[cell.key].hero?.icon}
            alt=""
          />
        {/if}
      </div>
    </li>
  {/each}
</ul>

<style>
  .stats {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-3);
  }
  .stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: var(--space-3) var(--space-4);
  }
  .stat__label {
    display: block;
    color: var(--text-muted);
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-2);
  }
  .stat__values {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .stat__avg {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-strong);
  }
  .stat__max {
    color: var(--text-muted);
    font-size: 0.85rem;
  }
  .stat__hero {
    width: 24px;
    height: 24px;
    margin-left: auto;
    border-radius: var(--radius-sm);
  }
</style>
