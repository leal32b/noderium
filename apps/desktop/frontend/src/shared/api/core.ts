import { invoke } from './tauri-invoke'

/** A block as returned by the Rust `note_blocks` command. */
export interface BlockDto {
  id: string
  block_type: string
  text: string
}

/** A backlink as returned by the Rust `backlinks` command. */
export interface BacklinkDto {
  source_note_id: string
  source_block_id: string
  text: string
}

/**
 * Typed client for the noderium-app-core Tauri commands. Argument keys are
 * camelCase: Tauri converts Rust's snake_case command params to camelCase on the
 * JS side (e.g. `note_type` -> `noteType`).
 */
export const core = {
  createNote: (id: string, noteType: string, title?: string): Promise<void> =>
    invoke('create_note', { id, noteType, title: title ?? null }),

  addBlock: (noteId: string, blockType: string, text: string): Promise<string> =>
    invoke('add_block', { noteId, blockType, text }),

  noteBlocks: (noteId: string): Promise<BlockDto[]> => invoke('note_blocks', { noteId }),

  search: (query: string): Promise<string[]> => invoke('search', { query }),

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
}
