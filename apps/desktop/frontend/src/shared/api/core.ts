import { invoke } from './tauri-invoke'

/** A backlink as returned by the Rust `backlinks` command. */
export interface BacklinkDto {
  source_note_id: string
  source_block_id: string
  text: string
}

/** A note as returned by the Rust `list_notes` command. */
export interface NoteDto {
  id: string
  type: string
  title: string | null
  journal_date: string | null
  created_at: number
  updated_at: number
}

/** A search hit (block text + owning note) from `search_detailed`. */
export interface SearchHitDto {
  block_id: string
  note_id: string
  text: string
}

/** An SRS card from `due_cards`. */
export interface SrsCardDto {
  id: string
  target_id: string
  card_type: string
  due: number
  state: string
  reps: number
}

export type Rating = 'again' | 'hard' | 'good' | 'easy'

/**
 * Typed client for the noderium-app-core Tauri commands. Argument keys are
 * camelCase: Tauri converts Rust's snake_case command params to camelCase on the
 * JS side (e.g. `note_type` -> `noteType`).
 */
export const core = {
  createNote: (id: string, noteType: string, title?: string): Promise<void> =>
    invoke('create_note', { id, noteType, title: title ?? null }),

  saveEditorSnapshot: (noteId: string, snapshot: Uint8Array): Promise<void> =>
    invoke('save_editor_snapshot', { noteId, snapshot: Array.from(snapshot) }),

  loadEditorSnapshot: async (noteId: string): Promise<Uint8Array | undefined> => {
    const bytes = await invoke<number[] | null>('load_editor_snapshot', { noteId })
    return bytes ? new Uint8Array(bytes) : undefined
  },

  exportNoteMarkdown: (noteId: string): Promise<string> =>
    invoke('export_note_markdown', { noteId }),

  openJournal: (date: string): Promise<string> => invoke('open_journal', { date }),

  backlinks: (noteId: string): Promise<BacklinkDto[]> => invoke('backlinks', { noteId }),

  importMarkdown: (noteId: string, markdown: string): Promise<void> =>
    invoke('import_markdown', { noteId, markdown }),

  listNotes: (): Promise<NoteDto[]> => invoke('list_notes'),

  searchDetailed: (query: string): Promise<SearchHitDto[]> => invoke('search_detailed', { query }),

  createCard: (cardId: string, targetId: string, cardType: string): Promise<void> =>
    invoke('create_card', { cardId, targetId, cardType }),

  dueCards: (): Promise<SrsCardDto[]> => invoke('due_cards'),

  reviewCard: (cardId: string, rating: Rating): Promise<void> =>
    invoke('review_card', { cardId, rating }),
}
