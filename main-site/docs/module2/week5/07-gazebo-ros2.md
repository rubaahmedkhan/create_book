---
sidebar_position: 7
---

# Gazebo-ROS 2 Integration

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Gazebo Introduction, ROS 2 Basics

### Learning Objectives

- Understand ros_gz_bridge basics
- Bridge topics between Gazebo and ROS 2
- Spawn robots from ROS 2
- Use basic control with cmd_vel
- Synchronize simulation clock

### What is ros_gz?

**ros_gz** is the bridge between **Gazebo** and **ROS 2**.

**Components**:
- **ros_gz_bridge**: Topic/service bridging
- **ros_gz_sim**: Launch and spawn utilities
- **ros_gz_image**: Image transport bridge
- **ros_gz_interfaces**: Message definitions

**Why bridge?**
- Gazebo uses **Ignition Transport** (gz msgs)
- ROS 2 uses **DDS** (ROS 2 msgs)
- Bridge translates between them

### Installation

```bash
# Install ros_gz packages
sudo apt update
sudo apt install ros-humble-ros-gz

# Verify installation
ros2 pkg list | grep ros_gz
```

**Expected output**:
```
ros_gz
ros_gz_bridge
ros_gz_image
ros_gz_interfaces
ros_gz_sim
```

### Basic Topic Bridging

**Manual bridge** (command line):

```bash
# Terminal 1: Start Gazebo
gz sim empty.world

# Terminal 2: Bridge a topic
ros2 run ros_gz_bridge parameter_bridge /topic@ROS_MSG_TYPE@GZ_MSG_TYPE
```

**Example: Bridge cmd_vel** (ROS 2 → Gazebo):

```bash
ros2 run ros_gz_bridge parameter_bridge \
  /cmd_vel@geometry_msgs/msg/Twist@gz.msgs.Twist
```

**Syntax**:
```
/topic_name@ros2_msg_type@gz_msg_type
```

**Direction**:
- `@type[type` → Gazebo to ROS 2
- `@type]type` → ROS 2 to Gazebo
- `@type@type` → Bidirectional (rare)

### Common Message Mappings

| ROS 2 Message | Gazebo Message | Use Case |
|---------------|----------------|----------|
| `geometry_msgs/msg/Twist` | `gz.msgs.Twist` | Velocity commands |
| `nav_msgs/msg/Odometry` | `gz.msgs.Odometry` | Odometry data |
| `sensor_msgs/msg/LaserScan` | `gz.msgs.LaserScan` | 2D LiDAR |
| `sensor_msgs/msg/Image` | `gz.msgs.Image` | Camera images |
| `sensor_msgs/msg/Imu` | `gz.msgs.IMU` | IMU data |
| `sensor_msgs/msg/PointCloud2` | `gz.msgs.PointCloudPacked` | 3D LiDAR |
| `rosgraph_msgs/msg/Clock` | `gz.msgs.Clock` | Simulation time |

### Bridge Launch File

**Create bridge node** in launch file:

**launch/gz_ros2_bridge.launch.py**:

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Bridge node
        Node(
            package='ros_gz_bridge',
            executable='parameter_bridge',
            name='ros_gz_bridge',
            arguments=[
                # Clock (Gazebo → ROS 2)
                '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',

                # Cmd_vel (ROS 2 → Gazebo)
                '/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',

                # Odometry (Gazebo → ROS 2)
                '/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',

                # LiDAR (Gazebo → ROS 2)
                '/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',

                # Camera (Gazebo → ROS 2)
                '/camera/image_raw@sensor_msgs/msg/Image[gz.msgs.Image',
                '/camera/camera_info@sensor_msgs/msg/CameraInfo[gz.msgs.CameraInfo',

                # IMU (Gazebo → ROS 2)
                '/imu@sensor_msgs/msg/Imu[gz.msgs.IMU',
            ],
            parameters=[{
                'use_sim_time': True
            }],
            output='screen'
        ),
    ])
```

**Launch**:

```bash
ros2 launch my_robot_pkg gz_ros2_bridge.launch.py
```

**Test topics**:

```bash
# List ROS 2 topics
ros2 topic list

# Echo odometry
ros2 topic echo /odom

# Send velocity command
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 0.5}, angular: {z: 0.5}}"
```

### Spawning Robots from ROS 2

**Method 1: Using spawn_entity.py**

```bash
# Start Gazebo
gz sim empty.world

# Spawn robot (in another terminal)
ros2 run ros_gz_sim create \
  -name my_robot \
  -file ~/ros2_ws/install/my_robot_pkg/share/my_robot_pkg/urdf/robot.urdf \
  -x 0 -y 0 -z 0.5
```

**Method 2: Launch file** (recommended):

**launch/spawn_robot.launch.py**:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import ExecuteProcess, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import Command
from launch_ros.actions import Node

def generate_launch_description():
    pkg_share = get_package_share_directory('my_robot_pkg')
    urdf_file = os.path.join(pkg_share, 'urdf', 'robot.urdf.xacro')
    world_file = os.path.join(pkg_share, 'worlds', 'empty.world')

    # Process URDF
    robot_description = Command(['xacro ', urdf_file])

    return LaunchDescription([
        # Start Gazebo
        ExecuteProcess(
            cmd=['gz', 'sim', '-r', world_file],
            output='screen'
        ),

        # Robot State Publisher
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            output='screen',
            parameters=[{
                'robot_description': robot_description,
                'use_sim_time': True
            }]
        ),

        # Spawn Robot
        Node(
            package='ros_gz_sim',
            executable='create',
            name='spawn_robot',
            arguments=[
                '-name', 'my_robot',
                '-topic', 'robot_description',
                '-x', '0',
                '-y', '0',
                '-z', '0.5'
            ],
            output='screen'
        ),

        # Bridge
        Node(
            package='ros_gz_bridge',
            executable='parameter_bridge',
            name='ros_gz_bridge',
            arguments=[
                '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',
                '/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
                '/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
            ],
            parameters=[{'use_sim_time': True}],
            output='screen'
        ),
    ])
```

**Launch**:

```bash
ros2 launch my_robot_pkg spawn_robot.launch.py
```

### Basic Robot Control

**Differential drive control** (already in URDF from previous labs):

**URDF plugin**:

```xml
<gazebo>
  <plugin filename="libgz-sim-diff-drive-system.so"
          name="gz::sim::systems::DiffDrive">
    <left_joint>left_wheel_joint</left_joint>
    <right_joint>right_wheel_joint</right_joint>
    <wheel_separation>0.5</wheel_separation>
    <wheel_diameter>0.2</wheel_diameter>
    <topic>/cmd_vel</topic>
    <odom_topic>/odom</odom_topic>
  </plugin>
</gazebo>
```

**Test control**:

```bash
# Keyboard teleop
sudo apt install ros-humble-teleop-twist-keyboard
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

**Keys**:
- `i`: Forward
- `k`: Stop
- `j`: Turn left
- `l`: Turn right
- `u`, `o`, `m`, `.`: Diagonal

### Clock Synchronization

**Why important**: ROS 2 nodes need simulation time, not wall clock time.

**Enable sim time** in all nodes:

```python
Node(
    package='my_package',
    executable='my_node',
    parameters=[{
        'use_sim_time': True  # Use simulation clock
    }]
)
```

**Bridge clock**:

```python
Node(
    package='ros_gz_bridge',
    executable='parameter_bridge',
    arguments=[
        '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',
        # ... other topics
    ]
)
```

**Verify time**:

```bash
# Check ROS 2 time source
ros2 topic echo /clock

# Compare to system time
date +%s
```

**Global parameter** (alternative):

```bash
# Set use_sim_time globally
ros2 param set /use_sim_time True
```

### Key Takeaways (Beginner)

✅ **ros_gz_bridge** connects Gazebo and ROS 2 topics
✅ **Bridge syntax**: `/topic@ros_msg[gz_msg` or `]gz_msg`
✅ **Spawn robots** using `ros_gz_sim create` or launch files
✅ **Differential drive** plugin enables cmd_vel control
✅ **Clock sync** critical for time-dependent algorithms

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Implement ros2_control integration
- Configure gazebo_ros2_control
- Use joint trajectory controllers
- Bridge custom messages
- Handle service bridging

### ros2_control Integration

**ros2_control**: Standard interface for robot control in ROS 2.

**Architecture**:
```
ROS 2 Controllers
    ↕
ros2_control (Hardware Interface)
    ↕
Gazebo (via gazebo_ros2_control plugin)
    ↕
Simulated Robot
```

**Install**:

```bash
sudo apt install ros-humble-ros2-control ros-humble-ros2-controllers
sudo apt install ros-humble-gazebo-ros2-control
```

### Add ros2_control to URDF

**urdf/robot.ros2_control.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- ros2_control tag -->
  <ros2_control name="GazeboSystem" type="system">
    <hardware>
      <!-- Use Gazebo system interface -->
      <plugin>gazebo_ros2_control/GazeboSystem</plugin>
    </hardware>

    <!-- Left wheel joint -->
    <joint name="left_wheel_joint">
      <command_interface name="velocity">
        <param name="min">-10</param>
        <param name="max">10</param>
      </command_interface>
      <state_interface name="position"/>
      <state_interface name="velocity"/>
    </joint>

    <!-- Right wheel joint -->
    <joint name="right_wheel_joint">
      <command_interface name="velocity">
        <param name="min">-10</param>
        <param name="max">10</param>
      </command_interface>
      <state_interface name="position"/>
      <state_interface name="velocity"/>
    </joint>

  </ros2_control>

  <!-- Gazebo plugin for ros2_control -->
  <gazebo>
    <plugin filename="libgazebo_ros2_control.so" name="gazebo_ros2_control">
      <robot_param>robot_description</robot_param>
      <robot_param_node>robot_state_publisher</robot_param_node>
      <parameters>$(find my_robot_pkg)/config/controllers.yaml</parameters>
    </plugin>
  </gazebo>

</robot>
```

**Include in main URDF**:

```xml
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_robot">
  <!-- ... base, sensors ... -->

  <!-- Include ros2_control -->
  <xacro:include filename="$(find my_robot_pkg)/urdf/robot.ros2_control.xacro"/>
</robot>
```

### Configure Controllers

**config/controllers.yaml**:

```yaml
controller_manager:
  ros__parameters:
    update_rate: 100  # Hz

    # Diff drive controller
    diff_drive_controller:
      type: diff_drive_controller/DiffDriveController

    # Joint state broadcaster
    joint_state_broadcaster:
      type: joint_state_broadcaster/JointStateBroadcaster

# Diff Drive Controller configuration
diff_drive_controller:
  ros__parameters:
    left_wheel_names: ['left_wheel_joint']
    right_wheel_names: ['right_wheel_joint']

    wheel_separation: 0.5
    wheel_radius: 0.1

    # Velocity and acceleration limits
    linear:
      x:
        has_velocity_limits: true
        max_velocity: 1.0
        has_acceleration_limits: true
        max_acceleration: 0.5

    angular:
      z:
        has_velocity_limits: true
        max_velocity: 2.0
        has_acceleration_limits: true
        max_acceleration: 1.0

    # Publish odom
    publish_rate: 50.0
    odom_frame_id: odom
    base_frame_id: base_link
    pose_covariance_diagonal: [0.001, 0.001, 0.001, 0.001, 0.001, 0.01]
    twist_covariance_diagonal: [0.001, 0.001, 0.001, 0.001, 0.001, 0.01]

    # Publish to TF
    enable_odom_tf: true

    # Cmd_vel timeout
    cmd_vel_timeout: 0.5
```

### Launch with Controllers

**launch/robot_with_control.launch.py**:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import ExecuteProcess, RegisterEventHandler
from launch.event_handlers import OnProcessExit
from launch.substitutions import Command
from launch_ros.actions import Node

def generate_launch_description():
    pkg_share = get_package_share_directory('my_robot_pkg')
    urdf_file = os.path.join(pkg_share, 'urdf', 'robot.urdf.xacro')
    world_file = os.path.join(pkg_share, 'worlds', 'empty.world')
    controllers_file = os.path.join(pkg_share, 'config', 'controllers.yaml')

    robot_description = Command(['xacro ', urdf_file])

    # Start Gazebo
    gazebo = ExecuteProcess(
        cmd=['gz', 'sim', '-r', world_file],
        output='screen'
    )

    # Robot State Publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        parameters=[{
            'robot_description': robot_description,
            'use_sim_time': True
        }]
    )

    # Spawn Robot
    spawn_robot = Node(
        package='ros_gz_sim',
        executable='create',
        arguments=['-topic', 'robot_description', '-name', 'my_robot'],
        output='screen'
    )

    # Joint State Broadcaster
    joint_state_broadcaster_spawner = Node(
        package='controller_manager',
        executable='spawner',
        arguments=['joint_state_broadcaster', '--controller-manager', '/controller_manager'],
        parameters=[{'use_sim_time': True}]
    )

    # Diff Drive Controller (start after joint_state_broadcaster)
    diff_drive_controller_spawner = Node(
        package='controller_manager',
        executable='spawner',
        arguments=['diff_drive_controller', '--controller-manager', '/controller_manager'],
        parameters=[{'use_sim_time': True}]
    )

    # Delay diff_drive_controller start
    delay_diff_drive_after_joint_state = RegisterEventHandler(
        event_handler=OnProcessExit(
            target_action=joint_state_broadcaster_spawner,
            on_exit=[diff_drive_controller_spawner],
        )
    )

    # Bridge
    bridge = Node(
        package='ros_gz_bridge',
        executable='parameter_bridge',
        arguments=[
            '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',
            '/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',
        ],
        parameters=[{'use_sim_time': True}],
        output='screen'
    )

    return LaunchDescription([
        gazebo,
        robot_state_publisher,
        spawn_robot,
        joint_state_broadcaster_spawner,
        delay_diff_drive_after_joint_state,
        bridge,
    ])
```

**Test**:

```bash
# Launch
ros2 launch my_robot_pkg robot_with_control.launch.py

# Check controllers
ros2 control list_controllers

# Send velocity command
ros2 topic pub /diff_drive_controller/cmd_vel_unstamped geometry_msgs/msg/Twist \
  "{linear: {x: 0.5}, angular: {z: 0.3}}" -r 10
```

### Joint Trajectory Controller

**For robot arms** (position control):

**Add to ros2_control**:

```xml
<ros2_control name="ArmSystem" type="system">
  <hardware>
    <plugin>gazebo_ros2_control/GazeboSystem</plugin>
  </hardware>

  <joint name="shoulder_joint">
    <command_interface name="position">
      <param name="min">-1.57</param>
      <param name="max">1.57</param>
    </command_interface>
    <state_interface name="position"/>
    <state_interface name="velocity"/>
  </joint>

  <joint name="elbow_joint">
    <command_interface name="position">
      <param name="min">0</param>
      <param name="max">2.5</param>
    </command_interface>
    <state_interface name="position"/>
    <state_interface name="velocity"/>
  </joint>

  <joint name="wrist_joint">
    <command_interface name="position">
      <param name="min">-1.57</param>
      <param name="max">1.57</param>
    </command_interface>
    <state_interface name="position"/>
    <state_interface name="velocity"/>
  </joint>
</ros2_control>
```

**Controller config**:

```yaml
arm_controller:
  ros__parameters:
    joints:
      - shoulder_joint
      - elbow_joint
      - wrist_joint

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

**Send trajectory goal**:

```bash
# Install trajectory message tools
sudo apt install ros-humble-rqt-joint-trajectory-controller

# GUI to send goals
ros2 run rqt_joint_trajectory_controller rqt_joint_trajectory_controller
```

### Service Bridging

**Bridge ROS 2 service ↔ Gazebo service**:

```python
Node(
    package='ros_gz_bridge',
    executable='parameter_bridge',
    arguments=[
        # Service: Spawn entity (ROS 2 → Gazebo)
        '/world/default/create@ros_gz_interfaces/srv/SpawnEntity',

        # Service: Delete entity (ROS 2 → Gazebo)
        '/world/default/remove@ros_gz_interfaces/srv/DeleteEntity',
    ],
    output='screen'
)
```

**Call service**:

```bash
# Spawn entity
ros2 service call /world/default/create ros_gz_interfaces/srv/SpawnEntity \
  "{name: 'box', xml: '<sdf version=\"1.8\">...</sdf>'}"
```

### Custom Message Bridging

**For custom ROS 2 messages**, create mapping:

**config/bridge_config.yaml**:

```yaml
- topic_name: "/custom_topic"
  ros_type_name: "my_msgs/msg/CustomMsg"
  gz_type_name: "gz.msgs.CustomGzMsg"
  direction: GZ_TO_ROS
```

**Launch with config**:

```python
Node(
    package='ros_gz_bridge',
    executable='parameter_bridge',
    arguments=['--ros-args', '-p', 'config_file:=' + config_file],
    output='screen'
)
```

### Key Takeaways (Intermediate)

✅ **ros2_control** provides standardized control interface
✅ **gazebo_ros2_control** integrates with Gazebo
✅ **Controllers** (diff_drive, joint_trajectory) handle motion
✅ **Service bridging** enables Gazebo service calls from ROS 2
✅ **Custom messages** can be bridged with config files

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Create custom Gazebo-ROS 2 plugins
- Implement zero-copy transport
- Design multi-robot simulations
- Build production deployment pipelines
- Optimize bridge performance

### Custom Gazebo-ROS 2 Plugin

**Example: Custom sensor plugin** that publishes directly to ROS 2.

**src/custom_lidar_plugin.cpp**:

```cpp
#include <gz/sim/System.hh>
#include <gz/sim/Model.hh>
#include <gz/plugin/Register.hh>
#include <gz/sim/components/Name.hh>
#include <gz/sim/components/Sensor.hh>
#include <gz/sensors/Sensor.hh>
#include <gz/sensors/RaySensor.hh>

#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/laser_scan.hpp>

namespace custom_plugins
{
  class CustomLidarPlugin :
    public gz::sim::System,
    public gz::sim::ISystemConfigure,
    public gz::sim::ISystemPostUpdate
  {
  public:
    CustomLidarPlugin()
    {
      // Initialize ROS 2 node
      rclcpp::init(0, nullptr);
      this->rosNode = std::make_shared<rclcpp::Node>("custom_lidar_plugin");
    }

    ~CustomLidarPlugin()
    {
      rclcpp::shutdown();
    }

    void Configure(const gz::sim::Entity &_entity,
                   const std::shared_ptr<const sdf::Element> &_sdf,
                   gz::sim::EntityComponentManager &_ecm,
                   gz::sim::EventManager &) override
    {
      // Get sensor parameters
      std::string topicName = _sdf->Get<std::string>("topic", "/custom_scan").first;
      std::string frameName = _sdf->Get<std::string>("frame", "lidar_link").first;

      this->frameName = frameName;

      // Create ROS 2 publisher
      this->publisher = this->rosNode->create_publisher<sensor_msgs::msg::LaserScan>(
        topicName, 10);

      gzmsg << "Custom LiDAR plugin initialized on topic: " << topicName << std::endl;
    }

    void PostUpdate(const gz::sim::UpdateInfo &_info,
                    const gz::sim::EntityComponentManager &_ecm) override
    {
      // Get sensor data from Gazebo
      // (simplified - actual implementation would query sensor data)

      // Create and publish LaserScan message
      auto msg = sensor_msgs::msg::LaserScan();
      msg.header.stamp = this->rosNode->now();
      msg.header.frame_id = this->frameName;

      msg.angle_min = -M_PI;
      msg.angle_max = M_PI;
      msg.angle_increment = 2.0 * M_PI / 360.0;
      msg.range_min = 0.2;
      msg.range_max = 10.0;

      // Fill ranges (example data)
      msg.ranges.resize(360, 5.0);

      this->publisher->publish(msg);

      // Spin ROS 2
      rclcpp::spin_some(this->rosNode);
    }

  private:
    rclcpp::Node::SharedPtr rosNode;
    rclcpp::Publisher<sensor_msgs::msg::LaserScan>::SharedPtr publisher;
    std::string frameName;
  };
}

GZ_ADD_PLUGIN(
  custom_plugins::CustomLidarPlugin,
  gz::sim::System,
  custom_plugins::CustomLidarPlugin::ISystemConfigure,
  custom_plugins::CustomLidarPlugin::ISystemPostUpdate)
```

**CMakeLists.txt**:

```cmake
cmake_minimum_required(VERSION 3.10)
project(custom_gz_ros2_plugins)

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(gz-sim7 REQUIRED)

add_library(custom_lidar_plugin SHARED src/custom_lidar_plugin.cpp)
target_link_libraries(custom_lidar_plugin
  gz-sim7::gz-sim7
)
ament_target_dependencies(custom_lidar_plugin
  rclcpp
  sensor_msgs
)

ament_package()
```

### Zero-Copy Transport (DDS)

**For high-bandwidth data** (images, point clouds):

**Use shared memory transport**:

**Configure DDS** (CycloneDDS):

**cyclonedds.xml**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CycloneDDS xmlns="https://cdds.io/config">
  <Domain>
    <General>
      <NetworkInterfaceAddress>auto</NetworkInterfaceAddress>
    </General>
    <SharedMemory>
      <Enable>true</Enable>
      <Threshold>10KB</Threshold>  <!-- Use SHM for messages > 10KB -->
    </SharedMemory>
  </Domain>
</CycloneDDS>
```

**Set environment**:

```bash
export CYCLONEDDS_URI=file:///path/to/cyclonedds.xml
```

**Bridge with zero-copy** (when both on same machine):

```python
Node(
    package='ros_gz_bridge',
    executable='parameter_bridge',
    arguments=[
        '/camera/image_raw@sensor_msgs/msg/Image[gz.msgs.Image',
        '/points@sensor_msgs/msg/PointCloud2[gz.msgs.PointCloudPacked',
    ],
    # No special params needed - DDS handles it
)
```

### Multi-Robot Simulation

**Namespace-based approach**:

**launch/multi_robot.launch.py**:

```python
from launch import LaunchDescription
from launch.actions import ExecuteProcess, GroupAction
from launch.substitutions import Command
from launch_ros.actions import Node, PushRosNamespace

def generate_launch_description():
    robots = [
        {'name': 'robot1', 'x': '0', 'y': '0'},
        {'name': 'robot2', 'x': '5', 'y': '0'},
        {'name': 'robot3', 'x': '10', 'y': '0'},
    ]

    # Start Gazebo
    gazebo = ExecuteProcess(
        cmd=['gz', 'sim', '-r', 'multi_robot_world.world'],
        output='screen'
    )

    robot_groups = []

    for robot in robots:
        robot_group = GroupAction([
            PushRosNamespace(robot['name']),

            # Spawn robot
            Node(
                package='ros_gz_sim',
                executable='create',
                arguments=[
                    '-name', robot['name'],
                    '-file', 'robot.urdf',
                    '-x', robot['x'],
                    '-y', robot['y'],
                    '-z', '0.5'
                ],
                output='screen'
            ),

            # Bridge for this robot
            Node(
                package='ros_gz_bridge',
                executable='parameter_bridge',
                arguments=[
                    f"/{robot['name']}/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist",
                    f"/{robot['name']}/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry",
                    f"/{robot['name']}/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan",
                ],
                parameters=[{'use_sim_time': True}],
                output='screen'
            ),
        ])

        robot_groups.append(robot_group)

    return LaunchDescription([
        gazebo,
        *robot_groups
    ])
```

**Test**:

```bash
# Launch multi-robot sim
ros2 launch my_robot_pkg multi_robot.launch.py

# Control robot1
ros2 topic pub /robot1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.5}}" -r 10

# Control robot2
ros2 topic pub /robot2/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.5}}" -r 10
```

### Production Deployment

**Docker container** for consistent deployment:

**Dockerfile**:

```dockerfile
FROM osrf/ros:humble-desktop

# Install Gazebo
RUN apt-get update && apt-get install -y \
    gazebo \
    ros-humble-ros-gz \
    ros-humble-ros2-control \
    ros-humble-gazebo-ros2-control \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace
COPY ros2_ws /root/ros2_ws

# Build workspace
WORKDIR /root/ros2_ws
RUN . /opt/ros/humble/setup.sh && \
    colcon build --symlink-install

# Source workspace
RUN echo "source /root/ros2_ws/install/setup.bash" >> /root/.bashrc

CMD ["bash"]
```

**Build and run**:

```bash
# Build image
docker build -t my_robot_sim .

# Run simulation
docker run -it --rm \
  --network host \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  my_robot_sim \
  ros2 launch my_robot_pkg spawn_robot.launch.py
```

### Performance Optimization

**1. Reduce bridge overhead**:

```python
# Bridge only necessary topics
Node(
    package='ros_gz_bridge',
    executable='parameter_bridge',
    arguments=[
        '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',
        '/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
        # Don't bridge camera if not using
    ]
)
```

**2. Use topic remapping**:

```python
# Avoid bridging to different topic names
Node(
    package='ros_gz_bridge',
    executable='parameter_bridge',
    arguments=[
        '/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',  # Same name both sides
    ],
    remappings=[
        ('/scan', '/robot/scan')  # Remap after bridging
    ]
)
```

**3. Profile bridge latency**:

```bash
# Terminal 1: Start bridge with profiling
ROS_DISABLE_LOANED_MESSAGES=0 ros2 run ros_gz_bridge parameter_bridge ...

# Terminal 2: Measure latency
ros2 topic echo /scan --field header.stamp
```

**4. Headless mode** for CI/CD:

```bash
# No GUI, faster
gz sim -r -s world.world
```

### Key Takeaways (Advanced)

✅ **Custom plugins** enable direct ROS 2 integration
✅ **Zero-copy** reduces latency for large messages
✅ **Multi-robot** requires namespacing and per-robot bridges
✅ **Docker** ensures consistent deployment
✅ **Performance** optimized by selective bridging

---

## Additional Resources

- [ros_gz Documentation](https://github.com/gazebosim/ros_gz)
- [ros2_control Documentation](https://control.ros.org/)
- [gazebo_ros2_control](https://github.com/ros-controls/gazebo_ros2_control)
- [DDS Tuning](https://docs.ros.org/en/humble/How-To-Guides/DDS-tuning.html)

---

**Next:** [Lab: Gazebo Navigation →](./08-lab-gazebo-nav.md)
