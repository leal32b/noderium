export interface Command {
  id: string
  title: string
  shortcut?: string
  execute: () => void
  hidden?: boolean
}
