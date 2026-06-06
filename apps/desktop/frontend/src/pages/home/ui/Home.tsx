import type { Component } from 'solid-js'

import { Card, useI18n } from '@shared'

export const Home: Component = () => {
  const { t } = useI18n()
  return (
    <div class="mx-auto max-w-2xl">
      <Card>
        <h1 class="text-2xl font-semibold">{t('app.welcome.title')}</h1>
        <p class="mt-2 text-text-secondary">{t('app.welcome.subtitle')}</p>
      </Card>
    </div>
  )
}
