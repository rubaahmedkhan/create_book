/**
 * Shared navbar configuration for cross-instance navigation
 * Import this into each module's docusaurus.config.js navbar items
 */

const sharedNavbarItems = {
  // Left side navigation
  moduleLinks: [
    {
      to: '/',
      label: 'Main Site',
      position: 'left',
    },
    {
      to: '/module1/',
      label: 'Module 1: ROS 2',
      position: 'left',
    },
    {
      to: '/module2/',
      label: 'Module 2: Simulation',
      position: 'left',
    },
    {
      to: '/module3/',
      label: 'Module 3: Isaac',
      position: 'left',
    },
    {
      to: '/module4/',
      label: 'Module 4: VLA',
      position: 'left',
    },
  ],

  // Right side navigation
  externalLinks: [
    {
      href: 'https://github.com/[org]/physical-ai-textbook',
      label: 'GitHub',
      position: 'right',
    },
    {
      href: 'https://github.com/[org]/physical-ai-examples',
      label: 'Code Examples',
      position: 'right',
    },
  ],

  // Accessibility link
  accessibilityLink: {
    to: '/resources/accessibility',
    label: 'Accessibility',
    position: 'right',
  },
};

module.exports = sharedNavbarItems;
