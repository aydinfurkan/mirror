# Visualize tokens

`visualize.html` copies the `:root` block below into its style. Edit a value here, then
rebuild `visualize.html`. Keep the variable names.

```css
:root {
  --bg: #0f1115;  --panel: #171a21;  --text: #e6e6e6;  --muted: #8a8f98;
  --project: #6c8cff;  --flow: #3fb68b;  --page: #e0a84f;  --step: #8a8f98;
  --added: #2ea043;  --changed: #d29922;  --removed: #f85149;
  --box-w: 220px;  --box-h: 56px;  --gap-x: 80px;  --gap-y: 24px;
  --radius: 8px;  --font: system-ui, sans-serif;
}
```

| Token | Meaning |
| --- | --- |
| `--bg`, `--panel` | Page background. Box and side panel background. |
| `--text`, `--muted` | Main text. Secondary text, edges. |
| `--project` | Border of a project box. |
| `--flow` | Border of a backend, worker or consumer flow box. |
| `--page` | Border of a frontend or Expo page box. |
| `--step` | Border of a step box. |
| `--added`, `--changed`, `--removed` | Border of a box on a feature review page. |
| `--box-w`, `--box-h` | Size of each box, in px. |
| `--gap-x`, `--gap-y` | Space between columns and between rows, in px. |
| `--radius` | Corner radius of each box, in px. |
| `--font` | Font family. |
