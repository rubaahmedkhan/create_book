---
sidebar_position: 5
---

# Gazebo Introduction

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: URDF Basics, Robot Building

### Learning Objectives

- Understand Gazebo architecture (Fortress/Garden)
- Start and navigate Gazebo GUI
- Load world files and models
- Spawn robots in simulation
- Use basic GUI controls

### What is Gazebo?

**Gazebo** is a 3D robot simulator that:
- Simulates physics (gravity, collisions, friction)
- Renders realistic environments
- Simulates sensors (cameras, LiDAR, IMU)
- Integrates with ROS 2

**Use cases**:
- Test algorithms without hardware
- Develop autonomy in safe environment
- Train machine learning models
- Multi-robot coordination

### Gazebo Versions

**Two main versions**:

1. **Gazebo Classic** (gazebo11): Older, stable
   - ROS 1 and ROS 2 (limited)
   - Being phased out

2. **Gazebo** (Fortress, Garden, Harmonic): New generation
   - Modern architecture
   - Better performance
   - Full ROS 2 support
   - **Recommended for new projects**

**For ROS 2 Humble**: Use **Gazebo Fortress** or **Gazebo Garden**.

### Installation

**Install Gazebo Fortress** (with ROS 2 Humble):

```bash
# Install Gazebo Fortress
sudo apt update
sudo apt install gazebo

# Install ROS 2 - Gazebo bridge
sudo apt install ros-humble-ros-gz

# Verify installation
gz sim --version
```

**Install Gazebo Garden** (optional, newer):

```bash
# Add Gazebo repository
sudo wget https://packages.osrfoundation.org/gazebo.gpg -O /usr/share/keyrings/pkgs-osrf-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/pkgs-osrf-archive-keyring.gpg] http://packages.osrfoundation.org/gazebo/ubuntu-stable $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/gazebo-stable.list > /dev/null

sudo apt update
sudo apt install gz-garden

# ROS 2 bridge for Garden
sudo apt install ros-humble-ros-gzgarden
```

### Starting Gazebo

**Launch empty world**:

```bash
gz sim
```

**What you see**:
- 3D viewport (main window)
- Play/pause controls (bottom)
- Scene tree (right panel)
- Empty gray ground plane

**Basic controls**:
- **Left mouse**: Rotate view
- **Middle mouse**: Pan view
- **Right mouse** or **Scroll**: Zoom
- **WASD**: Move camera (when clicking viewport)

### Loading World Files

**World file**: Defines environment (models, lighting, physics).

**Example empty world** (worlds/empty.world):

```xml
<?xml version="1.0" ?>
<sdf version="1.8">
  <world name="empty_world">

    <!-- Physics -->
    <physics name="1ms" type="ignored">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
    </physics>

    <!-- Lighting -->
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <attenuation>
        <range>1000</range>
      </attenuation>
      <direction>-0.5 0.1 -0.9</direction>
    </light>

    <!-- Ground Plane -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
            </plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.8 0.8 0.8 1</ambient>
            <diffuse>0.8 0.8 0.8 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

  </world>
</sdf>
```

**Load custom world**:

```bash
gz sim worlds/empty.world
```

### Adding Models to World

**Models**: Pre-built objects (tables, boxes, robots).

**Add model via GUI**:
1. Click the **"+"** icon (top toolbar)
2. Browse model library
3. Select model (e.g., "Table", "Box")
4. Click in viewport to place

**Gazebo Fuel** (online model database):
- Access at [https://app.gazebosim.org/fuel/models](https://app.gazebosim.org/fuel/models)
- Download models directly in GUI

**Add model in world file**:

```xml
<world name="my_world">
  <!-- ... physics, lighting ... -->

  <!-- Simple box -->
  <model name="box">
    <pose>0 0 0.5 0 0 0</pose>  <!-- x y z roll pitch yaw -->
    <link name="link">
      <collision name="collision">
        <geometry>
          <box>
            <size>1 1 1</size>
          </box>
        </geometry>
      </collision>
      <visual name="visual">
        <geometry>
          <box>
            <size>1 1 1</size>
          </box>
        </geometry>
        <material>
          <ambient>1 0 0 1</ambient>  <!-- Red -->
        </material>
      </visual>
    </link>
  </model>

</world>
```

### Spawning Robots

**Method 1: Include in world file**

```xml
<world name="robot_world">
  <!-- ... -->

  <!-- Include robot SDF -->
  <include>
    <uri>model://my_robot</uri>
    <pose>0 0 0.5 0 0 0</pose>
  </include>

</world>
```

**Method 2: Spawn from ROS 2**

```bash
# Launch Gazebo
gz sim worlds/empty.world

# Spawn robot (in another terminal)
ros2 run gazebo_ros spawn_entity.py \
  -entity my_robot \
  -file ~/ros2_ws/install/my_mobile_robot/share/my_mobile_robot/urdf/robot.urdf.xacro \
  -x 0 -y 0 -z 0.5
```

**Method 3: ROS 2 launch file** (recommended):

**launch/spawn_robot_gazebo.launch.py**:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, ExecuteProcess
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import Command
from launch_ros.actions import Node

def generate_launch_description():
    pkg_share = get_package_share_directory('my_mobile_robot')
    urdf_file = os.path.join(pkg_share, 'urdf', 'robot.urdf.xacro')
    world_file = os.path.join(pkg_share, 'worlds', 'empty.world')

    # Process URDF
    robot_description = Command(['xacro ', urdf_file])

    # Start Gazebo
    gazebo = ExecuteProcess(
        cmd=['gz', 'sim', '-r', world_file],
        output='screen'
    )

    # Spawn robot
    spawn_robot = Node(
        package='ros_gz_sim',
        executable='create',
        arguments=[
            '-name', 'my_robot',
            '-topic', 'robot_description',
            '-x', '0',
            '-y', '0',
            '-z', '0.5'
        ],
        output='screen'
    )

    # Robot state publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        output='screen',
        parameters=[{
            'robot_description': robot_description,
            'use_sim_time': True
        }]
    )

    return LaunchDescription([
        gazebo,
        robot_state_publisher,
        spawn_robot,
    ])
```

**Launch**:

```bash
ros2 launch my_mobile_robot spawn_robot_gazebo.launch.py
```

### GUI Overview

**Main interface components**:

1. **3D Viewport**: Main visualization
   - Rotate, pan, zoom
   - Select models

2. **Play Controls** (bottom):
   - **Play**: Start simulation
   - **Pause**: Pause simulation
   - **Step**: Advance one physics step
   - **Real-time factor**: Shows simulation speed (1.0 = real-time)

3. **Scene Tree** (right):
   - Lists all models and links
   - Expand to see hierarchy
   - Click to select

4. **Entity Tree** (left):
   - Shows scene structure
   - Model properties

5. **Plugin Panels**:
   - **Transform**: Move/rotate models
   - **World Control**: Play/pause
   - **Topic Viewer**: Monitor ROS topics

**Useful plugins** (add via "Plugins" menu):
- **World Stats**: FPS, real-time factor
- **Topic Echo**: View topic data
- **Image Display**: Camera feeds
- **Shapes**: Add primitive shapes

### Simple World Example

**worlds/simple_maze.world**:

```xml
<?xml version="1.0" ?>
<sdf version="1.8">
  <world name="simple_maze">

    <physics name="1ms" type="ignored">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
    </physics>

    <plugin
      filename="gz-sim-physics-system"
      name="gz::sim::systems::Physics">
    </plugin>
    <plugin
      filename="gz-sim-user-commands-system"
      name="gz::sim::systems::UserCommands">
    </plugin>
    <plugin
      filename="gz-sim-scene-broadcaster-system"
      name="gz::sim::systems::SceneBroadcaster">
    </plugin>

    <!-- Lighting -->
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <direction>-0.5 0.1 -0.9</direction>
    </light>

    <!-- Ground -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
            </plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>20 20</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.8 0.8 0.8 1</ambient>
          </material>
        </visual>
      </link>
    </model>

    <!-- Walls -->
    <model name="wall_north">
      <pose>0 5 1 0 0 0</pose>
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box><size>10 0.2 2</size></box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box><size>10 0.2 2</size></box>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
          </material>
        </visual>
      </link>
    </model>

    <model name="wall_south">
      <pose>0 -5 1 0 0 0</pose>
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box><size>10 0.2 2</size></box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box><size>10 0.2 2</size></box>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
          </material>
        </visual>
      </link>
    </model>

    <model name="wall_east">
      <pose>5 0 1 0 0 0</pose>
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box><size>0.2 10 2</size></box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box><size>0.2 10 2</size></box>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
          </material>
        </visual>
      </link>
    </model>

    <model name="wall_west">
      <pose>-5 0 1 0 0 0</pose>
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box><size>0.2 10 2</size></box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box><size>0.2 10 2</size></box>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
          </material>
        </visual>
      </link>
    </model>

  </world>
</sdf>
```

**Test**:

```bash
gz sim worlds/simple_maze.world
```

### Key Takeaways (Beginner)

✅ **Gazebo** simulates robot physics and sensors
✅ **Gazebo Fortress/Garden** recommended for ROS 2
✅ **World files** (SDF) define environments
✅ **Spawn robots** via GUI, CLI, or ROS 2 launch files
✅ **GUI controls** allow interactive simulation

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Understand Gazebo plugins and architecture
- Use ros_gz bridge for ROS 2 communication
- Configure physics engines
- Build complex worlds
- Use Gazebo model database

### Gazebo Architecture

**Gazebo components**:

1. **gz sim**: Main simulation server
2. **Physics engine**: ODE, Bullet, DART, Simbody
3. **Rendering engine**: OGRE 2.x
4. **Sensor simulation**: Camera, LiDAR, IMU, etc.
5. **Transport**: Ignition Transport (pub/sub)

**Plugin system**:
- **System plugins**: Core functionality (physics, rendering)
- **Model plugins**: Attached to models (controllers)
- **Sensor plugins**: Generate sensor data
- **World plugins**: Global behaviors

### ROS 2 - Gazebo Bridge (ros_gz)

**Purpose**: Connect Gazebo topics to ROS 2 topics.

**Architecture**:
```
Gazebo Topic (/model/robot/cmd_vel)
    ↕
ros_gz_bridge
    ↕
ROS 2 Topic (/cmd_vel)
```

**Install**:

```bash
sudo apt install ros-humble-ros-gz
```

**Create bridge node**:

```python
# launch/gazebo_bridge.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Bridge: Gazebo → ROS 2
        Node(
            package='ros_gz_bridge',
            executable='parameter_bridge',
            arguments=[
                # Clock
                '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',

                # Odometry (Gazebo → ROS 2)
                '/model/my_robot/odometry@nav_msgs/msg/Odometry[gz.msgs.Odometry',

                # Cmd_vel (ROS 2 → Gazebo)
                '/model/my_robot/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',

                # LiDAR (Gazebo → ROS 2)
                '/lidar@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',

                # Camera (Gazebo → ROS 2)
                '/camera/image_raw@sensor_msgs/msg/Image[gz.msgs.Image',
                '/camera/camera_info@sensor_msgs/msg/CameraInfo[gz.msgs.CameraInfo',
            ],
            output='screen'
        ),
    ])
```

**Bridge syntax**:
```
/topic@ros_msg_type[gz_msg_type  (Gazebo to ROS)
/topic@ros_msg_type]gz_msg_type  (ROS to Gazebo)
```

**Launch bridge**:

```bash
ros2 launch my_robot_pkg gazebo_bridge.launch.py

# Test (in another terminal)
ros2 topic list
ros2 topic echo /model/my_robot/odometry
```

### Physics Engines

**Supported engines**:
- **ODE** (default): Fast, good for most robots
- **Bullet**: Better collision detection
- **DART**: Advanced dynamics, humanoids
- **Simbody**: High-fidelity biomechanics

**Configure in world file**:

```xml
<world name="my_world">

  <!-- ODE Physics -->
  <physics name="ode_physics" type="ode">
    <max_step_size>0.001</max_step_size>  <!-- 1ms timestep -->
    <real_time_factor>1.0</real_time_factor>
    <real_time_update_rate>1000</real_time_update_rate>

    <!-- ODE-specific parameters -->
    <ode>
      <solver>
        <type>quick</type>
        <iters>50</iters>
        <sor>1.3</sor>  <!-- Successive Over-Relaxation -->
      </solver>
      <constraints>
        <cfm>0.0</cfm>  <!-- Constraint Force Mixing -->
        <erp>0.2</erp>  <!-- Error Reduction Parameter -->
        <contact_max_correcting_vel>100.0</contact_max_correcting_vel>
        <contact_surface_layer>0.001</contact_surface_layer>
      </constraints>
    </ode>
  </physics>

  <!-- Physics system plugin -->
  <plugin
    filename="gz-sim-physics-system"
    name="gz::sim::systems::Physics">
  </plugin>

</world>
```

**Physics parameters**:
- **max_step_size**: Physics timestep (smaller = more accurate, slower)
- **real_time_factor**: Target speed (1.0 = real-time, greater than 1 faster, less than 1 slower)
- **iters**: Solver iterations (more = more accurate, slower)
- **cfm/erp**: Constraint stability (advanced)

### Building Complex Worlds

**Warehouse world example**:

```xml
<?xml version="1.0" ?>
<sdf version="1.8">
  <world name="warehouse">

    <physics name="1ms" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
    </physics>

    <!-- Required plugins -->
    <plugin filename="gz-sim-physics-system" name="gz::sim::systems::Physics"/>
    <plugin filename="gz-sim-user-commands-system" name="gz::sim::systems::UserCommands"/>
    <plugin filename="gz-sim-scene-broadcaster-system" name="gz::sim::systems::SceneBroadcaster"/>

    <!-- Lighting -->
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <direction>-0.5 0.1 -0.9</direction>
    </light>

    <!-- Ground -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane><normal>0 0 1</normal></plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane><normal>0 0 1</normal><size>100 100</size></plane>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
          </material>
        </visual>
      </link>
    </model>

    <!-- Walls -->
    <xacro:macro name="wall" params="name x y yaw length">
      <model name="${name}">
        <pose>${x} ${y} 1.5 0 0 ${yaw}</pose>
        <static>true</static>
        <link name="link">
          <collision name="collision">
            <geometry>
              <box><size>${length} 0.2 3</size></box>
            </geometry>
          </collision>
          <visual name="visual">
            <geometry>
              <box><size>${length} 0.2 3</size></box>
            </geometry>
            <material>
              <ambient>0.7 0.7 0.7 1</ambient>
            </material>
          </visual>
        </link>
      </model>
    </xacro:macro>

    <!-- Shelves (boxes) -->
    <model name="shelf_1">
      <pose>5 5 0.75 0 0 0</pose>
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box><size>2 0.5 1.5</size></box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box><size>2 0.5 1.5</size></box>
          </geometry>
          <material>
            <ambient>0.6 0.4 0.2 1</ambient>
          </material>
        </visual>
      </link>
    </model>

    <!-- Obstacles (dynamic objects) -->
    <model name="box_1">
      <pose>2 2 0.5 0 0 0</pose>
      <link name="link">
        <inertial>
          <mass>5.0</mass>
          <inertia>
            <ixx>0.083</ixx><iyy>0.083</iyy><izz>0.083</izz>
            <ixy>0</ixy><ixz>0</ixz><iyz>0</iyz>
          </inertia>
        </inertial>
        <collision name="collision">
          <geometry>
            <box><size>1 1 1</size></box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box><size>1 1 1</size></box>
          </geometry>
          <material>
            <ambient>0.8 0.3 0.1 1</ambient>
          </material>
        </visual>
      </link>
    </model>

  </world>
</sdf>
```

### Gazebo Fuel Models

**Fuel**: Online model repository (https://app.gazebosim.org/fuel).

**Download model**:

```bash
# Download via CLI
gz fuel download -u https://fuel.gazebosim.org/1.0/OpenRobotics/models/Rescue Randy
```

**Use in world**:

```xml
<world name="my_world">
  <include>
    <uri>https://fuel.gazebosim.org/1.0/OpenRobotics/models/Rescue Randy</uri>
    <pose>0 0 0.5 0 0 0</pose>
  </include>
</world>
```

**Or use local path**:

```xml
<include>
  <uri>model://Rescue_Randy</uri>
</include>
```

**Set model path** (for local models):

```bash
export GZ_SIM_RESOURCE_PATH=$HOME/gazebo_models:$GZ_SIM_RESOURCE_PATH
```

### Key Takeaways (Intermediate)

✅ **ros_gz bridge** connects Gazebo and ROS 2
✅ **Physics engines** can be configured (ODE, Bullet, DART)
✅ **World files** define complex environments
✅ **Gazebo Fuel** provides pre-built models
✅ **Plugins** extend Gazebo functionality

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Create custom physics plugins
- Optimize simulation performance
- Implement headless simulation
- Design distributed multi-robot simulations
- Profile and debug Gazebo

### Custom Physics Plugin

**Use case**: Custom force application, non-standard dynamics.

**Example: Wind plugin** (applies force to models):

**src/wind_plugin.cpp**:

```cpp
#include <gz/sim/System.hh>
#include <gz/sim/Model.hh>
#include <gz/plugin/Register.hh>
#include <gz/sim/components/Link.hh>
#include <gz/sim/components/Name.hh>
#include <gz/sim/components/Pose.hh>
#include <gz/sim/components/ExternalWorldWrenchCmd.hh>
#include <gz/math/Vector3.hh>

namespace custom_plugins
{
  class WindPlugin :
    public gz::sim::System,
    public gz::sim::ISystemConfigure,
    public gz::sim::ISystemPreUpdate
  {
  public:
    WindPlugin() = default;

    void Configure(const gz::sim::Entity &_entity,
                   const std::shared_ptr<const sdf::Element> &_sdf,
                   gz::sim::EntityComponentManager &_ecm,
                   gz::sim::EventManager &) override
    {
      // Get wind parameters from SDF
      this->windForce.X() = _sdf->Get<double>("wind_force_x", 0.0).first;
      this->windForce.Y() = _sdf->Get<double>("wind_force_y", 0.0).first;
      this->windForce.Z() = _sdf->Get<double>("wind_force_z", 0.0).first;

      gzmsg << "Wind plugin loaded. Force: " << this->windForce << std::endl;
    }

    void PreUpdate(const gz::sim::UpdateInfo &,
                   gz::sim::EntityComponentManager &_ecm) override
    {
      // Apply wind force to all non-static links
      _ecm.Each<gz::sim::components::Link,
                gz::sim::components::Name>(
        [&](const gz::sim::Entity &_entity,
            gz::sim::components::Link *,
            gz::sim::components::Name *_name) -> bool
        {
          // Create wrench (force + torque)
          gz::msgs::Wrench wrench;
          gz::msgs::Set(wrench.mutable_force(), this->windForce);

          // Apply wrench to link
          _ecm.SetComponentData<gz::sim::components::ExternalWorldWrenchCmd>(
            _entity, {wrench});

          return true;
        });
    }

  private:
    gz::math::Vector3d windForce{0, 0, 0};
  };
}

GZ_ADD_PLUGIN(
  custom_plugins::WindPlugin,
  gz::sim::System,
  custom_plugins::WindPlugin::ISystemConfigure,
  custom_plugins::WindPlugin::ISystemPreUpdate)
```

**CMakeLists.txt**:

```cmake
cmake_minimum_required(VERSION 3.10)
project(custom_gazebo_plugins)

find_package(gz-sim7 REQUIRED)

add_library(wind_plugin SHARED src/wind_plugin.cpp)
target_link_libraries(wind_plugin
  gz-sim7::gz-sim7
)
```

**Use in world**:

```xml
<world name="windy_world">
  <plugin filename="libwind_plugin.so" name="custom_plugins::WindPlugin">
    <wind_force_x>5.0</wind_force_x>
    <wind_force_y>0.0</wind_force_y>
    <wind_force_z>0.0</wind_force_z>
  </plugin>
</world>
```

### Performance Optimization

**Strategies**:

1. **Reduce physics update rate**:
```xml
<physics>
  <max_step_size>0.01</max_step_size>  <!-- 10ms instead of 1ms -->
  <real_time_update_rate>100</real_time_update_rate>
</physics>
```

2. **Simplify collision geometry**:
```xml
<!-- Complex visual -->
<visual>
  <geometry>
    <mesh><uri>model://detailed_robot.dae</uri></mesh>
  </geometry>
</visual>

<!-- Simple collision -->
<collision>
  <geometry>
    <box><size>0.5 0.3 0.2</size></box>
  </geometry>
</collision>
```

3. **Disable unnecessary features**:
```xml
<!-- Disable shadows if not needed -->
<light name="sun">
  <cast_shadows>false</cast_shadows>
</light>

<!-- Disable self-collision -->
<model name="robot">
  <self_collide>false</self_collide>
</model>
```

4. **Use level of detail (LOD)**:
```xml
<visual>
  <geometry>
    <mesh>
      <uri>model://robot.dae</uri>
      <submesh>
        <name>high_detail</name>
        <center>false</center>
      </submesh>
    </mesh>
  </geometry>
</visual>
```

### Headless Simulation

**Run without GUI** (faster, for CI/CD):

```bash
# Headless mode
gz sim -r -s worlds/warehouse.world
```

**Launch file for headless**:

```python
def generate_launch_description():
    return LaunchDescription([
        ExecuteProcess(
            cmd=['gz', 'sim', '-r', '-s', world_file],  # -s: headless
            output='screen'
        ),
    ])
```

**Automated testing**:

```python
#!/usr/bin/env python3
import launch
import launch_testing
import pytest

@pytest.fixture
def gz_process():
    return launch.actions.ExecuteProcess(
        cmd=['gz', 'sim', '-r', '-s', 'empty.world'],
        output='screen'
    )

def test_robot_spawns(gz_process):
    """Test that robot spawns successfully."""
    # Start Gazebo headless
    # Spawn robot
    # Check that robot exists in simulation
    # Shutdown
    pass
```

### Distributed Simulation

**Multi-machine simulation** for large worlds or many robots.

**Primary server** (physics + rendering):

```bash
# Machine 1: Run Gazebo server
gz sim -r worlds/large_world.world
```

**Secondary client** (GUI only):

```bash
# Machine 2: Connect to server
export GZ_PARTITION=my_simulation
gz sim -g  # GUI only, connects to remote server
```

**Environment variables**:
- `GZ_PARTITION`: Simulation namespace (must match)
- `GZ_IP`: Server IP address
- `GZ_DISCOVERY_SERVER`: Discovery server for large networks

**Multi-robot coordination**:

```xml
<!-- World with multiple robots -->
<world name="multi_robot">
  <include>
    <uri>model://robot_1</uri>
    <pose>0 0 0.5 0 0 0</pose>
    <name>robot_1</name>
  </include>

  <include>
    <uri>model://robot_1</uri>  <!-- Reuse same model -->
    <pose>5 0 0.5 0 0 0</pose>
    <name>robot_2</name>
  </include>

  <include>
    <uri>model://robot_1</uri>
    <pose>10 0 0.5 0 0 0</pose>
    <name>robot_3</name>
  </include>
</world>
```

### Profiling and Debugging

**Monitor performance**:

```bash
# Real-time factor (should be ~1.0)
gz topic -e -t /stats

# List all topics
gz topic -l

# Monitor specific topic
gz topic -e -t /model/my_robot/odometry
```

**Enable verbose logging**:

```bash
export GZ_VERBOSE=1
gz sim worlds/my_world.world
```

**Performance profiling**:

```bash
# Install profiling tools
sudo apt install valgrind kcachegrind

# Profile Gazebo
valgrind --tool=callgrind gz sim worlds/my_world.world

# Visualize results
kcachegrind callgrind.out.*
```

**Common issues**:

1. **Slow simulation** (RTF < 0.5):
   - Reduce physics rate
   - Simplify collision shapes
   - Disable unnecessary sensors

2. **Unstable contacts**:
   - Increase solver iterations
   - Adjust CFM/ERP parameters
   - Check mass/inertia values

3. **Memory leaks**:
   - Profile with valgrind
   - Check plugin lifecycle
   - Verify resource cleanup

### Key Takeaways (Advanced)

✅ **Custom plugins** enable specialized behaviors
✅ **Performance optimization** balances speed and accuracy
✅ **Headless mode** enables automated testing
✅ **Distributed simulation** scales to large environments
✅ **Profiling tools** identify bottlenecks

---

## Additional Resources

- [Gazebo Sim Documentation](https://gazebosim.org/docs/latest/getstarted)
- [gz-sim API](https://gazebosim.org/api/sim/7/index.html)
- [ros_gz Integration](https://github.com/gazebosim/ros_gz)
- [Gazebo Fuel Models](https://app.gazebosim.org/fuel/models)
- [SDF Format Spec](http://sdformat.org/spec)

---

**Next:** [Gazebo Physics & Sensors →](./06-gazebo-physics.md)
