import { render, screen } from '@solidjs/testing-library'

import { Navbar } from '@/components/layout/Navbar'
import { isLeftCollapsed, isRightCollapsed } from '@/stores/layout'
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

  it('has a toggle left sidebar button', () => {
    makeSut()

    expect(screen.getByLabelText('Toggle left sidebar')).toBeDefined()
  })

  it('has a more options button', () => {
    makeSut()

    expect(screen.getByLabelText('More options')).toBeDefined()
  })

  it('has a toggle right sidebar button', () => {
    makeSut()

    expect(screen.getByLabelText('Toggle right sidebar')).toBeDefined()
  })

  it('toggles left sidebar when clicking the left sidebar button', () => {
    makeSut()
    const initialState = isLeftCollapsed()

    screen.getByLabelText('Toggle left sidebar').click()

    expect(isLeftCollapsed()).toBe(!initialState)
  })

  it('toggles right sidebar when clicking the right sidebar button', () => {
    makeSut()
    const initialState = isRightCollapsed()

    screen.getByLabelText('Toggle right sidebar').click()

    expect(isRightCollapsed()).toBe(!initialState)
  })

  it('toggles theme when clicking the toggle theme option', () => {
    makeSut()
    const initialTheme = isDark()

    const toggleThemeOption = screen.getByText('Toggle theme')
    toggleThemeOption.click()

    expect(isDark()).toBe(!initialTheme)
  })
})
