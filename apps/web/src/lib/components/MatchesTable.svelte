<script lang="ts">
  import type { MatchRow } from "$lib/types";
  import { formatDuration } from "$lib/format";

  let { matches }: { matches: MatchRow[] } = $props();
</script>

<div class="responsive-table-container">
  <table class="data-table">
    <thead>
      <tr>
        <th>№</th>
        <th>Hero</th>
        <th>Result</th>
        <th>Draft</th>
        <th>Networth</th>
        <th>K/D/A</th>
        <th>GPM</th>
        <th>XPM</th>
        <th class="col-items">Items</th>
        <th>Duration</th>
        <th>ID</th>
      </tr>
    </thead>
    <tbody>
      {#each matches as m, i (m.match_id)}
        <tr>
          <td data-label="№">{i + 1}</td>
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
    margin: 0 auto;
  }
  .draft {
    display: flex;
    justify-content: center;
    gap: var(--space-2);
  }
  .team {
    display: flex;
    justify-content: center;
  }
  .team img {
    width: 24px;
    height: 24px;
    padding: 2px;
  }
  .player-hero {
    filter: drop-shadow(#ffffff 1px 0 0) drop-shadow(#ffffff -1px 0 0)
      drop-shadow(#ffffff 0 1px 0) drop-shadow(#ffffff 0 -1px 0);
  }
  .items-container {
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(3, max-content);
  }
  .items-container img {
    width: 34px;
    height: 24px;
    padding: 2px;
  }
  .id-link {
    display: flex;
    justify-content: center;
  }
  .id-link img {
    width: 20px;
    height: 20px;
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
    .draft {
      flex-direction: column;
    }
  }
</style>
