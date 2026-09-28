# Visualize tokens

`visualize.html` copies the `css` block below into its style. Edit a value here, then
rebuild `visualize.html`. Keep the variable names. `:root` holds the light theme and the
sizes. `:root[data-theme="dark"]` holds the dark theme colors.

```css
:root {
  --bg: #f8fafc;  --surface: #ffffff;  --panel: #ffffff;  --border: #e2e8f0;
  --text: #0f172a;  --muted: #64748b;  --edge: #cbd5e1;  --accent: #2563eb;
  --shadow: 0 1px 2px rgb(15 23 42 / .05), 0 4px 12px rgb(15 23 42 / .07);
  --project: #2563eb;  --flow: #0ea5e9;  --page: #f59e0b;  --step: #94a3b8;  --group: #64748b;
  --added: #16a34a;  --changed: #eab308;  --removed: #dc2626;
  --box-w: 260px;  --box-h: 88px;  --gap-x: 20px;  --gap-y: 56px;  --radius: 12px;
  --font: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace;
}
:root[data-theme="dark"] {
  --bg: #020617;  --surface: #0f172a;  --panel: #0b1222;  --border: #1e293b;
  --text: #e2e8f0;  --muted: #94a3b8;  --edge: #334155;  --accent: #60a5fa;
  --shadow: 0 1px 2px rgb(0 0 0 / .4), 0 6px 16px rgb(0 0 0 / .35);
  --project: #60a5fa;  --flow: #38bdf8;  --page: #fbbf24;  --step: #64748b;  --group: #94a3b8;
  --added: #22c55e;  --changed: #facc15;  --removed: #f87171;
}
```

| Token | Meaning |
| --- | --- |
| `--bg` | Canvas background. |
| `--surface`, `--panel`, `--border` | Card fill. Header, drawer and toolbar fill. Card and panel borders. |
| `--text`, `--muted` | Main text. Secondary text. |
| `--edge` | Lines between cards. |
| `--accent` | Selection, focus, search matches, links. |
| `--shadow` | Card shadow, as a CSS `box-shadow` value. |
| `--project`, `--flow`, `--page`, `--step` | Top bar and badge color of each card type. `--step` colors the step numbers inside a flow card. `--flow` is a backend, worker or consumer flow. `--page` is a frontend or Expo page. |
| `--group` | Fill, border and label of each group box of flows. |
| `--added`, `--changed`, `--removed` | Card border on a feature review page. |
| `--box-w`, `--box-h` | Width and minimum height of each card, in px. A card grows when its steps are open. |
| `--gap-x`, `--gap-y` | Space between flow cards, and between the project card and the flow row, in px. |
| `--radius` | Corner radius of each card, in px. |
| `--font`, `--mono` | Text font. Code font. The page loads no web font; `Inter` is used when it is installed. |

The viewer follows the light or dark setting of the system. The theme button stores the
choice of the reader in the browser.
