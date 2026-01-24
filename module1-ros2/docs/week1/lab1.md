---
sidebar_position: 4
---

# Lab 1: Turtle Controller System

**Level**: Beginner
**Duration**: 4 hours
**Prerequisites**: All Week 1 lessons completed

## Lab Overview

In this lab, you'll build a **complete turtle control system** that demonstrates:
- Publishers and subscribers working together
- Real-time robot control
- Collision detection and avoidance
- State management
- Debugging techniques

**What You'll Build**:
1. Turtle controller with safety features
2. Distance calculator
3. Drawing program
4. Goal-based navigation

## Lab Setup

### Verify Prerequisites

```bash
# Check ROS 2 installation
ros2 --version

# Check your workspace
ls ~/ros2_ws/src/my_robot_controller

# Verify TurtleSim works
ros2 run turtlesim turtlesim_node
# Press Ctrl+C after verifying the window appears
```

### Reset Your Workspace

```bash
cd ~/ros2_ws/src/my_robot_controller

# Create a dedicated directory for lab files
mkdir -p my_robot_controller/lab1
touch my_robot_controller/lab1/__init__.py
```

## Exercise 1: Safe Turtle Controller

**Goal**: Create a controller that stops the turtle before it hits walls.

### Requirements

1. Publish velocity commands to `/turtle1/cmd_vel`
2. Subscribe to turtle position from `/turtle1/pose`
3. Stop if turtle gets within 1.0 unit of any wall
4. Log safety status (SAFE / DANGER)

### Implementation

Create `my_robot_controller/lab1/safe_controller.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose

class SafeTurtleController(Node):
    """
    A turtle controller with built-in safety features.
    Stops the turtle before it hits the boundaries.
    """

    def __init__(self):
        super().__init__('safe_turtle_controller')

        # Publisher for velocity commands
        self.cmd_publisher = self.create_publisher(
            Twist,
            '/turtle1/cmd_vel',
            10
        )

        # Subscriber for turtle position
        self.pose_subscriber = self.create_subscription(
            Pose,
            '/turtle1/pose',
            self.pose_callback,
            10
        )

        # Control loop timer (10 Hz)
        self.control_timer = self.create_timer(0.1, self.control_loop)

        # State variables
        self.current_pose = None
        self.target_velocity = Twist()  # Desired velocity
        self.is_safe = True

        # Safety parameters
        self.safety_margin = 1.0  # Distance from wall (units)
        self.max_linear_speed = 2.0
        self.max_angular_speed = 2.0

        self.get_logger().info('Safe Turtle Controller initialized!')
        self.get_logger().info(f'Safety margin: {self.safety_margin} units')

    def pose_callback(self, msg):
        """Store the latest pose"""
        self.current_pose = msg

    def is_position_safe(self):
        """
        Check if current position is safe.
        Returns True if safe, False if too close to walls.
        """
        if self.current_pose is None:
            return False

        x = self.current_pose.x
        y = self.current_pose.y

        # TurtleSim boundaries are 0 to 11 for both x and y
        min_boundary = self.safety_margin
        max_boundary = 11.0 - self.safety_margin

        # Check all boundaries
        if x < min_boundary:
            self.get_logger().warn(f'⚠️  Too close to LEFT wall! x={x:.2f}')
            return False
        if x > max_boundary:
            self.get_logger().warn(f'⚠️  Too close to RIGHT wall! x={x:.2f}')
            return False
        if y < min_boundary:
            self.get_logger().warn(f'⚠️  Too close to BOTTOM wall! y={y:.2f}')
            return False
        if y > max_boundary:
            self.get_logger().warn(f'⚠️  Too close to TOP wall! y={y:.2f}')
            return False

        return True

    def control_loop(self):
        """Main control loop - runs at 10 Hz"""
        if self.current_pose is None:
            self.get_logger().info('Waiting for pose data...')
            return

        # Check safety
        self.is_safe = self.is_position_safe()

        # Create velocity command
        cmd = Twist()

        if self.is_safe:
            # Safe to move - use target velocity
            cmd.linear.x = self.target_velocity.linear.x
            cmd.angular.z = self.target_velocity.angular.z
        else:
            # DANGER! Stop immediately
            cmd.linear.x = 0.0
            cmd.angular.z = 0.0
            self.get_logger().error('🛑 STOPPED - Too close to wall!')

        # Publish command
        self.cmd_publisher.publish(cmd)

    def set_velocity(self, linear_x, angular_z):
        """
        Set desired velocity.
        This is called by other methods or could be exposed via a service.
        """
        # Clamp to max speeds
        self.target_velocity.linear.x = max(
            -self.max_linear_speed,
            min(self.max_linear_speed, linear_x)
        )
        self.target_velocity.angular.z = max(
            -self.max_angular_speed,
            min(self.max_angular_speed, angular_z)
        )

        self.get_logger().info(
            f'Target velocity set: linear={self.target_velocity.linear.x:.2f}, '
            f'angular={self.target_velocity.angular.z:.2f}'
        )


def main(args=None):
    rclpy.init(args=args)
    controller = SafeTurtleController()

    # Set a test velocity (move forward)
    controller.set_velocity(2.0, 0.0)

    try:
        rclpy.spin(controller)
    except KeyboardInterrupt:
        controller.get_logger().info('Shutting down safely...')
    finally:
        controller.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Update setup.py

Add the new lab node to `setup.py`:

```python
entry_points={
    'console_scripts': [
        # ... existing entries ...
        'safe_controller = my_robot_controller.lab1.safe_controller:main',
    ],
},
```

### Build and Test

```bash
# Build the package
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash

# Terminal 1: Start TurtleSim
ros2 run turtlesim turtlesim_node

# Terminal 2: Run safe controller
ros2 run my_robot_controller safe_controller
```

**Expected Behavior**:
- Turtle moves forward until it reaches the safety margin
- Controller logs "STOPPED - Too close to wall!"
- Turtle stops moving

### Testing Checklist

- [ ] Turtle stops before hitting right wall
- [ ] Safety warnings appear in terminal
- [ ] Turtle remains stopped while near wall
- [ ] No crashes or errors

**Question**: What happens if you change `safety_margin` to 0.5? To 2.0?

## Exercise 2: Distance Calculator

**Goal**: Calculate the distance between the turtle and a target point.

### Requirements

1. Subscribe to turtle's position
2. Calculate Euclidean distance to a target point (x=8, y=8)
3. Log distance every second
4. Warn when within 1.0 unit of target

### Implementation

Create `my_robot_controller/lab1/distance_calculator.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from turtlesim.msg import Pose
import math

class DistanceCalculator(Node):
    """
    Calculates the turtle's distance to a target point.
    Demonstrates mathematical operations on pose data.
    """

    def __init__(self):
        super().__init__('distance_calculator')

        # Subscribe to pose
        self.pose_subscriber = self.create_subscription(
            Pose,
            '/turtle1/pose',
            self.pose_callback,
            10
        )

        # Timer for periodic logging (1 Hz)
        self.log_timer = self.create_timer(1.0, self.log_distance)

        # State
        self.current_pose = None

        # Target point
        self.target_x = 8.0
        self.target_y = 8.0

        self.get_logger().info(
            f'Distance calculator started. Target: ({self.target_x}, {self.target_y})'
        )

    def pose_callback(self, msg):
        """Update current pose"""
        self.current_pose = msg

    def calculate_distance(self):
        """
        Calculate Euclidean distance to target.
        Formula: distance = sqrt((x2-x1)^2 + (y2-y1)^2)
        """
        if self.current_pose is None:
            return None

        dx = self.target_x - self.current_pose.x
        dy = self.target_y - self.current_pose.y

        distance = math.sqrt(dx**2 + dy**2)
        return distance

    def calculate_angle_to_target(self):
        """
        Calculate angle to target point.
        Returns angle in radians.
        """
        if self.current_pose is None:
            return None

        dx = self.target_x - self.current_pose.x
        dy = self.target_y - self.current_pose.y

        # atan2 returns angle in radians
        angle_to_target = math.atan2(dy, dx)
        return angle_to_target

    def log_distance(self):
        """Log current distance to target"""
        distance = self.calculate_distance()

        if distance is None:
            self.get_logger().info('Waiting for pose data...')
            return

        angle = self.calculate_angle_to_target()
        current_angle = self.current_pose.theta

        # Calculate angle difference
        angle_diff = angle - current_angle

        # Normalize to [-pi, pi]
        while angle_diff > math.pi:
            angle_diff -= 2 * math.pi
        while angle_diff < -math.pi:
            angle_diff += 2 * math.pi

        # Log information
        self.get_logger().info(
            f'Distance to target: {distance:.2f} units | '
            f'Angle error: {math.degrees(angle_diff):.1f}°'
        )

        # Warn if close
        if distance < 1.0:
            self.get_logger().warn(f'🎯 NEAR TARGET! Distance: {distance:.2f}')

        # Success if very close
        if distance < 0.1:
            self.get_logger().info('✅ TARGET REACHED!')


def main(args=None):
    rclpy.init(args=args)
    calculator = DistanceCalculator()

    try:
        rclpy.spin(calculator)
    except KeyboardInterrupt:
        pass
    finally:
        calculator.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Update setup.py

```python
entry_points={
    'console_scripts': [
        # ... existing entries ...
        'distance_calculator = my_robot_controller.lab1.distance_calculator:main',
    ],
},
```

### Build and Test

```bash
# Build
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash

# Terminal 1: TurtleSim
ros2 run turtlesim turtlesim_node

# Terminal 2: Distance calculator
ros2 run my_robot_controller distance_calculator

# Terminal 3: Control turtle manually
ros2 run turtlesim turtle_teleop_key
```

**Task**: Use keyboard to move turtle to position (8, 8). Watch the distance decrease!

### Challenge Questions

1. What's the maximum possible distance in TurtleSim? (Hint: diagonal of the arena)
2. Modify the code to track distance to **two** targets simultaneously
3. Add a feature that changes target color when turtle is close

## Exercise 3: Drawing Program

**Goal**: Make the turtle draw a square.

### Requirements

1. Draw a square with side length 3.0 units
2. Use timed movements (move forward, then turn)
3. Return to starting position

### Implementation

Create `my_robot_controller/lab1/square_drawer.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
import math

class SquareDrawer(Node):
    """
    Makes the turtle draw a square.
    Demonstrates state machine pattern for sequential actions.
    """

    def __init__(self):
        super().__init__('square_drawer')

        # Publisher
        self.cmd_publisher = self.create_publisher(
            Twist,
            '/turtle1/cmd_vel',
            10
        )

        # Control timer (10 Hz)
        self.timer = self.create_timer(0.1, self.control_loop)

        # Drawing parameters
        self.side_length = 3.0  # Square side length
        self.linear_speed = 1.0  # m/s
        self.angular_speed = 1.0  # rad/s

        # State machine
        self.state = 'MOVING'  # States: MOVING, TURNING, DONE
        self.side_count = 0  # How many sides completed
        self.start_time = self.get_clock().now()

        self.get_logger().info('Square drawer started!')
        self.get_logger().info(f'Drawing square with side length {self.side_length}')

    def control_loop(self):
        """State machine for drawing square"""
        cmd = Twist()
        current_time = self.get_clock().now()
        elapsed = (current_time - self.start_time).nanoseconds / 1e9  # Convert to seconds

        if self.state == 'MOVING':
            # Calculate how long to move for one side
            move_duration = self.side_length / self.linear_speed

            if elapsed < move_duration:
                # Keep moving forward
                cmd.linear.x = self.linear_speed
                cmd.angular.z = 0.0
            else:
                # Done moving, start turning
                self.state = 'TURNING'
                self.start_time = current_time
                self.get_logger().info(f'Completed side {self.side_count + 1}/4')

        elif self.state == 'TURNING':
            # Turn 90 degrees (pi/2 radians)
            turn_duration = (math.pi / 2) / self.angular_speed

            if elapsed < turn_duration:
                # Keep turning
                cmd.linear.x = 0.0
                cmd.angular.z = self.angular_speed
            else:
                # Done turning
                self.side_count += 1

                if self.side_count < 4:
                    # Start next side
                    self.state = 'MOVING'
                    self.start_time = current_time
                    self.get_logger().info('Starting next side...')
                else:
                    # Square complete!
                    self.state = 'DONE'
                    self.get_logger().info('✅ Square complete!')

        elif self.state == 'DONE':
            # Stop moving
            cmd.linear.x = 0.0
            cmd.angular.z = 0.0

        # Publish command
        self.cmd_publisher.publish(cmd)


def main(args=None):
    rclpy.init(args=args)
    drawer = SquareDrawer()

    try:
        rclpy.spin(drawer)
    except KeyboardInterrupt:
        pass
    finally:
        drawer.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Update setup.py

```python
entry_points={
    'console_scripts': [
        # ... existing entries ...
        'square_drawer = my_robot_controller.lab1.square_drawer:main',
    ],
},
```

### Build and Test

```bash
# Build
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash

# Clear the drawing first
ros2 service call /clear std_srvs/srv/Empty

# Terminal 1: TurtleSim
ros2 run turtlesim turtlesim_node

# Terminal 2: Square drawer
ros2 run my_robot_controller square_drawer
```

**Expected**: Turtle draws a square! 🟦

### Challenges

1. **Draw a triangle** (3 sides, 120° turns)
2. **Draw a hexagon** (6 sides, 60° turns)
3. **Draw a circle** (Hint: constant linear + angular velocity)
4. **Draw your initials**

## Exercise 4: Goal-Based Navigation (Advanced)

**Goal**: Make the turtle autonomously navigate to a target position.

### Requirements

1. Subscribe to turtle's current pose
2. Publish velocity commands
3. Calculate angle and distance to target
4. Stop when target reached (within tolerance)

### Implementation

Create `my_robot_controller/lab1/go_to_goal.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
import math

class GoToGoal(Node):
    """
    Autonomous navigation to a goal position.
    Combines pose monitoring, distance calculation, and velocity control.
    """

    def __init__(self):
        super().__init__('go_to_goal')

        # Declare parameters (can be set via command line)
        self.declare_parameter('goal_x', 8.0)
        self.declare_parameter('goal_y', 8.0)
        self.declare_parameter('distance_tolerance', 0.1)

        # Get parameters
        self.goal_x = self.get_parameter('goal_x').value
        self.goal_y = self.get_parameter('goal_y').value
        self.distance_tolerance = self.get_parameter('distance_tolerance').value

        # Publisher and subscriber
        self.cmd_publisher = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)
        self.pose_subscriber = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10
        )

        # Control timer
        self.timer = self.create_timer(0.1, self.control_loop)

        # State
        self.current_pose = None
        self.goal_reached = False

        # Control gains (tuning parameters)
        self.k_linear = 1.0   # Proportional gain for linear velocity
        self.k_angular = 4.0  # Proportional gain for angular velocity

        self.get_logger().info(f'Navigation started to goal: ({self.goal_x}, {self.goal_y})')

    def pose_callback(self, msg):
        """Update current pose"""
        self.current_pose = msg

    def get_distance_to_goal(self):
        """Calculate Euclidean distance to goal"""
        if self.current_pose is None:
            return float('inf')

        dx = self.goal_x - self.current_pose.x
        dy = self.goal_y - self.current_pose.y
        return math.sqrt(dx**2 + dy**2)

    def get_angle_to_goal(self):
        """Calculate angle to goal (in radians)"""
        if self.current_pose is None:
            return 0.0

        dx = self.goal_x - self.current_pose.x
        dy = self.goal_y - self.current_pose.y
        return math.atan2(dy, dx)

    def normalize_angle(self, angle):
        """Normalize angle to [-pi, pi]"""
        while angle > math.pi:
            angle -= 2 * math.pi
        while angle < -math.pi:
            angle += 2 * math.pi
        return angle

    def control_loop(self):
        """Proportional controller for navigation"""
        if self.current_pose is None:
            self.get_logger().info('Waiting for pose...')
            return

        # Check if goal reached
        distance = self.get_distance_to_goal()

        if distance < self.distance_tolerance:
            if not self.goal_reached:
                self.get_logger().info('🎯 GOAL REACHED!')
                self.goal_reached = True

            # Stop the turtle
            cmd = Twist()
            cmd.linear.x = 0.0
            cmd.angular.z = 0.0
            self.cmd_publisher.publish(cmd)
            return

        # Calculate errors
        angle_to_goal = self.get_angle_to_goal()
        angle_error = self.normalize_angle(angle_to_goal - self.current_pose.theta)

        # Proportional control
        cmd = Twist()

        # Angular velocity: turn towards goal
        cmd.angular.z = self.k_angular * angle_error

        # Linear velocity: move forward (only if facing roughly towards goal)
        if abs(angle_error) < math.pi / 4:  # Within 45 degrees
            cmd.linear.x = self.k_linear * distance
        else:
            # Turn in place if facing wrong direction
            cmd.linear.x = 0.0

        # Limit maximum speeds
        cmd.linear.x = min(cmd.linear.x, 2.0)
        cmd.angular.z = max(-2.0, min(2.0, cmd.angular.z))

        # Publish command
        self.cmd_publisher.publish(cmd)

        # Log progress
        self.get_logger().info(
            f'Distance: {distance:.2f} | Angle error: {math.degrees(angle_error):.1f}°',
            throttle_duration_sec=1.0  # Log at most once per second
        )


def main(args=None):
    rclpy.init(args=args)
    navigator = GoToGoal()

    try:
        rclpy.spin(navigator)
    except KeyboardInterrupt:
        pass
    finally:
        navigator.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Update setup.py

```python
entry_points={
    'console_scripts': [
        # ... existing entries ...
        'go_to_goal = my_robot_controller.lab1.go_to_goal:main',
    ],
},
```

### Build and Test

```bash
# Build
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash

# Terminal 1: TurtleSim
ros2 run turtlesim turtlesim_node

# Terminal 2: Navigate to (8, 8)
ros2 run my_robot_controller go_to_goal

# Terminal 3: Navigate to different goal
ros2 run my_robot_controller go_to_goal --ros-args -p goal_x:=2.0 -p goal_y:=9.0
```

**Expected**: Turtle smoothly navigates to goal position!

### Experiment

Try different goals:
```bash
# Bottom-left corner
ros2 run my_robot_controller go_to_goal --ros-args -p goal_x:=1.0 -p goal_y:=1.0

# Top-right corner
ros2 run my_robot_controller go_to_goal --ros-args -p goal_x:=10.0 -p goal_y:=10.0

# Center
ros2 run my_robot_controller go_to_goal --ros-args -p goal_x:=5.5 -p goal_y:=5.5
```

### Tuning Challenge

The behavior depends on control gains `k_linear` and `k_angular`.

**Experiment**:
1. Increase `k_angular` to 8.0 → What happens?
2. Decrease `k_linear` to 0.5 → What happens?
3. Find optimal values for smooth, fast navigation!

## Debugging Lab

### Scenario 1: No Movement

**Symptom**: Turtle doesn't move even though node is running

**Debug Steps**:
```bash
# 1. Check if commands are being published
ros2 topic echo /turtle1/cmd_vel

# 2. Check publication rate
ros2 topic hz /turtle1/cmd_vel

# 3. Check if TurtleSim is subscribed
ros2 topic info /turtle1/cmd_vel

# 4. View computation graph
rqt_graph
```

**Common causes**:
- Topic name mismatch
- Node not publishing (check timer in code)
- TurtleSim not running

### Scenario 2: Erratic Movement

**Symptom**: Turtle moves unpredictably

**Debug**:
```bash
# Check for multiple publishers
ros2 topic info /turtle1/cmd_vel
# Should show Publisher count: 1

# If > 1, find all nodes
ros2 node list

# Kill extra publishers
# Ctrl+C in their terminals
```

### Scenario 3: Position Data Not Available

**Symptom**: `self.current_pose` is always `None`

**Debug**:
```python
# Add debug logging in pose_callback
def pose_callback(self, msg):
    self.get_logger().info(f'Received pose: x={msg.x:.2f}, y={msg.y:.2f}')
    self.current_pose = msg
```

**Check**:
```bash
# Is pose being published?
ros2 topic hz /turtle1/pose
```

## Advanced Challenges

### Challenge 1: Multi-Point Navigation

**Task**: Navigate through a series of waypoints:
```python
waypoints = [
    (2.0, 2.0),
    (9.0, 2.0),
    (9.0, 9.0),
    (2.0, 9.0),
    (5.5, 5.5)  # Return to center
]
```

**Hint**: Extend `GoToGoal` to cycle through waypoints.

### Challenge 2: Obstacle Avoidance

**Task**: Add a "virtual obstacle" at position (5.5, 5.5) with radius 2.0. Navigate to goal while avoiding it.

**Hint**: Check distance to obstacle. If too close, add repulsive force.

### Challenge 3: Path Drawing

**Task**: Make turtle draw a star ⭐

**Requirements**:
- 5 points
- Turtle visits each point in sequence
- Smooth paths between points

### Challenge 4: Follow the Leader

**Task**: Spawn a second turtle that follows the first!

**Hint**:
```bash
# Spawn second turtle
ros2 service call /spawn turtlesim/srv/Spawn "{x: 2.0, y: 2.0, theta: 0.0, name: 'turtle2'}"

# Your node should:
# - Subscribe to /turtle1/pose
# - Publish to /turtle2/cmd_vel
# - Make turtle2 navigate towards turtle1's position
```

## Performance Analysis

### Measure Topic Rates

```bash
# Velocity commands publication rate
ros2 topic hz /turtle1/cmd_vel

# Pose updates rate
ros2 topic hz /turtle1/pose
```

**Questions**:
1. What's the rate of `/turtle1/pose`? Why?
2. What's the rate of your velocity commands? Does it match your timer frequency?

### Measure Latency

Add timestamps to your code:

```python
def control_loop(self):
    start_time = self.get_clock().now()

    # ... your control logic ...

    end_time = self.get_clock().now()
    latency = (end_time - start_time).nanoseconds / 1e6  # Convert to ms

    self.get_logger().info(f'Control loop latency: {latency:.2f} ms')
```

**Goal**: Control loop should complete in < 10 ms for 10 Hz operation.

## Common Errors & Solutions

### Error 1: Module Import Failure

**Error**:
```
ModuleNotFoundError: No module named 'my_robot_controller.lab1'
```

**Fix**:
```bash
# Ensure __init__.py exists
touch ~/ros2_ws/src/my_robot_controller/my_robot_controller/lab1/__init__.py

# Rebuild
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash
```

### Error 2: Division by Zero

**Error**:
```python
ZeroDivisionError: float division by zero
```

**Common in**:
```python
# BAD
speed = distance / time  # time could be 0!

# GOOD
if time > 0:
    speed = distance / time
else:
    speed = 0.0
```

### Error 3: Attribute Error

**Error**:
```
AttributeError: 'NoneType' object has no attribute 'x'
```

**Fix**: Always check if pose is available:
```python
if self.current_pose is None:
    return
# Now safe to use self.current_pose.x
```

## Lab Submission Checklist

Complete these tasks and verify your implementation:

- [ ] Exercise 1: Safe controller stops before walls
- [ ] Exercise 2: Distance calculator shows accurate distances
- [ ] Exercise 3: Square drawer completes a square
- [ ] Exercise 4: Goal navigator reaches target
- [ ] All nodes build without errors
- [ ] All nodes run without crashes
- [ ] Code includes comments and logging
- [ ] Attempted at least one advanced challenge

## Reflection Questions

Answer these questions in your lab report:

1. **Architecture**: Draw a diagram showing all nodes and topics in Exercise 4. How many publishers? How many subscribers?

2. **Control Theory**: In `go_to_goal.py`, why do we check if `angle_error < pi/4` before moving forward?

3. **State Machines**: How would you extend the square drawer to draw any N-sided polygon?

4. **Safety**: What happens if two nodes publish to `/turtle1/cmd_vel` simultaneously? How would you prevent this in a real robot?

5. **Performance**: You want your control loop to run at 100 Hz. What changes would you make to the code?

## Key Takeaways

✅ **Closed-loop control** requires both sensing (subscription) and actuation (publishing)
✅ **State machines** are useful for sequential behaviors (drawing shapes)
✅ **Proportional control** is a simple but effective navigation strategy
✅ **Safety checks** should happen before sending commands
✅ **Debugging** requires inspecting topics, nodes, and message flow
✅ **Real-time control** needs fast control loops and efficient code

## What's Next?

**Week 2** will cover:
- **Services**: Request/response patterns for one-time actions
- **Actions**: Long-running tasks with feedback and cancellation
- **Parameters**: Dynamic configuration without restarting nodes
- **Custom messages**: Defining your own data structures

You'll build:
- A turtle teleportation service
- A multi-step navigation action server
- A configurable PID controller

---

**Congratulations!** You've completed Week 1 and built a complete robotic control system! 🎉

**Previous**: [Publisher-Subscriber Pattern](./publisher-subscriber.md) | **Next**: [Week 2: Advanced Communication](../week2/services.md)
