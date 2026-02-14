# Theming Quick Start

> Quick reference for working with daisyUI themes in Noderium.

---

## Quick Start

### Switching Themes

```javascript
// Change theme in HTML
document.documentElement.setAttribute('data-theme', 'dark')

// Save to localStorage
localStorage.setItem('theme', 'dark')
```

### Using Theme Components

```tsx
import { ThemeSelector } from './components/ThemeSelector'

<ThemeSelector /> // Complete theme selector
// or
<ThemeToggle />   // Simple light/dark toggle
```

---

## Available Themes

**Currently enabled in the project** (see `App.css`):
- `light` — Default theme
- `dark` — Dark theme

**To enable more themes**, edit `App.css`:

```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default, dark, cupcake, synthwave, dracula;
}
```

:::tip
Use `--default` after a theme name to set it as the default. If no `themes` config is provided, **all** built-in themes are available.
:::

### All DaisyUI Built-in Themes

#### Light Themes

| Theme | Description |
|-------|-------------|
| `light` | Default light theme |
| `cupcake` | Soft pastel colors |
| `bumblebee` | Yellow/amber accent |
| `emerald` | Green accent |
| `corporate` | Professional blue tones |
| `retro` | Vintage/retro palette |
| `valentine` | Pink/romantic tones |
| `garden` | Natural greens |
| `aqua` | Cyan/aqua tones |
| `lofi` | Minimal, low-contrast |
| `pastel` | Soft pastel palette |
| `fantasy` | Purple/magical tones |
| `wireframe` | Minimal, monochrome |
| `cmyk` | Print-inspired colors |
| `autumn` | Warm fall tones |
| `acid` | Neon/vibrant colors |
| `lemonade` | Yellow/green fresh tones |
| `winter` | Cool blue tones |
| `caramellatte` | Warm caramel tones |
| `silk` | Elegant, soft palette |

#### Dark Themes

| Theme | Description |
|-------|-------------|
| `dark` | Default dark theme |
| `synthwave` | Neon 80s aesthetic |
| `cyberpunk` | Cyberpunk neon style |
| `halloween` | Orange/purple dark |
| `forest` | Dark greens |
| `black` | Pure black background |
| `luxury` | Gold accents on dark |
| `dracula` | Dracula color scheme |
| `night` | Deep blue dark |
| `coffee` | Warm brown dark |
| `business` | Professional dark |
| `dim` | Subtle dark palette |
| `nord` | Nord color scheme |
| `sunset` | Warm sunset tones |
| `abyss` | Deep dark blue |

---

## Creating a New Theme

### In the `App.css` file:

```css
[data-theme="mytheme"] {
  color-scheme: light; /* or 'dark' */
  
  /* Main colors */
  --color-primary: oklch(55% 0.32 240);
  --color-secondary: oklch(70% 0.25 200);
  --color-accent: oklch(65% 0.25 160);
  
  /* Backgrounds */
  --color-base-100: oklch(98% 0.02 240);
  --color-base-200: oklch(95% 0.03 240);
  --color-base-300: oklch(92% 0.04 240);
  --color-base-content: oklch(20% 0.05 240);
  
  /* States */
  --color-info: oklch(70% 0.22 220);
  --color-success: oklch(65% 0.25 140);
  --color-warning: oklch(80% 0.20 80);
  --color-error: oklch(65% 0.33 0);
  
  /* Others */
  --radius-box: 1rem;
}
```

### OKLCH Format:

```
oklch(lightness% chroma hue)
```

- **lightness**: 0-100% (black → white)
- **chroma**: 0-0.4 (gray → saturated)
- **hue**: 0-360 (red → green → blue → red)

---

## Editing Existing Themes

```css
/* Override only what you want to change */
[data-theme="light"] {
  --color-primary: oklch(65% 0.28 180); /* Cyan primary */
  --radius-box: 0.25rem; /* More squared corners */
  /* Other variables inherit from the original theme */
}
```

---

## Most Used Variables

### Colors

| Variable | Usage |
|----------|-------|
| `--color-primary` | App's primary color |
| `--color-base-100` | Main background |
| `--color-base-200` | Card background |
| `--color-base-content` | Text color |
| `--color-info` | Informative messages |
| `--color-success` | Positive feedback |
| `--color-error` | Errors and alerts |

### CSS Classes (Tailwind CSS)

```html
<div class="bg-base-100 text-base-content">
  <button class="btn btn-primary">Primary</button>
  <button class="btn btn-secondary">Secondary</button>
  <div class="card bg-base-200">Card</div>
  <div class="alert alert-success">Success!</div>
</div>
```

---

## Tools

- **Visual generator**: https://daisyui.com/theme-generator/
- **Color converter**: https://oklch.com/
- **Complete documentation**: See [Theming Complete Guide](./theming-guide)

---

## Best Practices

**Do:**
- Use daisyUI classes instead of hardcoded colors
- Test in both light and dark themes
- Save user preference to localStorage
- Respect system `prefers-color-scheme`

**Don't:**
- Use RGB/HSL in variables (use OKLCH)
- Ignore contrast ratios (always define `-content` variants)
- Create too many custom colors

---

## Next Steps

For a complete guide with detailed examples and best practices, see [Theming Complete Guide](./theming-guide).

