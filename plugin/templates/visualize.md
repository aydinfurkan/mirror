# Visualize tokens

`visualize.html` copies the `css` block below into its style. Edit a value here, then
rebuild `visualize.html`. Keep the variable names. `:root` holds the light theme and the
fonts. `:root[data-theme="dark"]` holds the dark theme colors.

```css
:root {
  --bg: #fafafa;  --surface: #ffffff;  --panel: #ffffff;  --border: #e4e4e7;
  --text: #09090b;  --muted: #52525b;  --accent: #09090b;
  --project: #09090b;  --flow: #2563eb;  --page: #d97706;
  --added: #16a34a;  --changed: #eab308;  --removed: #dc2626;
  --font: Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "Geist Mono", ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace;
}
:root[data-theme="dark"] {
  --bg: #09090b;  --surface: #18181b;  --panel: #111113;  --border: #27272a;
  --text: #fafafa;  --muted: #a1a1aa;  --accent: #fafafa;
  --project: #fafafa;  --flow: #60a5fa;  --page: #fbbf24;
  --added: #22c55e;  --changed: #facc15;  --removed: #f87171;
}
```

| Token | Meaning |
| --- | --- |
| `--bg` | Page background. |
| `--surface`, `--panel`, `--border` | Open row fill. Header and tab bar fill. Row and panel borders. |
| `--text`, `--muted` | Main text. Secondary text. |
| `--accent` | Focus and search matches. |
| `--project`, `--flow`, `--page` | Badge, border and tint of each row type. `--flow` is a backend, worker or consumer flow. `--page` is a frontend or Expo page. |
| `--added`, `--changed`, `--removed` | Row and step colors on a feature review page. |
| `--font`, `--mono` | Text font. Code font. The page loads `Geist` and `Geist Mono` from Google Fonts. Without a network, it uses the system font. |

The viewer follows the light or dark setting of the system. The theme button stores the
choice of the reader in the browser.
