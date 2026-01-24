---
sidebar_position: 8
---

# Lab: Gazebo Navigation

**Hands-On Project**: Autonomous Navigation in Gazebo

---

## 🟢 Beginner Level

**Duration**: 3-4 hours
**Goal**: Spawn robot in Gazebo, teleoperate, visualize sensors

### Project Overview

Build a **complete simulation environment** with:
- Robot spawned in Gazebo world
- Sensor data (LiDAR, camera, IMU)
- Teleoperation control
- RViz2 visualization
- Basic obstacle avoidance (optional)

### Prerequisites

```bash
# Install required packages
sudo apt update
sudo apt install ros-humble-navigation2 \
  ros-humble-nav2-bringup \
  ros-humble-slam-toolbox \
  ros-humble-teleop-twist-keyboard \
  ros-humble-ros-gz
```

### Step 1: Create Gazebo World

**worlds/warehouse.world**:

```xml
<?xml version="1.0"?>
<sdf version="1.8">
  <world name="warehouse">

    <!-- Physics -->
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
      <specular>0.2 0.2 0.2 1</specular>
      <direction>-0.5 0.1 -0.9</direction>
    </light>

    <!-- Ground plane -->
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
            <ambient>0.8 0.8 0.8 1</ambient>
            <diffuse>0.8 0.8 0.8 1</diffuse>
          </material>
        </visual>
      </link>
    </model>

    <!-- Walls -->
    <model name="wall_north">
      <pose>0 10 1.5 0 0 0</pose>
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>20 0.2 3</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>20 0.2 3</size></box></geometry>
          <material><ambient>0.7 0.7 0.7 1</ambient></material>
        </visual>
      </link>
    </model>

    <model name="wall_south">
      <pose>0 -10 1.5 0 0 0</pose>
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>20 0.2 3</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>20 0.2 3</size></box></geometry>
          <material><ambient>0.7 0.7 0.7 1</ambient></material>
        </visual>
      </link>
    </model>

    <model name="wall_east">
      <pose>10 0 1.5 0 0 0</pose>
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>0.2 20 3</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>0.2 20 3</size></box></geometry>
          <material><ambient>0.7 0.7 0.7 1</ambient></material>
        </visual>
      </link>
    </model>

    <model name="wall_west">
      <pose>-10 0 1.5 0 0 0</pose>
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>0.2 20 3</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>0.2 20 3</size></box></geometry>
          <material><ambient>0.7 0.7 0.7 1</ambient></material>
        </visual>
      </link>
    </model>

    <!-- Obstacles -->
    <model name="box1">
      <pose>3 3 0.5 0 0 0</pose>
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
    </model>

    <model name="box2">
      <pose>-3 -3 0.5 0 0 0</pose>
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
    </model>

    <model name="cylinder1">
      <pose>-5 5 0.5 0 0 0</pose>
      <link name="link">
        <inertial>
          <mass>5.0</mass>
          <inertia><ixx>0.26</ixx><iyy>0.26</iyy><izz>0.5</izz></inertia>
        </inertial>
        <collision name="collision">
          <geometry><cylinder><radius>0.5</radius><length>1</length></cylinder></geometry>
        </collision>
        <visual name="visual">
          <geometry><cylinder><radius>0.5</radius><length>1</length></cylinder></geometry>
          <material><ambient>0.2 0.6 0.8 1</ambient></material>
        </visual>
      </link>
    </model>

  </world>
</sdf>
```

### Step 2: Complete Launch File

**launch/gazebo_navigation.launch.py**:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import ExecuteProcess, TimerAction
from launch.substitutions import Command
from launch_ros.actions import Node

def generate_launch_description():
    pkg_share = get_package_share_directory('my_robot_pkg')
    urdf_file = os.path.join(pkg_share, 'urdf', 'robot.urdf.xacro')
    world_file = os.path.join(pkg_share, 'worlds', 'warehouse.world')
    rviz_config = os.path.join(pkg_share, 'rviz', 'navigation.rviz')

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

        # Spawn Robot (delayed to ensure Gazebo is ready)
        TimerAction(
            period=3.0,
            actions=[
                Node(
                    package='ros_gz_sim',
                    executable='create',
                    name='spawn_robot',
                    arguments=[
                        '-name', 'my_robot',
                        '-topic', 'robot_description',
                        '-x', '0',
                        '-y', '0',
                        '-z', '0.2'
                    ],
                    output='screen'
                )
            ]
        ),

        # ROS-Gazebo Bridge
        Node(
            package='ros_gz_bridge',
            executable='parameter_bridge',
            name='ros_gz_bridge',
            arguments=[
                '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',
                '/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
                '/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
                '/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',
                '/camera/image_raw@sensor_msgs/msg/Image[gz.msgs.Image',
                '/camera/camera_info@sensor_msgs/msg/CameraInfo[gz.msgs.CameraInfo',
                '/imu@sensor_msgs/msg/Imu[gz.msgs.IMU',
            ],
            parameters=[{'use_sim_time': True}],
            output='screen'
        ),

        # RViz2
        Node(
            package='rviz2',
            executable='rviz2',
            name='rviz2',
            arguments=['-d', rviz_config],
            parameters=[{'use_sim_time': True}],
            output='screen'
        ),
    ])
```

### Step 3: Create RViz Configuration

**rviz/navigation.rviz**:

```yaml
Panels:
  - Class: rviz_common/Displays
    Name: Displays
  - Class: rviz_common/Views
    Name: Views

Visualization Manager:
  Displays:
    - Class: rviz_default_plugins/Grid
      Name: Grid
      Reference Frame: odom

    - Class: rviz_default_plugins/RobotModel
      Name: RobotModel
      Robot Description: robot_description

    - Class: rviz_default_plugins/TF
      Name: TF
      Show Names: true

    - Class: rviz_default_plugins/LaserScan
      Name: LaserScan
      Topic: /scan
      Size (m): 0.05
      Color: 255; 0; 0

    - Class: rviz_default_plugins/Camera
      Name: Camera
      Topic: /camera/image_raw

    - Class: rviz_default_plugins/Odometry
      Name: Odometry
      Topic: /odom
      Shape: Arrow

  Global Options:
    Fixed Frame: odom

  Views:
    Current:
      Class: rviz_default_plugins/Orbit
      Distance: 10.0
      Focal Point:
        X: 0
        Y: 0
        Z: 0
```

### Step 4: Build and Launch

```bash
# Build package
cd ~/ros2_ws
colcon build --packages-select my_robot_pkg --symlink-install
source install/setup.bash

# Launch simulation
ros2 launch my_robot_pkg gazebo_navigation.launch.py
```

**What you should see**:
- Gazebo window with warehouse world and robot
- RViz2 window with robot model, LiDAR scan, camera image

### Step 5: Teleoperation

**Terminal 2**:

```bash
source ~/ros2_ws/install/setup.bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard

# Control robot:
# i = forward
# k = stop
# j = turn left
# l = turn right
```

**Drive around** and observe:
- LiDAR detects walls and obstacles
- Camera shows environment
- Odometry tracks position

### Verification Checklist (Beginner)

- [ ] Gazebo launches with warehouse world
- [ ] Robot spawns at origin
- [ ] RViz2 shows robot model
- [ ] LiDAR scan visible in RViz2
- [ ] Camera image displays
- [ ] Teleop controls robot
- [ ] No collision with walls (manual driving)

---

## 🟡 Intermediate Level

**Duration**: 4-5 hours
**Goal**: Implement SLAM and autonomous navigation

### Step 6: Add SLAM (Mapping)

**Install SLAM Toolbox**:

```bash
sudo apt install ros-humble-slam-toolbox
```

**config/mapper_params_online_async.yaml**:

```yaml
slam_toolbox:
  ros__parameters:
    # Plugin params
    solver_plugin: solver_plugins::CeresSolver
    ceres_linear_solver: SPARSE_NORMAL_CHOLESKY
    ceres_preconditioner: SCHUR_JACOBI
    ceres_trust_strategy: LEVENBERG_MARQUARDT
    ceres_dogleg_type: TRADITIONAL_DOGLEG
    ceres_loss_function: None

    # ROS Parameters
    odom_frame: odom
    map_frame: map
    base_frame: base_footprint
    scan_topic: /scan
    use_map_saver: true
    mode: mapping

    # Map params
    resolution: 0.05
    max_laser_range: 20.0
    minimum_time_interval: 0.5
    transform_publish_period: 0.02
    map_update_interval: 5.0

    # Correlation params
    correlation_search_space_dimension: 0.5
    correlation_search_space_resolution: 0.01
    correlation_search_space_smear_deviation: 0.1

    # Loop closure params
    loop_search_maximum_distance: 3.0
    do_loop_closing: true
    loop_match_minimum_chain_size: 10
    loop_match_maximum_variance_coarse: 3.0
    loop_match_minimum_response_coarse: 0.35

    # Scan matcher params
    distance_variance_penalty: 0.5
    angle_variance_penalty: 1.0
    fine_search_angle_offset: 0.00349
    coarse_search_angle_offset: 0.349
    coarse_angle_resolution: 0.0349
    minimum_angle_penalty: 0.9
    minimum_distance_penalty: 0.5
    use_response_expansion: true
```

**launch/slam.launch.py**:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node

def generate_launch_description():
    pkg_share = get_package_share_directory('my_robot_pkg')
    slam_params = os.path.join(pkg_share, 'config', 'mapper_params_online_async.yaml')

    # Include gazebo_navigation.launch.py
    gazebo_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            os.path.join(pkg_share, 'launch', 'gazebo_navigation.launch.py')
        ])
    )

    # SLAM Toolbox
    slam_node = Node(
        package='slam_toolbox',
        executable='async_slam_toolbox_node',
        name='slam_toolbox',
        output='screen',
        parameters=[slam_params, {'use_sim_time': True}]
    )

    return LaunchDescription([
        gazebo_launch,
        slam_node,
    ])
```

**Launch SLAM**:

```bash
ros2 launch my_robot_pkg slam.launch.py

# In another terminal, teleoperate to build map
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

**In RViz2**:
- Add → Map → Topic: `/map`
- Drive robot around warehouse
- Watch map build in real-time

**Save map**:

```bash
# Create maps directory
mkdir -p ~/ros2_ws/src/my_robot_pkg/maps

# Save map
ros2 run nav2_map_server map_saver_cli -f ~/ros2_ws/src/my_robot_pkg/maps/warehouse_map
```

**Result**: Two files created:
- `warehouse_map.pgm` (image)
- `warehouse_map.yaml` (metadata)

### Step 7: Autonomous Navigation (Nav2)

**config/nav2_params.yaml**:

```yaml
amcl:
  ros__parameters:
    use_sim_time: True
    alpha1: 0.2
    alpha2: 0.2
    alpha3: 0.2
    alpha4: 0.2
    alpha5: 0.2
    base_frame_id: "base_footprint"
    beam_skip_distance: 0.5
    beam_skip_error_threshold: 0.9
    beam_skip_threshold: 0.3
    do_beamskip: false
    global_frame_id: "map"
    lambda_short: 0.1
    laser_likelihood_max_dist: 2.0
    laser_max_range: 100.0
    laser_min_range: -1.0
    laser_model_type: "likelihood_field"
    max_beams: 60
    max_particles: 2000
    min_particles: 500
    odom_frame_id: "odom"
    pf_err: 0.05
    pf_z: 0.99
    recovery_alpha_fast: 0.0
    recovery_alpha_slow: 0.0
    resample_interval: 1
    robot_model_type: "nav2_amcl::DifferentialMotionModel"
    save_pose_rate: 0.5
    sigma_hit: 0.2
    tf_broadcast: true
    transform_tolerance: 1.0
    update_min_a: 0.2
    update_min_d: 0.25
    z_hit: 0.5
    z_max: 0.05
    z_rand: 0.5
    z_short: 0.05
    scan_topic: scan

bt_navigator:
  ros__parameters:
    use_sim_time: True
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    bt_loop_duration: 10
    default_server_timeout: 20
    enable_groot_monitoring: True
    groot_zmq_publisher_port: 1666
    groot_zmq_server_port: 1667
    plugin_lib_names:
    - nav2_compute_path_to_pose_action_bt_node
    - nav2_compute_path_through_poses_action_bt_node
    - nav2_smooth_path_action_bt_node
    - nav2_follow_path_action_bt_node
    - nav2_spin_action_bt_node
    - nav2_wait_action_bt_node
    - nav2_back_up_action_bt_node
    - nav2_drive_on_heading_bt_node
    - nav2_clear_costmap_service_bt_node
    - nav2_is_stuck_condition_bt_node
    - nav2_goal_reached_condition_bt_node
    - nav2_goal_updated_condition_bt_node
    - nav2_globally_updated_goal_condition_bt_node
    - nav2_is_path_valid_condition_bt_node
    - nav2_initial_pose_received_condition_bt_node
    - nav2_reinitialize_global_localization_service_bt_node
    - nav2_rate_controller_bt_node
    - nav2_distance_controller_bt_node
    - nav2_speed_controller_bt_node
    - nav2_truncate_path_action_bt_node
    - nav2_truncate_path_local_action_bt_node
    - nav2_goal_updater_node_bt_node
    - nav2_recovery_node_bt_node
    - nav2_pipeline_sequence_bt_node
    - nav2_round_robin_node_bt_node
    - nav2_transform_available_condition_bt_node
    - nav2_time_expired_condition_bt_node
    - nav2_path_expiring_timer_condition
    - nav2_distance_traveled_condition_bt_node
    - nav2_single_trigger_bt_node
    - nav2_is_battery_low_condition_bt_node
    - nav2_navigate_through_poses_action_bt_node
    - nav2_navigate_to_pose_action_bt_node
    - nav2_remove_passed_goals_action_bt_node
    - nav2_planner_selector_bt_node
    - nav2_controller_selector_bt_node
    - nav2_goal_checker_selector_bt_node
    - nav2_controller_cancel_bt_node
    - nav2_path_longer_on_approach_bt_node
    - nav2_wait_cancel_bt_node
    - nav2_spin_cancel_bt_node
    - nav2_back_up_cancel_bt_node
    - nav2_drive_on_heading_cancel_bt_node

controller_server:
  ros__parameters:
    use_sim_time: True
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
    failure_tolerance: 0.3
    progress_checker_plugin: "progress_checker"
    goal_checker_plugins: ["general_goal_checker"]
    controller_plugins: ["FollowPath"]

    progress_checker:
      plugin: "nav2_controller::SimpleProgressChecker"
      required_movement_radius: 0.5
      movement_time_allowance: 10.0

    general_goal_checker:
      stateful: True
      plugin: "nav2_controller::SimpleGoalChecker"
      xy_goal_tolerance: 0.25
      yaw_goal_tolerance: 0.25

    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      debug_trajectory_details: True
      min_vel_x: 0.0
      min_vel_y: 0.0
      max_vel_x: 0.5
      max_vel_y: 0.0
      max_vel_theta: 1.0
      min_speed_xy: 0.0
      max_speed_xy: 0.5
      min_speed_theta: 0.0
      acc_lim_x: 2.5
      acc_lim_y: 0.0
      acc_lim_theta: 3.2
      decel_lim_x: -2.5
      decel_lim_y: 0.0
      decel_lim_theta: -3.2
      vx_samples: 20
      vy_samples: 5
      vtheta_samples: 20
      sim_time: 1.7
      linear_granularity: 0.05
      angular_granularity: 0.025
      transform_tolerance: 0.2
      xy_goal_tolerance: 0.25
      trans_stopped_velocity: 0.25
      short_circuit_trajectory_evaluation: True
      stateful: True
      critics: ["RotateToGoal", "Oscillation", "BaseObstacle", "GoalAlign", "PathAlign", "PathDist", "GoalDist"]
      BaseObstacle.scale: 0.02
      PathAlign.scale: 32.0
      PathAlign.forward_point_distance: 0.1
      GoalAlign.scale: 24.0
      GoalAlign.forward_point_distance: 0.1
      PathDist.scale: 32.0
      GoalDist.scale: 24.0
      RotateToGoal.scale: 32.0
      RotateToGoal.slowing_factor: 5.0
      RotateToGoal.lookahead_time: -1.0

local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 5.0
      publish_frequency: 2.0
      global_frame: odom
      robot_base_frame: base_link
      use_sim_time: True
      rolling_window: true
      width: 3
      height: 3
      resolution: 0.05
      robot_radius: 0.3
      plugins: ["voxel_layer", "inflation_layer"]
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: True
        publish_voxel_map: True
        origin_z: 0.0
        z_resolution: 0.05
        z_voxels: 16
        max_obstacle_height: 2.0
        mark_threshold: 0
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0
      always_send_full_costmap: True

global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 1.0
      publish_frequency: 1.0
      global_frame: map
      robot_base_frame: base_link
      use_sim_time: True
      robot_radius: 0.3
      resolution: 0.05
      track_unknown_space: true
      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: True
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0
      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: True
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
      always_send_full_costmap: True

map_server:
  ros__parameters:
    use_sim_time: True
    yaml_filename: "warehouse_map.yaml"

planner_server:
  ros__parameters:
    expected_planner_frequency: 20.0
    use_sim_time: True
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.5
      use_astar: false
      allow_unknown: true

smoother_server:
  ros__parameters:
    use_sim_time: True
    smoother_plugins: ["simple_smoother"]
    simple_smoother:
      plugin: "nav2_smoother::SimpleSmoother"
      tolerance: 1.0e-10
      max_its: 1000
      do_refinement: True

behavior_server:
  ros__parameters:
    costmap_topic: local_costmap/costmap_raw
    footprint_topic: local_costmap/published_footprint
    cycle_frequency: 10.0
    behavior_plugins: ["spin", "backup", "drive_on_heading", "wait"]
    spin:
      plugin: "nav2_behaviors::Spin"
    backup:
      plugin: "nav2_behaviors::BackUp"
    drive_on_heading:
      plugin: "nav2_behaviors::DriveOnHeading"
    wait:
      plugin: "nav2_behaviors::Wait"
    global_frame: odom
    robot_base_frame: base_link
    transform_tolerance: 0.1
    use_sim_time: true
    simulate_ahead_time: 2.0
    max_rotational_vel: 1.0
    min_rotational_vel: 0.4
    rotational_acc_lim: 3.2

robot_state_publisher:
  ros__parameters:
    use_sim_time: True

waypoint_follower:
  ros__parameters:
    use_sim_time: True
    loop_rate: 20
    stop_on_failure: false
    waypoint_task_executor_plugin: "wait_at_waypoint"
    wait_at_waypoint:
      plugin: "nav2_waypoint_follower::WaitAtWaypoint"
      enabled: True
      waypoint_pause_duration: 200

velocity_smoother:
  ros__parameters:
    use_sim_time: True
    smoothing_frequency: 20.0
    scale_velocities: False
    feedback: "OPEN_LOOP"
    max_velocity: [0.5, 0.0, 1.0]
    min_velocity: [-0.5, 0.0, -1.0]
    max_accel: [2.5, 0.0, 3.2]
    max_decel: [-2.5, 0.0, -3.2]
    odom_topic: "odom"
    odom_duration: 0.1
    deadband_velocity: [0.0, 0.0, 0.0]
    velocity_timeout: 1.0
```

**launch/navigation.launch.py**:

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, DeclareLaunchArgument
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    pkg_share = get_package_share_directory('my_robot_pkg')
    nav2_bringup_dir = get_package_share_directory('nav2_bringup')

    map_file = os.path.join(pkg_share, 'maps', 'warehouse_map.yaml')
    nav2_params = os.path.join(pkg_share, 'config', 'nav2_params.yaml')

    # Include gazebo_navigation.launch.py
    gazebo_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            os.path.join(pkg_share, 'launch', 'gazebo_navigation.launch.py')
        ])
    )

    # Nav2 bringup
    nav2_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            os.path.join(nav2_bringup_dir, 'launch', 'bringup_launch.py')
        ]),
        launch_arguments={
            'map': map_file,
            'params_file': nav2_params,
            'use_sim_time': 'True'
        }.items()
    )

    return LaunchDescription([
        gazebo_launch,
        nav2_launch,
    ])
```

**Launch navigation**:

```bash
ros2 launch my_robot_pkg navigation.launch.py
```

**In RViz2**:
1. Click "2D Pose Estimate"
2. Click and drag on map to set initial pose
3. Click "Nav2 Goal"
4. Click on map to set goal
5. Robot navigates autonomously!

### Verification Checklist (Intermediate)

- [ ] SLAM builds map while teleoperating
- [ ] Map saved successfully
- [ ] Nav2 launches without errors
- [ ] AMCL localizes robot on map
- [ ] Global planner finds path
- [ ] Local planner avoids obstacles
- [ ] Robot reaches goal autonomously

---

## 🔴 Advanced Level

**Duration**: 6-8 hours
**Goal**: Multi-robot navigation, dynamic obstacles, full Nav2 stack

### Step 8: Multi-Robot Navigation

**launch/multi_robot_navigation.launch.py**:

```python
from launch import LaunchDescription
from launch.actions import GroupAction, ExecuteProcess
from launch_ros.actions import Node, PushRosNamespace
import os

def generate_launch_description():
    robots = [
        {'name': 'robot1', 'x': '-5', 'y': '-5', 'yaw': '0'},
        {'name': 'robot2', 'x': '5', 'y': '5', 'yaw': '3.14'},
    ]

    # Start Gazebo
    gazebo = ExecuteProcess(
        cmd=['gz', 'sim', '-r', 'warehouse.world'],
        output='screen'
    )

    robot_groups = []

    for robot in robots:
        robot_group = GroupAction([
            PushRosNamespace(robot['name']),

            # Spawn
            Node(
                package='ros_gz_sim',
                executable='create',
                arguments=['-name', robot['name'], '-file', 'robot.urdf',
                          '-x', robot['x'], '-y', robot['y'], '-z', '0.2'],
                output='screen'
            ),

            # Bridge
            Node(
                package='ros_gz_bridge',
                executable='parameter_bridge',
                arguments=[
                    f"/{robot['name']}/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist",
                    f"/{robot['name']}/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry",
                    f"/{robot['name']}/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan",
                ],
                parameters=[{'use_sim_time': True}]
            ),

            # Nav2 for this robot
            # ... (include Nav2 bringup with namespace)
        ])

        robot_groups.append(robot_group)

    return LaunchDescription([
        gazebo,
        *robot_groups
    ])
```

### Capstone Deliverables (Advanced)

**Required**:
1. Multi-robot coordination
2. Dynamic obstacle handling
3. Recovery behaviors
4. Full Nav2 stack
5. Docker deployment
6. Video demonstration

---

## Additional Resources

- [Nav2 Documentation](https://navigation.ros.org/)
- [SLAM Toolbox](https://github.com/SteveMacenski/slam_toolbox)
- [Nav2 Tutorials](https://navigation.ros.org/tutorials/)

---

**Next Module:** [Week 6: Unity & Advanced Simulation →](../week6/09-unity-intro.md)
