import "./App.css";
import { MarkdownEditor } from "./components/editor/MarkdownEditor";

function App() {
  return (
    <main style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
      <MarkdownEditor />
    </main>
  );
}

export default App;
