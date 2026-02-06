# Theming Complete Guide

> Comprehensive guide for creating, customizing, and using daisyUI themes in Noderium.

---

## Table of Contents

1. [How Themes Work](#how-themes-work)
2. [Available Variables](#available-variables)
3. [Creating New Themes](#creating-new-themes)
4. [Editing Existing Themes](#editing-existing-themes)
5. [Using Themes in the Application](#using-themes-in-the-application)
6. [Useful Tools](#useful-tools)
7. [Best Practices](#best-practices)

---

## How Themes Work

daisyUI themes work through **CSS Variables** that are applied via the `data-theme` attribute:

```html
<!-- Apply theme to entire page -->
<html data-theme="light">

<!-- Apply theme to a specific section -->
<div data-theme="dark">
  This content uses the dark theme
</div>

<!-- Themes can be nested -->
<html data-theme="light">
  <div data-theme="dark">
    Dark theme
    <div data-theme="cupcake">
      Cupcake theme inside dark!
    </div>
  </div>
</html>
```

---

## Available Variables

### Main Colors

```css
/* System colors */
--color-primary          /* Primary color */
--color-primary-content  /* Text over primary color */

--color-secondary          /* Secondary color */
--color-secondary-content  /* Text over secondary color */

--color-accent          /* Accent color */
--color-accent-content  /* Text over accent */

--color-neutral          /* Neutral color */
--color-neutral-content  /* Text over neutral */
```

### Base Colors (Backgrounds)

```css
--color-base-100  /* Main page background */
--color-base-200  /* Card/component background */
--color-base-300  /* Hover/pressed element background */
--color-base-content  /* Main text color */
```

### State Colors

```css
--color-info     /* Information */
--color-success  /* Success */
--color-warning  /* Warning */
--color-error    /* Error */

/* And their respective content colors */
--color-info-content
--color-success-content
--color-warning-content
--color-error-content
```

### Border Radius

```css
--radius-box      /* Border radius for cards, containers */
--radius-field    /* Border radius for inputs, text fields */
--radius-selector /* Border radius for radio, checkbox */
```

### Other Variables

```css
--border  /* Default border width */
--depth   /* Shadow depth */
--noise   /* Noise/texture effect */
```

---

## Creating New Themes

### Method 1: In the `App.css` file

```css
[data-theme="my-theme"] {
  /* Define if it's light or dark (affects browser UI) */
  color-scheme: light; /* or 'dark' */
  
  /* Main colors */
  --color-primary: oklch(55% 0.32 240);
  --color-primary-content: oklch(98% 0.01 240);
  
  --color-secondary: oklch(70% 0.25 200);
  --color-secondary-content: oklch(98% 0.01 200);
  
  --color-accent: oklch(65% 0.25 160);
  --color-accent-content: oklch(98% 0.01 160);
  
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
  
  /* Neutral */
  --color-neutral: oklch(50% 0.05 240);
  --color-neutral-content: oklch(98% 0.01 240);
  
  /* Border Radius */
  --radius-box: 1rem;
  --radius-field: 0.5rem;
  --radius-selector: 0.25rem;
  
  /* Others */
  --border: 1px;
  --depth: 1;
  --noise: 0;
}
```

### Understanding OKLCH Format

daisyUI uses the **OKLCH** color format (more modern than RGB/HSL):

```
oklch(lightness% chroma hue)
```

- **lightness**: `0-100%` - 0% = black, 100% = white
- **chroma**: `0-0.4` - 0 = gray, 0.4 = maximum saturation
- **hue**: `0-360` - position on the color wheel
  - 0/360: red
  - 120: green
  - 240: blue
  - 280: purple
  - etc.

**Examples:**
```css
oklch(50% 0.2 0)    /* Medium red, medium saturation */
oklch(90% 0.05 240) /* Very light blue, low saturation */
oklch(30% 0.3 140)  /* Dark green, high saturation */
```

---

## Editing Existing Themes

To modify a built-in theme (like `light` or `dark`), override only the variables you want to change:

```css
/* Customize only some colors from the light theme */
[data-theme="light"] {
  --color-primary: oklch(65% 0.28 180); /* Change: cyan primary */
  --radius-box: 0.25rem; /* Change: more squared corners */
  /* All other variables inherit from the original theme */
}

/* Customize the dark theme */
[data-theme="dark"] {
  --color-base-100: oklch(15% 0.01 240); /* Darker background */
  --color-primary: oklch(75% 0.25 280); /* Lighter purple primary */
}
```

---

## Using Themes in the Application

### 1. Switch Theme Dynamically (React/Solid)

```tsx
// Change the entire page theme
const changeTheme = (themeName: string) => {
  document.documentElement.setAttribute('data-theme', themeName)
}

// Usage:
<button onClick={() => changeTheme('dark')}>Dark Theme</button>
<button onClick={() => changeTheme('light')}>Light Theme</button>
<button onClick={() => changeTheme('noderium')}>Noderium Theme</button>
```

### 2. Light/Dark Toggle (your current code)

```tsx
// stores/theme.ts
import { createSignal } from 'solid-js'

const dataTheme = document.documentElement.getAttribute('data-theme') === 'dark'
const [isDark, setIsDark] = createSignal(dataTheme)

const toggleTheme = () => {
  setIsDark(!isDark())
  document.documentElement.setAttribute('data-theme', isDark() ? 'dark' : 'light')
}

export { isDark, toggleTheme }
```

### 3. Save User Preference

```tsx
const themes = ['light', 'dark', 'noderium', 'cupcake'] as const
type Theme = typeof themes[number]

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem('theme')
  return (stored && themes.includes(stored as Theme)) 
    ? (stored as Theme) 
    : 'light'
}

const [theme, setTheme] = createSignal<Theme>(getStoredTheme())

const changeTheme = (newTheme: Theme) => {
  setTheme(newTheme)
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}

// Apply theme on load
createEffect(() => {
  document.documentElement.setAttribute('data-theme', theme())
})
```

### 4. Respect System Preference

```tsx
const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light'
}

const [theme, setTheme] = createSignal<string>(
  localStorage.getItem('theme') || getSystemTheme()
)

// Watch for changes in system preference
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light')
    }
  })
```

---

## Useful Tools

### 1. Online Theme Generator

Use daisyUI's official generator:
- **URL**: https://daisyui.com/theme-generator/
- Create themes visually and copy the CSS variables

### 2. Convert Colors to OKLCH

```javascript
// In browser console (Chrome/Firefox):
// Install: https://www.npmjs.com/package/culori

// Or use online tool:
// https://oklch.com/
```

### 3. Inspect Variables in DevTools

```javascript
// In browser console, get all current theme variables:
const styles = getComputedStyle(document.documentElement)
const daisyVars = [...document.styleSheets]
  .flatMap(sheet => [...sheet.cssRules])
  .filter(rule => rule.cssText?.includes('--color'))

console.log(daisyVars)
```

### 4. List Available Themes in UnoCSS

In `uno.config.ts`:

```typescript
presetDaisy({
  themes: [
    // Available built-in themes:
    'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 
    'corporate', 'synthwave', 'retro', 'cyberpunk', 'valentine',
    'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel',
    'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk',
    'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee',
    'winter', 'dim', 'nord', 'sunset', 'caramellatte', 'abyss', 'silk'
  ]
})
```

---

## Best Practices

### Do

1. **Maintain consistency** - Use the theme's color palette in your components
2. **Use CSS variables** - Prefer `bg-base-100` instead of hardcoded colors
3. **Test both themes** - Always test light and dark
4. **Limited palette** - Don't create too many custom colors

### Don't

1. **Mix formats** - Use OKLCH, not RGB/HSL in daisyUI variables
2. **Ignore contrast** - Always define `-content` with adequate contrast
3. **Hardcode colors** - Use theme variables

### Complete Component Example

```tsx
// Component that respects the theme
const Card = () => {
  return (
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-primary">Title</h2>
        <p class="text-base-content">
          This card uses the current theme's variables
        </p>
        <div class="card-actions">
          <button class="btn btn-primary">Action</button>
          <button class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}
```

---

## Additional Resources

- **Official daisyUI documentation**: https://daisyui.com/docs/themes/
- **UnoCSS preset daisy**: https://github.com/unscatty/unocss-preset-daisy
- **OKLCH Color Picker**: https://oklch.com/
- **theme-change**: https://github.com/saadeghi/theme-change (library for managing themes)

