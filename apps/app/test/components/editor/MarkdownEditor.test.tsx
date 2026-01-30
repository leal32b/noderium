import { render } from "@solidjs/testing-library";
import { EditorView } from "@codemirror/view";
import { language } from "@codemirror/language";
import { MarkdownEditor } from '../../../src/components/editor/MarkdownEditor';

type SutTypes = {
  container: HTMLElement;
  editor: HTMLElement;
  view: EditorView;
  content: HTMLElement;
}

const makeSut = (): SutTypes => {
  const { container } = render(() => <MarkdownEditor />);
  const editor = container.querySelector('.cm-editor') as HTMLElement;
  const view = EditorView.findFromDOM(editor)!;
  const content = editor.querySelector('.cm-content') as HTMLElement;

  return { container, editor, view, content };
};

describe("MarkdownEditor", () => {
  it("creates a new editor view", () => {
    const { container } = makeSut();

    expect(container.firstElementChild).toBeDefined();
  });

  it("enables markdown language support", () => {
    const { view } = makeSut();

    expect(view?.state.facet(language)?.name).toBe("markdown");
  });

  it("indents with tab key", () => {
    const { view, content } = makeSut();
    const docBefore = view.state.doc.toString();

    content.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

    expect(view.state.doc.toString()).not.toBe(docBefore);
    expect(view.state.doc.line(1).text).toMatch(/^\s+/);
  });
});
