---
sidebar_position: 2
---

# Nodes & Topics

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Completed ROS 2 Architecture section

### Learning Objectives

- Understand what ROS 2 nodes are and why they're used
- Create your first Python node using rclpy
- Work with topics for inter-node communication
- Use ROS 2 CLI tools to introspect running systems
- Implement basic timer-based callbacks

### What is a Node?

A **node** is a single executable process that performs a specific computation or task in your robot system.

**Key characteristics:**
- Runs independently as its own process
- Communicates with other nodes via topics, services, or actions
- Can be started, stopped, or crashed without affecting other nodes
- Performs one primary responsibility (Single Responsibility Principle)

**Example system architecture:**
```
Robot System
├── camera_node          (captures images)
├── object_detector_node (runs ML model)
├── path_planner_node    (plans trajectory)
└── motor_controller_node (commands motors)
```

### Your First ROS 2 Node

Create a file `my_first_node.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        # Initialize the node with a name
        super().__init__('minimal_node')

        # Log a message
        self.get_logger().info('Minimal node has been started!')

def main(args=None):
    # Initialize ROS 2 communication
    rclpy.init(args=args)

    # Create node instance
    node = MinimalNode()

    # Keep the node running (process callbacks)
    rclpy.spin(node)

    # Cleanup
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Make it executable:**
```bash
chmod +x my_first_node.py
python3 my_first_node.py
```

**Output:**
```
[INFO] [minimal_node]: Minimal node has been started!
```

**What just happened?**
1. `rclpy.init()` - Initialize ROS 2 Python client library
2. `Node('minimal_node')` - Create a node with name `minimal_node`
3. `get_logger().info()` - Log a message (appears in terminal and `/rosout` topic)
4. `rclpy.spin()` - Block and process callbacks (keeps node alive)
5. `destroy_node()` and `shutdown()` - Clean up resources

### Node Introspection with CLI

While your node is running, open another terminal:

```bash
# List all running nodes
ros2 node list
# Output: /minimal_node

# Get detailed info about a node
ros2 node info /minimal_node
# Shows: subscribers, publishers, services, actions

# Call a node's service
ros2 service list  # See available services
```

### Understanding Topics

A **topic** is a named bus over which nodes exchange messages. It implements the **publish-subscribe pattern**.

**Key characteristics:**
- Named channel (e.g., `/camera/image`, `/cmd_vel`)
- Anonymous: publishers and subscribers don't know about each other
- Many-to-many: multiple publishers, multiple subscribers
- Asynchronous: no waiting for responses

**Analogy**: Radio broadcast
- Topic = Radio frequency (e.g., 101.5 FM)
- Publisher = Radio station transmitting
- Subscriber = Car radio receiving
- Message = Audio signal

### Publishing to a Topic

Create `simple_publisher.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SimplePublisher(Node):
    def __init__(self):
        super().__init__('simple_publisher')

        # Create a publisher
        # Parameters: message_type, topic_name, queue_size
        self.publisher = self.create_publisher(String, 'chatter', 10)

        # Create a timer to publish at 1 Hz (every 1 second)
        self.timer = self.create_timer(1.0, self.timer_callback)

        self.counter = 0
        self.get_logger().info('Publisher node started')

    def timer_callback(self):
        """Called every second by the timer"""
        msg = String()
        msg.data = f'Hello, ROS 2! Count: {self.counter}'

        # Publish the message
        self.publisher.publish(msg)

        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.counter += 1

def main(args=None):
    rclpy.init(args=args)
    node = SimplePublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Run it:**
```bash
python3 simple_publisher.py
```

**Output:**
```
[INFO] [simple_publisher]: Publisher node started
[INFO] [simple_publisher]: Publishing: "Hello, ROS 2! Count: 0"
[INFO] [simple_publisher]: Publishing: "Hello, ROS 2! Count: 1"
[INFO] [simple_publisher]: Publishing: "Hello, ROS 2! Count: 2"
...
```

### Subscribing to a Topic

Create `simple_subscriber.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SimpleSubscriber(Node):
    def __init__(self):
        super().__init__('simple_subscriber')

        # Create a subscription
        # Parameters: message_type, topic_name, callback_function, queue_size
        self.subscription = self.create_subscription(
            String,
            'chatter',
            self.listener_callback,
            10
        )

        self.get_logger().info('Subscriber node started')

    def listener_callback(self, msg):
        """Called whenever a message is received"""
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    node = SimpleSubscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Test pub-sub system:**

```bash
# Terminal 1: Publisher
python3 simple_publisher.py

# Terminal 2: Subscriber
python3 simple_subscriber.py
# Output: [INFO] [simple_subscriber]: I heard: "Hello, ROS 2! Count: 0"
```

### Topic Introspection

```bash
# List all active topics
ros2 topic list
# Output: /chatter, /parameter_events, /rosout

# Show topic info
ros2 topic info /chatter
# Output:
#   Type: std_msgs/msg/String
#   Publisher count: 1
#   Subscription count: 1

# Echo messages (see live data)
ros2 topic echo /chatter

# Check publishing frequency
ros2 topic hz /chatter
# Output: average rate: 1.000

# Publish from command line
ros2 topic pub /chatter std_msgs/msg/String "data: 'Hello from CLI!'"
```

### Message Types

Common standard messages:

```python
from std_msgs.msg import String, Int32, Float64, Bool
from geometry_msgs.msg import Twist, Pose, Point
from sensor_msgs.msg import Image, LaserScan, Imu

# String message
msg = String()
msg.data = "Hello"

# Integer message
msg = Int32()
msg.data = 42

# Twist (velocity command)
from geometry_msgs.msg import Twist
cmd = Twist()
cmd.linear.x = 0.5    # Forward velocity (m/s)
cmd.linear.y = 0.0    # Sideways velocity
cmd.linear.z = 0.0    # Up velocity
cmd.angular.x = 0.0   # Roll rate (rad/s)
cmd.angular.y = 0.0   # Pitch rate
cmd.angular.z = 0.2   # Yaw rate (turning)
```

**See message structure:**
```bash
ros2 interface show std_msgs/msg/String
ros2 interface show geometry_msgs/msg/Twist
```

### Practical Exercise

**Exercise 1: Counter System**

Create two nodes:
1. **Publisher**: Counts from 1 to 100, publishing every 0.5 seconds
2. **Subscriber**: Logs when count reaches multiples of 10

**Exercise 2: Temperature Monitor**

Create a publisher that simulates temperature readings (random values 20-30°C) and a subscriber that logs warnings when temperature > 28°C.

### Key Takeaways (Beginner)

✅ **Nodes** are independent processes performing specific tasks
✅ **Topics** enable asynchronous, many-to-many communication
✅ **Publishers** send messages, **subscribers** receive them
✅ **Timers** trigger periodic callbacks
✅ **rclpy.spin()** keeps the node alive to process callbacks
✅ Use `ros2 node` and `ros2 topic` CLI tools for introspection

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Implement lifecycle (managed) nodes
- Use executors for multi-threaded callback processing
- Configure callback groups for parallel execution
- Implement node composition
- Handle topic remapping and namespaces
- Create custom parameter-based node configurations

### Lifecycle Nodes

**Managed nodes** (LifecycleNodes) have a state machine with controlled transitions, providing finer-grained control over system startup and shutdown.

#### The Four Primary States

```
┌─────────────┐
│ Unconfigured│ ◄─── Initial state
└──────┬──────┘
       │ configure()
       ▼
┌─────────────┐
│  Inactive   │ ◄─── Resources allocated, not active
└──────┬──────┘
       │ activate()
       ▼
┌─────────────┐
│   Active    │ ◄─── Fully operational
└──────┬──────┘
       │ deactivate()
       ▼
┌─────────────┐
│  Inactive   │
└──────┬──────┘
       │ cleanup() / shutdown()
       ▼
┌─────────────┐
│  Finalized  │ ◄─── Cleaned up, ready to destroy
└─────────────┘
```

#### Creating a Lifecycle Node

```python
#!/usr/bin/env python3
import rclpy
from rclpy.lifecycle import Node, State, TransitionCallbackReturn
from std_msgs.msg import String

class LifecyclePublisher(Node):
    def __init__(self, node_name='lifecycle_publisher'):
        super().__init__(node_name)
        self.publisher = None
        self.timer = None

    def on_configure(self, state: State) -> TransitionCallbackReturn:
        """Transition: Unconfigured → Inactive"""
        self.get_logger().info('on_configure() called')

        # Create publisher (but don't activate yet)
        self.publisher = self.create_lifecycle_publisher(String, 'lifecycle_chatter', 10)

        # Create timer (won't start until activated)
        self.timer = self.create_timer(1.0, self.timer_callback)

        return TransitionCallbackReturn.SUCCESS

    def on_activate(self, state: State) -> TransitionCallbackReturn:
        """Transition: Inactive → Active"""
        self.get_logger().info('on_activate() called - Starting publishing')

        # Activate the publisher
        self.publisher.on_activate(state)

        return TransitionCallbackReturn.SUCCESS

    def on_deactivate(self, state: State) -> TransitionCallbackReturn:
        """Transition: Active → Inactive"""
        self.get_logger().info('on_deactivate() called - Stopping publishing')

        # Deactivate the publisher
        self.publisher.on_deactivate(state)

        return TransitionCallbackReturn.SUCCESS

    def on_cleanup(self, state: State) -> TransitionCallbackReturn:
        """Transition: Inactive → Unconfigured"""
        self.get_logger().info('on_cleanup() called')

        # Destroy resources
        self.destroy_timer(self.timer)
        self.destroy_publisher(self.publisher)

        return TransitionCallbackReturn.SUCCESS

    def on_shutdown(self, state: State) -> TransitionCallbackReturn:
        """Transition: Any → Finalized"""
        self.get_logger().info('on_shutdown() called')

        # Emergency cleanup
        if self.timer:
            self.destroy_timer(self.timer)
        if self.publisher:
            self.destroy_publisher(self.publisher)

        return TransitionCallbackReturn.SUCCESS

    def timer_callback(self):
        if self.publisher.is_activated():
            msg = String()
            msg.data = f'Lifecycle message at {self.get_clock().now().nanoseconds}'
            self.publisher.publish(msg)
            self.get_logger().info(f'Publishing: {msg.data}')

def main(args=None):
    rclpy.init(args=args)
    node = LifecyclePublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Control lifecycle state:**

```bash
# Terminal 1: Run the lifecycle node
python3 lifecycle_publisher.py

# Terminal 2: Trigger transitions
ros2 lifecycle list  # Shows /lifecycle_publisher

# Get current state
ros2 lifecycle get /lifecycle_publisher

# Transition to Inactive (configure)
ros2 lifecycle set /lifecycle_publisher configure

# Transition to Active (activate)
ros2 lifecycle set /lifecycle_publisher activate
# Now it starts publishing!

# Transition to Inactive (deactivate)
ros2 lifecycle set /lifecycle_publisher deactivate
# Stops publishing

# Clean up
ros2 lifecycle set /lifecycle_publisher cleanup
```

**Use case:** Coordinated multi-node startup - ensure all sensors are configured before starting navigation.

### Executors and Callback Groups

By default, ROS 2 uses a **single-threaded executor** - all callbacks run sequentially on one thread.

#### Multi-Threaded Executor

```python
import rclpy
from rclpy.node import Node
from rclpy.executors import MultiThreadedExecutor
from std_msgs.msg import String
import time

class ParallelNode(Node):
    def __init__(self):
        super().__init__('parallel_node')

        # Two subscriptions
        self.sub1 = self.create_subscription(String, 'topic1', self.callback1, 10)
        self.sub2 = self.create_subscription(String, 'topic2', self.callback2, 10)

    def callback1(self, msg):
        self.get_logger().info('Callback 1 started')
        time.sleep(2)  # Simulate slow processing
        self.get_logger().info('Callback 1 finished')

    def callback2(self, msg):
        self.get_logger().info('Callback 2 started')
        time.sleep(2)
        self.get_logger().info('Callback 2 finished')

def main():
    rclpy.init()
    node = ParallelNode()

    # Use multi-threaded executor (4 threads)
    executor = MultiThreadedExecutor(num_threads=4)
    executor.add_node(node)

    try:
        executor.spin()
    finally:
        executor.shutdown()
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**With single-threaded executor**: Callback2 waits for Callback1 (4 seconds total)
**With multi-threaded executor**: Both run in parallel (2 seconds total)

#### Callback Groups

Control which callbacks can run in parallel:

```python
from rclpy.callback_groups import MutuallyExclusiveCallbackGroup, ReentrantCallbackGroup

class AdvancedNode(Node):
    def __init__(self):
        super().__init__('advanced_node')

        # Mutually exclusive: callbacks cannot run in parallel
        group1 = MutuallyExclusiveCallbackGroup()

        # Reentrant: callbacks can run in parallel
        group2 = ReentrantCallbackGroup()

        # Timer in group1 (exclusive with other group1 callbacks)
        self.timer1 = self.create_timer(1.0, self.timer1_callback, callback_group=group1)

        # Timer in group2 (can run in parallel with other group2 callbacks)
        self.timer2 = self.create_timer(1.0, self.timer2_callback, callback_group=group2)

        # Subscription in group2 (can run in parallel with timer2)
        self.sub = self.create_subscription(
            String, 'data', self.sub_callback,
            10, callback_group=group2
        )

    def timer1_callback(self):
        pass

    def timer2_callback(self):
        pass

    def sub_callback(self, msg):
        pass
```

### Node Composition

**Node composition** loads multiple nodes into a single process, reducing overhead.

#### Component Node

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class TalkerComponent(Node):
    def __init__(self):
        super().__init__('talker_component')
        self.publisher = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello from component!'
        self.publisher.publish(msg)

class ListenerComponent(Node):
    def __init__(self):
        super().__init__('listener_component')
        self.subscription = self.create_subscription(
            String, 'chatter', self.callback, 10
        )

    def callback(self, msg):
        self.get_logger().info(f'Heard: {msg.data}')

def main(args=None):
    rclpy.init(args=args)

    # Single process, multiple nodes
    executor = rclpy.executors.SingleThreadedExecutor()

    talker = TalkerComponent()
    listener = ListenerComponent()

    executor.add_node(talker)
    executor.add_node(listener)

    try:
        executor.spin()
    finally:
        executor.shutdown()
        talker.destroy_node()
        listener.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Benefits:**
- Lower latency (intra-process communication)
- Reduced memory usage
- Easier debugging (single process)

### Topic Remapping and Namespaces

#### Remapping Topics at Runtime

```bash
# Remap /cmd_vel to /robot1/cmd_vel
ros2 run my_package teleop_node --ros-args -r cmd_vel:=robot1/cmd_vel

# Remap multiple topics
ros2 run my_package my_node \
  --ros-args \
  -r old_topic:=new_topic \
  -r /global_topic:=/remapped_global
```

#### Namespaces

```bash
# Run node in /robot1 namespace
ros2 run turtlesim turtlesim_node --ros-args -r __ns:=/robot1

# All topics are prefixed: /robot1/turtle1/cmd_vel
```

**In Python:**
```python
class NamespacedNode(Node):
    def __init__(self):
        super().__init__('my_node', namespace='robot1')

        # Topic will be /robot1/chatter
        self.pub = self.create_publisher(String, 'chatter', 10)
```

### Parameters in Nodes

```python
from rclpy.node import Node
from rcl_interfaces.msg import ParameterDescriptor

class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # Declare parameters with defaults
        self.declare_parameter('max_speed', 1.0,
            ParameterDescriptor(description='Maximum robot speed (m/s)'))
        self.declare_parameter('robot_name', 'robot1')
        self.declare_parameter('enable_safety', True)

        # Get parameter values
        max_speed = self.get_parameter('max_speed').value
        robot_name = self.get_parameter('robot_name').value

        self.get_logger().info(f'Robot {robot_name} max speed: {max_speed}')

        # Parameter callback (called when parameters change)
        self.add_on_set_parameters_callback(self.parameter_callback)

    def parameter_callback(self, params):
        for param in params:
            if param.name == 'max_speed' and param.value > 2.0:
                self.get_logger().warn('Speed too high! Clamping to 2.0')
                return False  # Reject change
        return True  # Accept change
```

**Set parameters at runtime:**
```bash
# Set parameter
ros2 param set /parameter_node max_speed 1.5

# Get parameter
ros2 param get /parameter_node max_speed

# List all parameters
ros2 param list
```

### Key Takeaways (Intermediate)

✅ **Lifecycle nodes** provide controlled state transitions
✅ **Multi-threaded executors** enable parallel callback processing
✅ **Callback groups** control callback concurrency
✅ **Node composition** reduces overhead by running multiple nodes in one process
✅ **Topic remapping** and **namespaces** enable flexible deployment
✅ **Parameters** allow runtime configuration

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement zero-copy intra-process communication
- Create custom executors for deterministic execution
- Optimize memory management and resource cleanup
- Design real-time-safe callbacks
- Implement production-grade error handling
- Profile and benchmark node performance

### Zero-Copy Intra-Process Communication

When multiple nodes run in the same process (composition), ROS 2 can avoid copying message data.

#### Enabling Zero-Copy

```python
from rclpy.node import Node
from rclpy.qos import QoSProfile
from std_msgs.msg import String

class ZeroCopyPublisher(Node):
    def __init__(self):
        super().__init__('zerocopy_pub',
            enable_rosout=False,  # Reduce overhead
            use_global_arguments=False)

        # Use unique_ptr semantics
        qos = QoSProfile(depth=10)

        self.pub = self.create_publisher(String, 'data', qos)
        self.timer = self.create_timer(0.001, self.publish)  # 1kHz

    def publish(self):
        # ROS 2 avoids copy if subscriber is in same process
        msg = String()
        msg.data = 'High frequency data'
        self.pub.publish(msg)

class ZeroCopySubscriber(Node):
    def __init__(self):
        super().__init__('zerocopy_sub',
            enable_rosout=False,
            use_global_arguments=False)

        qos = QoSProfile(depth=10)
        self.sub = self.create_subscription(String, 'data', self.callback, qos)

    def callback(self, msg):
        # Receives message without copy overhead
        pass

def main():
    import rclpy
    rclpy.init()

    # Run in same process - enables zero-copy
    executor = rclpy.executors.SingleThreadedExecutor()

    pub_node = ZeroCopyPublisher()
    sub_node = ZeroCopySubscriber()

    executor.add_node(pub_node)
    executor.add_node(sub_node)

    executor.spin()
```

**Performance gain**: 10-100x reduction in latency for large messages (images, point clouds).

### Custom Executors for Real-Time

```python
import rclpy
from rclpy.executors import Executor
from rclpy.node import Node
import select
import time

class DeterministicExecutor(Executor):
    """Custom executor with deterministic execution order"""

    def __init__(self):
        super().__init__()
        self._nodes_in_order = []

    def add_node(self, node):
        super().add_node(node)
        self._nodes_in_order.append(node)

    def spin_once(self, timeout_sec=None):
        """Execute callbacks in strict node order"""
        # Process nodes in deterministic order
        for node in self._nodes_in_order:
            # Get ready callbacks for this node only
            handler, entity, node_ref = self.wait_for_ready_callbacks(
                timeout_sec=0,  # Non-blocking
                nodes=[node]
            )

            if handler:
                handler()

    def wait_for_ready_callbacks(self, timeout_sec, nodes):
        """Find next ready callback"""
        # Implementation uses rclpy internals
        # This is a simplified version
        return None, None, None
```

### Memory Management Best Practices

```python
from rclpy.node import Node
from sensor_msgs.msg import Image
import numpy as np
import weakref

class MemoryEfficientNode(Node):
    def __init__(self):
        super().__init__('memory_efficient')

        # Pre-allocate message buffer (avoid allocation in callback)
        self._msg_pool = [Image() for _ in range(10)]
        self._msg_pool_index = 0

        # Use weak references for large objects
        self._image_cache = weakref.WeakValueDictionary()

        self.subscription = self.create_subscription(
            Image, '/camera/image', self.callback, 10
        )

    def callback(self, msg):
        # Avoid copying image data
        # Process in-place when possible
        self.process_image_inplace(msg)

    def process_image_inplace(self, msg):
        """Process without creating copies"""
        # Use numpy views instead of copies
        img_array = np.array(msg.data, dtype=np.uint8).reshape((msg.height, msg.width, 3))

        # Process (read-only operations don't copy)
        mean_value = img_array.mean()

    def get_reusable_message(self):
        """Recycle message objects"""
        msg = self._msg_pool[self._msg_pool_index]
        self._msg_pool_index = (self._msg_pool_index + 1) % len(self._msg_pool)
        return msg

    def destroy_node(self):
        """Explicit cleanup"""
        self._msg_pool.clear()
        self._image_cache.clear()
        super().destroy_node()
```

### Real-Time-Safe Callbacks

```python
from rclpy.node import Node
from std_msgs.msg import String
import array

class RealtimeSafeNode(Node):
    def __init__(self):
        super().__init__('realtime_safe')

        # Pre-allocate all resources at startup
        self._buffer = array.array('d', [0.0] * 1000)  # Pre-allocated array
        self._counter = 0

        self.sub = self.create_subscription(String, 'input', self.callback, 10)
        self.pub = self.create_publisher(String, 'output', 10)

        # Pre-allocate message
        self._msg = String()

    def callback(self, msg):
        """Real-time-safe callback - no dynamic allocation"""
        # ❌ DON'T: Allocate memory
        # data = [0] * 1000  # Dynamic allocation!

        # ✅ DO: Use pre-allocated buffer
        self._buffer[self._counter % len(self._buffer)] = float(len(msg.data))

        # ❌ DON'T: Use logging in critical path (involves I/O)
        # self.get_logger().info('Processing...')

        # ✅ DO: Reuse pre-allocated message
        self._msg.data = f'Processed: {self._counter}'
        self.pub.publish(self._msg)

        self._counter += 1
```

### Production Error Handling

```python
from rclpy.node import Node
from std_msgs.msg import String
import traceback
import sys

class RobustNode(Node):
    def __init__(self):
        super().__init__('robust_node')

        self.subscription = self.create_subscription(
            String, 'input', self.safe_callback_wrapper(self.callback), 10
        )

        # Health monitoring
        self.last_message_time = self.get_clock().now()
        self.watchdog_timer = self.create_timer(5.0, self.watchdog_callback)

        # Error metrics
        self.error_count = 0
        self.max_errors = 100

    def safe_callback_wrapper(self, callback):
        """Wrap callbacks with error handling"""
        def wrapper(msg):
            try:
                callback(msg)
                self.last_message_time = self.get_clock().now()
            except Exception as e:
                self.handle_callback_error(e, callback.__name__)
        return wrapper

    def callback(self, msg):
        """Main processing logic"""
        # Simulate potential error
        if 'error' in msg.data:
            raise ValueError('Invalid message content')

        # Normal processing
        self.get_logger().info(f'Processing: {msg.data}')

    def handle_callback_error(self, error, callback_name):
        """Centralized error handling"""
        self.error_count += 1

        self.get_logger().error(
            f'Error in {callback_name}: {str(error)}',
            throttle_duration_sec=1.0  # Rate-limit error logs
        )

        # Log detailed traceback
        self.get_logger().debug(traceback.format_exc())

        # Emergency shutdown if too many errors
        if self.error_count > self.max_errors:
            self.get_logger().fatal('Error threshold exceeded - shutting down')
            sys.exit(1)

    def watchdog_callback(self):
        """Detect system health issues"""
        now = self.get_clock().now()
        time_since_last_msg = (now - self.last_message_time).nanoseconds / 1e9

        if time_since_last_msg > 10.0:
            self.get_logger().warn(
                f'No messages received for {time_since_last_msg:.1f} seconds'
            )
```

### Performance Profiling

#### Using Python cProfile

```python
import cProfile
import pstats
from pstats import SortKey

def main():
    profiler = cProfile.Profile()
    profiler.enable()

    # Run node
    rclpy.init()
    node = MyNode()
    rclpy.spin(node)

    profiler.disable()

    # Print stats
    stats = pstats.Stats(profiler)
    stats.sort_stats(SortKey.CUMULATIVE)
    stats.print_stats(20)  # Top 20 functions

if __name__ == '__main__':
    main()
```

#### Benchmarking Callback Latency

```python
from rclpy.node import Node
from std_msgs.msg import Header
import numpy as np

class LatencyBenchmark(Node):
    def __init__(self):
        super().__init__('latency_benchmark')

        self.publisher = self.create_publisher(Header, 'ping', 10)
        self.subscription = self.create_subscription(Header, 'ping', self.callback, 10)

        self.latencies = []
        self.timer = self.create_timer(0.1, self.publish_ping)

    def publish_ping(self):
        msg = Header()
        msg.stamp = self.get_clock().now().to_msg()
        self.publisher.publish(msg)

    def callback(self, msg):
        now = self.get_clock().now()
        sent_time = rclpy.time.Time.from_msg(msg.stamp)

        latency_ns = (now - sent_time).nanoseconds
        latency_ms = latency_ns / 1e6

        self.latencies.append(latency_ms)

        if len(self.latencies) >= 100:
            self.print_statistics()
            self.latencies.clear()

    def print_statistics(self):
        latencies = np.array(self.latencies)
        self.get_logger().info(
            f'Latency stats (ms): '
            f'mean={latencies.mean():.3f}, '
            f'std={latencies.std():.3f}, '
            f'p50={np.percentile(latencies, 50):.3f}, '
            f'p95={np.percentile(latencies, 95):.3f}, '
            f'p99={np.percentile(latencies, 99):.3f}'
        )
```

### Production Deployment Pattern

```python
from rclpy.node import Node
import signal
import sys
import os

class ProductionNode(Node):
    def __init__(self):
        super().__init__('production_node')

        # Register signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

        # Load configuration
        self.load_configuration()

        # Initialize subsystems
        self.setup_publishers()
        self.setup_subscribers()
        self.setup_health_monitoring()

        self.get_logger().info('Node initialized successfully')

    def load_configuration(self):
        """Load config from params or environment"""
        self.declare_parameter('config_file', '')
        config_file = self.get_parameter('config_file').value

        # Load from file or environment
        self.config = self.parse_config(config_file)

    def parse_config(self, config_file):
        """Parse configuration"""
        # Implementation here
        return {}

    def setup_publishers(self):
        """Initialize all publishers"""
        pass

    def setup_subscribers(self):
        """Initialize all subscribers"""
        pass

    def setup_health_monitoring(self):
        """Setup watchdogs and health checks"""
        self.health_timer = self.create_timer(1.0, self.publish_health)

    def publish_health(self):
        """Publish node health status"""
        # Implementation here
        pass

    def signal_handler(self, sig, frame):
        """Graceful shutdown"""
        self.get_logger().info(f'Received signal {sig} - shutting down gracefully')
        self.cleanup()
        sys.exit(0)

    def cleanup(self):
        """Release resources"""
        self.get_logger().info('Cleaning up resources...')
        # Close files, release hardware, etc.

def main():
    rclpy.init()

    try:
        node = ProductionNode()
        rclpy.spin(node)
    except Exception as e:
        print(f'Fatal error: {e}', file=sys.stderr)
        return 1
    finally:
        if 'node' in locals():
            node.destroy_node()
        rclpy.shutdown()

    return 0

if __name__ == '__main__':
    sys.exit(main())
```

### Key Takeaways (Advanced)

✅ **Zero-copy communication** dramatically reduces latency for intra-process pub/sub
✅ **Custom executors** enable deterministic, real-time execution
✅ **Memory pre-allocation** avoids dynamic allocation in critical paths
✅ **Real-time-safe callbacks** never allocate memory or perform I/O
✅ **Production error handling** includes logging, rate limiting, and graceful degradation
✅ **Performance profiling** with cProfile and custom benchmarks

---

## Additional Resources

- [Managing Lifecycle Nodes](https://docs.ros.org/en/humble/Tutorials/Demos/Managed-Nodes.html)
- [How to Use ROS 2 Lifecycle Nodes](https://foxglove.dev/blog/how-to-use-ros2-lifecycle-nodes)
- [Writing a Simple Publisher and Subscriber](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html)
- [Managed Nodes Design](https://design.ros2.org/articles/node_lifecycle.html)

---

**Next:** [Publisher-Subscriber Pattern →](./03-pubsub.md)
