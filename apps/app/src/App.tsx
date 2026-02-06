import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { Navbar } from '@/components/layout/Navbar'

function App() {
  return (
    <main class="h-screen flex flex-col">
      <Navbar />
      <MarkdownEditor />
    </main>
  )
}

export default App
