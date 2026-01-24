# Physical AI & Humanoid Robotics Textbook

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-v3.9%2B-blue)](https://docusaurus.io/)

A comprehensive educational textbook for a 13-week Physical AI & Humanoid Robotics course, covering ROS 2, Gazebo/Unity simulation, NVIDIA Isaac Platform, and Vision-Language-Action (VLA) integration.

## 📚 Course Overview

This textbook guides students with AI/ML backgrounds through the journey from digital AI to embodied intelligence in physical systems.

### Four Core Modules

1. **Module 1: ROS 2 Fundamentals** - The Robotic Nervous System
2. **Module 2: Gazebo & Unity Simulation** - The Digital Twin
3. **Module 3: NVIDIA Isaac Platform** - The AI-Robot Brain
4. **Module 4: Vision-Language-Action (VLA)** - Multimodal Integration & Capstone

## 🎯 Learning Outcomes

- Understand Physical AI principles and embodied intelligence
- Master ROS 2 (Robot Operating System) for robotic control
- Simulate robots with Gazebo, Unity, and NVIDIA Isaac Sim
- Develop with NVIDIA Isaac AI robot platform
- Design humanoid robots for natural interactions
- Integrate GPT models for conversational robotics

## 🏗️ Architecture

### Multi-Instance Docusaurus

This project uses a **multi-instance Docusaurus architecture** for optimal build performance and content organization:

```
book1/ (this repository - textbook source)
├── main-site/          → github.io/physical-ai-textbook/
├── module1-ros2/       → github.io/physical-ai-textbook/module1/
├── module2-simulation/ → github.io/physical-ai-textbook/module2/
├── module3-isaac/      → github.io/physical-ai-textbook/module3/
├── module4-vla/        → github.io/physical-ai-textbook/module4/
└── shared/             → Common components, theme, config
```

### Related Repositories

- **[physical-ai-examples](https://github.com/[org]/physical-ai-examples)** - ROS 2 code examples, launch files, tests
- **[physical-ai-assets](https://github.com/[org]/physical-ai-assets)** - URDF models, meshes, simulation worlds (Git LFS)
- **[physical-ai-student-template](https://github.com/[org]/physical-ai-student-template)** - Setup scripts, Docker configs, starter kit

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **npm**: 9+
- **Git**: Latest version
- **Ubuntu 22.04 LTS**: Required for running code examples (or WSL2/Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/[org]/physical-ai-textbook.git
cd physical-ai-textbook

# Install dependencies
npm install

# Start local development (main site)
npm run start

# Or start a specific module
npm run start:module1  # ROS 2 module
npm run start:module2  # Simulation module
npm run start:module3  # Isaac module
npm run start:module4  # VLA module
```

### Build for Production

```bash
# Build all sites
npm run build

# Serve locally to test production build
npm run serve
```

## 📖 Content Structure

### Module 1: ROS 2 Fundamentals (Weeks 1-3)

- ROS 2 architecture and core concepts
- Nodes, topics, services, and actions
- Building ROS 2 packages with Python (rclpy)
- Launch files and parameter management

### Module 2: Gazebo & Unity Simulation (Weeks 4-6)

- URDF and SDF robot description formats
- Physics simulation with Gazebo
- High-fidelity rendering with Unity
- Sensor simulation (LiDAR, cameras, IMUs)

### Module 3: NVIDIA Isaac Platform (Weeks 7-10)

- NVIDIA Isaac Sim for photorealistic simulation
- Isaac ROS for hardware-accelerated VSLAM and navigation
- Nav2 path planning for bipedal locomotion
- Sim-to-real transfer techniques

### Module 4: Vision-Language-Action (Weeks 11-13)

- OpenAI Whisper for voice command processing
- LLM-based cognitive planning with GPT-4
- Voice-to-action pipelines
- **Capstone Project**: Autonomous humanoid robot with multimodal integration

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start          # Start main site
npm run start:module1  # Start Module 1 (ROS 2)
npm run start:module2  # Start Module 2 (Simulation)
npm run start:module3  # Start Module 3 (Isaac)
npm run start:module4  # Start Module 4 (VLA)

# Building
npm run build          # Build all sites
npm run build:main     # Build main site only
npm run build:module1  # Build Module 1 only
# ... (similar for module2-4)

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Auto-fix linting issues
npm run format         # Format with Prettier
npm run format:check   # Check formatting

# Testing (after CI/CD setup)
npm run test:accessibility  # WCAG 2.1 AA compliance
npm run test:links          # Validate markdown links
```

### Project Status

**Current Phase**: Phase 1 - Setup (1/17 tasks complete)

See [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) for detailed implementation status and timeline.

## 🎓 For Students

### Hardware Requirements

This course has varying computational requirements depending on the module:

| Component | Minimum | Recommended | Cloud Alternative |
|-----------|---------|-------------|-------------------|
| **GPU** | RTX 3060 (8GB VRAM) | RTX 4070 Ti (12GB VRAM) | AWS g5.2xlarge |
| **CPU** | Intel i7 13th Gen | AMD Ryzen 9 | - |
| **RAM** | 32 GB DDR5 | 64 GB DDR5 | - |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| **Storage** | 250 GB SSD | 500 GB NVMe | - |

**Budget Option**: Use cloud instances (~$200-250/quarter for 10 hours/week)

**Edge Deployment**: NVIDIA Jetson Orin Nano (8GB) for Module 3-4 (~$250)

### Getting Code Examples

```bash
# Clone the examples repository
git clone https://github.com/[org]/physical-ai-examples.git
cd physical-ai-examples

# Follow module-specific README for setup
cd module1-ros2
./setup.sh
```

### Getting Simulation Assets

```bash
# Clone assets repository (with Git LFS)
git clone https://github.com/[org]/physical-ai-assets.git
cd physical-ai-assets

# Low-poly models included (50MB)
# High-res models (450MB): Run download script
cd urdf_models/humanoid_highres
./download_highres.sh
```

## 🤝 Contributing

We welcome contributions from educators, roboticists, and AI practitioners!

### Content Guidelines

1. **Simulation-First Pedagogy**: Always demonstrate concepts in simulation before theory
2. **Progressive Complexity**: Beginner → Intermediate → Advanced labs
3. **Hardware-Aware**: Document requirements and provide cloud alternatives
4. **Accessible**: WCAG 2.1 AA compliant, jargon defined, plain-English explanations
5. **Reproducible**: All code tested on Ubuntu 22.04 + specified ROS 2 version

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/module1-new-chapter`)
3. Make changes following content guidelines
4. Test locally: `npm run build && npm run start`
5. Run accessibility tests: `npm run test:accessibility`
6. Submit pull request with clear description

## 📋 License

### Textbook Content

This textbook is licensed under a [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

**You are free to**:
- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material for any purpose, even commercially

**Under the following terms**:
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made.

### Code Examples

Code examples in the [physical-ai-examples](https://github.com/[org]/physical-ai-examples) repository are licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## 🔗 Links

- **Live Textbook**: https://[org].github.io/physical-ai-textbook/ (coming soon)
- **Code Examples**: https://github.com/[org]/physical-ai-examples
- **Assets Repository**: https://github.com/[org]/physical-ai-assets
- **Student Starter Template**: https://github.com/[org]/physical-ai-student-template
- **Issue Tracker**: https://github.com/[org]/physical-ai-textbook/issues
- **Discussions**: https://github.com/[org]/physical-ai-textbook/discussions

## 📞 Support

- **Content Issues**: [Report here](https://github.com/[org]/physical-ai-textbook/issues/new?template=content-improvement.md)
- **Broken Code Examples**: [Report here](https://github.com/[org]/physical-ai-examples/issues/new?template=broken-example.md)
- **Accessibility Issues**: [Report here](https://github.com/[org]/physical-ai-textbook/issues/new?template=accessibility.md)
- **General Questions**: [Discussions](https://github.com/[org]/physical-ai-textbook/discussions)

## 🙏 Acknowledgments

- **ROS 2 Community** - For the incredible robotics middleware
- **NVIDIA Omniverse Team** - For Isaac Sim platform
- **Docusaurus Team** - For the excellent documentation framework
- **Open Robotics** - For Gazebo simulator
- **Unity Technologies** - For Unity robotics tools

## 📊 Project Statistics

- **Total Modules**: 4
- **Estimated Chapters**: ~40
- **Code Examples**: ~100 (ROS 2 Python packages, launch files, URDF models)
- **Simulations**: ~10 worlds (Gazebo, Unity, Isaac Sim)
- **Target Duration**: 13 weeks (1 academic quarter)
- **Development Timeline**: 20-24 weeks (estimated)

---

**Built with** ❤️ **for the next generation of Physical AI engineers**

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
