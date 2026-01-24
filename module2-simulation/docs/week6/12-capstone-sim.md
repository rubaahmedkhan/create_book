---
sidebar_position: 12
---

# Capstone: Simulation Environment

**Final Project**: Complete Simulation Environment

---

## Project Overview

Build a **complete simulation environment** integrating all Module 2 concepts:
- ✅ Custom robot model (URDF with sensors)
- ✅ Gazebo or Unity simulation world
- ✅ Multiple sensors (camera, LiDAR, IMU, depth)
- ✅ Autonomous navigation capabilities
- ✅ ROS 2 integration
- ✅ Optional: Multi-robot or advanced features

**Duration**: 10-20 hours depending on level

---

## 🟢 Beginner Level

**Goal**: Basic warehouse navigation simulation

### Requirements

**Functional**:
1. Robot spawns in warehouse environment
2. Sensors: Camera, 2D LiDAR, IMU, odometry
3. Teleoperation control
4. Sensor data visualization in RViz2
5. Basic obstacle avoidance (manual or simple reactive)

**Technical**:
- URDF robot model with proper inertia
- Gazebo world with obstacles
- ROS 2 topic bridging
- Launch files for complete system

### Deliverables

- [ ] Complete URDF robot description
- [ ] Gazebo world file (warehouse, 20x20m)
- [ ] All sensors publishing to ROS 2
- [ ] Launch file starts entire system
- [ ] RViz2 configuration file
- [ ] README with instructions
- [ ] 3-minute demo video

### Step-by-Step Guide

**Step 1: Create Robot Model**

Use robot from Week 4 Lab or create new:

**my_warehouse_robot/urdf/robot.urdf.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="warehouse_robot">

  <!-- Include files -->
  <xacro:include filename="$(find my_warehouse_robot)/urdf/properties.xacro"/>
  <xacro:include filename="$(find my_warehouse_robot)/urdf/macros.xacro"/>
  <xacro:include filename="$(find my_warehouse_robot)/urdf/base.xacro"/>
  <xacro:include filename="$(find my_warehouse_robot)/urdf/sensors.xacro"/>
  <xacro:include filename="$(find my_warehouse_robot)/urdf/gazebo.xacro"/>

</robot>
```

**Step 2: Create Warehouse World**

**worlds/warehouse.world**:

```xml
<?xml version="1.0"?>
<sdf version="1.8">
  <world name="warehouse">
    <!-- Physics, lighting, ground (from Week 5 examples) -->

    <!-- Storage racks -->
    <include>
      <uri>model://storage_rack</uri>
      <pose>5 5 0 0 0 0</pose>
    </include>

    <!-- Obstacles -->
    <!-- Add boxes, cylinders, etc. -->

    <!-- Walls -->
    <!-- Create perimeter walls -->
  </world>
</sdf>
```

**Step 3: Create Launch System**

**launch/warehouse_sim.launch.py**:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import ExecuteProcess, TimerAction
from launch.substitutions import Command
from launch_ros.actions import Node

def generate_launch_description():
    pkg_share = get_package_share_directory('my_warehouse_robot')

    urdf_file = os.path.join(pkg_share, 'urdf', 'robot.urdf.xacro')
    world_file = os.path.join(pkg_share, 'worlds', 'warehouse.world')
    rviz_config = os.path.join(pkg_share, 'rviz', 'warehouse.rviz')

    robot_description = Command(['xacro ', urdf_file])

    return LaunchDescription([
        # Gazebo
        ExecuteProcess(
            cmd=['gz', 'sim', '-r', world_file],
            output='screen'
        ),

        # Robot State Publisher
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{
                'robot_description': robot_description,
                'use_sim_time': True
            }]
        ),

        # Spawn Robot
        TimerAction(
            period=3.0,
            actions=[
                Node(
                    package='ros_gz_sim',
                    executable='create',
                    arguments=[
                        '-name', 'warehouse_robot',
                        '-topic', 'robot_description',
                        '-x', '0', '-y', '0', '-z', '0.2'
                    ]
                )
            ]
        ),

        # Bridge
        Node(
            package='ros_gz_bridge',
            executable='parameter_bridge',
            arguments=[
                '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',
                '/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
                '/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
                '/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',
                '/camera/image_raw@sensor_msgs/msg/Image[gz.msgs.Image',
                '/imu@sensor_msgs/msg/Imu[gz.msgs.IMU',
            ],
            parameters=[{'use_sim_time': True}]
        ),

        # RViz2
        Node(
            package='rviz2',
            executable='rviz2',
            arguments=['-d', rviz_config],
            parameters=[{'use_sim_time': True}]
        ),
    ])
```

**Step 4: Test and Document**

```bash
# Build
colcon build --packages-select my_warehouse_robot
source install/setup.bash

# Launch
ros2 launch my_warehouse_robot warehouse_sim.launch.py

# Teleoperate
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

**README.md**:

```markdown
# Warehouse Robot Simulation

## Overview
Differential drive robot for warehouse navigation.

## Dependencies
- ROS 2 Humble
- Gazebo Fortress
- ros_gz packages

## Build
```bash
cd ~/ros2_ws
colcon build --packages-select my_warehouse_robot
source install/setup.bash
```

## Run
```bash
ros2 launch my_warehouse_robot warehouse_sim.launch.py
```

## Controls
Use `teleop_twist_keyboard`:
- i: forward
- k: stop
- j: turn left
- l: turn right

## Sensors
- Camera: `/camera/image_raw`
- LiDAR: `/scan`
- IMU: `/imu`
- Odometry: `/odom`
```

### Evaluation Rubric (Beginner)

| Criterion | Points | Description |
|-----------|--------|-------------|
| **Robot Model** | 15 | Complete URDF, proper inertia, sensors |
| **World Design** | 15 | Warehouse layout, obstacles |
| **Sensor Integration** | 20 | All sensors working, publishing correctly |
| **ROS 2 Integration** | 15 | Topics, launch files |
| **Visualization** | 10 | RViz2 config, all sensors visible |
| **Documentation** | 15 | README, build/run instructions |
| **Demo Video** | 10 | Shows all features |
| **Total** | **100** | |

---

## 🟡 Intermediate Level

**Goal**: Multi-floor building with autonomous navigation

### Additional Requirements

1. **Multi-floor layout**: 2-3 floors with elevator/ramp
2. **SLAM**: Build map of environment
3. **Autonomous navigation**: Nav2 integration
4. **Dynamic obstacles**: Moving objects
5. **Advanced sensors**: Depth camera, 3D LiDAR (optional)

### Architecture

```
Simulation (Gazebo/Unity)
    ↕
ROS 2 Bridge
    ↕
SLAM Toolbox (Mapping)
    ↕
Nav2 (Path Planning & Control)
    ↕
Behavior Tree (High-level logic)
```

### Additional Components

**1. Multi-floor world**:

```xml
<world name="multi_floor_building">
  <!-- Ground floor -->
  <model name="floor_1">
    <!-- Rooms, corridors -->
  </model>

  <!-- Ramp to floor 2 -->
  <model name="ramp">
    <pose>10 0 0 0 0.2 0</pose>  <!-- 0.2 rad = ~11.5° incline -->
    <static>true</static>
    <link name="link">
      <collision name="collision">
        <geometry>
          <box><size>5 2 0.1</size></box>
        </geometry>
      </collision>
    </link>
  </model>

  <!-- Floor 2 -->
  <model name="floor_2">
    <pose>0 0 3 0 0 0</pose>  <!-- 3m higher -->
    <!-- Rooms -->
  </model>
</world>
```

**2. SLAM integration**:

```bash
# Launch SLAM
ros2 launch slam_toolbox online_async_launch.py

# Build map by teleoperating
ros2 run teleop_twist_keyboard teleop_twist_keyboard

# Save map
ros2 run nav2_map_server map_saver_cli -f ~/maps/building_map
```

**3. Nav2 configuration** (see Week 5 Lab for params).

**4. Dynamic obstacles**:

```xml
<!-- Moving obstacle (in world) -->
<model name="moving_box">
  <pose>5 5 0.5 0 0 0</pose>

  <link name="link">
    <inertial>
      <mass>10.0</mass>
      <inertia><ixx>0.83</ixx><iyy>0.83</iyy><izz>0.83</izz></inertia>
    </inertial>
    <collision name="collision">
      <geometry><box><size>1 1 1</size></box></geometry>
    </collision>
    <visual name="visual">
      <geometry><box><size>1 1 1</size></box></geometry>
      <material><ambient>0.8 0.3 0.1 1</ambient></material>
    </visual>
  </link>

  <!-- Plugin to move obstacle -->
  <plugin name="box_mover" filename="libmoving_obstacle_plugin.so">
    <velocity>0.5</velocity>  <!-- m/s -->
    <path>
      <waypoint>5 5 0.5</waypoint>
      <waypoint>-5 5 0.5</waypoint>
      <waypoint>-5 -5 0.5</waypoint>
      <waypoint>5 -5 0.5</waypoint>
    </path>
  </plugin>
</model>
```

### Evaluation Rubric (Intermediate)

| Criterion | Points | Description |
|-----------|--------|-------------|
| All Beginner criteria | 50 | Must pass all beginner requirements |
| **Multi-floor Design** | 10 | 2+ floors, ramps/elevators |
| **SLAM** | 15 | Successfully builds map |
| **Autonomous Navigation** | 15 | Nav2 integration, reaches goals |
| **Dynamic Obstacles** | 10 | Moving objects, avoidance |
| **Total** | **100** | |

---

## 🔴 Advanced Level

**Goal**: Multi-robot warehouse coordination system

### Additional Requirements

1. **Multiple robots**: 3+ robots coordinating
2. **Task allocation**: Assign tasks to robots
3. **Collision avoidance**: Inter-robot avoidance
4. **Unity simulation**: High-fidelity graphics
5. **ML component**: Trained policy for one task

### Multi-Robot Architecture

```
Central Task Manager
    ↕
Robot 1 ←→ Robot 2 ←→ Robot 3
    ↕          ↕          ↕
Nav2       Nav2       Nav2
    ↕          ↕          ↕
Gazebo/Unity Simulation
```

### Task Manager Node

**scripts/task_manager.py**:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped
from nav2_msgs.action import NavigateToPose
from rclpy.action import ActionClient

class TaskManager(Node):
    def __init__(self):
        super().__init__('task_manager')

        self.robots = ['robot1', 'robot2', 'robot3']
        self.action_clients = {}

        for robot in self.robots:
            client = ActionClient(
                self,
                NavigateToPose,
                f'/{robot}/navigate_to_pose'
            )
            self.action_clients[robot] = client

        # Task queue
        self.tasks = [
            {'robot': 'robot1', 'goal': [5.0, 5.0, 0.0]},
            {'robot': 'robot2', 'goal': [-5.0, 5.0, 0.0]},
            {'robot': 'robot3', 'goal': [0.0, -5.0, 0.0]},
        ]

        self.assign_tasks()

    def assign_tasks(self):
        for task in self.tasks:
            self.send_goal(task['robot'], task['goal'])

    def send_goal(self, robot, position):
        goal_msg = NavigateToPose.Goal()
        goal_msg.pose.header.frame_id = 'map'
        goal_msg.pose.pose.position.x = position[0]
        goal_msg.pose.pose.position.y = position[1]
        goal_msg.pose.pose.orientation.w = 1.0

        client = self.action_clients[robot]
        client.wait_for_server()

        self.get_logger().info(f'Sending goal to {robot}: {position}')
        client.send_goal_async(goal_msg)

def main():
    rclpy.init()
    manager = TaskManager()
    rclpy.spin(manager)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Unity Simulation

**Setup**:
1. Import robots to Unity (URDF Importer)
2. Create warehouse environment
3. Add ROS-TCP-Connector
4. Publish sensors to ROS 2

**See Week 6 tutorials for complete Unity setup**.

### ML Component (RL for Obstacle Avoidance)

**Unity ML-Agents training**:

```python
# config/robot_rl_config.yaml
behaviors:
  RobotNavigation:
    trainer_type: ppo
    hyperparameters:
      batch_size: 1024
      buffer_size: 10240
      learning_rate: 0.0003
      beta: 0.005
      epsilon: 0.2
      lambd: 0.95
      num_epoch: 3
    network_settings:
      normalize: false
      hidden_units: 128
      num_layers: 2
    reward_signals:
      extrinsic:
        gamma: 0.99
        strength: 1.0
    max_steps: 500000
    time_horizon: 64
    summary_freq: 10000
```

**Train**:

```bash
mlagents-learn config/robot_rl_config.yaml --run-id=warehouse_nav

# Press Play in Unity
```

### Production Deployment

**Docker Compose** (full system):

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  gazebo:
    image: osrf/ros:humble-desktop
    command: ros2 launch my_warehouse_robot warehouse_sim.launch.py
    volumes:
      - ./ros2_ws:/root/ros2_ws
    environment:
      - DISPLAY=$DISPLAY
    network_mode: host

  nav2_robot1:
    image: osrf/ros:humble-desktop
    command: ros2 launch nav2_bringup navigation_launch.py namespace:=robot1
    depends_on:
      - gazebo
    network_mode: host

  nav2_robot2:
    image: osrf/ros:humble-desktop
    command: ros2 launch nav2_bringup navigation_launch.py namespace:=robot2
    depends_on:
      - gazebo
    network_mode: host

  nav2_robot3:
    image: osrf/ros:humble-desktop
    command: ros2 launch nav2_bringup navigation_launch.py namespace:=robot3
    depends_on:
      - gazebo
    network_mode: host

  task_manager:
    image: osrf/ros:humble-desktop
    command: ros2 run my_warehouse_robot task_manager
    depends_on:
      - nav2_robot1
      - nav2_robot2
      - nav2_robot3
    network_mode: host
```

**Run**:

```bash
docker-compose up
```

### Evaluation Rubric (Advanced)

| Criterion | Points | Description |
|-----------|--------|-------------|
| All Intermediate criteria | 40 | Must pass all intermediate requirements |
| **Multi-robot Coordination** | 15 | 3+ robots, task allocation |
| **Collision Avoidance** | 10 | Inter-robot avoidance works |
| **Unity Simulation** | 10 | High-fidelity environment |
| **ML Component** | 10 | Trained policy deployed |
| **Production Ready** | 10 | Docker, CI/CD, documentation |
| **Innovation** | 5 | Novel features, creativity |
| **Total** | **100** | |

---

## Submission Guidelines

**Package your project**:

```bash
cd ~/ros2_ws/src
tar -czf warehouse_simulation.tar.gz my_warehouse_robot/
```

**Required files**:
1. **Source code**:
   - URDF files
   - World files
   - Launch files
   - ROS 2 nodes (Python/C++)
   - Configuration files

2. **Documentation**:
   - **README.md**: Overview, dependencies, build/run instructions
   - **ARCHITECTURE.md**: System design, component diagram
   - **SENSORS.md**: Sensor specifications, topics
   - **Known issues**: Limitations, future work

3. **Media**:
   - **Demo video** (3-10 minutes):
     - Show simulation launch
     - Demonstrate all sensors
     - Show navigation/task execution
     - Explain key features
   - **Screenshots**: RViz2, Gazebo/Unity, architecture diagram

4. **Testing**:
   - **Test results**: Unit tests, integration tests
   - **Performance metrics**: Real-time factor, latency, success rate

**Submission checklist**:
- [ ] All code compiles without errors
- [ ] Launch file starts complete system
- [ ] All sensors publishing data
- [ ] Navigation/task execution works
- [ ] README with clear instructions
- [ ] Demo video uploaded (YouTube/Vimeo)
- [ ] No hardcoded paths (use ROS 2 package paths)

---

## Congratulations! 🎉

You've completed **Module 2: Gazebo & Unity Simulation**!

You now have expertise in:
- ✅ URDF robot modeling
- ✅ Gazebo simulation and physics
- ✅ Unity for high-fidelity robotics
- ✅ ROS 2 integration with simulators
- ✅ Autonomous navigation systems
- ✅ Multi-robot coordination
- ✅ Production deployment

**Next:** [Module 3: NVIDIA Isaac →](../../module3-isaac/docs/intro.md)

---

## Additional Resources

- [Nav2 Documentation](https://navigation.ros.org/)
- [Gazebo Tutorials](https://gazebosim.org/docs)
- [Unity Robotics Hub](https://github.com/Unity-Technologies/Unity-Robotics-Hub)
- [ROS 2 Humble Docs](https://docs.ros.org/en/humble/)
- [SLAM Toolbox](https://github.com/SteveMacenski/slam_toolbox)
