<script lang="ts">
  import "../app.css";
  import PlayerSearch from "$lib/components/PlayerSearch.svelte";

  let { children } = $props();
</script>

<div class="layout">
  <nav class="navbar">
    <a href="/" class="navbar__logo">
      <img src="/image/logo-removed-bg.png" alt="Dota Helper" width="120" height="30" />
    </a>
    <PlayerSearch />
  </nav>

  <main class="main">
    {@render children()}
  </main>

  <footer class="footer">
    <div class="content-container footer__inner">
      <div class="footer__contact">
        <img src="/image/logo-removed-bg.png" alt="" width="120" />
        <span>mzinenko.work@gmail.com</span>
      </div>
      <hr />
      <div class="footer__pages">
        <a class="_text-muted" href="https://www.dotabuff.com/" target="_blank" rel="noreferrer">DOTABUFF</a>
        <div class="divider">•</div>
        <a class="_text-muted" href="https://dota2protracker.com/" target="_blank" rel="noreferrer">DOTA2PT</a>
        <div class="divider">•</div>
        <a class="_text-muted" href="https://store.steampowered.com/" target="_blank" rel="noreferrer">Steam</a>
      </div>
    </div>
  </footer>
</div>

<style>
  .layout {
    display: grid;
    grid-template-rows: 70px 1fr auto;
    min-height: 100vh;
  }
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-3);
    background-color: var(--nav);
    box-shadow: var(--shadow);
    position: relative;
    z-index: 100;
  }
  .navbar__logo {
    padding-top: 0.2rem;
  }
  .footer {
    background-color: var(--deep);
    padding: var(--space-4) var(--space-3) var(--space-3);
  }
  .footer__inner {
    display: flex;
    flex-direction: column;
  }
  .footer__contact {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: var(--space-5);
    padding-bottom: var(--space-2);
  }
  .footer hr {
    width: 100%;
    border: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0),
      rgba(255, 255, 255, 0.87),
      rgba(0, 0, 0, 0)
    );
  }
  .footer__pages {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .footer__pages .divider {
    opacity: 0.6;
  }

  @media (max-width: 610px) {
    .footer__pages {
      flex-direction: column;
      gap: var(--space-2);
    }
    .footer__pages .divider {
      display: none;
    }
  }
</style>
