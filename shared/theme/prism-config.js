/**
 * Prism.js Syntax Highlighting Configuration
 * Shared across all Docusaurus instances
 *
 * This file configures syntax highlighting for code blocks throughout the textbook
 */

const { themes } = require('prism-react-renderer');

const prismConfig = {
  // Light theme
  theme: themes.github,

  // Dark theme
  darkTheme: themes.dracula,

  // Additional languages for robotics and AI code
  additionalLanguages: [
    'python',      // ROS 2 Python (rclpy)
    'bash',        // Shell scripts and commands
    'yaml',        // ROS 2 launch files, configs
    'xml',         // URDF robot descriptions
    'json',        // Configuration files
    'cmake',       // CMakeLists.txt (if using C++)
    'docker',      // Dockerfiles
    'markdown',    // Documentation
  ],

  // Magic comments for highlighting specific lines
  magicComments: [
    {
      className: 'theme-code-block-highlighted-line',
      line: 'highlight-next-line',
      block: { start: 'highlight-start', end: 'highlight-end' },
    },
    {
      className: 'code-block-error-line',
      line: 'error-next-line',
      block: { start: 'error-start', end: 'error-end' },
    },
    {
      className: 'code-block-warning-line',
      line: 'warning-next-line',
      block: { start: 'warning-start', end: 'warning-end' },
    },
  ],

  // Default language if not specified
  defaultLanguage: 'python',
};

module.exports = prismConfig;

/**
 * Usage in docusaurus.config.js:
 *
 * const prismConfig = require('../shared/theme/prism-config');
 *
 * module.exports = {
 *   themeConfig: {
 *     prism: prismConfig,
 *   },
 * };
 */
