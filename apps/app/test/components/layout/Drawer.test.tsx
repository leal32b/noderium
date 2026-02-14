import { render, screen } from '@solidjs/testing-library'

import { Drawer } from '@/components/layout/Drawer'

type SutTypes = {
  container: HTMLElement
}

const makeSut = (): SutTypes => {
  const { container } = render(() => (
    <Drawer
      content={<div>Main Content</div>}
      sideContent={<div>Side Content</div>}
    />
  ))

  return { container }
}

describe('Drawer', () => {
  it('renders the component', () => {
    const { container } = makeSut()

    expect(container.firstElementChild).toBeDefined()
  })

  it('renders the content slot', () => {
    makeSut()

    expect(screen.getByText('Main Content')).toBeDefined()
  })

  it('renders the side content slot', () => {
    makeSut()

    expect(screen.getByText('Side Content')).toBeDefined()
  })

  it('has a drawer toggle input', () => {
    const { container } = makeSut()
    const toggle = container.querySelector('#drawer')

    expect(toggle).toBeDefined()
    expect(toggle?.getAttribute('type')).toBe('checkbox')
  })

  it('has a drawer overlay label', () => {
    const { container } = makeSut()
    const overlay = container.querySelector('label[for="drawer"]')

    expect(overlay).toBeDefined()
    expect(overlay?.getAttribute('aria-label')).toBe('close sidebar')
  })
})
