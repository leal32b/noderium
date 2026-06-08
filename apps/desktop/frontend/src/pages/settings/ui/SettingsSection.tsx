import { Show } from 'solid-js'
import type { ParentComponent } from 'solid-js'

export interface SettingsSectionProps {
  title: string
  description?: string
}

/** A titled group of settings rows. New config areas drop in as more sections. */
export const SettingsSection: ParentComponent<SettingsSectionProps> = (props) => (
  <section class="flex flex-col gap-3">
    <div>
      <h2 class="text-sm font-semibold text-text-primary">{props.title}</h2>
      <Show when={props.description}>
        <p class="mt-0.5 text-xs text-text-tertiary">{props.description}</p>
      </Show>
    </div>
    <div class="card divide-y divide-border-subtle p-0">{props.children}</div>
  </section>
)

export interface SettingsRowProps {
  label: string
  description?: string
}

/** A single labeled control inside a [`SettingsSection`]. */
export const SettingsRow: ParentComponent<SettingsRowProps> = (props) => (
  <div class="flex items-center justify-between gap-4 px-4 py-3">
    <div class="min-w-0">
      <div class="text-sm font-medium text-text-primary">{props.label}</div>
      <Show when={props.description}>
        <div class="mt-0.5 text-xs text-text-tertiary">{props.description}</div>
      </Show>
    </div>
    <div class="shrink-0">{props.children}</div>
  </div>
)
