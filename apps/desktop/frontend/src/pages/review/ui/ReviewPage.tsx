import { createResource, For, Show } from 'solid-js'
import type { Component } from 'solid-js'

import { Button, core, isTauri, useI18n } from '@shared'
import type { Rating } from '@shared'

const RATINGS: readonly Rating[] = ['again', 'hard', 'good', 'easy']

/** The spaced-repetition review queue (FR-6): grade due cards via FSRS. */
export const ReviewPage: Component = () => {
  const { t } = useI18n()
  const [cards, { refetch }] = createResource(() =>
    isTauri() ? core.dueCards() : Promise.resolve([]),
  )
  const [notes] = createResource(() => (isTauri() ? core.listNotes() : Promise.resolve([])))

  const titleFor = (targetId: string) => notes()?.find((n) => n.id === targetId)?.title ?? targetId

  const grade = async (cardId: string, rating: Rating) => {
    await core.reviewCard(cardId, rating)
    void refetch()
  }

  return (
    <div class="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 class="text-xl font-semibold">{t('review.title')}</h1>
      <Show
        when={cards() && cards()!.length > 0}
        fallback={<p class="text-sm text-text-tertiary">{t('review.empty')}</p>}
      >
        <For each={cards()}>
          {(card) => (
            <div class="flex flex-col gap-3 rounded-lg border border-border-default p-4">
              <div class="font-medium">{titleFor(card.target_id)}</div>
              <div class="flex gap-2">
                <For each={RATINGS}>
                  {(rating) => (
                    <Button size="sm" variant="secondary" onClick={() => grade(card.id, rating)}>
                      {t(`review.${rating}`)}
                    </Button>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  )
}
