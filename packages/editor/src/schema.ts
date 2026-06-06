import { Schema } from 'prosemirror-model'
import type { MarkSpec, NodeSpec } from 'prosemirror-model'

// Block-hierarchy schema for the spike (ADR-001/ADR-004). Block-level nodes carry
// `id` and `blockType` attributes so the structured model maps cleanly onto the
// Loro tree (loro-prosemirror stores node attrs in a LoroMap per node).
const blockAttrs = {
  id: { default: null as string | null },
  blockType: { default: 'paragraph' as string },
}

const nodes: Record<string, NodeSpec> = {
  doc: { content: 'block+' },

  paragraph: {
    group: 'block',
    content: 'inline*',
    attrs: blockAttrs,
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0],
  },

  heading: {
    group: 'block',
    content: 'inline*',
    defining: true,
    attrs: { ...blockAttrs, level: { default: 1 } },
    parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({ tag: `h${level}`, attrs: { level } })),
    toDOM: (node) => [`h${node.attrs['level']}`, 0],
  },

  blockquote: {
    group: 'block',
    content: 'block+',
    attrs: blockAttrs,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: () => ['blockquote', 0],
  },

  code_block: {
    group: 'block',
    content: 'text*',
    marks: '',
    code: true,
    defining: true,
    attrs: blockAttrs,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM: () => ['pre', ['code', 0]],
  },

  bullet_list: {
    group: 'block',
    content: 'list_item+',
    attrs: blockAttrs,
    parseDOM: [{ tag: 'ul' }],
    toDOM: () => ['ul', 0],
  },

  ordered_list: {
    group: 'block',
    content: 'list_item+',
    attrs: { ...blockAttrs, order: { default: 1 } },
    parseDOM: [{ tag: 'ol' }],
    toDOM: () => ['ol', 0],
  },

  list_item: {
    content: 'paragraph block*',
    defining: true,
    parseDOM: [{ tag: 'li' }],
    toDOM: () => ['li', 0],
  },

  text: { group: 'inline' },
}

const marks: Record<string, MarkSpec> = {
  strong: {
    parseDOM: [{ tag: 'strong' }, { tag: 'b' }],
    toDOM: () => ['strong', 0],
  },
  em: {
    parseDOM: [{ tag: 'em' }, { tag: 'i' }],
    toDOM: () => ['em', 0],
  },
  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM: () => ['code', 0],
  },
  link: {
    attrs: { href: {} },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs: (dom) => ({ href: (dom as HTMLElement).getAttribute('href') }),
      },
    ],
    toDOM: (mark) => ['a', { href: mark.attrs['href'] as string }, 0],
  },
}

export const schema = new Schema({ nodes, marks })
