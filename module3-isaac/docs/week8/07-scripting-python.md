---
sidebar_position: 7
---

# Python Scripting for Automation

## Overview

Master Python scripting in Isaac Sim for automation, batch processing, procedural scene generation, and custom tool development. Learn standalone scripts, extension development, and workflow automation.

## Learning Objectives

- Write standalone Python scripts for Isaac Sim
- Automate repetitive simulation tasks
- Generate procedural scenes and randomization
- Create custom tools and utilities
- Implement event-driven scripting
- Build reusable Python modules for robotics

## Prerequisites

- Completed tutorials 01-06
- Proficient in Python programming
- Understanding of object-oriented programming
- Familiarity with USD and Isaac Sim APIs

## Standalone vs Extension Scripts

### Standalone Scripts

**Characteristics**:
- Run independently via `python.sh`
- Full control over SimulationApp lifecycle
- Ideal for batch processing and automation
- Can run headless (no GUI)

**Template**:
```python
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

# Your code here
from omni.isaac.core import World
world = World()
# ... simulation logic ...

simulation_app.close()  # Must close!
```

### Extension Scripts

**Characteristics**:
- Integrated into Isaac Sim GUI
- Persistent state during session
- Access to UI framework
- Event-driven architecture

## Automation Patterns

### Batch Simulation Runner

```python
# batch_simulation.py
from isaacsim import SimulationApp

# Headless mode for batch processing
simulation_app = SimulationApp({"headless": True})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from omni.isaac.core.utils.stage import add_reference_to_stage
import numpy as np
import json
import time

class SimulationBatch:
    """Run multiple simulation scenarios automatically."""

    def __init__(self, config_file):
        self.config = self.load_config(config_file)
        self.results = []

    def load_config(self, config_file):
        with open(config_file, 'r') as f:
            return json.load(f)

    def run_scenario(self, scenario):
        """Run single scenario and collect results."""
        print(f"\nRunning scenario: {scenario['name']}")

        world = World()
        world.scene.add_default_ground_plane()

        # Load robot
        add_reference_to_stage(
            usd_path=scenario['robot_usd'],
            prim_path="/World/Robot"
        )

        # Add obstacles
        for idx, obstacle in enumerate(scenario['obstacles']):
            cube = DynamicCuboid(
                prim_path=f"/World/Obstacle_{idx}",
                position=np.array(obstacle['position']),
                size=obstacle['size'],
                mass=obstacle.get('mass', 1.0)
            )
            world.scene.add(cube)

        world.reset()

        # Run simulation
        start_time = time.time()
        collision_count = 0

        for i in range(scenario['steps']):
            world.step(render=False)  # Headless: render=False

            # Check for collisions (simplified)
            # In production, use proper collision detection

            if i % 100 == 0:
                print(f"  Step {i}/{scenario['steps']}")

        elapsed = time.time() - start_time

        # Collect results
        result = {
            'scenario': scenario['name'],
            'elapsed_time': elapsed,
            'steps': scenario['steps'],
            'fps': scenario['steps'] / elapsed,
            'collisions': collision_count,
            'success': collision_count == 0
        }

        self.results.append(result)
        print(f"  ✓ Complete in {elapsed:.2f}s ({result['fps']:.1f} FPS)")

        return result

    def run_all(self):
        """Execute all scenarios."""
        print(f"Running {len(self.config['scenarios'])} scenarios...")

        for scenario in self.config['scenarios']:
            self.run_scenario(scenario)

        # Save results
        output_file = "/tmp/batch_results.json"
        with open(output_file, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n✓ All scenarios complete")
        print(f"  Results saved to: {output_file}")

        # Print summary
        print("\nSummary:")
        for result in self.results:
            status = "✓" if result['success'] else "✗"
            print(f"  {status} {result['scenario']}: {result['fps']:.1f} FPS")

# Configuration file format
config_example = {
    "scenarios": [
        {
            "name": "Scenario_1",
            "robot_usd": "/Isaac/Robots/Carter/carter_v1.usd",
            "obstacles": [
                {"position": [2, 0, 0.5], "size": 0.5, "mass": 1.0},
                {"position": [4, 2, 0.5], "size": 0.7, "mass": 2.0}
            ],
            "steps": 1000
        }
    ]
}

# Run batch
# batch = SimulationBatch("/path/to/config.json")
# batch.run_all()

simulation_app.close()
```

### Procedural Scene Generation

```python
# procedural_scene.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import FixedCuboid, DynamicCuboid
import numpy as np

class ProceduralWarehouse:
    """Generate randomized warehouse environments."""

    def __init__(self, world, seed=None):
        self.world = world
        self.rng = np.random.RandomState(seed)

    def generate_warehouse(self, width, depth, num_shelves, num_boxes):
        """Generate complete warehouse layout."""

        print(f"Generating warehouse: {width}x{depth}m")

        # Floor
        self.world.scene.add_default_ground_plane()

        # Walls
        wall_height = 4.0
        self._create_walls(width, depth, wall_height)

        # Shelving units
        shelf_positions = self._place_shelves(width, depth, num_shelves)

        # Random boxes
        self._place_boxes(shelf_positions, num_boxes)

        # Navigation markers
        waypoints = self._create_waypoints(width, depth)

        print(f"✓ Generated:")
        print(f"  {num_shelves} shelving units")
        print(f"  {num_boxes} boxes")
        print(f"  {len(waypoints)} waypoints")

        return {
            'shelves': shelf_positions,
            'waypoints': waypoints
        }

    def _create_walls(self, width, depth, height):
        """Create perimeter walls."""
        wall_thickness = 0.2

        walls = [
            (np.array([width/2, 0, height/2]), np.array([wall_thickness, depth, height])),
            (np.array([0, depth/2, height/2]), np.array([width, wall_thickness, height])),
            (np.array([0, -depth/2, height/2]), np.array([width, wall_thickness, height]))
        ]

        for idx, (pos, size) in enumerate(walls):
            wall = FixedCuboid(
                prim_path=f"/World/Warehouse/Wall_{idx}",
                position=pos,
                size=size,
                color=np.array([0.7, 0.7, 0.75])
            )
            self.world.scene.add(wall)

    def _place_shelves(self, width, depth, num_shelves):
        """Place shelving units in grid pattern."""
        positions = []
        shelf_spacing = 3.0

        cols = int(width / shelf_spacing)
        rows = int(depth / shelf_spacing)

        for i in range(min(cols, int(np.sqrt(num_shelves)))):
            for j in range(min(rows, int(np.sqrt(num_shelves)))):
                if len(positions) >= num_shelves:
                    break

                x = (i + 0.5) * shelf_spacing - width/2
                y = (j + 0.5) * shelf_spacing - depth/2

                # Create shelf unit (simplified)
                for level in range(3):
                    shelf = FixedCuboid(
                        prim_path=f"/World/Shelves/Unit_{i}_{j}/Level_{level}",
                        position=np.array([x, y, 0.5 + level * 0.8]),
                        size=np.array([2.0, 0.5, 0.05]),
                        color=np.array([0.6, 0.5, 0.4])
                    )
                    self.world.scene.add(shelf)

                positions.append(np.array([x, y, 0]))

        return positions

    def _place_boxes(self, shelf_positions, num_boxes):
        """Randomly place boxes on shelves."""
        for i in range(num_boxes):
            # Random shelf
            shelf_idx = self.rng.randint(0, len(shelf_positions))
            shelf_pos = shelf_positions[shelf_idx]

            # Random level (not ground)
            level = self.rng.randint(1, 4)

            # Random position on shelf
            offset_x = self.rng.uniform(-0.7, 0.7)
            offset_y = self.rng.uniform(-0.15, 0.15)

            box_pos = shelf_pos + np.array([
                offset_x,
                offset_y,
                level * 0.8 + 0.3
            ])

            # Random size
            size = self.rng.uniform(0.2, 0.4)

            box = DynamicCuboid(
                prim_path=f"/World/Boxes/Box_{i}",
                position=box_pos,
                size=size,
                mass=self.rng.uniform(0.5, 2.0),
                color=self.rng.rand(3)
            )
            self.world.scene.add(box)

    def _create_waypoints(self, width, depth):
        """Generate navigation waypoints."""
        waypoints = {}
        grid_size = 3.0

        # Grid waypoints
        for i in range(int(width / grid_size)):
            for j in range(int(depth / grid_size)):
                x = (i + 0.5) * grid_size - width/2
                y = (j + 0.5) * grid_size - depth/2

                name = f"waypoint_{i}_{j}"
                waypoints[name] = [x, y, 0]

        return waypoints

# Usage
world = World()
generator = ProceduralWarehouse(world, seed=42)
layout = generator.generate_warehouse(
    width=20.0,
    depth=15.0,
    num_shelves=6,
    num_boxes=30
)

world.reset()

# Simulate
for i in range(300):
    world.step(render=True)

simulation_app.close()
```

### Domain Randomization

```python
# domain_randomization.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from omni.isaac.core.materials import PreviewSurface
from pxr import Gf
import numpy as np

class DomainRandomizer:
    """Apply domain randomization for robust learning."""

    def __init__(self, world):
        self.world = world

    def randomize_lighting(self):
        """Randomize lighting conditions."""
        from pxr import UsdLux
        import omni.usd

        stage = omni.usd.get_context().get_stage()

        # Randomize dome light
        dome_light = UsdLux.DomeLight.Get(stage, "/World/Environment/DomeLight")
        if dome_light:
            intensity = np.random.uniform(200, 800)
            dome_light.CreateIntensityAttr(intensity)

            # Random color temperature
            temp = np.random.uniform(0.9, 1.1)
            color = Gf.Vec3f(temp, temp * 0.95, temp * 0.9)
            dome_light.CreateColorAttr(color)

        print(f"  Lighting randomized (intensity: {intensity:.0f})")

    def randomize_materials(self, prim_paths):
        """Randomize material properties."""
        for path in prim_paths:
            material = PreviewSurface(
                prim_path=f"{path}_material",
                color=np.random.rand(3),
                roughness=np.random.uniform(0.1, 0.9),
                metallic=np.random.uniform(0.0, 1.0)
            )

        print(f"  Materials randomized ({len(prim_paths)} objects)")

    def randomize_physics(self, prim_paths):
        """Randomize physics properties."""
        from pxr import UsdPhysics
        import omni.usd

        stage = omni.usd.get_context().get_stage()

        for path in prim_paths:
            prim = stage.GetPrimAtPath(path)

            # Random mass
            mass_api = UsdPhysics.MassAPI.Get(stage, path)
            if mass_api:
                mass = np.random.uniform(0.5, 5.0)
                mass_api.GetMassAttr().Set(mass)

            # Random friction
            # Apply physics material with random friction

        print(f"  Physics randomized ({len(prim_paths)} objects)")

    def randomize_camera(self, camera):
        """Randomize camera pose."""
        # Random position
        radius = np.random.uniform(3.0, 6.0)
        theta = np.random.uniform(0, 2 * np.pi)
        phi = np.random.uniform(0.2, np.pi/3)

        x = radius * np.sin(phi) * np.cos(theta)
        y = radius * np.sin(phi) * np.sin(theta)
        z = radius * np.cos(phi)

        camera.set_world_pose(
            position=np.array([x, y, z]),
            orientation=np.array([1, 0, 0, 0])  # Will look at origin
        )

        print(f"  Camera randomized (r={radius:.2f}m)")

    def randomize_all(self, object_paths):
        """Apply all randomizations."""
        self.randomize_lighting()
        self.randomize_materials(object_paths)
        self.randomize_physics(object_paths)

        print("✓ Domain randomization applied")

# Usage example
world = World()
world.scene.add_default_ground_plane()

# Create objects
objects = []
for i in range(5):
    cube = DynamicCuboid(
        prim_path=f"/World/Cube_{i}",
        position=np.array([i - 2, 0, 1.0]),
        size=0.5
    )
    world.scene.add(cube)
    objects.append(f"/World/Cube_{i}")

world.reset()

# Apply randomization each episode
randomizer = DomainRandomizer(world)

for episode in range(5):
    print(f"\nEpisode {episode}:")
    randomizer.randomize_all(objects)

    for i in range(100):
        world.step(render=True)

simulation_app.close()
```

### Event-Driven Scripts

```python
# event_driven.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicSphere
import numpy as np

class CollisionEventHandler:
    """Handle collision events."""

    def __init__(self):
        self.collision_count = 0
        self.contacts = []

    def on_collision(self, contact_data):
        """Called when collision detected."""
        self.collision_count += 1
        self.contacts.append(contact_data)

        print(f"Collision #{self.collision_count}:")
        print(f"  Bodies: {contact_data['body1']} <-> {contact_data['body2']}")
        print(f"  Force: {contact_data['force']:.2f}N")

    def on_simulation_step(self, step_num):
        """Called each simulation step."""
        if step_num % 100 == 0:
            print(f"Step {step_num}: {self.collision_count} total collisions")

    def get_summary(self):
        """Return collision summary."""
        return {
            'total_collisions': self.collision_count,
            'contacts': len(self.contacts)
        }

# Usage
world = World()
world.scene.add_default_ground_plane()

# Create falling spheres
for i in range(5):
    sphere = DynamicSphere(
        prim_path=f"/World/Sphere_{i}",
        position=np.array([i - 2, 0, 5.0]),
        radius=0.3
    )
    world.scene.add(sphere)

world.reset()

# Event handler
handler = CollisionEventHandler()

# Simulation loop with events
for step in range(500):
    world.step(render=True)

    # Check for collisions
    # In production, use PhysX contact reports

    # Trigger step event
    handler.on_simulation_step(step)

# Summary
summary = handler.get_summary()
print(f"\n✓ Simulation complete: {summary['total_collisions']} collisions")

simulation_app.close()
```

## Custom Utilities

### Robot State Logger

```python
# robot_logger.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.utils.types import ArticulationAction
import numpy as np
import json
import time

class RobotStateLogger:
    """Log robot state for analysis."""

    def __init__(self, robot, log_file):
        self.robot = robot
        self.log_file = log_file
        self.logs = []

    def log_state(self, timestamp, step):
        """Capture current robot state."""
        state = {
            'timestamp': timestamp,
            'step': step,
            'joint_positions': self.robot.get_joint_positions().tolist(),
            'joint_velocities': self.robot.get_joint_velocities().tolist(),
            'world_pose': {
                'position': self.robot.get_world_pose()[0].tolist(),
                'orientation': self.robot.get_world_pose()[1].tolist()
            }
        }

        self.logs.append(state)

    def save(self):
        """Save logs to file."""
        data = {
            'robot_name': self.robot.name,
            'num_dof': self.robot.num_dof,
            'dof_names': self.robot.dof_names,
            'states': self.logs
        }

        with open(self.log_file, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"✓ Logged {len(self.logs)} states to {self.log_file}")

# Usage
world = World()
world.scene.add_default_ground_plane()

add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka.usd",
    prim_path="/World/Franka"
)

franka = world.scene.add(Robot(prim_path="/World/Franka", name="franka"))
world.reset()

# Logger
logger = RobotStateLogger(franka, "/tmp/robot_log.json")

# Move robot and log
target = np.array([0.5, -0.5, 0.5, -2.0, 0.5, 1.5, 0.5, 0.04, 0.04])
start_time = time.time()

for step in range(500):
    franka.apply_action(ArticulationAction(joint_positions=target))
    world.step(render=True)

    # Log every 10 steps
    if step % 10 == 0:
        logger.log_state(time.time() - start_time, step)

# Save logs
logger.save()

simulation_app.close()
```

## Summary

You've mastered:
- ✓ Standalone Python scripting
- ✓ Batch simulation automation
- ✓ Procedural scene generation
- ✓ Domain randomization
- ✓ Event-driven programming
- ✓ Custom utilities and logging

## Next Steps

Continue to [Lab: Build Custom Robot](./08-lab-robot-builder.md) to apply scripting skills.

## Additional Resources

- [Isaac Sim Python API](https://docs.omniverse.nvidia.com/isaacsim/latest/python_api.html)
- [Standalone Python Examples](https://github.com/NVIDIA-Omniverse/IsaacSimExamples)
- [Extension Development Guide](https://docs.omniverse.nvidia.com/kit/docs/kit-manual/latest/guide/extensions_basic.html)
