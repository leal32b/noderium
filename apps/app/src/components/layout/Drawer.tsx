import { JSX } from 'solid-js'

import { isLeftCollapsed } from '@/stores/layout'

type DrawerProps = {
  content: JSX.Element
  sideContent: JSX.Element
}

const Drawer = (props: DrawerProps): JSX.Element => {
  return (
    <div class="drawer drawer-open h-screen">
      <input
        checked={isLeftCollapsed()}
        class="drawer-toggle"
        id="drawer"
        type="checkbox"
      />

      {/* Content */}
      <div class="drawer-content flex flex-col h-full overflow-hidden">
        {props.content}
      </div>

      {/* Sidebar */}
      <div class="drawer-side is-drawer-close:overflow-visible">
        <label aria-label="close sidebar" class="drawer-overlay" for="drawer" />
        <div class="flex min-h-full flex-col items-start bg-base-200 is-drawer-open:w-64 is-drawer-close:w-14">
          {/* Sidebar content */}
          {props.sideContent}
        </div>
      </div>
    </div>
  )
}

/* v8 ignore next -- @preserve */
export { Drawer }
