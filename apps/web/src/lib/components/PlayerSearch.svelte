<script lang="ts">
  import { goto } from "$app/navigation";

  let value = $state("");

  function submit(event: Event) {
    event.preventDefault();
    const id = value.trim();
    if (!/^\d+$/.test(id)) return;
    try {
      localStorage.setItem("dh:lastPlayer", id);
    } catch {
      // ignore storage errors
    }
    goto(`/player/${id}`);
  }
</script>

<form class="search" onsubmit={submit}>
  <input
    class="search__input"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    placeholder="Account ID…"
    bind:value
  />
  <button class="search__btn" type="submit">View</button>
</form>

<style>
  .search {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .search__input {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: var(--radius);
    color: var(--text-strong);
    font: inherit;
    letter-spacing: inherit;
    font-size: var(--fs-sm);
    padding: 0.4rem 0.75rem;
    width: 160px;
    outline: none;
  }
  .search__input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  .search__btn {
    background: none;
    border: none;
    color: var(--text-strong);
    font: inherit;
    letter-spacing: inherit;
    font-size: var(--fs-md);
    cursor: pointer;
  }
  .search__btn:hover {
    color: var(--gold);
  }
</style>
