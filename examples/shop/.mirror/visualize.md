# Visualize tokens

`visualize.html` copies the `css` block below into its style. Edit a value here, then
rebuild `visualize.html`. Keep the variable names. `:root` holds the light theme and the
sizes. `:root[data-theme="dark"]` holds the dark theme colors.

```css
:root {
  --bg: #fafafa;  --surface: #ffffff;  --panel: #ffffff;  --border: #e4e4e7;
  --text: #09090b;  --muted: #52525b;  --edge: #a1a1aa;  --accent: #09090b;
  --shadow: 0 0 #0000;
  --project: #09090b;  --flow: #2563eb;  --page: #d97706;  --step: #71717a;  --group: #3f3f46;  --external: #7c3aed;
  --added: #16a34a;  --changed: #eab308;  --removed: #dc2626;
  --box-w: 340px;  --box-h: 112px;  --gap-x: 20px;  --gap-y: 56px;  --radius: 14px;
  --font: Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "Geist Mono", ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace;
}
:root[data-theme="dark"] {
  --bg: #09090b;  --surface: #18181b;  --panel: #111113;  --border: #27272a;
  --text: #fafafa;  --muted: #a1a1aa;  --edge: #52525b;  --accent: #fafafa;
  --shadow: 0 0 #0000;
  --project: #fafafa;  --flow: #60a5fa;  --page: #fbbf24;  --step: #71717a;  --group: #52525b;  --external: #a78bfa;
  --added: #22c55e;  --changed: #facc15;  --removed: #f87171;
}
```

| Token | Meaning |
| --- | --- |
| `--bg` | Canvas background. |
| `--surface`, `--panel`, `--border` | Card fill. Header, drawer and toolbar fill. Card and panel borders. |
| `--text`, `--muted` | Main text. Secondary text. |
| `--edge` | Lines between cards. On the System tab, the lines between projects and external systems. |
| `--accent` | Selection, focus, search matches, links. |
| `--shadow` | Card shadow, as a CSS `box-shadow` value. Use `0 0 #0000` for no shadow. |
| `--project`, `--flow`, `--page`, `--step` | Border and badge color of each card type. `--step` colors the step numbers inside a flow card. `--flow` is a backend, worker or consumer flow. `--page` is a frontend or Expo page. |
| `--group` | Fill, border and label of each group box of flows. |
| `--external` | Border and badge color of an external system card on the System tab: a database, a queue, or an API outside the repo. |
| `--added`, `--changed`, `--removed` | Card border on a feature review page. |
| `--box-w`, `--box-h` | Width and minimum height of each card, in px. A card grows when its steps are open. |
| `--gap-x`, `--gap-y` | Space between flow cards, and between the project card and the flow row, in px. |
| `--radius` | Corner radius of each card and group box, in px. |
| `--font`, `--mono` | Text font. Code font. The page loads `Geist` and `Geist Mono` from Google Fonts. Without a network, it uses the system font. |

The viewer follows the light or dark setting of the system. The theme button stores the
choice of the reader in the browser.
