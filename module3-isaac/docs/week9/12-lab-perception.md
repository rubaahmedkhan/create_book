---
sidebar_position: 12
---

# Lab: Perception Pipeline

## Overview

Build a complete perception pipeline integrating cameras, depth sensors, object detection, and Visual SLAM for autonomous navigation in Isaac Sim.

## Learning Objectives

- Integrate multiple perception modalities
- Implement object detection with Isaac ROS DNN
- Fuse sensor data for robust perception
- Build real-time perception pipeline
- Visualize perception results in RViz2

## Prerequisites

- Completed Week 9 tutorials (09-11)
- Isaac ROS packages installed
- Understanding of perception workflows

## Lab Specifications

Build perception system with:
- Stereo camera for depth
- RGB camera for object detection
- 2D Lidar for obstacle detection
- cuVSLAM for localization
- Isaac ROS DNN for object classification

## Part 1: Multi-Sensor Setup

```python
# multi_sensor_robot.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.wheeled_robots.robots import WheeledRobot
import numpy as np

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

# RGB camera (front)
rgb_camera = Camera(
    prim_path="/World/Carter/chassis_link/front_camera",
    position=np.array([0.3, 0, 0.15]),
    resolution=(1280, 720),
    frequency=30
)

# Stereo cameras
stereo_left = Camera(
    prim_path="/World/Carter/chassis_link/stereo_left",
    position=np.array([0.25, -0.06, 0.12]),
    resolution=(640, 480)
)

stereo_right = Camera(
    prim_path="/World/Carter/chassis_link/stereo_right",
    position=np.array([0.25, 0.06, 0.12]),
    resolution=(640, 480)
)

world.scene.add(rgb_camera)
world.scene.add(stereo_left)
world.scene.add(stereo_right)

print("✓ Multi-sensor robot configured")
print("  - RGB camera: 1280x720 @ 30Hz")
print("  - Stereo cameras: 640x480")
print("  - 2D Lidar: 270° FOV")

world.reset()

for i in range(300):
    world.step(render=True)

simulation_app.close()
```

## Part 2: Object Detection with Isaac ROS DNN

### Download Object Detection Model

```bash
# Download YOLOv5 model for Isaac ROS
cd ~/workspaces
wget https://github.com/NVIDIA-AI-IOT/yolov5_gpu_optimization/releases/download/v1.0/yolov5s.onnx
```

### Launch Isaac ROS DNN Inference

```bash
ros2 launch isaac_ros_dnn_inference isaac_ros_yolov5.launch.py \
    model_file_path:=~/workspaces/yolov5s.onnx \
    engine_file_path:=~/workspaces/yolov5s.plan \
    input_image_topic:=/front_camera/image_raw \
    output_topic:=/detections
```

### Integrate Object Detection

```python
# object_detection_integration.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.core.utils.extensions import enable_extension
import numpy as np

enable_extension("omni.isaac.ros2_bridge")

import rclpy
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection2DArray
from cv_bridge import CvBridge

class ObjectDetectionNode:
    def __init__(self, camera):
        self.camera = camera
        self.bridge = CvBridge()
        self.detections = []

        self.node = rclpy.create_node('object_detection_node')

        # Publisher
        self.image_pub = self.node.create_publisher(
            Image,
            '/front_camera/image_raw',
            10
        )

        # Subscriber
        self.det_sub = self.node.create_subscription(
            Detection2DArray,
            '/detections',
            self.detection_callback,
            10
        )

    def detection_callback(self, msg):
        """Receive object detections."""
        self.detections = msg.detections
        print(f"Detected {len(self.detections)} objects:")
        for det in self.detections:
            # Print class and confidence
            # ... (process detections)
            pass

    def publish_image(self):
        rgb = self.camera.get_rgba()
        if rgb is not None:
            img_msg = self.bridge.cv2_to_imgmsg(rgb[:,:,:3], "rgb8")
            img_msg.header.stamp = self.node.get_clock().now().to_msg()
            self.image_pub.publish(img_msg)

# Setup and run
rclpy.init()
world = World()

camera = Camera(
    prim_path="/World/Camera",
    position=np.array([3, 0, 1.5]),
    resolution=(1280, 720)
)
world.scene.add(camera)

detector = ObjectDetectionNode(camera)

world.reset()

for i in range(1000):
    world.step(render=True)

    if i % 3 == 0:
        detector.publish_image()

    rclpy.spin_once(detector.node, timeout_sec=0)

detector.node.destroy_node()
rclpy.shutdown()
simulation_app.close()
```

## Part 3: Sensor Fusion

```python
# sensor_fusion.py
import numpy as np

class PerceptionFusion:
    def __init__(self):
        self.rgb_data = None
        self.depth_data = None
        self.lidar_data = None
        self.detections = []

    def update_rgb(self, rgb_image):
        self.rgb_data = rgb_image

    def update_depth(self, depth_image):
        self.depth_data = depth_image

    def update_lidar(self, scan):
        self.lidar_data = scan

    def update_detections(self, detections):
        self.detections = detections

    def get_3d_bounding_boxes(self):
        """Project 2D detections to 3D using depth."""
        bbox_3d = []

        for det in self.detections:
            # Get 2D bbox from detection
            # ... (extract bbox coordinates)

            # Look up depth at bbox center
            # depth_value = self.depth_data[center_y, center_x]

            # Back-project to 3D
            # ... (compute 3D position)

            # bbox_3d.append(3d_bbox)
            pass

        return bbox_3d

    def filter_obstacles(self):
        """Combine lidar and depth for robust obstacle detection."""
        # Fuse lidar and depth data
        # Remove noise and false positives
        pass
```

## Part 4: Complete Pipeline

```python
# complete_perception_pipeline.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.core.utils.extensions import enable_extension
import numpy as np

enable_extension("omni.isaac.ros2_bridge")

import rclpy
from sensor_msgs.msg import Image, LaserScan
from geometry_msgs.msg import PoseStamped
from vision_msgs.msg import Detection2DArray
from cv_bridge import CvBridge

class PerceptionPipeline:
    """Complete perception system."""

    def __init__(self):
        self.node = rclpy.create_node('perception_pipeline')
        self.bridge = CvBridge()

        # Publishers
        self.rgb_pub = self.node.create_publisher(Image, '/camera/rgb/image_raw', 10)
        self.depth_pub = self.node.create_publisher(Image, '/camera/depth/image', 10)
        self.lidar_pub = self.node.create_publisher(LaserScan, '/scan', 10)

        # Subscribers
        self.det_sub = self.node.create_subscription(
            Detection2DArray, '/detections', self.det_callback, 10
        )
        self.slam_sub = self.node.create_subscription(
            PoseStamped, '/visual_slam/tracking/vo_pose', self.slam_callback, 10
        )

        self.detections = []
        self.slam_pose = None

    def det_callback(self, msg):
        self.detections = msg.detections

    def slam_callback(self, msg):
        self.slam_pose = msg

    def publish_sensors(self, rgb_cam, depth_cam):
        # Publish RGB
        rgb = rgb_cam.get_rgba()
        if rgb is not None:
            rgb_msg = self.bridge.cv2_to_imgmsg(rgb[:,:,:3], "rgb8")
            rgb_msg.header.stamp = self.node.get_clock().now().to_msg()
            self.rgb_pub.publish(rgb_msg)

        # Publish depth
        depth = depth_cam.get_depth()
        if depth is not None:
            depth_mm = (depth * 1000).astype(np.uint16)
            depth_msg = self.bridge.cv2_to_imgmsg(depth_mm, "16UC1")
            depth_msg.header.stamp = self.node.get_clock().now().to_msg()
            self.depth_pub.publish(depth_msg)

    def get_perception_state(self):
        """Aggregate all perception data."""
        return {
            'num_detections': len(self.detections),
            'slam_pose': self.slam_pose,
            'timestamp': self.node.get_clock().now()
        }

# Setup
rclpy.init()
world = World()

# Create multi-sensor robot
# ... (similar to Part 1)

pipeline = PerceptionPipeline()

world.reset()

print("✓ Complete perception pipeline running")
print("  - RGB camera → Object detection")
print("  - Stereo cameras → Visual SLAM")
print("  - Depth + Lidar → Obstacle detection")

for i in range(2000):
    world.step(render=True)

    if i % 3 == 0:
        # pipeline.publish_sensors(rgb_camera, depth_camera)
        pass

    rclpy.spin_once(pipeline.node, timeout_sec=0)

    if i % 100 == 0:
        state = pipeline.get_perception_state()
        print(f"Step {i}: {state['num_detections']} objects detected")

pipeline.node.destroy_node()
rclpy.shutdown()
simulation_app.close()
```

## Part 5: RViz2 Visualization

```bash
# Launch RViz2 with perception config
ros2 run rviz2 rviz2 -d ~/perception_config.rviz
```

**RViz2 displays**:
- Camera images (RGB, depth)
- Object detection bounding boxes
- SLAM trajectory and map
- Lidar scan visualization
- TF transforms

## Lab Deliverables

1. **Multi-sensor robot configuration**
2. **Object detection integration**
3. **Sensor fusion implementation**
4. **Complete perception pipeline**
5. **RViz2 visualization**
6. **Performance report**

## Validation Checklist

- [ ] All sensors publish data at expected rates
- [ ] Object detection achieves more than 20 FPS
- [ ] Visual SLAM estimates accurate pose
- [ ] Sensor fusion reduces false positives
- [ ] Pipeline runs in real-time (less than 50ms latency)

## Summary

You've successfully:
- ✓ Integrated multiple perception sensors
- ✓ Implemented GPU-accelerated object detection
- ✓ Fused sensor data for robust perception
- ✓ Built end-to-end perception pipeline
- ✓ Visualized results in RViz2

## Next Steps

**Week 10** covers navigation and sim-to-real transfer.

## Additional Resources

- [Isaac ROS DNN Inference](https://nvidia-isaac-ros.github.io/repositories_and_packages/isaac_ros_dnn_inference/index.html)
- [RViz2 User Guide](https://github.com/ros2/rviz)
