// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  module1Sidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Module 1 Introduction',
    },
    {
      type: 'category',
      label: 'Week 1: ROS 2 Basics',
      items: [
        'week1/ros2-architecture',
        'week1/nodes-and-topics',
        'week1/publisher-subscriber',
        'week1/lab1',
      ],
    },
    {
      type: 'category',
      label: 'Week 2: Advanced Communication',
      items: [
        'week2/services',
        'week2/actions',
        'week2/parameters',
        'week2/lab2-controller',
      ],
    },
    {
      type: 'category',
      label: 'Week 3: Building Packages',
      items: [
        'week3/packages',
        'week3/launch',
        'week3/testing',
        'week3/capstone',
      ],
    },
  ],
};

module.exports = sidebars;
