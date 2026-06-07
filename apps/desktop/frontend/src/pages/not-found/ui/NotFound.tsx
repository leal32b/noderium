import { A } from '@solidjs/router'
import { ArrowLeft } from 'lucide-solid'
import type { Component } from 'solid-js'

import { useI18n } from '@shared'

export const NotFound: Component = () => {
  const { t } = useI18n()
  return (
    <div class="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-24 text-center">
      <p class="text-7xl font-bold tracking-tight text-accent-subtle-text">404</p>
      <h1 class="text-xl font-semibold">{t('notFound.title')}</h1>
      <A
        href="/"
        class="focus-ring inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-text shadow-sm transition-colors hover:bg-accent-hover"
      >
        <ArrowLeft size={15} />
        {t('notFound.back')}
      </A>
    </div>
  )
}
