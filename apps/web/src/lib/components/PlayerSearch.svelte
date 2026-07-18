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
    gap: var(--space-2);
  }
  .search__input {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font);
    font-size: 0.9rem;
    padding: var(--space-2) var(--space-3);
    width: 180px;
    outline: none;
  }
  .search__input:focus {
    border-color: var(--panel-2);
  }
  .search__btn {
    background: var(--panel-2);
    border: none;
    border-radius: var(--radius);
    color: var(--text-strong);
    cursor: pointer;
    font-family: var(--font);
    font-weight: 600;
    padding: var(--space-2) var(--space-4);
  }
  .search__btn:hover {
    background: var(--panel);
  }
</style>
