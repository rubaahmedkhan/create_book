---
sidebar_position: 3
---

# Importing and Managing Assets

## Overview

Learn how to import custom robot models, convert CAD files to USD format, manage materials and textures, and optimize assets for high-performance simulation in Isaac Sim.

## Learning Objectives

- Import URDF robot descriptions into Isaac Sim
- Convert CAD models (STL, OBJ, FBX) to USD format
- Configure physics properties for custom robots
- Apply and manage materials and textures
- Optimize mesh complexity for real-time simulation
- Create and manage asset libraries

## Prerequisites

- Completed [Creating Your First Robot Simulation](./02-first-simulation.md)
- Basic understanding of robot URDF format
- Familiarity with 3D modeling concepts
- Understanding of file formats (STL, OBJ, URDF, USD)

## Understanding Asset Formats in Isaac Sim

### Supported Input Formats

| Format | Type | Use Case | Physics Support |
|--------|------|----------|----------------|
| **USD/USDA/USDC** | Universal Scene | Native format | Full |
| **URDF** | Robot Description | ROS robots | Automatic conversion |
| **STL** | Mesh | CAD export | Manual setup |
| **OBJ** | Mesh | 3D models | Manual setup |
| **FBX** | Mesh + Animation | Game assets | Manual setup |
| **DAE (Collada)** | Mesh | 3D models | Manual setup |

### USD Advantages

- **Hierarchical composition**: Layer-based editing
- **Performance**: Optimized for real-time rendering
- **Physics**: Native PhysX integration
- **Scalability**: Handles large scenes efficiently

## Importing URDF Robot Models

### Method 1: GUI-Based URDF Import

**Step 1: Prepare URDF Files**

Example directory structure:
```
my_robot/
├── urdf/
│   └── my_robot.urdf
├── meshes/
│   ├── base_link.stl
│   ├── link1.stl
│   └── link2.stl
└── config/
    └── joint_limits.yaml
```

**Step 2: Import via Isaac Sim UI**

1. **File** → **Import**
2. Select file type: **URDF (*.urdf)**
3. Navigate to your `.urdf` file
4. Configure import options:

```
Import Settings:
✓ Fix Base Link
✓ Import Inertia Tensor
✓ Self Collision
  Distance Between Wheels: 0.0
  Drive Type: None
□ Create Physics Scene
  Joint Drive Type: Position
  Joint Drive Strength: 1000.0
```

5. Click **Import**

**Step 3: Verify Import**

```python
# Check in Python console (Window → Script Editor)
from pxr import Usd, UsdPhysics
stage = omni.usd.get_context().get_stage()

# Find imported robot
robot_prim = stage.GetPrimAtPath("/World/my_robot")
print(f"Robot imported: {robot_prim.IsValid()}")

# Check articulation
if UsdPhysics.ArticulationRootAPI(robot_prim):
    print("ArticulationRoot API applied ✓")
```

### Method 2: Python API URDF Import

```python
# import_urdf.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.utils.extensions import enable_extension
from omni.importer.urdf import _urdf
import carb

# Enable URDF importer extension
enable_extension("omni.importer.urdf")

# Create world
world = World()
world.scene.add_default_ground_plane()

# URDF import configuration
urdf_path = "/path/to/your/robot.urdf"
robot_prim_path = "/World/MyRobot"

# Import options
import_config = _urdf.ImportConfig()
import_config.merge_fixed_joints = False
import_config.convex_decomp = False
import_config.import_inertia_tensor = True
import_config.fix_base = True
import_config.distance_scale = 1.0
import_config.default_drive_type = _urdf.UrdfJointTargetType.JOINT_DRIVE_POSITION
import_config.default_drive_strength = 1000.0
import_config.default_position_drive_damping = 100.0

# Perform import
success, robot_prim_path = omni.kit.commands.execute(
    "URDFParseAndImportFile",
    urdf_path=urdf_path,
    import_config=import_config,
    dest_path=robot_prim_path
)

if success:
    print(f"✓ Robot imported successfully at: {robot_prim_path}")

    # Add to scene
    from omni.isaac.core.robots import Robot
    robot = world.scene.add(Robot(prim_path=robot_prim_path, name="my_robot"))

    world.reset()

    # Test robot
    for i in range(500):
        world.step(render=True)
else:
    print("✗ Import failed")
    carb.log_error("URDF import failed")

simulation_app.close()
```

### Advanced URDF Import with Custom Properties

```python
# advanced_urdf_import.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.importer.urdf import _urdf
from pxr import Gf, UsdPhysics, PhysxSchema
import omni.kit.commands

world = World()
world.scene.add_default_ground_plane()

# Import configuration
import_config = _urdf.ImportConfig()
import_config.set_defaults()

# Custom settings
import_config.merge_fixed_joints = True  # Simplify model
import_config.convex_decomp = True  # Better collision detection
import_config.import_inertia_tensor = True
import_config.fix_base = False  # Mobile robot
import_config.self_collision = True
import_config.default_drive_type = _urdf.UrdfJointTargetType.JOINT_DRIVE_POSITION

# Joint drive parameters
import_config.default_drive_strength = 5000.0
import_config.default_position_drive_damping = 500.0

# Import
urdf_path = "/path/to/mobile_robot.urdf"
success, prim_path = omni.kit.commands.execute(
    "URDFParseAndImportFile",
    urdf_path=urdf_path,
    import_config=import_config,
    dest_path="/World/MobileRobot"
)

if success:
    stage = omni.usd.get_context().get_stage()
    robot_prim = stage.GetPrimAtPath(prim_path)

    # Apply additional physics properties
    articulation_api = UsdPhysics.ArticulationRootAPI.Apply(robot_prim)
    articulation_api.CreateEnabledSelfCollisionsAttr(True)

    # Configure PhysX properties
    physx_api = PhysxSchema.PhysxArticulationAPI.Apply(robot_prim)
    physx_api.CreateSolverPositionIterationCountAttr(32)
    physx_api.CreateSolverVelocityIterationCountAttr(16)

    print(f"✓ Advanced import complete: {prim_path}")

simulation_app.close()
```

## Importing CAD Meshes

### Converting STL to USD

```python
# stl_to_usd.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from pxr import Usd, UsdGeom, Gf
import omni.kit.commands
from omni.isaac.core import World

world = World()

# Method 1: Direct import via Omniverse
stl_file = "/path/to/robot_part.stl"
usd_output = "/World/ImportedMesh"

# Import STL
omni.kit.commands.execute(
    'CreateMeshPrimWithDefaultXform',
    prim_type='Cube',  # Will be replaced
    prim_path=usd_output
)

# Load mesh from file
from omni.kit.asset_converter import AssetConverterContext, convert_asset

# Configure converter
converter_context = AssetConverterContext()
task = converter_context.convert_asset(
    input_asset=stl_file,
    output_asset="/tmp/converted.usd",
    progress_callback=lambda *args: None
)

success, errors = task.wait_until_finished()

if success:
    # Load converted USD
    stage = omni.usd.get_context().get_stage()
    stage.GetRootLayer().subLayerPaths.append("/tmp/converted.usd")
    print("✓ STL converted and loaded")
else:
    print(f"✗ Conversion failed: {errors}")

simulation_app.close()
```

### Batch Convert Multiple Meshes

```python
# batch_convert_meshes.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": True})  # Headless for batch processing

from omni.kit.asset_converter import AssetConverterContext
import os
import glob

# Input/output directories
input_dir = "/path/to/cad/meshes"
output_dir = "/path/to/usd/meshes"

os.makedirs(output_dir, exist_ok=True)

# Supported formats
mesh_files = []
for ext in ["*.stl", "*.obj", "*.fbx"]:
    mesh_files.extend(glob.glob(os.path.join(input_dir, ext)))

print(f"Found {len(mesh_files)} mesh files to convert")

# Convert each mesh
converter = AssetConverterContext()

for mesh_file in mesh_files:
    basename = os.path.splitext(os.path.basename(mesh_file))[0]
    output_file = os.path.join(output_dir, f"{basename}.usd")

    print(f"Converting: {basename}...")

    task = converter.convert_asset(
        input_asset=mesh_file,
        output_asset=output_file,
        progress_callback=lambda current, total, msg: print(f"  {msg}")
    )

    success, errors = task.wait_until_finished()

    if success:
        print(f"  ✓ Saved to: {output_file}")
    else:
        print(f"  ✗ Failed: {errors}")

print("Batch conversion complete!")
simulation_app.close()
```

### Adding Physics to Imported Meshes

```python
# add_physics_to_mesh.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from pxr import Usd, UsdGeom, UsdPhysics, PhysxSchema, Gf
import omni.usd

world = World()
world.scene.add_default_ground_plane()

# Load converted mesh
mesh_usd_path = "/tmp/converted.usd"
mesh_prim_path = "/World/CustomMesh"

stage = omni.usd.get_context().get_stage()
add_reference_to_stage(usd_path=mesh_usd_path, prim_path=mesh_prim_path)

# Get mesh prim
mesh_prim = stage.GetPrimAtPath(mesh_prim_path)

# Add collision
collision_api = UsdPhysics.CollisionAPI.Apply(mesh_prim)

# Add rigid body (for dynamic objects)
rigid_body_api = UsdPhysics.RigidBodyAPI.Apply(mesh_prim)
rigid_body_api.CreateRigidBodyEnabledAttr(True)

# Set mass
mass_api = UsdPhysics.MassAPI.Apply(mesh_prim)
mass_api.CreateMassAttr(5.0)  # 5 kg

# Configure collision shape (use convex hull for performance)
mesh_collision_api = UsdPhysics.MeshCollisionAPI.Apply(mesh_prim)
mesh_collision_api.CreateApproximationAttr("convexHull")

# PhysX properties
physx_api = PhysxSchema.PhysxRigidBodyAPI.Apply(mesh_prim)
physx_api.CreateLinearDampingAttr(0.1)
physx_api.CreateAngularDampingAttr(0.05)

# Position mesh above ground
xform = UsdGeom.Xformable(mesh_prim)
xform.ClearXformOpOrder()
translate_op = xform.AddTranslateOp()
translate_op.Set(Gf.Vec3d(0, 0, 2))

print("✓ Physics added to mesh")

world.reset()

# Test simulation
for i in range(500):
    world.step(render=True)

simulation_app.close()
```

## Material and Texture Management

### Applying Materials via GUI

1. **Create** → **Material** → **OmniPBR**
2. Name material (e.g., "RobotMetal")
3. Configure properties:
   - **Albedo**: Base color
   - **Roughness**: 0.3 (shiny metal)
   - **Metallic**: 1.0 (fully metallic)
4. Drag material onto mesh in viewport

### Applying Materials via Python

```python
# apply_materials.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from pxr import Sdf, UsdShade, Gf
from omni.isaac.core import World
import omni.usd

world = World()
stage = omni.usd.get_context().get_stage()

# Create material
material_path = "/World/Looks/RobotMaterial"
material = UsdShade.Material.Define(stage, material_path)

# Create PBR shader
shader = UsdShade.Shader.Define(stage, f"{material_path}/Shader")
shader.CreateIdAttr("UsdPreviewSurface")

# Set material properties
shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(0.1, 0.3, 0.8))
shader.CreateInput("metallic", Sdf.ValueTypeNames.Float).Set(0.8)
shader.CreateInput("roughness", Sdf.ValueTypeNames.Float).Set(0.3)

# Connect shader to material
material.CreateSurfaceOutput().ConnectToSource(shader.ConnectableAPI(), "surface")

# Apply material to mesh
mesh_prim = stage.GetPrimAtPath("/World/MyRobot/base_link")
binding_api = UsdShade.MaterialBindingAPI.Apply(mesh_prim)
binding_api.Bind(material)

print("✓ Material applied")

simulation_app.close()
```

### Loading Textures

```python
# apply_textured_material.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from pxr import Sdf, UsdShade, Gf
from omni.isaac.core import World
import omni.usd

world = World()
stage = omni.usd.get_context().get_stage()

# Create material with texture
material_path = "/World/Looks/TexturedMaterial"
material = UsdShade.Material.Define(stage, material_path)

shader = UsdShade.Shader.Define(stage, f"{material_path}/Shader")
shader.CreateIdAttr("UsdPreviewSurface")

# Create texture reader
texture_path = "/path/to/texture.png"
tex_reader = UsdShade.Shader.Define(stage, f"{material_path}/TextureReader")
tex_reader.CreateIdAttr("UsdUVTexture")
tex_reader.CreateInput("file", Sdf.ValueTypeNames.Asset).Set(texture_path)

# Connect texture to shader
diffuse_input = shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f)
diffuse_input.ConnectToSource(tex_reader.ConnectableAPI(), "rgb")

# Configure UV coordinates
st_reader = UsdShade.Shader.Define(stage, f"{material_path}/STReader")
st_reader.CreateIdAttr("UsdPrimvarReader_float2")
st_reader.CreateInput("varname", Sdf.ValueTypeNames.Token).Set("st")

tex_coord_input = tex_reader.CreateInput("st", Sdf.ValueTypeNames.Float2)
tex_coord_input.ConnectToSource(st_reader.ConnectableAPI(), "result")

# Connect to material
material.CreateSurfaceOutput().ConnectToSource(shader.ConnectableAPI(), "surface")

# Apply to mesh
mesh_prim = stage.GetPrimAtPath("/World/MyMesh")
UsdShade.MaterialBindingAPI.Apply(mesh_prim).Bind(material)

print("✓ Textured material applied")

simulation_app.close()
```

## Mesh Optimization for Simulation

### Simplifying Complex Meshes

```python
# simplify_mesh.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": True})

from pxr import Usd, UsdGeom
import omni.usd
import omni.kit.commands

stage = omni.usd.get_context().get_stage()

# Load high-poly mesh
mesh_path = "/World/HighPolyMesh"
mesh_prim = stage.GetPrimAtPath(mesh_path)

# Get mesh data
mesh = UsdGeom.Mesh(mesh_prim)
points_attr = mesh.GetPointsAttr()
faces_attr = mesh.GetFaceVertexCountsAttr()

original_points = len(points_attr.Get())
original_faces = sum(faces_attr.Get())

print(f"Original: {original_points} vertices, {original_faces} faces")

# Use Omniverse mesh decimation
omni.kit.commands.execute(
    'DecimateCommand',
    prim_path=mesh_path,
    target_percentage=0.5,  # Reduce to 50% of original
    method="quadric"  # Quality-preserving algorithm
)

# Check result
new_points = len(mesh.GetPointsAttr().Get())
new_faces = sum(mesh.GetFaceVertexCountsAttr().Get())

print(f"Simplified: {new_points} vertices, {new_faces} faces")
print(f"Reduction: {(1 - new_points/original_points)*100:.1f}%")

# Save optimized mesh
optimized_path = "/tmp/optimized_mesh.usd"
export_layer = Sdf.Layer.CreateNew(optimized_path)
export_layer.TransferContent(stage.GetRootLayer())
export_layer.Save()

print(f"✓ Saved optimized mesh: {optimized_path}")

simulation_app.close()
```

### Creating Collision Proxies

```python
# create_collision_proxy.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from pxr import Usd, UsdGeom, UsdPhysics, Gf
import omni.usd

world = World()
stage = omni.usd.get_context().get_stage()

# Original complex mesh (for rendering)
visual_mesh_path = "/World/Robot/visual_link"

# Create simple collision proxy (box approximation)
collision_mesh_path = "/World/Robot/collision_link"

# Define collision box
collision_box = UsdGeom.Cube.Define(stage, collision_mesh_path)
collision_box.CreateSizeAttr(1.0)

# Position to match visual mesh
xform = UsdGeom.Xformable(collision_box)
xform.AddTranslateOp().Set(Gf.Vec3d(0, 0, 0.5))

# Apply collision
UsdPhysics.CollisionAPI.Apply(collision_box.GetPrim())

# Make visual mesh non-collidable
visual_prim = stage.GetPrimAtPath(visual_mesh_path)
visual_prim.CreateAttribute("physics:collisionEnabled", Sdf.ValueTypeNames.Bool).Set(False)

print("✓ Collision proxy created")
print("  Visual: detailed mesh (no collision)")
print("  Collision: simple box (physics only)")

simulation_app.close()
```

### LOD (Level of Detail) System

```python
# lod_system.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from pxr import Usd, UsdGeom, Gf
import omni.usd

stage = omni.usd.get_context().get_stage()

# Create LOD hierarchy
lod_root = "/World/RobotWithLOD"

# High detail mesh (close view)
high_lod_path = f"{lod_root}/LOD_High"
# Load high-poly mesh here

# Medium detail (medium distance)
medium_lod_path = f"{lod_root}/LOD_Medium"
# Load medium-poly mesh here

# Low detail (far distance)
low_lod_path = f"{lod_root}/LOD_Low"
# Load low-poly mesh here

# Script to switch LOD based on camera distance
def update_lod(camera_pos, object_pos):
    distance = (camera_pos - object_pos).GetLength()

    if distance < 5.0:
        # Show high LOD
        stage.GetPrimAtPath(high_lod_path).GetAttribute("visibility").Set("inherited")
        stage.GetPrimAtPath(medium_lod_path).GetAttribute("visibility").Set("invisible")
        stage.GetPrimAtPath(low_lod_path).GetAttribute("visibility").Set("invisible")
    elif distance < 20.0:
        # Show medium LOD
        stage.GetPrimAtPath(high_lod_path).GetAttribute("visibility").Set("invisible")
        stage.GetPrimAtPath(medium_lod_path).GetAttribute("visibility").Set("inherited")
        stage.GetPrimAtPath(low_lod_path).GetAttribute("visibility").Set("invisible")
    else:
        # Show low LOD
        stage.GetPrimAtPath(high_lod_path).GetAttribute("visibility").Set("invisible")
        stage.GetPrimAtPath(medium_lod_path).GetAttribute("visibility").Set("invisible")
        stage.GetPrimAtPath(low_lod_path).GetAttribute("visibility").Set("inherited")

simulation_app.close()
```

## Creating Asset Libraries

### Organizing Custom Assets

```bash
# Create asset library structure
mkdir -p ~/isaac-assets/{robots,environments,props,materials}

# Directory structure:
isaac-assets/
├── robots/
│   ├── my_robot/
│   │   ├── my_robot.usd
│   │   ├── meshes/
│   │   └── textures/
│   └── another_robot/
├── environments/
│   ├── warehouse/
│   └── office/
├── props/
│   ├── boxes/
│   └── tools/
└── materials/
    ├── metals/
    └── plastics/
```

### Registering Asset Library

```python
# register_asset_library.py
import carb.settings
import omni.client

# Get settings interface
settings = carb.settings.get_settings()

# Register custom asset path
custom_library_path = "/home/user/isaac-assets"
settings.set("/persistent/exts/omni.isaac.assets/customAssets", [custom_library_path])

# Or via Omniverse:
# Edit → Preferences → Isaac Sim → Assets
# Add custom asset path

print(f"✓ Asset library registered: {custom_library_path}")
```

### Creating Asset Metadata

```python
# create_asset_metadata.py
import json

# Asset metadata file
metadata = {
    "name": "Custom Mobile Robot",
    "version": "1.0.0",
    "author": "Your Name",
    "description": "Custom differential drive robot for warehouse navigation",
    "tags": ["robot", "mobile", "warehouse"],
    "thumbnail": "thumbnail.png",
    "usd_file": "mobile_robot.usd",
    "physics_properties": {
        "mass": 25.0,
        "wheel_radius": 0.1,
        "wheel_separation": 0.4
    },
    "sensors": ["lidar", "camera", "imu"],
    "compatible_controllers": ["nav2", "custom_controller"]
}

# Save metadata
with open("/home/user/isaac-assets/robots/my_robot/metadata.json", 'w') as f:
    json.dump(metadata, f, indent=2)

print("✓ Asset metadata created")
```

## Hands-On Exercises

### Exercise 1: Import and Configure Custom Robot

Create a complete workflow to import a URDF robot:

```python
# exercise1_complete_import.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.importer.urdf import _urdf
from pxr import UsdPhysics, PhysxSchema, UsdShade, Gf, Sdf
import omni.kit.commands
import omni.usd

world = World()
world.scene.add_default_ground_plane()
stage = omni.usd.get_context().get_stage()

# Step 1: Import URDF
print("Step 1: Importing URDF...")
import_config = _urdf.ImportConfig()
import_config.set_defaults()
import_config.merge_fixed_joints = True
import_config.fix_base = False
import_config.self_collision = True

success, prim_path = omni.kit.commands.execute(
    "URDFParseAndImportFile",
    urdf_path="/path/to/your/robot.urdf",
    import_config=import_config,
    dest_path="/World/CustomRobot"
)

if not success:
    print("✗ Import failed!")
    simulation_app.close()
    exit(1)

# Step 2: Configure physics
print("Step 2: Configuring physics...")
robot_prim = stage.GetPrimAtPath(prim_path)
physx_api = PhysxSchema.PhysxArticulationAPI.Apply(robot_prim)
physx_api.CreateSolverPositionIterationCountAttr(32)
physx_api.CreateSolverVelocityIterationCountAttr(16)

# Step 3: Apply materials
print("Step 3: Applying materials...")
material = UsdShade.Material.Define(stage, "/World/Looks/RobotMaterial")
shader = UsdShade.Shader.Define(stage, "/World/Looks/RobotMaterial/Shader")
shader.CreateIdAttr("UsdPreviewSurface")
shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(0.2, 0.4, 0.8))
shader.CreateInput("metallic", Sdf.ValueTypeNames.Float).Set(0.7)
shader.CreateInput("roughness", Sdf.ValueTypeNames.Float).Set(0.4)
material.CreateSurfaceOutput().ConnectToSource(shader.ConnectableAPI(), "surface")

# Apply to all links
for prim in robot_prim.GetAllChildren():
    if prim.GetTypeName() == "Mesh":
        UsdShade.MaterialBindingAPI.Apply(prim).Bind(material)

# Step 4: Test simulation
print("Step 4: Running simulation...")
from omni.isaac.core.robots import Robot
robot = world.scene.add(Robot(prim_path=prim_path, name="custom_robot"))
world.reset()

for i in range(500):
    world.step(render=True)

print("✓ Exercise complete!")
simulation_app.close()
```

### Exercise 2: Optimize High-Poly Model

Take a complex CAD model and optimize it for simulation:

```python
# exercise2_optimize_model.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": True})

from pxr import Usd, UsdGeom, UsdPhysics
import omni.usd
import omni.kit.commands

stage = omni.usd.get_context().get_stage()

# Load high-poly model
high_poly_path = "/World/HighPolyRobot"
# Assume model is already loaded

# Step 1: Create visual mesh (keep original quality)
visual_path = f"{high_poly_path}_visual"
omni.kit.commands.execute('CopyPrim',
    path_from=high_poly_path,
    path_to=visual_path
)

# Step 2: Create collision mesh (simplified)
collision_path = f"{high_poly_path}_collision"
omni.kit.commands.execute('CopyPrim',
    path_from=high_poly_path,
    path_to=collision_path
)

# Simplify collision mesh to 10% of original
omni.kit.commands.execute(
    'DecimateCommand',
    prim_path=collision_path,
    target_percentage=0.1,
    method="quadric"
)

# Apply physics only to collision mesh
collision_prim = stage.GetPrimAtPath(collision_path)
UsdPhysics.CollisionAPI.Apply(collision_prim)
UsdPhysics.RigidBodyAPI.Apply(collision_prim)

# Disable collision on visual mesh
visual_prim = stage.GetPrimAtPath(visual_path)
visual_prim.CreateAttribute("physics:collisionEnabled", Sdf.ValueTypeNames.Bool).Set(False)

print("✓ Model optimized for simulation")
print(f"  Visual: {visual_path} (high quality, no physics)")
print(f"  Collision: {collision_path} (low poly, physics enabled)")

simulation_app.close()
```

## Troubleshooting Common Issues

### Issue 1: URDF Import Fails

**Symptoms**: Error importing URDF file

**Solutions**:
```bash
# Check URDF validity
check_urdf your_robot.urdf

# Common issues:
# 1. Missing mesh files
find . -name "*.stl" -o -name "*.dae"

# 2. Absolute paths in URDF (should be relative)
# Fix: Use package:// or relative paths

# 3. Invalid joint types
# Ensure joints are: revolute, prismatic, continuous, fixed

# 4. Missing inertia values
# Add <inertial> blocks to all links
```

### Issue 2: Textures Not Loading

**Symptoms**: White or incorrect textures

**Solutions**:
```python
# Verify texture paths are absolute or relative to USD
material_input.Set("./textures/albedo.png")  # Relative
material_input.Set("/absolute/path/albedo.png")  # Absolute

# Check texture format (supported: PNG, JPG, EXR, HDR)
# Verify file permissions

# Clear texture cache
import carb.settings
settings = carb.settings.get_settings()
settings.set("/rtx/materialDb/clearCacheOnStart", True)
```

### Issue 3: Physics Behaves Incorrectly After Import

**Symptoms**: Robot falls apart or unstable

**Solutions**:
```python
# Check mass properties
from pxr import UsdPhysics
mass_api = UsdPhysics.MassAPI.Get(stage, link_path)
print(mass_api.GetMassAttr().Get())

# Verify collision shapes
collision_api = UsdPhysics.CollisionAPI.Get(stage, link_path)
print(collision_api.GetCollisionEnabledAttr().Get())

# Increase solver iterations
physx_api = PhysxSchema.PhysxArticulationAPI.Get(robot_prim)
physx_api.CreateSolverPositionIterationCountAttr(64)

# Check joint limits
articulation = UsdPhysics.ArticulationRootAPI.Get(robot_prim)
```

## Summary

You've successfully:
- ✓ Imported URDF robot models into Isaac Sim
- ✓ Converted CAD meshes to USD format
- ✓ Applied physics properties to custom assets
- ✓ Created and managed materials and textures
- ✓ Optimized meshes for simulation performance
- ✓ Organized custom asset libraries

**Key Takeaways**:
- URDF import is fully automated with configurable options
- Separate visual and collision meshes for performance
- Material and texture management uses USD Shader framework
- Mesh optimization critical for real-time simulation
- Asset libraries enable reusability across projects

## Next Steps

Continue to [Lab: Build Warehouse Environment](./04-lab-warehouse.md) to apply your knowledge:
- Build complete warehouse simulation
- Import and arrange multiple assets
- Configure realistic physics and lighting
- Optimize scene for performance

## Additional Resources

- [URDF Importer Documentation](https://docs.omniverse.nvidia.com/app_isaacsim/app_isaacsim/ext_omni_isaac_urdf.html)
- [USD Asset Converter](https://docs.omniverse.nvidia.com/extensions/latest/ext_asset-converter.html)
- [Material System Guide](https://docs.omniverse.nvidia.com/materials-and-rendering/latest/index.html)
- [Mesh Optimization Best Practices](https://docs.omniverse.nvidia.com/isaacsim/latest/advanced_tutorials/tutorial_advanced_importing_and_converting_assets.html)
