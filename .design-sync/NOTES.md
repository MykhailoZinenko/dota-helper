# design-sync notes

Off-script sync — this is a SvelteKit app, NOT a React component library, so
the standard converter (package/storybook) does not apply. We sync styles +
tokens + guidelines + preview cards only; there are no live React components.

Bundle build (regenerate `ds-bundle/` before each re-sync):
- `styles.css` = Space Grotesk @import + `apps/web/src/lib/styles/tokens.css`
  + `apps/web/src/app.css` (with its own `@import` line stripped).
- `components/**/*.html` are hand-authored preview cards (first line
  `<!-- @dsCard group="…" -->`) rendering each component against `/styles.css`.
- `README.md` is the conventions doc for the design agent.
- No `_ds_sync.json` anchor → each re-sync re-verifies/re-uploads everything.

Caveat: font is loaded via Google Fonts `@import`; if claude.ai/design's CSP
blocks it, bundle Space Grotesk as a `@font-face` data URI instead.
