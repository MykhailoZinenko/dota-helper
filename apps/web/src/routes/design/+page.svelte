<script lang="ts">
  const colors = [
    { name: "--bg", value: "rgb(25, 32, 35)", note: "App background" },
    { name: "--nav", value: "#16405a", note: "Navbar / primary" },
    { name: "--profile", value: "#15394f", note: "Profile band" },
    { name: "--deep", value: "#0d1520", note: "Footer / fields" },
    { name: "--panel-subtle", value: "rgba(255,255,255,.03)", note: "Subtle panel" },
    { name: "--text", value: "#e0e5e8", note: "Body text" },
    { name: "--text-muted", value: "#899aa5", note: "Muted / labels" },
    { name: "--text-strong", value: "#ffffff", note: "Headings" },
    { name: "--success", value: "#66bb6a", note: "Wins / good" },
    { name: "--danger", value: "#f14a4b", note: "Losses / bad" },
    { name: "--gold", value: "#c9af1d", note: "Highlight" },
    { name: "--line", value: "#ffffff", note: "Table borders" },
    { name: "--line-soft", value: "rgba(255,255,255,.14)", note: "Control borders" },
  ];

  const type = [
    { name: "--fs-xl", value: "25px", sample: "Profile name" },
    { name: "--fs-lg", value: "24px", sample: "Stat values" },
    { name: "--fs-md", value: "20px", sample: "Nav / buttons" },
    { name: "base", value: "16px", sample: "Table cells" },
    { name: "--fs-sm", value: "14px", sample: "Labels / mobile" },
  ];

  const spacing = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5"];
  const radii = [
    { name: "--radius-sm", value: "4px" },
    { name: "--radius", value: "0.5rem" },
    { name: "--radius-pill", value: "5rem" },
  ];
</script>

<div class="sg content-container">
  <header class="sg__head">
    <h1>Design System</h1>
    <p class="_text-muted">
      The live tokens and components behind Dota Helper — Space Grotesk, 1px
      tracking, the navy stack. Design new pages against these.
    </p>
  </header>

  <section class="sg__section">
    <h2>Color</h2>
    <div class="swatches">
      {#each colors as c}
        <div class="swatch">
          <div class="swatch__chip" style="background: {c.value}"></div>
          <div class="swatch__meta">
            <code>{c.name}</code>
            <span class="_text-muted">{c.value}</span>
            <span class="swatch__note">{c.note}</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="sg__section">
    <h2>Typography</h2>
    <div class="type-list">
      {#each type as t}
        <div class="type-row">
          <span class="type-sample" style="font-size: var({t.name === 'base' ? '--fs-md' : t.name})">
            {t.sample}
          </span>
          <span class="_text-muted"><code>{t.name}</code> · {t.value}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="sg__section">
    <h2>Spacing</h2>
    <div class="spacing-list">
      {#each spacing as s}
        <div class="spacing-row">
          <span class="spacing-bar" style="width: var({s})"></span>
          <code>{s}</code>
        </div>
      {/each}
    </div>
  </section>

  <section class="sg__section">
    <h2>Radii</h2>
    <div class="radii">
      {#each radii as r}
        <div class="radius">
          <div class="radius__box" style="border-radius: var({r.name})"></div>
          <code>{r.name}</code>
          <span class="_text-muted">{r.value}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="sg__section">
    <h2>Buttons</h2>
    <div class="row">
      <button class="btn btn--primary">Primary</button>
      <button class="btn btn--ghost">Ghost</button>
      <button class="btn">Bare</button>
    </div>
    <p class="_text-muted code-note"><code>.btn</code> · <code>.btn--primary</code> · <code>.btn--ghost</code></p>
  </section>

  <section class="sg__section">
    <h2>Input</h2>
    <div class="row">
      <input class="input" placeholder="Account ID…" />
    </div>
    <p class="_text-muted code-note"><code>.input</code></p>
  </section>

  <section class="sg__section">
    <h2>Semantic text</h2>
    <div class="row">
      <span class="_text-succes">success</span>
      <span class="_text-danger">danger</span>
      <span class="_text-gold">gold</span>
      <span class="_text-muted">muted</span>
      <span class="_text-info">info</span>
    </div>
  </section>

  <section class="sg__section">
    <h2>Data table</h2>
    <div class="responsive-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th><button class="sort-btn active">№</button></th>
            <th><button class="sort-btn">Hero</button></th>
            <th><button class="sort-btn">GPM</button></th>
            <th>Static</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Anti-Mage</td><td>520</td><td>—</td></tr>
          <tr><td>2</td><td>Invoker</td><td>410</td><td>—</td></tr>
          <tr><td>3</td><td>Pudge</td><td>330</td><td>—</td></tr>
        </tbody>
      </table>
    </div>
    <p class="_text-muted code-note">
      <code>.data-table</code> — dotted rows, solid edges, muted headers with an
      active/bright sort column; collapses to labelled cards under 768px.
    </p>
  </section>

  <section class="sg__section">
    <h2>Skeleton</h2>
    <div class="row">
      <div class="skeleton sk-box"></div>
      <div class="skeleton sk-line"></div>
    </div>
  </section>
</div>

<style>
  .sg {
    padding: var(--space-5) var(--space-3) var(--space-8);
  }
  .sg__head {
    padding: var(--space-4) 0 var(--space-5);
    max-width: 60ch;
  }
  .sg__head p {
    line-height: 1.6;
  }
  .sg__section {
    padding: var(--space-5) 0;
    border-top: 1px dotted var(--line-soft);
  }
  .sg__section h2 {
    margin: 0 0 var(--space-4);
    font-weight: 500;
  }
  code {
    font-family: ui-monospace, monospace;
    font-size: 13px;
    color: var(--text);
  }

  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-3);
  }
  .swatch {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }
  .swatch__chip {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--line-soft);
    flex-shrink: 0;
  }
  .swatch__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .swatch__note {
    font-size: var(--fs-sm);
  }

  .type-list,
  .spacing-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .type-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
  }
  .type-sample {
    color: var(--text-strong);
  }
  .spacing-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .spacing-bar {
    height: 16px;
    background: var(--nav);
    border-radius: 2px;
  }

  .radii {
    display: flex;
    gap: var(--space-5);
    flex-wrap: wrap;
  }
  .radius {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }
  .radius__box {
    width: 64px;
    height: 64px;
    background: var(--profile);
    border: 1px solid var(--line-soft);
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
  }
  .code-note {
    margin: var(--space-3) 0 0;
    font-size: var(--fs-sm);
  }

  .sk-box {
    width: 48px;
    height: 48px;
  }
  .sk-line {
    width: 200px;
    height: 14px;
  }
</style>
