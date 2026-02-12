import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { Navbar } from '@/components/layout/Navbar'
import { Workspace } from '@/components/layout/Workspace'

function App() {
  return (
    <main class="h-screen flex flex-col">
      <Navbar />
      <Workspace
        center={<MarkdownEditor />}
        left={<div class="p-4 pt-12">Left Sidebar</div>}
        right={<div class="p-4 pt-12">Right Sidebar</div>}
      />
    </main>
  )
}

export default App
