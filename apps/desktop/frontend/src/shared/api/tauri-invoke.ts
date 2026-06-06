/**
 * Thin wrapper over Tauri's `invoke` (ADR-005): the frontend calls the Rust
 * `app-core` via commands/events, never HTTP. In Phase 2 the Tauri runtime is
 * not wired yet, so this stub throws if no Tauri global is present. Replaced by
 * `@tauri-apps/api/core` once the desktop shell exists.
 */
interface TauriGlobal {
  core: { invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T> }
}

function getTauri(): TauriGlobal | undefined {
  return (globalThis as { __TAURI__?: TauriGlobal }).__TAURI__
}

export function isTauri(): boolean {
  return getTauri() !== undefined
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const tauri = getTauri()
  if (!tauri) {
    throw new Error(
      `Tauri runtime not available (cmd "${cmd}"). The desktop shell is wired in a later phase.`,
    )
  }
  return tauri.core.invoke<T>(cmd, args)
}
