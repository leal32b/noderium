import { lazy, Suspense } from 'solid-js'

import { Drawer } from '@/components/layout/Drawer'
import { Navbar } from '@/components/layout/Navbar'

const MarkdownEditor = lazy(() =>
  import('@/components/editor/MarkdownEditor').then(m => ({ default: m.MarkdownEditor }))
)

function App() {
  return (
    <main>
      <Drawer
        content={(
          <>
            <Navbar />
            <Suspense>
              <MarkdownEditor />
            </Suspense>
          </>
        )}
        sideContent={(<></>)}
      />
    </main>
  )
}

export default App
