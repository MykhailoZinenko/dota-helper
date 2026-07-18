<script lang="ts">
  import type { MatchRow } from "$lib/types";
  import { formatDuration } from "$lib/format";

  let { matches }: { matches: MatchRow[] } = $props();
</script>

<div class="dh-table-wrap">
  <table class="dh-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Hero</th>
        <th>Result</th>
        <th>Draft</th>
        <th>Networth</th>
        <th>K / D / A</th>
        <th>GPM</th>
        <th>XPM</th>
        <th>Items</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      {#each matches as m, i (m.match_id)}
        <tr>
          <td>{i + 1}</td>
          <td>
            {#if m.player_hero}
              <img class="hero" src={m.player_hero.icon} alt={m.player_hero.localized_name} />
            {/if}
          </td>
          <td><span class={m.result}>{m.result}</span></td>
          <td>
            <div class="draft">
              <div class="team">
                {#each m.draft.slice(0, 5) as h}
                  {#if h}
                    <img class="mini" class:me={h === m.player_hero} src={h.icon} alt="" />
                  {/if}
                {/each}
              </div>
              <div class="team">
                {#each m.draft.slice(5, 10) as h}
                  {#if h}
                    <img class="mini" class:me={h === m.player_hero} src={h.icon} alt="" />
                  {/if}
                {/each}
              </div>
            </div>
          </td>
          <td>{m.networth}</td>
          <td>{m.kills} / {m.deaths} / {m.assists}</td>
          <td>{m.gpm}</td>
          <td>{m.xpm}</td>
          <td>
            <div class="items">
              {#each m.items as it}
                {#if it}
                  <img class="item" src={it.icon} alt={it.name} />
                {:else}
                  <span class="item empty"></span>
                {/if}
              {/each}
            </div>
          </td>
          <td>{formatDuration(m.duration)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .hero {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
  }
  .won {
    color: var(--success);
    font-weight: 600;
  }
  .lost {
    color: var(--danger);
    font-weight: 600;
  }
  .draft {
    display: flex;
    gap: var(--space-2);
  }
  .team {
    display: flex;
    gap: 2px;
  }
  .mini {
    width: 22px;
    height: 22px;
    border-radius: 2px;
    opacity: 0.55;
  }
  .mini.me {
    opacity: 1;
    outline: 1px solid var(--gold);
  }
  .items {
    display: grid;
    grid-template-columns: repeat(3, 28px);
    gap: 2px;
  }
  .item {
    width: 28px;
    height: 21px;
    border-radius: 2px;
    object-fit: cover;
  }
  .item.empty {
    background: var(--panel);
    opacity: 0.4;
  }
</style>
