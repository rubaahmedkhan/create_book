// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  module3Sidebar: [
    {type: 'doc', id: 'intro', label: 'Module 3 Introduction'},
    {
      type: 'category',
      label: 'Week 7: Isaac Sim Basics',
      items: ['week7/isaac-sim-setup', 'week7/first-simulation', 'week7/asset-import', 'week7/lab-warehouse'],
    },
    {
      type: 'category',
      label: 'Week 8: Advanced Isaac Sim',
      items: ['week8/sensors-cameras', 'week8/physics-advanced', 'week8/scripting-python', 'week8/lab-robot-builder'],
    },
    {
      type: 'category',
      label: 'Week 9: Isaac ROS',
      items: ['week9/isaac-ros-intro', 'week9/isaac-ros-vslam', 'week9/perception-stereo', 'week9/lab-perception'],
    },
    {
      type: 'category',
      label: 'Week 10: Nav2 & Sim-to-Real',
      items: ['week10/nav2-setup', 'week10/path-planning', 'week10/sim-to-real', 'week10/capstone-isaac'],
    },
  ],
};

module.exports = sidebars;
