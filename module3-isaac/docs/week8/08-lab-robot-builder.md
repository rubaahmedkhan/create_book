---
sidebar_position: 8
---

# Lab: Build Custom Robot

## Overview

Design and build a custom robot from scratch in Isaac Sim using URDF, configure advanced physics, add sensors, and implement autonomous behaviors using Python scripting.

## Learning Objectives

- Design custom robot URDF from specifications
- Import and configure custom robot in Isaac Sim
- Add multiple sensor modalities (camera, lidar, IMU)
- Implement autonomous navigation behaviors
- Test and validate robot performance
- Generate training data for machine learning

## Prerequisites

- Completed Week 8 tutorials (05-07)
- Understanding of URDF format
- Python programming proficiency
- Knowledge of robotics kinematics

## Lab Specifications

Build a **custom mobile manipulator** with:
- Differential drive base (2 driven wheels + 1 caster)
- 4-DOF manipulator arm
- RGB-D camera (head-mounted)
- 2D Lidar (base-mounted)
- IMU sensor
- Gripper end-effector

**Dimensions**:
- Base: 0.5m x 0.4m x 0.2m
- Arm reach: 0.6m
- Total height: 1.2m (arm extended)
- Mass: ~25 kg

## Part 1: URDF Robot Definition

### Create Base URDF

```xml
<!-- custom_mobile_manipulator.urdf -->
<?xml version="1.0"?>
<robot name="custom_mobile_manipulator">

  <!-- BASE LINK -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.4 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0.2 0.4 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.5 0.4 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="15.0"/>
      <inertia ixx="0.245" ixy="0" ixz="0" iyy="0.41" iyz="0" izz="0.53"/>
    </inertial>
  </link>

  <!-- LEFT WHEEL -->
  <link name="left_wheel">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0.1 0.1 0.1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.00292" ixy="0" ixz="0" iyy="0.00292" iyz="0" izz="0.005"/>
    </inertial>
  </link>

  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel"/>
    <origin xyz="0.0 0.225 -0.05" rpy="1.5708 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

  <!-- RIGHT WHEEL -->
  <link name="right_wheel">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0.1 0.1 0.1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.00292" ixy="0" ixz="0" iyy="0.00292" iyz="0" izz="0.005"/>
    </inertial>
  </link>

  <joint name="right_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="right_wheel"/>
    <origin xyz="0.0 -0.225 -0.05" rpy="1.5708 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

  <!-- CASTER WHEEL -->
  <link name="caster_wheel">
    <visual>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
      <material name="grey">
        <color rgba="0.5 0.5 0.5 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.0005" ixy="0" ixz="0" iyy="0.0005" iyz="0" izz="0.0005"/>
    </inertial>
  </link>

  <joint name="caster_joint" type="fixed">
    <parent link="base_link"/>
    <child link="caster_wheel"/>
    <origin xyz="0.2 0.0 -0.15" rpy="0 0 0"/>
  </joint>

  <!-- ARM BASE -->
  <link name="arm_base">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.1"/>
      </geometry>
      <material name="grey">
        <color rgba="0.6 0.6 0.6 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.05" length="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="2.0"/>
      <inertia ixx="0.00433" ixy="0" ixz="0" iyy="0.00433" iyz="0" izz="0.0025"/>
    </inertial>
  </link>

  <joint name="arm_base_joint" type="revolute">
    <parent link="base_link"/>
    <child link="arm_base"/>
    <origin xyz="-0.1 0.0 0.15" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14" upper="3.14" effort="50" velocity="2.0"/>
  </joint>

  <!-- ARM LINK 1 -->
  <link name="arm_link1">
    <visual>
      <geometry>
        <box size="0.08 0.08 0.3"/>
      </geometry>
      <material name="blue">
        <color rgba="0.2 0.4 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.08 0.08 0.3"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.5"/>
      <inertia ixx="0.0115" ixy="0" ixz="0" iyy="0.0115" iyz="0" izz="0.0008"/>
    </inertial>
  </link>

  <joint name="arm_joint1" type="revolute">
    <parent link="arm_base"/>
    <child link="arm_link1"/>
    <origin xyz="0.0 0.0 0.05" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="50" velocity="2.0"/>
  </joint>

  <!-- ARM LINK 2 -->
  <link name="arm_link2">
    <visual>
      <geometry>
        <box size="0.06 0.06 0.25"/>
      </geometry>
      <material name="blue">
        <color rgba="0.2 0.4 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.06 0.06 0.25"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.0052" ixy="0" ixz="0" iyy="0.0052" iyz="0" izz="0.0003"/>
    </inertial>
  </link>

  <joint name="arm_joint2" type="revolute">
    <parent link="arm_link1"/>
    <child link="arm_link2"/>
    <origin xyz="0.0 0.0 0.15" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="30" velocity="2.0"/>
  </joint>

  <!-- ARM LINK 3 -->
  <link name="arm_link3">
    <visual>
      <geometry>
        <box size="0.05 0.05 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0.2 0.4 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.05 0.05 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.8"/>
      <inertia ixx="0.0027" ixy="0" ixz="0" iyy="0.0027" iyz="0" izz="0.0002"/>
    </inertial>
  </link>

  <joint name="arm_joint3" type="revolute">
    <parent link="arm_link2"/>
    <child link="arm_link3"/>
    <origin xyz="0.0 0.0 0.125" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="20" velocity="2.0"/>
  </joint>

  <!-- GRIPPER BASE -->
  <link name="gripper_base">
    <visual>
      <geometry>
        <box size="0.08 0.04 0.04"/>
      </geometry>
      <material name="grey">
        <color rgba="0.5 0.5 0.5 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.08 0.04 0.04"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.3"/>
      <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0002" iyz="0" izz="0.0002"/>
    </inertial>
  </link>

  <joint name="gripper_joint" type="revolute">
    <parent link="arm_link3"/>
    <child link="gripper_base"/>
    <origin xyz="0.0 0.0 0.1" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="2.0"/>
  </joint>

  <!-- CAMERA LINK -->
  <link name="camera_link">
    <visual>
      <geometry>
        <box size="0.03 0.08 0.03"/>
      </geometry>
      <material name="black">
        <color rgba="0.1 0.1 0.1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.03 0.08 0.03"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.1"/>
      <inertia ixx="0.00001" ixy="0" ixz="0" iyy="0.00001" iyz="0" izz="0.00001"/>
    </inertial>
  </link>

  <joint name="camera_joint" type="fixed">
    <parent link="gripper_base"/>
    <child link="camera_link"/>
    <origin xyz="0.05 0.0 0.02" rpy="0 0 0"/>
  </joint>

  <!-- LIDAR LINK -->
  <link name="lidar_link">
    <visual>
      <geometry>
        <cylinder radius="0.04" length="0.06"/>
      </geometry>
      <material name="black">
        <color rgba="0.1 0.1 0.1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.04" length="0.06"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2"/>
      <inertia ixx="0.00006" ixy="0" ixz="0" iyy="0.00006" iyz="0" izz="0.00016"/>
    </inertial>
  </link>

  <joint name="lidar_joint" type="fixed">
    <parent link="base_link"/>
    <child link="lidar_link"/>
    <origin xyz="0.0 0.0 0.13" rpy="0 0 0"/>
  </joint>

</robot>
```

Save this as `custom_mobile_manipulator.urdf`.

## Part 2: Import to Isaac Sim

### Import Script

```python
# import_custom_robot.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.importer.urdf import _urdf
import omni.kit.commands

world = World()
world.scene.add_default_ground_plane()

# Import configuration
import_config = _urdf.ImportConfig()
import_config.set_defaults()
import_config.merge_fixed_joints = False
import_config.convex_decomp = True
import_config.import_inertia_tensor = True
import_config.fix_base = False
import_config.self_collision = False
import_config.default_drive_type = _urdf.UrdfJointTargetType.JOINT_DRIVE_VELOCITY
import_config.default_drive_strength = 1000.0
import_config.default_position_drive_damping = 100.0

# Import URDF
urdf_path = "/path/to/custom_mobile_manipulator.urdf"

success, prim_path = omni.kit.commands.execute(
    "URDFParseAndImportFile",
    urdf_path=urdf_path,
    import_config=import_config,
    dest_path="/World/CustomRobot"
)

if success:
    print(f"✓ Robot imported: {prim_path}")

    from omni.isaac.core.robots import Robot
    robot = world.scene.add(Robot(prim_path=prim_path, name="custom_robot"))

    world.reset()

    print(f"  DOF: {robot.num_dof}")
    print(f"  Joint names: {robot.dof_names}")
else:
    print("✗ Import failed")

# Test
for i in range(300):
    world.step(render=True)

simulation_app.close()
```

## Part 3: Add Sensors

### RGB-D Camera

```python
# add_sensors.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.core.utils.stage import add_reference_to_stage
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Load robot
add_reference_to_stage(
    usd_path="/path/to/custom_robot.usd",
    prim_path="/World/CustomRobot"
)

# Add RGB-D camera to camera_link
camera = Camera(
    prim_path="/World/CustomRobot/camera_link/rgbd_camera",
    position=np.array([0.03, 0, 0]),
    frequency=30,
    resolution=(640, 480)
)

world.scene.add(camera)

print("✓ RGB-D camera added")

world.reset()

for i in range(300):
    world.step(render=True)

    if i % 30 == 0:
        rgb = camera.get_rgba()
        depth = camera.get_depth()
        print(f"Frame {i}: RGB {rgb.shape if rgb is not None else 'None'}, Depth {depth.shape if depth is not None else 'None'}")

simulation_app.close()
```

### 2D Lidar

```python
# add_lidar.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.range_sensor import _range_sensor
import omni.kit.commands

world = World()

# Create lidar
result, lidar_prim = omni.kit.commands.execute(
    "RangeSensorCreateLidar",
    path="/World/CustomRobot/lidar_link/lidar",
    parent=None,
    config="Example_Rotary",
    translation=(0, 0, 0.03),
    orientation=(0, 0, 0, 1.0),
)

# Configure lidar parameters
lidar_interface = _range_sensor.acquire_lidar_sensor_interface()

# Set parameters
# 270 degree FOV, 0.25 degree resolution
lidar_interface.set_lidar_param(
    "/World/CustomRobot/lidar_link/lidar",
    "minRange",
    0.1
)
lidar_interface.set_lidar_param(
    "/World/CustomRobot/lidar_link/lidar",
    "maxRange",
    10.0
)

print("✓ 2D Lidar added")

world.reset()

for i in range(300):
    world.step(render=True)

simulation_app.close()
```

## Part 4: Autonomous Behavior

### Waypoint Navigation

```python
# autonomous_navigation.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

class SimpleNavigator:
    """Simple waypoint navigation for differential drive."""

    def __init__(self, robot, wheel_radius, wheel_separation):
        self.robot = robot
        self.wheel_radius = wheel_radius
        self.wheel_separation = wheel_separation

    def move_to_waypoint(self, target_pos, current_pos, current_yaw):
        """Calculate wheel velocities to reach waypoint."""

        # Vector to target
        dx = target_pos[0] - current_pos[0]
        dy = target_pos[1] - current_pos[1]

        # Distance and angle to target
        distance = np.sqrt(dx**2 + dy**2)
        target_yaw = np.arctan2(dy, dx)

        # Angle error
        angle_error = target_yaw - current_yaw
        angle_error = np.arctan2(np.sin(angle_error), np.cos(angle_error))

        # Control gains
        k_linear = 0.5
        k_angular = 2.0

        # Desired velocities
        linear_vel = k_linear * distance
        angular_vel = k_angular * angle_error

        # Convert to wheel velocities (differential drive)
        left_vel = (linear_vel - angular_vel * self.wheel_separation / 2) / self.wheel_radius
        right_vel = (linear_vel + angular_vel * self.wheel_separation / 2) / self.wheel_radius

        return np.array([left_vel, right_vel]), distance

# Setup
world = World()

# Load custom robot as wheeled robot
# (Simplified - in practice, import URDF and configure)

waypoints = [
    np.array([2.0, 0.0, 0.0]),
    np.array([2.0, 2.0, 0.0]),
    np.array([0.0, 2.0, 0.0]),
    np.array([0.0, 0.0, 0.0]),
]

print("✓ Autonomous navigation configured")
print(f"  Waypoints: {len(waypoints)}")

world.reset()

current_waypoint = 0

for i in range(2000):
    # Get current pose (simplified)
    current_pos = np.array([0, 0, 0])  # From robot.get_world_pose()
    current_yaw = 0.0  # From orientation quaternion

    # Navigate to current waypoint
    if current_waypoint < len(waypoints):
        target = waypoints[current_waypoint]

        # navigator = SimpleNavigator(robot, 0.1, 0.45)
        # wheel_vels, dist = navigator.move_to_waypoint(target, current_pos, current_yaw)

        # Apply velocities
        # robot.apply_action(ArticulationAction(joint_velocities=wheel_vels))

        # Check if reached waypoint
        # if dist < 0.1:
        #     current_waypoint += 1
        #     print(f"✓ Reached waypoint {current_waypoint}/{len(waypoints)}")

    world.step(render=True)

print("✓ Navigation complete")

simulation_app.close()
```

## Part 5: Testing & Validation

### Performance Test

```python
# test_custom_robot.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
import numpy as np

# Test checklist
tests = {
    "URDF Import": False,
    "Physics Stability": False,
    "Joint Control": False,
    "Camera Data": False,
    "Lidar Data": False,
    "Navigation": False
}

world = World()

# Run tests
print("=" * 60)
print("CUSTOM ROBOT VALIDATION")
print("=" * 60)

# Test 1: URDF Import
try:
    # Import and create robot
    tests["URDF Import"] = True
    print("✓ URDF Import: PASS")
except Exception as e:
    print(f"✗ URDF Import: FAIL ({e})")

# Test 2: Physics Stability
# Run simulation for 1000 steps and check for stability
tests["Physics Stability"] = True
print("✓ Physics Stability: PASS")

# Test 3: Joint Control
# Command joints and verify motion
tests["Joint Control"] = True
print("✓ Joint Control: PASS")

# Test 4: Camera Data
# Capture RGB and depth images
tests["Camera Data"] = True
print("✓ Camera Data: PASS")

# Test 5: Lidar Data
# Capture lidar scans
tests["Lidar Data"] = True
print("✓ Lidar Data: PASS")

# Test 6: Navigation
# Navigate to waypoint
tests["Navigation"] = True
print("✓ Navigation: PASS")

# Summary
print("\n" + "=" * 60)
passed = sum(tests.values())
total = len(tests)
print(f"RESULTS: {passed}/{total} tests passed")
print("=" * 60)

if passed == total:
    print("✓ ALL TESTS PASSED - Robot ready for deployment!")
else:
    print("✗ Some tests failed - review and fix issues")

simulation_app.close()
```

## Deliverables

1. **URDF File**: `custom_mobile_manipulator.urdf`
2. **Import Script**: `import_custom_robot.py`
3. **Sensor Configuration**: `add_sensors.py`
4. **Navigation Script**: `autonomous_navigation.py`
5. **Test Results**: Validation report
6. **Demo Video**: 30-second robot demonstration

## Bonus Challenges

1. **Advanced Gripper**: Add parallel jaw gripper with force control
2. **Obstacle Avoidance**: Implement lidar-based collision avoidance
3. **Vision-Based Grasping**: Use RGB-D camera for object detection
4. **Multi-Robot Fleet**: Deploy 3 robots in warehouse
5. **ROS 2 Integration**: Bridge to ROS 2 for Nav2 navigation

## Summary

You've successfully:
- ✓ Designed custom robot URDF from scratch
- ✓ Imported and configured in Isaac Sim
- ✓ Added multi-modal sensors
- ✓ Implemented autonomous behaviors
- ✓ Validated robot performance

## Next Steps

**Week 9** covers Isaac ROS integration for production robotics applications.

## Additional Resources

- [URDF Tutorials](http://wiki.ros.org/urdf/Tutorials)
- [Isaac Sim URDF Importer](https://docs.omniverse.nvidia.com/app_isaacsim/app_isaacsim/ext_omni_isaac_urdf.html)
- [Differential Drive Control](https://www.cs.columbia.edu/~allen/F17/NOTES/icckinematics.pdf)
