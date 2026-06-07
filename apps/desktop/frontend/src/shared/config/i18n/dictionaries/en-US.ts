// No `as const`: property names stay literal (so translation keys infer), but
// values widen to `string` so other locales can satisfy `typeof enUS`.
export default {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
  },
  navigation: {
    section: 'Workspace',
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
  home: {
    open: 'Open',
    journalDesc: 'Capture the day with low-friction daily notes.',
    notesDesc: 'Distill ideas into atomic, linked notes.',
    reviewDesc: 'Retain what matters with spaced repetition.',
  },
  editor: {
    title: 'Block editor (Spike #1)',
    subtitle: 'ProseMirror + Loro CRDT. Type anywhere — the meter shows keystroke latency.',
    saving: 'Saving',
    saved: 'Saved',
    saveError: 'Save failed',
    persist: 'Persist to core',
    export: 'Export',
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
    subtitle: 'Cards due now, scheduled by FSRS.',
    empty: 'Nothing due. 🎉',
    add: 'Add to review',
    added: 'Added ✓',
    addError: 'Could not add',
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
    search: 'Search…',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  command: {
    placeholder: 'Search notes or run a command…',
    empty: 'No results.',
    commandsLabel: 'Commands',
    notesLabel: 'Notes',
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
