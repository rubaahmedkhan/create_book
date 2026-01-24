---
sidebar_position: 11
---

# Visual SLAM with cuVSLAM

## Overview

Implement real-time Visual SLAM using NVIDIA cuVSLAM (CUDA Visual SLAM) for accurate localization and mapping in Isaac Sim.

## Learning Objectives

- Understand Visual SLAM principles
- Configure cuVSLAM in Isaac Sim
- Build maps using stereo/RGBD cameras
- Track robot pose in real-time
- Evaluate SLAM accuracy and performance

## Prerequisites

- Completed stereo perception tutorial
- Isaac ROS Visual SLAM installed
- Understanding of SLAM concepts (poses, landmarks, loop closure)

## cuVSLAM Overview

**cuVSLAM** features:
- GPU-accelerated visual odometry
- Stereo and monocular modes
- Loop closure detection
- Real-time performance (30+ FPS)

## Setup cuVSLAM

### Install Isaac ROS Visual SLAM

```bash
cd ~/workspaces/isaac_ros-dev/src
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_visual_slam.git
cd ~/workspaces/isaac_ros-dev
colcon build --packages-up-to isaac_ros_visual_slam
source install/setup.bash
```

### Launch cuVSLAM

```bash
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam_stereo.launch.py
```

## Stereo Visual SLAM in Isaac Sim

```python
# stereo_vslam.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.core.utils.extensions import enable_extension
import numpy as np

enable_extension("omni.isaac.ros2_bridge")

import rclpy
from sensor_msgs.msg import Image, CameraInfo
from geometry_msgs.msg import PoseStamped
from cv_bridge import CvBridge

class VisualSLAMBridge:
    def __init__(self, camera_left, camera_right):
        self.camera_left = camera_left
        self.camera_right = camera_right
        self.bridge = CvBridge()

        self.node = rclpy.create_node('vslam_bridge')

        # Publishers for cuVSLAM
        self.left_pub = self.node.create_publisher(Image, '/stereo_camera/left/image', 10)
        self.right_pub = self.node.create_publisher(Image, '/stereo_camera/right/image', 10)
        self.left_info_pub = self.node.create_publisher(CameraInfo, '/stereo_camera/left/camera_info', 10)
        self.right_info_pub = self.node.create_publisher(CameraInfo, '/stereo_camera/right/camera_info', 10)

        # Subscribe to SLAM pose
        self.pose_sub = self.node.create_subscription(
            PoseStamped,
            '/visual_slam/tracking/vo_pose',
            self.pose_callback,
            10
        )

        self.slam_pose = None

    def pose_callback(self, msg):
        """Receive estimated pose from cuVSLAM."""
        self.slam_pose = msg
        pos = msg.pose.position
        print(f"SLAM Pose: [{pos.x:.2f}, {pos.y:.2f}, {pos.z:.2f}]")

    def publish_stereo(self):
        left_img = self.camera_left.get_rgba()
        right_img = self.camera_right.get_rgba()

        if left_img is not None and right_img is not None:
            timestamp = self.node.get_clock().now().to_msg()

            left_msg = self.bridge.cv2_to_imgmsg(left_img[:,:,:3], "rgb8")
            left_msg.header.stamp = timestamp
            left_msg.header.frame_id = "left_camera"

            right_msg = self.bridge.cv2_to_imgmsg(right_img[:,:,:3], "rgb8")
            right_msg.header.stamp = timestamp
            right_msg.header.frame_id = "right_camera"

            self.left_pub.publish(left_msg)
            self.right_pub.publish(right_msg)

            # Publish camera info
            # ... (similar to stereo tutorial)

# Setup
rclpy.init()
world = World()
world.scene.add_default_ground_plane()

# Add textured environment for SLAM features
# ... (load warehouse or room scene)

# Stereo cameras
camera_left = Camera(
    prim_path="/World/Robot/CameraLeft",
    position=np.array([0, -0.06, 1.5]),
    resolution=(1280, 720)
)

camera_right = Camera(
    prim_path="/World/Robot/CameraRight",
    position=np.array([0, 0.06, 1.5]),
    resolution=(1280, 720)
)

world.scene.add(camera_left)
world.scene.add(camera_right)

bridge = VisualSLAMBridge(camera_left, camera_right)

world.reset()

print("✓ Visual SLAM bridge active")
print("  Launch cuVSLAM in separate terminal")

for i in range(2000):
    world.step(render=True)

    if i % 3 == 0:
        bridge.publish_stereo()

    rclpy.spin_once(bridge.node, timeout_sec=0)

bridge.node.destroy_node()
rclpy.shutdown()
simulation_app.close()
```

## SLAM Evaluation

```python
# evaluate_slam.py
import numpy as np

class SLAMEvaluator:
    def __init__(self):
        self.ground_truth_poses = []
        self.estimated_poses = []

    def add_measurement(self, gt_pose, est_pose):
        self.ground_truth_poses.append(gt_pose)
        self.estimated_poses.append(est_pose)

    def compute_ate(self):
        """Absolute Trajectory Error."""
        gt = np.array(self.ground_truth_poses)
        est = np.array(self.estimated_poses)

        errors = np.linalg.norm(gt - est, axis=1)
        return {
            'mean': np.mean(errors),
            'rmse': np.sqrt(np.mean(errors**2)),
            'max': np.max(errors)
        }
```

## Summary

- ✓ Configured cuVSLAM for Isaac Sim
- ✓ Published stereo data for SLAM
- ✓ Tracked robot pose in real-time
- ✓ Evaluated SLAM accuracy

## Next Steps

Continue to [Lab: Perception Pipeline](./12-lab-perception.md).

## Additional Resources

- [Isaac ROS Visual SLAM](https://nvidia-isaac-ros.github.io/repositories_and_packages/isaac_ros_visual_slam/index.html)
