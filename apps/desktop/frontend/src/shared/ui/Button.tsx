import { Button as KButton } from '@kobalte/core/button'
import { splitProps } from 'solid-js'
import type { Component, JSX } from 'solid-js'

import { cx } from './cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-text shadow-sm hover:bg-accent-hover active:bg-accent-active',
  secondary:
    'border border-border-default bg-surface-raised text-text-primary shadow-sm hover:(bg-surface-hover border-border-strong)',
  ghost: 'text-text-secondary hover:(bg-surface-hover text-text-primary)',
  danger: 'text-feedback-danger-text hover:bg-feedback-danger-bg',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-md px-2.5 text-[13px]',
  md: 'h-[var(--control-height)] gap-2 rounded-md px-3.5 text-sm',
  lg: 'h-11 gap-2 rounded-lg px-5 text-[15px]',
}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['variant', 'size', 'class'])
  return (
    <KButton
      class={cx(
        'focus-ring inline-flex select-none items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:(pointer-events-none opacity-50)',
        VARIANTS[local.variant ?? 'primary'],
        SIZES[local.size ?? 'md'],
        local.class,
      )}
      {...rest}
    />
  )
}
