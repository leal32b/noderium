export type CommandGroup = 'navigate' | 'actions'

export interface Command {
  id: string
  title: string
  group: CommandGroup
  shortcut?: string
  execute: () => void
  hidden?: boolean
}
