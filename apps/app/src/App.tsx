import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { Navbar } from '@/components/layout/navbar'

function App() {
  return (
    <main class="h-screen bg-main flex flex-col">
      <Navbar />
      <div class="flex-1 overflow-auto">
        <MarkdownEditor />
      </div>
    </main>
  )
}

export default App
