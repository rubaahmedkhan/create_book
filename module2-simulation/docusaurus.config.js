// @ts-check
// Module 2: Gazebo & Unity Simulation Configuration

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Module 2: Gazebo & Unity Simulation',
  tagline: 'The Digital Twin',
  favicon: 'img/favicon.ico',

  url: 'https://rubaahmedkhan.github.io',
  baseUrl: '/create_book/module2/',

  organizationName: 'rubaahmedkhan',
  projectName: 'create_book',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur'],
    localeConfigs: {
      en: { label: 'English', direction: 'ltr', htmlLang: 'en-US' },
      ur: { label: 'اردو', direction: 'rtl', htmlLang: 'ur-PK' }
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
      navbar: {
        title: 'Module 2: Simulation',
        items: [
          {to: '/', label: 'Main Site', position: 'left'},
          {to: '/module1/', label: 'Module 1', position: 'left'},
          {to: '/module3/', label: 'Module 3', position: 'left'},
          {to: '/module4/', label: 'Module 4', position: 'left'},
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Module 2: Gazebo & Unity Simulation | Licensed under CC BY 4.0`,
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
