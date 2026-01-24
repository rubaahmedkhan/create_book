---
sidebar_position: 10
---

# Stereo Depth Perception

## Overview

Implement GPU-accelerated stereo depth estimation using Isaac ROS Stereo Image Proc for real-time 3D perception on robotic platforms.

## Learning Objectives

- Configure stereo camera pairs in Isaac Sim
- Use Isaac ROS stereo image processing
- Generate depth maps from stereo pairs
- Create point clouds from stereo depth
- Optimize stereo matching for real-time performance

## Prerequisites

- Completed [Isaac ROS Introduction](./09-isaac-ros-intro.md)
- ROS 2 and Isaac ROS installed
- Understanding of stereo vision principles

## Stereo Vision Fundamentals

**Stereo depth** is computed from disparity:
```
depth = (baseline * focal_length) / disparity
```

Where:
- `baseline`: Distance between cameras
- `focal_length`: Camera focal length (pixels)
- `disparity`: Pixel offset between left/right images

## Setup Stereo Camera in Isaac Sim

```python
# stereo_camera_setup.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Stereo parameters
baseline = 0.12  # 12 cm
focal_length = 800.0  # pixels

# Left camera
camera_left = Camera(
    prim_path="/World/StereoRig/CameraLeft",
    position=np.array([3.0, -baseline/2, 1.5]),
    resolution=(1280, 720),
    frequency=30
)

# Right camera
camera_right = Camera(
    prim_path="/World/StereoRig/CameraRight",
    position=np.array([3.0, baseline/2, 1.5]),
    resolution=(1280, 720),
    frequency=30
)

# Ensure identical parameters
for cam in [camera_left, camera_right]:
    cam.set_focal_length(24.0)  # 24mm
    cam.set_horizontal_aperture(20.955)
    cam.set_vertical_aperture(11.787)

world.scene.add(camera_left)
world.scene.add(camera_right)

print(f"✓ Stereo camera configured (baseline: {baseline*1000:.1f}mm)")

world.reset()

for i in range(300):
    world.step(render=True)

simulation_app.close()
```

## Isaac ROS Stereo Disparity

### Launch Isaac ROS Stereo

```bash
# Terminal 1: Launch Isaac ROS stereo node
ros2 launch isaac_ros_stereo_image_proc isaac_ros_stereo_image_pipeline.launch.py \
    left_image_topic:=/stereo/left/image_raw \
    right_image_topic:=/stereo/right/image_raw \
    disparity_topic:=/stereo/disparity
```

### Publish Stereo Pair from Isaac Sim

```python
# stereo_publisher.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.core.utils.extensions import enable_extension
import numpy as np

enable_extension("omni.isaac.ros2_bridge")

import rclpy
from sensor_msgs.msg import Image, CameraInfo
from cv_bridge import CvBridge

class StereoCameraPublisher:
    def __init__(self, camera_left, camera_right, baseline, focal_length):
        self.camera_left = camera_left
        self.camera_right = camera_right
        self.baseline = baseline
        self.focal_length = focal_length
        self.bridge = CvBridge()

        # ROS 2 node
        self.node = rclpy.create_node('stereo_publisher')

        # Publishers
        self.left_pub = self.node.create_publisher(Image, '/stereo/left/image_raw', 10)
        self.right_pub = self.node.create_publisher(Image, '/stereo/right/image_raw', 10)
        self.left_info_pub = self.node.create_publisher(CameraInfo, '/stereo/left/camera_info', 10)
        self.right_info_pub = self.node.create_publisher(CameraInfo, '/stereo/right/camera_info', 10)

    def publish(self):
        # Get images
        left_img = self.camera_left.get_rgba()
        right_img = self.camera_right.get_rgba()

        if left_img is not None and right_img is not None:
            timestamp = self.node.get_clock().now().to_msg()

            # Left image
            left_msg = self.bridge.cv2_to_imgmsg(left_img[:,:,:3], "rgb8")
            left_msg.header.stamp = timestamp
            left_msg.header.frame_id = "left_camera"
            self.left_pub.publish(left_msg)

            # Right image
            right_msg = self.bridge.cv2_to_imgmsg(right_img[:,:,:3], "rgb8")
            right_msg.header.stamp = timestamp
            right_msg.header.frame_id = "right_camera"
            self.right_pub.publish(right_msg)

            # Camera info
            self.publish_camera_info(timestamp)

    def publish_camera_info(self, timestamp):
        # Create CameraInfo messages
        info_left = self.create_camera_info("left_camera")
        info_right = self.create_camera_info("right_camera")

        info_left.header.stamp = timestamp
        info_right.header.stamp = timestamp

        self.left_info_pub.publish(info_left)
        self.right_info_pub.publish(info_right)

    def create_camera_info(self, frame_id):
        info = CameraInfo()
        info.header.frame_id = frame_id
        info.width = 1280
        info.height = 720

        # Intrinsic matrix K
        fx = fy = self.focal_length
        cx, cy = 640.0, 360.0

        info.k = [fx, 0.0, cx,
                  0.0, fy, cy,
                  0.0, 0.0, 1.0]

        # Projection matrix P
        info.p = [fx, 0.0, cx, 0.0,
                  0.0, fy, cy, 0.0,
                  0.0, 0.0, 1.0, 0.0]

        return info

# Setup
rclpy.init()
world = World()
world.scene.add_default_ground_plane()

baseline = 0.12
focal_length = 800.0

camera_left = Camera(
    prim_path="/World/StereoRig/CameraLeft",
    position=np.array([3, -baseline/2, 1.5]),
    resolution=(1280, 720)
)

camera_right = Camera(
    prim_path="/World/StereoRig/CameraRight",
    position=np.array([3, baseline/2, 1.5]),
    resolution=(1280, 720)
)

world.scene.add(camera_left)
world.scene.add(camera_right)

publisher = StereoCameraPublisher(camera_left, camera_right, baseline, focal_length)

world.reset()

print("✓ Publishing stereo pair")

for i in range(1000):
    world.step(render=True)

    if i % 3 == 0:
        publisher.publish()

    rclpy.spin_once(publisher.node, timeout_sec=0)

publisher.node.destroy_node()
rclpy.shutdown()

simulation_app.close()
```

Verify disparity output:
```bash
ros2 topic hz /stereo/disparity
ros2 run image_view image_view --ros-args --remap image:=/stereo/disparity
```

## Point Cloud Generation

```python
# stereo_pointcloud.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
import numpy as np

class StereoPointCloud:
    def __init__(self, baseline, focal_length):
        self.baseline = baseline
        self.focal_length = focal_length

    def disparity_to_depth(self, disparity):
        """Convert disparity to depth."""
        depth = np.zeros_like(disparity, dtype=np.float32)
        valid = disparity > 0
        depth[valid] = (self.baseline * self.focal_length) / disparity[valid]
        return depth

    def depth_to_pointcloud(self, depth, fx, fy, cx, cy):
        """Back-project depth to 3D points."""
        h, w = depth.shape
        points = []

        for v in range(0, h, 4):  # Subsample for performance
            for u in range(0, w, 4):
                z = depth[v, u]
                if z > 0 and z < 10.0:
                    x = (u - cx) * z / fx
                    y = (v - cy) * z / fy
                    points.append([x, y, z])

        return np.array(points)

world = World()
# ... (setup stereo cameras)

stereo = StereoPointCloud(baseline=0.12, focal_length=800.0)

# Compute disparity (simplified - use Isaac ROS in production)
# disparity = compute_disparity(left_img, right_img)
# depth = stereo.disparity_to_depth(disparity)
# pointcloud = stereo.depth_to_pointcloud(depth, fx=800, fy=800, cx=640, cy=360)

simulation_app.close()
```

## Performance Optimization

### GPU Stereo Matching

Isaac ROS stereo uses GPU acceleration:
- **cuVISOR** for stereo matching
- **CUDA-optimized** correlation
- Real-time performance (30+ FPS at 1280x720)

### Tune Parameters

```yaml
# stereo_params.yaml
stereo_algorithm:
  block_size: 15
  min_disparity: 0
  num_disparities: 128
  prefilter_cap: 31
  uniqueness_ratio: 15
  speckle_window_size: 100
  speckle_range: 2
```

## Summary

- ✓ Configured stereo camera systems
- ✓ Integrated Isaac ROS stereo processing
- ✓ Generated depth from disparity
- ✓ Created 3D point clouds

## Next Steps

Continue to [Visual SLAM with cuVSLAM](./11-isaac-ros-vslam.md).

## Additional Resources

- [Isaac ROS Stereo Documentation](https://nvidia-isaac-ros.github.io/repositories_and_packages/isaac_ros_image_pipeline/isaac_ros_stereo_image_proc/index.html)
