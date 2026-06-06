import { invoke } from './tauri-invoke'

/** A block as returned by the Rust `note_blocks` command. */
export interface BlockDto {
  id: string
  block_type: string
  text: string
}

/**
 * Typed client for the noderium-app-core Tauri commands. Keys are snake_case to
 * match the Rust command parameter names exactly.
 */
export const core = {
  createNote: (id: string, noteType: string, title?: string): Promise<void> =>
    invoke('create_note', { id, note_type: noteType, title: title ?? null }),

  addBlock: (noteId: string, blockType: string, text: string): Promise<string> =>
    invoke('add_block', { note_id: noteId, block_type: blockType, text }),

  noteBlocks: (noteId: string): Promise<BlockDto[]> => invoke('note_blocks', { note_id: noteId }),

  search: (query: string): Promise<string[]> => invoke('search', { query }),
}
