import { splitProps } from 'solid-js'
import type { Component, JSX } from 'solid-js'

import { cx } from './cx'

export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>

export const Input: Component<InputProps> = (props) => {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <input
      class={cx(
        'focus-ring h-9 w-full rounded border border-border-default bg-surface-background px-3 text-sm text-text-primary placeholder:text-text-tertiary',
        local.class,
      )}
      {...rest}
    />
  )
}
