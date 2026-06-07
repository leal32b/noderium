// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

const repo = 'https://github.com/leal32b/noderium';

// https://astro.build/config
export default defineConfig({
  site: 'https://leal32b.github.io',
  base: '/noderium',
  // astro-mermaid renders ```mermaid``` code fences client-side (no headless
  // browser at build time) and follows Starlight's light/dark theme. It must
  // precede starlight() so it can transform code fences before Expressive Code.
  integrations: [
    mermaid({ theme: 'neutral', autoTheme: true }),
    starlight({
      title: 'Noderium',
      description:
        'Local-first PKM that unifies journal, Zettelkasten, and spaced repetition.',
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
        { label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
        { label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
        { label: 'How it works', items: [{ autogenerate: { directory: 'how-it-works' } }] },
        { label: 'Design system', items: [{ autogenerate: { directory: 'design' } }] },
        { label: 'Architecture', items: [{ autogenerate: { directory: 'architecture' } }] },
        { label: 'Roadmap', items: [{ autogenerate: { directory: 'roadmap' } }] },
        { label: 'Contributing', items: [{ autogenerate: { directory: 'contributing' } }] },
      ],
    }),
  ],
});
