import { render } from "@solidjs/testing-library";

import { MarkdownEditor2 } from './MarkdownEditor2'

type SutType = {
  sut: ReturnType<typeof render>
}

const makeSut = (): SutType => {
  return {
    sut: render(() => <MarkdownEditor2 />)
  }
}

describe("MarkdownEditor2", () => {
  it("creates a new editor view", () => {
    const { sut } = makeSut();
    
    expect(sut.container.firstElementChild).not.toBeNull();
  });
});