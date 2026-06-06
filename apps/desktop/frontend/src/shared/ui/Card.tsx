import { splitProps } from 'solid-js'
import type { JSX, ParentComponent } from 'solid-js'

import { cx } from './cx'

export type CardProps = JSX.HTMLAttributes<HTMLDivElement>

export const Card: ParentComponent<CardProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <div
      class={cx(
        'rounded-lg border border-border-default bg-surface-raised p-4 text-text-primary',
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  )
}
