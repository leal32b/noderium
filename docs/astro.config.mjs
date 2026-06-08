// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLinksValidator from 'starlight-links-validator';

const repo = 'https://github.com/leal32b/noderium';

// GitHub Pages serves this project at https://leal32b.github.io/noderium.
const site = 'https://leal32b.github.io';
const base = '/noderium';

// Prefix `base` onto root-absolute internal links in Markdown at build time, so
// content can be authored base-free (`/architecture/...`) and still resolve under
// the subpath deploy. Dependency-free walk over the hast tree.
function rehypeBaseLinks() {
  const prefix = base.replace(/\/+$/, '');
  const walk = (node) => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      typeof node.properties?.href === 'string'
    ) {
      const href = node.properties.href;
      const isInternalRoot = href.startsWith('/') && !href.startsWith('//');
      const alreadyPrefixed = href === prefix || href.startsWith(`${prefix}/`);
      if (isInternalRoot && !alreadyPrefixed) {
        node.properties.href = prefix + href;
      }
    }
    node.children?.forEach(walk);
  };
  return (tree) => walk(tree);
}

// https://astro.build/config
export default defineConfig({
  site,
  base,
  markdown: { rehypePlugins: [rehypeBaseLinks] },
  // astro-mermaid renders ```mermaid``` code fences client-side (no headless
  // browser at build time) and follows Starlight's light/dark theme. It must
  // precede starlight() so it can transform code fences before Expressive Code.
  integrations: [
    mermaid({ theme: 'neutral', autoTheme: true }),
    starlight({
      title: 'Noderium',
      description:
        'Local-first PKM that unifies journal, Zettelkasten, and spaced repetition.',
      // Fail the build on broken internal links (and reference the missing target).
      plugins: [starlightLinksValidator()],
      logo: {
        src: './src/assets/noderium-logo.svg',
        alt: 'Noderium',
      },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: repo }],
      editLink: { baseUrl: `${repo}/edit/main/docs/` },
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'pt-br': { label: 'Português (Brasil)', lang: 'pt-BR' },
      },
      sidebar: [
        {
          label: 'Start here',
          items: [
            'start/what-is-noderium',
            'start/install-and-run',
            'start/quickstart',
          ],
        },
        {
          label: 'Guides',
          items: [
            'guides/keep-a-daily-journal',
            'guides/write-and-link-atomic-notes',
            'guides/search-your-notes',
            'guides/review-with-spaced-repetition',
            'guides/import-a-vault',
            'guides/export-to-markdown',
          ],
        },
        {
          label: 'How it works',
          items: [
            'how-it-works/system-overview',
            'how-it-works/crdt-source-of-truth',
            'how-it-works/the-editor',
            'how-it-works/search',
            'how-it-works/spaced-repetition',
            'how-it-works/sync',
          ],
        },
        {
          label: 'Design system',
          items: [
            'design/principles',
            'design/tokens-and-themes',
            'design/typography-and-spacing',
            'design/components',
            'design/patterns',
          ],
        },
        {
          label: 'Architecture',
          items: [
            'architecture/overview',
            'architecture/frontend-fsd',
            'architecture/data-model',
            'architecture/tauri-command-api',
            {
              label: 'Decision records',
              items: [
                'architecture/decisions',
                { autogenerate: { directory: 'architecture/adr' } },
              ],
            },
          ],
        },
        {
          label: 'Roadmap',
          items: ['roadmap/status', 'roadmap/whats-next', 'roadmap/changelog'],
        },
        {
          label: 'Contributing',
          items: [
            'contributing/working-agreement',
            'contributing/dev-setup',
            'contributing/testing-strategy',
            'contributing/conventions',
          ],
        },
      ],
    }),
  ],
});
