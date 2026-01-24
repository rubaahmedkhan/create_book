---
sidebar_position: 13
---

# Nav2 Setup and Configuration

## Overview

Configure ROS 2 Navigation Stack (Nav2) in Isaac Sim for autonomous navigation, path planning, and obstacle avoidance.

## Learning Objectives

- Install and configure Nav2
- Integrate Nav2 with Isaac Sim robots
- Configure costmaps and planners
- Implement autonomous navigation goals
- Debug navigation issues

## Prerequisites

- Completed Week 9 (Isaac ROS integration)
- Nav2 installed (`ros-humble-navigation2`)
- Understanding of navigation concepts

## Nav2 Architecture

```
Nav2 Stack:
┌────────────────────────────────────┐
│  Behavior Trees (BT Navigator)     │
├────────────────────────────────────┤
│  Global Planner (NavFn, SmacPlanner)
│  Local Planner (DWB, TEB, MPPI)   │
├────────────────────────────────────┤
│  Costmap 2D (Global + Local)       │
├────────────────────────────────────┤
│  Map Server, AMCL, Lifecycle Mgr   │
└────────────────────────────────────┘
```

## Installation

```bash
# Install Nav2
sudo apt install ros-humble-navigation2 ros-humble-nav2-bringup

# Install SLAM Toolbox (for mapping)
sudo apt install ros-humble-slam-toolbox

# Verify
ros2 pkg list | grep navigation2
```

## Configure Robot for Nav2

### Robot URDF with Sensors

Ensure robot URDF includes:
- Base footprint
- Lidar sensor
- Odometry
- TF transforms

### Create Nav2 Parameters

```yaml
# nav2_params.yaml
bt_navigator:
  ros__parameters:
    use_sim_time: True
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    bt_loop_duration: 10
    default_server_timeout: 20

controller_server:
  ros__parameters:
    use_sim_time: True
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
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
      robot_radius: 0.22
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

global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 1.0
      publish_frequency: 1.0
      global_frame: map
      robot_base_frame: base_link
      use_sim_time: True
      robot_radius: 0.22
      resolution: 0.05
      track_unknown_space: true
      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]

      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: True

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

      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55

planner_server:
  ros__parameters:
    use_sim_time: True
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.5
      use_astar: false
      allow_unknown: true

behavior_server:
  ros__parameters:
    costmap_topic: local_costmap/costmap_raw
    footprint_topic: local_costmap/published_footprint
    cycle_frequency: 10.0
    behavior_plugins: ["spin", "backup", "wait"]
    spin:
      plugin: "nav2_behaviors/Spin"
    backup:
      plugin: "nav2_behaviors/BackUp"
    wait:
      plugin: "nav2_behaviors/Wait"
```

## Isaac Sim Navigation Bridge

```python
# nav2_isaac_sim_bridge.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.wheeled_robots.robots import WheeledRobot
from omni.isaac.core.utils.types import ArticulationAction
from omni.isaac.core.utils.extensions import enable_extension
import numpy as np

enable_extension("omni.isaac.ros2_bridge")

import rclpy
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
from sensor_msgs.msg import LaserScan
from tf2_ros import TransformBroadcaster
from geometry_msgs.msg import TransformStamped

class Nav2Bridge:
    def __init__(self, robot):
        self.robot = robot
        self.node = rclpy.create_node('nav2_bridge')

        # Publishers
        self.odom_pub = self.node.create_publisher(Odometry, '/odom', 10)
        self.scan_pub = self.node.create_publisher(LaserScan, '/scan', 10)

        # Subscribers
        self.cmd_vel_sub = self.node.create_subscription(
            Twist, '/cmd_vel', self.cmd_vel_callback, 10
        )

        # TF broadcaster
        self.tf_broadcaster = TransformBroadcaster(self.node)

        self.linear_vel = 0.0
        self.angular_vel = 0.0

    def cmd_vel_callback(self, msg):
        self.linear_vel = msg.linear.x
        self.angular_vel = msg.angular.z

    def publish_odometry(self):
        pos, quat = self.robot.get_world_pose()

        odom = Odometry()
        odom.header.stamp = self.node.get_clock().now().to_msg()
        odom.header.frame_id = "odom"
        odom.child_frame_id = "base_link"

        odom.pose.pose.position.x = float(pos[0])
        odom.pose.pose.position.y = float(pos[1])
        odom.pose.pose.position.z = float(pos[2])

        odom.pose.pose.orientation.w = float(quat[0])
        odom.pose.pose.orientation.x = float(quat[1])
        odom.pose.pose.orientation.y = float(quat[2])
        odom.pose.pose.orientation.z = float(quat[3])

        self.odom_pub.publish(odom)

    def publish_tf(self):
        pos, quat = self.robot.get_world_pose()

        t = TransformStamped()
        t.header.stamp = self.node.get_clock().now().to_msg()
        t.header.frame_id = "odom"
        t.child_frame_id = "base_link"

        t.transform.translation.x = float(pos[0])
        t.transform.translation.y = float(pos[1])
        t.transform.translation.z = float(pos[2])

        t.transform.rotation.w = float(quat[0])
        t.transform.rotation.x = float(quat[1])
        t.transform.rotation.y = float(quat[2])
        t.transform.rotation.z = float(quat[3])

        self.tf_broadcaster.sendTransform(t)

    def get_wheel_velocities(self):
        wheel_radius = 0.1
        wheel_sep = 0.4

        left = (self.linear_vel - self.angular_vel * wheel_sep / 2) / wheel_radius
        right = (self.linear_vel + self.angular_vel * wheel_sep / 2) / wheel_radius

        return np.array([left, right])

# Setup
rclpy.init()
world = World()
world.scene.add_default_ground_plane()

carter = world.scene.add(
    WheeledRobot(
        prim_path="/World/Carter",
        name="carter",
        wheel_dof_names=["joint_wheel_left", "joint_wheel_right"],
        create_robot=True,
        usd_path="/Isaac/Robots/Carter/carter_v1.usd"
    )
)

bridge = Nav2Bridge(carter)

world.reset()

print("✓ Nav2 bridge running")
print("  Publishing: /odom, /scan, TF")
print("  Subscribing: /cmd_vel")

for i in range(5000):
    rclpy.spin_once(bridge.node, timeout_sec=0)

    # Apply velocities
    wheel_vels = bridge.get_wheel_velocities()
    carter.apply_action(ArticulationAction(joint_velocities=wheel_vels))

    # Publish odometry and TF
    if i % 5 == 0:
        bridge.publish_odometry()
        bridge.publish_tf()

    world.step(render=True)

bridge.node.destroy_node()
rclpy.shutdown()
simulation_app.close()
```

## Launch Nav2

```bash
# Terminal 1: Run Isaac Sim bridge
cd isaac_sim_path
./python.sh nav2_isaac_sim_bridge.py

# Terminal 2: Launch Nav2
ros2 launch nav2_bringup navigation_launch.py \
    use_sim_time:=True \
    params_file:=nav2_params.yaml

# Terminal 3: Set initial pose and navigation goal
ros2 topic pub --once /initialpose geometry_msgs/PoseWithCovarianceStamped ...
ros2 topic pub /goal_pose geometry_msgs/PoseStamped ...
```

## Summary

- ✓ Installed and configured Nav2
- ✓ Created Nav2 parameter file
- ✓ Integrated Isaac Sim with Nav2
- ✓ Published odometry and TF
- ✓ Enabled autonomous navigation

## Next Steps

Continue to [Path Planning for Humanoid Robots](./14-path-planning.md).

## Additional Resources

- [Nav2 Documentation](https://navigation.ros.org/)
- [Nav2 Configuration Guide](https://navigation.ros.org/configuration/index.html)
