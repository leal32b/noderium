import { A } from '@solidjs/router'
import { ArrowRight, BookText, FileText, GraduationCap } from 'lucide-solid'
import { For } from 'solid-js'
import type { Component } from 'solid-js'

import { useI18n } from '@shared'
import type { TranslationKey } from '@shared'

interface Pillar {
  href: string
  icon: Component<{ size?: number }>
  titleKey: TranslationKey
  descKey: TranslationKey
  step: string
}

const PILLARS: readonly Pillar[] = [
  {
    href: '/journal',
    icon: BookText,
    titleKey: 'navigation.journal',
    descKey: 'home.journalDesc',
    step: '01',
  },
  {
    href: '/notes',
    icon: FileText,
    titleKey: 'navigation.notes',
    descKey: 'home.notesDesc',
    step: '02',
  },
  {
    href: '/review',
    icon: GraduationCap,
    titleKey: 'navigation.review',
    descKey: 'home.reviewDesc',
    step: '03',
  },
]

export const Home: Component = () => {
  const { t } = useI18n()
  return (
    <div class="mx-auto flex max-w-4xl flex-col gap-10">
      <header class="pt-2">
        <h1 class="text-3xl font-semibold tracking-tight">{t('app.welcome.title')}</h1>
        <p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
          {t('app.welcome.subtitle')}
        </p>
      </header>

      <div class="grid gap-4 sm:grid-cols-3">
        <For each={PILLARS}>
          {(pillar) => (
            <A
              href={pillar.href}
              class="group focus-ring card flex flex-col gap-3 p-[var(--pad-card)] transition-all duration-200 hover:(-translate-y-0.5 border-border-strong shadow-md)"
            >
              <div class="flex items-center justify-between">
                <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle-bg text-accent-subtle-text">
                  <pillar.icon size={20} />
                </span>
                <span class="text-xs font-semibold tabular-nums text-text-tertiary">
                  {pillar.step}
                </span>
              </div>
              <div>
                <h2 class="font-semibold">{t(pillar.titleKey)}</h2>
                <p class="mt-1 text-sm leading-relaxed text-text-secondary">{t(pillar.descKey)}</p>
              </div>
              <span class="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-accent-default opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {t('home.open')} <ArrowRight size={15} />
              </span>
            </A>
          )}
        </For>
      </div>
    </div>
  )
}
