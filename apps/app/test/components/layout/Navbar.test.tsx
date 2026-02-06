import { render, screen } from '@solidjs/testing-library'

import { Navbar } from '@/components/layout/Navbar'
import { isDark } from '@/stores/theme'

type SutTypes = {
  container: HTMLElement
}

const makeSut = (): SutTypes => {
  const { container } = render(() => <Navbar />)

  return { container }
}

describe('Navbar', () => {
  it('should render', () => {
    const { container } = makeSut()

    expect(container.firstElementChild).toBeDefined()
  })

  it('should toggle theme', () => {
    makeSut()

    screen.getByTestId('navbar-toggle-theme').click()

    expect(isDark()).toBe(true)
  })
})
