/**
 * Base Docusaurus configuration shared across all module instances
 * Import and extend this in each module's docusaurus.config.js
 */

const baseConfig = {
  // GitHub pages deployment config (common for all modules)
  organizationName: '[org]',
  projectName: 'physical-ai-textbook',

  // Error handling
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Internationalization (future expansion)
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Prism syntax highlighting configuration
  prism: {
    additionalLanguages: ['python', 'bash', 'yaml', 'xml'],
    theme: {
      plain: {},
      styles: [],
    },
  },

  // Color mode configuration (dark mode support)
  colorMode: {
    defaultMode: 'light',
    disableSwitch: false,
    respectPrefersColorScheme: true,
  },

  // Footer links (common across all sites)
  footerLinks: [
    {
      title: 'Modules',
      items: [
        {label: 'Module 1: ROS 2', to: '/module1/'},
        {label: 'Module 2: Simulation', to: '/module2/'},
        {label: 'Module 3: Isaac', to: '/module3/'},
        {label: 'Module 4: VLA', to: '/module4/'},
      ],
    },
    {
      title: 'Resources',
      items: [
        {label: 'Code Examples', href: 'https://github.com/[org]/physical-ai-examples'},
        {label: 'Assets Repository', href: 'https://github.com/[org]/physical-ai-assets'},
        {label: 'Student Template', href: 'https://github.com/[org]/physical-ai-student-template'},
      ],
    },
  ],
};

module.exports = baseConfig;
