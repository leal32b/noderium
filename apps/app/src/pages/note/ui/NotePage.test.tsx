import { render, screen } from '@solidjs/testing-library'
import { type JSX } from 'solid-js'

import { NotePage } from '@/pages/note/ui/NotePage'

vi.mock('@/widgets/app-shell', () => ({
  AppShell: (props: { children: unknown }) => (
    <div data-testid="app-shell-mock">{props.children as JSX.Element}</div>
  )
}))

vi.mock('@/widgets/markdown-editor', () => ({
  MarkdownEditor: () => <div>Markdown Editor Content</div>
}))

type SutTypes = {
  container: HTMLElement
}

const makeSut = (): SutTypes => {
  const { container } = render(() => <NotePage />)

  return { container }
}

describe('NotePage', () => {
  it('renders the component', () => {
    const { container } = makeSut()

    expect(container.firstElementChild).toBeDefined()
  })

  it('renders the markdown editor', () => {
    makeSut()

    expect(screen.getByText('Markdown Editor Content')).toBeDefined()
  })

  it('renders markdown editor inside app shell', () => {
    makeSut()
    const appShell = screen.getByTestId('app-shell-mock')

    expect(appShell.textContent).toContain('Markdown Editor Content')
  })
})
