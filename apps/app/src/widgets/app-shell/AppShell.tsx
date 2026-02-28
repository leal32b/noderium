import { type Component, type JSX } from 'solid-js'

import { Drawer, Navbar } from './ui'

type AppShellProps = {
  children: JSX.Element
}

const AppShell: Component<AppShellProps> = (props) => {
  return (
    <Drawer
      content={(
        <>
          <Navbar />
          {props.children}
        </>
      )}
      sideContent={(<></>)}
    />
  )
}

/* v8 ignore next -- @preserve */
export { AppShell }
