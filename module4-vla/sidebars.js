// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  module4Sidebar: [
    {type: 'doc', id: 'intro', label: 'Module 4 Introduction'},
    {
      type: 'category',
      label: 'Week 11: Voice Processing',
      items: ['week11/whisper-setup', 'week11/audio-capture'],
      // TODO: Add remaining docs when available:
      // 'week11/speech-recognition', 'week11/ros-audio', 'week11/lab1'
    },
    // TODO: Uncomment when Week 12 content is created
    // {
    //   type: 'category',
    //   label: 'Week 12: LLM Integration',
    //   items: ['week12/gpt4-planning', 'week12/task-decomposition', 'week12/vla-pipeline', 'week12/lab2'],
    // },
    // TODO: Uncomment when Week 13 content is created
    // {
    //   type: 'category',
    //   label: 'Week 13: Capstone Project',
    //   items: ['week13/capstone-overview', 'week13/multimodal-robot', 'week13/integration', 'week13/presentation'],
    // },
  ],
};

module.exports = sidebars;
