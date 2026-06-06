import { presetUno } from '@unocss/preset-uno'
import { defineConfig } from 'unocss'

// Semantic tokens resolve to CSS vars defined in src/app/styles/theme.css.
// Swapping data-theme on <html> re-themes instantly, no rebuild (ADR-012).
export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      surface: {
        background: 'var(--surface-background)',
        raised: 'var(--surface-raised)',
        sunken: 'var(--surface-sunken)',
      },
      text: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
      },
      border: {
        default: 'var(--border-default)',
      },
      action: {
        'primary-default': 'var(--action-primary-default)',
        'primary-hover': 'var(--action-primary-hover)',
        'primary-text': 'var(--action-primary-text)',
        'secondary-default': 'var(--action-secondary-default)',
        'secondary-hover': 'var(--action-secondary-hover)',
      },
    },
  },
  shortcuts: {
    'focus-ring':
      'outline-none focus-visible:(ring-2 ring-offset-2 ring-action-primary-default ring-offset-surface-background)',
  },
})
