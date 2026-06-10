import { defineConfig, presetWind3 } from 'unocss'

// Semantic tokens resolve to CSS vars defined in src/app/styles/theme.css.
// Swapping data-theme on <html> re-themes instantly, no rebuild (ADR-012).
// presetWind3 is the Tailwind-v3-compatible successor of the old presetUno.
export default defineConfig({
  presets: [presetWind3()],
  theme: {
    colors: {
      surface: {
        background: 'var(--surface-background)',
        raised: 'var(--surface-raised)',
        sunken: 'var(--surface-sunken)',
        overlay: 'var(--surface-overlay)',
        hover: 'var(--surface-hover)',
      },
      text: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        'on-accent': 'var(--text-on-accent)',
      },
      border: {
        subtle: 'var(--border-subtle)',
        default: 'var(--border-default)',
        strong: 'var(--border-strong)',
      },
      accent: {
        DEFAULT: 'var(--accent-default)',
        default: 'var(--accent-default)',
        hover: 'var(--accent-hover)',
        active: 'var(--accent-active)',
        text: 'var(--accent-text)',
        'subtle-bg': 'var(--accent-subtle-bg)',
        'subtle-text': 'var(--accent-subtle-text)',
      },
      action: {
        'primary-default': 'var(--accent-default)',
        'primary-hover': 'var(--accent-hover)',
        'primary-text': 'var(--accent-text)',
        'secondary-default': 'var(--action-secondary-default)',
        'secondary-hover': 'var(--action-secondary-hover)',
      },
      feedback: {
        'success-bg': 'var(--feedback-success-bg)',
        'success-text': 'var(--feedback-success-text)',
        'danger-bg': 'var(--feedback-danger-bg)',
        'danger-text': 'var(--feedback-danger-text)',
        'warning-text': 'var(--feedback-warning-text)',
      },
    },
    boxShadow: {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
    },
    borderRadius: {
      md: '0.5rem',
      lg: '0.625rem',
      xl: '0.875rem',
    },
  },
  shortcuts: {
    // Accessible focus ring used across interactive elements.
    'focus-ring':
      'outline-none focus-visible:(ring-2 ring-accent/60 ring-offset-2 ring-offset-surface-background)',
    // Surfaces.
    card: 'rounded-lg border border-border-default bg-surface-raised shadow-sm',
    'panel-inset': 'rounded-lg border border-border-subtle bg-surface-sunken',
    // Interactive list row.
    'row-interactive':
      'focus-ring rounded-md transition-colors duration-150 hover:bg-surface-hover',
    // Icon button.
    'icon-btn':
      'focus-ring inline-flex items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:(bg-surface-hover text-text-primary)',
  },
})
