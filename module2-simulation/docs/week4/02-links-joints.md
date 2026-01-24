---
sidebar_position: 2
---

# Links, Joints & Kinematics

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: URDF Basics

### Learning Objectives

- Understand link elements (visual, collision, inertial)
- Learn joint types and their properties
- Create parent-child relationships
- Understand coordinate frames and TF
- Build a basic 2-wheel robot

### What are Links and Joints?

**Links** are the rigid bodies of your robot (chassis, wheels, arms, sensors).

**Joints** connect links and define how they move relative to each other.

**Together** they form your robot's kinematic structure.

### Link Elements

Every link can have three components:

```xml
<link name="my_link">
  <!-- Visual: what you see -->
  <visual>
    <geometry>
      <box size="0.5 0.3 0.2"/>
    </geometry>
    <material name="blue">
      <color rgba="0 0 0.8 1"/>
    </material>
  </visual>

  <!-- Collision: for physics simulation -->
  <collision>
    <geometry>
      <box size="0.5 0.3 0.2"/>
    </geometry>
  </collision>

  <!-- Inertial: mass and inertia for dynamics -->
  <inertial>
    <mass value="10.0"/>
    <inertia ixx="0.1" ixy="0.0" ixz="0.0"
             iyy="0.1" iyz="0.0" izz="0.1"/>
  </inertial>
</link>
```

### Visual Element

**Purpose**: Define what the link looks like in visualization tools (RViz2, Gazebo GUI).

```xml
<visual>
  <!-- Origin: position and orientation relative to link frame -->
  <origin xyz="0 0 0" rpy="0 0 0"/>

  <!-- Geometry: shape of the visual -->
  <geometry>
    <!-- Box -->
    <box size="0.6 0.4 0.2"/>

    <!-- Or Cylinder -->
    <!-- <cylinder radius="0.1" length="0.3"/> -->

    <!-- Or Sphere -->
    <!-- <sphere radius="0.1"/> -->

    <!-- Or Mesh -->
    <!-- <mesh filename="package://my_robot/meshes/chassis.stl" scale="1 1 1"/> -->
  </geometry>

  <!-- Material: color or texture -->
  <material name="blue">
    <color rgba="0 0 0.8 1"/>  <!-- Red Green Blue Alpha -->
  </material>
</visual>
```

### Collision Element

**Purpose**: Define the shape used for collision detection in simulation.

**Best Practice**: Use simpler shapes than visual for better performance.

```xml
<collision>
  <origin xyz="0 0 0" rpy="0 0 0"/>
  <geometry>
    <!-- Simpler shape for faster collision detection -->
    <box size="0.6 0.4 0.2"/>
  </geometry>
</collision>
```

**Example**: Visual uses detailed mesh, collision uses simple box:

```xml
<link name="robot_chassis">
  <visual>
    <geometry>
      <mesh filename="package://my_robot/meshes/detailed_chassis.dae"/>
    </geometry>
    <material name="gray">
      <color rgba="0.5 0.5 0.5 1"/>
    </material>
  </visual>

  <collision>
    <!-- Simple box for collision, much faster -->
    <geometry>
      <box size="0.6 0.4 0.2"/>
    </geometry>
  </collision>
</link>
```

### Inertial Element

**Purpose**: Define mass and inertia tensor for physics simulation.

**Required for**: Gazebo simulation with physics.

```xml
<inertial>
  <!-- Origin: center of mass -->
  <origin xyz="0 0 0" rpy="0 0 0"/>

  <!-- Mass in kg -->
  <mass value="10.0"/>

  <!-- Inertia tensor (kg⋅m²) -->
  <inertia ixx="0.4" ixy="0.0" ixz="0.0"
           iyy="0.8" iyz="0.0" izz="1.0"/>
</inertial>
```

**Simple inertia calculations** (for common shapes):

**Box** (width w, depth d, height h):
```
ixx = (1/12) * mass * (d² + h²)
iyy = (1/12) * mass * (w² + h²)
izz = (1/12) * mass * (w² + d²)
```

**Cylinder** (radius r, height h):
```
ixx = (1/12) * mass * (3*r² + h²)
iyy = (1/12) * mass * (3*r² + h²)
izz = (1/2) * mass * r²
```

**Sphere** (radius r):
```
ixx = iyy = izz = (2/5) * mass * r²
```

### Joint Types

ROS 2 URDF supports 6 joint types:

#### 1. Fixed Joint

**No movement** - rigidly connects two links.

```xml
<joint name="camera_joint" type="fixed">
  <parent link="base_link"/>
  <child link="camera_link"/>
  <origin xyz="0.3 0 0.2" rpy="0 0 0"/>
</joint>
```

**Use case**: Mounting sensors, attaching fixed parts.

#### 2. Revolute Joint

**Rotational** with limits (like a hinge with stops).

```xml
<joint name="wheel_joint" type="revolute">
  <parent link="base_link"/>
  <child link="wheel_link"/>
  <origin xyz="0 0.2 0" rpy="0 0 0"/>

  <!-- Axis of rotation -->
  <axis xyz="0 1 0"/>  <!-- Rotate around Y-axis -->

  <!-- Limits -->
  <limit lower="-1.57" upper="1.57"  <!-- -90° to +90° -->
         effort="10.0"                <!-- Max torque (N⋅m) -->
         velocity="2.0"/>              <!-- Max velocity (rad/s) -->
</joint>
```

**Use case**: Robot arms, articulated joints with limited range.

#### 3. Continuous Joint

**Unlimited rotation** (like a wheel).

```xml
<joint name="wheel_joint" type="continuous">
  <parent link="base_link"/>
  <child link="wheel_link"/>
  <origin xyz="0 0.2 0" rpy="-1.5708 0 0"/>  <!-- Rotate to align -->

  <axis xyz="0 0 1"/>  <!-- Rotation axis -->

  <limit effort="10.0" velocity="20.0"/>  <!-- No position limits -->
</joint>
```

**Use case**: Wheels, propellers, continuous rotation mechanisms.

#### 4. Prismatic Joint

**Linear sliding** with limits.

```xml
<joint name="lift_joint" type="prismatic">
  <parent link="base_link"/>
  <child link="platform_link"/>
  <origin xyz="0 0 0.5" rpy="0 0 0"/>

  <axis xyz="0 0 1"/>  <!-- Slide along Z-axis -->

  <limit lower="0.0" upper="1.0"  <!-- 0 to 1 meter -->
         effort="100.0"            <!-- Max force (N) -->
         velocity="0.5"/>          <!-- Max velocity (m/s) -->
</joint>
```

**Use case**: Linear actuators, elevators, sliding mechanisms.

#### 5. Floating Joint

**6 DOF** - completely free movement (all 3 translations + 3 rotations).

**Rarely used** - mainly for simulation of free-floating objects.

#### 6. Planar Joint

**3 DOF** - movement in a plane (2 translations + 1 rotation).

**Rarely used** - specialized applications.

### Parent-Child Relationships

**Key concept**: Joints connect a **parent link** to a **child link**.

```
base_link (parent)
    ↓ (joint)
wheel_link (child)
```

**The kinematic tree**:
- Must have ONE root link (no parent)
- All other links connected via joints
- Forms a tree structure (no loops in basic URDF)

**Example tree**:
```
base_link (root)
├── left_wheel (continuous joint)
├── right_wheel (continuous joint)
├── caster_wheel (fixed joint)
└── sensor_mount (fixed joint)
    └── camera (fixed joint)
```

### Coordinate Frames

**Every link has its own coordinate frame**.

**Joint origin** defines where the child frame is relative to the parent frame.

```xml
<joint name="camera_joint" type="fixed">
  <parent link="base_link"/>
  <child link="camera_link"/>
  <!-- camera_link frame is 0.3m forward, 0.2m up from base_link -->
  <origin xyz="0.3 0 0.2" rpy="0 0 0"/>
</joint>
```

**ROS 2 convention** (REP 103):
- **X**: Forward
- **Y**: Left
- **Z**: Up
- **Roll-Pitch-Yaw**: Intrinsic rotations (Z-Y-X order)

### Lab: Build a Simple 2-Wheel Robot

**Goal**: Create a differential drive robot with two wheels and a caster.

**my_2wheel_robot.urdf**:
```xml
<?xml version="1.0"?>
<robot name="simple_2wheel">

  <!-- Base Link (Chassis) -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.6 0.4 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>

    <collision>
      <geometry>
        <box size="0.6 0.4 0.2"/>
      </geometry>
    </collision>

    <inertial>
      <mass value="10.0"/>
      <inertia ixx="0.17" ixy="0.0" ixz="0.0"
               iyy="0.37" iyz="0.0" izz="0.47"/>
    </inertial>
  </link>

  <!-- Left Wheel -->
  <link name="left_wheel">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>

    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>

    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.0026" ixy="0.0" ixz="0.0"
               iyy="0.0026" iyz="0.0" izz="0.005"/>
    </inertial>
  </link>

  <!-- Left Wheel Joint -->
  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel"/>
    <origin xyz="0 0.225 0" rpy="-1.5708 0 0"/>
    <axis xyz="0 0 1"/>
    <limit effort="10.0" velocity="10.0"/>
  </joint>

  <!-- Right Wheel -->
  <link name="right_wheel">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>

    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>

    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.0026" ixy="0.0" ixz="0.0"
               iyy="0.0026" iyz="0.0" izz="0.005"/>
    </inertial>
  </link>

  <!-- Right Wheel Joint -->
  <joint name="right_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="right_wheel"/>
    <origin xyz="0 -0.225 0" rpy="-1.5708 0 0"/>
    <axis xyz="0 0 1"/>
    <limit effort="10.0" velocity="10.0"/>
  </joint>

  <!-- Caster Wheel -->
  <link name="caster_wheel">
    <visual>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
      <material name="gray">
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
      <inertia ixx="0.0005" ixy="0.0" ixz="0.0"
               iyy="0.0005" iyz="0.0" izz="0.0005"/>
    </inertial>
  </link>

  <!-- Caster Joint -->
  <joint name="caster_joint" type="fixed">
    <parent link="base_link"/>
    <child link="caster_wheel"/>
    <origin xyz="-0.25 0 -0.15" rpy="0 0 0"/>
  </joint>

</robot>
```

**Visualize in RViz2**:

```bash
# Check URDF
check_urdf my_2wheel_robot.urdf

# View in RViz2
ros2 launch urdf_tutorial display.launch.py model:=my_2wheel_robot.urdf
```

**What you should see**:
- Blue rectangular chassis (base_link)
- Two black wheels on the sides (continuous joints)
- Gray caster sphere at the back (fixed joint)
- Interactive joint sliders for the wheels

### Understanding the TF Tree

**TF (Transform)** tracks coordinate frame relationships.

**View TF tree**:
```bash
# Install if needed
sudo apt install ros-humble-tf2-tools

# View frames
ros2 run tf2_tools view_frames

# This creates frames.pdf showing the tree
```

**Your robot's TF tree**:
```
base_link
├── left_wheel
├── right_wheel
└── caster_wheel
```

**Check transforms**:
```bash
# Echo transform from base_link to left_wheel
ros2 run tf2_ros tf2_echo base_link left_wheel
```

### Key Takeaways (Beginner)

✅ **Links** have visual, collision, and inertial properties
✅ **Joints** define how links move (fixed, revolute, continuous, prismatic)
✅ **Parent-child** relationships form a kinematic tree
✅ **Coordinate frames** define position and orientation
✅ **TF tree** tracks all coordinate frame transformations

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Understand kinematic chains and DOF
- Calculate inertia tensors accurately
- Implement joint limits and dynamics
- Build multi-DOF robots
- Visualize and debug TF trees

### Kinematic Chains

**Kinematic chain**: Sequence of links connected by joints.

**Degrees of Freedom (DOF)**: Number of independent parameters needed to specify configuration.

**Serial chain example** (robot arm):
```
base
 ↓ (revolute, 1 DOF)
shoulder
 ↓ (revolute, 1 DOF)
elbow
 ↓ (revolute, 1 DOF)
wrist
 ↓ (revolute, 1 DOF)
gripper

Total: 4 DOF
```

**Mobile manipulator**:
```
Differential drive base: 3 DOF (x, y, θ)
+ 4-DOF arm: 4 DOF
= 7 DOF total system
```

### Joint Limits and Dynamics

**Complete joint specification**:

```xml
<joint name="shoulder_joint" type="revolute">
  <parent link="base_link"/>
  <child link="upper_arm"/>
  <origin xyz="0 0 0.1" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>

  <!-- Position limits -->
  <limit lower="-1.57" upper="1.57"    <!-- ±90° -->
         effort="50.0"                 <!-- Max torque: 50 N⋅m -->
         velocity="2.0"/>              <!-- Max speed: 2 rad/s -->

  <!-- Dynamics properties -->
  <dynamics damping="0.7"              <!-- Joint damping (N⋅m⋅s/rad) -->
            friction="1.0"/>           <!-- Coulomb friction (N⋅m) -->
</joint>
```

**Damping**: Resists velocity (like moving through honey).

**Friction**: Static and dynamic friction (stiction).

### Accurate Inertia Tensor Calculation

**Why it matters**: Incorrect inertia causes unrealistic simulation behavior.

**Inertia tensor** (symmetric 3×3 matrix):
```
     | ixx  ixy  ixz |
I =  | ixy  iyy  iyz |
     | ixz  iyz  izz |
```

**For URDF**: Specify 6 unique values (ixx, ixy, ixz, iyy, iyz, izz).

**Common shapes**:

#### Box (width w, depth d, height h, mass m):
```python
ixx = (1.0/12.0) * m * (d*d + h*h)
iyy = (1.0/12.0) * m * (w*w + h*h)
izz = (1.0/12.0) * m * (w*w + d*d)
ixy = ixz = iyz = 0.0
```

#### Cylinder (radius r, height h, mass m):
```python
ixx = (1.0/12.0) * m * (3*r*r + h*h)
iyy = (1.0/12.0) * m * (3*r*r + h*h)
izz = (1.0/2.0) * m * r*r
ixy = ixz = iyz = 0.0
```

#### Sphere (radius r, mass m):
```python
ixx = iyy = izz = (2.0/5.0) * m * r*r
ixy = ixz = iyz = 0.0
```

**Python script for inertia calculation**:

```python
#!/usr/bin/env python3
import math

def box_inertia(mass, width, depth, height):
    """Calculate inertia tensor for a box."""
    ixx = (1.0/12.0) * mass * (depth**2 + height**2)
    iyy = (1.0/12.0) * mass * (width**2 + height**2)
    izz = (1.0/12.0) * mass * (width**2 + depth**2)
    return ixx, iyy, izz

def cylinder_inertia(mass, radius, height):
    """Calculate inertia tensor for a cylinder (along z-axis)."""
    ixx = (1.0/12.0) * mass * (3*radius**2 + height**2)
    iyy = (1.0/12.0) * mass * (3*radius**2 + height**2)
    izz = (1.0/2.0) * mass * radius**2
    return ixx, iyy, izz

def sphere_inertia(mass, radius):
    """Calculate inertia tensor for a sphere."""
    i = (2.0/5.0) * mass * radius**2
    return i, i, i

# Example usage
chassis_mass = 10.0  # kg
chassis_width = 0.6  # m
chassis_depth = 0.4  # m
chassis_height = 0.2  # m

ixx, iyy, izz = box_inertia(chassis_mass, chassis_width, chassis_depth, chassis_height)

print(f"Chassis inertia:")
print(f"  ixx: {ixx:.4f}")
print(f"  iyy: {iyy:.4f}")
print(f"  izz: {izz:.4f}")

# Output:
# Chassis inertia:
#   ixx: 0.1667
#   iyy: 0.3667
#   izz: 0.4667
```

### Complete Differential Drive Robot with Inertia

**diff_drive_robot.urdf.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="diff_drive">

  <!-- Properties -->
  <xacro:property name="chassis_mass" value="10.0"/>
  <xacro:property name="chassis_width" value="0.6"/>
  <xacro:property name="chassis_depth" value="0.4"/>
  <xacro:property name="chassis_height" value="0.2"/>

  <xacro:property name="wheel_mass" value="1.0"/>
  <xacro:property name="wheel_radius" value="0.1"/>
  <xacro:property name="wheel_thickness" value="0.05"/>
  <xacro:property name="wheel_separation" value="0.5"/>

  <!-- Inertia macros -->
  <xacro:macro name="box_inertia" params="m w d h">
    <inertial>
      <mass value="${m}"/>
      <inertia ixx="${(1/12) * m * (d*d + h*h)}" ixy="0.0" ixz="0.0"
               iyy="${(1/12) * m * (w*w + h*h)}" iyz="0.0"
               izz="${(1/12) * m * (w*w + d*d)}"/>
    </inertial>
  </xacro:macro>

  <xacro:macro name="cylinder_inertia" params="m r h">
    <inertial>
      <mass value="${m}"/>
      <inertia ixx="${(1/12) * m * (3*r*r + h*h)}" ixy="0.0" ixz="0.0"
               iyy="${(1/12) * m * (3*r*r + h*h)}" iyz="0.0"
               izz="${(1/2) * m * r*r}"/>
    </inertial>
  </xacro:macro>

  <!-- Base Link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="${chassis_width} ${chassis_depth} ${chassis_height}"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>

    <collision>
      <geometry>
        <box size="${chassis_width} ${chassis_depth} ${chassis_height}"/>
      </geometry>
    </collision>

    <xacro:box_inertia m="${chassis_mass}"
                       w="${chassis_width}"
                       d="${chassis_depth}"
                       h="${chassis_height}"/>
  </link>

  <!-- Wheel Macro -->
  <xacro:macro name="wheel" params="prefix reflect">
    <link name="${prefix}_wheel">
      <visual>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_thickness}"/>
        </geometry>
        <material name="black">
          <color rgba="0 0 0 1"/>
        </material>
      </visual>

      <collision>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_thickness}"/>
        </geometry>
      </collision>

      <xacro:cylinder_inertia m="${wheel_mass}"
                              r="${wheel_radius}"
                              h="${wheel_thickness}"/>
    </link>

    <joint name="${prefix}_wheel_joint" type="continuous">
      <parent link="base_link"/>
      <child link="${prefix}_wheel"/>
      <origin xyz="0 ${reflect * wheel_separation/2} 0" rpy="-1.5708 0 0"/>
      <axis xyz="0 0 1"/>
      <limit effort="10.0" velocity="10.0"/>
      <dynamics damping="0.1" friction="0.1"/>
    </joint>
  </xacro:macro>

  <!-- Instantiate wheels -->
  <xacro:wheel prefix="left" reflect="1"/>
  <xacro:wheel prefix="right" reflect="-1"/>

  <!-- Caster -->
  <link name="caster">
    <visual>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
      <material name="gray">
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
      <inertia ixx="0.0005" ixy="0.0" ixz="0.0"
               iyy="0.0005" iyz="0.0" izz="0.0005"/>
    </inertial>
  </link>

  <joint name="caster_joint" type="fixed">
    <parent link="base_link"/>
    <child link="caster"/>
    <origin xyz="-0.25 0 -0.15" rpy="0 0 0"/>
  </joint>

</robot>
```

**Convert XACRO to URDF**:
```bash
xacro diff_drive_robot.urdf.xacro > diff_drive_robot.urdf
```

### Multi-DOF Robot Arm

**3-DOF arm example**:

```xml
<?xml version="1.0"?>
<robot name="simple_arm">

  <!-- Base -->
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <material name="gray">
        <color rgba="0.5 0.5 0.5 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="2.0"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Link 1 (Shoulder) -->
  <link name="link1">
    <visual>
      <origin xyz="0 0 0.15" rpy="0 0 0"/>
      <geometry>
        <box size="0.05 0.05 0.3"/>
      </geometry>
      <material name="red">
        <color rgba="0.8 0 0 1"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.15" rpy="0 0 0"/>
      <geometry>
        <box size="0.05 0.05 0.3"/>
      </geometry>
    </collision>
    <inertial>
      <origin xyz="0 0 0.15" rpy="0 0 0"/>
      <mass value="0.5"/>
      <inertia ixx="0.004" ixy="0" ixz="0" iyy="0.004" iyz="0" izz="0.0002"/>
    </inertial>
  </link>

  <joint name="shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="link1"/>
    <origin xyz="0 0 0.05" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>  <!-- Pitch -->
    <limit lower="-1.57" upper="1.57" effort="10.0" velocity="2.0"/>
    <dynamics damping="0.5" friction="0.5"/>
  </joint>

  <!-- Link 2 (Elbow) -->
  <link name="link2">
    <visual>
      <origin xyz="0 0 0.15" rpy="0 0 0"/>
      <geometry>
        <box size="0.04 0.04 0.3"/>
      </geometry>
      <material name="green">
        <color rgba="0 0.8 0 1"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.15" rpy="0 0 0"/>
      <geometry>
        <box size="0.04 0.04 0.3"/>
      </geometry>
    </collision>
    <inertial>
      <origin xyz="0 0 0.15" rpy="0 0 0"/>
      <mass value="0.3"/>
      <inertia ixx="0.0024" ixy="0" ixz="0" iyy="0.0024" iyz="0" izz="0.00006"/>
    </inertial>
  </link>

  <joint name="elbow_joint" type="revolute">
    <parent link="link1"/>
    <child link="link2"/>
    <origin xyz="0 0 0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>  <!-- Pitch -->
    <limit lower="-2.0" upper="2.0" effort="5.0" velocity="2.0"/>
    <dynamics damping="0.3" friction="0.3"/>
  </joint>

  <!-- Link 3 (Wrist) -->
  <link name="link3">
    <visual>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <geometry>
        <box size="0.03 0.03 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <geometry>
        <box size="0.03 0.03 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <mass value="0.1"/>
      <inertia ixx="0.00036" ixy="0" ixz="0" iyy="0.00036" iyz="0" izz="0.000008"/>
    </inertial>
  </link>

  <joint name="wrist_joint" type="revolute">
    <parent link="link2"/>
    <child link="link3"/>
    <origin xyz="0 0 0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>  <!-- Pitch -->
    <limit lower="-1.57" upper="1.57" effort="2.0" velocity="2.0"/>
    <dynamics damping="0.1" friction="0.1"/>
  </joint>

</robot>
```

**Visualize and control**:
```bash
ros2 launch urdf_tutorial display.launch.py model:=simple_arm.urdf

# Use GUI sliders to control joints
# Watch the robot move in RViz2
```

### TF Tree Visualization and Debugging

**Publish robot state**:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
import math

class JointStatePublisher(Node):
    def __init__(self):
        super().__init__('joint_state_publisher')

        self.publisher = self.create_publisher(JointState, 'joint_states', 10)
        self.timer = self.create_timer(0.1, self.publish_joint_states)

        self.angle = 0.0

    def publish_joint_states(self):
        msg = JointState()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.name = ['shoulder_joint', 'elbow_joint', 'wrist_joint']

        # Animate joints
        self.angle += 0.05
        msg.position = [
            math.sin(self.angle),
            math.sin(self.angle * 0.5),
            math.sin(self.angle * 0.3)
        ]

        msg.velocity = []
        msg.effort = []

        self.publisher.publish(msg)

def main():
    rclpy.init()
    node = JointStatePublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Debug TF issues**:

```bash
# List all frames
ros2 run tf2_ros tf2_echo --list

# View specific transform
ros2 run tf2_ros tf2_echo base_link link3

# Monitor TF tree for errors
ros2 run tf2_ros tf2_monitor

# Generate PDF of TF tree
ros2 run tf2_tools view_frames
evince frames.pdf
```

### Key Takeaways (Intermediate)

✅ **Kinematic chains** define robot motion capabilities
✅ **Accurate inertia** is critical for realistic simulation
✅ **Joint dynamics** (damping, friction) affect behavior
✅ **XACRO macros** reduce repetition and errors
✅ **TF debugging tools** help diagnose frame issues

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Understand parallel and closed-chain mechanisms
- Implement complex joint dynamics
- Optimize kinematic structures for simulation
- Handle advanced friction and contact models
- Extract parameters from real robots

### Parallel Mechanisms

**Serial chain**: Each joint adds 1 DOF sequentially.

**Parallel mechanism**: Multiple kinematic chains connect same endpoints.

**Example**: Delta robot (3 parallel arms to end effector).

**Challenge in URDF**: Standard URDF only supports tree structures (no loops).

**Solutions**:
1. **Break the loop** with virtual joints (mimic joints in Gazebo)
2. **Use SDF** which supports closed loops
3. **Constrain with plugins** in simulation

**Four-bar linkage example** (simplified):

```xml
<?xml version="1.0"?>
<robot name="four_bar">

  <!-- Base -->
  <link name="base_link">
    <visual>
      <geometry><box size="0.2 0.1 0.05"/></geometry>
      <material name="gray"><color rgba="0.5 0.5 0.5 1"/></material>
    </visual>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
  </link>

  <!-- Link A (driven) -->
  <link name="link_a">
    <visual>
      <origin xyz="0.15 0 0" rpy="0 0 0"/>
      <geometry><box size="0.3 0.05 0.05"/></geometry>
      <material name="red"><color rgba="0.8 0 0 1"/></material>
    </visual>
    <inertial>
      <origin xyz="0.15 0 0" rpy="0 0 0"/>
      <mass value="0.2"/>
      <inertia ixx="0.00005" ixy="0" ixz="0" iyy="0.00155" iyz="0" izz="0.0015"/>
    </inertial>
  </link>

  <joint name="joint_a" type="revolute">
    <parent link="base_link"/>
    <child link="link_a"/>
    <origin xyz="-0.1 0 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="2"/>
  </joint>

  <!-- Link B (coupled) -->
  <link name="link_b">
    <visual>
      <origin xyz="0.15 0 0" rpy="0 0 0"/>
      <geometry><box size="0.3 0.05 0.05"/></geometry>
      <material name="blue"><color rgba="0 0 0.8 1"/></material>
    </visual>
    <inertial>
      <origin xyz="0.15 0 0" rpy="0 0 0"/>
      <mass value="0.2"/>
      <inertia ixx="0.00005" ixy="0" ixz="0" iyy="0.00155" iyz="0" izz="0.0015"/>
    </inertial>
  </link>

  <!-- Mimic joint (follows joint_a) -->
  <joint name="joint_b" type="revolute">
    <parent link="base_link"/>
    <child link="link_b"/>
    <origin xyz="0.1 0 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="2"/>
    <!-- In Gazebo, use plugin to enforce coupling -->
  </joint>

</robot>
```

**Gazebo plugin for coupling** (gazebo tags in URDF):

```xml
<gazebo>
  <plugin name="mimic_joint_plugin" filename="libgazebo_ros_mimic_joint.so">
    <joint>joint_a</joint>
    <mimicJoint>joint_b</mimicJoint>
    <multiplier>1.0</multiplier>
    <offset>0.0</offset>
  </plugin>
</gazebo>
```

### Advanced Dynamics Properties

**Complete joint dynamics**:

```xml
<joint name="elbow" type="revolute">
  <parent link="upper_arm"/>
  <child link="forearm"/>
  <origin xyz="0 0 0.3" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>

  <!-- Limits -->
  <limit lower="-2.5" upper="2.5" effort="100.0" velocity="3.0"/>

  <!-- Dynamics -->
  <dynamics damping="5.0"      <!-- Viscous damping (N⋅m⋅s/rad) -->
            friction="2.0"/>   <!-- Coulomb friction (N⋅m) -->

  <!-- Safety controller (optional) -->
  <safety_controller soft_lower_limit="-2.4"
                     soft_upper_limit="2.4"
                     k_position="100.0"
                     k_velocity="10.0"/>
</joint>
```

**Damping models**:
- **Viscous**: τ = b·ω (proportional to velocity)
- **Coulomb**: τ = μ·sign(ω) (constant, direction-dependent)

**In Gazebo**, use ODE physics parameters:

```xml
<gazebo reference="elbow_joint">
  <implicitSpringDamper>true</implicitSpringDamper>
  <springStiffness>0</springStiffness>
  <springReference>0</springReference>

  <!-- ODE friction parameters -->
  <physics>
    <ode>
      <limit>
        <cfm>0.0</cfm>  <!-- Constraint force mixing -->
        <erp>0.2</erp>  <!-- Error reduction parameter -->
      </limit>
    </ode>
  </physics>
</gazebo>
```

### Friction and Contact Models

**Surface friction** (Gazebo):

```xml
<gazebo reference="wheel_link">
  <mu1>1.0</mu1>  <!-- Friction coefficient (primary direction) -->
  <mu2>1.0</mu2>  <!-- Friction coefficient (secondary direction) -->
  <kp>1e6</kp>    <!-- Contact stiffness -->
  <kd>100.0</kd>  <!-- Contact damping -->
  <minDepth>0.001</minDepth>  <!-- Min penetration before contact -->
  <maxVel>0.1</maxVel>         <!-- Max contact velocity -->

  <!-- Material -->
  <material>Gazebo/Black</material>
</gazebo>
```

**Advanced wheel friction**:

```xml
<gazebo reference="left_wheel">
  <!-- Rubber tire properties -->
  <mu1>1.5</mu1>
  <mu2>1.5</mu2>
  <kp>1e6</kp>
  <kd>100</kd>
  <minDepth>0.001</minDepth>

  <!-- ODE contact parameters -->
  <collision>
    <surface>
      <friction>
        <ode>
          <mu>1.5</mu>
          <mu2>1.5</mu2>
          <fdir1>0 0 1</fdir1>  <!-- Primary friction direction -->
          <slip1>0.0</slip1>
          <slip2>0.0</slip2>
        </ode>
      </friction>
      <contact>
        <ode>
          <soft_cfm>0</soft_cfm>
          <soft_erp>0.2</soft_erp>
          <kp>1e6</kp>
          <kd>100</kd>
          <max_vel>0.1</max_vel>
          <min_depth>0.001</min_depth>
        </ode>
      </contact>
    </surface>
  </collision>
</gazebo>
```

### Real Robot Parameter Identification

**Goal**: Extract accurate URDF parameters from physical robot.

**Methods**:
1. **CAD models** → mass, inertia, geometry
2. **Measurement** → weigh components, measure dimensions
3. **System identification** → estimate dynamics from motion data

**System identification approach**:

```python
#!/usr/bin/env python3
"""
Estimate joint friction and damping from motion data.
"""
import numpy as np
from scipy.optimize import minimize

def joint_model(params, velocity, acceleration):
    """
    Joint torque model: τ = I·α + b·ω + f·sign(ω)

    params: [I, b, f] (inertia, damping, friction)
    """
    I, b, f = params
    torque = I * acceleration + b * velocity + f * np.sign(velocity)
    return torque

def estimate_parameters(measured_torque, velocity, acceleration):
    """Estimate I, b, f from measured data."""

    def objective(params):
        predicted_torque = joint_model(params, velocity, acceleration)
        error = np.sum((predicted_torque - measured_torque)**2)
        return error

    # Initial guess
    x0 = [0.1, 0.5, 0.1]  # [I, b, f]

    # Bounds
    bounds = [(0.01, 10.0), (0.0, 10.0), (0.0, 5.0)]

    result = minimize(objective, x0, bounds=bounds, method='L-BFGS-B')

    return result.x  # [I_estimated, b_estimated, f_estimated]

# Example usage with synthetic data
time = np.linspace(0, 10, 1000)
velocity = np.sin(time)
acceleration = np.cos(time)

# "True" parameters
I_true, b_true, f_true = 0.5, 1.0, 0.2
measured_torque = joint_model([I_true, b_true, f_true], velocity, acceleration)

# Add noise
measured_torque += np.random.normal(0, 0.05, measured_torque.shape)

# Estimate
I_est, b_est, f_est = estimate_parameters(measured_torque, velocity, acceleration)

print(f"True:      I={I_true:.2f}, b={b_true:.2f}, f={f_true:.2f}")
print(f"Estimated: I={I_est:.2f}, b={b_est:.2f}, f={f_est:.2f}")
```

**Update URDF with identified parameters**:

```xml
<joint name="shoulder_joint" type="revolute">
  <!-- ... -->
  <dynamics damping="1.0" friction="0.2"/>  <!-- From identification -->
</joint>

<link name="upper_arm">
  <inertial>
    <mass value="2.5"/>  <!-- From measurement/CAD -->
    <inertia ixx="0.5" ixy="0" ixz="0"  <!-- From identification -->
             iyy="0.5" iyz="0" izz="0.01"/>
  </inertial>
</link>
```

### Performance Optimization

**Simulation speed tips**:

1. **Simplify collision geometry**:
```xml
<visual>
  <!-- High-detail mesh for appearance -->
  <geometry>
    <mesh filename="package://my_robot/meshes/detailed_arm.dae"/>
  </geometry>
</visual>

<collision>
  <!-- Simple shape for collision -->
  <geometry>
    <cylinder radius="0.05" length="0.3"/>
  </geometry>
</collision>
```

2. **Reduce physics update rate** (in Gazebo world file):
```xml
<world name="default">
  <physics type="ode">
    <max_step_size>0.01</max_step_size>  <!-- 100 Hz instead of 1000 Hz -->
    <real_time_update_rate>100</real_time_update_rate>
  </physics>
</world>
```

3. **Disable self-collision** where appropriate:
```xml
<gazebo>
  <self_collide>false</self_collide>  <!-- If links never touch -->
</gazebo>
```

4. **Use fixed joints** instead of revolute with limits:
```xml
<!-- Bad: Revolute with zero limits (still simulated) -->
<joint name="camera_mount" type="revolute">
  <limit lower="0" upper="0" effort="0" velocity="0"/>
</joint>

<!-- Good: Fixed joint (no simulation overhead) -->
<joint name="camera_mount" type="fixed"/>
```

### Production URDF Template

**Complete robot with all best practices**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="production_robot">

  <!-- Properties from CAD/measurements -->
  <xacro:property name="chassis_mass" value="25.0"/>
  <xacro:property name="chassis_length" value="0.8"/>
  <xacro:property name="chassis_width" value="0.6"/>
  <xacro:property name="chassis_height" value="0.3"/>

  <xacro:property name="wheel_mass" value="2.5"/>
  <xacro:property name="wheel_radius" value="0.15"/>
  <xacro:property name="wheel_thickness" value="0.08"/>
  <xacro:property name="wheel_separation" value="0.6"/>

  <!-- Measured friction/damping -->
  <xacro:property name="wheel_damping" value="0.2"/>
  <xacro:property name="wheel_friction" value="0.1"/>
  <xacro:property name="wheel_mu" value="1.5"/>  <!-- Rubber on concrete -->

  <!-- Inertia macros (same as before) -->
  <xacro:macro name="box_inertia" params="m l w h">
    <inertial>
      <mass value="${m}"/>
      <inertia ixx="${(1/12) * m * (w*w + h*h)}" ixy="0" ixz="0"
               iyy="${(1/12) * m * (l*l + h*h)}" iyz="0"
               izz="${(1/12) * m * (l*l + w*w)}"/>
    </inertial>
  </xacro:macro>

  <xacro:macro name="cylinder_inertia" params="m r h">
    <inertial>
      <mass value="${m}"/>
      <inertia ixx="${(1/12) * m * (3*r*r + h*h)}" ixy="0" ixz="0"
               iyy="${(1/12) * m * (3*r*r + h*h)}" iyz="0"
               izz="${(1/2) * m * r*r}"/>
    </inertial>
  </xacro:macro>

  <!-- Chassis -->
  <link name="base_link">
    <visual>
      <geometry>
        <mesh filename="package://my_robot/meshes/chassis_visual.dae"/>
      </geometry>
    </visual>

    <collision>
      <geometry>
        <box size="${chassis_length} ${chassis_width} ${chassis_height}"/>
      </geometry>
    </collision>

    <xacro:box_inertia m="${chassis_mass}"
                       l="${chassis_length}"
                       w="${chassis_width}"
                       h="${chassis_height}"/>
  </link>

  <!-- Gazebo properties for chassis -->
  <gazebo reference="base_link">
    <material>Gazebo/Grey</material>
    <mu1>0.5</mu1>
    <mu2>0.5</mu2>
  </gazebo>

  <!-- Wheel macro with full properties -->
  <xacro:macro name="wheel" params="prefix reflect">
    <link name="${prefix}_wheel">
      <visual>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_thickness}"/>
        </geometry>
        <material name="black">
          <color rgba="0 0 0 1"/>
        </material>
      </visual>

      <collision>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_thickness}"/>
        </geometry>
      </collision>

      <xacro:cylinder_inertia m="${wheel_mass}"
                              r="${wheel_radius}"
                              h="${wheel_thickness}"/>
    </link>

    <joint name="${prefix}_wheel_joint" type="continuous">
      <parent link="base_link"/>
      <child link="${prefix}_wheel"/>
      <origin xyz="0 ${reflect * wheel_separation/2} 0" rpy="-1.5708 0 0"/>
      <axis xyz="0 0 1"/>
      <limit effort="50.0" velocity="20.0"/>
      <dynamics damping="${wheel_damping}" friction="${wheel_friction}"/>
    </joint>

    <!-- Gazebo wheel properties -->
    <gazebo reference="${prefix}_wheel">
      <material>Gazebo/Black</material>
      <mu1>${wheel_mu}</mu1>
      <mu2>${wheel_mu}</mu2>
      <kp>1e6</kp>
      <kd>100</kd>
      <minDepth>0.001</minDepth>
    </gazebo>
  </xacro:macro>

  <!-- Instantiate wheels -->
  <xacro:wheel prefix="left" reflect="1"/>
  <xacro:wheel prefix="right" reflect="-1"/>

</robot>
```

### Key Takeaways (Advanced)

✅ **Parallel mechanisms** require loop-breaking or SDF
✅ **Advanced dynamics** include viscous damping and Coulomb friction
✅ **Contact models** affect wheel traction and collisions
✅ **Parameter identification** extracts real robot properties
✅ **Performance optimization** balances accuracy and speed

---

## Additional Resources

- [URDF Tutorials](https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/URDF-Main.html)
- [URDF XML Specification](http://wiki.ros.org/urdf/XML)
- [XACRO Documentation](http://wiki.ros.org/xacro)
- [Gazebo URDF Extensions](https://classic.gazebosim.org/tutorials?tut=ros_urdf)
- [REP 103: Standard Units of Measure](https://www.ros.org/reps/rep-0103.html)
- [REP 105: Coordinate Frames](https://www.ros.org/reps/rep-0105.html)

---

**Next:** [Sensors in URDF →](./03-sensors-urdf.md)
