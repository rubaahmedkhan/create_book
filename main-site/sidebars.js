/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Main sidebar for course overview
  mainSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Course Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/prerequisites',
        'getting-started/hardware-requirements',
        'getting-started/setup',
      ],
    },
    {
      type: 'category',
      label: 'Course Modules',
      items: [
        'modules/module1-overview',
        'modules/module2-overview',
        'modules/module3-overview',
        'modules/module4-overview',
      ],
    },
    {
      type: 'category',
      label: 'Resources',
      items: [
        'resources/glossary',
        'resources/version-matrix',
        'resources/accessibility',
      ],
    },
  ],

  // Module 1: ROS 2 Fundamentals
  module1Sidebar: [
    {
      type: 'doc',
      id: 'module1/intro',
      label: 'Module 1 Introduction',
    },
    {
      type: 'category',
      label: 'Week 1: ROS 2 Basics',
      collapsed: false,
      items: [
        'module1/week1/ros2-architecture',
        'module1/week1/nodes-topics',
        'module1/week1/pubsub',
        'module1/week1/lab1-turtle',
      ],
    },
    {
      type: 'category',
      label: 'Week 2: Advanced Concepts',
      collapsed: false,
      items: [
        'module1/week2/services',
        'module1/week2/actions',
        'module1/week2/parameters',
        'module1/week2/lab2-controller',
      ],
    },
    {
      type: 'category',
      label: 'Week 3: Package Development',
      collapsed: false,
      items: [
        'module1/week3/packages',
        'module1/week3/launch',
        'module1/week3/testing',
        'module1/week3/capstone',
      ],
    },
  ],

  // Module 2: Simulation
  module2Sidebar: [
    {
      type: 'doc',
      id: 'module2/intro',
      label: 'Module 2 Introduction',
    },
    {
      type: 'category',
      label: 'Week 4: URDF & Robot Description',
      collapsed: false,
      items: [
        'module2/week4/urdf-basics',
        'module2/week4/links-joints',
        'module2/week4/sensors-urdf',
        'module2/week4/lab-build-robot',
      ],
    },
    {
      type: 'category',
      label: 'Week 5: Gazebo Simulation',
      collapsed: false,
      items: [
        'module2/week5/gazebo-intro',
        'module2/week5/gazebo-physics',
        'module2/week5/gazebo-ros2',
        'module2/week5/lab-gazebo-nav',
      ],
    },
    {
      type: 'category',
      label: 'Week 6: Unity Simulation',
      collapsed: false,
      items: [
        'module2/week6/unity-intro',
        'module2/week6/unity-ros2',
        'module2/week6/sensor-sim',
        'module2/week6/capstone-sim',
      ],
    },
  ],

  // Module 3: Isaac Sim
  module3Sidebar: [
    {
      type: 'doc',
      id: 'module3/intro',
      label: 'Module 3 Introduction',
    },
    {
      type: 'category',
      label: 'Week 7: Isaac Sim Basics',
      collapsed: false,
      items: [
        'module3/week7/isaac-sim-setup',
        'module3/week7/first-simulation',
        'module3/week7/asset-import',
        'module3/week7/lab-warehouse',
      ],
    },
    {
      type: 'category',
      label: 'Week 8: Advanced Isaac Sim',
      collapsed: false,
      items: [
        'module3/week8/physics-advanced',
        'module3/week8/sensors-cameras',
        'module3/week8/scripting-python',
        'module3/week8/lab-robot-builder',
      ],
    },
    {
      type: 'category',
      label: 'Week 9: Isaac ROS',
      collapsed: false,
      items: [
        'module3/week9/isaac-ros-intro',
        'module3/week9/perception-stereo',
        'module3/week9/isaac-ros-vslam',
        'module3/week9/lab-perception',
      ],
    },
    {
      type: 'category',
      label: 'Week 10: Nav2 & Sim-to-Real',
      collapsed: false,
      items: [
        'module3/week10/nav2-setup',
        'module3/week10/path-planning',
        'module3/week10/sim-to-real',
        'module3/week10/capstone-isaac',
      ],
    },
  ],

  // Module 4: VLA
  module4Sidebar: [
    {
      type: 'doc',
      id: 'module4/intro',
      label: 'Module 4 Introduction',
    },
    {
      type: 'category',
      label: 'Week 11: Voice Processing',
      collapsed: false,
      items: [
        'module4/week11/whisper-setup',
        'module4/week11/audio-capture',
      ],
    },
  ],
};

module.exports = sidebars;
