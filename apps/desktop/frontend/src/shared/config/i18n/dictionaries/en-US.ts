// No `as const`: property names stay literal (so translation keys infer), but
// values widen to `string` so other locales can satisfy `typeof enUS`.
export default {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
  },
  navigation: {
    home: 'Home',
    settings: 'Settings',
  },
  app: {
    welcome: {
      title: 'Welcome to Noderium',
      subtitle: 'Capture → distill → retain. Your second brain, local-first.',
    },
  },
  topbar: {
    toggleSidebar: 'Toggle sidebar',
    theme: 'Theme',
    language: 'Language',
    openCommandPalette: 'Open command palette',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  command: {
    placeholder: 'Type a command or search…',
    empty: 'No commands found.',
    group: {
      navigate: 'Navigate',
      actions: 'Actions',
    },
    navigate: {
      home: 'Go to Home',
      settings: 'Go to Settings',
    },
    actions: {
      toggleTheme: 'Toggle light/dark theme',
    },
  },
  notFound: {
    title: 'Page not found',
    back: 'Back to Home',
  },
}
