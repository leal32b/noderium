import { createContext, createSignal, useContext } from 'solid-js'
import type { Accessor, ParentComponent } from 'solid-js'

/**
 * SyncProvider — CRDT/sync engine state (ADR-012 adaptation of the blueprint's
 * RealtimeProvider). Phase 2 stub: exposes a static status; the real Loro/sync
 * client wiring lands with the domain layer (v2).
 */
export type SyncStatus = 'idle' | 'syncing' | 'offline'

export interface SyncContextValue {
  status: Accessor<SyncStatus>
}

const SyncContext = createContext<SyncContextValue>()

export const SyncProvider: ParentComponent = (props) => {
  const [status] = createSignal<SyncStatus>('idle')
  return <SyncContext.Provider value={{ status }}>{props.children}</SyncContext.Provider>
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSync must be used inside <SyncProvider>')
  return ctx
}
