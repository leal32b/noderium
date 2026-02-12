import { createSignal, JSX } from 'solid-js'

import { isLeftCollapsed, isRightCollapsed } from '@/stores/layout'

type Side = 'left' | 'right'

type WorkspaceProps = {
  center: JSX.Element
  left?: JSX.Element
  right?: JSX.Element
}

const [isResizing, setIsResizing] = createSignal(false)

const MIN_LEFT = 180
const MIN_RIGHT = 180
const MIN_CENTER = 540

const Workspace = (props: WorkspaceProps) => {
  const [leftWidth, setLeftWidth] = createSignal(240)
  const [rightWidth, setRightWidth] = createSignal(360)

  let container!: HTMLDivElement

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max))

  const startResize = (side: Side, e: PointerEvent) => {
    setIsResizing(true)

    const startX = e.clientX
    const containerWidth = container.clientWidth
    const initial = side === 'left' ? leftWidth() : rightWidth()
    const opposite = side === 'left' ? rightWidth() : leftWidth()
    const min = side === 'left' ? MIN_LEFT : MIN_RIGHT
    const direction = side === 'left' ? 1 : -1

    const onMove = (ev: PointerEvent) => {
      const delta = (ev.clientX - startX) * direction
      const next = initial + delta
      const max = containerWidth - opposite - MIN_CENTER
      const value = clamp(next, min, max)

      if (side === 'left') {
        setLeftWidth(value)
      } else {
        setRightWidth(value)
      }
    }

    const onUp = () => {
      setIsResizing(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      class="flex flex-1 overflow-hidden"
      ref={container}
    >
      {/* LEFT */}
      {props.left && (
        <>
          <aside
            class="shrink-0 bg-base-200 overflow-hidden whitespace-nowrap"
            classList={{ 'transition-[width] duration-200 ease-in-out': !isResizing() }}
            style={{ width: isLeftCollapsed() ? '0px' : leftWidth() + 'px' }}
          >
            {props.left}
          </aside>
          {!isLeftCollapsed() && (
            <Divider onPointerDown={e => startResize('left', e)} />
          )}
        </>
      )}

      {/* CENTER */}
      <section class="flex-1 overflow-auto">
        {props.center}
      </section>

      {/* RIGHT */}
      {props.right && (
        <>
          {!isRightCollapsed() && (
            <Divider onPointerDown={e => startResize('right', e)} />
          )}
          <aside
            class="shrink-0 bg-base-200 overflow-hidden whitespace-nowrap"
            classList={{ 'transition-[width] duration-200 ease-in-out': !isResizing() }}
            style={{ width: isRightCollapsed() ? '0px' : rightWidth() + 'px' }}
          >
            {props.right}
          </aside>
        </>
      )}
    </div>
  )
}

const Divider = (props: { onPointerDown: (e: PointerEvent) => void }) => {
  return (
    <div
      class="w-1 cursor-col-resize hover:bg-primary/40 transition-colors"
      onPointerDown={e => props.onPointerDown(e)}
    />
  )
}

/* v8 ignore next -- @preserve */
export { Workspace }
