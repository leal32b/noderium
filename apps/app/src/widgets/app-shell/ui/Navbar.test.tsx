import { render, screen } from '@solidjs/testing-library'

import { themeStore } from '@/shared/model/theme.store'
import { appShellStore } from '@/widgets/app-shell/model/app-shell.store'
import { Navbar } from '@/widgets/app-shell/ui/Navbar'

type SutTypes = {
  container: HTMLElement
}

const makeSut = (): SutTypes => {
  const { container } = render(() => <Navbar />)

  return { container }
}

describe('Navbar', () => {
  beforeEach(() => {
    themeStore.setTheme(false)
  })

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
    const initialState = appShellStore.isLeftCollapsed()

    screen.getByLabelText('Toggle left sidebar').click()

    expect(appShellStore.isLeftCollapsed()).toBe(!initialState)
  })

  it('toggles right sidebar when clicking the right sidebar button', () => {
    makeSut()
    const initialState = appShellStore.isRightCollapsed()

    screen.getByLabelText('Toggle right sidebar').click()

    expect(appShellStore.isRightCollapsed()).toBe(!initialState)
  })

  it('toggles theme to dark when clicking the toggle theme option', () => {
    makeSut()
    themeStore.setTheme(false)

    const toggleThemeOption = screen.getByText('Toggle theme')
    toggleThemeOption.click()
    expect(themeStore.isDark()).toBe(true)
  })

  it('toggles theme to light when clicking the toggle theme option', () => {
    makeSut()
    themeStore.setTheme(true)

    const toggleThemeOption = screen.getByText('Toggle theme')
    toggleThemeOption.click()
    expect(themeStore.isDark()).toBe(false)
  })
})
