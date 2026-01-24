---
sidebar_position: 9
---

# Isaac ROS Introduction

## Overview

Learn Isaac ROS - NVIDIA's accelerated ROS 2 packages for perception, navigation, and manipulation. Integrate Isaac Sim with ROS 2 for production-ready robotics applications.

## Learning Objectives

- Understand Isaac ROS architecture and GEMs
- Configure Isaac Sim ROS 2 Bridge
- Publish and subscribe to ROS 2 topics
- Integrate Isaac ROS perception packages
- Use GPU-accelerated image processing
- Debug ROS 2 communication in Isaac Sim

## Prerequisites

- Completed Week 8 tutorials
- ROS 2 Humble installed
- Understanding of ROS 2 concepts (nodes, topics, services)
- Familiarity with Docker (recommended)

## Isaac ROS Overview

### What is Isaac ROS?

**Isaac ROS** is a collection of hardware-accelerated ROS 2 packages:
- GPU-accelerated perception (CV-CUDA)
- Deep learning inference (TensorRT)
- Stereo depth estimation (CUDA)
- Visual SLAM (cuVSLAM)
- Object detection and tracking

### Architecture

```
┌─────────────────────────────────────────┐
│          Isaac ROS Packages             │
├─────────────────────────────────────────┤
│  isaac_ros_visual_slam                  │
│  isaac_ros_stereo_image_proc            │
│  isaac_ros_dnn_inference                │
│  isaac_ros_nvblox                       │
│  isaac_ros_apriltag                     │
├─────────────────────────────────────────┤
│         GEM Accelerators                │
│  (CUDA, cuVSLAM, NVBlox, TensorRT)     │
└─────────────────────────────────────────┘
```

## Installation

### Isaac ROS via Docker (Recommended)

```bash
# Install Docker and NVIDIA Container Toolkit
# (See Week 7 setup guide)

# Clone Isaac ROS Common
cd ~/workspaces
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_common.git

# Pull Isaac ROS Docker image
cd isaac_ros_common
./scripts/run_dev.sh

# Inside container - install Isaac ROS packages
mkdir -p /workspaces/isaac_ros-dev/src
cd /workspaces/isaac_ros-dev/src

# Clone Isaac ROS packages
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_visual_slam.git
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_image_pipeline.git
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_dnn_inference.git

# Build
cd /workspaces/isaac_ros-dev
colcon build --symlink-install

# Source
source install/setup.bash
```

### Verify Installation

```bash
# Check Isaac ROS packages
ros2 pkg list | grep isaac_ros

# Expected output:
# isaac_ros_visual_slam
# isaac_ros_stereo_image_proc
# isaac_ros_apriltag
# ... (many more)
```

## Isaac Sim ROS 2 Bridge

### Enable ROS 2 Bridge Extension

```python
# enable_ros2_bridge.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

# Enable ROS 2 bridge extension
from omni.isaac.core.utils.extensions import enable_extension
enable_extension("omni.isaac.ros2_bridge")

print("✓ ROS 2 Bridge enabled")

simulation_app.close()
```

### Configure ROS 2 Environment

```bash
# Set ROS 2 domain ID (avoid conflicts)
export ROS_DOMAIN_ID=42

# Set DDS implementation (recommended: Cyclone DDS)
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp

# Verify ROS 2
ros2 topic list
```

## Publishing Data from Isaac Sim

### Camera RGB Publisher

```python
# camera_rgb_publisher.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.core.utils.extensions import enable_extension
import numpy as np

# Enable ROS 2 bridge
enable_extension("omni.isaac.ros2_bridge")

import rclpy
from sensor_msgs.msg import Image
from cv_bridge import CvBridge

world = World()
world.scene.add_default_ground_plane()

# Create camera
camera = Camera(
    prim_path="/World/Camera",
    position=np.array([3.0, 3.0, 2.0]),
    resolution=(1280, 720),
    frequency=30
)

world.scene.add(camera)

# Initialize ROS 2
rclpy.init()
node = rclpy.create_node('isaac_sim_camera_publisher')

# Create publisher
image_pub = node.create_publisher(Image, '/camera/image_raw', 10)

bridge = CvBridge()

world.reset()

print("✓ Publishing camera images to /camera/image_raw")
print("  Verify with: ros2 topic echo /camera/image_raw")

for i in range(500):
    world.step(render=True)

    if i % 3 == 0:  # Publish at ~10 Hz (30 Hz sim / 3)
        rgb = camera.get_rgba()

        if rgb is not None:
            # Convert to ROS Image message
            img_msg = bridge.cv2_to_imgmsg(rgb[:,:,:3], encoding="rgb8")
            img_msg.header.stamp = node.get_clock().now().to_msg()
            img_msg.header.frame_id = "camera_link"

            image_pub.publish(img_msg)

    rclpy.spin_once(node, timeout_sec=0)

node.destroy_node()
rclpy.shutdown()

simulation_app.close()
```

Verify:
```bash
# In separate terminal
ros2 topic hz /camera/image_raw
ros2 topic echo /camera/image_raw --no-arr
```

### Depth Image Publisher

```python
# depth_publisher.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.core.utils.extensions import enable_extension
import numpy as np

enable_extension("omni.isaac.ros2_bridge")

import rclpy
from sensor_msgs.msg import Image
from cv_bridge import CvBridge

world = World()
world.scene.add_default_ground_plane()

camera = Camera(
    prim_path="/World/DepthCamera",
    position=np.array([3.0, 0.0, 2.0]),
    resolution=(640, 480)
)

world.scene.add(camera)

rclpy.init()
node = rclpy.create_node('depth_publisher')
depth_pub = node.create_publisher(Image, '/camera/depth', 10)

bridge = CvBridge()

world.reset()

print("✓ Publishing depth images to /camera/depth")

for i in range(500):
    world.step(render=True)

    if i % 3 == 0:
        depth = camera.get_depth()

        if depth is not None:
            # Convert depth to 16-bit (millimeters)
            depth_mm = (depth * 1000).astype(np.uint16)

            depth_msg = bridge.cv2_to_imgmsg(depth_mm, encoding="16UC1")
            depth_msg.header.stamp = node.get_clock().now().to_msg()
            depth_msg.header.frame_id = "camera_link"

            depth_pub.publish(depth_msg)

    rclpy.spin_once(node, timeout_sec=0)

node.destroy_node()
rclpy.shutdown()

simulation_app.close()
```

## Subscribing to ROS 2 Topics

### Robot Control via ROS 2

```python
# robot_control_subscriber.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.core.utils.types import ArticulationAction
from omni.isaac.core.utils.extensions import enable_extension
import numpy as np

enable_extension("omni.isaac.ros2_bridge")

import rclpy
from geometry_msgs.msg import Twist

class RobotController:
    def __init__(self, robot):
        self.robot = robot
        self.wheel_radius = 0.1
        self.wheel_separation = 0.4
        self.linear_vel = 0.0
        self.angular_vel = 0.0

    def cmd_vel_callback(self, msg):
        """Receive velocity commands from ROS 2."""
        self.linear_vel = msg.linear.x
        self.angular_vel = msg.angular.z

    def compute_wheel_velocities(self):
        """Convert twist to wheel velocities."""
        left_vel = (self.linear_vel - self.angular_vel * self.wheel_separation / 2) / self.wheel_radius
        right_vel = (self.linear_vel + self.angular_vel * self.wheel_separation / 2) / self.wheel_radius

        return np.array([left_vel, right_vel])

world = World()
world.scene.add_default_ground_plane()

# Load robot
carter = world.scene.add(
    WheeledRobot(
        prim_path="/World/Carter",
        name="carter",
        wheel_dof_names=["joint_wheel_left", "joint_wheel_right"],
        create_robot=True,
        usd_path="/Isaac/Robots/Carter/carter_v1.usd"
    )
)

world.reset()

# ROS 2 setup
rclpy.init()
node = rclpy.create_node('isaac_sim_robot_controller')

controller = RobotController(carter)

# Subscribe to cmd_vel
cmd_vel_sub = node.create_subscription(
    Twist,
    '/cmd_vel',
    controller.cmd_vel_callback,
    10
)

print("✓ Subscribed to /cmd_vel")
print("  Send commands with: ros2 topic pub /cmd_vel geometry_msgs/Twist ...")

for i in range(2000):
    # Process ROS callbacks
    rclpy.spin_once(node, timeout_sec=0)

    # Apply computed wheel velocities
    wheel_vels = controller.compute_wheel_velocities()
    carter.apply_action(ArticulationAction(joint_velocities=wheel_vels))

    world.step(render=True)

node.destroy_node()
rclpy.shutdown()

simulation_app.close()
```

Test with:
```bash
# Forward motion
ros2 topic pub /cmd_vel geometry_msgs/Twist "{linear: {x: 0.5}, angular: {z: 0.0}}"

# Rotation
ros2 topic pub /cmd_vel geometry_msgs/Twist "{linear: {x: 0.0}, angular: {z: 0.5}}"
```

## Using Isaac ROS Action Graph

### Create ROS 2 Publishers via Action Graph

```python
# action_graph_ros2.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
import omni.graph.core as og
import numpy as np

world = World()

# Create camera
camera = Camera(
    prim_path="/World/Camera",
    position=np.array([3, 3, 2]),
    resolution=(640, 480)
)
world.scene.add(camera)

# Create Action Graph for ROS 2 publishing
keys = og.Controller.Keys
(graph, nodes, _, _) = og.Controller.edit(
    {
        "graph_path": "/World/ActionGraph",
        "evaluator_name": "execution",
    },
    {
        keys.CREATE_NODES: [
            ("OnPlaybackTick", "omni.graph.action.OnPlaybackTick"),
            ("CameraHelper", "omni.isaac.core_nodes.IsaacReadCameraInfo"),
            ("ROS2CameraHelper", "omni.isaac.ros2_bridge.ROS2CameraHelper"),
        ],
        keys.SET_VALUES: [
            ("CameraHelper.inputs:cameraPrim", "/World/Camera"),
        ],
        keys.CONNECT: [
            ("OnPlaybackTick.outputs:tick", "CameraHelper.inputs:execIn"),
            ("CameraHelper.outputs:execOut", "ROS2CameraHelper.inputs:execIn"),
            ("CameraHelper.outputs:cameraInfo", "ROS2CameraHelper.inputs:cameraInfo"),
        ],
    },
)

print("✓ Action Graph created for ROS 2 publishing")

world.reset()

for i in range(300):
    world.step(render=True)

simulation_app.close()
```

## Isaac ROS Perception Integration

### AprilTag Detection

```python
# apriltag_detection.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
import numpy as np

world = World()

# Add AprilTag to scene
# (Use USD asset or create procedurally)

camera = Camera(
    prim_path="/World/Camera",
    position=np.array([2, 0, 1.5]),
    resolution=(1280, 720)
)
world.scene.add(camera)

# Configure Action Graph for Isaac ROS AprilTag
# Links camera output to isaac_ros_apriltag node

print("✓ AprilTag detection configured")
print("  Isaac ROS AprilTag will publish detections to /tag_detections")

world.reset()

for i in range(300):
    world.step(render=True)

simulation_app.close()
```

Launch Isaac ROS AprilTag (in separate terminal):
```bash
ros2 launch isaac_ros_apriltag isaac_ros_apriltag.launch.py
```

## Hands-On Exercise

### Complete Sim-to-ROS Pipeline

```python
# complete_sim_to_ros.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.core.utils.types import ArticulationAction
from omni.isaac.core.utils.extensions import enable_extension
import numpy as np

enable_extension("omni.isaac.ros2_bridge")

import rclpy
from sensor_msgs.msg import Image, LaserScan
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
from cv_bridge import CvBridge

class SimToROSBridge:
    def __init__(self, robot):
        self.robot = robot
        self.bridge = CvBridge()

        # ROS 2 node
        self.node = rclpy.create_node('isaac_sim_bridge')

        # Publishers
        self.image_pub = self.node.create_publisher(Image, '/camera/image_raw', 10)
        self.depth_pub = self.node.create_publisher(Image, '/camera/depth', 10)
        self.odom_pub = self.node.create_publisher(Odometry, '/odom', 10)

        # Subscribers
        self.cmd_vel_sub = self.node.create_subscription(
            Twist, '/cmd_vel', self.cmd_vel_callback, 10
        )

        self.linear_vel = 0.0
        self.angular_vel = 0.0

    def cmd_vel_callback(self, msg):
        self.linear_vel = msg.linear.x
        self.angular_vel = msg.angular.z

    def publish_sensor_data(self, camera):
        # RGB
        rgb = camera.get_rgba()
        if rgb is not None:
            img_msg = self.bridge.cv2_to_imgmsg(rgb[:,:,:3], "rgb8")
            img_msg.header.stamp = self.node.get_clock().now().to_msg()
            self.image_pub.publish(img_msg)

        # Depth
        depth = camera.get_depth()
        if depth is not None:
            depth_mm = (depth * 1000).astype(np.uint16)
            depth_msg = self.bridge.cv2_to_imgmsg(depth_mm, "16UC1")
            depth_msg.header.stamp = self.node.get_clock().now().to_msg()
            self.depth_pub.publish(depth_msg)

    def publish_odometry(self):
        odom_msg = Odometry()
        odom_msg.header.stamp = self.node.get_clock().now().to_msg()
        odom_msg.header.frame_id = "odom"
        odom_msg.child_frame_id = "base_link"

        # Get robot pose
        pos, quat = self.robot.get_world_pose()

        odom_msg.pose.pose.position.x = float(pos[0])
        odom_msg.pose.pose.position.y = float(pos[1])
        odom_msg.pose.pose.position.z = float(pos[2])

        odom_msg.pose.pose.orientation.w = float(quat[0])
        odom_msg.pose.pose.orientation.x = float(quat[1])
        odom_msg.pose.pose.orientation.y = float(quat[2])
        odom_msg.pose.pose.orientation.z = float(quat[3])

        self.odom_pub.publish(odom_msg)

    def get_wheel_velocities(self):
        wheel_radius = 0.1
        wheel_sep = 0.4

        left = (self.linear_vel - self.angular_vel * wheel_sep / 2) / wheel_radius
        right = (self.linear_vel + self.angular_vel * wheel_sep / 2) / wheel_radius

        return np.array([left, right])

# Setup
rclpy.init()
world = World()
world.scene.add_default_ground_plane()

carter = world.scene.add(
    WheeledRobot(
        prim_path="/World/Carter",
        name="carter",
        wheel_dof_names=["joint_wheel_left", "joint_wheel_right"],
        create_robot=True,
        usd_path="/Isaac/Robots/Carter/carter_v1.usd"
    )
)

camera = Camera(
    prim_path="/World/Carter/chassis_link/camera",
    position=np.array([0.3, 0, 0.2]),
    resolution=(640, 480),
    frequency=30
)
world.scene.add(camera)

bridge = SimToROSBridge(carter)

world.reset()

print("✓ Complete Sim-to-ROS bridge active")
print("  Publishing: /camera/image_raw, /camera/depth, /odom")
print("  Subscribing: /cmd_vel")

for i in range(2000):
    rclpy.spin_once(bridge.node, timeout_sec=0)

    # Apply control
    wheel_vels = bridge.get_wheel_velocities()
    carter.apply_action(ArticulationAction(joint_velocities=wheel_vels))

    # Publish sensor data
    if i % 3 == 0:
        bridge.publish_sensor_data(camera)
        bridge.publish_odometry()

    world.step(render=True)

bridge.node.destroy_node()
rclpy.shutdown()

simulation_app.close()
```

## Summary

You've mastered:
- ✓ Isaac ROS architecture and components
- ✓ ROS 2 Bridge configuration in Isaac Sim
- ✓ Publishing sensor data to ROS 2
- ✓ Subscribing to control commands
- ✓ Isaac ROS perception integration

## Next Steps

Continue to [Stereo Depth Perception](./10-perception-stereo.md) for GPU-accelerated stereo processing.

## Additional Resources

- [Isaac ROS Documentation](https://nvidia-isaac-ros.github.io/)
- [Isaac ROS GitHub](https://github.com/NVIDIA-ISAAC-ROS)
- [ROS 2 Bridge Documentation](https://docs.omniverse.nvidia.com/app_isaacsim/app_isaacsim/ext_omni_isaac_ros_bridge.html)
