---
sidebar_position: 6
---

# Actions

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Completed Services section

### Learning Objectives

- Understand the action communication pattern
- Differentiate between topics, services, and actions
- Create action servers in Python
- Send goals from action clients
- Process feedback and results
- Cancel goals mid-execution

### What are Actions?

**Actions** are for **long-running tasks** that provide:
- **Goal**: Initial request
- **Feedback**: Periodic progress updates
- **Result**: Final outcome
- **Cancellation**: Ability to abort mid-execution

**Real-world analogy:**
- **Action** = Pizza delivery order
- **Goal** = "Deliver pizza to address X"
- **Feedback** = "Driver is 5 minutes away", "Driver is 2 minutes away"
- **Result** = "Pizza delivered" or "Delivery failed"
- **Cancel** = "Cancel my order"

### Topics vs Services vs Actions

| Feature | Topics | Services | Actions |
|---------|--------|----------|---------|
| **Duration** | Continuous | Quick (< 1s) | Long (seconds to minutes) |
| **Pattern** | Pub/Sub | Request/Response | Goal/Feedback/Result |
| **Feedback** | None | None | Yes, periodic |
| **Cancellation** | N/A | No | Yes |
| **Example** | Camera stream | "Add two numbers" | "Navigate to waypoint" |

**When to use actions:**
- ✅ Navigation to a goal (takes seconds)
- ✅ Grasping an object (multi-step)
- ✅ Following a trajectory
- ✅ Processing large datasets
- ❌ Quick queries (use services)
- ❌ Continuous data (use topics)

### Action Structure

An action has three parts:

```
# Fibonacci.action

# Goal
int32 order
---
# Result
int32[] sequence
---
# Feedback
int32[] partial_sequence
```

### Standard Action Types

```bash
# List action types
ros2 interface list | grep action

# Common examples
ros2 interface show example_interfaces/action/Fibonacci
ros2 interface show action_tutorials_interfaces/action/Fibonacci
```

### Creating an Action Server

**fibonacci_action_server.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.action import ActionServer
from rclpy.node import Node
from example_interfaces.action import Fibonacci

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')

        # Create action server
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback
        )

        self.get_logger().info('Fibonacci Action Server started')

    def execute_callback(self, goal_handle):
        """Execute the Fibonacci action"""
        self.get_logger().info('Executing goal...')

        # Get goal request
        order = goal_handle.request.order

        # Initialize feedback message
        feedback_msg = Fibonacci.Feedback()
        feedback_msg.partial_sequence = [0, 1]

        # Compute Fibonacci sequence
        for i in range(1, order):
            # Check if goal has been canceled
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                self.get_logger().info('Goal canceled')
                return Fibonacci.Result()

            # Compute next Fibonacci number
            feedback_msg.partial_sequence.append(
                feedback_msg.partial_sequence[i] +
                feedback_msg.partial_sequence[i-1]
            )

            # Publish feedback
            self.get_logger().info(f'Feedback: {feedback_msg.partial_sequence}')
            goal_handle.publish_feedback(feedback_msg)

            # Simulate work
            import time
            time.sleep(1)

        # Mark goal as succeeded
        goal_handle.succeed()

        # Return result
        result = Fibonacci.Result()
        result.sequence = feedback_msg.partial_sequence
        self.get_logger().info(f'Result: {result.sequence}')

        return result

def main(args=None):
    rclpy.init(args=args)
    node = FibonacciActionServer()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Creating an Action Client

**fibonacci_action_client.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from example_interfaces.action import Fibonacci

class FibonacciActionClient(Node):
    def __init__(self):
        super().__init__('fibonacci_action_client')

        # Create action client
        self._action_client = ActionClient(
            self,
            Fibonacci,
            'fibonacci'
        )

    def send_goal(self, order):
        """Send goal to action server"""
        self.get_logger().info('Waiting for action server...')

        # Wait for server to be available
        self._action_client.wait_for_server()

        # Create goal message
        goal_msg = Fibonacci.Goal()
        goal_msg.order = order

        self.get_logger().info(f'Sending goal: order={order}')

        # Send goal with callbacks
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )

        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        """Called when server accepts/rejects goal"""
        goal_handle = future.result()

        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            return

        self.get_logger().info('Goal accepted')

        # Get result
        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def feedback_callback(self, feedback_msg):
        """Called when feedback is received"""
        feedback = feedback_msg.feedback
        self.get_logger().info(f'Feedback: {feedback.partial_sequence}')

    def get_result_callback(self, future):
        """Called when final result is received"""
        result = future.result().result
        self.get_logger().info(f'Result: {result.sequence}')

def main(args=None):
    rclpy.init(args=args)

    action_client = FibonacciActionClient()

    # Send goal
    action_client.send_goal(order=10)

    # Spin to process callbacks
    rclpy.spin(action_client)

    action_client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Run it:**

```bash
# Terminal 1: Start server
python3 fibonacci_action_server.py

# Terminal 2: Start client
python3 fibonacci_action_client.py
```

### Action Introspection (CLI)

```bash
# List active actions
ros2 action list

# Get action info
ros2 action info /fibonacci

# Send goal from CLI
ros2 action send_goal /fibonacci example_interfaces/action/Fibonacci "{order: 5}"

# Send goal and show feedback
ros2 action send_goal /fibonacci example_interfaces/action/Fibonacci "{order: 10}" --feedback
```

### Canceling Actions

**cancel_example.py**:
```python
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from example_interfaces.action import Fibonacci
import time

class CancelExample(Node):
    def __init__(self):
        super().__init__('cancel_example')
        self._action_client = ActionClient(self, Fibonacci, 'fibonacci')

    def send_and_cancel(self):
        """Send goal then cancel after 3 seconds"""
        self._action_client.wait_for_server()

        goal_msg = Fibonacci.Goal()
        goal_msg.order = 20  # Long-running goal

        # Send goal
        send_goal_future = self._action_client.send_goal_async(goal_msg)
        rclpy.spin_until_future_complete(self, send_goal_future)

        goal_handle = send_goal_future.result()

        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            return

        self.get_logger().info('Goal accepted, will cancel in 3 seconds...')

        # Wait 3 seconds
        time.sleep(3)

        # Cancel goal
        self.get_logger().info('Canceling goal...')
        cancel_future = goal_handle.cancel_goal_async()
        rclpy.spin_until_future_complete(self, cancel_future)

        cancel_response = cancel_future.result()
        if cancel_response.return_code == 0:
            self.get_logger().info('Goal successfully canceled')
        else:
            self.get_logger().info('Goal failed to cancel')

def main():
    rclpy.init()
    node = CancelExample()
    node.send_and_cancel()
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Key Takeaways (Beginner)

✅ **Actions** are for long-running tasks with feedback
✅ **Goal/Feedback/Result** provides progress tracking
✅ **Cancellation** allows aborting mid-execution
✅ **Action servers** execute goals asynchronously
✅ **Action clients** send goals and process feedback
✅ Use actions when tasks take > 1 second

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Create custom action definitions
- Implement advanced feedback patterns
- Handle multiple concurrent goals
- Implement action state management
- Optimize action server performance

### Creating Custom Actions

**srv/NavigateToWaypoint.action**:
```
# Goal
geometry_msgs/Point target_position
float32 max_speed
---
# Result
bool success
float32 final_distance_error
float32 total_time
string message
---
# Feedback
geometry_msgs/Point current_position
float32 distance_remaining
float32 estimated_time_remaining
float32 current_speed
```

**srv/ProcessImage.action**:
```
# Goal
sensor_msgs/Image image
string processing_mode  # "blur", "edge_detection", "segmentation"
---
# Result
sensor_msgs/Image processed_image
bool success
string message
---
# Feedback
float32 progress_percentage
string current_stage
```

### Advanced Action Server

**navigation_action_server.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.action import ActionServer, GoalResponse, CancelResponse
from rclpy.node import Node
from my_robot_interfaces.action import NavigateToWaypoint
import math
import time

class NavigationActionServer(Node):
    def __init__(self):
        super().__init__('navigation_action_server')

        self._action_server = ActionServer(
            self,
            NavigateToWaypoint,
            'navigate_to_waypoint',
            execute_callback=self.execute_callback,
            goal_callback=self.goal_callback,
            cancel_callback=self.cancel_callback
        )

        self.current_position = {'x': 0.0, 'y': 0.0, 'z': 0.0}

        self.get_logger().info('Navigation Action Server ready')

    def goal_callback(self, goal_request):
        """Accept or reject incoming goals"""
        # Validate goal
        target = goal_request.target_position

        # Reject if target is out of bounds
        if abs(target.x) > 100 or abs(target.y) > 100:
            self.get_logger().info('Goal rejected: out of bounds')
            return GoalResponse.REJECT

        self.get_logger().info('Goal accepted')
        return GoalResponse.ACCEPT

    def cancel_callback(self, goal_handle):
        """Accept or reject cancellation requests"""
        self.get_logger().info('Received cancel request')
        return CancelResponse.ACCEPT

    def execute_callback(self, goal_handle):
        """Execute navigation to waypoint"""
        self.get_logger().info('Executing navigation goal...')

        # Get goal
        goal = goal_handle.request
        target_x = goal.target_position.x
        target_y = goal.target_position.y
        max_speed = goal.max_speed

        # Initialize feedback
        feedback_msg = NavigateToWaypoint.Feedback()

        start_time = time.time()

        # Simulate navigation
        while True:
            # Check for cancellation
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                result = NavigateToWaypoint.Result()
                result.success = False
                result.message = 'Navigation canceled'
                return result

            # Calculate distance to target
            dx = target_x - self.current_position['x']
            dy = target_y - self.current_position['y']
            distance = math.sqrt(dx**2 + dy**2)

            # Check if reached target
            if distance < 0.1:
                goal_handle.succeed()
                result = NavigateToWaypoint.Result()
                result.success = True
                result.final_distance_error = distance
                result.total_time = time.time() - start_time
                result.message = 'Waypoint reached'
                self.get_logger().info('Waypoint reached!')
                return result

            # Move towards target (simple proportional control)
            speed = min(max_speed, distance)
            step = speed * 0.1  # dt = 0.1

            # Update position
            angle = math.atan2(dy, dx)
            self.current_position['x'] += step * math.cos(angle)
            self.current_position['y'] += step * math.sin(angle)

            # Publish feedback
            feedback_msg.current_position.x = self.current_position['x']
            feedback_msg.current_position.y = self.current_position['y']
            feedback_msg.distance_remaining = distance
            feedback_msg.current_speed = speed
            feedback_msg.estimated_time_remaining = distance / speed

            goal_handle.publish_feedback(feedback_msg)

            self.get_logger().info(
                f'Distance remaining: {distance:.2f}m',
                throttle_duration_sec=1.0
            )

            time.sleep(0.1)

def main(args=None):
    rclpy.init(args=args)
    node = NavigationActionServer()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Multiple Concurrent Goals

**multi_goal_server.py**:
```python
from rclpy.action import ActionServer
from rclpy.executors import MultiThreadedExecutor
from rclpy.callback_groups import ReentrantCallbackGroup

class MultiGoalActionServer(Node):
    def __init__(self):
        super().__init__('multi_goal_server')

        # Use reentrant callback group to handle multiple goals concurrently
        callback_group = ReentrantCallbackGroup()

        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci_multi',
            execute_callback=self.execute_callback,
            callback_group=callback_group,
            goal_callback=self.goal_callback
        )

        self.active_goals = 0
        self.max_concurrent_goals = 3

    def goal_callback(self, goal_request):
        """Limit concurrent goals"""
        if self.active_goals >= self.max_concurrent_goals:
            self.get_logger().info(
                f'Rejecting goal: already processing {self.active_goals} goals'
            )
            return GoalResponse.REJECT

        self.active_goals += 1
        self.get_logger().info(f'Accepting goal (active: {self.active_goals})')
        return GoalResponse.ACCEPT

    def execute_callback(self, goal_handle):
        """Execute with tracking"""
        try:
            # Execute goal...
            result = self.process_goal(goal_handle)
            return result
        finally:
            self.active_goals -= 1
            self.get_logger().info(f'Goal completed (active: {self.active_goals})')

def main():
    rclpy.init()
    node = MultiGoalActionServer()

    # Use multi-threaded executor
    executor = MultiThreadedExecutor(num_threads=4)
    executor.add_node(node)

    try:
        executor.spin()
    finally:
        node.destroy_node()
        rclpy.shutdown()
```

### Action Client with State Tracking

**stateful_action_client.py**:
```python
from enum import Enum

class ActionState(Enum):
    IDLE = 0
    SENDING_GOAL = 1
    GOAL_ACTIVE = 2
    GOAL_SUCCEEDED = 3
    GOAL_ABORTED = 4
    GOAL_CANCELED = 5

class StatefulActionClient(Node):
    def __init__(self):
        super().__init__('stateful_action_client')

        self._action_client = ActionClient(self, NavigateToWaypoint, 'navigate')
        self.state = ActionState.IDLE
        self._goal_handle = None

    def send_goal(self, x, y, max_speed=1.0):
        """Send goal with state management"""
        if self.state != ActionState.IDLE:
            self.get_logger().warn(f'Cannot send goal: state is {self.state}')
            return False

        self.state = ActionState.SENDING_GOAL
        self._action_client.wait_for_server()

        goal_msg = NavigateToWaypoint.Goal()
        goal_msg.target_position.x = x
        goal_msg.target_position.y = y
        goal_msg.max_speed = max_speed

        send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )
        send_goal_future.add_done_callback(self.goal_response_callback)

        return True

    def goal_response_callback(self, future):
        """Handle goal acceptance/rejection"""
        goal_handle = future.result()

        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected')
            self.state = ActionState.GOAL_ABORTED
            return

        self.get_logger().info('Goal accepted')
        self.state = ActionState.GOAL_ACTIVE
        self._goal_handle = goal_handle

        get_result_future = goal_handle.get_result_async()
        get_result_future.add_done_callback(self.get_result_callback)

    def feedback_callback(self, feedback_msg):
        """Process feedback"""
        if self.state != ActionState.GOAL_ACTIVE:
            return

        feedback = feedback_msg.feedback
        self.get_logger().info(
            f'Distance remaining: {feedback.distance_remaining:.2f}m'
        )

    def get_result_callback(self, future):
        """Handle final result"""
        result = future.result().result
        status = future.result().status

        if status == 4:  # SUCCEEDED
            self.state = ActionState.GOAL_SUCCEEDED
            self.get_logger().info(f'Goal succeeded: {result.message}')
        elif status == 5:  # CANCELED
            self.state = ActionState.GOAL_CANCELED
            self.get_logger().info('Goal was canceled')
        else:
            self.state = ActionState.GOAL_ABORTED
            self.get_logger().info('Goal aborted')

        self._goal_handle = None

    def cancel_current_goal(self):
        """Cancel active goal"""
        if self.state != ActionState.GOAL_ACTIVE or self._goal_handle is None:
            self.get_logger().warn('No active goal to cancel')
            return

        self.get_logger().info('Canceling goal...')
        cancel_future = self._goal_handle.cancel_goal_async()
        cancel_future.add_done_callback(self.cancel_done)

    def cancel_done(self, future):
        """Handle cancel response"""
        cancel_response = future.result()
        if cancel_response.return_code == 0:
            self.get_logger().info('Cancel request accepted')
```

### Key Takeaways (Intermediate)

✅ **Custom actions** defined in .action files with Goal/Result/Feedback
✅ **Goal callbacks** can accept or reject goals
✅ **Cancel callbacks** enable graceful cancellation
✅ **Concurrent goals** require reentrant callback groups
✅ **State management** tracks action lifecycle

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement production-grade action servers
- Optimize action performance
- Handle complex cancellation scenarios
- Design action-based architectures
- Profile and benchmark action latency

### Production Action Server Pattern

```python
import rclpy
from rclpy.action import ActionServer, GoalResponse, CancelResponse
from rclpy.node import Node
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.executors import MultiThreadedExecutor
import threading
import time

class ProductionActionServer(Node):
    """Production-grade action server with:
    - Concurrent goal handling
    - Resource management
    - Performance monitoring
    - Graceful shutdown
    """

    def __init__(self):
        super().__init__('production_action_server')

        callback_group = ReentrantCallbackGroup()

        self._action_server = ActionServer(
            self,
            NavigateToWaypoint,
            'navigate',
            execute_callback=self.execute_callback,
            goal_callback=self.goal_callback,
            cancel_callback=self.cancel_callback,
            callback_group=callback_group
        )

        # Resource tracking
        self.active_goals = {}
        self.goals_lock = threading.Lock()
        self.max_concurrent_goals = 5

        # Performance metrics
        self.total_goals_processed = 0
        self.successful_goals = 0
        self.canceled_goals = 0
        self.failed_goals = 0

        # Monitoring
        self.create_timer(10.0, self.log_statistics)

        self.get_logger().info('Production action server started')

    def goal_callback(self, goal_request):
        """Validate and accept/reject goals"""
        with self.goals_lock:
            # Check resource limits
            if len(self.active_goals) >= self.max_concurrent_goals:
                self.get_logger().warn(
                    f'Rejecting goal: {len(self.active_goals)} active goals'
                )
                return GoalResponse.REJECT

            # Validate goal parameters
            if not self.validate_goal(goal_request):
                return GoalResponse.REJECT

            return GoalResponse.ACCEPT

    def validate_goal(self, goal):
        """Validate goal parameters"""
        # Check bounds
        if abs(goal.target_position.x) > 1000:
            self.get_logger().warn('Goal rejected: x out of bounds')
            return False

        if abs(goal.target_position.y) > 1000:
            self.get_logger().warn('Goal rejected: y out of bounds')
            return False

        # Check speed limits
        if goal.max_speed <= 0 or goal.max_speed > 10.0:
            self.get_logger().warn('Goal rejected: invalid speed')
            return False

        return True

    def cancel_callback(self, goal_handle):
        """Handle cancellation requests"""
        goal_id = str(goal_handle.goal_id)

        with self.goals_lock:
            if goal_id in self.active_goals:
                self.get_logger().info(f'Accepting cancel for goal {goal_id[:8]}')
                return CancelResponse.ACCEPT

        return CancelResponse.REJECT

    def execute_callback(self, goal_handle):
        """Execute goal with full error handling"""
        goal_id = str(goal_handle.goal_id)
        start_time = time.time()

        # Register goal
        with self.goals_lock:
            self.active_goals[goal_id] = {
                'start_time': start_time,
                'goal': goal_handle.request
            }

        try:
            # Execute navigation
            result = self.navigate_to_waypoint(goal_handle)

            # Update statistics
            with self.goals_lock:
                self.total_goals_processed += 1

                if goal_handle.is_cancel_requested:
                    self.canceled_goals += 1
                elif result.success:
                    self.successful_goals += 1
                else:
                    self.failed_goals += 1

            return result

        except Exception as e:
            self.get_logger().error(f'Exception during goal execution: {e}')

            with self.goals_lock:
                self.total_goals_processed += 1
                self.failed_goals += 1

            goal_handle.abort()

            result = NavigateToWaypoint.Result()
            result.success = False
            result.message = f'Exception: {str(e)}'
            return result

        finally:
            # Cleanup
            with self.goals_lock:
                if goal_id in self.active_goals:
                    del self.active_goals[goal_id]

            execution_time = time.time() - start_time
            self.get_logger().info(
                f'Goal {goal_id[:8]} completed in {execution_time:.2f}s'
            )

    def navigate_to_waypoint(self, goal_handle):
        """Navigation implementation with feedback"""
        # Implementation here...
        pass

    def log_statistics(self):
        """Log server statistics"""
        with self.goals_lock:
            self.get_logger().info(
                f'Stats: {self.total_goals_processed} total, '
                f'{self.successful_goals} succeeded, '
                f'{self.failed_goals} failed, '
                f'{self.canceled_goals} canceled, '
                f'{len(self.active_goals)} active'
            )

def main():
    rclpy.init()
    server = ProductionActionServer()

    executor = MultiThreadedExecutor(num_threads=8)
    executor.add_node(server)

    try:
        executor.spin()
    finally:
        server.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Action Chaining Pattern

```python
class ActionChainExecutor(Node):
    """Execute multiple actions in sequence"""

    def __init__(self):
        super().__init__('action_chain_executor')

        # Create clients for different actions
        self.nav_client = ActionClient(self, NavigateToWaypoint, 'navigate')
        self.grasp_client = ActionClient(self, Grasp, 'grasp')
        self.place_client = ActionClient(self, Place, 'place')

    async def execute_pick_and_place(self, pick_location, place_location):
        """Chain multiple actions together"""
        try:
            # Step 1: Navigate to pick location
            self.get_logger().info('Step 1: Navigating to pick location')
            nav_result = await self.navigate_async(pick_location)

            if not nav_result.success:
                raise Exception('Navigation to pick failed')

            # Step 2: Grasp object
            self.get_logger().info('Step 2: Grasping object')
            grasp_result = await self.grasp_async()

            if not grasp_result.success:
                raise Exception('Grasp failed')

            # Step 3: Navigate to place location
            self.get_logger().info('Step 3: Navigating to place location')
            nav_result = await self.navigate_async(place_location)

            if not nav_result.success:
                raise Exception('Navigation to place failed')

            # Step 4: Place object
            self.get_logger().info('Step 4: Placing object')
            place_result = await self.place_async()

            if not place_result.success:
                raise Exception('Place failed')

            self.get_logger().info('Pick and place completed successfully!')
            return True

        except Exception as e:
            self.get_logger().error(f'Pick and place failed: {e}')
            return False

    async def navigate_async(self, location):
        """Async navigation"""
        goal = NavigateToWaypoint.Goal()
        goal.target_position = location

        send_goal_future = self.nav_client.send_goal_async(goal)
        goal_handle = await send_goal_future

        if not goal_handle.accepted:
            raise Exception('Navigation goal rejected')

        result_future = goal_handle.get_result_async()
        result = await result_future

        return result.result
```

### Key Takeaways (Advanced)

✅ **Production servers** handle concurrency, validation, error recovery
✅ **Resource management** limits concurrent goals
✅ **Performance metrics** track success/failure rates
✅ **Action chaining** sequences complex behaviors
✅ **Graceful shutdown** cleans up active goals

---

## Additional Resources

- [Writing Action Server and Client (Python)](https://docs.ros.org/en/humble/Tutorials/Intermediate/Writing-an-Action-Server-Client/Py.html)
- [Understanding Actions](https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Actions/Understanding-ROS2-Actions.html)
- [Creating an Action](https://docs.ros.org/en/humble/Tutorials/Intermediate/Creating-an-Action.html)
- [Creating ROS 2 Actions - Foxglove](https://foxglove.dev/blog/creating-ros2-actions)

---

**Next:** [Parameters →](./07-parameters.md)
