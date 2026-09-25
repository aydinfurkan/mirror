# Visualize tokens

`visualize.html` copies the `css` block below into its style. Edit a value here, then
rebuild `visualize.html`. Keep the variable names. `:root` holds the light theme and the
sizes. `:root[data-theme="dark"]` holds the dark theme colors.

```css
:root {
  --bg: #f6f7f9;  --grid: #d5dae1;  --surface: #ffffff;  --panel: #ffffff;  --border: #e4e7ec;
  --text: #111827;  --muted: #6b7280;  --edge: #c3cad4;  --accent: #4f6bff;
  --shadow: drop-shadow(0 1px 1px rgb(16 24 40 / .05)) drop-shadow(0 4px 10px rgb(16 24 40 / .07));
  --project: #4f6bff;  --flow: #12a37a;  --page: #d98a1c;  --step: #94a3b8;
  --added: #16a34a;  --changed: #d97706;  --removed: #dc2626;
  --box-w: 240px;  --box-h: 64px;  --gap-x: 96px;  --gap-y: 20px;  --radius: 12px;
  --font: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace;
}
:root[data-theme="dark"] {
  --bg: #0b0d12;  --grid: #222835;  --surface: #151922;  --panel: #11151c;  --border: #262c38;
  --text: #e6e9ef;  --muted: #8b93a3;  --edge: #3a4252;  --accent: #7b8cff;
  --shadow: drop-shadow(0 1px 1px rgb(0 0 0 / .4)) drop-shadow(0 6px 14px rgb(0 0 0 / .35));
  --project: #7b8cff;  --flow: #34d399;  --page: #fbbf24;  --step: #64748b;
  --added: #22c55e;  --changed: #f59e0b;  --removed: #f87171;
}
```

| Token | Meaning |
| --- | --- |
| `--bg`, `--grid` | Canvas background and its dot grid. |
| `--surface`, `--panel`, `--border` | Card fill. Header, drawer and toolbar fill. Card and panel borders. |
| `--text`, `--muted` | Main text. Secondary text. |
| `--edge` | Lines between cards. |
| `--accent` | Selection, focus, search matches, links. |
| `--shadow` | Card shadow, as CSS `filter` functions. |
| `--project`, `--flow`, `--page`, `--step` | Top bar and badge color of each card type. `--flow` is a backend, worker or consumer flow. `--page` is a frontend or Expo page. |
| `--added`, `--changed`, `--removed` | Card border on a feature review page. |
| `--box-w`, `--box-h` | Size of each card, in px. |
| `--gap-x`, `--gap-y` | Space between columns and between rows, in px. |
| `--radius` | Corner radius of each card, in px. |
| `--font`, `--mono` | Text font. Code font. The page loads no web font; `Inter` is used when it is installed. |

The viewer follows the light or dark setting of the system. The theme button stores the
choice of the reader in the browser.
