import { render, screen, waitFor } from '@solidjs/testing-library'

import { AppRouter } from '@/app/router/AppRouter'
import { PATHS } from '@/shared/config/paths'

vi.mock('@/pages/note', () => ({
  NotePage: () => <div>Note Page Content</div>
}))

type SutTypes = {
  container: HTMLElement
}

const makeSut = (): SutTypes => {
  const { container } = render(() => <AppRouter />)

  return { container }
}

describe('AppRouter', () => {
  it('renders NotePage when path matches', async () => {
    makeSut()

    window.history.pushState({}, '', PATHS.note())
    window.dispatchEvent(new PopStateEvent('popstate'))

    await waitFor(() => {
      expect(screen.getByText('Note Page Content')).toBeDefined()
    })
  })
})
