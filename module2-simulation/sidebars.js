// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  module2Sidebar: [
    {type: 'doc', id: 'intro', label: 'Module 2 Introduction'},
    {
      type: 'category',
      label: 'Week 4: URDF & Robot Models',
      items: ['week4/urdf-basics', 'week4/links-joints', 'week4/sensors-urdf', 'week4/lab-build-robot'],
    },
    {
      type: 'category',
      label: 'Week 5: Gazebo Simulation',
      items: ['week5/gazebo-intro', 'week5/gazebo-physics', 'week5/gazebo-ros2', 'week5/lab-gazebo-nav'],
    },
    {
      type: 'category',
      label: 'Week 6: Unity Integration',
      items: ['week6/unity-intro', 'week6/unity-ros2', 'week6/sensor-sim', 'week6/capstone-sim'],
    },
  ],
};

module.exports = sidebars;
