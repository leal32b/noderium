/**
 * Bridge to the Rust core (ADR-005): the frontend calls `app-core` via Tauri
 * commands, never HTTP. Thin wrapper over the official Tauri API so the rest of
 * the app depends on our surface, not the SDK directly.
 */
import { invoke as tauriInvoke, isTauri as tauriIsTauri } from '@tauri-apps/api/core'

export function isTauri(): boolean {
  return tauriIsTauri()
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    throw new Error(
      `Tauri runtime not available (cmd "${cmd}"). Run the app via Tauri, not the browser.`,
    )
  }
  return tauriInvoke<T>(cmd, args)
}
