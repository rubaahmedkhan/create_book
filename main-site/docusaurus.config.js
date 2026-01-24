// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A 13-week journey from digital AI to embodied intelligence',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://rubaahmedkhan.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/create_book/',

  // GitHub pages deployment config.
  organizationName: 'rubaahmedkhan',
  projectName: 'create_book',

  onBrokenLinks: 'warn',  // Multi-instance setup: cross-instance links appear broken during build
  onBrokenMarkdownLinks: 'warn',

  // Internationalization
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
      ur: {
        label: 'اردو',
        direction: 'rtl',
        htmlLang: 'ur-PK',
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.jpg',
      navbar: {
        title: 'Physical AI Textbook',
        logo: {
          alt: 'Physical AI Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Course Overview',
          },
          {
            type: 'doc',
            docId: 'module1/intro',
            label: 'Module 1: ROS 2',
            position: 'left',
          },
          {
            type: 'doc',
            docId: 'module2/intro',
            label: 'Module 2: Simulation',
            position: 'left',
          },
          {
            type: 'doc',
            docId: 'module3/intro',
            label: 'Module 3: Isaac',
            position: 'left',
          },
          {
            type: 'doc',
            docId: 'module4/intro',
            label: 'Module 4: VLA',
            position: 'left',
          },
          {
            href: 'https://github.com/rubaahmedkhan/create_book',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Modules',
            items: [
              {
                label: 'Module 1: ROS 2 Fundamentals',
                to: '/module1/',
              },
              {
                label: 'Module 2: Simulation',
                to: '/module2/',
              },
              {
                label: 'Module 3: NVIDIA Isaac',
                to: '/module3/',
              },
              {
                label: 'Module 4: VLA Integration',
                to: '/module4/',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Code Examples',
                href: 'https://github.com/rubaahmedkhan/create_book',
              },
              {
                label: 'Assets Repository',
                href: 'https://github.com/rubaahmedkhan/create_book',
              },
              {
                label: 'Student Template',
                href: 'https://github.com/rubaahmedkhan/create_book',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/rubaahmedkhan/create_book',
              },
              {
                label: 'License: CC BY 4.0',
                href: 'https://creativecommons.org/licenses/by/4.0/',
              },
            ],
          },
        ],
        copyright: `Licensed under CC BY 4.0. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['python', 'bash', 'yaml'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
