---
sidebar_position: 2
---

# Creating Your First Robot Simulation

## Overview

This tutorial guides you through creating your first robot simulation in Isaac Sim. You'll learn to load robot models, configure physics, add basic controls, and run simulations using both the GUI and Python API.

## Learning Objectives

- Load pre-built robot models from Isaac Sim library
- Understand USD (Universal Scene Description) format
- Configure physics properties and articulation
- Implement basic robot control via Python
- Record and analyze simulation data
- Debug and visualize robot behavior

## Prerequisites

- Completed [Isaac Sim Installation and Setup](./01-isaac-sim-setup.md)
- Basic understanding of robotics concepts (joints, links, actuators)
- Familiarity with Python (for scripting sections)
- Understanding of coordinate systems and transforms

## Understanding USD and Isaac Sim Scene Structure

### What is USD?

Universal Scene Description (USD) is Pixar's open-source 3D scene description format, used by Isaac Sim for all scene data.

**Key concepts**:
- **Prim**: Primitive object (mesh, robot, light, etc.)
- **Stage**: Container for all scene data
- **Layer**: Composable scene modifications
- **Attribute**: Properties of a prim (position, color, mass)

```python
# Basic USD structure
Stage
├── /World (Xform)
│   ├── /GroundPlane (Mesh)
│   ├── /Robot (Articulation)
│   │   ├── /base_link (RigidBody)
│   │   ├── /link1 (RigidBody)
│   │   └── /link2 (RigidBody)
│   └── /Camera (Camera)
└── /Environment
    ├── /DistantLight
    └── /DomeLight
```

## Method 1: GUI-Based Robot Loading

### Step 1: Launch Isaac Sim and Create New Scene

```bash
# Launch Isaac Sim
cd $ISAAC_SIM_PATH
./isaac-sim.sh
```

1. **File** → **New** (Ctrl+N)
2. **Create** → **Physics** → **Ground Plane**
3. Set Units: **Edit** → **Preferences** → **Stage** → **Meters per unit: 1.0**

### Step 2: Load a Pre-built Robot

Isaac Sim includes several pre-built robots:

1. **Open Asset Browser**: **Content** tab (bottom panel)
2. Navigate to: `Isaac/Robots/`

Available robots:
- `Carter/` - Differential drive mobile robot
- `Franka/` - 7-DOF manipulator arm
- `Jetbot/` - Small wheeled robot
- `Ant/` - Quadruped robot
- `Humanoid/` - Bipedal humanoid

**Load Franka robot**:
1. Navigate to `Isaac/Robots/Franka/`
2. Drag `franka_alt_fingers.usd` into viewport
3. Robot appears at origin (0, 0, 0)

### Step 3: Position and Configure Robot

**Adjust robot position**:
1. Select robot in viewport or **Stage** panel
2. In **Property** panel:
   - **Transform** → **Translate**: [0, 0, 0]
   - **Transform** → **Rotate**: [0, 0, 0]
   - **Transform** → **Scale**: [1, 1, 1]

**Verify physics**:
1. Select robot → **Property** panel
2. Expand **Physics** section
3. Verify **ArticulationRoot API** is present
4. Check **RigidBody API** on each link

### Step 4: Add Basic Scene Elements

**Add lighting**:
```
Create → Light → Distant Light
- Intensity: 3000
- Position: [0, 0, 10]
- Rotation: [45, 0, 0]
```

**Add target object**:
```
Create → Mesh → Cube
- Position: [0.5, 0, 0.05]
- Scale: [0.05, 0.05, 0.05]
- Add Physics → RigidBody → Dynamic
```

### Step 5: Run Basic Simulation

1. Press **Play** (Spacebar) to start physics
2. Robot should remain stable under gravity
3. Cube falls to ground plane
4. Press **Stop** to reset

## Method 2: Python API Robot Loading

### Basic Robot Loading Script

Create `~/isaac-projects/load_robot.py`:

```python
from isaacsim import SimulationApp

# Launch Isaac Sim
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
import numpy as np

# Create world
world = World(stage_units_in_meters=1.0)
world.scene.add_default_ground_plane()

# Load Franka robot
robot_usd_path = "/Isaac/Robots/Franka/franka_alt_fingers.usd"
robot_prim_path = "/World/Franka"

add_reference_to_stage(usd_path=robot_usd_path, prim_path=robot_prim_path)

# Create Robot object
franka = Robot(
    prim_path=robot_prim_path,
    name="franka_robot"
)

# Add to scene
world.scene.add(franka)

# Reset world to initialize physics
world.reset()

print(f"Robot loaded: {franka.name}")
print(f"Number of DOF: {franka.num_dof}")
print(f"Joint names: {franka.dof_names}")

# Run simulation
for i in range(500):
    world.step(render=True)
    if i % 100 == 0:
        print(f"Simulation step: {i}")

simulation_app.close()
```

Run the script:
```bash
$ISAAC_SIM_PATH/python.sh ~/isaac-projects/load_robot.py
```

### Loading Different Robots

```python
# Carter mobile robot
from omni.isaac.wheeled_robots.robots import WheeledRobot

carter_usd_path = "/Isaac/Robots/Carter/carter_v1.usd"
carter = WheeledRobot(
    prim_path="/World/Carter",
    name="carter",
    usd_path=carter_usd_path,
    position=np.array([0, 0, 0])
)

# Jetbot
jetbot_usd_path = "/Isaac/Robots/Jetbot/jetbot.usd"
add_reference_to_stage(usd_path=jetbot_usd_path, prim_path="/World/Jetbot")
```

## Robot Control Basics

### Understanding Robot Articulation

```python
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Load robot
add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka"
)

franka = world.scene.add(Robot(prim_path="/World/Franka", name="franka"))
world.reset()

# Get robot information
print("=" * 50)
print("ROBOT INFORMATION")
print("=" * 50)
print(f"DOF: {franka.num_dof}")
print(f"Joint names: {franka.dof_names}")
print(f"DOF properties: {franka.dof_properties}")

# Get current joint positions
joint_positions = franka.get_joint_positions()
print(f"\nCurrent joint positions:\n{joint_positions}")

# Get current joint velocities
joint_velocities = franka.get_joint_velocities()
print(f"\nCurrent joint velocities:\n{joint_velocities}")

simulation_app.close()
```

### Position Control

```python
# position_control.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

world = World()
world.scene.add_default_ground_plane()

add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka"
)

franka = world.scene.add(Robot(prim_path="/World/Franka", name="franka"))
world.reset()

# Define target positions (radians)
# Franka has 9 DOF (7 arm + 2 gripper)
target_positions = np.array([
    0.0,      # Joint 1
    -0.785,   # Joint 2
    0.0,      # Joint 3
    -2.356,   # Joint 4
    0.0,      # Joint 5
    1.571,    # Joint 6
    0.785,    # Joint 7
    0.04,     # Gripper finger 1
    0.04      # Gripper finger 2
])

print("Moving robot to target position...")

# Run simulation with position control
for i in range(1000):
    # Create articulation action
    action = ArticulationAction(joint_positions=target_positions)

    # Apply action
    franka.apply_action(action)

    # Step simulation
    world.step(render=True)

    # Print progress every 100 steps
    if i % 100 == 0:
        current_pos = franka.get_joint_positions()
        error = np.linalg.norm(target_positions - current_pos)
        print(f"Step {i}: Position error = {error:.4f}")

print("Target position reached!")
simulation_app.close()
```

### Velocity Control

```python
# velocity_control.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

world = World()
world.scene.add_default_ground_plane()

add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka"
)

franka = world.scene.add(Robot(prim_path="/World/Franka", name="franka"))
world.reset()

# Set velocity for first joint (rad/s)
target_velocity = np.zeros(9)
target_velocity[0] = 0.5  # Rotate base joint at 0.5 rad/s

print("Rotating base joint...")

for i in range(500):
    action = ArticulationAction(joint_velocities=target_velocity)
    franka.apply_action(action)
    world.step(render=True)

    if i % 100 == 0:
        current_vel = franka.get_joint_velocities()
        print(f"Step {i}: Joint 0 velocity = {current_vel[0]:.4f} rad/s")

simulation_app.close()
```

### Effort (Torque) Control

```python
# effort_control.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

world = World()
world.scene.add_default_ground_plane()

add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka"
)

franka = world.scene.add(Robot(prim_path="/World/Franka", name="franka"))
world.reset()

# Apply torque to compensate for gravity
target_efforts = np.zeros(9)
target_efforts[1] = 10.0  # Apply 10 Nm to joint 2

print("Applying torque to joint 2...")

for i in range(500):
    action = ArticulationAction(joint_efforts=target_efforts)
    franka.apply_action(action)
    world.step(render=True)

    if i % 100 == 0:
        position = franka.get_joint_positions()[1]
        print(f"Step {i}: Joint 2 position = {position:.4f} rad")

simulation_app.close()
```

## Advanced Robot Control

### Interpolated Motion

```python
# interpolated_motion.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

def interpolate_positions(start, end, steps):
    """Linear interpolation between start and end positions."""
    return np.linspace(start, end, steps)

world = World()
world.scene.add_default_ground_plane()

add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka"
)

franka = world.scene.add(Robot(prim_path="/World/Franka", name="franka"))
world.reset()

# Define waypoints
home_position = np.array([0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785, 0.04, 0.04])
target_position = np.array([1.57, -1.0, 0.5, -2.0, 0.5, 2.0, 0.0, 0.04, 0.04])

# Generate trajectory (500 steps)
num_steps = 500
trajectory = interpolate_positions(home_position, target_position, num_steps)

print("Executing smooth motion...")

for i, target in enumerate(trajectory):
    action = ArticulationAction(joint_positions=target)
    franka.apply_action(action)
    world.step(render=True)

    if i % 100 == 0:
        print(f"Progress: {i/num_steps*100:.1f}%")

print("Motion complete!")
simulation_app.close()
```

### Mobile Robot Control (Carter)

```python
# mobile_robot_control.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Load Carter mobile robot
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

print("Controlling mobile robot...")
print(f"Carter DOF: {carter.num_dof}")
print(f"Wheel joints: {carter.wheel_dof_names}")

# Drive forward
forward_velocity = np.array([5.0, 5.0])  # Both wheels forward

for i in range(300):
    action = ArticulationAction(joint_velocities=forward_velocity)
    carter.apply_action(action)
    world.step(render=True)

# Turn left
turn_left_velocity = np.array([2.0, 5.0])  # Right wheel faster

for i in range(200):
    action = ArticulationAction(joint_velocities=turn_left_velocity)
    carter.apply_action(action)
    world.step(render=True)

# Stop
stop_velocity = np.array([0.0, 0.0])

for i in range(100):
    action = ArticulationAction(joint_velocities=stop_velocity)
    carter.apply_action(action)
    world.step(render=True)

simulation_app.close()
```

## Recording and Analyzing Simulation Data

### Recording Joint Trajectories

```python
# record_trajectory.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np
import json
from datetime import datetime

world = World()
world.scene.add_default_ground_plane()

add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka"
)

franka = world.scene.add(Robot(prim_path="/World/Franka", name="franka"))
world.reset()

# Data recording structure
recording = {
    "metadata": {
        "robot": "franka",
        "timestamp": datetime.now().isoformat(),
        "dof_names": franka.dof_names
    },
    "trajectory": []
}

# Target position
target = np.array([0.5, -0.5, 0.5, -2.0, 0.5, 1.5, 0.5, 0.04, 0.04])

print("Recording trajectory...")

for i in range(500):
    action = ArticulationAction(joint_positions=target)
    franka.apply_action(action)
    world.step(render=True)

    # Record data every 10 steps
    if i % 10 == 0:
        data_point = {
            "step": i,
            "time": i * world.get_physics_dt(),
            "joint_positions": franka.get_joint_positions().tolist(),
            "joint_velocities": franka.get_joint_velocities().tolist(),
        }
        recording["trajectory"].append(data_point)

# Save to file
output_file = "/tmp/franka_trajectory.json"
with open(output_file, 'w') as f:
    json.dump(recording, f, indent=2)

print(f"Trajectory saved to: {output_file}")
print(f"Recorded {len(recording['trajectory'])} data points")

simulation_app.close()
```

### Visualization Tools

Enable built-in visualization:

```python
# In Isaac Sim GUI:
# Window → Simulation → Articulation Inspector

# Or via Python:
from omni.isaac.debug_draw import _debug_draw

# Draw coordinate frames
_debug_draw.draw_lines(
    [start_point], [end_point], [(1, 0, 0, 1)], [1]
)
```

## Hands-On Exercises

### Exercise 1: Load and Control Multiple Robots

Create a scene with two Franka robots performing synchronized motion.

```python
# exercise1_dual_robots.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Load two Franka robots
add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka_Left"
)

add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka_Right"
)

franka_left = world.scene.add(
    Robot(prim_path="/World/Franka_Left", name="franka_left", position=np.array([0, 0.5, 0]))
)

franka_right = world.scene.add(
    Robot(prim_path="/World/Franka_Right", name="franka_right", position=np.array([0, -0.5, 0]))
)

world.reset()

# Mirror motion
target_left = np.array([0.5, -0.5, 0.5, -2.0, 0.5, 1.5, 0.5, 0.04, 0.04])
target_right = np.array([-0.5, -0.5, -0.5, -2.0, -0.5, 1.5, -0.5, 0.04, 0.04])

print("Synchronized dual robot motion...")

for i in range(500):
    franka_left.apply_action(ArticulationAction(joint_positions=target_left))
    franka_right.apply_action(ArticulationAction(joint_positions=target_right))
    world.step(render=True)

simulation_app.close()
```

### Exercise 2: Create a Simple Pick-and-Place Task

```python
# exercise2_pick_place.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.objects import DynamicCuboid
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np

world = World()
world.scene.add_default_ground_plane()

# Add robot
add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka"
)
franka = world.scene.add(Robot(prim_path="/World/Franka", name="franka"))

# Add cube to pick
cube = world.scene.add(
    DynamicCuboid(
        prim_path="/World/Cube",
        name="target_cube",
        position=np.array([0.3, 0, 0.05]),
        size=0.05,
        color=np.array([1.0, 0.0, 0.0])
    )
)

world.reset()

# Define positions for pick-and-place sequence
home_pos = np.array([0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785, 0.04, 0.04])
pre_grasp_pos = np.array([0.5, -0.3, 0.3, -2.2, 0.0, 2.0, 0.785, 0.04, 0.04])
grasp_pos = np.array([0.5, -0.3, 0.3, -2.2, 0.0, 2.0, 0.785, 0.0, 0.0])  # Close gripper
place_pos = np.array([-0.5, -0.3, 0.3, -2.2, 0.0, 2.0, 0.785, 0.0, 0.0])
release_pos = np.array([-0.5, -0.3, 0.3, -2.2, 0.0, 2.0, 0.785, 0.04, 0.04])

sequence = [
    (home_pos, 200, "Moving to home"),
    (pre_grasp_pos, 300, "Moving to pre-grasp"),
    (grasp_pos, 100, "Grasping cube"),
    (place_pos, 300, "Moving to place location"),
    (release_pos, 100, "Releasing cube"),
    (home_pos, 200, "Returning home")
]

for target, steps, description in sequence:
    print(description + "...")
    for _ in range(steps):
        franka.apply_action(ArticulationAction(joint_positions=target))
        world.step(render=True)

print("Pick-and-place complete!")
simulation_app.close()
```

## Troubleshooting Common Issues

### Issue 1: Robot Falls Through Ground

**Symptoms**: Robot collapses or falls through ground plane

**Solutions**:
```python
# Verify ground plane physics
world.scene.add_default_ground_plane()

# Or manually create ground with physics:
from omni.isaac.core.objects import GroundPlane
ground = GroundPlane(
    prim_path="/World/GroundPlane",
    size=10.0,
    color=np.array([0.5, 0.5, 0.5])
)

# Check robot has ArticulationRoot
# Select robot → Property → Physics → ArticulationRoot API
# Should be present, if not: Add → ArticulationRoot
```

### Issue 2: Robot Doesn't Respond to Commands

**Symptoms**: Actions don't affect robot

**Solutions**:
```python
# Ensure world.reset() is called
world.reset()  # Initializes physics handles

# Verify robot is in scene
print(world.scene.get_object_names())

# Check articulation properties
print(franka.dof_properties)

# Ensure proper action application
action = ArticulationAction(joint_positions=target)
franka.apply_action(action)  # Not robot.apply_action()
world.step(render=True)  # Must step after applying action
```

### Issue 3: Jittery or Unstable Motion

**Symptoms**: Robot shakes or oscillates

**Solutions**:
```python
# Increase physics solver iterations
from pxr import PhysxSchema

scene_prim = stage.GetPrimAtPath("/World/PhysicsScene")
physx_scene_api = PhysxSchema.PhysxSceneAPI.Apply(scene_prim)
physx_scene_api.CreateSolverTypeAttr().Set("TGS")
physx_scene_api.GetPositionIterationCountAttr().Set(32)  # Default: 16
physx_scene_api.GetVelocityIterationCountAttr().Set(16)  # Default: 8

# Add damping to joints
for i in range(franka.num_dof):
    franka.set_joint_damping(i, 10.0)  # Adjust as needed
```

## Summary

You've successfully:
- ✓ Loaded robot models using GUI and Python API
- ✓ Implemented position, velocity, and effort control
- ✓ Created smooth interpolated motion
- ✓ Controlled mobile and manipulator robots
- ✓ Recorded and analyzed simulation data
- ✓ Built basic pick-and-place behaviors

**Key Takeaways**:
- USD format is core to Isaac Sim scene structure
- `world.reset()` is required before robot control
- Three control modes: position, velocity, effort
- Always call `world.step()` after applying actions
- Isaac Sim uses ArticulationRoot for multi-body robots

## Next Steps

Continue to [Importing and Managing Assets](./03-asset-import.md) to learn:
- Import custom robot URDF/USD files
- Convert CAD models to USD format
- Manage materials and textures
- Optimize assets for simulation performance
- Create custom robot configurations

## Additional Resources

- [Isaac Sim Robot API Documentation](https://docs.omniverse.nvidia.com/py/isaacsim/source/extensions/omni.isaac.core/docs/index.html)
- [USD Documentation](https://graphics.pixar.com/usd/docs/index.html)
- [Articulation API Reference](https://docs.omniverse.nvidia.com/py/isaacsim/source/extensions/omni.isaac.core/docs/index.html#articulation)
- [Example Scripts](https://github.com/NVIDIA-Omniverse/IsaacSimExamples)
