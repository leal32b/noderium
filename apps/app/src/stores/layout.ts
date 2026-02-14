import { createSignal } from 'solid-js'

const [isLeftCollapsed, setIsLeftCollapsed] = createSignal<boolean>(false)
const [isRightCollapsed, setIsRightCollapsed] = createSignal<boolean>(false)

const toggleLeftCollapsed = () => setIsLeftCollapsed(!isLeftCollapsed())
const toggleRightCollapsed = () => setIsRightCollapsed(!isRightCollapsed())

export {
  isLeftCollapsed,
  isRightCollapsed,
  toggleLeftCollapsed,
  toggleRightCollapsed
}
