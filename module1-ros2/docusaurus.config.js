// @ts-check
// Module 1: ROS 2 Fundamentals Configuration

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Module 1: ROS 2 Fundamentals',
  tagline: 'The Robotic Nervous System',
  favicon: 'img/favicon.ico',

  url: 'https://rubaahmedkhan.github.io',
  baseUrl: '/create_book/module1/',

  organizationName: 'rubaahmedkhan',
  projectName: 'create_book',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

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
        title: 'Module 1: ROS 2',
        items: [
          {
            to: '/',
            label: 'Main Site',
            position: 'left',
          },
          {
            to: '/module2/',
            label: 'Module 2',
            position: 'left',
          },
          {
            to: '/module3/',
            label: 'Module 3',
            position: 'left',
          },
          {
            to: '/module4/',
            label: 'Module 4',
            position: 'left',
          },
          {
            href: 'https://github.com/rubaahmedkhan/create_book',
            label: 'Code Examples',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Module 1: ROS 2 Fundamentals | Licensed under CC BY 4.0`,
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
