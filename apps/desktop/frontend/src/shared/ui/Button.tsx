import { Button as KButton } from '@kobalte/core/button'
import { splitProps } from 'solid-js'
import type { Component, JSX } from 'solid-js'

import { cx } from './cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-action-primary-default text-action-primary-text hover:bg-action-primary-hover',
  secondary:
    'bg-action-secondary-default text-text-primary hover:bg-action-secondary-hover border border-border-default',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-sunken',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2 text-sm',
  md: 'h-9 px-3 text-sm',
  lg: 'h-11 px-5 text-base',
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['variant', 'size', 'class'])
  return (
    <KButton
      class={cx(
        'focus-ring inline-flex items-center justify-center gap-2 rounded font-medium transition-colors disabled:(opacity-50 cursor-not-allowed)',
        VARIANTS[local.variant ?? 'primary'],
        SIZES[local.size ?? 'md'],
        local.class,
      )}
      {...rest}
    />
  )
}
