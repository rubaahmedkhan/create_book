---
sidebar_position: 6
---

# Sensors and Cameras in Isaac Sim

## Overview

Learn to implement and configure RGB cameras, depth sensors, stereo cameras, semantic segmentation, instance segmentation, and other perception sensors in Isaac Sim for robotics applications.

## Learning Objectives

- Configure RGB, depth, and stereo camera systems
- Implement semantic and instance segmentation
- Capture and process synthetic sensor data
- Configure sensor intrinsics and extrinsics
- Generate annotated datasets for machine learning
- Optimize sensor performance for real-time operation

## Prerequisites

- Completed Week 7 and physics tutorial (05)
- Understanding of camera parameters (focal length, resolution)
- Basic image processing knowledge
- Familiarity with coordinate transforms

## Camera System Overview

Isaac Sim supports multiple camera types through the **Replicator** framework:

| Camera Type | Output | Use Case |
|------------|--------|----------|
| **RGB** | Color images | Visual perception, object detection |
| **Depth** | Distance map | 3D reconstruction, obstacle detection |
| **Stereo** | Left/right images | Depth estimation, visual odometry |
| **Semantic Segmentation** | Class labels per pixel | Scene understanding |
| **Instance Segmentation** | Object IDs per pixel | Object tracking |
| **Bounding Box 2D/3D** | Object bounds | Object detection training |
| **Normals** | Surface normals | 3D reconstruction |

## RGB Camera Implementation

### Basic RGB Camera

```python
# rgb_camera_basic.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.sensor import Camera
import numpy as np
import omni.replicator.core as rep

world = World()
world.scene.add_default_ground_plane()

# Load robot for context
add_reference_to_stage(
    usd_path="/Isaac/Robots/Carter/carter_v1.usd",
    prim_path="/World/Carter"
)

# Create RGB camera
camera = Camera(
    prim_path="/World/Camera",
    position=np.array([3.0, 3.0, 2.0]),
    frequency=30,  # 30 Hz capture rate
    resolution=(1280, 720),  # HD resolution
    orientation=np.array([1, 0, 0, 0]),  # Quaternion (identity)
)

# Set camera to look at origin
camera.set_focal_length(24.0)  # 24mm lens
camera.set_focus_distance(5.0)  # Focus at 5 meters
camera.set_f_stop(1.8)  # Wide aperture for depth of field

world.scene.add(camera)
world.reset()

print("✓ RGB Camera configured")
print(f"  Resolution: {camera.get_resolution()}")
print(f"  Focal length: {camera.get_focal_length()}mm")
print(f"  Frequency: {camera.get_frequency()}Hz")

# Capture and display images
for i in range(300):
    world.step(render=True)

    if i % 30 == 0:  # Capture every 30 frames
        # Get camera data
        rgb_data = camera.get_rgba()  # RGBA array

        if rgb_data is not None:
            print(f"\nFrame {i}:")
            print(f"  Shape: {rgb_data.shape}")
            print(f"  Data type: {rgb_data.dtype}")
            print(f"  Range: [{rgb_data.min()}, {rgb_data.max()}]")

            # Save image (requires PIL/OpenCV)
            # from PIL import Image
            # img = Image.fromarray(rgb_data[:,:,:3])
            # img.save(f"/tmp/rgb_frame_{i}.png")

simulation_app.close()
```

### Camera with Intrinsics Configuration

```python
# camera_intrinsics.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from pxr import Gf
import numpy as np
import omni.usd

world = World()
stage = omni.usd.get_context().get_stage()

# Create camera
camera = Camera(
    prim_path="/World/ConfiguredCamera",
    position=np.array([5.0, 0.0, 2.0]),
    resolution=(1920, 1080)
)

# Configure intrinsic parameters
camera.set_focal_length(50.0)  # 50mm focal length
camera.set_horizontal_aperture(20.955)  # Sensor width in mm (full-frame)
camera.set_vertical_aperture(11.787)   # Sensor height in mm

# Get computed intrinsic matrix
intrinsics = camera.get_intrinsics_matrix()

print("Camera Intrinsics Matrix (K):")
print(intrinsics)
print("\nParameters:")
print(f"  fx: {intrinsics[0, 0]:.2f}")
print(f"  fy: {intrinsics[1, 1]:.2f}")
print(f"  cx: {intrinsics[0, 2]:.2f}")
print(f"  cy: {intrinsics[1, 2]:.2f}")

# Calculate field of view
import math
fov_x = 2 * math.atan(camera.get_horizontal_aperture() / (2 * camera.get_focal_length()))
fov_x_deg = math.degrees(fov_x)
print(f"\nHorizontal FOV: {fov_x_deg:.2f}°")

simulation_app.close()
```

## Depth Camera

### Depth Sensor Configuration

```python
# depth_camera.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.core.objects import DynamicCuboid
import numpy as np
import matplotlib.pyplot as plt

world = World()
world.scene.add_default_ground_plane()

# Add objects at various depths
for i in range(5):
    cube = DynamicCuboid(
        prim_path=f"/World/Cube_{i}",
        position=np.array([2.0 + i * 1.0, 0, 0.5]),
        size=0.5,
        color=np.random.rand(3)
    )
    world.scene.add(cube)

# Create camera with depth output
camera = Camera(
    prim_path="/World/DepthCamera",
    position=np.array([0.0, 0.0, 1.5]),
    resolution=(640, 480)
)

# Initialize depth sensor
camera.initialize()

world.scene.add(camera)
world.reset()

print("✓ Depth camera configured")

# Capture depth data
for i in range(150):
    world.step(render=True)

    if i == 100:  # Capture after scene settles
        # Get depth data (distance in meters)
        depth_data = camera.get_depth()

        if depth_data is not None:
            print(f"\nDepth Data:")
            print(f"  Shape: {depth_data.shape}")
            print(f"  Min depth: {depth_data.min():.2f}m")
            print(f"  Max depth: {depth_data.max():.2f}m")
            print(f"  Mean depth: {depth_data.mean():.2f}m")

            # Visualize depth map
            # plt.figure(figsize=(10, 6))
            # plt.imshow(depth_data, cmap='viridis')
            # plt.colorbar(label='Depth (m)')
            # plt.title('Depth Map')
            # plt.savefig('/tmp/depth_map.png')
            # print("✓ Depth map saved to /tmp/depth_map.png")

simulation_app.close()
```

### Point Cloud Generation from Depth

```python
# depth_to_pointcloud.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.core.utils.stage import add_reference_to_stage
import numpy as np

world = World()

# Load scene
add_reference_to_stage(
    usd_path="/Isaac/Environments/Simple_Room/simple_room.usd",
    prim_path="/World/Room"
)

# Create camera
camera = Camera(
    prim_path="/World/PointCloudCamera",
    position=np.array([2.0, 0.0, 1.5]),
    resolution=(640, 480)
)

world.scene.add(camera)
world.reset()

# Capture and convert to point cloud
world.step(render=True)
for _ in range(50):
    world.step(render=True)

# Get depth and RGB
depth = camera.get_depth()
rgb = camera.get_rgba()

if depth is not None and rgb is not None:
    # Get camera intrinsics
    intrinsics = camera.get_intrinsics_matrix()
    fx, fy = intrinsics[0, 0], intrinsics[1, 1]
    cx, cy = intrinsics[0, 2], intrinsics[1, 2]

    # Generate point cloud
    h, w = depth.shape
    points = []
    colors = []

    for v in range(h):
        for u in range(w):
            z = depth[v, u]
            if z > 0 and z < 10.0:  # Valid depth range
                # Back-project to 3D
                x = (u - cx) * z / fx
                y = (v - cy) * z / fy

                points.append([x, y, z])
                colors.append(rgb[v, u, :3] / 255.0)

    points = np.array(points)
    colors = np.array(colors)

    print(f"✓ Point cloud generated: {points.shape[0]} points")

    # Save as PLY file
    # import open3d as o3d
    # pcd = o3d.geometry.PointCloud()
    # pcd.points = o3d.utility.Vector3dVector(points)
    # pcd.colors = o3d.utility.Vector3dVector(colors)
    # o3d.io.write_point_cloud("/tmp/scene.ply", pcd)
    # print("✓ Saved to /tmp/scene.ply")

simulation_app.close()
```

## Stereo Camera System

### Stereo Pair Configuration

```python
# stereo_camera.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from pxr import Gf
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Stereo baseline (distance between cameras)
baseline = 0.12  # 12 cm (typical stereo rig)

# Left camera
camera_left = Camera(
    prim_path="/World/StereoRig/CameraLeft",
    position=np.array([0.0, -baseline/2, 1.5]),
    resolution=(1280, 720)
)

# Right camera
camera_right = Camera(
    prim_path="/World/StereoRig/CameraRight",
    position=np.array([0.0, baseline/2, 1.5]),
    resolution=(1280, 720)
)

# Ensure identical intrinsics
focal_length = 28.0
for cam in [camera_left, camera_right]:
    cam.set_focal_length(focal_length)
    cam.set_horizontal_aperture(20.955)
    cam.set_vertical_aperture(11.787)

world.scene.add(camera_left)
world.scene.add(camera_right)
world.reset()

print("✓ Stereo camera pair configured")
print(f"  Baseline: {baseline * 1000:.1f}mm")
print(f"  Resolution: {camera_left.get_resolution()}")
print(f"  Focal length: {focal_length}mm")

# Capture stereo pair
for i in range(100):
    world.step(render=True)

    if i == 50:
        left_img = camera_left.get_rgba()
        right_img = camera_right.get_rgba()

        if left_img is not None and right_img is not None:
            print("\n✓ Stereo pair captured")
            print(f"  Left shape: {left_img.shape}")
            print(f"  Right shape: {right_img.shape}")

            # Stereo matching (requires OpenCV)
            # import cv2
            # stereo = cv2.StereoBM_create(numDisparities=16*5, blockSize=15)
            # disparity = stereo.compute(left_gray, right_gray)
            # depth = (baseline * focal_length) / disparity

simulation_app.close()
```

## Semantic Segmentation

### Semantic Segmentation Camera

```python
# semantic_segmentation.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
import omni.replicator.core as rep
import omni.usd

world = World()

# Load scene with semantic labels
add_reference_to_stage(
    usd_path="/Isaac/Environments/Simple_Warehouse/warehouse.usd",
    prim_path="/World/Warehouse"
)

stage = omni.usd.get_context().get_stage()

# Apply semantic labels to objects
from pxr import Semantics

# Label ground
ground_prim = stage.GetPrimAtPath("/World/Warehouse/Ground")
if ground_prim.IsValid():
    sem_api = Semantics.SemanticsAPI.Apply(ground_prim, "Semantics")
    sem_api.CreateSemanticTypeAttr("class")
    sem_api.CreateSemanticDataAttr("floor")

# Label walls
walls_prim = stage.GetPrimAtPath("/World/Warehouse/Walls")
if walls_prim.IsValid():
    sem_api = Semantics.SemanticsAPI.Apply(walls_prim, "Semantics")
    sem_api.CreateSemanticTypeAttr("class")
    sem_api.CreateSemanticDataAttr("wall")

print("✓ Semantic labels applied")

# Create render product with semantic segmentation
camera_path = "/World/SemanticCamera"

# Use Replicator to create camera with semantic output
camera = rep.create.camera(
    position=(5.0, 5.0, 3.0),
    look_at=(0, 0, 0)
)

# Attach semantic segmentation writer
render_product = rep.create.render_product(camera, resolution=(1280, 720))

# Enable semantic segmentation
writer = rep.WriterRegistry.get("BasicWriter")
writer.initialize(
    output_dir="/tmp/semantic_data",
    semantic_types=["class"],
    colorize_semantic_segmentation=True
)
writer.attach([render_product])

print("✓ Semantic segmentation configured")
print("  Output: /tmp/semantic_data/")

world.reset()

# Capture semantic data
for i in range(100):
    world.step(render=True)
    rep.orchestrator.step()

    if i % 30 == 0:
        print(f"  Frame {i} captured")

simulation_app.close()
```

## Instance Segmentation

```python
# instance_segmentation.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
import omni.replicator.core as rep
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Create multiple instances
for i in range(10):
    cube = DynamicCuboid(
        prim_path=f"/World/Cube_{i}",
        position=np.array([
            np.random.uniform(-2, 2),
            np.random.uniform(-2, 2),
            2.0 + i * 0.5
        ]),
        size=0.3,
        color=np.random.rand(3)
    )
    world.scene.add(cube)

# Camera for instance segmentation
camera = rep.create.camera(position=(5.0, 5.0, 8.0))
render_product = rep.create.render_product(camera, resolution=(1024, 1024))

# Instance segmentation writer
writer = rep.WriterRegistry.get("BasicWriter")
writer.initialize(
    output_dir="/tmp/instance_data",
    rgb=True,
    instance_segmentation=True,
    colorize_instance_segmentation=True
)
writer.attach([render_product])

print("✓ Instance segmentation configured")

world.reset()

for i in range(150):
    world.step(render=True)
    rep.orchestrator.step()

print("✓ Instance data captured to /tmp/instance_data/")

simulation_app.close()
```

## 2D/3D Bounding Boxes

```python
# bounding_boxes.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
import omni.replicator.core as rep

world = World()

# Load objects
add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka.usd",
    prim_path="/World/Franka"
)

# Camera
camera = rep.create.camera(position=(3.0, 3.0, 2.0), look_at=(0, 0, 0.5))
render_product = rep.create.render_product(camera, resolution=(1280, 720))

# Bounding box annotator
writer = rep.WriterRegistry.get("BasicWriter")
writer.initialize(
    output_dir="/tmp/bbox_data",
    rgb=True,
    bounding_box_2d_tight=True,
    bounding_box_2d_loose=True,
    bounding_box_3d=True,
)
writer.attach([render_product])

print("✓ Bounding box annotation configured")

world.reset()

for i in range(100):
    world.step(render=True)
    rep.orchestrator.step()

print("✓ Bounding box data saved to /tmp/bbox_data/")

simulation_app.close()
```

## Multi-Camera System

```python
# multi_camera_system.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Create multi-camera rig
camera_configs = [
    {"name": "Front", "position": [3, 0, 1.5], "orientation": [0, 0, 180]},
    {"name": "Left", "position": [0, 3, 1.5], "orientation": [0, 0, -90]},
    {"name": "Right", "position": [0, -3, 1.5], "orientation": [0, 0, 90]},
    {"name": "Top", "position": [0, 0, 5], "orientation": [-90, 0, 0]},
]

cameras = {}

for config in camera_configs:
    camera = Camera(
        prim_path=f"/World/CameraRig/{config['name']}",
        position=np.array(config["position"]),
        resolution=(640, 480),
        frequency=20
    )
    world.scene.add(camera)
    cameras[config["name"]] = camera

print(f"✓ {len(cameras)} cameras configured")

world.reset()

for i in range(100):
    world.step(render=True)

    if i == 50:
        for name, camera in cameras.items():
            rgb = camera.get_rgba()
            if rgb is not None:
                print(f"  {name}: {rgb.shape}")

simulation_app.close()
```

## Hands-On Exercises

### Exercise 1: Create Synthetic Dataset

Generate training dataset with RGB, depth, and segmentation:

```python
# exercise1_dataset_generation.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": True})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
import omni.replicator.core as rep
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Randomize scene
for episode in range(10):
    # Clear previous objects
    # ... (implement clearing logic)

    # Create random objects
    for i in range(np.random.randint(5, 15)):
        cube = DynamicCuboid(
            prim_path=f"/World/Episode_{episode}/Cube_{i}",
            position=np.random.uniform([-2, -2, 0.5], [2, 2, 3]),
            size=np.random.uniform(0.1, 0.5),
            color=np.random.rand(3)
        )
        world.scene.add(cube)

    # Camera with randomized position
    camera_pos = np.random.uniform([2, -3, 1], [5, 3, 4])
    camera = rep.create.camera(position=tuple(camera_pos))
    rp = rep.create.render_product(camera, resolution=(512, 512))

    # Multi-modal writer
    writer = rep.WriterRegistry.get("BasicWriter")
    writer.initialize(
        output_dir=f"/tmp/dataset/episode_{episode}",
        rgb=True,
        depth=True,
        semantic_segmentation=True,
        instance_segmentation=True,
        bounding_box_2d_tight=True
    )
    writer.attach([rp])

    world.reset()

    for i in range(50):
        world.step(render=True)
        rep.orchestrator.step()

    print(f"✓ Episode {episode} complete")

print("✓ Dataset generation complete!")

simulation_app.close()
```

## Summary

You've mastered:
- ✓ RGB, depth, and stereo camera configuration
- ✓ Semantic and instance segmentation
- ✓ Bounding box annotation (2D/3D)
- ✓ Multi-camera systems
- ✓ Synthetic data generation for ML

## Next Steps

Continue to [Python Scripting for Automation](./07-scripting-python.md) to learn advanced scripting techniques.

## Additional Resources

- [Isaac Sim Sensors Documentation](https://docs.omniverse.nvidia.com/isaacsim/latest/features/sensors_simulation.html)
- [Replicator Documentation](https://docs.omniverse.nvidia.com/extensions/latest/ext_replicator.html)
- [Synthetic Data Generation Guide](https://docs.omniverse.nvidia.com/isaacsim/latest/advanced_tutorials/tutorial_advanced_replicator.html)
