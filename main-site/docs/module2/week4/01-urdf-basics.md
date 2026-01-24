---
sidebar_position: 1
---

# URDF Basics

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 3-4 hours
**Prerequisites**: Completed Module 1

### Learning Objectives

- Understand what URDF is and its purpose
- Learn XML structure of URDF files
- Create simple robot descriptions
- Visualize robots in RViz2
- Validate URDF files

### What is URDF?

**URDF (Unified Robot Description Format)** is an XML format for representing robot models in ROS.

**Purpose:**
- Describe robot geometry (links and joints)
- Define physical properties (mass, inertia)
- Specify visual appearance
- Configure collision detection
- Add sensors and actuators

**Real-world analogy:**
- URDF is like a **blueprint** for your robot
- Describes structure, appearance, and physics
- Used by simulation, visualization, and control tools

### URDF vs Other Formats

| Format | Purpose | Used By |
|--------|---------|---------|
| **URDF** | Robot description (ROS standard) | ROS, RViz, MoveIt |
| **SDF** | World/robot simulation | Gazebo |
| **MJCF** | Robot simulation | MuJoCo |
| **STL/OBJ** | 3D geometry only | CAD, rendering |

### Basic URDF Structure

A URDF file describes a robot as a **tree** of links connected by joints.

**Minimal URDF:**
```xml
<?xml version="1.0"?>
<robot name="my_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.6 0.4 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>
  </link>
</robot>
```

### Creating Your First Robot

**simple_robot.urdf**:
```xml
<?xml version="1.0"?>
<robot name="simple_robot">
  <!-- Base Link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.6 0.4 0.2"/>
      </geometry>
      <origin xyz="0 0 0.1" rpy="0 0 0"/>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>
  </link>

  <!-- Wheel Link -->
  <link name="left_wheel">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <origin xyz="0 0 0" rpy="1.5708 0 0"/>  <!-- Rotate 90 degrees -->
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
  </link>

  <!-- Joint connecting base to wheel -->
  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel"/>
    <origin xyz="0 0.25 0" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
  </joint>

  <!-- Right wheel (similar structure) -->
  <link name="right_wheel">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
      <origin xyz="0 0 0" rpy="1.5708 0 0"/>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
  </link>

  <joint name="right_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="right_wheel"/>
    <origin xyz="0 -0.25 0" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
  </joint>
</robot>
```

### URDF Elements Explained

#### 1. `<link>` - Robot Part

Represents a rigid body (chassis, wheel, arm segment).

**Components:**
- `<visual>`: How it looks
- `<collision>`: Collision shape
- `<inertial>`: Mass and inertia

```xml
<link name="my_link">
  <visual>
    <geometry>
      <box size="1 1 1"/>  <!-- 1m cube -->
    </geometry>
    <material name="red">
      <color rgba="1 0 0 1"/>
    </material>
  </visual>
</link>
```

#### 2. `<joint>` - Connection Between Links

Defines how links move relative to each other.

**Joint Types:**
- `fixed`: No movement (rigid connection)
- `revolute`: Rotates with limits (elbow, door hinge)
- `continuous`: Rotates freely (wheel, propeller)
- `prismatic`: Slides linearly (elevator, drawer)
- `floating`: 6-DOF free movement
- `planar`: Moves in a plane

```xml
<joint name="wheel_joint" type="continuous">
  <parent link="base_link"/>
  <child link="wheel_link"/>
  <origin xyz="0 0.2 0" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>  <!-- Rotation axis -->
</joint>
```

#### 3. `<geometry>` - Shapes

**Primitive shapes:**
```xml
<!-- Box -->
<geometry>
  <box size="1 2 0.5"/>  <!-- width, depth, height (meters) -->
</geometry>

<!-- Cylinder -->
<geometry>
  <cylinder radius="0.1" length="0.5"/>
</geometry>

<!-- Sphere -->
<geometry>
  <sphere radius="0.2"/>
</geometry>

<!-- Mesh (from file) -->
<geometry>
  <mesh filename="package://my_robot/meshes/chassis.stl" scale="1 1 1"/>
</geometry>
```

#### 4. `<origin>` - Position & Orientation

```xml
<origin xyz="1 2 3" rpy="0 0 1.5708"/>
<!-- xyz: position in meters (x, y, z) -->
<!-- rpy: rotation in radians (roll, pitch, yaw) -->
```

**Rotation examples:**
- `rpy="0 0 0"` - No rotation
- `rpy="1.5708 0 0"` - 90° roll (rotate around X-axis)
- `rpy="0 1.5708 0"` - 90° pitch (rotate around Y-axis)
- `rpy="0 0 1.5708"` - 90° yaw (rotate around Z-axis)

### Visualizing in RViz2

#### Step 1: Create Package

```bash
cd ~/ros2_ws/src
ros2 pkg create my_robot_description \
  --build-type ament_cmake \
  --dependencies urdf
```

#### Step 2: Add URDF File

```bash
mkdir -p my_robot_description/urdf
# Save your URDF as my_robot_description/urdf/robot.urdf
```

#### Step 3: Create Launch File

**launch/display.launch.py**:
```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.substitutions import Command

def generate_launch_description():
    # Get URDF file path
    urdf_file = os.path.join(
        get_package_share_directory('my_robot_description'),
        'urdf',
        'robot.urdf'
    )

    # Read URDF file
    with open(urdf_file, 'r') as file:
        robot_description = file.read()

    return LaunchDescription([
        # Robot State Publisher
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            output='screen',
            parameters=[{'robot_description': robot_description}]
        ),

        # Joint State Publisher GUI (for testing joints)
        Node(
            package='joint_state_publisher_gui',
            executable='joint_state_publisher_gui',
            name='joint_state_publisher_gui'
        ),

        # RViz2
        Node(
            package='rviz2',
            executable='rviz2',
            name='rviz2',
            arguments=['-d', os.path.join(
                get_package_share_directory('my_robot_description'),
                'rviz',
                'robot.rviz'
            )] if os.path.exists(os.path.join(
                get_package_share_directory('my_robot_description'),
                'rviz',
                'robot.rviz'
            )) else []
        ),
    ])
```

#### Step 4: Update CMakeLists.txt

```cmake
install(
  DIRECTORY urdf launch
  DESTINATION share/${PROJECT_NAME}
)
```

#### Step 5: Build and Launch

```bash
colcon build --packages-select my_robot_description
source install/setup.bash

ros2 launch my_robot_description display.launch.py
```

**In RViz2:**
1. Set Fixed Frame to `base_link`
2. Add → RobotModel
3. Use sliders in Joint State Publisher GUI to move joints

### URDF Validation

**Check for errors:**
```bash
# Install check tool
sudo apt install liburdfdom-tools

# Validate URDF
check_urdf urdf/robot.urdf

# Output shows structure:
# robot name is: simple_robot
# ---------- Successfully Parsed XML ---------------
# root Link: base_link has 2 child(ren)
#     child(1):  left_wheel
#     child(2):  right_wheel
```

**View as tree:**
```bash
urdf_to_graphviz urdf/robot.urdf
# Generates robot.pdf showing link-joint tree
```

### Common Beginner Mistakes

❌ **Forgetting to close tags**
```xml
<link name="base">  <!-- Missing </link> -->
```

❌ **Wrong parent-child order**
```xml
<!-- Wrong: child listed before parent -->
<joint name="joint1" type="fixed">
  <child link="base_link"/>
  <parent link="wheel"/>  <!-- Base should be parent! -->
</joint>
```

❌ **Incorrect rotation values**
```xml
<!-- Wrong: using degrees instead of radians -->
<origin xyz="0 0 0" rpy="90 0 0"/>  <!-- Should be 1.5708 -->
```

❌ **Missing axis for revolute/continuous joints**
```xml
<joint name="wheel_joint" type="continuous">
  <parent link="base_link"/>
  <child link="wheel"/>
  <!-- Missing: <axis xyz="0 1 0"/> -->
</joint>
```

### Practical Exercise

**Exercise 1: Create a simple car**
- Rectangular chassis (base_link)
- 4 cylindrical wheels
- 2 front wheels on continuous joints (steerable)
- 2 rear wheels on continuous joints

**Exercise 2: Add a sensor**
- Add a box link for a camera
- Mount it on top of the chassis with a fixed joint
- Position it 0.3m above the base

### Key Takeaways (Beginner)

✅ **URDF** describes robots as trees of links and joints
✅ **Links** are rigid bodies with visual, collision, and inertial properties
✅ **Joints** connect links and define motion
✅ **RViz2** visualizes URDF models
✅ **Validation tools** catch XML errors
✅ **robot_state_publisher** broadcasts transforms

---

## 🟡 Intermediate Level

**Duration**: 4-5 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Master XACRO for modular robots
- Add collision and inertial properties
- Use macros for reusable components
- Implement parametric designs
- Add Gazebo-specific tags

### XACRO: XML Macros

**XACRO** extends URDF with:
- Variables and properties
- Mathematical expressions
- Macros (functions)
- File includes

**Why use XACRO?**
- ✅ Reduce repetition (DRY principle)
- ✅ Parametric designs
- ✅ Modular, reusable components
- ✅ Easier maintenance

### Basic XACRO Example

**robot.urdf.xacro**:
```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_robot">
  <!-- Properties (variables) -->
  <xacro:property name="base_width" value="0.6"/>
  <xacro:property name="base_length" value="0.4"/>
  <xacro:property name="base_height" value="0.2"/>
  <xacro:property name="wheel_radius" value="0.1"/>
  <xacro:property name="wheel_width" value="0.05"/>

  <!-- Base link using properties -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>
  </link>

  <!-- Wheel macro -->
  <xacro:macro name="wheel" params="prefix reflect">
    <link name="${prefix}_wheel">
      <visual>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
        <origin xyz="0 0 0" rpy="${pi/2} 0 0"/>
        <material name="black">
          <color rgba="0 0 0 1"/>
        </material>
      </visual>
    </link>

    <joint name="${prefix}_wheel_joint" type="continuous">
      <parent link="base_link"/>
      <child link="${prefix}_wheel"/>
      <origin xyz="0 ${reflect * base_width/2} 0" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
    </joint>
  </xacro:macro>

  <!-- Instantiate wheels -->
  <xacro:wheel prefix="left" reflect="1"/>
  <xacro:wheel prefix="right" reflect="-1"/>
</robot>
```

**Convert XACRO to URDF:**
```bash
xacro robot.urdf.xacro > robot.urdf
```

### Advanced XACRO Features

#### Mathematical Expressions

```xml
<xacro:property name="wheel_offset_x" value="${base_length/2 - wheel_radius}"/>
<xacro:property name="wheel_offset_z" value="${-base_height/2}"/>

<!-- Can use: +, -, *, /, sin(), cos(), pi, etc. -->
```

#### Conditional Blocks

```xml
<xacro:property name="use_gpu" value="true"/>

<xacro:if value="${use_gpu}">
  <sensor name="camera" type="gpu_ray"/>
</xacro:if>

<xacro:unless value="${use_gpu}">
  <sensor name="camera" type="ray"/>
</xacro:unless>
```

#### Including External Files

```xml
<!-- common_properties.xacro -->
<xacro:property name="wheel_radius" value="0.1"/>
<xacro:property name="wheel_mass" value="0.5"/>
```

```xml
<!-- robot.urdf.xacro -->
<xacro:include filename="$(find my_robot_description)/urdf/common_properties.xacro"/>

<!-- Now can use wheel_radius and wheel_mass -->
```

### Adding Collision Properties

Collision geometry is used for physics simulation:

```xml
<link name="base_link">
  <visual>
    <geometry>
      <mesh filename="package://my_robot/meshes/chassis_detailed.stl"/>
    </geometry>
  </visual>

  <collision>
    <geometry>
      <!-- Simpler geometry for faster collision detection -->
      <box size="0.6 0.4 0.2"/>
    </geometry>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
  </collision>
</link>
```

**Best practices:**
- Use simpler collision geometry than visual
- Convex hulls are fastest
- Avoid complex meshes for collision

### Adding Inertial Properties

Required for realistic physics simulation:

```xml
<link name="base_link">
  <visual>...</visual>
  <collision>...</collision>

  <inertial>
    <mass value="5.0"/>  <!-- kg -->
    <origin xyz="0 0 0.05" rpy="0 0 0"/>  <!-- Center of mass -->
    <inertia
      ixx="0.1" ixy="0.0" ixz="0.0"
      iyy="0.1" iyz="0.0"
      izz="0.1"/>
  </inertial>
</link>
```

**Calculating inertia for common shapes:**

```xml
<!-- Box inertia macro -->
<xacro:macro name="box_inertia" params="m x y z">
  <inertial>
    <mass value="${m}"/>
    <inertia
      ixx="${m*(y*y+z*z)/12}" ixy="0" ixz="0"
      iyy="${m*(x*x+z*z)/12}" iyz="0"
      izz="${m*(x*x+y*y)/12}"/>
  </inertial>
</xacro:macro>

<!-- Cylinder inertia macro -->
<xacro:macro name="cylinder_inertia" params="m r h">
  <inertial>
    <mass value="${m}"/>
    <inertia
      ixx="${m*(3*r*r+h*h)/12}" ixy="0" ixz="0"
      iyy="${m*(3*r*r+h*h)/12}" iyz="0"
      izz="${m*r*r/2}"/>
  </inertial>
</xacro:macro>

<!-- Sphere inertia macro -->
<xacro:macro name="sphere_inertia" params="m r">
  <inertial>
    <mass value="${m}"/>
    <inertia
      ixx="${2*m*r*r/5}" ixy="0" ixz="0"
      iyy="${2*m*r*r/5}" iyz="0"
      izz="${2*m*r*r/5}"/>
  </inertial>
</xacro:macro>
```

**Usage:**
```xml
<link name="base_link">
  <visual>...</visual>
  <collision>...</collision>
  <xacro:box_inertia m="5.0" x="0.6" y="0.4" z="0.2"/>
</link>
```

### Gazebo-Specific Tags

```xml
<gazebo reference="base_link">
  <material>Gazebo/Blue</material>
  <mu1>0.2</mu1>  <!-- Friction coefficient 1 -->
  <mu2>0.2</mu2>  <!-- Friction coefficient 2 -->
  <kp>1000000.0</kp>  <!-- Contact stiffness -->
  <kd>1.0</kd>  <!-- Contact damping -->
</gazebo>

<gazebo reference="left_wheel">
  <material>Gazebo/Black</material>
  <mu1>1.0</mu1>  <!-- Higher friction for wheels -->
  <mu2>1.0</mu2>
</gazebo>
```

### Complete XACRO Example

**diffbot.urdf.xacro** (differential drive robot):
```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="diffbot">

  <!-- Include files -->
  <xacro:include filename="$(find my_robot_description)/urdf/common_properties.xacro"/>
  <xacro:include filename="$(find my_robot_description)/urdf/inertia_macros.xacro"/>

  <!-- Properties -->
  <xacro:property name="base_width" value="0.31"/>
  <xacro:property name="base_length" value="0.42"/>
  <xacro:property name="base_height" value="0.18"/>
  <xacro:property name="wheel_radius" value="0.10"/>
  <xacro:property name="wheel_width" value="0.04"/>
  <xacro:property name="wheel_ygap" value="0.025"/>
  <xacro:property name="wheel_zoff" value="0.05"/>
  <xacro:property name="wheel_xoff" value="0.12"/>
  <xacro:property name="caster_xoff" value="0.14"/>

  <!-- Base Link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
      <material name="Cyan">
        <color rgba="0 1.0 1.0 1.0"/>
      </material>
    </visual>

    <collision>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
    </collision>

    <xacro:box_inertia m="15" x="${base_length}" y="${base_width}" z="${base_height}"/>
  </link>

  <gazebo reference="base_link">
    <material>Gazebo/Cyan</material>
  </gazebo>

  <!-- Wheel Macro -->
  <xacro:macro name="wheel" params="prefix x_reflect y_reflect">
    <link name="${prefix}_link">
      <visual>
        <origin xyz="0 0 0" rpy="${pi/2} 0 0"/>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
        <material name="Gray">
          <color rgba="0.5 0.5 0.5 1.0"/>
        </material>
      </visual>

      <collision>
        <origin xyz="0 0 0" rpy="${pi/2} 0 0"/>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
      </collision>

      <xacro:cylinder_inertia m="0.5" r="${wheel_radius}" h="${wheel_width}"/>
    </link>

    <gazebo reference="${prefix}_link">
      <material>Gazebo/Gray</material>
      <mu1>1.0</mu1>
      <mu2>1.0</mu2>
    </gazebo>

    <joint name="${prefix}_joint" type="continuous">
      <parent link="base_link"/>
      <child link="${prefix}_link"/>
      <origin xyz="${x_reflect*wheel_xoff} ${y_reflect*(base_width/2+wheel_ygap)} ${-wheel_zoff}" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
    </joint>
  </xacro:macro>

  <!-- Instantiate wheels -->
  <xacro:wheel prefix="drivewhl_l" x_reflect="-1" y_reflect="1"/>
  <xacro:wheel prefix="drivewhl_r" x_reflect="-1" y_reflect="-1"/>

  <!-- Caster Wheel -->
  <link name="front_caster">
    <visual>
      <geometry>
        <sphere radius="${(wheel_radius+wheel_zoff-(base_height/2))}"/>
      </geometry>
      <material name="Cyan">
        <color rgba="0 1.0 1.0 1.0"/>
      </material>
    </visual>

    <collision>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry>
        <sphere radius="${(wheel_radius+wheel_zoff-(base_height/2))}"/>
      </geometry>
    </collision>

    <xacro:sphere_inertia m="0.5" r="${(wheel_radius+wheel_zoff-(base_height/2))}"/>
  </link>

  <gazebo reference="front_caster">
    <material>Gazebo/Cyan</material>
    <mu1>0.0</mu1>
    <mu2>0.0</mu2>
  </gazebo>

  <joint name="caster_joint" type="fixed">
    <parent link="base_link"/>
    <child link="front_caster"/>
    <origin xyz="${caster_xoff} 0.0 ${-(base_height/2)}"/>
  </joint>

</robot>
```

### Key Takeaways (Intermediate)

✅ **XACRO** adds variables, macros, and math to URDF
✅ **Collision geometry** should be simpler than visual
✅ **Inertial properties** are required for realistic physics
✅ **Macros** eliminate repetitive code
✅ **Gazebo tags** add simulation-specific properties

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Generate URDF dynamically from code
- Optimize collision detection performance
- Master SDF format
- Handle complex mechanisms
- Performance profiling

### Dynamic URDF Generation

**generate_robot.py**:
```python
#!/usr/bin/env python3
import xml.etree.ElementTree as ET
from xml.dom import minidom

def create_urdf_robot(name, num_links):
    """Dynamically generate URDF with variable number of links"""
    robot = ET.Element('robot', name=name)

    # Base link
    base_link = ET.SubElement(robot, 'link', name='base_link')
    visual = ET.SubElement(base_link, 'visual')
    geometry = ET.SubElement(visual, 'geometry')
    ET.SubElement(geometry, 'box', size='0.2 0.2 0.2')

    # Generate chain of links
    for i in range(num_links):
        link_name = f'link_{i+1}'
        joint_name = f'joint_{i+1}'

        # Create link
        link = ET.SubElement(robot, 'link', name=link_name)
        visual = ET.SubElement(link, 'visual')
        geometry = ET.SubElement(visual, 'geometry')
        ET.SubElement(geometry, 'cylinder', radius='0.05', length='0.3')

        # Create joint
        joint = ET.SubElement(robot, 'joint', name=joint_name, type='revolute')
        parent_name = f'link_{i}' if i > 0 else 'base_link'
        ET.SubElement(joint, 'parent', link=parent_name)
        ET.SubElement(joint, 'child', link=link_name)
        ET.SubElement(joint, 'origin', xyz='0 0 0.3', rpy='0 0 0')
        ET.SubElement(joint, 'axis', xyz='0 1 0')
        ET.SubElement(joint, 'limit', effort='10', velocity='1', lower='-1.57', upper='1.57')

    # Pretty print
    xml_string = minidom.parseString(ET.tostring(robot)).toprettyxml(indent="  ")
    return xml_string

# Generate 6-DOF arm
urdf_content = create_urdf_robot('generated_robot', 6)
with open('generated_robot.urdf', 'w') as f:
    f.write(urdf_content)
```

### SDF (Simulation Description Format)

SDF is Gazebo's native format, more powerful than URDF:

**robot.sdf**:
```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <model name="my_robot">
    <pose>0 0 0.5 0 0 0</pose>

    <link name="base_link">
      <inertial>
        <mass>10.0</mass>
        <inertia>
          <ixx>0.1</ixx>
          <iyy>0.1</iyy>
          <izz>0.1</izz>
        </inertia>
      </inertial>

      <collision name="collision">
        <geometry>
          <box>
            <size>0.6 0.4 0.2</size>
          </box>
        </geometry>
      </collision>

      <visual name="visual">
        <geometry>
          <box>
            <size>0.6 0.4 0.2</size>
          </box>
        </geometry>
        <material>
          <ambient>0 0 0.8 1</ambient>
          <diffuse>0 0 0.8 1</diffuse>
        </material>
      </visual>

      <!-- Add sensor directly in SDF -->
      <sensor name="camera" type="camera">
        <camera>
          <horizontal_fov>1.047</horizontal_fov>
          <image>
            <width>320</width>
            <height>240</height>
          </image>
          <clip>
            <near>0.1</near>
            <far>100</far>
          </clip>
        </camera>
        <always_on>1</always_on>
        <update_rate>30</update_rate>
      </sensor>
    </link>

    <!-- Plugins -->
    <plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
      <ros>
        <namespace>/</namespace>
      </ros>
      <left_joint>left_wheel_joint</left_joint>
      <right_joint>right_wheel_joint</right_joint>
      <wheel_separation>0.5</wheel_separation>
      <wheel_diameter>0.2</wheel_diameter>
      <max_wheel_torque>20</max_wheel_torque>
      <max_wheel_acceleration>1.0</max_wheel_acceleration>
      <publish_odom>true</publish_odom>
      <publish_odom_tf>true</publish_odom_tf>
      <odometry_frame>odom</odometry_frame>
      <robot_base_frame>base_link</robot_base_frame>
    </plugin>
  </model>
</sdf>
```

**SDF Advantages over URDF:**
- ✅ More expressive physics parameters
- ✅ Native sensor definitions
- ✅ Supports multiple robots in one file
- ✅ World description capabilities
- ✅ Plugin configuration

**Converting URDF to SDF:**
```bash
gz sdf -p robot.urdf > robot.sdf
```

### Key Takeaways (Advanced)

✅ **Dynamic generation** enables parametric robot design
✅ **SDF** is more powerful than URDF for simulation
✅ **Collision optimization** critical for performance
✅ **Complex mechanisms** require careful joint configuration

---

## Additional Resources

- [URDF Documentation](https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/URDF-Main.html)
- [Using URDF in Gazebo](https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/Using-a-URDF-in-Gazebo.html)
- [XACRO Documentation](http://wiki.ros.org/xacro)
- [SDF Format Specification](http://sdformat.org/)

---

**Next:** [Links, Joints & Kinematics →](./02-links-joints.md)
