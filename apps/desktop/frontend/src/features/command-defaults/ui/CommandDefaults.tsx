import type { Component } from 'solid-js'

import { useDefaultCommands } from '../model/useDefaultCommands'

/** Headless component: registers default commands when mounted in the shell. */
export const CommandDefaults: Component = () => {
  useDefaultCommands()
  return null
}
