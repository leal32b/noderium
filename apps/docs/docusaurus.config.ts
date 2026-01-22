import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Noderium',
  tagline: 'Local-first. AI-native. Zero maintenance. Your knowledge, finally free.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://leal32b.github.io',
  baseUrl: '/noderium/',

  organizationName: 'leal32b',
  projectName: 'noderium',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/leal32b/noderium/tree/main/apps/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Noderium',
      logo: {
        alt: 'Noderium Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'introductionSidebar',
          position: 'left',
          label: 'Introduction',
        },
        {
          type: 'docSidebar',
          sidebarId: 'gettingStartedSidebar',
          position: 'left',
          label: 'Getting Started',
        },
        {
          type: 'docSidebar',
          sidebarId: 'discoverySidebar',
          position: 'left',
          label: 'Discovery',
        },
        {
          type: 'docSidebar',
          sidebarId: 'templatesSidebar',
          position: 'left',
          label: 'Templates',
        },
        {
          href: 'https://github.com/leal32b/noderium',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {
              label: 'Vision & Mission',
              to: '/docs/introduction/vision',
            },
            {
              label: 'The Five Pillars',
              to: '/docs/introduction/pillars',
            },
            {
              label: 'Getting Started',
              to: '/docs/getting-started/installation',
            },
          ],
        },
        {
          title: 'Strategy',
          items: [
            {
              label: 'Market Research',
              to: '/docs/discovery/market-research/market-research-index',
            },
            {
              label: 'Design Strategy',
              to: '/docs/discovery/market-research/design-strategy-brief',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'ADR Template',
              to: '/docs/templates/template-adr',
            },
            {
              label: 'RFC Template',
              to: '/docs/templates/template-rfc',
            },
            {
              label: 'PRD Template',
              to: '/docs/templates/template-prd',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/leal32b/noderium',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/leal32b/noderium/discussions',
            },
            {
              label: 'Issues',
              href: 'https://github.com/leal32b/noderium/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Noderium Contributors. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['rust', 'bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
