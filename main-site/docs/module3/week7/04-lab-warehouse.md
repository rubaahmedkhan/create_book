---
sidebar_position: 4
---

# Lab: Build Warehouse Environment

## Overview

Build a complete warehouse simulation environment in Isaac Sim. This hands-on lab integrates everything learned in Week 7: scene creation, robot loading, asset management, and optimization for realistic warehouse robotics scenarios.

## Learning Objectives

- Design and build a complete warehouse environment
- Import and arrange multiple robots and assets
- Configure realistic lighting and materials
- Implement navigation waypoints and zones
- Optimize scene performance for real-time simulation
- Save and version simulation scenes

## Prerequisites

- Completed tutorials 01-03 in Week 7
- Understanding of USD scene hierarchy
- Basic Python programming skills
- Familiarity with warehouse robotics concepts

## Lab Requirements

### Warehouse Specifications

- **Dimensions**: 20m x 15m x 5m high
- **Robots**: 2x mobile robots (Carter or custom)
- **Storage**: 3 shelving units with boxes
- **Zones**: Loading, storage, picking, shipping
- **Props**: Pallets, boxes, cones, signs
- **Lighting**: Overhead warehouse lights
- **Navigation**: Defined paths and waypoints

## Part 1: Environment Setup

### Step 1: Create Base Warehouse Structure

```python
# warehouse_builder.py
from isaacsim import SimulationApp

# Launch with larger viewport for warehouse
config = {
    "headless": False,
    "width": 1920,
    "height": 1080
}
simulation_app = SimulationApp(config)

from omni.isaac.core import World
from omni.isaac.core.objects import VisualCuboid, DynamicCuboid
from omni.isaac.core.materials import PreviewSurface
from pxr import Gf, UsdGeom, UsdLux
import numpy as np
import omni.usd

# Initialize world
world = World(stage_units_in_meters=1.0)
world.scene.add_default_ground_plane(
    z_position=0,
    name="warehouse_floor",
    prim_path="/World/WarehouseFloor",
    static_friction=0.5,
    dynamic_friction=0.5,
    restitution=0.0
)

stage = omni.usd.get_context().get_stage()

print("Building warehouse structure...")

# Create warehouse walls
warehouse_width = 20.0
warehouse_depth = 15.0
warehouse_height = 5.0
wall_thickness = 0.2

# Material for walls
wall_material = PreviewSurface(
    prim_path="/World/Materials/WallMaterial",
    color=np.array([0.7, 0.7, 0.75])
)

# Back wall
back_wall = VisualCuboid(
    prim_path="/World/Warehouse/BackWall",
    position=np.array([warehouse_width/2, 0, warehouse_height/2]),
    size=np.array([wall_thickness, warehouse_depth, warehouse_height]),
    color=np.array([0.7, 0.7, 0.75])
)

# Left wall
left_wall = VisualCuboid(
    prim_path="/World/Warehouse/LeftWall",
    position=np.array([0, -warehouse_depth/2, warehouse_height/2]),
    size=np.array([warehouse_width, wall_thickness, warehouse_height]),
    color=np.array([0.7, 0.7, 0.75])
)

# Right wall
right_wall = VisualCuboid(
    prim_path="/World/Warehouse/RightWall",
    position=np.array([0, warehouse_depth/2, warehouse_height/2]),
    size=np.array([warehouse_width, wall_thickness, warehouse_height]),
    color=np.array([0.7, 0.7, 0.75])
)

world.scene.add(back_wall)
world.scene.add(left_wall)
world.scene.add(right_wall)

print("✓ Warehouse walls created")

simulation_app.close()
```

### Step 2: Add Warehouse Lighting

```python
# warehouse_lighting.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from pxr import UsdLux, Gf
import omni.usd

stage = omni.usd.get_context().get_stage()

print("Adding warehouse lighting...")

# Ambient dome light (sky)
dome_light = UsdLux.DomeLight.Define(stage, "/World/Environment/DomeLight")
dome_light.CreateIntensityAttr(300.0)
dome_light.CreateColorAttr(Gf.Vec3f(0.9, 0.95, 1.0))  # Slightly blue

# Overhead warehouse lights (grid pattern)
light_spacing = 4.0
warehouse_width = 20.0
warehouse_depth = 15.0
light_height = 4.5

num_lights_x = int(warehouse_width / light_spacing)
num_lights_y = int(warehouse_depth / light_spacing)

light_count = 0

for i in range(num_lights_x):
    for j in range(num_lights_y):
        x = (i + 0.5) * light_spacing - warehouse_width/2
        y = (j + 0.5) * light_spacing - warehouse_depth/2

        # Create rectangular light (fluorescent tube style)
        light_path = f"/World/Environment/OverheadLight_{light_count}"
        rect_light = UsdLux.RectLight.Define(stage, light_path)

        rect_light.CreateIntensityAttr(5000.0)
        rect_light.CreateWidthAttr(1.5)
        rect_light.CreateHeightAttr(0.3)
        rect_light.CreateColorAttr(Gf.Vec3f(1.0, 0.98, 0.95))  # Warm white

        # Position light
        xform = UsdGeom.Xformable(rect_light)
        xform.ClearXformOpOrder()

        translate_op = xform.AddTranslateOp()
        translate_op.Set(Gf.Vec3d(x, y, light_height))

        rotate_op = xform.AddRotateXYZOp()
        rotate_op.Set(Gf.Vec3f(-90, 0, 0))  # Point down

        light_count += 1

print(f"✓ Created {light_count} overhead lights")

simulation_app.close()
```

### Step 3: Create Shelving Units

```python
# create_shelving.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import VisualCuboid, FixedCuboid
import numpy as np

world = World()

def create_shelf_unit(position, name):
    """Create a warehouse shelf unit with multiple levels."""

    shelf_width = 2.0
    shelf_depth = 0.5
    shelf_height = 3.0
    num_levels = 4
    post_size = 0.05

    shelf_group = []

    # Vertical posts (4 corners)
    posts = [
        (position + np.array([shelf_width/2, shelf_depth/2, shelf_height/2]), f"{name}/Post_1"),
        (position + np.array([shelf_width/2, -shelf_depth/2, shelf_height/2]), f"{name}/Post_2"),
        (position + np.array([-shelf_width/2, shelf_depth/2, shelf_height/2]), f"{name}/Post_3"),
        (position + np.array([-shelf_width/2, -shelf_depth/2, shelf_height/2]), f"{name}/Post_4"),
    ]

    for pos, prim_name in posts:
        post = FixedCuboid(
            prim_path=f"/World/Shelves/{prim_name}",
            position=pos,
            size=np.array([post_size, post_size, shelf_height]),
            color=np.array([0.3, 0.3, 0.3])
        )
        shelf_group.append(post)

    # Horizontal shelves
    for level in range(num_levels):
        shelf_y = (level / (num_levels - 1)) * shelf_height
        shelf_pos = position + np.array([0, 0, shelf_y])

        shelf = FixedCuboid(
            prim_path=f"/World/Shelves/{name}/Shelf_{level}",
            position=shelf_pos,
            size=np.array([shelf_width, shelf_depth, 0.02]),
            color=np.array([0.6, 0.5, 0.4])
        )
        shelf_group.append(shelf)

    return shelf_group

print("Creating shelving units...")

# Create 3 shelf units
shelf_positions = [
    np.array([5.0, -5.0, 0.0]),   # Unit 1
    np.array([5.0, 0.0, 0.0]),    # Unit 2
    np.array([5.0, 5.0, 0.0]),    # Unit 3
]

for idx, pos in enumerate(shelf_positions):
    shelves = create_shelf_unit(pos, f"ShelfUnit_{idx+1}")
    for shelf in shelves:
        world.scene.add(shelf)

print("✓ Shelving units created")

simulation_app.close()
```

## Part 2: Add Warehouse Props

### Step 4: Create Boxes and Pallets

```python
# warehouse_props.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from omni.isaac.core.materials import PreviewSurface
import numpy as np

world = World()

print("Adding warehouse props...")

# Create pallet function
def create_pallet(position, name):
    """Create a simple pallet."""
    pallet_width = 1.0
    pallet_depth = 1.2
    pallet_height = 0.15

    pallet = DynamicCuboid(
        prim_path=f"/World/Props/Pallets/{name}",
        position=position,
        size=np.array([pallet_width, pallet_depth, pallet_height]),
        color=np.array([0.6, 0.4, 0.2]),
        mass=15.0
    )
    return pallet

# Create box function
def create_box(position, name, size_variant="medium"):
    """Create a cardboard box."""
    sizes = {
        "small": np.array([0.3, 0.3, 0.3]),
        "medium": np.array([0.4, 0.4, 0.4]),
        "large": np.array([0.5, 0.5, 0.6])
    }

    size = sizes.get(size_variant, sizes["medium"])

    box = DynamicCuboid(
        prim_path=f"/World/Props/Boxes/{name}",
        position=position,
        size=size,
        color=np.array([0.8, 0.7, 0.5]),
        mass=2.0
    )
    return box

# Place pallets in loading zone
pallet_positions = [
    np.array([-5.0, -5.0, 0.075]),
    np.array([-5.0, -3.0, 0.075]),
    np.array([-5.0, -1.0, 0.075]),
]

for idx, pos in enumerate(pallet_positions):
    pallet = create_pallet(pos, f"Pallet_{idx+1}")
    world.scene.add(pallet)

# Stack boxes on shelves
box_count = 0
for shelf_idx in range(3):
    shelf_x = 5.0
    shelf_y = -5.0 + shelf_idx * 5.0

    for level in range(1, 4):  # Skip ground level
        for box_idx in range(3):
            box_x = shelf_x + (box_idx - 1) * 0.5
            box_y = shelf_y
            box_z = level * 0.8 + 0.2

            size_type = ["small", "medium", "large"][box_idx % 3]

            box = create_box(
                position=np.array([box_x, box_y, box_z]),
                name=f"Box_{box_count}",
                size_variant=size_type
            )
            world.scene.add(box)
            box_count += 1

print(f"✓ Created {len(pallet_positions)} pallets and {box_count} boxes")

simulation_app.close()
```

### Step 5: Add Navigation Markers

```python
# navigation_markers.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import VisualCylinder
from pxr import Gf, UsdGeom
import numpy as np
import omni.usd

world = World()
stage = omni.usd.get_context().get_stage()

print("Creating navigation markers...")

# Define waypoints for robot navigation
waypoints = {
    "loading_zone": np.array([-7.0, 0.0, 0.0]),
    "shelf_1": np.array([3.0, -5.0, 0.0]),
    "shelf_2": np.array([3.0, 0.0, 0.0]),
    "shelf_3": np.array([3.0, 5.0, 0.0]),
    "shipping_zone": np.array([-7.0, 5.0, 0.0]),
    "charging_station": np.array([-7.0, -5.0, 0.0]),
}

# Create visual markers
for name, position in waypoints.items():
    # Create cylinder marker
    marker = VisualCylinder(
        prim_path=f"/World/Navigation/Waypoints/{name}",
        position=position + np.array([0, 0, 0.01]),  # Slightly above floor
        radius=0.3,
        height=0.02,
        color=np.array([0.0, 1.0, 0.0])  # Green
    )
    world.scene.add(marker)

    # Add text label
    from pxr import UsdGeom
    text_path = f"/World/Navigation/Labels/{name}"
    # Note: Text rendering requires additional USD schema
    # For visualization, use cylinder markers with unique colors

print(f"✓ Created {len(waypoints)} navigation waypoints")

# Save waypoints to file for robot navigation
import json
waypoints_data = {
    name: pos.tolist() for name, pos in waypoints.items()
}

with open("/tmp/warehouse_waypoints.json", 'w') as f:
    json.dump(waypoints_data, f, indent=2)

print("✓ Waypoints saved to /tmp/warehouse_waypoints.json")

simulation_app.close()
```

## Part 3: Add Mobile Robots

### Step 6: Load Multiple Robots

```python
# load_warehouse_robots.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.core.utils.stage import add_reference_to_stage
import numpy as np
import json

world = World()

print("Loading warehouse robots...")

# Load waypoints
with open("/tmp/warehouse_waypoints.json", 'r') as f:
    waypoints = json.load(f)

# Robot 1: Carter at loading zone
carter_1 = world.scene.add(
    WheeledRobot(
        prim_path="/World/Robots/Carter_1",
        name="carter_1",
        wheel_dof_names=["joint_wheel_left", "joint_wheel_right"],
        create_robot=True,
        usd_path="/Isaac/Robots/Carter/carter_v1.usd",
        position=np.array(waypoints["loading_zone"]) + np.array([0, 0, 0.2])
    )
)

# Robot 2: Carter at charging station
carter_2 = world.scene.add(
    WheeledRobot(
        prim_path="/World/Robots/Carter_2",
        name="carter_2",
        wheel_dof_names=["joint_wheel_left", "joint_wheel_right"],
        create_robot=True,
        usd_path="/Isaac/Robots/Carter/carter_v1.usd",
        position=np.array(waypoints["charging_station"]) + np.array([0, 0, 0.2])
    )
)

print("✓ Loaded 2 mobile robots")

world.reset()

# Basic movement test
from omni.isaac.core.utils.types import ArticulationAction

print("Testing robot movement...")

# Move both robots forward briefly
for i in range(200):
    # Carter 1 moves toward shelf_1
    carter_1.apply_action(ArticulationAction(joint_velocities=np.array([3.0, 3.0])))

    # Carter 2 moves toward shipping zone
    carter_2.apply_action(ArticulationAction(joint_velocities=np.array([2.0, 2.0])))

    world.step(render=True)

# Stop robots
for i in range(50):
    carter_1.apply_action(ArticulationAction(joint_velocities=np.array([0.0, 0.0])))
    carter_2.apply_action(ArticulationAction(joint_velocities=np.array([0.0, 0.0])))
    world.step(render=True)

print("✓ Robot movement test complete")

simulation_app.close()
```

## Part 4: Complete Integration

### Step 7: Build Complete Warehouse Scene

```python
# complete_warehouse.py
from isaacsim import SimulationApp

config = {
    "headless": False,
    "width": 1920,
    "height": 1080,
}
simulation_app = SimulationApp(config)

from omni.isaac.core import World
from omni.isaac.core.objects import VisualCuboid, FixedCuboid, DynamicCuboid, VisualCylinder
from omni.isaac.wheeled_robots.robots import WheeledRobot
from pxr import Gf, UsdLux, UsdGeom
import numpy as np
import omni.usd
import json

print("=" * 60)
print("BUILDING COMPLETE WAREHOUSE SIMULATION")
print("=" * 60)

# Initialize world
world = World(stage_units_in_meters=1.0)
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# Constants
WAREHOUSE_WIDTH = 20.0
WAREHOUSE_DEPTH = 15.0
WAREHOUSE_HEIGHT = 5.0

# ========== 1. WAREHOUSE STRUCTURE ==========
print("\n[1/7] Building warehouse structure...")

wall_material_color = np.array([0.7, 0.7, 0.75])

walls = [
    VisualCuboid(
        prim_path="/World/Warehouse/BackWall",
        position=np.array([WAREHOUSE_WIDTH/2, 0, WAREHOUSE_HEIGHT/2]),
        size=np.array([0.2, WAREHOUSE_DEPTH, WAREHOUSE_HEIGHT]),
        color=wall_material_color
    ),
    VisualCuboid(
        prim_path="/World/Warehouse/LeftWall",
        position=np.array([0, -WAREHOUSE_DEPTH/2, WAREHOUSE_HEIGHT/2]),
        size=np.array([WAREHOUSE_WIDTH, 0.2, WAREHOUSE_HEIGHT]),
        color=wall_material_color
    ),
    VisualCuboid(
        prim_path="/World/Warehouse/RightWall",
        position=np.array([0, WAREHOUSE_DEPTH/2, WAREHOUSE_HEIGHT/2]),
        size=np.array([WAREHOUSE_WIDTH, 0.2, WAREHOUSE_HEIGHT]),
        color=wall_material_color
    ),
]

for wall in walls:
    world.scene.add(wall)

print("  ✓ Walls created")

# ========== 2. LIGHTING ==========
print("\n[2/7] Adding lighting system...")

dome_light = UsdLux.DomeLight.Define(stage, "/World/Environment/DomeLight")
dome_light.CreateIntensityAttr(300.0)
dome_light.CreateColorAttr(Gf.Vec3f(0.9, 0.95, 1.0))

light_count = 0
for i in range(5):
    for j in range(4):
        x = (i + 0.5) * 4.0 - WAREHOUSE_WIDTH/2
        y = (j + 0.5) * 4.0 - WAREHOUSE_DEPTH/2

        light_path = f"/World/Environment/Light_{light_count}"
        rect_light = UsdLux.RectLight.Define(stage, light_path)
        rect_light.CreateIntensityAttr(5000.0)
        rect_light.CreateWidthAttr(1.5)
        rect_light.CreateHeightAttr(0.3)

        xform = UsdGeom.Xformable(rect_light)
        xform.ClearXformOpOrder()
        xform.AddTranslateOp().Set(Gf.Vec3d(x, y, 4.5))
        xform.AddRotateXYZOp().Set(Gf.Vec3f(-90, 0, 0))

        light_count += 1

print(f"  ✓ {light_count} overhead lights installed")

# ========== 3. SHELVING UNITS ==========
print("\n[3/7] Installing shelving units...")

def create_shelf(position, name):
    shelves = []
    for level in range(4):
        shelf = FixedCuboid(
            prim_path=f"/World/Shelves/{name}/Level_{level}",
            position=position + np.array([0, 0, level * 0.8 + 0.4]),
            size=np.array([2.0, 0.5, 0.02]),
            color=np.array([0.6, 0.5, 0.4])
        )
        shelves.append(shelf)
    return shelves

shelf_units = []
for idx, y_pos in enumerate([-5.0, 0.0, 5.0]):
    shelves = create_shelf(np.array([5.0, y_pos, 0.0]), f"Unit_{idx+1}")
    for shelf in shelves:
        world.scene.add(shelf)
        shelf_units.append(shelf)

print(f"  ✓ {len(shelf_units)} shelf levels installed")

# ========== 4. PROPS ==========
print("\n[4/7] Adding warehouse props...")

# Pallets
pallet_count = 0
for i in range(3):
    pallet = DynamicCuboid(
        prim_path=f"/World/Props/Pallet_{i}",
        position=np.array([-5.0, -5.0 + i * 2.0, 0.075]),
        size=np.array([1.0, 1.2, 0.15]),
        color=np.array([0.6, 0.4, 0.2]),
        mass=15.0
    )
    world.scene.add(pallet)
    pallet_count += 1

# Boxes on shelves
box_count = 0
for shelf_y in [-5.0, 0.0, 5.0]:
    for level in [1, 2, 3]:
        for offset in [-0.5, 0.0, 0.5]:
            box = DynamicCuboid(
                prim_path=f"/World/Props/Box_{box_count}",
                position=np.array([5.0 + offset, shelf_y, level * 0.8 + 0.6]),
                size=np.array([0.3, 0.3, 0.3]),
                color=np.array([0.8, 0.7, 0.5]),
                mass=2.0
            )
            world.scene.add(box)
            box_count += 1

print(f"  ✓ {pallet_count} pallets and {box_count} boxes placed")

# ========== 5. NAVIGATION WAYPOINTS ==========
print("\n[5/7] Creating navigation system...")

waypoints = {
    "loading_zone": [-7.0, 0.0, 0.0],
    "shelf_1": [3.0, -5.0, 0.0],
    "shelf_2": [3.0, 0.0, 0.0],
    "shelf_3": [3.0, 5.0, 0.0],
    "shipping_zone": [-7.0, 5.0, 0.0],
    "charging_station": [-7.0, -5.0, 0.0],
}

for name, pos in waypoints.items():
    marker = VisualCylinder(
        prim_path=f"/World/Navigation/{name}",
        position=np.array(pos) + np.array([0, 0, 0.01]),
        radius=0.3,
        height=0.02,
        color=np.array([0.0, 1.0, 0.0])
    )
    world.scene.add(marker)

# Save waypoints
with open("/tmp/warehouse_waypoints.json", 'w') as f:
    json.dump(waypoints, f, indent=2)

print(f"  ✓ {len(waypoints)} waypoints defined")

# ========== 6. ROBOTS ==========
print("\n[6/7] Deploying warehouse robots...")

carter_1 = world.scene.add(
    WheeledRobot(
        prim_path="/World/Robots/Carter_1",
        name="carter_1",
        wheel_dof_names=["joint_wheel_left", "joint_wheel_right"],
        create_robot=True,
        usd_path="/Isaac/Robots/Carter/carter_v1.usd",
        position=np.array(waypoints["loading_zone"]) + np.array([0, 0, 0.2])
    )
)

carter_2 = world.scene.add(
    WheeledRobot(
        prim_path="/World/Robots/Carter_2",
        name="carter_2",
        wheel_dof_names=["joint_wheel_left", "joint_wheel_right"],
        create_robot=True,
        usd_path="/Isaac/Robots/Carter/carter_v1.usd",
        position=np.array(waypoints["charging_station"]) + np.array([0, 0, 0.2])
    )
)

print("  ✓ 2 mobile robots deployed")

# ========== 7. SAVE SCENE ==========
print("\n[7/7] Saving warehouse scene...")

world.reset()

# Save USD file
output_path = "/tmp/warehouse_complete.usd"
stage.GetRootLayer().Export(output_path)

print(f"  ✓ Scene saved to: {output_path}")

print("\n" + "=" * 60)
print("WAREHOUSE BUILD COMPLETE!")
print("=" * 60)
print(f"  - Floor area: {WAREHOUSE_WIDTH}m x {WAREHOUSE_DEPTH}m")
print(f"  - {light_count} overhead lights")
print(f"  - {len(shelf_units)} storage locations")
print(f"  - {pallet_count} pallets, {box_count} boxes")
print(f"  - {len(waypoints)} navigation waypoints")
print(f"  - 2 autonomous mobile robots")
print("=" * 60)

# Run brief simulation
print("\nRunning simulation preview...")
for i in range(300):
    world.step(render=True)
    if i % 100 == 0:
        print(f"  Simulating... {i/3:.0f}%")

simulation_app.close()
```

## Part 5: Performance Optimization

### Step 8: Optimize Scene Performance

```python
# optimize_warehouse.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from pxr import Usd, UsdGeom, PhysxSchema
import omni.usd
import carb

stage = omni.usd.get_context().get_stage()

print("Optimizing warehouse performance...")

# 1. Set physics update rate
from omni.isaac.core import World
world = World(physics_dt=1.0/60.0, rendering_dt=1.0/30.0)  # Physics 60Hz, Render 30Hz

# 2. Optimize collision meshes
# Use simplified collision for complex meshes
for prim in stage.Traverse():
    if prim.IsA(UsdGeom.Mesh):
        # Apply convex hull approximation
        from pxr import UsdPhysics
        if UsdPhysics.CollisionAPI(prim):
            mesh_collision = UsdPhysics.MeshCollisionAPI.Apply(prim)
            mesh_collision.CreateApproximationAttr("convexHull")

# 3. Reduce physics solver iterations for static objects
physics_scene = stage.GetPrimAtPath("/World/PhysicsScene")
if physics_scene:
    physx_api = PhysxSchema.PhysxSceneAPI.Apply(physics_scene)
    physx_api.CreateEnableCCDAttr(False)  # Disable CCD for static warehouse
    physx_api.CreateEnableGPUDynamicsAttr(True)  # Use GPU physics

# 4. Instance repeated objects
# (Boxes and pallets can be instanced for better performance)
settings = carb.settings.get_settings()
settings.set("/persistent/app/viewport/displayOptions/showInstancedMeshes", True)

print("✓ Performance optimizations applied")

simulation_app.close()
```

## Part 6: Testing and Validation

### Lab Checklist

Test your warehouse simulation:

- [ ] **Structure**: All walls, floor, and ceiling present
- [ ] **Lighting**: Even illumination, no dark corners
- [ ] **Shelving**: 3 units with 4 levels each, stable
- [ ] **Props**: Pallets and boxes placed correctly
- [ ] **Navigation**: All waypoints visible and accessible
- [ ] **Robots**: Both robots load and respond to commands
- [ ] **Physics**: Objects fall correctly, no penetration
- [ ] **Performance**: Maintains >30 FPS during simulation
- [ ] **Save/Load**: Scene saves and reloads without errors

### Validation Script

```python
# validate_warehouse.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from pxr import Usd, UsdPhysics
import omni.usd
import json

stage = omni.usd.get_context().get_stage()

print("=" * 60)
print("WAREHOUSE VALIDATION")
print("=" * 60)

# Check structure
walls = [
    "/World/Warehouse/BackWall",
    "/World/Warehouse/LeftWall",
    "/World/Warehouse/RightWall"
]
walls_ok = all(stage.GetPrimAtPath(w).IsValid() for w in walls)
print(f"✓ Walls: {'PASS' if walls_ok else 'FAIL'}")

# Check shelving
shelf_count = sum(1 for p in stage.Traverse() if "/World/Shelves/" in str(p.GetPath()))
print(f"✓ Shelves: {shelf_count} components {'PASS' if shelf_count >= 12 else 'FAIL'}")

# Check props
box_count = sum(1 for p in stage.Traverse() if "/World/Props/Box" in str(p.GetPath()))
pallet_count = sum(1 for p in stage.Traverse() if "/World/Props/Pallet" in str(p.GetPath()))
print(f"✓ Props: {box_count} boxes, {pallet_count} pallets")

# Check robots
robot_count = sum(1 for p in stage.Traverse() if "/World/Robots/" in str(p.GetPath()) and UsdPhysics.ArticulationRootAPI(p))
print(f"✓ Robots: {robot_count} {'PASS' if robot_count >= 2 else 'FAIL'}")

# Check waypoints
try:
    with open("/tmp/warehouse_waypoints.json", 'r') as f:
        waypoints = json.load(f)
    waypoint_ok = len(waypoints) >= 6
    print(f"✓ Waypoints: {len(waypoints)} {'PASS' if waypoint_ok else 'FAIL'}")
except:
    print("✗ Waypoints: FAIL (file not found)")

# Overall result
all_pass = walls_ok and shelf_count >= 12 and robot_count >= 2
print("\n" + "=" * 60)
print(f"OVERALL: {'✓ PASS' if all_pass else '✗ FAIL'}")
print("=" * 60)

simulation_app.close()
```

## Deliverables

### Required Outputs

1. **USD Scene File**: `warehouse_complete.usd`
2. **Waypoints Data**: `warehouse_waypoints.json`
3. **Screenshots**: 3 views (overview, detail, robots)
4. **Validation Report**: Output from validation script

### Bonus Challenges

1. **Advanced Lighting**: Add emergency lights, exit signs
2. **Conveyor Belt**: Implement moving conveyor system
3. **Forklift**: Add forklift robot with articulated lift
4. **Loading Dock**: Create loading dock with door
5. **Multi-floor**: Build second-level mezzanine

## Troubleshooting

### Common Issues

**Issue**: Low frame rate
```python
# Solution: Reduce physics quality
world = World(physics_dt=1.0/30.0)  # Lower physics rate

# Simplify collision meshes
mesh_collision.CreateApproximationAttr("convexHull")
```

**Issue**: Objects fall through floor
```python
# Solution: Check ground plane physics
world.scene.add_default_ground_plane(
    static_friction=0.8,
    dynamic_friction=0.5,
    restitution=0.0
)
```

**Issue**: Robots don't move
```python
# Solution: Verify reset() called
world.reset()

# Check wheel joint names
print(carter.wheel_dof_names)
```

## Summary

You've successfully:
- ✓ Built a complete warehouse environment from scratch
- ✓ Integrated structure, lighting, props, and robots
- ✓ Created navigation waypoint system
- ✓ Optimized scene for real-time performance
- ✓ Validated all components

**Key Achievements**:
- 20m x 15m warehouse with realistic layout
- Dynamic lighting system with 20+ lights
- 3 shelving units with 27 boxes
- 2 autonomous mobile robots
- Navigation waypoint system
- Performance-optimized scene

## Next Steps

**Week 8** will cover:
- Advanced physics simulation
- Sensor integration (cameras, lidars)
- Python scripting for automation
- Building custom robots

Use your warehouse as the testbed for future exercises!

## Additional Resources

- [Isaac Sim Scene Building Guide](https://docs.omniverse.nvidia.com/isaacsim/latest/manual_standalone_python.html)
- [USD Composition](https://graphics.pixar.com/usd/docs/USD-Glossary.html#USDGlossary-Composition)
- [Performance Optimization](https://docs.omniverse.nvidia.com/isaacsim/latest/advanced_tutorials/tutorial_advanced_performance_optimization.html)
- [Warehouse Automation Examples](https://github.com/NVIDIA-Omniverse/IsaacSimExamples)
