---
sidebar_position: 1
---

# Module 1: ROS 2 Fundamentals

**The Robotic Nervous System** | Weeks 1-3

Welcome to Module 1! You'll learn the Robot Operating System 2 (ROS 2), the industry-standard middleware that powers modern robotic applications.

## What You'll Build

By the end of this module, you'll create a functional ROS 2 package with:

- Multiple communicating nodes
- Publishers and subscribers for sensor data
- Services for synchronous commands
- Launch files for multi-node deployment
- Unit tests and integration tests

## Learning Outcomes

After completing this module, you will be able to:

1. **Understand ROS 2 Architecture**
   - Grasp the distributed computing model
   - Explain nodes, topics, services, and actions
   - Navigate the ROS 2 ecosystem and tooling

2. **Build ROS 2 Packages**
   - Create Python (rclpy) packages
   - Implement publishers and subscribers
   - Use services and action servers
   - Manage parameters and configurations

3. **Deploy Multi-Node Systems**
   - Write launch files for complex systems
   - Debug ROS 2 applications with command-line tools
   - Test nodes with unit and integration tests

## Prerequisites

Before starting Module 1:

- ✅ Ubuntu 22.04 LTS installed (native, WSL2, or Docker)
- ✅ ROS 2 Humble installed and sourced
- ✅ Python 3.10+ familiarity
- ✅ Basic command-line skills

**Not ready?** See the [Setup Guide](../../getting-started/setup) on the main site.

## Module Structure

### Week 1: ROS 2 Basics
- ROS 2 architecture and core concepts
- Nodes and topics
- Publisher-subscriber pattern
- **Lab 1**: Turtle control with topics

### Week 2: Advanced Communication
- Services for request-response
- Actions for long-running tasks
- Parameters and dynamic configuration
- **Lab 2**: Robot controller with services

### Week 3: Building Packages
- ROS 2 package structure and conventions
- Launch files and multi-node systems
- Testing with pytest and launch_testing
- **Capstone**: Autonomous navigation node

## Tools You'll Use

- **rclpy**: ROS 2 client library for Python
- **ros2 CLI**: Command-line interface for introspection
- **rviz2**: 3D visualization tool
- **rqt**: Qt-based GUI tools
- **colcon**: Build system for ROS 2 packages

## Ready to Begin?

Start with [Week 1: ROS 2 Architecture](./week1/ros2-architecture) to understand the foundational concepts.

---

**Simulation-First Approach**: You'll see working demonstrations before diving into theory. All code examples are tested and available in the [examples repository](https://github.com/[org]/physical-ai-examples/tree/main/module1-ros2).
