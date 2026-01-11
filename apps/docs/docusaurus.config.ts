import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Noderium Docs',
  tagline: 'Local-first note-taking app with bidirectional links and graph view. Built with Vite, Tauri, Rust, SolidJS and SQLite',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://leal32b.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/noderium/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'leal32b', // Usually your GitHub org/user name.
  projectName: 'noderium', // Usually your repo name.
  deploymentBranch: 'gh-pages', // The branch to deploy the documentation to.
  trailingSlash: false, // Whether to add a trailing slash to the URLs.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/leal32b/noderium/tree/main/apps/docs/',
        },
        // blog: {
        //   showReadingTime: true,
        //   feedOptions: {
        //     type: ['rss', 'atom'],
        //     xslt: true,
        //   },
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        //   // Useful options to enforce blogging best practices
        //   onInlineTags: 'warn',
        //   onInlineAuthors: 'warn',
        //   onUntruncatedBlogPosts: 'warn',
        // },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Noderium Docs',
      logo: {
        alt: 'Noderium Docs Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'discoverySidebar',
          position: 'left',
          label: 'Discovery',
        },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'deliverySidebar',
        //   position: 'left',
        //   label: 'Delivery',
        // },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'documentationSidebar',
        //   position: 'left',
        //   label: 'Documentation',
        // },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'metricsSidebar',
        //   position: 'left',
        //   label: 'Metrics',
        // },
        // {to: '/blog', label: 'Blog', position: 'left'},
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
          title: 'Docs',
          items: [
            {
              label: 'Discovery',
              to: '/docs/discovery/market-research/market-research-index',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/leal32b/noderium/discussions',
            },
            {
              label: 'Issues',
              href: 'https://github.com/leal32b/noderium/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/leal32b/noderium',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Noderium Contributors. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
