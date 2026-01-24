---
sidebar_position: 12
---

# Capstone: Autonomous Navigation System

**Final Project**: Integrate All Module 1 Concepts

---

## Project Overview

Build a **complete autonomous navigation system** that integrates:
- ✅ Topics (sensor data, velocity commands)
- ✅ Services (mode switching, reset)
- ✅ Actions (waypoint navigation)
- ✅ Parameters (tunable behavior)
- ✅ Packages (organized codebase)
- ✅ Launch files (system startup)
- ✅ Testing (validation)

**Platform**: Turtlesim (beginner/intermediate) or Gazebo simulation (advanced)

---

## 🟢 Beginner Level

**Duration**: 6-8 hours
**Goal**: Build basic autonomous navigation in turtlesim

### Requirements

**Functional:**
1. Three operation modes: Idle, Manual, Autonomous
2. Waypoint navigation (go to specific x, y coordinates)
3. Obstacle avoidance (turtlesim boundaries)
4. Emergency stop capability
5. Status reporting

**Technical:**
- One package with multiple nodes
- Custom messages/services/actions
- Launch file to start system
- Parameter file for configuration
- Basic unit tests

### Architecture

```
Navigation System
├── state_publisher_node      (publishes robot state)
├── controller_node            (executes navigation)
├── mode_manager_node          (handles mode switching)
└── safety_monitor_node        (emergency stop, boundaries)
```

### Step 1: Create Package Structure

```bash
cd ~/ros2_ws/src

# Create main package
ros2 pkg create autonomous_nav \
  --build-type ament_python \
  --dependencies rclpy geometry_msgs turtlesim

# Create interface package
ros2 pkg create autonomous_nav_interfaces \
  --build-type ament_cmake \
  --dependencies rosidl_default_generators geometry_msgs
```

### Step 2: Define Custom Interfaces

**autonomous_nav_interfaces/msg/RobotState.msg**:
```
string robot_name
string current_mode  # "idle", "manual", "autonomous"
geometry_msgs/Pose current_pose
float32 battery_level
bool emergency_stop_active
bool at_goal
```

**autonomous_nav_interfaces/srv/SetMode.srv**:
```
string mode
---
bool success
string message
string previous_mode
```

**autonomous_nav_interfaces/action/NavigateToWaypoint.action**:
```
# Goal
float32 target_x
float32 target_y
float32 max_speed
---
# Result
bool success
float32 final_distance
float32 total_time
string message
---
# Feedback
float32 distance_remaining
float32 current_speed
float32 progress_percentage
```

**Build interfaces:**
```bash
colcon build --packages-select autonomous_nav_interfaces
source install/setup.bash
```

### Step 3: Implement Controller Node

**autonomous_nav/controller_node.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rclpy.action import ActionServer, GoalResponse
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
from autonomous_nav_interfaces.msg import RobotState
from autonomous_nav_interfaces.srv import SetMode
from autonomous_nav_interfaces.action import NavigateToWaypoint
from enum import Enum
import math

class Mode(Enum):
    IDLE = 0
    MANUAL = 1
    AUTONOMOUS = 2

class ControllerNode(Node):
    def __init__(self):
        super().__init__('controller_node')

        # Parameters
        self.declare_parameter('max_speed', 2.0)
        self.declare_parameter('linear_gain', 1.5)
        self.declare_parameter('angular_gain', 4.0)
        self.declare_parameter('goal_tolerance', 0.2)

        # State
        self.mode = Mode.IDLE
        self.current_pose = None
        self.emergency_stop = False

        # Publishers
        self.cmd_pub = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.state_pub = self.create_publisher(RobotState, 'robot_state', 10)

        # Subscribers
        self.pose_sub = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10
        )

        # Services
        self.mode_service = self.create_service(
            SetMode, 'set_mode', self.set_mode_callback
        )

        # Actions
        self._action_server = ActionServer(
            self,
            NavigateToWaypoint,
            'navigate_to_waypoint',
            execute_callback=self.execute_navigation,
            goal_callback=self.goal_callback
        )

        # Timers
        self.create_timer(0.1, self.control_loop)
        self.create_timer(1.0, self.publish_state)

        self.get_logger().info('Controller Node started')

    def pose_callback(self, msg):
        self.current_pose = msg

    def control_loop(self):
        """Main control loop"""
        if self.mode == Mode.IDLE or self.emergency_stop:
            self.publish_velocity(0.0, 0.0)

    def publish_velocity(self, linear, angular):
        msg = Twist()
        msg.linear.x = linear
        msg.angular.z = angular
        self.cmd_pub.publish(msg)

    def publish_state(self):
        """Publish robot state"""
        msg = RobotState()
        msg.robot_name = 'turtle1'
        msg.current_mode = self.mode.name.lower()

        if self.current_pose:
            msg.current_pose.position.x = self.current_pose.x
            msg.current_pose.position.y = self.current_pose.y
            msg.current_pose.orientation.z = self.current_pose.theta

        msg.emergency_stop_active = self.emergency_stop
        msg.battery_level = 100.0

        self.state_pub.publish(msg)

    def set_mode_callback(self, request, response):
        """Handle mode change requests"""
        mode_str = request.mode.upper()

        if mode_str not in [m.name for m in Mode]:
            response.success = False
            response.message = f'Invalid mode: {request.mode}'
            return response

        old_mode = self.mode
        self.mode = Mode[mode_str]

        response.success = True
        response.previous_mode = old_mode.name.lower()
        response.message = f'Mode changed to {self.mode.name}'

        self.get_logger().info(response.message)

        return response

    def goal_callback(self, goal_request):
        """Accept or reject navigation goals"""
        if self.mode != Mode.AUTONOMOUS:
            self.get_logger().warn('Goal rejected: not in autonomous mode')
            return GoalResponse.REJECT

        self.get_logger().info('Goal accepted')
        return GoalResponse.ACCEPT

    def execute_navigation(self, goal_handle):
        """Execute waypoint navigation"""
        self.get_logger().info('Executing navigation...')

        goal = goal_handle.request
        target_x = goal.target_x
        target_y = goal.target_y
        max_speed = min(goal.max_speed, self.get_parameter('max_speed').value)

        feedback_msg = NavigateToWaypoint.Feedback()

        import time
        start_time = time.time()

        while rclpy.ok():
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                result = NavigateToWaypoint.Result()
                result.success = False
                result.message = 'Navigation canceled'
                return result

            if self.current_pose is None:
                time.sleep(0.1)
                continue

            # Calculate distance to goal
            dx = target_x - self.current_pose.x
            dy = target_y - self.current_pose.y
            distance = math.sqrt(dx**2 + dy**2)

            # Check if reached goal
            if distance < self.get_parameter('goal_tolerance').value:
                self.publish_velocity(0.0, 0.0)
                goal_handle.succeed()

                result = NavigateToWaypoint.Result()
                result.success = True
                result.final_distance = distance
                result.total_time = time.time() - start_time
                result.message = 'Waypoint reached'

                self.get_logger().info('Waypoint reached!')
                return result

            # Navigate to goal
            desired_theta = math.atan2(dy, dx)
            angular_error = desired_theta - self.current_pose.theta
            angular_error = math.atan2(math.sin(angular_error), math.cos(angular_error))

            # Control
            linear_gain = self.get_parameter('linear_gain').value
            angular_gain = self.get_parameter('angular_gain').value

            linear_vel = min(linear_gain * distance, max_speed)
            angular_vel = angular_gain * angular_error

            self.publish_velocity(linear_vel, angular_vel)

            # Publish feedback
            feedback_msg.distance_remaining = distance
            feedback_msg.current_speed = linear_vel
            feedback_msg.progress_percentage = 0.0  # TODO: calculate

            goal_handle.publish_feedback(feedback_msg)

            time.sleep(0.1)

def main(args=None):
    rclpy.init(args=args)
    node = ControllerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 4: Implement Safety Monitor

**autonomous_nav/safety_monitor_node.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from turtlesim.msg import Pose
from std_srvs.srv import Trigger

class SafetyMonitorNode(Node):
    def __init__(self):
        super().__init__('safety_monitor_node')

        # Parameters
        self.declare_parameter('boundary_min', 1.0)
        self.declare_parameter('boundary_max', 10.0)
        self.declare_parameter('boundary_threshold', 0.5)

        # Subscribers
        self.pose_sub = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10
        )

        # Services
        self.emergency_stop_service = self.create_service(
            Trigger, 'emergency_stop', self.emergency_stop_callback
        )

        self.current_pose = None
        self.emergency_stop_active = False

        self.create_timer(0.5, self.check_boundaries)

        self.get_logger().info('Safety Monitor started')

    def pose_callback(self, msg):
        self.current_pose = msg

    def check_boundaries(self):
        """Check if robot is near boundaries"""
        if self.current_pose is None:
            return

        boundary_min = self.get_parameter('boundary_min').value
        boundary_max = self.get_parameter('boundary_max').value
        threshold = self.get_parameter('boundary_threshold').value

        # Check boundaries
        if (self.current_pose.x < boundary_min + threshold or
            self.current_pose.x > boundary_max - threshold or
            self.current_pose.y < boundary_min + threshold or
            self.current_pose.y > boundary_max - threshold):

            self.get_logger().warn('Near boundary!', throttle_duration_sec=2.0)

    def emergency_stop_callback(self, request, response):
        """Trigger emergency stop"""
        self.emergency_stop_active = not self.emergency_stop_active

        response.success = True
        response.message = f'Emergency stop: {"ACTIVE" if self.emergency_stop_active else "INACTIVE"}'

        self.get_logger().warn(response.message)

        return response

def main(args=None):
    rclpy.init(args=args)
    node = SafetyMonitorNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 5: Create Launch File

**launch/navigation_system.launch.py**:
```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    # Config file
    config = os.path.join(
        get_package_share_directory('autonomous_nav'),
        'config',
        'nav_params.yaml'
    )

    return LaunchDescription([
        # Turtlesim
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='sim',
            output='screen'
        ),

        # Controller
        Node(
            package='autonomous_nav',
            executable='controller_node',
            name='controller',
            parameters=[config],
            output='screen'
        ),

        # Safety Monitor
        Node(
            package='autonomous_nav',
            executable='safety_monitor_node',
            name='safety',
            parameters=[config],
            output='screen'
        ),
    ])
```

### Step 6: Create Configuration File

**config/nav_params.yaml**:
```yaml
controller_node:
  ros__parameters:
    max_speed: 2.0
    linear_gain: 1.5
    angular_gain: 4.0
    goal_tolerance: 0.2

safety_monitor_node:
  ros__parameters:
    boundary_min: 1.0
    boundary_max: 10.0
    boundary_threshold: 0.5
```

### Step 7: Write Tests

**test/test_controller.py**:
```python
import pytest
import rclpy
from autonomous_nav.controller_node import ControllerNode

def test_controller_initialization():
    """Test controller initializes correctly"""
    rclpy.init()
    node = ControllerNode()
    assert node.get_name() == 'controller_node'
    node.destroy_node()
    rclpy.shutdown()
```

### Step 8: Build and Run

```bash
# Build
colcon build --packages-select autonomous_nav_interfaces autonomous_nav --symlink-install
source install/setup.bash

# Launch system
ros2 launch autonomous_nav navigation_system.launch.py

# In another terminal - send navigation goal
ros2 action send_goal /navigate_to_waypoint autonomous_nav_interfaces/action/NavigateToWaypoint "{target_x: 8.0, target_y: 8.0, max_speed: 1.5}" --feedback

# Switch modes
ros2 service call /set_mode autonomous_nav_interfaces/srv/SetMode "{mode: 'autonomous'}"

# Emergency stop
ros2 service call /emergency_stop std_srvs/srv/Trigger
```

### Deliverables (Beginner)

- [ ] Package compiles without errors
- [ ] Launch file starts all nodes
- [ ] Robot navigates to waypoints successfully
- [ ] Emergency stop works
- [ ] At least 3 unit tests pass

---

## 🟡 Intermediate Level

**Additional Requirements:**

1. **PID Control**: Implement tunable PID for smooth navigation
2. **Multi-Waypoint**: Navigate through sequence of waypoints
3. **Dynamic Reconfiguration**: Change parameters at runtime
4. **Diagnostics**: Publish system health information
5. **Visualization**: RViz integration for path visualization

---

## 🔴 Advanced Level

**Additional Requirements:**

1. **Gazebo Simulation**: Port to Gazebo with realistic robot model
2. **SLAM Integration**: Map building with SLAM
3. **Path Planning**: A* or RRT path planning
4. **Obstacle Avoidance**: Dynamic obstacle detection and avoidance
5. **Multi-Robot**: Coordinate multiple robots
6. **Production Deployment**: Docker containers, CI/CD pipeline

---

## Evaluation Rubric

| Criteria | Beginner (50pts) | Intermediate (75pts) | Advanced (100pts) |
|----------|------------------|----------------------|-------------------|
| **Architecture** | Basic nodes | Modular design | Production-grade |
| **Navigation** | Point-to-point | Multi-waypoint | Path planning |
| **Control** | Proportional | PID tuned | MPC/Advanced |
| **Safety** | Boundary check | Collision detection | Full safety system |
| **Testing** | 3+ unit tests | Integration tests | Full test suite + CI |
| **Documentation** | README | User guide | Complete docs |

---

## Submission

**Package your project:**
```bash
cd ~/ros2_ws/src
tar -czf autonomous_nav_submission.tar.gz autonomous_nav autonomous_nav_interfaces
```

**Required files:**
- Source code (all .py files)
- Launch files
- Config files
- Test files
- README.md with:
  - Build instructions
  - Run instructions
  - Demo video link
  - Known issues

---

## Congratulations! 🎉

You've completed **Module 1: ROS 2 Fundamentals**!

You now have a solid foundation in:
- ✅ ROS 2 architecture and concepts
- ✅ Topics, services, actions, and parameters
- ✅ Building and organizing packages
- ✅ Launch files and testing
- ✅ Autonomous navigation systems

**Next:** [Module 2: Gazebo & Unity Simulation →](../../module2-simulation/docs/intro.md)

---

## Additional Resources

- [Nav2 Documentation](https://navigation.ros.org/)
- [ROS 2 Humble Documentation](https://docs.ros.org/en/humble/)
- [Example Projects Gallery](https://github.com/ros2/examples)
