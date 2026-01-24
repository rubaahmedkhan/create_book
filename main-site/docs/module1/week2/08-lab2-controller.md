---
sidebar_position: 8
---

# Lab 2: Robot Controller

**Hands-On Practice**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Completed Services, Actions, Parameters

### Lab Objectives

- Integrate topics, services, actions, and parameters
- Build a multi-mode robot controller
- Implement state machines
- Use turtlesim as test platform

### Project Overview

Build a **robot controller** with:
- **Topics**: Velocity commands, sensor data
- **Services**: Mode changes, reset
- **Parameters**: Speed limits, gains
- **State machine**: Idle, Manual, Autonomous modes

### Task 1: Basic Controller Node

**robot_controller.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose
from std_srvs.srv import Empty
from enum import Enum

class RobotMode(Enum):
    IDLE = 0
    MANUAL = 1
    AUTONOMOUS = 2

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')

        # Parameters
        self.declare_parameter('max_speed', 2.0)
        self.declare_parameter('initial_mode', 'idle')

        # State
        mode_str = self.get_parameter('initial_mode').value
        self.mode = RobotMode[mode_str.upper()]

        # Publishers
        self.cmd_pub = self.create_publisher(Twist, '/turtle1/cmd_vel', 10)

        # Subscribers
        self.pose_sub = self.create_subscription(
            Pose, '/turtle1/pose', self.pose_callback, 10
        )

        # Services (server)
        self.reset_service = self.create_service(
            Empty, 'reset_controller', self.reset_callback
        )

        # Services (client)
        self.turtlesim_reset_client = self.create_client(Empty, '/reset')

        # Timers
        self.control_timer = self.create_timer(0.1, self.control_loop)

        # State variables
        self.current_pose = None
        self.manual_linear = 0.0
        self.manual_angular = 0.0

        self.get_logger().info(f'Robot Controller started in {self.mode.name} mode')

    def pose_callback(self, msg):
        """Store current pose"""
        self.current_pose = msg

    def control_loop(self):
        """Main control loop"""
        if self.mode == RobotMode.IDLE:
            # Stop robot
            self.publish_velocity(0.0, 0.0)

        elif self.mode == RobotMode.MANUAL:
            # Use manual commands
            max_speed = self.get_parameter('max_speed').value
            linear = max(-max_speed, min(max_speed, self.manual_linear))
            angular = max(-max_speed, min(max_speed, self.manual_angular))
            self.publish_velocity(linear, angular)

        elif self.mode == RobotMode.AUTONOMOUS:
            # Simple autonomous behavior: circle
            self.publish_velocity(1.0, 0.5)

    def publish_velocity(self, linear, angular):
        """Publish velocity command"""
        msg = Twist()
        msg.linear.x = linear
        msg.angular.z = angular
        self.cmd_pub.publish(msg)

    def reset_callback(self, request, response):
        """Reset controller"""
        self.get_logger().info('Resetting controller')
        self.mode = RobotMode.IDLE
        self.manual_linear = 0.0
        self.manual_angular = 0.0

        # Also reset turtlesim
        if self.turtlesim_reset_client.service_is_ready():
            reset_future = self.turtlesim_reset_client.call_async(Empty.Request())

        return response

    def set_manual_command(self, linear, angular):
        """Set manual velocity commands"""
        self.manual_linear = linear
        self.manual_angular = angular

def main(args=None):
    rclpy.init(args=args)
    controller = RobotController()
    rclpy.spin(controller)
    controller.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Task 2: Mode Switch Service

Add mode switching capability:

```python
from my_robot_interfaces.srv import SetMode  # Custom service

class RobotController(Node):
    def __init__(self):
        # ... (previous init code)

        # Mode switch service
        self.mode_service = self.create_service(
            SetMode, 'set_mode', self.set_mode_callback
        )

    def set_mode_callback(self, request, response):
        """Switch robot mode"""
        mode_str = request.mode.upper()

        if mode_str not in [m.name for m in RobotMode]:
            response.success = False
            response.message = f'Invalid mode: {request.mode}'
            return response

        old_mode = self.mode
        self.mode = RobotMode[mode_str]

        self.get_logger().info(f'Mode changed: {old_mode.name} -> {self.mode.name}')

        response.success = True
        response.message = f'Switched to {self.mode.name} mode'
        return response
```

**Custom service (srv/SetMode.srv)**:
```
string mode  # "idle", "manual", "autonomous"
---
bool success
string message
```

**Test it:**
```bash
# Terminal 1: Turtlesim
ros2 run turtlesim turtlesim_node

# Terminal 2: Controller
python3 robot_controller.py

# Terminal 3: Switch modes
ros2 service call /set_mode my_robot_interfaces/srv/SetMode "{mode: 'autonomous'}"
ros2 service call /set_mode my_robot_interfaces/srv/SetMode "{mode: 'idle'}"
```

### Task 3: Teleoperation Interface

**teleop_interface.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from my_robot_interfaces.srv import SetMode
import sys
import termios
import tty

class TeleopInterface(Node):
    def __init__(self):
        super().__init__('teleop_interface')

        # Service clients
        self.mode_client = self.create_client(SetMode, 'set_mode')

        self.get_logger().info('Teleop Interface Started')
        self.print_instructions()

    def print_instructions(self):
        print('\n=== Robot Teleop Interface ===')
        print('1 - Idle mode')
        print('2 - Manual mode')
        print('3 - Autonomous mode')
        print('r - Reset controller')
        print('q - Quit')

    def get_key(self):
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setraw(fd)
            key = sys.stdin.read(1)
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        return key

    def set_mode(self, mode):
        """Call mode service"""
        if not self.mode_client.wait_for_service(timeout_sec=1.0):
            self.get_logger().error('Service not available')
            return

        request = SetMode.Request()
        request.mode = mode

        future = self.mode_client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=2.0)

        if future.result() is not None:
            response = future.result()
            if response.success:
                self.get_logger().info(response.message)
            else:
                self.get_logger().error(response.message)

def main():
    rclpy.init()
    teleop = TeleopInterface()

    try:
        while rclpy.ok():
            key = teleop.get_key()

            if key == '1':
                teleop.set_mode('idle')
            elif key == '2':
                teleop.set_mode('manual')
            elif key == '3':
                teleop.set_mode('autonomous')
            elif key == 'r':
                teleop.get_logger().info('Reset requested')
                # Call reset service here
            elif key == 'q':
                break

    except KeyboardInterrupt:
        pass
    finally:
        teleop.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Key Takeaways (Beginner)

✅ **Multi-mode controller** integrates topics, services, parameters
✅ **State machines** manage robot behavior
✅ **Service interfaces** enable external control
✅ **Teleoperation** provides user interaction

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner lab completed

### Lab Objectives

- Add action-based navigation
- Implement PID control with tunable parameters
- Create monitoring and diagnostics
- Handle emergency stops

### Task 4: Action-Based Waypoint Navigation

**Add to robot_controller.py**:
```python
from rclpy.action import ActionServer
from my_robot_interfaces.action import NavigateToWaypoint
import math

class RobotController(Node):
    def __init__(self):
        # ... (previous init)

        # Action server
        self._action_server = ActionServer(
            self,
            NavigateToWaypoint,
            'navigate_to_waypoint',
            self.execute_navigation
        )

        self.navigation_active = False

    def execute_navigation(self, goal_handle):
        """Execute waypoint navigation"""
        self.get_logger().info('Executing navigation goal')

        goal = goal_handle.request
        target_x = goal.target_x
        target_y = goal.target_y

        # Switch to autonomous mode
        self.mode = RobotMode.AUTONOMOUS
        self.navigation_active = True

        feedback_msg = NavigateToWaypoint.Feedback()

        try:
            while self.navigation_active:
                # Check for cancellation
                if goal_handle.is_cancel_requested:
                    goal_handle.canceled()
                    result = NavigateToWaypoint.Result()
                    result.success = False
                    result.message = 'Navigation canceled'
                    return result

                # Calculate distance to goal
                if self.current_pose is None:
                    time.sleep(0.1)
                    continue

                dx = target_x - self.current_pose.x
                dy = target_y - self.current_pose.y
                distance = math.sqrt(dx**2 + dy**2)

                # Check if reached
                if distance < 0.2:
                    goal_handle.succeed()
                    result = NavigateToWaypoint.Result()
                    result.success = True
                    result.final_distance = distance
                    result.message = 'Waypoint reached'
                    return result

                # Navigate
                desired_theta = math.atan2(dy, dx)
                angular_error = desired_theta - self.current_pose.theta
                angular_error = math.atan2(math.sin(angular_error), math.cos(angular_error))

                # Simple proportional control
                linear_vel = min(1.0 * distance, 2.0)
                angular_vel = 4.0 * angular_error

                self.publish_velocity(linear_vel, angular_vel)

                # Publish feedback
                feedback_msg.distance_remaining = distance
                goal_handle.publish_feedback(feedback_msg)

                time.sleep(0.1)

        finally:
            self.navigation_active = False
            self.mode = RobotMode.IDLE
            self.publish_velocity(0.0, 0.0)
```

### Task 5: PID Control with Parameters

**pid_controller.py**:
```python
class PIDController:
    def __init__(self, kp, ki, kd):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.integral = 0.0
        self.previous_error = 0.0

    def compute(self, error, dt):
        self.integral += error * dt
        derivative = (error - self.previous_error) / dt if dt > 0 else 0.0
        output = self.kp * error + self.ki * self.integral + self.kd * derivative
        self.previous_error = error
        return output

    def reset(self):
        self.integral = 0.0
        self.previous_error = 0.0

class RobotController(Node):
    def __init__(self):
        # ... (previous init)

        # PID parameters
        self.declare_parameter('pid.linear.kp', 1.5)
        self.declare_parameter('pid.linear.ki', 0.0)
        self.declare_parameter('pid.linear.kd', 0.5)
        self.declare_parameter('pid.angular.kp', 4.0)
        self.declare_parameter('pid.angular.ki', 0.1)
        self.declare_parameter('pid.angular.kd', 1.0)

        # Create PID controllers
        self.update_pid_controllers()

        # Parameter callback
        self.add_on_set_parameters_callback(self.parameter_callback)

    def update_pid_controllers(self):
        """Update PID controllers from parameters"""
        self.linear_pid = PIDController(
            self.get_parameter('pid.linear.kp').value,
            self.get_parameter('pid.linear.ki').value,
            self.get_parameter('pid.linear.kd').value
        )

        self.angular_pid = PIDController(
            self.get_parameter('pid.angular.kp').value,
            self.get_parameter('pid.angular.ki').value,
            self.get_parameter('pid.angular.kd').value
        )

    def parameter_callback(self, params):
        """React to parameter changes"""
        pid_changed = any('pid' in p.name for p in params)

        if pid_changed:
            self.get_logger().info('PID parameters updated')
            self.update_pid_controllers()

        return SetParametersResult(successful=True)
```

**Tune parameters live:**
```bash
ros2 param set /robot_controller pid.linear.kp 2.0
ros2 param set /robot_controller pid.angular.kp 5.0
```

### Task 6: Diagnostics and Monitoring

```python
from diagnostic_msgs.msg import DiagnosticArray, DiagnosticStatus

class RobotController(Node):
    def __init__(self):
        # ... (previous init)

        # Diagnostics
        self.diag_pub = self.create_publisher(
            DiagnosticArray, '/diagnostics', 10
        )

        self.create_timer(1.0, self.publish_diagnostics)

    def publish_diagnostics(self):
        """Publish system diagnostics"""
        diag_array = DiagnosticArray()
        diag_array.header.stamp = self.get_clock().now().to_msg()

        # Controller status
        controller_status = DiagnosticStatus()
        controller_status.name = 'Robot Controller'
        controller_status.hardware_id = 'controller_0'

        if self.mode == RobotMode.IDLE:
            controller_status.level = DiagnosticStatus.OK
            controller_status.message = 'Controller idle'
        elif self.navigation_active:
            controller_status.level = DiagnosticStatus.OK
            controller_status.message = 'Navigation active'
        else:
            controller_status.level = DiagnosticStatus.OK
            controller_status.message = f'Mode: {self.mode.name}'

        # Add key-value pairs
        from diagnostic_msgs.msg import KeyValue
        controller_status.values.append(
            KeyValue(key='mode', value=self.mode.name)
        )

        if self.current_pose:
            controller_status.values.append(
                KeyValue(key='x', value=str(self.current_pose.x))
            )
            controller_status.values.append(
                KeyValue(key='y', value=str(self.current_pose.y))
            )

        diag_array.status.append(controller_status)

        self.diag_pub.publish(diag_array)
```

### Key Takeaways (Intermediate)

✅ **Action servers** enable long-running navigation tasks
✅ **PID control** with tunable parameters
✅ **Diagnostics** provide system health monitoring
✅ **Dynamic reconfiguration** tunes behavior at runtime

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate lab completed

### Lab Objectives

- Production-grade controller architecture
- Fault detection and recovery
- Performance optimization
- Multi-robot coordination

### Task 7: Production Controller Architecture

**production_controller.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rclpy.executors import MultiThreadedExecutor
from rclpy.callback_groups import ReentrantCallbackGroup
import signal
import sys
import threading

class ProductionRobotController(Node):
    """Production-grade controller with:
    - Fault detection
    - Health monitoring
    - Graceful shutdown
    - Performance metrics
    """

    def __init__(self):
        super().__init__('production_controller')

        # Callback groups for concurrency
        self.control_group = ReentrantCallbackGroup()
        self.service_group = ReentrantCallbackGroup()

        # Initialize subsystems
        self.init_parameters()
        self.init_communication()
        self.init_monitoring()

        # Shutdown handler
        signal.signal(signal.SIGINT, self.signal_handler)

        self.get_logger().info('Production controller initialized')

    def init_parameters(self):
        """Initialize all parameters"""
        # Control parameters
        self.declare_parameter('control.max_linear_speed', 2.0)
        self.declare_parameter('control.max_angular_speed', 2.0)
        self.declare_parameter('control.update_rate', 20.0)

        # Safety parameters
        self.declare_parameter('safety.obstacle_distance_threshold', 0.5)
        self.declare_parameter('safety.emergency_stop_enabled', True)

        # Monitoring parameters
        self.declare_parameter('monitoring.watchdog_timeout', 5.0)
        self.declare_parameter('monitoring.diagnostics_rate', 1.0)

    def init_communication(self):
        """Initialize publishers, subscribers, services, actions"""
        # ... (implementation)
        pass

    def init_monitoring(self):
        """Initialize health monitoring"""
        # Watchdog timer
        self.last_pose_time = self.get_clock().now()
        self.create_timer(1.0, self.watchdog_callback)

        # Performance metrics
        self.control_loop_times = []
        self.control_loop_count = 0

    def watchdog_callback(self):
        """Monitor system health"""
        now = self.get_clock().now()
        timeout = self.get_parameter('monitoring.watchdog_timeout').value

        time_since_pose = (now - self.last_pose_time).nanoseconds / 1e9

        if time_since_pose > timeout:
            self.get_logger().error(
                f'Watchdog: No pose update for {time_since_pose:.1f}s'
            )
            self.emergency_stop()

    def emergency_stop(self):
        """Emergency stop procedure"""
        self.get_logger().warn('EMERGENCY STOP')
        self.publish_velocity(0.0, 0.0)
        self.mode = RobotMode.IDLE

    def signal_handler(self, sig, frame):
        """Graceful shutdown"""
        self.get_logger().info('Shutdown requested')
        self.cleanup()
        sys.exit(0)

    def cleanup(self):
        """Cleanup resources"""
        self.get_logger().info('Cleaning up...')
        self.publish_velocity(0.0, 0.0)

def main():
    rclpy.init()
    controller = ProductionRobotController()

    executor = MultiThreadedExecutor(num_threads=4)
    executor.add_node(controller)

    try:
        executor.spin()
    finally:
        controller.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Task 8: Performance Benchmarking

```python
import time
import statistics

class PerformanceMonitor:
    def __init__(self, node):
        self.node = node
        self.control_loop_times = []
        self.max_samples = 1000

    def measure_control_loop(self, callback):
        """Decorator to measure control loop performance"""
        def wrapper(*args, **kwargs):
            start = time.time()
            result = callback(*args, **kwargs)
            elapsed = (time.time() - start) * 1000  # ms

            self.control_loop_times.append(elapsed)

            if len(self.control_loop_times) > self.max_samples:
                self.control_loop_times.pop(0)

            return result

        return wrapper

    def get_statistics(self):
        """Get performance statistics"""
        if not self.control_loop_times:
            return {}

        return {
            'mean_ms': statistics.mean(self.control_loop_times),
            'std_ms': statistics.stdev(self.control_loop_times),
            'min_ms': min(self.control_loop_times),
            'max_ms': max(self.control_loop_times),
            'p95_ms': sorted(self.control_loop_times)[int(len(self.control_loop_times) * 0.95)]
        }
```

### Key Takeaways (Advanced)

✅ **Production architecture** includes fault detection, monitoring
✅ **Watchdogs** detect system failures
✅ **Graceful shutdown** cleans up resources properly
✅ **Performance monitoring** tracks control loop timing
✅ **Multi-threaded execution** handles concurrent operations

---

## Summary

**You've built a complete robot controller** integrating:
- Topics for continuous data
- Services for commands
- Actions for long-running tasks
- Parameters for configuration
- State machines for behavior
- Diagnostics for monitoring

**Next:** [Week 3: Building Packages →](../week3/09-packages.md)

---

## Additional Resources

- [ROS 2 Humble Documentation](https://docs.ros.org/en/humble/)
- [Topics vs Services vs Actions](https://docs.ros.org/en/humble/How-To-Guides/Topics-Services-Actions.html)
