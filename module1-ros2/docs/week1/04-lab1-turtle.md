---
sidebar_position: 4
---

# Lab 1: Turtle Control

**Hands-On Practice**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Completed Publisher-Subscriber section

### Lab Objectives

- Master turtlesim for ROS 2 fundamentals
- Create velocity publishers to control turtle movement
- Subscribe to pose data for turtle tracking
- Implement keyboard teleop from scratch
- Draw basic patterns and shapes

### Introduction to Turtlesim

**Turtlesim** is a lightweight 2D robot simulator designed for learning ROS 2 concepts.

**Why turtlesim?**
- Instant visual feedback
- No hardware required
- Simple 2D kinematics
- Perfect for learning pub/sub, services, and actions

#### Starting Turtlesim

```bash
# Terminal 1: Start turtlesim
ros2 run turtlesim turtlesim_node

# Terminal 2: Start keyboard teleop (arrow keys to move)
ros2 run turtlesim turtle_teleop_key
```

**Explore the system:**

```bash
# List nodes
ros2 node list
# /turtlesim
# /teleop_turtle

# List topics
ros2 topic list
# /turtle1/cmd_vel       (velocity commands)
# /turtle1/pose          (turtle position/orientation)
# /turtle1/color_sensor  (background color at turtle position)

# Inspect cmd_vel topic
ros2 topic info /turtle1/cmd_vel
# Type: geometry_msgs/msg/Twist

# Inspect pose topic
ros2 topic info /turtle1/pose
# Type: turtlesim/msg/Pose

# See pose structure
ros2 interface show turtlesim/msg/Pose
```

### Task 1: Move Turtle in a Square

Create a node that moves the turtle in a square pattern.

**square_pattern.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
import time

class SquarePattern(Node):
    def __init__(self):
        super().__init__('square_pattern')

        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)

        # Execute the pattern
        self.draw_square()

    def move_forward(self, distance, speed=1.0):
        """Move forward for a specific distance"""
        msg = Twist()
        msg.linear.x = speed

        # Calculate time needed
        duration = distance / speed

        start_time = time.time()
        while (time.time() - start_time) < duration:
            self.publisher.publish(msg)
            time.sleep(0.1)

        # Stop
        self.stop()

    def turn_left(self, angle_degrees, angular_speed=30.0):
        """Turn left by specific angle (degrees)"""
        msg = Twist()
        msg.angular.z = angular_speed * (3.14159 / 180.0)  # Convert to radians/s

        # Calculate time needed
        angle_radians = angle_degrees * (3.14159 / 180.0)
        duration = angle_radians / msg.angular.z

        start_time = time.time()
        while (time.time() - start_time) < duration:
            self.publisher.publish(msg)
            time.sleep(0.1)

        # Stop
        self.stop()

    def stop(self):
        """Stop the turtle"""
        msg = Twist()
        self.publisher.publish(msg)
        time.sleep(0.5)

    def draw_square(self):
        """Draw a square"""
        self.get_logger().info('Drawing square...')

        for i in range(4):
            self.get_logger().info(f'Side {i+1}/4')
            self.move_forward(distance=2.0, speed=1.0)
            self.turn_left(angle_degrees=90, angular_speed=30.0)

        self.get_logger().info('Square complete!')

def main(args=None):
    rclpy.init(args=args)
    node = SquarePattern()
    # Pattern executes in __init__, so we just shutdown
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Run it:**
```bash
python3 square_pattern.py
```

### Task 2: Subscribe to Pose Data

Monitor the turtle's position in real-time.

**pose_subscriber.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from turtlesim.msg import Pose

class PoseSubscriber(Node):
    def __init__(self):
        super().__init__('pose_subscriber')

        self.subscription = self.create_subscription(
            Pose,
            '/turtle1/pose',
            self.pose_callback,
            10
        )

        self.get_logger().info('Pose subscriber started')

    def pose_callback(self, msg):
        """Called when pose is received"""
        self.get_logger().info(
            f'Position: ({msg.x:.2f}, {msg.y:.2f}), '
            f'Angle: {msg.theta:.2f} rad, '
            f'Linear velocity: {msg.linear_velocity:.2f}, '
            f'Angular velocity: {msg.angular_velocity:.2f}'
        )

def main(args=None):
    rclpy.init(args=args)
    node = PoseSubscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Task 3: Circle Pattern

**circle_pattern.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class CirclePattern(Node):
    def __init__(self):
        super().__init__('circle_pattern')

        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)

        # Publish at 10 Hz
        self.timer = self.create_timer(0.1, self.timer_callback)

        self.get_logger().info('Drawing circle...')

    def timer_callback(self):
        msg = Twist()

        # Circle: constant linear + angular velocity
        msg.linear.x = 2.0    # Forward speed
        msg.angular.z = 1.0   # Turning rate

        self.publisher.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = CirclePattern()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Task 4: Keyboard Teleop (Simple Version)

**simple_teleop.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
import sys
import tty
import termios

class SimpleTeleop(Node):
    def __init__(self):
        super().__init__('simple_teleop')

        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)

        self.linear_speed = 2.0
        self.angular_speed = 2.0

        self.get_logger().info('Simple Teleop Started')
        self.get_logger().info('Controls:')
        self.get_logger().info('  w - forward')
        self.get_logger().info('  s - backward')
        self.get_logger().info('  a - turn left')
        self.get_logger().info('  d - turn right')
        self.get_logger().info('  space - stop')
        self.get_logger().info('  q - quit')

    def get_key(self):
        """Get single keypress"""
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setraw(fd)
            key = sys.stdin.read(1)
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        return key

    def publish_velocity(self, linear, angular):
        msg = Twist()
        msg.linear.x = linear
        msg.angular.z = angular
        self.publisher.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = SimpleTeleop()

    try:
        while rclpy.ok():
            key = node.get_key()

            if key == 'w':
                node.publish_velocity(node.linear_speed, 0.0)
            elif key == 's':
                node.publish_velocity(-node.linear_speed, 0.0)
            elif key == 'a':
                node.publish_velocity(0.0, node.angular_speed)
            elif key == 'd':
                node.publish_velocity(0.0, -node.angular_speed)
            elif key == ' ':
                node.publish_velocity(0.0, 0.0)
            elif key == 'q':
                break

    except Exception as e:
        node.get_logger().error(f'Error: {e}')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Beginner Challenges

1. **Triangle Pattern**: Modify square_pattern.py to draw an equilateral triangle
2. **Figure-8**: Create a node that draws a figure-8 pattern
3. **Spiral**: Gradually increase the circle radius over time
4. **Speed Control**: Add '+' and '-' keys to teleop to increase/decrease speed

### Key Takeaways (Beginner)

✅ **Turtlesim** provides instant visual feedback for ROS 2 learning
✅ **Twist messages** control linear and angular velocity
✅ **Pose messages** provide position and orientation data
✅ **Time-based control** can create precise movement patterns
✅ **Keyboard input** requires raw terminal mode

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner lab completed

### Lab Objectives

- Implement closed-loop control with pose feedback
- Create a PID controller for precise movement
- Navigate to specific waypoints
- Handle multiple turtles
- Implement collision avoidance

### Task 5: Go-to-Goal Controller

Use pose feedback to navigate to a specific target.

**goto_goal.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
import math

class GoToGoal(Node):
    def __init__(self):
        super().__init__('goto_goal')

        # Publishers and subscribers
        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.subscription = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10
        )

        # Current pose
        self.current_pose = None

        # Goal pose (center of turtlesim window)
        self.goal_x = 5.5
        self.goal_y = 5.5

        # Control loop at 10 Hz
        self.timer = self.create_timer(0.1, self.control_loop)

        # Tolerances
        self.distance_tolerance = 0.1
        self.reached_goal = False

        self.get_logger().info(f'Navigating to ({self.goal_x}, {self.goal_y})')

    def pose_callback(self, msg):
        """Update current pose"""
        self.current_pose = msg

    def control_loop(self):
        """Main control logic"""
        if self.current_pose is None:
            return

        if self.reached_goal:
            return

        # Calculate distance to goal
        dx = self.goal_x - self.current_pose.x
        dy = self.goal_y - self.current_pose.y
        distance = math.sqrt(dx**2 + dy**2)

        # Calculate desired angle
        desired_theta = math.atan2(dy, dx)

        # Angular error
        angular_error = desired_theta - self.current_pose.theta

        # Normalize angle to [-pi, pi]
        angular_error = math.atan2(math.sin(angular_error), math.cos(angular_error))

        # Create control message
        msg = Twist()

        if distance > self.distance_tolerance:
            # Proportional control
            k_linear = 1.5
            k_angular = 6.0

            msg.linear.x = k_linear * distance
            msg.angular.z = k_angular * angular_error

            self.publisher.publish(msg)

            if distance < 0.5:
                self.get_logger().info(f'Close to goal: {distance:.2f}m')
        else:
            # Goal reached!
            msg.linear.x = 0.0
            msg.angular.z = 0.0
            self.publisher.publish(msg)

            self.get_logger().info('Goal reached!')
            self.reached_goal = True

def main(args=None):
    rclpy.init(args=args)
    node = GoToGoal()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Task 6: PID Controller for Smooth Movement

Implement a full PID controller for precise trajectory tracking.

**pid_controller.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
import math

class PIDController:
    """PID controller for a single variable"""
    def __init__(self, kp, ki, kd, min_output=-float('inf'), max_output=float('inf')):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.min_output = min_output
        self.max_output = max_output

        self.integral = 0.0
        self.previous_error = 0.0

    def compute(self, error, dt):
        """Compute PID output"""
        # Proportional term
        p_term = self.kp * error

        # Integral term
        self.integral += error * dt
        i_term = self.ki * self.integral

        # Derivative term
        if dt > 0:
            derivative = (error - self.previous_error) / dt
        else:
            derivative = 0.0
        d_term = self.kd * derivative

        # Total output
        output = p_term + i_term + d_term

        # Clamp output
        output = max(self.min_output, min(self.max_output, output))

        self.previous_error = error
        return output

    def reset(self):
        """Reset controller state"""
        self.integral = 0.0
        self.previous_error = 0.0

class PIDGoToGoal(Node):
    def __init__(self):
        super().__init__('pid_goto_goal')

        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.subscription = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10
        )

        # PID controllers
        self.linear_pid = PIDController(kp=1.5, ki=0.0, kd=0.5, max_output=2.0)
        self.angular_pid = PIDController(kp=6.0, ki=0.1, kd=1.0, max_output=4.0)

        self.current_pose = None
        self.goal_x = 9.0
        self.goal_y = 9.0

        self.last_time = self.get_clock().now()
        self.timer = self.create_timer(0.05, self.control_loop)  # 20 Hz

        self.get_logger().info(f'PID navigation to ({self.goal_x}, {self.goal_y})')

    def pose_callback(self, msg):
        self.current_pose = msg

    def control_loop(self):
        if self.current_pose is None:
            return

        # Calculate dt
        current_time = self.get_clock().now()
        dt = (current_time - self.last_time).nanoseconds / 1e9
        self.last_time = current_time

        # Distance to goal
        dx = self.goal_x - self.current_pose.x
        dy = self.goal_y - self.current_pose.y
        distance = math.sqrt(dx**2 + dy**2)

        # Desired angle
        desired_theta = math.atan2(dy, dx)
        angular_error = desired_theta - self.current_pose.theta
        angular_error = math.atan2(math.sin(angular_error), math.cos(angular_error))

        # PID control
        msg = Twist()

        if distance > 0.1:
            msg.linear.x = self.linear_pid.compute(distance, dt)
            msg.angular.z = self.angular_pid.compute(angular_error, dt)
            self.publisher.publish(msg)
        else:
            msg.linear.x = 0.0
            msg.angular.z = 0.0
            self.publisher.publish(msg)
            self.get_logger().info('Goal reached with PID!')

def main(args=None):
    rclpy.init(args=args)
    node = PIDGoToGoal()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Task 7: Multi-Waypoint Navigation

**waypoint_navigator.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
import math

class WaypointNavigator(Node):
    def __init__(self):
        super().__init__('waypoint_navigator')

        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.subscription = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10
        )

        # Waypoints (square path)
        self.waypoints = [
            (2.0, 2.0),
            (9.0, 2.0),
            (9.0, 9.0),
            (2.0, 9.0),
            (5.5, 5.5)  # Return to center
        ]

        self.current_waypoint_index = 0
        self.current_pose = None
        self.distance_tolerance = 0.2

        self.timer = self.create_timer(0.1, self.control_loop)

        self.get_logger().info(f'Navigating through {len(self.waypoints)} waypoints')

    def pose_callback(self, msg):
        self.current_pose = msg

    def control_loop(self):
        if self.current_pose is None:
            return

        if self.current_waypoint_index >= len(self.waypoints):
            # All waypoints reached
            self.stop()
            self.get_logger().info('All waypoints reached!')
            return

        # Current goal
        goal_x, goal_y = self.waypoints[self.current_waypoint_index]

        # Distance to current waypoint
        dx = goal_x - self.current_pose.x
        dy = goal_y - self.current_pose.y
        distance = math.sqrt(dx**2 + dy**2)

        if distance < self.distance_tolerance:
            # Reached waypoint
            self.get_logger().info(
                f'Reached waypoint {self.current_waypoint_index + 1}/{len(self.waypoints)}: '
                f'({goal_x}, {goal_y})'
            )
            self.current_waypoint_index += 1
            return

        # Navigate to waypoint
        desired_theta = math.atan2(dy, dx)
        angular_error = desired_theta - self.current_pose.theta
        angular_error = math.atan2(math.sin(angular_error), math.cos(angular_error))

        msg = Twist()
        msg.linear.x = min(1.5 * distance, 2.0)
        msg.angular.z = 4.0 * angular_error
        self.publisher.publish(msg)

    def stop(self):
        msg = Twist()
        self.publisher.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = WaypointNavigator()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Task 8: Multi-Turtle Coordination

**spawn_multi_turtle.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from turtlesim.srv import Spawn

class MultiTurtleSpawner(Node):
    def __init__(self):
        super().__init__('multi_turtle_spawner')

        # Create service client
        self.spawn_client = self.create_client(Spawn, '/spawn')

        while not self.spawn_client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Waiting for /spawn service...')

        # Spawn turtles
        self.spawn_turtle('turtle2', 2.0, 2.0, 0.0)
        self.spawn_turtle('turtle3', 9.0, 2.0, 0.0)
        self.spawn_turtle('turtle4', 9.0, 9.0, 0.0)

    def spawn_turtle(self, name, x, y, theta):
        request = Spawn.Request()
        request.name = name
        request.x = x
        request.y = y
        request.theta = theta

        future = self.spawn_client.call_async(request)
        rclpy.spin_until_future_complete(self, future)

        if future.result() is not None:
            self.get_logger().info(f'Spawned {name} at ({x}, {y})')
        else:
            self.get_logger().error(f'Failed to spawn {name}')

def main(args=None):
    rclpy.init(args=args)
    node = MultiTurtleSpawner()
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Intermediate Challenges

1. **Trajectory Tracking**: Follow a predefined path (sine wave, spiral)
2. **Obstacle Avoidance**: Stop before hitting window edges
3. **Formation Control**: Keep multiple turtles in formation (triangle, line)
4. **Leader-Follower**: One turtle follows another at a fixed distance

### Key Takeaways (Intermediate)

✅ **Closed-loop control** uses sensor feedback for precise navigation
✅ **PID controllers** provide smooth, tuned responses
✅ **Waypoint navigation** enables complex paths
✅ **Multi-turtle systems** demonstrate distributed control

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate lab completed

### Lab Objectives

- Implement advanced path planning (A*, RRT)
- Create collision avoidance with dynamic obstacles
- Optimize multi-robot task allocation
- Build production-ready controller architecture
- Performance profiling and optimization

### Task 9: Path Planning with A*

**astar_planner.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
import math
import heapq

class AStarPlanner(Node):
    def __init__(self):
        super().__init__('astar_planner')

        self.publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.subscription = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10
        )

        self.current_pose = None
        self.path = []
        self.current_waypoint_index = 0

        # Plan path
        start = (5.5, 5.5)
        goal = (9.0, 9.0)
        obstacles = [(6.0, 6.0), (7.0, 7.0), (8.0, 8.0)]

        self.path = self.plan_path(start, goal, obstacles)
        self.get_logger().info(f'Planned path with {len(self.path)} waypoints')

        self.timer = self.create_timer(0.1, self.control_loop)

    def plan_path(self, start, goal, obstacles, grid_resolution=0.5):
        """A* path planning"""
        def heuristic(a, b):
            return math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2)

        def get_neighbors(node):
            x, y = node
            neighbors = []
            for dx, dy in [(1,0), (-1,0), (0,1), (0,-1), (1,1), (-1,-1), (1,-1), (-1,1)]:
                nx, ny = x + dx * grid_resolution, y + dy * grid_resolution
                if 0 <= nx <= 11 and 0 <= ny <= 11:
                    # Check collision with obstacles
                    collision = False
                    for ox, oy in obstacles:
                        if math.sqrt((nx - ox)**2 + (ny - oy)**2) < 1.0:
                            collision = True
                            break
                    if not collision:
                        neighbors.append((nx, ny))
            return neighbors

        # A* algorithm
        open_set = []
        heapq.heappush(open_set, (0, start))
        came_from = {}
        g_score = {start: 0}
        f_score = {start: heuristic(start, goal)}

        while open_set:
            _, current = heapq.heappop(open_set)

            if heuristic(current, goal) < grid_resolution:
                # Reconstruct path
                path = [current]
                while current in came_from:
                    current = came_from[current]
                    path.append(current)
                return list(reversed(path))

            for neighbor in get_neighbors(current):
                tentative_g = g_score[current] + heuristic(current, neighbor)

                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))

        return [start, goal]  # Fallback: straight line

    def pose_callback(self, msg):
        self.current_pose = msg

    def control_loop(self):
        if self.current_pose is None or self.current_waypoint_index >= len(self.path):
            return

        goal_x, goal_y = self.path[self.current_waypoint_index]

        dx = goal_x - self.current_pose.x
        dy = goal_y - self.current_pose.y
        distance = math.sqrt(dx**2 + dy**2)

        if distance < 0.2:
            self.current_waypoint_index += 1
            if self.current_waypoint_index >= len(self.path):
                self.get_logger().info('Path complete!')
                self.stop()
            return

        desired_theta = math.atan2(dy, dx)
        angular_error = desired_theta - self.current_pose.theta
        angular_error = math.atan2(math.sin(angular_error), math.cos(angular_error))

        msg = Twist()
        msg.linear.x = min(1.5 * distance, 2.0)
        msg.angular.z = 4.0 * angular_error
        self.publisher.publish(msg)

    def stop(self):
        self.publisher.publish(Twist())

def main(args=None):
    rclpy.init(args=args)
    node = AStarPlanner()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Task 10: Dynamic Collision Avoidance

**collision_avoidance.py** (implementation uses potential fields or dynamic window approach)

### Task 11: Production Controller Architecture

**production_controller.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
from enum import Enum
import math

class ControllerState(Enum):
    IDLE = 0
    NAVIGATING = 1
    REACHED_GOAL = 2
    ERROR = 3

class ProductionController(Node):
    """Production-grade turtle controller with error handling, state machine, and logging"""

    def __init__(self):
        super().__init__('production_controller')

        # Publishers and subscribers
        self.cmd_pub = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.pose_sub = self.create_subscription(Pose, '/turtle1/pose', self.pose_callback, 10)

        # State machine
        self.state = ControllerState.IDLE
        self.current_pose = None
        self.goal = None

        # Control parameters (from ROS parameters)
        self.declare_parameter('linear_gain', 1.5)
        self.declare_parameter('angular_gain', 4.0)
        self.declare_parameter('goal_tolerance', 0.1)
        self.declare_parameter('max_linear_speed', 2.0)
        self.declare_parameter('max_angular_speed', 4.0)

        # Timers
        self.control_timer = self.create_timer(0.05, self.control_loop)  # 20 Hz
        self.watchdog_timer = self.create_timer(1.0, self.watchdog)

        # Health monitoring
        self.last_pose_time = self.get_clock().now()
        self.control_iterations = 0

        self.get_logger().info('Production controller initialized')

    def set_goal(self, x, y):
        """Set navigation goal"""
        self.goal = (x, y)
        self.state = ControllerState.NAVIGATING
        self.get_logger().info(f'New goal: ({x}, {y})')

    def pose_callback(self, msg):
        self.current_pose = msg
        self.last_pose_time = self.get_clock().now()

    def control_loop(self):
        """Main control loop"""
        try:
            if self.state == ControllerState.IDLE:
                return

            if self.state == ControllerState.NAVIGATING:
                self.navigate()

            self.control_iterations += 1

        except Exception as e:
            self.get_logger().error(f'Control loop error: {e}')
            self.state = ControllerState.ERROR
            self.emergency_stop()

    def navigate(self):
        """Navigate to goal"""
        if self.current_pose is None or self.goal is None:
            return

        goal_x, goal_y = self.goal

        # Calculate error
        dx = goal_x - self.current_pose.x
        dy = goal_y - self.current_pose.y
        distance = math.sqrt(dx**2 + dy**2)

        # Check if goal reached
        if distance < self.get_parameter('goal_tolerance').value:
            self.get_logger().info('Goal reached!')
            self.state = ControllerState.REACHED_GOAL
            self.stop()
            return

        # Calculate control
        desired_theta = math.atan2(dy, dx)
        angular_error = desired_theta - self.current_pose.theta
        angular_error = math.atan2(math.sin(angular_error), math.cos(angular_error))

        # Apply control
        msg = Twist()
        msg.linear.x = min(
            self.get_parameter('linear_gain').value * distance,
            self.get_parameter('max_linear_speed').value
        )
        msg.angular.z = max(min(
            self.get_parameter('angular_gain').value * angular_error,
            self.get_parameter('max_angular_speed').value
        ), -self.get_parameter('max_angular_speed').value)

        self.cmd_pub.publish(msg)

    def watchdog(self):
        """Monitor system health"""
        now = self.get_clock().now()
        time_since_pose = (now - self.last_pose_time).nanoseconds / 1e9

        if time_since_pose > 2.0:
            self.get_logger().warn(f'No pose update for {time_since_pose:.1f}s')
            self.state = ControllerState.ERROR
            self.emergency_stop()

        # Log statistics
        if self.control_iterations > 0:
            self.get_logger().info(
                f'State: {self.state.name}, Iterations: {self.control_iterations}',
                throttle_duration_sec=5.0
            )

    def stop(self):
        """Stop the turtle"""
        self.cmd_pub.publish(Twist())

    def emergency_stop(self):
        """Emergency stop"""
        self.get_logger().error('EMERGENCY STOP')
        self.stop()

def main(args=None):
    rclpy.init(args=args)
    node = ProductionController()

    # Set a goal
    node.set_goal(9.0, 9.0)

    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Advanced Challenges

1. **Multi-Robot Task Allocation**: Assign waypoints to multiple turtles optimally
2. **SLAM Simulation**: Track visited areas and build a "map"
3. **Swarm Behavior**: Implement flocking/swarming algorithms
4. **Model Predictive Control (MPC)**: Predict future states for optimal control
5. **Reinforcement Learning**: Train a controller using RL

### Key Takeaways (Advanced)

✅ **Path planning** (A*, RRT) finds optimal collision-free paths
✅ **State machines** structure complex control logic
✅ **Production patterns** include error handling, watchdogs, logging
✅ **Parameters** enable runtime configuration
✅ **Performance profiling** identifies bottlenecks

---

## Summary & Next Steps

**What You've Learned:**
- Turtlesim basics and ROS 2 pub/sub fundamentals
- Open-loop and closed-loop control
- PID controllers and waypoint navigation
- Path planning and collision avoidance
- Production-ready controller architecture

**Next Lesson:** [Services →](../week2/05-services.md)

---

## Additional Resources

- [Turtlesim Documentation](https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Introducing-Turtlesim/Introducing-Turtlesim.html)
- [Writing Publisher/Subscriber](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html)
