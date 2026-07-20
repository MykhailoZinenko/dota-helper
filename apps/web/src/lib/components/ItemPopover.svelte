<script lang="ts">
  import type { Item } from "$lib/types";

  let {
    item,
    x,
    y,
    placement,
  }: { item: Item; x: number; y: number; placement: "top" | "bottom" } = $props();
</script>

<div
  class="popover"
  class:above={placement === "top"}
  style:left="{x}px"
  style:top="{y}px"
  role="tooltip"
>
  <div class="head">
    <img src={item.icon} alt="" />
    <span class="name">{item.name}</span>
    {#if item.cost !== null}
      <span class="cost">{item.cost}</span>
    {/if}
  </div>

  {#if item.cooldown || item.mana}
    <div class="stats">
      {#if item.cooldown}
        <span class="stat cd">CD {item.cooldown}</span>
      {/if}
      {#if item.mana}
        <span class="stat mp">Mana {item.mana}</span>
      {/if}
    </div>
  {/if}

  {#if item.description}
    <p class="desc">{@html item.description}</p>
  {/if}

  {#if item.lore}
    <p class="lore">{item.lore}</p>
  {/if}
</div>

<style>
  .popover {
    position: fixed;
    z-index: 100;
    transform: translate(-50%, var(--space-2));
    width: max-content;
    max-width: 320px;
    padding: var(--space-2) var(--space-3) var(--space-3);
    background: var(--deep);
    border: 1px solid var(--line-soft);
    border-radius: var(--radius);
    box-shadow: rgb(0 0 0 / 45%) 0 8px 24px -6px;
    color: var(--text);
    font-family: var(--font);
    font-size: var(--fs-sm);
    letter-spacing: var(--tracking);
    line-height: 1.45;
    pointer-events: none;
  }
  .popover.above {
    transform: translate(-50%, calc(-100% - var(--space-2)));
  }

  .head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--line-soft);
  }
  .head img {
    width: 33px;
    height: 24px;
    border-radius: var(--radius-sm);
  }
  .name {
    flex: 1;
    color: var(--text-strong);
    font-weight: 700;
  }
  .cost {
    color: var(--gold);
    font-weight: 700;
  }
  .cost::before {
    content: "◆ ";
    font-size: 0.85em;
  }

  .stats {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }
  .stat {
    padding: 1px var(--space-2);
    border-radius: var(--radius-pill);
    background: var(--panel-subtle);
    color: var(--text-muted);
    font-size: 12px;
  }

  .desc {
    margin: var(--space-2) 0 0;
    color: var(--text);
  }
  .desc :global(.tt-title) {
    display: block;
    margin-bottom: var(--space-1);
    color: var(--text-strong);
  }

  .lore {
    margin: var(--space-2) 0 0;
    padding-top: var(--space-2);
    border-top: 1px solid var(--line-soft);
    color: var(--text-muted);
    font-style: italic;
  }
</style>
