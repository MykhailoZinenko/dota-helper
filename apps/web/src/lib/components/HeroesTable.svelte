<script lang="ts">
  import type { HeroStat } from "$lib/types";
  import { formatCompact } from "$lib/format";

  let { heroStats }: { heroStats: HeroStat[] } = $props();

  type Key =
    | "index"
    | "hero"
    | "games"
    | "winrate"
    | "networth"
    | "lasthits"
    | "gpm"
    | "xpm"
    | "kills"
    | "deaths"
    | "assists";

  let sortKey = $state<Key>("games");
  let sortDir = $state(-1);

  function keyValue(stat: HeroStat, index: number, key: Key): number | string {
    if (key === "index") return index;
    if (key === "hero") return stat.hero.localized_name;
    return stat[key];
  }

  const sorted = $derived(
    heroStats
      .map((s, i) => ({ s, i }))
      .sort((a, b) => {
        const va = keyValue(a.s, a.i, sortKey);
        const vb = keyValue(b.s, b.i, sortKey);
        if (va < vb) return -sortDir;
        if (va > vb) return sortDir;
        return 0;
      })
  );

  function setSort(key: Key) {
    if (sortKey === key) sortDir = -sortDir;
    else {
      sortKey = key;
      sortDir = key === "index" || key === "hero" ? 1 : -1;
    }
  }

  const columns: { key: Key; label: string }[] = [
    { key: "index", label: "№" },
    { key: "hero", label: "Hero" },
    { key: "games", label: "Matches" },
    { key: "winrate", label: "Winrate" },
    { key: "networth", label: "Networth" },
    { key: "lasthits", label: "Lasthits" },
    { key: "gpm", label: "GPM" },
    { key: "xpm", label: "XPM" },
    { key: "kills", label: "Kills" },
    { key: "deaths", label: "Deaths" },
    { key: "assists", label: "Assists" },
  ];
</script>

<div class="responsive-table-container">
  <table class="data-table">
    <thead>
      <tr>
        {#each columns as col}
          <th>
            <button class="sort-btn" class:active={sortKey === col.key} onclick={() => setSort(col.key)}>
              {col.label}
            </button>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sorted as { s }, pos (s.hero.id)}
        <tr>
          <td data-label="№">{pos + 1}</td>
          <td data-label="Hero">
            <img class="hero" src={s.hero.icon} alt={s.hero.localized_name} />
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
  .hero {
    width: 32px;
    height: 32px;
  }
</style>
