import { createRoot, createSignal } from 'solid-js'
import type { Accessor } from 'solid-js'

import type { Command } from './types'

export interface CommandStore {
  commands: Accessor<Command[]>
  register: (commands: Command[]) => void
  unregister: (ids: string[]) => void
  execute: (id: string) => void
}

function createCommandStore(): CommandStore {
  const [commands, setCommands] = createSignal<Command[]>([])

  const register: CommandStore['register'] = (toAdd) =>
    setCommands((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]))
      for (const command of toAdd) byId.set(command.id, command)
      return [...byId.values()]
    })

  const unregister: CommandStore['unregister'] = (ids) =>
    setCommands((prev) => prev.filter((c) => !ids.includes(c.id)))

  const execute: CommandStore['execute'] = (id) => {
    commands()
      .find((c) => c.id === id)
      ?.execute()
  }

  const visible: Accessor<Command[]> = () => commands().filter((c) => !c.hidden)

  return { commands: visible, register, unregister, execute }
}

// Singleton registry shared across widgets and features.
const store = createRoot(createCommandStore)

export function useCommandStore(): CommandStore {
  return store
}
