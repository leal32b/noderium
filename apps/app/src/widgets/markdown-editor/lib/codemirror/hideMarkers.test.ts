import type { ViewUpdate } from '@codemirror/view'

import { collectReplacedRangesForLine, getPlugin } from './__helpers__/decoratorsHelper'
import { createEditorView } from './__helpers__/editorHelpers'
import { hideMarkers } from '@/widgets/markdown-editor/lib/codemirror/hideMarkers'

type SutTypes = {
  sut: typeof hideMarkers
}

const makeSut = (): SutTypes => {
  const sut = hideMarkers

  return { sut }
}

describe('hideMarkers', () => {
  describe('update', () => {
    it('rebuilds decorations when doc changes', () => {
      const { sut } = makeSut()
      const view = createEditorView('# First heading\n# Second heading', [sut])
      const plugin = getPlugin(view, sut)
      const originalDecorations = plugin.decorations
      const fakeUpdate = { docChanged: true, view }

      plugin.update(fakeUpdate as unknown as ViewUpdate)

      expect(plugin.decorations).not.toBe(originalDecorations)
    })

    it('rebuilds decorations when selection sets', () => {
      const { sut } = makeSut()
      const view = createEditorView('# First heading\n# Second heading', [sut])
      const plugin = getPlugin(view, sut)
      const originalDecorations = plugin.decorations
      const fakeUpdate = { selectionSet: true, view }

      plugin.update(fakeUpdate as unknown as ViewUpdate)

      expect(plugin.decorations).not.toBe(originalDecorations)
    })

    it('rebuilds decorations when viewport changes', () => {
      const { sut } = makeSut()
      const view = createEditorView('# First heading\n# Second heading', [sut])
      const plugin = getPlugin(view, sut)
      const originalDecorations = plugin.decorations
      const fakeUpdate = { view, viewportChanged: true }

      plugin.update(fakeUpdate as unknown as ViewUpdate)

      expect(plugin.decorations).not.toBe(originalDecorations)
    })

    it('does not rebuild decorations when nothing relevant changed', () => {
      const { sut } = makeSut()
      const view = createEditorView('# First heading\n# Second heading', [sut])
      const plugin = getPlugin(view, sut)
      const originalDecorations = plugin.decorations

      const fakeUpdate = { view }
      plugin.update(fakeUpdate as unknown as ViewUpdate)

      expect(plugin.decorations).toBe(originalDecorations)
    })
  })

  describe('buildDecorations', () => {
    describe('HeaderMarkers', () => {
      it('hides HeaderMarkers # on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('# HeaderMarkers\n## HeaderMarkers', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['## '])
      })
    })

    describe('EmphasisMarkers', () => {
      it('hides EmphasisMark (*) on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('*EmphasisMarkers*\n *EmphasisMarkers*', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['*', '*'])
      })

      it('hides EmphasisMark (**) on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('**EmphasisMarkers**\n **EmphasisMarkers**', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['**', '**'])
      })

      it('hides EmphasisMark (_) on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('_EmphasisMarkers_\n _EmphasisMarkers_', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['_', '_'])
      })

      it('hides EmphasisMark (__) on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('__EmphasisMarkers__\n __EmphasisMarkers__', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['__', '__'])
      })
    })

    describe('StrikethroughMarkers', () => {
      it('hides StrikethroughMarkers ~~ on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('~~StrikethroughMarkers~~\n ~~StrikethroughMarkers~~', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['~~', '~~'])
      })
    })

    describe('LinkMarkers', () => {
      it('hides LinkMarkers [](link) on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('[LinkMark](https://www.site.com)\n[LinkMark](https://www.site.com)', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['[', '](https://www.site.com)'])
      })
    })

    describe('ListMarkers', () => {
      it('hides ListMarkers (-) on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('- ListMarkers\n- ListMarkers', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['- '])
      })

      it('hides ListMarkers (*) on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('* ListMarkers\n* ListMarkers', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['* '])
      })

      it('hides ListMarkers (+) on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('+ ListMarkers\n+ ListMarkers', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['+ '])
      })
    })

    describe('TaskMarkers', () => {
      it('hides TaskMarkers [ ] on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('- [ ] TaskMarkers\n- [ ] TaskMarkers', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['- [ ] '])
      })
    })

    describe('QuoteMarkers', () => {
      it('hides QuoteMarkers > on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('> QuoteMarkers\n> QuoteMarkers', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['> '])
      })
    })

    describe('CodeMarkers', () => {
      it('hides CodeMarkers ` on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('`Inline code`\n`Inline code`', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['`', '`'])
      })

      it('hides CodeMarkers ``` on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('CodeMarkers\n```bash\nnpm i\n```', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)
        const hiddenLine4 = collectReplacedRangesForLine(plugin, view.state.doc, 4)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['```'])
        expect(hiddenLine4).toEqual(['```'])
      })
    })

    describe('WikilinkMarkers', () => {
      it('hides WikilinkMarkers [[Wikilink]] on lines without the cursor', () => {
        const { sut } = makeSut()
        const view = createEditorView('[[Wikilink]]\n[[Wikilink]]', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual(['[[', ']]'])
      })

      it('does not hide URL/LinkMark nodes when they are inside a wikilink', () => {
        const { sut } = makeSut()
        const view = createEditorView('cursor here\n[[https://example.com]]', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine2).toEqual(['[[', ']]'])
      })
    })

    describe('mergeRanges and edge cases', () => {
      it('handles empty document without throwing', () => {
        const { sut } = makeSut()
        const view = createEditorView('', [sut])

        const plugin = getPlugin(view, sut)
        expect(plugin.decorations.size).toBe(0)
      })

      it('handles document with no markdown markers (plain text only)', () => {
        const { sut } = makeSut()
        const view = createEditorView('plain text only\nno markers here', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2).toEqual([])
      })

      it('merges overlapping or adjacent ranges without RangeSetBuilder errors', () => {
        const { sut } = makeSut()
        const view = createEditorView('# H\n**bold** *italic*\n- item', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)
        const hiddenLine3 = collectReplacedRangesForLine(plugin, view.state.doc, 3)

        expect(plugin.decorations.size).toBeGreaterThan(0)
        expect(hiddenLine2.length).toBeGreaterThan(0)
        expect(hiddenLine3).toEqual(['- '])
      })

      it('sorts ranges by from then by to (same from triggers secondary sort)', () => {
        const { sut } = makeSut()
        const view = createEditorView('- [[item]]\n- [[other]]', [sut])

        const plugin = getPlugin(view, sut)
        const hiddenLine1 = collectReplacedRangesForLine(plugin, view.state.doc, 1)
        const hiddenLine2 = collectReplacedRangesForLine(plugin, view.state.doc, 2)

        expect(plugin.decorations.size).toBeGreaterThan(0)
        expect(hiddenLine1).toEqual([])
        expect(hiddenLine2.length).toBeGreaterThan(0)
      })
    })
  })
})
