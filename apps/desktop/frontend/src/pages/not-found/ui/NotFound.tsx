import { A } from '@solidjs/router'
import type { Component } from 'solid-js'

import { useI18n } from '@shared'

export const NotFound: Component = () => {
  const { t } = useI18n()
  return (
    <div class="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p class="text-5xl font-bold text-text-tertiary">404</p>
      <h1 class="text-xl font-semibold">{t('notFound.title')}</h1>
      <A href="/" class="focus-ring text-action-primary-default hover:underline">
        {t('notFound.back')}
      </A>
    </div>
  )
}
