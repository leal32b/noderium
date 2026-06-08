import { describe, expect, it, vi } from 'vitest'

import { useCommandStore } from './store'

describe('command store', () => {
  it('registers and executes a command', () => {
    const store = useCommandStore()
    const run = vi.fn()
    store.register([{ id: 'test.run', title: 'Run', execute: run }])
    store.execute('test.run')
    expect(run).toHaveBeenCalledOnce()
    store.unregister(['test.run'])
    expect(store.commands().some((c) => c.id === 'test.run')).toBe(false)
  })
})
