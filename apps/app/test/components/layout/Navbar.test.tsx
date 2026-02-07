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
  it('renders the component', () => {
    const { container } = makeSut()

    expect(container.firstElementChild).toBeDefined()
  })

  it('renders the title "Noderium"', () => {
    makeSut()

    expect(screen.getByText('Noderium')).toBeDefined()
  })

  it('has a menu button', () => {
    const { container } = makeSut()
    const menuButton = container.querySelector('.i-material-symbols-menu')

    expect(menuButton).toBeDefined()
  })

  it('has a more options button', () => {
    const { container } = makeSut()
    const moreButton = container.querySelector('.i-material-symbols-more-horiz')

    expect(moreButton).toBeDefined()
  })

  it('toggles theme when clicking the toggle theme option', () => {
    makeSut()
    const initialTheme = isDark()

    const toggleThemeOption = screen.getByText('Toggle theme')
    toggleThemeOption.click()

    expect(isDark()).toBe(!initialTheme)
  })
})
