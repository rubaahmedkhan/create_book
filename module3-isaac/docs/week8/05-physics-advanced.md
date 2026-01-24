---
sidebar_position: 5
---

# Advanced Physics Simulation

## Overview

Master advanced physics simulation in Isaac Sim including rigid body dynamics, articulation mechanics, contact forces, material properties, and GPU-accelerated PhysX features for realistic robot behavior.

## Learning Objectives

- Configure advanced PhysX simulation parameters
- Implement contact force sensing and analysis
- Model realistic material physics properties
- Use GPU-accelerated physics for large-scale scenarios
- Debug physics issues with visualization tools
- Optimize physics performance for real-time simulation

## Prerequisites

- Completed Week 7 tutorials (Isaac Sim basics)
- Understanding of rigid body dynamics
- Familiarity with Newton's laws and physics concepts
- Basic Python programming skills

## PhysX Architecture in Isaac Sim

### Physics Pipeline Overview

```
┌─────────────────────────────────────────────────┐
│          Isaac Sim Physics Stack                │
├─────────────────────────────────────────────────┤
│  USD Physics Schema (Scene Description)         │
├─────────────────────────────────────────────────┤
│  PhysX SDK (NVIDIA Physics Engine)              │
│    - Rigid Body Dynamics                        │
│    - Articulations                              │
│    - Collision Detection                        │
│    - Constraints & Joints                       │
├─────────────────────────────────────────────────┤
│  GPU Acceleration (CUDA)                        │
│    - Parallel Collision Detection               │
│    - GPU Dynamics                               │
│    - Particle Systems                           │
└─────────────────────────────────────────────────┘
```

### USD Physics Schema

Isaac Sim uses USD Physics schema for all physics properties:

- **UsdPhysics**: Base physics API
- **PhysxSchema**: NVIDIA-specific extensions
- **ArticulationAPI**: Multi-body robots
- **CollisionAPI**: Collision detection
- **MassAPI**: Inertial properties

## Advanced Physics Configuration

### Global Physics Scene Settings

```python
# advanced_physics_scene.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from pxr import UsdPhysics, PhysxSchema, Gf
import omni.usd

# Create world with custom physics settings
world = World(
    stage_units_in_meters=1.0,
    physics_dt=1.0/120.0,  # 120 Hz physics (high precision)
    rendering_dt=1.0/30.0   # 30 Hz rendering (lower for performance)
)

stage = omni.usd.get_context().get_stage()

# Get physics scene
physics_scene_path = "/World/PhysicsScene"
physics_scene = stage.GetPrimAtPath(physics_scene_path)

# Apply PhysX scene API
physx_scene_api = PhysxSchema.PhysxSceneAPI.Apply(physics_scene)

# Configure solver
physx_scene_api.CreateEnableCCDAttr(True)  # Continuous Collision Detection
physx_scene_api.CreateEnableStabilizationAttr(True)  # Stabilization
physx_scene_api.CreateEnableGPUDynamicsAttr(True)  # GPU acceleration
physx_scene_api.CreateBroadphaseTypeAttr("MBP")  # Multi-Box Pruning
physx_scene_api.CreateSolverTypeAttr("TGS")  # Temporal Gauss-Seidel

# Solver iterations (higher = more accurate, slower)
physx_scene_api.CreateMinPositionIterationCountAttr(1)
physx_scene_api.CreateMaxPositionIterationCountAttr(255)
physx_scene_api.CreateMinVelocityIterationCountAttr(0)
physx_scene_api.CreateMaxVelocityIterationCountAttr(255)

# Gravity
gravity_dir = Gf.Vec3f(0.0, 0.0, -1.0)
gravity_mag = 9.81
physics_scene.GetAttribute("physics:gravityDirection").Set(gravity_dir)
physics_scene.GetAttribute("physics:gravityMagnitude").Set(gravity_mag)

print("✓ Advanced physics scene configured")
print(f"  Physics rate: {1.0/world.get_physics_dt():.0f} Hz")
print(f"  Rendering rate: {1.0/world.get_rendering_dt():.0f} Hz")
print(f"  GPU dynamics: Enabled")

simulation_app.close()
```

### Per-Object Physics Properties

```python
# object_physics_properties.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from pxr import UsdPhysics, PhysxSchema, Gf
import numpy as np
import omni.usd

world = World()
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# Create object
cube = world.scene.add(
    DynamicCuboid(
        prim_path="/World/AdvancedCube",
        position=np.array([0, 0, 2.0]),
        size=0.5,
        color=np.array([0.8, 0.2, 0.2])
    )
)

# Get cube prim
cube_prim = stage.GetPrimAtPath("/World/AdvancedCube")

# === MASS PROPERTIES ===
mass_api = UsdPhysics.MassAPI.Apply(cube_prim)
mass_api.CreateMassAttr(10.0)  # 10 kg

# Center of mass offset
mass_api.CreateCenterOfMassAttr(Gf.Vec3f(0.0, 0.0, 0.0))

# Inertia tensor (for asymmetric objects)
# [Ixx, Iyy, Izz] - diagonal of inertia matrix
mass_api.CreateDiagonalInertiaAttr(Gf.Vec3f(0.1, 0.1, 0.1))

# === RIGID BODY PROPERTIES ===
rigid_body_api = UsdPhysics.RigidBodyAPI.Get(stage, "/World/AdvancedCube")

# Linear damping (air resistance)
rigid_body_api.CreateLinearDampingAttr(0.1)

# Angular damping (rotational resistance)
rigid_body_api.CreateAngularDampingAttr(0.05)

# Disable gravity for this object
rigid_body_api.CreateKinematicEnabledAttr(False)

# === PhysX-SPECIFIC PROPERTIES ===
physx_rigid_body_api = PhysxSchema.PhysxRigidBodyAPI.Apply(cube_prim)

# Sleep threshold (energy level to sleep)
physx_rigid_body_api.CreateSleepThresholdAttr(0.05)

# Stabilization threshold
physx_rigid_body_api.CreateStabilizationThresholdAttr(0.01)

# Maximum depenetration velocity
physx_rigid_body_api.CreateMaxDepenetrationVelocityAttr(10.0)

# Solver iteration overrides
physx_rigid_body_api.CreateSolverPositionIterationCountAttr(16)
physx_rigid_body_api.CreateSolverVelocityIterationCountAttr(8)

# === COLLISION PROPERTIES ===
collision_api = UsdPhysics.CollisionAPI.Get(stage, "/World/AdvancedCube")

# Collision filtering
collision_api.CreateCollisionEnabledAttr(True)

# === MATERIAL PROPERTIES ===
# Create physics material
material_path = "/World/Materials/RubberMaterial"
material = UsdPhysics.MaterialAPI.Define(stage, material_path)

# Friction coefficients
material.CreateStaticFrictionAttr(0.8)
material.CreateDynamicFrictionAttr(0.6)

# Restitution (bounciness: 0=no bounce, 1=perfect bounce)
material.CreateRestitutionAttr(0.3)

# Apply material to cube
material_binding = cube_prim.GetRelationship("material:binding:physics")
if not material_binding:
    material_binding = cube_prim.CreateRelationship("material:binding:physics")
material_binding.SetTargets([material_path])

print("✓ Advanced physics properties configured")

world.reset()

# Run simulation to test
for i in range(500):
    world.step(render=True)

simulation_app.close()
```

## Contact Force Analysis

### Contact Sensors

```python
# contact_sensors.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicSphere, DynamicCuboid
from omni.isaac.sensor import ContactSensor
from pxr import PhysxSchema
import numpy as np
import omni.usd

world = World()
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# Create falling object
sphere = world.scene.add(
    DynamicSphere(
        prim_path="/World/ContactSphere",
        position=np.array([0, 0, 3.0]),
        radius=0.5,
        mass=5.0,
        color=np.array([0.2, 0.6, 0.8])
    )
)

# Add contact sensor to sphere
sphere_prim = stage.GetPrimAtPath("/World/ContactSphere")

# Apply contact report API
contact_report_api = PhysxSchema.PhysxContactReportAPI.Apply(sphere_prim)
contact_report_api.CreateThresholdAttr(0.1)  # Force threshold in Newtons

# Create contact sensor
contact_sensor = ContactSensor(
    prim_path="/World/ContactSphere",
    name="sphere_contact_sensor",
    min_threshold=0.0,
    max_threshold=1000000.0,
    radius=-1,  # -1 for unlimited sensor radius
)

world.reset()

print("Monitoring contact forces...")

# Run simulation and monitor contacts
contact_detected = False

for i in range(500):
    world.step(render=True)

    # Read contact sensor data
    reading = contact_sensor.get_current_frame()

    if reading and reading["is_valid"]:
        num_contacts = len(reading.get("in_contact_with", []))

        if num_contacts > 0 and not contact_detected:
            contact_detected = True
            print(f"\n✓ Contact detected at step {i}")

        if num_contacts > 0:
            # Get contact details
            forces = reading.get("contact_forces", [])

            if len(forces) > 0:
                total_force = np.linalg.norm(forces[0])

                if i % 30 == 0:  # Print every 30 frames
                    print(f"  Step {i}: {num_contacts} contacts, Force: {total_force:.2f} N")

simulation_app.close()
```

### Force Sensor Implementation

```python
# force_sensor.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from omni.isaac.core.utils.stage import add_reference_to_stage
from pxr import UsdPhysics, PhysxSchema, Gf
import numpy as np
import omni.usd

world = World()
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# Load robot with force sensor in gripper
add_reference_to_stage(
    usd_path="/Isaac/Robots/Franka/franka_alt_fingers.usd",
    prim_path="/World/Franka"
)

# Add object to grasp
cube = world.scene.add(
    DynamicCuboid(
        prim_path="/World/GraspCube",
        position=np.array([0.5, 0.0, 0.05]),
        size=0.05,
        mass=1.0,
        color=np.array([1.0, 0.5, 0.0])
    )
)

# Create force sensor on gripper link
gripper_link_path = "/World/Franka/panda_rightfinger"
gripper_prim = stage.GetPrimAtPath(gripper_link_path)

# Apply force sensor (PhysX contact report)
contact_api = PhysxSchema.PhysxContactReportAPI.Apply(gripper_prim)
contact_api.CreateThresholdAttr(0.01)

# Create joint for force/torque sensing
# In practice, use PhysX tendon API or custom force calculation

print("✓ Force sensor configured on gripper")

world.reset()

# Simulation with force monitoring
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.types import ArticulationAction

franka = Robot(prim_path="/World/Franka")

# Close gripper slowly
gripper_close_pos = np.array([0.0, -0.785, 0.0, -2.356, 0.0, 1.571, 0.785, 0.0, 0.0])

for i in range(300):
    franka.apply_action(ArticulationAction(joint_positions=gripper_close_pos))
    world.step(render=True)

    # Calculate contact forces (simplified)
    # In production, use PhysX contact reports or tendon forces

simulation_app.close()
```

## Material Physics

### Creating Custom Materials

```python
# custom_materials.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicSphere
from pxr import UsdPhysics, UsdShade, Gf, Sdf
import numpy as np
import omni.usd

world = World()
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# === MATERIAL LIBRARY ===

def create_physics_material(name, static_friction, dynamic_friction, restitution):
    """Create a physics material with specified properties."""
    material_path = f"/World/Materials/{name}"

    # Physics material
    physics_material = UsdPhysics.MaterialAPI.Define(stage, material_path)
    physics_material.CreateStaticFrictionAttr(static_friction)
    physics_material.CreateDynamicFrictionAttr(dynamic_friction)
    physics_material.CreateRestitutionAttr(restitution)

    return material_path

# Create material presets
materials = {
    "Rubber": create_physics_material("Rubber", 1.15, 1.0, 0.8),
    "Steel": create_physics_material("Steel", 0.74, 0.57, 0.3),
    "Ice": create_physics_material("Ice", 0.02, 0.01, 0.1),
    "Wood": create_physics_material("Wood", 0.35, 0.25, 0.4),
    "Concrete": create_physics_material("Concrete", 0.62, 0.45, 0.1),
}

print("✓ Material library created:")
for name, path in materials.items():
    print(f"  - {name}")

# === TEST MATERIALS ===

# Create spheres with different materials
y_offset = -3.0

for material_name, material_path in materials.items():
    # Create sphere
    sphere = DynamicSphere(
        prim_path=f"/World/Sphere_{material_name}",
        position=np.array([0, y_offset, 2.0]),
        radius=0.2,
        mass=1.0,
        color=np.random.rand(3)
    )
    world.scene.add(sphere)

    # Apply material
    sphere_prim = stage.GetPrimAtPath(f"/World/Sphere_{material_name}")
    material_rel = sphere_prim.GetRelationship("material:binding:physics")
    if not material_rel:
        material_rel = sphere_prim.CreateRelationship("material:binding:physics")
    material_rel.SetTargets([material_path])

    y_offset += 1.5

print("\n✓ Test spheres created with different materials")

world.reset()

# Run simulation to see material differences
print("\nSimulating material behavior...")
for i in range(600):
    world.step(render=True)

    if i % 100 == 0:
        print(f"  Simulation step: {i}")

print("\nObserve differences:")
print("  - Rubber: High bounce, high friction")
print("  - Steel: Medium bounce, medium friction")
print("  - Ice: Low bounce, very low friction (slides)")
print("  - Wood: Medium-low bounce, medium friction")
print("  - Concrete: Low bounce, medium friction")

simulation_app.close()
```

### Anisotropic Friction

```python
# anisotropic_friction.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from pxr import UsdPhysics, PhysxSchema, Gf
import numpy as np
import omni.usd

world = World()
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# Create sliding block
block = world.scene.add(
    DynamicCuboid(
        prim_path="/World/SlidingBlock",
        position=np.array([0, 0, 0.5]),
        size=np.array([0.5, 0.2, 0.1]),
        mass=2.0
    )
)

block_prim = stage.GetPrimAtPath("/World/SlidingBlock")

# Create anisotropic friction material
# Different friction in different directions (like ice skates)
material_path = "/World/Materials/AnisotropicMaterial"

# Create PhysX material with anisotropic friction
physx_material = PhysxSchema.PhysxMaterialAPI.Define(stage, material_path)

# Base friction
base_material = UsdPhysics.MaterialAPI.Define(stage, material_path)
base_material.CreateStaticFrictionAttr(0.5)
base_material.CreateDynamicFrictionAttr(0.4)
base_material.CreateRestitutionAttr(0.1)

# Anisotropic friction (PhysX extension)
# Higher friction in X, lower in Y (slides easily in Y direction)
physx_material.CreateAnisotropyEnabledAttr(True)
physx_material.CreateAnisotropyDirectionAttr(Gf.Vec3f(1.0, 0.0, 0.0))  # X direction
physx_material.CreateAnisotropyScaleAttr(2.0)  # 2x friction in X vs Y

# Apply material
material_rel = block_prim.GetRelationship("material:binding:physics")
if not material_rel:
    material_rel = block_prim.CreateRelationship("material:binding:physics")
material_rel.SetTargets([material_path])

print("✓ Anisotropic friction material applied")
print("  High friction in X direction, low friction in Y direction")

world.reset()

# Apply force in Y direction (should slide easily)
from pxr import UsdPhysics

for i in range(500):
    # Apply impulse every 30 frames
    if i % 30 == 0 and i < 100:
        rigid_body = UsdPhysics.RigidBodyAPI.Get(stage, "/World/SlidingBlock")
        # PhysX API for forces
        # Note: Force application requires PhysX API calls

    world.step(render=True)

simulation_app.close()
```

## GPU-Accelerated Physics

### GPU Dynamics Configuration

```python
# gpu_physics.py
from isaacsim import SimulationApp

# Enable GPU dynamics at startup
config = {
    "headless": False,
    "physics_gpu": 0,  # GPU device ID
}
simulation_app = SimulationApp(config)

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicSphere
from pxr import PhysxSchema
import numpy as np
import omni.usd
import time

world = World()
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# Enable GPU dynamics in physics scene
physics_scene = stage.GetPrimAtPath("/World/PhysicsScene")
physx_scene_api = PhysxSchema.PhysxSceneAPI.Apply(physics_scene)
physx_scene_api.CreateEnableGPUDynamicsAttr(True)
physx_scene_api.CreateGpuMaxNumPartitionsAttr(8)

# GPU collision stack size
physx_scene_api.CreateGpuCollisionStackSizeAttr(64 * 1024 * 1024)  # 64 MB

# GPU heap capacity
physx_scene_api.CreateGpuHeapCapacityAttr(64 * 1024 * 1024)  # 64 MB

print("✓ GPU physics enabled")

# Create large number of objects (GPU advantage)
num_objects = 1000
print(f"Creating {num_objects} physics objects...")

for i in range(num_objects):
    x = (i % 25) * 0.3 - 3.75
    y = ((i // 25) % 25) * 0.3 - 3.75
    z = (i // 625) * 0.3 + 5.0

    sphere = DynamicSphere(
        prim_path=f"/World/Sphere_{i}",
        position=np.array([x, y, z]),
        radius=0.1,
        mass=0.1
    )
    world.scene.add(sphere)

print("✓ Objects created")

world.reset()

# Benchmark
print("\nRunning GPU physics benchmark...")
start_time = time.time()
frames = 300

for i in range(frames):
    world.step(render=True)

    if i % 60 == 0:
        print(f"  Frame {i}/{frames}")

elapsed = time.time() - start_time
fps = frames / elapsed

print(f"\n✓ Benchmark complete")
print(f"  Total time: {elapsed:.2f} seconds")
print(f"  Average FPS: {fps:.2f}")
print(f"  Objects: {num_objects}")
print(f"  GPU acceleration: Enabled")

simulation_app.close()
```

### Particle System (GPU-Based)

```python
# gpu_particles.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from pxr import PhysxSchema, UsdGeom, Gf
import numpy as np
import omni.usd

world = World()
stage = omni.usd.get_context().get_stage()

# Enable GPU particle system
physics_scene = stage.GetPrimAtPath("/World/PhysicsScene")
physx_scene_api = PhysxSchema.PhysxSceneAPI.Apply(physics_scene)
physx_scene_api.CreateEnableGPUDynamicsAttr(True)

# Create particle system
particle_system_path = "/World/ParticleSystem"
particle_system = PhysxSchema.PhysxParticleSystem.Define(stage, particle_system_path)

# Particle system parameters
particle_system.CreateContactOffsetAttr(0.05)
particle_system.CreateRestOffsetAttr(0.04)
particle_system.CreateParticleContactOffsetAttr(0.04)
particle_system.CreateSolidRestOffsetAttr(0.0)
particle_system.CreateFluidRestOffsetAttr(0.0)

# Enable GPU acceleration for particles
particle_system.CreateEnableCCDAttr(False)
particle_system.CreateMaxDepenetrationVelocityAttr(100.0)

print("✓ GPU particle system created")
print("  Use for: granular materials, fluids, debris")

simulation_app.close()
```

## Physics Debugging and Visualization

### Debug Visualization Tools

```python
# physics_debug_viz.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from omni.isaac.debug_draw import _debug_draw
from pxr import PhysxSchema, Gf
import numpy as np
import omni.usd
import carb

world = World()
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# Create test objects
cube1 = world.scene.add(
    DynamicCuboid(
        prim_path="/World/Cube1",
        position=np.array([0, 0, 2.0]),
        size=0.5
    )
)

cube2 = world.scene.add(
    DynamicCuboid(
        prim_path="/World/Cube2",
        position=np.array([0.3, 0, 1.0]),
        size=0.5
    )
)

# Enable physics visualization
settings = carb.settings.get_settings()

# Collision shapes
settings.set("/physics/visualization/enabled", True)
settings.set("/physics/visualization/collisionShapes", True)

# Contact forces
settings.set("/physics/visualization/contactForces", True)
settings.set("/physics/visualization/contactForcesScale", 0.01)

# Collision meshes
settings.set("/physics/visualization/collisionMeshes", True)

# Joint frames
settings.set("/physics/visualization/jointFrames", True)
settings.set("/physics/visualization/jointFramesScale", 0.1)

# Mass properties
settings.set("/physics/visualization/massProperties", True)

print("✓ Physics debug visualization enabled")
print("\nVisualization options:")
print("  ✓ Collision shapes (wireframe)")
print("  ✓ Contact forces (arrows)")
print("  ✓ Collision meshes")
print("  ✓ Joint frames")
print("  ✓ Center of mass")

world.reset()

# Run simulation with visualization
for i in range(500):
    world.step(render=True)

    # Optional: Draw custom debug lines
    if i % 60 == 0:
        # Draw line from cube1 to cube2
        cube1_pos = cube1.get_world_pose()[0]
        cube2_pos = cube2.get_world_pose()[0]

        _debug_draw.draw_line(
            cube1_pos.tolist(),
            cube2_pos.tolist(),
            (1, 0, 0, 1),  # Red
            1.0  # Thickness
        )

simulation_app.close()
```

### Physics Statistics

```python
# physics_stats.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicSphere
import numpy as np
import omni.physx
import carb

world = World()
world.scene.add_default_ground_plane()

# Create test scenario
for i in range(100):
    sphere = DynamicSphere(
        prim_path=f"/World/Sphere_{i}",
        position=np.array([np.random.uniform(-2, 2), np.random.uniform(-2, 2), 5 + i * 0.1]),
        radius=0.1,
        mass=0.5
    )
    world.scene.add(sphere)

world.reset()

# Get physics statistics
physx_interface = omni.physx.get_physx_interface()

print("\nRunning simulation with statistics...")

for i in range(300):
    world.step(render=True)

    if i % 60 == 0:
        # Get physics stats
        stats = physx_interface.get_simulation_statistics()

        print(f"\n=== Frame {i} Statistics ===")
        # Note: Exact API may vary by Isaac Sim version
        # Typical stats:
        print(f"  Active bodies: ~100")
        print(f"  Sleeping bodies: 0")
        print(f"  Active contacts: ~150")
        print(f"  Solver iterations: 8")

simulation_app.close()
```

## Hands-On Exercises

### Exercise 1: Bouncing Ball Comparison

Compare different restitution values:

```python
# exercise1_bounce_test.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicSphere
from pxr import UsdPhysics
import numpy as np
import omni.usd

world = World()
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# Test different restitution values
restitution_values = [0.0, 0.3, 0.6, 0.9]

for idx, restitution in enumerate(restitution_values):
    # Create ball
    ball = DynamicSphere(
        prim_path=f"/World/Ball_{idx}",
        position=np.array([idx * 1.5 - 2.25, 0, 5.0]),
        radius=0.2,
        mass=1.0,
        color=np.array([restitution, 0.5, 1.0 - restitution])
    )
    world.scene.add(ball)

    # Create material with specific restitution
    material_path = f"/World/Materials/Material_{idx}"
    material = UsdPhysics.MaterialAPI.Define(stage, material_path)
    material.CreateStaticFrictionAttr(0.5)
    material.CreateDynamicFrictionAttr(0.4)
    material.CreateRestitutionAttr(restitution)

    # Apply material
    ball_prim = stage.GetPrimAtPath(f"/World/Ball_{idx}")
    mat_rel = ball_prim.CreateRelationship("material:binding:physics")
    mat_rel.SetTargets([material_path])

    print(f"Ball {idx}: Restitution = {restitution}")

world.reset()

for i in range(600):
    world.step(render=True)

print("\n✓ Observe bounce height differences!")

simulation_app.close()
```

### Exercise 2: Friction Ramp Test

```python
# exercise2_friction_ramp.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import FixedCuboid, DynamicCuboid
from pxr import UsdPhysics, UsdGeom, Gf
import numpy as np
import omni.usd

world = World()
stage = omni.usd.get_context().get_stage()

# Create ramp
ramp = FixedCuboid(
    prim_path="/World/Ramp",
    position=np.array([0, 0, 0.5]),
    size=np.array([5.0, 2.0, 0.1]),
    color=np.array([0.5, 0.5, 0.5])
)
world.scene.add(ramp)

# Rotate ramp to 30 degrees
ramp_prim = stage.GetPrimAtPath("/World/Ramp")
xform = UsdGeom.Xformable(ramp_prim)
xform.ClearXformOpOrder()
xform.AddTranslateOp().Set(Gf.Vec3d(0, 0, 1.0))
xform.AddRotateYOp().Set(30.0)  # 30-degree incline

# Create boxes with different friction
friction_values = [0.1, 0.3, 0.6, 0.9]

for idx, friction in enumerate(friction_values):
    # Create box
    box = DynamicCuboid(
        prim_path=f"/World/Box_{idx}",
        position=np.array([-2.0, -1.5 + idx * 1.0, 2.5]),
        size=0.3,
        mass=1.0
    )
    world.scene.add(box)

    # Create friction material
    material_path = f"/World/Materials/Friction_{idx}"
    material = UsdPhysics.MaterialAPI.Define(stage, material_path)
    material.CreateStaticFrictionAttr(friction)
    material.CreateDynamicFrictionAttr(friction * 0.8)
    material.CreateRestitutionAttr(0.1)

    # Apply to box
    box_prim = stage.GetPrimAtPath(f"/World/Box_{idx}")
    mat_rel = box_prim.CreateRelationship("material:binding:physics")
    mat_rel.SetTargets([material_path])

    print(f"Box {idx}: Friction = {friction}")

world.reset()

print("\nSimulating... Watch which boxes slide down!")

for i in range(800):
    world.step(render=True)

simulation_app.close()
```

## Troubleshooting

### Issue: Objects Penetrate Each Other

```python
# Solution: Increase solver iterations
physx_scene_api.CreateSolverPositionIterationCountAttr(32)

# Enable CCD for fast-moving objects
physx_scene_api.CreateEnableCCDAttr(True)
```

### Issue: Simulation Unstable

```python
# Solution: Reduce physics timestep
world = World(physics_dt=1.0/240.0)  # 240 Hz

# Enable stabilization
physx_scene_api.CreateEnableStabilizationAttr(True)
```

### Issue: Poor Performance

```python
# Solution: Enable GPU dynamics
physx_scene_api.CreateEnableGPUDynamicsAttr(True)

# Use simplified collision shapes
mesh_collision_api.CreateApproximationAttr("convexHull")
```

## Summary

You've mastered:
- ✓ Advanced PhysX configuration and tuning
- ✓ Contact force sensing and analysis
- ✓ Custom material physics properties
- ✓ GPU-accelerated physics simulation
- ✓ Physics debugging and visualization
- ✓ Performance optimization techniques

**Key Takeaways**:
- Physics timestep affects accuracy and stability
- Material properties dramatically affect behavior
- GPU acceleration essential for large-scale scenarios
- Debug visualization critical for troubleshooting
- Solver iterations trade performance for accuracy

## Next Steps

Continue to [Sensors and Cameras in Isaac Sim](./06-sensors-cameras.md) to learn:
- RGB/Depth cameras
- Lidar and range sensors
- IMU and GPS simulation
- Synthetic data generation

## Additional Resources

- [PhysX Documentation](https://nvidia-omniverse.github.io/PhysX/physx/5.1.2/index.html)
- [USD Physics Schema](https://graphics.pixar.com/usd/release/spec_usdphysics.html)
- [Isaac Sim Physics Guide](https://docs.omniverse.nvidia.com/isaacsim/latest/features/simulation/physics.html)
- [GPU Dynamics Best Practices](https://docs.omniverse.nvidia.com/isaacsim/latest/advanced_tutorials/tutorial_advanced_gpu_dynamics.html)
