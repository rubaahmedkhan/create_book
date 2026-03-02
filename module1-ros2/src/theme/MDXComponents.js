import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
// Import custom components
import SkillContent, { SkillBanner } from '@site/src/components/SkillContent';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  // Add custom components
  SkillContent,
  SkillBanner,
};
