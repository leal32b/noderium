import { render, screen } from '@solidjs/testing-library'
import type { JSX } from 'solid-js'

import { AppShell } from '@/widgets/app-shell/AppShell'

vi.mock('@/widgets/app-shell/ui', () => ({
  Drawer: (props: { content: unknown, sideContent: unknown }) => (
    <div>
      <div data-testid="drawer-content">{props.content as JSX.Element}</div>
      <div data-testid="drawer-side-content">{props.sideContent as JSX.Element}</div>
    </div>
  ),
  Navbar: () => <header>Navbar Mock</header>
}))

type SutTypes = {
  container: HTMLElement
}

const makeSut = (): SutTypes => {
  const { container } = render(() => (
    <AppShell>
      <div>App Shell Child Content</div>
    </AppShell>
  ))

  return { container }
}

describe('AppShell', () => {
  it('renders the component', () => {
    const { container } = makeSut()

    expect(container.firstElementChild).toBeDefined()
  })

  it('renders navbar content', () => {
    makeSut()

    expect(screen.getByText('Navbar Mock')).toBeDefined()
  })

  it('renders side-content inside app shell', () => {
    makeSut()
    const sideContent = screen.getByTestId('drawer-side-content')

    expect(sideContent.textContent).toBe('')
  })

  it('renders children inside drawer content', () => {
    makeSut()

    expect(screen.getByText('App Shell Child Content')).toBeDefined()
  })
})
