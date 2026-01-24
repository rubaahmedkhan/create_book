---
sidebar_position: 4
---

# Lab: Build Your Robot

**Hands-On Project**: Apply URDF, Links, Joints, and Sensors

---

## 🟢 Beginner Level

**Duration**: 3-4 hours
**Goal**: Build a simple differential drive robot with basic sensors

### Project Overview

Build a **mobile robot** with:
- Differential drive base (two powered wheels + caster)
- Camera sensor
- 2D LiDAR sensor
- IMU
- Proper URDF structure with XACRO
- Visualization in RViz2

### Step 1: Create Package

```bash
cd ~/ros2_ws/src

# Create package
ros2 pkg create my_mobile_robot \
  --build-type ament_cmake \
  --dependencies urdf xacro

# Create directory structure
cd my_mobile_robot
mkdir -p urdf launch rviz config
```

### Step 2: Define Robot Properties

**urdf/properties.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- Robot Dimensions -->
  <xacro:property name="base_length" value="0.6"/>
  <xacro:property name="base_width" value="0.4"/>
  <xacro:property name="base_height" value="0.2"/>
  <xacro:property name="base_mass" value="15.0"/>

  <!-- Wheel Properties -->
  <xacro:property name="wheel_radius" value="0.1"/>
  <xacro:property name="wheel_thickness" value="0.05"/>
  <xacro:property name="wheel_mass" value="1.5"/>
  <xacro:property name="wheel_separation" value="0.5"/>

  <!-- Caster Properties -->
  <xacro:property name="caster_radius" value="0.05"/>
  <xacro:property name="caster_mass" value="0.5"/>

  <!-- Sensor Properties -->
  <xacro:property name="lidar_size" value="0.1"/>
  <xacro:property name="camera_size" value="0.05"/>

  <!-- Colors -->
  <material name="blue">
    <color rgba="0 0 0.8 1"/>
  </material>

  <material name="black">
    <color rgba="0 0 0 1"/>
  </material>

  <material name="gray">
    <color rgba="0.5 0.5 0.5 1"/>
  </material>

  <material name="red">
    <color rgba="0.8 0 0 1"/>
  </material>

</robot>
```

### Step 3: Create Inertia Macros

**urdf/macros.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- Box Inertia -->
  <xacro:macro name="box_inertia" params="m l w h">
    <inertial>
      <mass value="${m}"/>
      <inertia ixx="${(1/12) * m * (w*w + h*h)}" ixy="0.0" ixz="0.0"
               iyy="${(1/12) * m * (l*l + h*h)}" iyz="0.0"
               izz="${(1/12) * m * (l*l + w*w)}"/>
    </inertial>
  </xacro:macro>

  <!-- Cylinder Inertia -->
  <xacro:macro name="cylinder_inertia" params="m r h">
    <inertial>
      <mass value="${m}"/>
      <inertia ixx="${(1/12) * m * (3*r*r + h*h)}" ixy="0.0" ixz="0.0"
               iyy="${(1/12) * m * (3*r*r + h*h)}" iyz="0.0"
               izz="${(1/2) * m * r*r}"/>
    </inertial>
  </xacro:macro>

  <!-- Sphere Inertia -->
  <xacro:macro name="sphere_inertia" params="m r">
    <inertial>
      <mass value="${m}"/>
      <inertia ixx="${(2/5) * m * r * r}" ixy="0.0" ixz="0.0"
               iyy="${(2/5) * m * r * r}" iyz="0.0"
               izz="${(2/5) * m * r * r}"/>
    </inertial>
  </xacro:macro>

</robot>
```

### Step 4: Build Robot Base

**urdf/robot_base.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="mobile_robot">

  <!-- Include properties and macros -->
  <xacro:include filename="$(find my_mobile_robot)/urdf/properties.xacro"/>
  <xacro:include filename="$(find my_mobile_robot)/urdf/macros.xacro"/>

  <!-- Base Footprint (on ground) -->
  <link name="base_footprint"/>

  <!-- Base Link (chassis) -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
      <material name="blue"/>
    </visual>

    <collision>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
    </collision>

    <xacro:box_inertia m="${base_mass}"
                       l="${base_length}"
                       w="${base_width}"
                       h="${base_height}"/>
  </link>

  <!-- Base Footprint to Base Link -->
  <joint name="base_joint" type="fixed">
    <parent link="base_footprint"/>
    <child link="base_link"/>
    <origin xyz="0 0 ${wheel_radius}" rpy="0 0 0"/>
  </joint>

  <!-- Wheel Macro -->
  <xacro:macro name="wheel" params="prefix reflect">
    <link name="${prefix}_wheel">
      <visual>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_thickness}"/>
        </geometry>
        <material name="black"/>
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

  <!-- Instantiate Wheels -->
  <xacro:wheel prefix="left" reflect="1"/>
  <xacro:wheel prefix="right" reflect="-1"/>

  <!-- Caster Wheel -->
  <link name="caster_wheel">
    <visual>
      <geometry>
        <sphere radius="${caster_radius}"/>
      </geometry>
      <material name="gray"/>
    </visual>

    <collision>
      <geometry>
        <sphere radius="${caster_radius}"/>
      </geometry>
    </collision>

    <xacro:sphere_inertia m="${caster_mass}" r="${caster_radius}"/>
  </link>

  <joint name="caster_joint" type="fixed">
    <parent link="base_link"/>
    <child link="caster_wheel"/>
    <origin xyz="-0.25 0 ${-wheel_radius + caster_radius}" rpy="0 0 0"/>
  </joint>

</robot>
```

### Step 5: Add Sensors

**urdf/sensors.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- Camera -->
  <link name="camera_link">
    <visual>
      <geometry>
        <box size="${camera_size} ${camera_size} ${camera_size}"/>
      </geometry>
      <material name="red"/>
    </visual>

    <collision>
      <geometry>
        <box size="${camera_size} ${camera_size} ${camera_size}"/>
      </geometry>
    </collision>

    <inertial>
      <mass value="0.1"/>
      <inertia ixx="0.00001" ixy="0" ixz="0" iyy="0.00001" iyz="0" izz="0.00001"/>
    </inertial>
  </link>

  <joint name="camera_joint" type="fixed">
    <parent link="base_link"/>
    <child link="camera_link"/>
    <origin xyz="${base_length/2} 0 ${base_height/2 + camera_size/2}" rpy="0 0 0"/>
  </joint>

  <!-- LiDAR -->
  <link name="lidar_link">
    <visual>
      <geometry>
        <cylinder radius="${lidar_size/2}" length="${lidar_size}"/>
      </geometry>
      <material name="black"/>
    </visual>

    <collision>
      <geometry>
        <cylinder radius="${lidar_size/2}" length="${lidar_size}"/>
      </geometry>
    </collision>

    <inertial>
      <mass value="0.3"/>
      <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
    </inertial>
  </link>

  <joint name="lidar_joint" type="fixed">
    <parent link="base_link"/>
    <child link="lidar_link"/>
    <origin xyz="0 0 ${base_height/2 + lidar_size/2}" rpy="0 0 0"/>
  </joint>

  <!-- IMU (invisible, inside base) -->
  <link name="imu_link">
    <inertial>
      <mass value="0.01"/>
      <inertia ixx="0.000001" ixy="0" ixz="0" iyy="0.000001" iyz="0" izz="0.000001"/>
    </inertial>
  </link>

  <joint name="imu_joint" type="fixed">
    <parent link="base_link"/>
    <child link="imu_link"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
  </joint>

</robot>
```

### Step 6: Create Main URDF

**urdf/robot.urdf.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_mobile_robot">

  <!-- Include base robot -->
  <xacro:include filename="$(find my_mobile_robot)/urdf/robot_base.xacro"/>

  <!-- Include sensors -->
  <xacro:include filename="$(find my_mobile_robot)/urdf/sensors.xacro"/>

</robot>
```

### Step 7: Create Launch File

**launch/display.launch.py**:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration, Command
from launch_ros.actions import Node

def generate_launch_description():
    # Paths
    pkg_share = get_package_share_directory('my_mobile_robot')
    urdf_file = os.path.join(pkg_share, 'urdf', 'robot.urdf.xacro')
    rviz_config = os.path.join(pkg_share, 'rviz', 'robot.rviz')

    # Process XACRO
    robot_description = Command(['xacro ', urdf_file])

    return LaunchDescription([
        # Robot State Publisher
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            output='screen',
            parameters=[{
                'robot_description': robot_description,
                'use_sim_time': False
            }]
        ),

        # Joint State Publisher GUI
        Node(
            package='joint_state_publisher_gui',
            executable='joint_state_publisher_gui',
            name='joint_state_publisher_gui',
            output='screen'
        ),

        # RViz
        Node(
            package='rviz2',
            executable='rviz2',
            name='rviz2',
            output='screen',
            arguments=['-d', rviz_config]
        ),
    ])
```

### Step 8: Update CMakeLists.txt

**CMakeLists.txt**:

```cmake
cmake_minimum_required(VERSION 3.8)
project(my_mobile_robot)

# Find dependencies
find_package(ament_cmake REQUIRED)
find_package(urdf REQUIRED)
find_package(xacro REQUIRED)

# Install directories
install(
  DIRECTORY urdf launch rviz config
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
```

### Step 9: Update package.xml

**package.xml**:

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_mobile_robot</name>
  <version>0.1.0</version>
  <description>My mobile robot URDF</description>
  <maintainer email="you@example.com">Your Name</maintainer>
  <license>Apache-2.0</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <depend>urdf</depend>
  <depend>xacro</depend>

  <exec_depend>robot_state_publisher</exec_depend>
  <exec_depend>joint_state_publisher_gui</exec_depend>
  <exec_depend>rviz2</exec_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

### Step 10: Build and Test

```bash
# Build
cd ~/ros2_ws
colcon build --packages-select my_mobile_robot --symlink-install
source install/setup.bash

# Validate URDF
check_urdf install/my_mobile_robot/share/my_mobile_robot/urdf/robot.urdf.xacro

# Launch visualization
ros2 launch my_mobile_robot display.launch.py
```

**In RViz2**:
1. Set Fixed Frame to `base_link`
2. Add → RobotModel
3. Use joint sliders to move wheels
4. Verify all links and joints appear correctly

### Verification Checklist (Beginner)

- [ ] Package builds without errors
- [ ] URDF validates with `check_urdf`
- [ ] Robot displays correctly in RViz2
- [ ] All links visible (base, wheels, caster, sensors)
- [ ] Wheel joints can rotate via GUI sliders
- [ ] TF tree shows all frames connected

---

## 🟡 Intermediate Level

**Duration**: 4-5 hours
**Goal**: Add Gazebo simulation with sensor plugins and basic control

### Step 11: Add Gazebo Properties

**urdf/gazebo.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- Gazebo materials -->
  <gazebo reference="base_link">
    <material>Gazebo/Blue</material>
  </gazebo>

  <gazebo reference="left_wheel">
    <material>Gazebo/Black</material>
    <mu1>1.0</mu1>
    <mu2>1.0</mu2>
  </gazebo>

  <gazebo reference="right_wheel">
    <material>Gazebo/Black</material>
    <mu1>1.0</mu1>
    <mu2>1.0</mu2>
  </gazebo>

  <gazebo reference="caster_wheel">
    <material>Gazebo/Grey</material>
    <mu1>0.1</mu1>
    <mu2>0.1</mu2>
  </gazebo>

  <!-- Camera Sensor -->
  <gazebo reference="camera_link">
    <sensor name="camera" type="camera">
      <update_rate>30</update_rate>
      <camera>
        <horizontal_fov>1.047</horizontal_fov>
        <image>
          <width>640</width>
          <height>480</height>
          <format>R8G8B8</format>
        </image>
        <clip>
          <near>0.05</near>
          <far>100</far>
        </clip>
        <noise>
          <type>gaussian</type>
          <mean>0.0</mean>
          <stddev>0.007</stddev>
        </noise>
      </camera>

      <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
        <ros>
          <namespace>/robot</namespace>
          <remapping>~/image_raw:=camera/image_raw</remapping>
          <remapping>~/camera_info:=camera/camera_info</remapping>
        </ros>
        <camera_name>camera</camera_name>
        <frame_name>camera_link</frame_name>
      </plugin>
    </sensor>
  </gazebo>

  <!-- LiDAR Sensor -->
  <gazebo reference="lidar_link">
    <sensor name="lidar" type="ray">
      <update_rate>10</update_rate>
      <ray>
        <scan>
          <horizontal>
            <samples>360</samples>
            <resolution>1</resolution>
            <min_angle>-3.14159</min_angle>
            <max_angle>3.14159</max_angle>
          </horizontal>
        </scan>
        <range>
          <min>0.2</min>
          <max>10.0</max>
          <resolution>0.01</resolution>
        </range>
        <noise>
          <type>gaussian</type>
          <mean>0.0</mean>
          <stddev>0.01</stddev>
        </noise>
      </ray>

      <plugin name="lidar_controller" filename="libgazebo_ros_ray_sensor.so">
        <ros>
          <namespace>/robot</namespace>
          <remapping>~/out:=scan</remapping>
        </ros>
        <output_type>sensor_msgs/LaserScan</output_type>
        <frame_name>lidar_link</frame_name>
      </plugin>
    </sensor>
  </gazebo>

  <!-- IMU Sensor -->
  <gazebo reference="imu_link">
    <sensor name="imu" type="imu">
      <update_rate>100</update_rate>
      <imu>
        <angular_velocity>
          <x>
            <noise type="gaussian">
              <mean>0.0</mean>
              <stddev>0.009</stddev>
            </noise>
          </x>
          <y>
            <noise type="gaussian">
              <mean>0.0</mean>
              <stddev>0.009</stddev>
            </noise>
          </y>
          <z>
            <noise type="gaussian">
              <mean>0.0</mean>
              <stddev>0.009</stddev>
            </noise>
          </z>
        </angular_velocity>
        <linear_acceleration>
          <x>
            <noise type="gaussian">
              <mean>0.0</mean>
              <stddev>0.017</stddev>
            </noise>
          </x>
          <y>
            <noise type="gaussian">
              <mean>0.0</mean>
              <stddev>0.017</stddev>
            </noise>
          </y>
          <z>
            <noise type="gaussian">
              <mean>0.0</mean>
              <stddev>0.017</stddev>
            </noise>
          </z>
        </linear_acceleration>
      </imu>

      <plugin name="imu_plugin" filename="libgazebo_ros_imu_sensor.so">
        <ros>
          <namespace>/robot</namespace>
          <remapping>~/out:=imu</remapping>
        </ros>
        <frame_name>imu_link</frame_name>
      </plugin>
    </sensor>
  </gazebo>

  <!-- Differential Drive Controller -->
  <gazebo>
    <plugin name="diff_drive_controller" filename="libgazebo_ros_diff_drive.so">
      <ros>
        <namespace>/robot</namespace>
      </ros>

      <!-- Wheels -->
      <left_joint>left_wheel_joint</left_joint>
      <right_joint>right_wheel_joint</right_joint>

      <!-- Kinematics -->
      <wheel_separation>${wheel_separation}</wheel_separation>
      <wheel_diameter>${2*wheel_radius}</wheel_diameter>

      <!-- Limits -->
      <max_wheel_torque>20</max_wheel_torque>
      <max_wheel_acceleration>1.0</max_wheel_acceleration>

      <!-- Input/Output -->
      <command_topic>cmd_vel</command_topic>
      <publish_odom>true</publish_odom>
      <publish_odom_tf>true</publish_odom_tf>
      <publish_wheel_tf>false</publish_wheel_tf>

      <odometry_topic>odom</odometry_topic>
      <odometry_frame>odom</odometry_frame>
      <robot_base_frame>base_footprint</robot_base_frame>

      <update_rate>50</update_rate>
    </plugin>
  </gazebo>

</robot>
```

### Step 12: Include Gazebo in Main URDF

**Update urdf/robot.urdf.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_mobile_robot">

  <!-- Include base robot -->
  <xacro:include filename="$(find my_mobile_robot)/urdf/robot_base.xacro"/>

  <!-- Include sensors -->
  <xacro:include filename="$(find my_mobile_robot)/urdf/sensors.xacro"/>

  <!-- Include Gazebo properties -->
  <xacro:include filename="$(find my_mobile_robot)/urdf/gazebo.xacro"/>

</robot>
```

### Step 13: Create Gazebo Launch File

**launch/gazebo.launch.py**:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import Command
from launch_ros.actions import Node

def generate_launch_description():
    pkg_share = get_package_share_directory('my_mobile_robot')
    urdf_file = os.path.join(pkg_share, 'urdf', 'robot.urdf.xacro')

    # Process URDF
    robot_description = Command(['xacro ', urdf_file])

    # Gazebo
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            os.path.join(get_package_share_directory('gazebo_ros'),
                        'launch', 'gazebo.launch.py')
        ]),
    )

    # Spawn robot
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=['-topic', 'robot_description', '-entity', 'my_robot'],
        output='screen'
    )

    # Robot State Publisher
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
        spawn_entity,
    ])
```

### Step 14: Test in Gazebo

```bash
# Build
colcon build --packages-select my_mobile_robot
source install/setup.bash

# Launch Gazebo
ros2 launch my_mobile_robot gazebo.launch.py

# Test sensors (in another terminal)
ros2 topic list
ros2 topic echo /robot/scan --once
ros2 topic echo /robot/camera/image_raw --once
ros2 topic echo /robot/imu --once

# Test control
ros2 topic pub /robot/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 0.5}, angular: {z: 0.5}}"
```

### Verification Checklist (Intermediate)

- [ ] Robot spawns in Gazebo without errors
- [ ] Robot responds to /cmd_vel commands
- [ ] LiDAR publishes /scan data
- [ ] Camera publishes images
- [ ] IMU publishes orientation
- [ ] Odometry publishes /odom
- [ ] TF tree includes odom → base_footprint → base_link

---

## 🔴 Advanced Level

**Duration**: 6-8 hours
**Goal**: Build a humanoid or complex multi-DOF robot with advanced sensors

### Project: Simplified Humanoid Robot

**Features**:
- 2-leg bipedal structure
- 2-arm manipulators
- Head with stereo cameras
- Multiple sensors (IMU, force/torque, joint encoders)
- ROS 2 Control integration
- Advanced Gazebo physics

### Step 15: Define Humanoid Structure

**urdf/humanoid_properties.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- Torso -->
  <xacro:property name="torso_length" value="0.4"/>
  <xacro:property name="torso_width" value="0.3"/>
  <xacro:property name="torso_depth" value="0.15"/>
  <xacro:property name="torso_mass" value="10.0"/>

  <!-- Head -->
  <xacro:property name="head_radius" value="0.12"/>
  <xacro:property name="head_mass" value="2.0"/>

  <!-- Upper Leg -->
  <xacro:property name="upper_leg_length" value="0.4"/>
  <xacro:property name="upper_leg_radius" value="0.06"/>
  <xacro:property name="upper_leg_mass" value="3.0"/>

  <!-- Lower Leg -->
  <xacro:property name="lower_leg_length" value="0.4"/>
  <xacro:property name="lower_leg_radius" value="0.05"/>
  <xacro:property name="lower_leg_mass" value="2.0"/>

  <!-- Foot -->
  <xacro:property name="foot_length" value="0.2"/>
  <xacro:property name="foot_width" value="0.1"/>
  <xacro:property name="foot_height" value="0.05"/>
  <xacro:property name="foot_mass" value="0.5"/>

  <!-- Upper Arm -->
  <xacro:property name="upper_arm_length" value="0.3"/>
  <xacro:property name="upper_arm_radius" value="0.04"/>
  <xacro:property name="upper_arm_mass" value="1.5"/>

  <!-- Forearm -->
  <xacro:property name="forearm_length" value="0.3"/>
  <xacro:property name="forearm_radius" value="0.035"/>
  <xacro:property name="forearm_mass" value="1.0"/>

  <!-- Hand -->
  <xacro:property name="hand_length" value="0.1"/>
  <xacro:property name="hand_width" value="0.08"/>
  <xacro:property name="hand_height" value="0.03"/>
  <xacro:property name="hand_mass" value="0.3"/>

</robot>
```

### Step 16: Create Leg Macro

**urdf/leg_macro.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <xacro:macro name="leg" params="prefix reflect">

    <!-- Upper Leg -->
    <link name="${prefix}_upper_leg">
      <visual>
        <origin xyz="0 0 ${-upper_leg_length/2}" rpy="0 0 0"/>
        <geometry>
          <cylinder radius="${upper_leg_radius}" length="${upper_leg_length}"/>
        </geometry>
        <material name="gray">
          <color rgba="0.5 0.5 0.5 1"/>
        </material>
      </visual>

      <collision>
        <origin xyz="0 0 ${-upper_leg_length/2}" rpy="0 0 0"/>
        <geometry>
          <cylinder radius="${upper_leg_radius}" length="${upper_leg_length}"/>
        </geometry>
      </collision>

      <xacro:cylinder_inertia m="${upper_leg_mass}"
                              r="${upper_leg_radius}"
                              h="${upper_leg_length}"/>
    </link>

    <!-- Hip Joint (revolute) -->
    <joint name="${prefix}_hip_joint" type="revolute">
      <parent link="torso"/>
      <child link="${prefix}_upper_leg"/>
      <origin xyz="0 ${reflect * 0.1} ${-torso_length/2}" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>  <!-- Pitch -->
      <limit lower="-1.57" upper="1.57" effort="100" velocity="2.0"/>
      <dynamics damping="1.0" friction="0.5"/>
    </joint>

    <!-- Lower Leg -->
    <link name="${prefix}_lower_leg">
      <visual>
        <origin xyz="0 0 ${-lower_leg_length/2}" rpy="0 0 0"/>
        <geometry>
          <cylinder radius="${lower_leg_radius}" length="${lower_leg_length}"/>
        </geometry>
        <material name="gray">
          <color rgba="0.5 0.5 0.5 1"/>
        </material>
      </visual>

      <collision>
        <origin xyz="0 0 ${-lower_leg_length/2}" rpy="0 0 0"/>
        <geometry>
          <cylinder radius="${lower_leg_radius}" length="${lower_leg_length}"/>
        </geometry>
      </collision>

      <xacro:cylinder_inertia m="${lower_leg_mass}"
                              r="${lower_leg_radius}"
                              h="${lower_leg_length}"/>
    </link>

    <!-- Knee Joint (revolute) -->
    <joint name="${prefix}_knee_joint" type="revolute">
      <parent link="${prefix}_upper_leg"/>
      <child link="${prefix}_lower_leg"/>
      <origin xyz="0 0 ${-upper_leg_length}" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>  <!-- Pitch -->
      <limit lower="0.0" upper="2.5" effort="80" velocity="2.0"/>
      <dynamics damping="0.8" friction="0.3"/>
    </joint>

    <!-- Foot -->
    <link name="${prefix}_foot">
      <visual>
        <geometry>
          <box size="${foot_length} ${foot_width} ${foot_height}"/>
        </geometry>
        <material name="black">
          <color rgba="0 0 0 1"/>
        </material>
      </visual>

      <collision>
        <geometry>
          <box size="${foot_length} ${foot_width} ${foot_height}"/>
        </geometry>
      </collision>

      <xacro:box_inertia m="${foot_mass}"
                         l="${foot_length}"
                         w="${foot_width}"
                         h="${foot_height}"/>
    </link>

    <!-- Ankle Joint (revolute) -->
    <joint name="${prefix}_ankle_joint" type="revolute">
      <parent link="${prefix}_lower_leg"/>
      <child link="${prefix}_foot"/>
      <origin xyz="0 0 ${-lower_leg_length}" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>  <!-- Pitch -->
      <limit lower="-0.5" upper="0.5" effort="50" velocity="2.0"/>
      <dynamics damping="0.5" friction="0.2"/>
    </joint>

    <!-- Foot contact sensor -->
    <gazebo reference="${prefix}_foot">
      <sensor name="${prefix}_foot_contact" type="contact">
        <contact>
          <collision>${prefix}_foot_collision</collision>
        </contact>
        <update_rate>50</update_rate>
        <plugin name="${prefix}_foot_contact_plugin" filename="libgazebo_ros_bumper.so">
          <ros>
            <namespace>/robot</namespace>
            <remapping>~/out:=${prefix}_foot/contact</remapping>
          </ros>
          <frame_name>${prefix}_foot</frame_name>
        </plugin>
      </sensor>

      <mu1>1.5</mu1>
      <mu2>1.5</mu2>
      <material>Gazebo/Black</material>
    </gazebo>

  </xacro:macro>

</robot>
```

### Step 17: Advanced ROS 2 Control Integration

**config/ros2_control.yaml**:

```yaml
controller_manager:
  ros__parameters:
    update_rate: 100

    joint_state_broadcaster:
      type: joint_state_broadcaster/JointStateBroadcaster

    humanoid_controller:
      type: joint_trajectory_controller/JointTrajectoryController

humanoid_controller:
  ros__parameters:
    joints:
      - left_hip_joint
      - left_knee_joint
      - left_ankle_joint
      - right_hip_joint
      - right_knee_joint
      - right_ankle_joint
      - left_shoulder_joint
      - left_elbow_joint
      - right_shoulder_joint
      - right_elbow_joint

    command_interfaces:
      - position

    state_interfaces:
      - position
      - velocity

    state_publish_rate: 50.0
    action_monitor_rate: 20.0

    constraints:
      stopped_velocity_tolerance: 0.01
      goal_time: 0.0
```

### Key Takeaways (Advanced)

✅ **Complex robots** require careful kinematic design
✅ **ROS 2 Control** provides standardized control interface
✅ **Contact sensors** detect ground contact for walking
✅ **Multiple camera** configurations for stereo vision
✅ **Production URDF** uses modular macros and organized structure

---

## Submission Guidelines

**Required Deliverables**:

1. **Package directory**:
   - `urdf/` (all XACRO files)
   - `launch/` (display, gazebo launch files)
   - `config/` (ROS 2 Control, parameters)
   - `rviz/` (RViz configuration)

2. **Documentation** (README.md):
   - Robot description (DOF, sensors, capabilities)
   - Build instructions
   - Launch instructions
   - Known issues/limitations

3. **Video demo** (3-5 minutes):
   - Robot in RViz2
   - Robot in Gazebo
   - Sensor data visualization
   - Teleoperation or autonomous behavior

4. **Testing proof**:
   - Screenshots of RViz2 and Gazebo
   - Terminal output showing sensor topics
   - TF tree diagram (frames.pdf)

---

## Additional Resources

- [URDF Tutorials](https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/URDF-Main.html)
- [Using URDF in Gazebo](https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/Using-a-URDF-in-Gazebo.html)
- [ROS 2 Control](https://control.ros.org/humble/index.html)
- [Gazebo Plugins](https://classic.gazebosim.org/tutorials?tut=ros_gzplugins)

---

**Next Module:** [Week 5: Gazebo Simulation →](../week5/05-gazebo-intro.md)
