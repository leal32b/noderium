import { vi } from 'vitest'

vi.mock('@tabler/icons-solidjs', () => {
  const iconMock = () => null

  return {
    IconDots: iconMock,
    IconLayoutSidebarLeftCollapseFilled: iconMock,
    IconLayoutSidebarLeftExpand: iconMock,
    IconLayoutSidebarRightCollapseFilled: iconMock,
    IconLayoutSidebarRightExpand: iconMock,
    IconMoonFilled: iconMock,
    IconSunFilled: iconMock
  }
})
