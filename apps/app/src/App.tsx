import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { Drawer } from '@/components/layout/Drawer'
import { Navbar } from '@/components/layout/Navbar'

function App() {
  return (
    <main>
      <Drawer
        content={(
          <>
            <Navbar />
            <MarkdownEditor />
          </>
        )}
        sideContent={(<></>)}
      />
    </main>
  )
}

export default App
