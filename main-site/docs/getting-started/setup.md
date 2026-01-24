---
sidebar_position: 3
---

# Environment Setup

Get your development environment ready for the Physical AI course.

## Step 1: Install Ubuntu 22.04 LTS

Choose one of the following:

- **Native Installation**: Best performance (dual boot or dedicated machine)
- **WSL2 (Windows)**: Good for development, may have GPU limitations
- **Docker**: Portable but requires additional configuration

## Step 2: Install ROS 2 Humble

```bash
# Add ROS 2 repository
sudo apt update && sudo apt install software-properties-common
sudo add-apt-repository universe
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg

# Install ROS 2 Humble Desktop
sudo apt update
sudo apt install ros-humble-desktop
```

## Step 3: Clone Code Examples

```bash
git clone https://github.com/[org]/physical-ai-examples.git
cd physical-ai-examples
./setup.sh
```

## Step 4: Verify Installation

```bash
source /opt/ros/humble/setup.bash
ros2 --version
```

Expected output: `ros2 cli version 0.25.x`

## Next Steps

Proceed to [Module 1: ROS 2 Fundamentals](../modules/module1-overview) to begin learning!
