<script lang="ts">
  import type { MatchRow } from "$lib/types";
  import { formatDuration } from "$lib/format";

  let { matches }: { matches: MatchRow[] } = $props();

  type Key = "index" | "hero" | "result" | "networth" | "kda" | "gpm" | "xpm" | "duration";

  let sortKey = $state<Key>("index");
  let sortDir = $state(1);

  function keyValue(row: MatchRow, index: number, key: Key): number | string {
    if (key === "index") return index;
    if (key === "hero") return row.player_hero?.localized_name ?? "";
    if (key === "result") return row.result;
    return row[key];
  }

  const sorted = $derived(
    matches
      .map((m, i) => ({ m, i }))
      .sort((a, b) => {
        const va = keyValue(a.m, a.i, sortKey);
        const vb = keyValue(b.m, b.i, sortKey);
        if (va < vb) return -sortDir;
        if (va > vb) return sortDir;
        return 0;
      })
  );

  function setSort(key: Key) {
    if (sortKey === key) sortDir = -sortDir;
    else {
      sortKey = key;
      sortDir = key === "index" || key === "hero" || key === "result" ? 1 : -1;
    }
  }
</script>

<div class="responsive-table-container">
  <table class="data-table">
    <thead>
      <tr>
        <th><button class="sort-btn" class:active={sortKey === "index"} onclick={() => setSort("index")}>№</button></th>
        <th><button class="sort-btn" class:active={sortKey === "hero"} onclick={() => setSort("hero")}>Hero</button></th>
        <th><button class="sort-btn" class:active={sortKey === "result"} onclick={() => setSort("result")}>Result</button></th>
        <th>Draft</th>
        <th><button class="sort-btn" class:active={sortKey === "networth"} onclick={() => setSort("networth")}>Networth</button></th>
        <th><button class="sort-btn" class:active={sortKey === "kda"} onclick={() => setSort("kda")}>K/D/A</button></th>
        <th><button class="sort-btn" class:active={sortKey === "gpm"} onclick={() => setSort("gpm")}>GPM</button></th>
        <th><button class="sort-btn" class:active={sortKey === "xpm"} onclick={() => setSort("xpm")}>XPM</button></th>
        <th class="col-items">Items</th>
        <th><button class="sort-btn" class:active={sortKey === "duration"} onclick={() => setSort("duration")}>Duration</button></th>
        <th>ID</th>
      </tr>
    </thead>
    <tbody>
      {#each sorted as { m }, pos (m.match_id)}
        <tr>
          <td data-label="№">{pos + 1}</td>
          <td data-label="Hero">
            {#if m.player_hero}
              <img class="hero" src={m.player_hero.icon} alt={m.player_hero.localized_name} />
            {/if}
          </td>
          <td data-label="Result">
            <span class="_text-muted">team_{m.team}:</span>
            <span class={m.result === "won" ? "_text-succes" : "_text-danger"}>{m.result}</span>
          </td>
          <td data-label="Draft">
            <div class="draft">
              <div class="team">
                {#each m.draft.slice(0, 5) as h}
                  {#if h}
                    <img class:player-hero={h === m.player_hero} src={h.icon} alt="" />
                  {/if}
                {/each}
              </div>
              <div class="team">
                {#each m.draft.slice(5, 10) as h}
                  {#if h}
                    <img class:player-hero={h === m.player_hero} src={h.icon} alt="" />
                  {/if}
                {/each}
              </div>
            </div>
          </td>
          <td data-label="Networth">{m.networth}</td>
          <td data-label="K/D/A">{m.kills}/{m.deaths}/{m.assists}</td>
          <td data-label="GPM">{m.gpm}</td>
          <td data-label="XPM">{m.xpm}</td>
          <td data-label="Items" class="col-items">
            <div class="items-container">
              {#each m.items as it}
                {#if it}
                  <img src={it.icon} alt={it.name} />
                {/if}
              {/each}
            </div>
          </td>
          <td data-label="Duration">{formatDuration(m.duration)}</td>
          <td data-label="ID">
            <a
              class="id-link"
              href={`https://www.dotabuff.com/matches/${m.match_id}`}
              target="_blank"
              rel="noreferrer"
            >
              <img src="/image/external-link-squared.png" alt="Open match" />
            </a>
          </td>
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
  .draft {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .team {
    display: flex;
    justify-content: center;
  }
  .team img {
    width: 28px;
    height: 28px;
    padding: 2px;
  }
  .player-hero {
    filter: drop-shadow(#ffffff 1px 0 0) drop-shadow(#ffffff -1px 0 0)
      drop-shadow(#ffffff 0 1px 0) drop-shadow(#ffffff 0 -1px 0);
  }
  .items-container {
    display: inline-grid;
    grid-template-columns: repeat(3, max-content);
  }
  .items-container img {
    width: 38px;
    height: 28px;
    padding: 2px;
  }
  .id-link img {
    width: 20px;
    height: 20px;
    margin: 0 auto;
  }

  @media (max-width: 960px) {
    .col-items {
      display: none;
    }
  }
  @media (max-width: 768px) {
    .col-items {
      display: flex;
    }
    .hero {
      margin: 0;
    }
  }
</style>
