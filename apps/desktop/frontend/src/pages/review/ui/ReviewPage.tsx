import { GraduationCap } from 'lucide-solid'
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
    <div class="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 class="text-2xl font-semibold tracking-tight">{t('review.title')}</h1>
        <p class="mt-0.5 text-sm text-text-tertiary">{t('review.subtitle')}</p>
      </header>

      <Show
        when={cards() && cards()!.length > 0}
        fallback={
          <div class="card flex flex-col items-center gap-2 p-12 text-center">
            <span class="flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunken text-text-tertiary">
              <GraduationCap size={20} />
            </span>
            <p class="text-sm text-text-tertiary">{t('review.empty')}</p>
          </div>
        }
      >
        <For each={cards()}>
          {(card) => (
            <div class="card flex flex-col gap-4 p-5">
              <div class="text-[15px] font-medium">{titleFor(card.target_id)}</div>
              <div class="grid grid-cols-4 gap-2">
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
