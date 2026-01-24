---
sidebar_position: 3
---

# Publisher-Subscriber Pattern

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Completed Nodes & Topics section

### Learning Objectives

- Understand the publish-subscribe communication pattern
- Create publishers and subscribers in Python
- Work with standard ROS 2 message types
- Implement timer-based publishing
- Use callback functions effectively
- Debug pub/sub systems with CLI tools

### The Publish-Subscribe Pattern

The **publish-subscribe (pub/sub) pattern** is an asynchronous messaging paradigm where:
- **Publishers** send messages to named topics without knowing who receives them
- **Subscribers** receive messages from topics without knowing who sent them
- **Topics** act as message buses connecting publishers and subscribers

**Key characteristics:**
- **Decoupled**: Publishers and subscribers are independent
- **Many-to-many**: Multiple publishers and subscribers per topic
- **Asynchronous**: No blocking - publishers don't wait for subscribers
- **Type-safe**: Topics have specific message types

**Real-world analogy:**
- **Topic** = TV channel (e.g., CNN, ESPN)
- **Publisher** = TV broadcaster
- **Subscriber** = TV viewer
- **Message** = TV program content

### Standard Message Types

ROS 2 provides pre-defined message types for common data:

#### Basic Types (std_msgs)

```python
from std_msgs.msg import String, Int32, Float64, Bool, Header

# String message
msg = String()
msg.data = "Hello, ROS 2!"

# Integer message
msg = Int32()
msg.data = 42

# Float message
msg = Float64()
msg.data = 3.14159

# Boolean message
msg = Bool()
msg.data = True

# Header (timestamp + frame info)
msg = Header()
msg.stamp = self.get_clock().now().to_msg()
msg.frame_id = 'base_link'
```

#### Geometry Types (geometry_msgs)

```python
from geometry_msgs.msg import Point, Pose, Twist, Vector3

# 3D Point
point = Point()
point.x = 1.0
point.y = 2.0
point.z = 0.5

# Velocity command (most common in robotics!)
twist = Twist()
twist.linear.x = 0.5   # Forward velocity (m/s)
twist.linear.y = 0.0   # Sideways velocity
twist.linear.z = 0.0   # Up velocity
twist.angular.x = 0.0  # Roll rate (rad/s)
twist.angular.y = 0.0  # Pitch rate
twist.angular.z = 0.2  # Yaw rate (turning)

# 3D Pose (position + orientation)
pose = Pose()
pose.position.x = 1.0
pose.position.y = 2.0
pose.position.z = 0.0
pose.orientation.x = 0.0
pose.orientation.y = 0.0
pose.orientation.z = 0.0
pose.orientation.w = 1.0  # Quaternion (no rotation)
```

#### Sensor Types (sensor_msgs)

```python
from sensor_msgs.msg import Image, LaserScan, Imu, JointState

# Image (camera data)
img = Image()
img.height = 480
img.width = 640
img.encoding = 'rgb8'
img.data = [0] * (480 * 640 * 3)  # RGB pixel data

# LaserScan (LiDAR data)
scan = LaserScan()
scan.angle_min = -1.57  # -90 degrees
scan.angle_max = 1.57   # +90 degrees
scan.angle_increment = 0.01
scan.ranges = [1.0, 1.1, 1.2, ...]  # Distance measurements

# IMU (Inertial Measurement Unit)
imu = Imu()
imu.linear_acceleration.x = 0.0
imu.linear_acceleration.y = 0.0
imu.linear_acceleration.z = 9.81  # Gravity
```

**Explore message structures:**
```bash
# List all message types
ros2 interface list | grep msg

# Show message structure
ros2 interface show std_msgs/msg/String
ros2 interface show geometry_msgs/msg/Twist
ros2 interface show sensor_msgs/msg/Image
```

### Creating a Publisher

**Example: Temperature sensor publisher**

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64
import random

class TemperatureSensor(Node):
    def __init__(self):
        super().__init__('temperature_sensor')

        # Create publisher
        # Parameters: message_type, topic_name, queue_size
        self.publisher = self.create_publisher(Float64, 'temperature', 10)

        # Publish at 2 Hz (every 0.5 seconds)
        self.timer = self.create_timer(0.5, self.publish_temperature)

        self.get_logger().info('Temperature sensor started')

    def publish_temperature(self):
        """Read and publish temperature"""
        # Simulate temperature reading (20-30°C)
        temperature = 20.0 + random.uniform(0, 10)

        # Create message
        msg = Float64()
        msg.data = temperature

        # Publish
        self.publisher.publish(msg)

        self.get_logger().info(f'Publishing temperature: {temperature:.2f}°C')

def main(args=None):
    rclpy.init(args=args)
    node = TemperatureSensor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Creating a Subscriber

**Example: Temperature monitor subscriber**

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64

class TemperatureMonitor(Node):
    def __init__(self):
        super().__init__('temperature_monitor')

        # Create subscription
        # Parameters: message_type, topic_name, callback_function, queue_size
        self.subscription = self.create_subscription(
            Float64,
            'temperature',
            self.temperature_callback,
            10
        )

        self.get_logger().info('Temperature monitor started')

    def temperature_callback(self, msg):
        """Called whenever a temperature message is received"""
        temp = msg.data

        # Check for high temperature
        if temp > 28.0:
            self.get_logger().warn(f'HIGH TEMPERATURE: {temp:.2f}°C')
        else:
            self.get_logger().info(f'Temperature: {temp:.2f}°C')

def main(args=None):
    rclpy.init(args=args)
    node = TemperatureMonitor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Test the system:**

```bash
# Terminal 1: Publisher
python3 temperature_sensor.py

# Terminal 2: Subscriber
python3 temperature_monitor.py

# Terminal 3: Monitor the topic
ros2 topic echo /temperature
ros2 topic hz /temperature  # Check publishing rate
```

### Publisher-Subscriber with Twist (Robot Control)

**Example: Keyboard teleop publisher**

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
import sys
import termios
import tty

class KeyboardTeleop(Node):
    def __init__(self):
        super().__init__('keyboard_teleop')

        self.publisher = self.create_publisher(Twist, 'cmd_vel', 10)

        self.get_logger().info('Keyboard teleop started')
        self.get_logger().info('Use W/A/S/D to move, SPACE to stop, Q to quit')

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

    def publish_velocity(self, linear_x, angular_z):
        """Publish velocity command"""
        msg = Twist()
        msg.linear.x = linear_x
        msg.angular.z = angular_z
        self.publisher.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = KeyboardTeleop()

    try:
        while rclpy.ok():
            key = node.get_key()

            if key == 'w':
                node.publish_velocity(0.5, 0.0)  # Forward
                node.get_logger().info('Moving forward')
            elif key == 's':
                node.publish_velocity(-0.5, 0.0)  # Backward
                node.get_logger().info('Moving backward')
            elif key == 'a':
                node.publish_velocity(0.0, 0.5)  # Turn left
                node.get_logger().info('Turning left')
            elif key == 'd':
                node.publish_velocity(0.0, -0.5)  # Turn right
                node.get_logger().info('Turning right')
            elif key == ' ':
                node.publish_velocity(0.0, 0.0)  # Stop
                node.get_logger().info('Stopped')
            elif key == 'q':
                node.get_logger().info('Quitting')
                break

    except Exception as e:
        node.get_logger().error(f'Error: {e}')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Multiple Subscribers Pattern

**One topic, multiple subscribers:**

```python
# subscriber1.py
class Subscriber1(Node):
    def __init__(self):
        super().__init__('subscriber1')
        self.sub = self.create_subscription(String, 'data', self.callback, 10)

    def callback(self, msg):
        self.get_logger().info(f'Subscriber1 received: {msg.data}')

# subscriber2.py
class Subscriber2(Node):
    def __init__(self):
        super().__init__('subscriber2')
        self.sub = self.create_subscription(String, 'data', self.callback, 10)

    def callback(self, msg):
        self.get_logger().info(f'Subscriber2 received: {msg.data}')
```

**Both subscribers receive all messages from the same topic!**

### Practical Exercises

**Exercise 1: Speed Controller**

Create a system with:
1. Publisher: Publishes random speeds (0-10 m/s) to `/speed`
2. Subscriber: Logs warnings when speed > 7 m/s

**Exercise 2: Position Tracker**

Create:
1. Publisher: Publishes Point messages (x, y coordinates) simulating robot movement
2. Subscriber: Calculates and logs distance from origin (0, 0)

**Exercise 3: Multi-Sensor System**

Create:
1. Three publishers: temperature, humidity, pressure
2. One subscriber: Monitors all three and logs combined status

### Key Takeaways (Beginner)

✅ **Pub/sub is asynchronous** - publishers don't wait for subscribers
✅ **Topics are typed** - must use correct message type
✅ **Queue size matters** - controls how many messages are buffered
✅ **Timers enable periodic publishing** - use `create_timer()`
✅ **Callbacks process received messages** - keep them fast!
✅ **Standard messages** cover common robotics data (geometry, sensors)

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Master Quality of Service (QoS) profiles
- Create custom message types
- Implement advanced callback patterns
- Handle message timestamps and synchronization
- Optimize for high-frequency publishing
- Debug QoS compatibility issues

### Quality of Service (QoS) Deep Dive

QoS policies control **how** messages are transmitted and stored.

#### QoS Policies Explained

**1. Reliability**

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy

# Best Effort: Like UDP - may lose messages
qos_best_effort = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    depth=10
)

# Reliable: Like TCP - guarantees delivery
qos_reliable = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    depth=10
)

# Create publisher with QoS
self.pub = self.create_publisher(LaserScan, '/scan', qos_best_effort)
```

**When to use:**
- **Best Effort**: High-frequency sensor data (camera at 30 Hz, LiDAR at 20 Hz)
- **Reliable**: Commands, state transitions, critical data

**2. Durability**

```python
from rclpy.qos import DurabilityPolicy

# Transient Local: Late-joiners get last N messages
qos_transient = QoSProfile(
    durability=DurabilityPolicy.TRANSIENT_LOCAL,
    depth=1,
    reliability=ReliabilityPolicy.RELIABLE
)

# Volatile: Only live messages
qos_volatile = QoSProfile(
    durability=DurabilityPolicy.VOLATILE,
    depth=10
)
```

**Use cases:**
- **Transient Local**: Map data, robot description, configuration
- **Volatile**: Real-time sensor streams

**3. History**

```python
from rclpy.qos import HistoryPolicy

# Keep Last N: Circular buffer
qos_keep_last = QoSProfile(
    history=HistoryPolicy.KEEP_LAST,
    depth=10  # Keep last 10 messages
)

# Keep All: Unbounded queue (use with caution!)
qos_keep_all = QoSProfile(
    history=HistoryPolicy.KEEP_ALL
)
```

**4. Liveliness**

```python
from rclpy.qos import LivelinessPolicy
from rclpy.duration import Duration

qos_with_liveliness = QoSProfile(
    liveliness=LivelinessPolicy.AUTOMATIC,
    liveliness_lease_duration=Duration(seconds=2)
)
```

Detects if a publisher has become unresponsive.

#### Predefined QoS Profiles

```python
from rclpy.qos import (
    qos_profile_sensor_data,
    qos_profile_system_default,
    qos_profile_services_default,
    qos_profile_parameters
)

# Sensor data: Best effort, volatile, depth 5
pub_lidar = self.create_publisher(LaserScan, '/scan', qos_profile_sensor_data)

# System default: Reliable, volatile, depth 10
pub_status = self.create_publisher(String, '/status', qos_profile_system_default)

# Parameters: Reliable, transient local, depth 1000
# (used internally for parameter storage)
```

#### QoS Compatibility

Publishers and subscribers must have **compatible** QoS settings:

```python
# Example: QoS mismatch

# Publisher: Best Effort
pub_qos = QoSProfile(reliability=ReliabilityPolicy.BEST_EFFORT, depth=10)
pub = node.create_publisher(String, 'data', pub_qos)

# Subscriber: Reliable (INCOMPATIBLE!)
sub_qos = QoSProfile(reliability=ReliabilityPolicy.RELIABLE, depth=10)
sub = node.create_subscription(String, 'data', callback, sub_qos)

# Result: No connection! Subscriber wants reliable, publisher offers best effort
```

**Check compatibility:**
```bash
ros2 topic info /data -v  # Shows QoS of all publishers and subscribers
```

**Compatibility rules:**
- Best Effort pub → Best Effort sub: ✅
- Reliable pub → Reliable sub: ✅
- Reliable pub → Best Effort sub: ✅ (downgrades to best effort)
- Best Effort pub → Reliable sub: ❌ (incompatible)

### Creating Custom Messages

#### Step 1: Create Interface Package

```bash
# Create ament_cmake package for interfaces
ros2 pkg create my_robot_interfaces --build-type ament_cmake

cd my_robot_interfaces
mkdir msg
```

#### Step 2: Define Custom Message

**msg/BatteryStatus.msg**:
```
# Battery status message
float32 voltage         # Battery voltage (V)
float32 current         # Current draw (A)
float32 percentage      # Charge percentage (0-100)
float32 temperature     # Battery temperature (°C)
bool charging           # True if charging
uint32 cycle_count      # Number of charge cycles
string health_status    # "Good", "Fair", "Poor", "Critical"
```

**msg/RobotState.msg**:
```
# Complete robot state
std_msgs/Header header

geometry_msgs/Pose pose
geometry_msgs/Twist velocity

BatteryStatus battery
float32[] joint_positions
string mode  # "idle", "moving", "charging", "error"
```

#### Step 3: Configure CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.8)
project(my_robot_interfaces)

# Find dependencies
find_package(ament_cmake REQUIRED)
find_package(rosidl_default_generators REQUIRED)
find_package(std_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)

# Declare message files
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/BatteryStatus.msg"
  "msg/RobotState.msg"
  DEPENDENCIES std_msgs geometry_msgs
)

ament_package()
```

#### Step 4: Configure package.xml

```xml
<?xml version="1.0"?>
<package format="3">
  <name>my_robot_interfaces</name>
  <version>0.0.1</version>
  <description>Custom ROS 2 interfaces</description>
  <maintainer email="you@example.com">Your Name</maintainer>
  <license>Apache-2.0</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <build_depend>rosidl_default_generators</build_depend>
  <exec_depend>rosidl_default_runtime</exec_depend>
  <member_of_group>rosidl_interface_packages</member_of_group>

  <depend>std_msgs</depend>
  <depend>geometry_msgs</depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

#### Step 5: Build

```bash
cd ~/ros2_ws
colcon build --packages-select my_robot_interfaces
source install/setup.bash

# Verify
ros2 interface show my_robot_interfaces/msg/BatteryStatus
```

#### Step 6: Use Custom Message

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from my_robot_interfaces.msg import BatteryStatus

class BatteryMonitor(Node):
    def __init__(self):
        super().__init__('battery_monitor')

        self.publisher = self.create_publisher(BatteryStatus, 'battery_status', 10)
        self.timer = self.create_timer(1.0, self.publish_battery)

    def publish_battery(self):
        msg = BatteryStatus()
        msg.voltage = 12.4
        msg.current = 2.5
        msg.percentage = 85.0
        msg.temperature = 35.2
        msg.charging = False
        msg.cycle_count = 150
        msg.health_status = 'Good'

        self.publisher.publish(msg)
        self.get_logger().info(f'Battery: {msg.percentage}% ({msg.health_status})')

def main(args=None):
    rclpy.init(args=args)
    node = BatteryMonitor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Advanced Callback Patterns

#### 1. Callback with Additional Arguments

```python
class MultiTopicNode(Node):
    def __init__(self):
        super().__init__('multi_topic_node')

        # Create subscriptions with lambda to pass extra args
        self.sub1 = self.create_subscription(
            String, 'topic1',
            lambda msg: self.generic_callback(msg, 'Topic1'),
            10
        )

        self.sub2 = self.create_subscription(
            String, 'topic2',
            lambda msg: self.generic_callback(msg, 'Topic2'),
            10
        )

    def generic_callback(self, msg, topic_name):
        self.get_logger().info(f'[{topic_name}] Received: {msg.data}')
```

#### 2. Synchronized Callbacks (Approximate Time)

For subscribing to multiple topics with temporal alignment:

```python
from message_filters import Subscriber, ApproximateTimeSynchronizer
from sensor_msgs.msg import Image, CameraInfo

class SynchronizedSubscriber(Node):
    def __init__(self):
        super().__init__('synchronized_subscriber')

        # Create synchronized subscribers
        self.image_sub = Subscriber(self, Image, '/camera/image')
        self.info_sub = Subscriber(self, CameraInfo, '/camera/camera_info')

        # Synchronize messages with 0.1 second tolerance
        self.sync = ApproximateTimeSynchronizer(
            [self.image_sub, self.info_sub],
            queue_size=10,
            slop=0.1  # 100ms tolerance
        )

        self.sync.registerCallback(self.synchronized_callback)

    def synchronized_callback(self, image_msg, info_msg):
        """Called when both messages arrive within tolerance"""
        self.get_logger().info('Received synchronized image and camera info')
```

#### 3. Stateful Callback

```python
class MovingAverageNode(Node):
    def __init__(self):
        super().__init__('moving_average')

        self.values = []
        self.window_size = 10

        self.subscription = self.create_subscription(
            Float64, 'raw_data', self.moving_average_callback, 10
        )

        self.publisher = self.create_publisher(Float64, 'smoothed_data', 10)

    def moving_average_callback(self, msg):
        # Add new value
        self.values.append(msg.data)

        # Keep only last N values
        if len(self.values) > self.window_size:
            self.values.pop(0)

        # Calculate average
        avg = sum(self.values) / len(self.values)

        # Publish smoothed value
        out_msg = Float64()
        out_msg.data = avg
        self.publisher.publish(out_msg)
```

### High-Frequency Publishing

**Example: 100 Hz publisher**

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Header
import time

class HighFrequencyPublisher(Node):
    def __init__(self):
        super().__init__('high_freq_pub')

        # Use sensor data QoS for high frequency
        from rclpy.qos import qos_profile_sensor_data

        self.publisher = self.create_publisher(
            Header, 'high_freq_data', qos_profile_sensor_data
        )

        # 100 Hz = 0.01 seconds
        self.timer = self.create_timer(0.01, self.timer_callback)

        self.counter = 0
        self.last_log_time = time.time()

    def timer_callback(self):
        msg = Header()
        msg.stamp = self.get_clock().now().to_msg()
        msg.frame_id = 'base_link'

        self.publisher.publish(msg)
        self.counter += 1

        # Log every second
        if time.time() - self.last_log_time >= 1.0:
            self.get_logger().info(f'Publishing at {self.counter} Hz')
            self.counter = 0
            self.last_log_time = time.time()

def main(args=None):
    rclpy.init(args=args)
    node = HighFrequencyPublisher()

    # Use MultiThreadedExecutor for better performance
    from rclpy.executors import MultiThreadedExecutor
    executor = MultiThreadedExecutor()
    executor.add_node(node)

    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Key Takeaways (Intermediate)

✅ **QoS profiles** control reliability, durability, and performance
✅ **Custom messages** defined in .msg files, built with rosidl
✅ **QoS compatibility** must match between publishers and subscribers
✅ **Message filters** enable synchronized multi-topic subscriptions
✅ **High-frequency publishing** requires appropriate QoS and executors

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement zero-copy publishing with shared memory
- Optimize message serialization and bandwidth
- Create type adapters for custom data types
- Design production-grade message pipelines
- Profile and benchmark pub/sub performance
- Handle edge cases and error conditions

### Zero-Copy Publishing

**Shared memory transport** avoids copying message data for same-process pub/sub.

#### Configuration

**cyclonedds.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CycloneDDS xmlns="https://cdds.io/config">
  <Domain>
    <General>
      <Transport>shm</Transport>
    </General>
  </Domain>
</CycloneDDS>
```

```bash
export CYCLONEDDS_URI=file:///path/to/cyclonedds.xml
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
```

#### Code Example

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
import numpy as np

class ZeroCopyImagePublisher(Node):
    def __init__(self):
        super().__init__('zerocopy_image_pub')

        # Large message (640x480 RGB = ~1 MB)
        self.pub = self.create_publisher(Image, '/camera/image', 10)
        self.timer = self.create_timer(0.033, self.publish_image)  # 30 Hz

    def publish_image(self):
        msg = Image()
        msg.height = 480
        msg.width = 640
        msg.encoding = 'rgb8'
        msg.step = 640 * 3

        # Generate dummy image data
        img_data = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        msg.data = img_data.flatten().tolist()

        # With shared memory, this avoids copying 1MB!
        self.publisher publish(msg)
```

**Benchmark: With vs Without Zero-Copy**

| Transport | Latency (1MB message) | CPU Usage |
|-----------|----------------------|-----------|
| UDP | ~5 ms | High |
| Shared Memory | ~0.1 ms | Low |

**50x latency reduction!**

### Message Pool for High-Frequency Publishing

Avoid memory allocation in hot path:

```python
from sensor_msgs.msg import Image
import numpy as np

class MessagePoolPublisher(Node):
    def __init__(self):
        super().__init__('msg_pool_pub')

        # Pre-allocate message pool
        self.msg_pool_size = 10
        self.msg_pool = [self.create_empty_image() for _ in range(self.msg_pool_size)]
        self.msg_index = 0

        self.pub = self.create_publisher(Image, '/camera/image', 10)
        self.timer = self.create_timer(0.01, self.publish)  # 100 Hz

    def create_empty_image(self):
        """Create and pre-allocate image message"""
        msg = Image()
        msg.height = 480
        msg.width = 640
        msg.encoding = 'rgb8'
        msg.step = 640 * 3
        msg.data = [0] * (480 * 640 * 3)
        return msg

    def publish(self):
        # Reuse message from pool (no allocation!)
        msg = self.msg_pool[self.msg_index]
        self.msg_index = (self.msg_index + 1) % self.msg_pool_size

        # Update timestamp
        msg.header.stamp = self.get_clock().now().to_msg()

        # Publish (reusing memory)
        self.pub.publish(msg)
```

### Custom QoS for Production Systems

#### Safety-Critical Profile

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy, \
                       LivelinessPolicy, HistoryPolicy
from rclpy.duration import Duration

def create_safety_critical_qos():
    """QoS for safety-critical systems (e.g., emergency stop)"""
    return QoSProfile(
        reliability=ReliabilityPolicy.RELIABLE,
        durability=DurabilityPolicy.TRANSIENT_LOCAL,
        history=HistoryPolicy.KEEP_LAST,
        depth=1,
        liveliness=LivelinessPolicy.AUTOMATIC,
        liveliness_lease_duration=Duration(seconds=0, nanoseconds=500_000_000),  # 500ms
        deadline=Duration(seconds=0, nanoseconds=100_000_000)  # 100ms max latency
    )

# Usage
emergency_stop_pub = self.create_publisher(
    Bool, '/emergency_stop',
    create_safety_critical_qos()
)
```

#### High-Throughput Profile

```python
def create_high_throughput_qos():
    """QoS for maximum throughput (e.g., video streaming)"""
    return QoSProfile(
        reliability=ReliabilityPolicy.BEST_EFFORT,
        durability=DurabilityPolicy.VOLATILE,
        history=HistoryPolicy.KEEP_LAST,
        depth=1  # Only latest frame matters
    )
```

### Bandwidth Optimization

#### Message Compression

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import CompressedImage
from cv_bridge import CvBridge
import cv2
import numpy as np

class CompressedImagePublisher(Node):
    def __init__(self):
        super().__init__('compressed_image_pub')

        self.pub = self.create_publisher(CompressedImage, '/camera/compressed', 10)
        self.bridge = CvBridge()
        self.timer = self.create_timer(0.033, self.publish)

    def publish(self):
        # Create image (480x640 RGB = ~1 MB uncompressed)
        img = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)

        # Compress to JPEG (typically 50-100 KB)
        msg = CompressedImage()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.format = 'jpeg'
        msg.data = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 80])[1].tobytes()

        self.pub.publish(msg)

        # Bandwidth saved: ~90%!
```

### Production Error Handling

```python
from rclpy.node import Node
from std_msgs.msg import String
from rclpy.qos import QoSLivelinessLostInfo, QoSDeadlineMissedInfo
from rclpy.event_handler import PublisherEventCallbacks, SubscriptionEventCallbacks

class RobustPubSub(Node):
    def __init__(self):
        super().__init__('robust_pubsub')

        # Publisher with callbacks
        pub_callbacks = PublisherEventCallbacks(
            deadline=self.pub_deadline_callback,
            liveliness=self.pub_liveliness_callback
        )

        self.pub = self.create_publisher(
            String, 'data', 10,
            event_callbacks=pub_callbacks
        )

        # Subscriber with callbacks
        sub_callbacks = SubscriptionEventCallbacks(
            deadline=self.sub_deadline_callback,
            liveliness=self.sub_liveliness_callback,
            incompatible_qos=self.sub_incompatible_qos_callback
        )

        self.sub = self.create_subscription(
            String, 'data', self.data_callback, 10,
            event_callbacks=sub_callbacks
        )

        self.timer = self.create_timer(1.0, self.publish_data)

    def publish_data(self):
        try:
            msg = String()
            msg.data = 'Hello'
            self.pub.publish(msg)
        except Exception as e:
            self.get_logger().error(f'Publish failed: {e}')

    def data_callback(self, msg):
        try:
            # Process message
            pass
        except Exception as e:
            self.get_logger().error(f'Callback failed: {e}')

    def pub_deadline_callback(self, event: QoSDeadlineMissedInfo):
        self.get_logger().error(f'Publisher deadline missed: {event.total_count}')

    def pub_liveliness_callback(self, event: QoSLivelinessLostInfo):
        self.get_logger().error('Publisher liveliness lost')

    def sub_deadline_callback(self, event: QoSDeadlineMissedInfo):
        self.get_logger().error(f'Subscriber deadline missed: {event.total_count}')

    def sub_liveliness_callback(self, event):
        self.get_logger().error('Subscriber liveliness lost')

    def sub_incompatible_qos_callback(self, event):
        self.get_logger().error(f'Incompatible QoS detected: {event}')
```

### Performance Benchmarking

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Header
import time
import statistics

class LatencyBenchmark(Node):
    def __init__(self):
        super().__init__('latency_benchmark')

        self.pub = self.create_publisher(Header, 'ping', 10)
        self.sub = self.create_subscription(Header, 'ping', self.pong_callback, 10)

        self.latencies = []
        self.timer = self.create_timer(0.01, self.send_ping)  # 100 Hz

    def send_ping(self):
        msg = Header()
        msg.stamp = self.get_clock().now().to_msg()
        self.pub.publish(msg)

    def pong_callback(self, msg):
        now = self.get_clock().now()
        sent = rclpy.time.Time.from_msg(msg.stamp)

        latency_ns = (now - sent).nanoseconds
        latency_ms = latency_ns / 1e6

        self.latencies.append(latency_ms)

        if len(self.latencies) >= 1000:
            self.print_stats()
            self.latencies.clear()

    def print_stats(self):
        self.get_logger().info(
            f'Latency (ms): '
            f'mean={statistics.mean(self.latencies):.3f}, '
            f'stdev={statistics.stdev(self.latencies):.3f}, '
            f'min={min(self.latencies):.3f}, '
            f'max={max(self.latencies):.3f}, '
            f'median={statistics.median(self.latencies):.3f}'
        )

def main(args=None):
    rclpy.init(args=args)
    node = LatencyBenchmark()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Key Takeaways (Advanced)

✅ **Zero-copy** with shared memory transport reduces latency 10-100x
✅ **Message pools** eliminate allocation overhead in high-frequency loops
✅ **Compression** (JPEG, PNG) reduces bandwidth by 80-95% for images
✅ **QoS event callbacks** detect deadline misses and liveliness losses
✅ **Benchmarking** quantifies performance (mean, p95, p99 latencies)
✅ **Production patterns** include error handling, health monitoring, graceful degradation

---

## Additional Resources

- [Creating Custom Interfaces](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Custom-ROS2-Interfaces.html)
- [About Interfaces](https://docs.ros.org/en/humble/Concepts/Basic/About-Interfaces.html)
- [Quality of Service Settings](https://docs.ros.org/en/humble/Concepts/Intermediate/About-Quality-of-Service-Settings.html)
- [Writing Publisher/Subscriber (Python)](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html)

---

**Next:** [Lab 1: Turtle Control →](./04-lab1-turtle.md)
