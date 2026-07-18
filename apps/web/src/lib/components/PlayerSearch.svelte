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
    class="input search__input"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    placeholder="Account ID…"
    bind:value
  />
  <button class="btn btn--primary" type="submit">View</button>
</form>

<style>
  .search {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .search__input {
    width: 160px;
  }
</style>
