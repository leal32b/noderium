import { splitProps } from 'solid-js'
import type { Component, JSX } from 'solid-js'

import { cx } from './cx'

export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>

export const Input: Component<InputProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <input
      autocomplete="off"
      spellcheck={false}
      class={cx(
        'h-[var(--control-height)] w-full rounded-md border border-border-default bg-surface-raised px-3 text-sm text-text-primary outline-none transition-all duration-150',
        'placeholder:text-text-tertiary',
        'hover:border-border-strong',
        'focus:(border-accent ring-2 ring-accent/25)',
        local.class,
      )}
      {...rest}
    />
  )
}
