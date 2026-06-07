// No `as const`: property names stay literal (so translation keys infer), but
// values widen to `string` so other locales can satisfy `typeof enUS`.
export default {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
  },
  navigation: {
    home: 'Home',
    journal: 'Journal',
    notes: 'Notes',
    review: 'Review',
    settings: 'Settings',
    editor: 'Editor',
  },
  app: {
    welcome: {
      title: 'Welcome to Noderium',
      subtitle: 'Capture → distill → retain. Your second brain, local-first.',
    },
  },
  editor: {
    title: 'Block editor (Spike #1)',
    subtitle: 'ProseMirror + Loro CRDT. Type anywhere — the meter shows keystroke latency.',
    saving: 'Saving…',
    saved: 'Saved ✓',
  },
  journal: {
    title: 'Journal',
  },
  notes: {
    title: 'Notes',
    new: 'New note',
    untitled: 'Untitled',
    empty: 'No notes yet.',
  },
  review: {
    title: 'Review',
    empty: 'Nothing due. 🎉',
    add: 'Add to review',
    added: 'Added ✓',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
  },
  search: {
    title: 'Search',
    placeholder: 'Search your notes…',
    run: 'Search',
    matches: 'matches',
  },
  backlinks: {
    title: 'Backlinks',
    empty: 'No backlinks yet.',
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
      journal: 'Go to Journal',
      notes: 'Go to Notes',
      review: 'Go to Review',
      settings: 'Go to Settings',
      editor: 'Go to Editor',
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
