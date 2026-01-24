---
sidebar_position: 3
---

# Publisher-Subscriber Pattern

**Level**: Beginner
**Duration**: 3 hours
**Prerequisites**: Nodes and Topics lesson completed

## Learning Objectives

- Master the publisher-subscriber communication pattern
- Control TurtleSim robot using topics
- Understand message types and data flow
- Build multiple publishers and subscribers
- Debug communication issues

## What is the Publisher-Subscriber Pattern?

The **Publisher-Subscriber (Pub/Sub)** pattern is the most fundamental communication mechanism in ROS 2.

### Real-World Analogy

Think of it like a **radio station**:

- 📻 **Publisher** = Radio station broadcasting music
- 📡 **Topic** = Radio frequency (e.g., 101.5 FM)
- 🎧 **Subscriber** = Your radio tuned to that frequency
- 🎵 **Message** = The music/data being transmitted

**Key Properties**:
- Publishers don't know who's listening
- Subscribers don't know who's broadcasting
- Multiple publishers can broadcast on the same topic
- Multiple subscribers can listen to the same topic
- **Decoupled**: Publishers and subscribers work independently

### Why This Matters

**Example**: Self-driving car
```
[Camera Node] --publishes--> /camera/image
                                  |
                                  +--subscribes--> [Object Detection]
                                  +--subscribes--> [Lane Detection]
                                  +--subscribes--> [Recording System]
```

If object detection crashes, the camera keeps working and other nodes still get images!

## TurtleSim - Your First Robot Simulator

**TurtleSim** is a simple 2D robot simulator perfect for learning ROS 2 concepts.

### Launch TurtleSim

```bash
# Terminal 1: Start TurtleSim
ros2 run turtlesim turtlesim_node
```

A window appears with a blue background and a turtle! 🐢

### Explore TurtleSim Topics

Open a **second terminal**:

```bash
# List all topics
ros2 topic list
```

**Output**:
```
/parameter_events
/rosout
/turtle1/cmd_vel
/turtle1/color_sensor
/turtle1/pose
```

**What do these topics do?**

| Topic | Type | Purpose |
|-------|------|---------|
| `/turtle1/cmd_vel` | `geometry_msgs/msg/Twist` | Velocity commands (move the turtle) |
| `/turtle1/pose` | `turtlesim/msg/Pose` | Turtle's position and orientation |
| `/turtle1/color_sensor` | `turtlesim/msg/Color` | RGB values under the turtle |

### Control Turtle with Keyboard

```bash
# Terminal 2: Launch keyboard controller
ros2 run turtlesim turtle_teleop_key
```

**Use arrow keys** to move the turtle!

**What's happening?**
```
[turtle_teleop_key] --publishes--> /turtle1/cmd_vel --subscribes--> [turtlesim]
                     (Twist messages)
```

The teleop node publishes velocity commands, and turtlesim subscribes to them!

## Anatomy of a Topic

### Inspect a Topic

```bash
# Get detailed info about cmd_vel topic
ros2 topic info /turtle1/cmd_vel
```

**Output**:
```
Type: geometry_msgs/msg/Twist
Publisher count: 1
Subscription count: 1
```

### See the Message Structure

```bash
# Show the Twist message definition
ros2 interface show geometry_msgs/msg/Twist
```

**Output**:
```
# Linear velocity
geometry_msgs/Vector3 linear
  float64 x
  float64 y
  float64 z

# Angular velocity
geometry_msgs/Vector3 angular
  float64 x
  float64 y
  float64 z
```

**For TurtleSim** (2D robot):
- `linear.x`: Forward/backward speed (m/s)
- `angular.z`: Rotation speed (rad/s)
- Other fields are ignored (turtle can't move up/down or roll/pitch)

### Monitor Messages in Real-Time

```bash
# Echo messages from cmd_vel topic
ros2 topic echo /turtle1/cmd_vel
```

Now press arrow keys in the teleop terminal and watch the messages appear!

**Example output**:
```
linear:
  x: 2.0
  y: 0.0
  z: 0.0
angular:
  x: 0.0
  y: 0.0
  z: 0.0
---
```

This means: "Move forward at 2 m/s, don't rotate"

## Publishing from Command Line

You can publish messages directly without writing code!

### Move Turtle Forward

```bash
# Publish a single message
ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 0.0}}"
```

The turtle moves forward! 🐢💨

### Continuous Movement

```bash
# Publish at 1 Hz (once per second)
ros2 topic pub --rate 1 /turtle1/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 1.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 0.0}}"
```

The turtle keeps moving forward!

### Make it Spin

```bash
# Rotate in place
ros2 topic pub --rate 1 /turtle1/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 0.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 2.0}}"
```

The turtle spins! 🌀

### Circle Motion

```bash
# Move forward AND rotate (creates a circle)
ros2 topic pub --rate 1 /turtle1/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 1.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.0}}"
```

Perfect circle! ⭕

**Press Ctrl+C** to stop publishing.

## Reading Turtle's Position

### Monitor Pose Topic

```bash
# See turtle's position and orientation
ros2 topic echo /turtle1/pose
```

**Output**:
```
x: 5.544444561004639
y: 5.544444561004639
theta: 0.0
linear_velocity: 0.0
angular_velocity: 0.0
---
```

**Fields**:
- `x, y`: Position on screen (0-11 for both axes)
- `theta`: Orientation in radians (0 = facing right)
- `linear_velocity`: Current forward speed
- `angular_velocity`: Current rotation speed

### Check Topic Frequency

```bash
# How often is pose published?
ros2 topic hz /turtle1/pose
```

**Output**:
```
average rate: 62.500
  min: 0.016s max: 0.016s std dev: 0.00001s window: 64
```

Pose is published ~62 times per second!

## Building a Custom Publisher

Now let's write a Python node that controls the turtle!

### Create Circle Controller

Navigate to your package:
```bash
cd ~/ros2_ws/src/my_robot_controller
```

Create `my_robot_controller/turtle_circle.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class TurtleCircle(Node):
    """
    Makes the turtle move in a circle.
    Demonstrates basic publisher usage.
    """

    def __init__(self):
        super().__init__('turtle_circle')

        # Create publisher
        self.publisher_ = self.create_publisher(
            Twist,              # Message type
            '/turtle1/cmd_vel', # Topic name
            10                  # Queue size
        )

        # Publish every 0.5 seconds (2 Hz)
        self.timer = self.create_timer(0.5, self.publish_velocity)

        self.get_logger().info('Circle controller started!')

    def publish_velocity(self):
        """Send velocity command to make turtle move in circle"""
        msg = Twist()

        # Set velocities
        msg.linear.x = 1.0   # Move forward at 1 m/s
        msg.angular.z = 1.0  # Rotate at 1 rad/s

        # Publish the message
        self.publisher_.publish(msg)

        # Log what we sent
        self.get_logger().info(f'Published: linear={msg.linear.x}, angular={msg.angular.z}')

def main(args=None):
    rclpy.init(args=args)
    node = TurtleCircle()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Add to setup.py

Edit `setup.py` to add the new node:

```python
entry_points={
    'console_scripts': [
        'my_first_node = my_robot_controller.my_first_node:main',
        'robot_news_station = my_robot_controller.robot_news_station:main',
        'smartphone = my_robot_controller.smartphone:main',
        'turtle_circle = my_robot_controller.turtle_circle:main',  # Add this
    ],
},
```

### Build and Run

```bash
# Build
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash

# Terminal 1: Start TurtleSim
ros2 run turtlesim turtlesim_node

# Terminal 2: Run your controller
ros2 run my_robot_controller turtle_circle
```

The turtle moves in a perfect circle! 🎯

## Building a Custom Subscriber

Let's create a node that **reads** the turtle's position.

### Create Position Monitor

Create `my_robot_controller/turtle_position_monitor.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from turtlesim.msg import Pose

class TurtlePositionMonitor(Node):
    """
    Monitors turtle's position and prints warnings
    if it gets too close to the edge.
    """

    def __init__(self):
        super().__init__('turtle_position_monitor')

        # Create subscriber
        self.subscription = self.create_subscription(
            Pose,               # Message type
            '/turtle1/pose',    # Topic name
            self.pose_callback, # Callback function
            10                  # Queue size
        )

        self.get_logger().info('Position monitor started!')

    def pose_callback(self, msg):
        """
        Called every time a pose message arrives.
        msg: Pose message with x, y, theta, velocities
        """
        # Log current position
        self.get_logger().info(
            f'Position: x={msg.x:.2f}, y={msg.y:.2f}, theta={msg.theta:.2f}'
        )

        # Warn if near edge (boundaries are 0 and 11)
        if msg.x < 1.0 or msg.x > 10.0 or msg.y < 1.0 or msg.y > 10.0:
            self.get_logger().warn('⚠️  TURTLE IS NEAR THE EDGE!')

        # Warn if moving fast
        if abs(msg.linear_velocity) > 2.0:
            self.get_logger().warn(f'🚀 High speed! {msg.linear_velocity:.2f} m/s')

def main(args=None):
    rclpy.init(args=args)
    node = TurtlePositionMonitor()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Update setup.py

```python
entry_points={
    'console_scripts': [
        # ... previous entries ...
        'turtle_position_monitor = my_robot_controller.turtle_position_monitor:main',
    ],
},
```

### Build and Run

```bash
# Build
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash

# Terminal 1: TurtleSim
ros2 run turtlesim turtlesim_node

# Terminal 2: Position monitor
ros2 run my_robot_controller turtle_position_monitor

# Terminal 3: Control with keyboard
ros2 run turtlesim turtle_teleop_key
```

Move the turtle around and watch the monitor print position updates and warnings!

## Combined Publisher + Subscriber

Let's create a **smart controller** that:
1. **Subscribes** to position
2. **Publishes** velocity commands
3. **Stops** before hitting the wall

### Create Wall Avoider

Create `my_robot_controller/turtle_wall_avoider.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose

class TurtleWallAvoider(Node):
    """
    Autonomous turtle that moves forward but turns when near walls.
    Combines publisher and subscriber!
    """

    def __init__(self):
        super().__init__('turtle_wall_avoider')

        # Publisher for velocity commands
        self.velocity_publisher = self.create_publisher(
            Twist,
            '/turtle1/cmd_vel',
            10
        )

        # Subscriber for position
        self.pose_subscriber = self.create_subscription(
            Pose,
            '/turtle1/pose',
            self.pose_callback,
            10
        )

        # Timer to publish velocity commands
        self.timer = self.create_timer(0.1, self.control_loop)

        # Store current position
        self.current_pose = None

        self.get_logger().info('Wall avoider started! Turtle will roam autonomously.')

    def pose_callback(self, msg):
        """Update stored position when new pose arrives"""
        self.current_pose = msg

    def control_loop(self):
        """Decide velocity based on current position"""
        if self.current_pose is None:
            # Don't have position yet, wait
            return

        msg = Twist()

        # Check if near any wall
        x = self.current_pose.x
        y = self.current_pose.y

        near_wall = (x < 1.5 or x > 9.5 or y < 1.5 or y > 9.5)

        if near_wall:
            # Near wall: stop and turn
            msg.linear.x = 0.0
            msg.angular.z = 1.5  # Turn fast
            self.get_logger().info('Near wall! Turning...')
        else:
            # Safe: move forward
            msg.linear.x = 2.0
            msg.angular.z = 0.0

        # Publish the command
        self.velocity_publisher.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = TurtleWallAvoider()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Update setup.py

```python
entry_points={
    'console_scripts': [
        # ... previous entries ...
        'turtle_wall_avoider = my_robot_controller.turtle_wall_avoider:main',
    ],
},
```

### Build and Run

```bash
# Build
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash

# Terminal 1: TurtleSim
ros2 run turtlesim turtlesim_node

# Terminal 2: Wall avoider
ros2 run my_robot_controller turtle_wall_avoider
```

Watch the turtle roam autonomously and turn before hitting walls! 🤖

## Multiple Publishers to One Topic

Let's see what happens when **multiple nodes** publish to the same topic.

### Terminal 1: TurtleSim
```bash
ros2 run turtlesim turtlesim_node
```

### Terminal 2: Circle controller
```bash
ros2 run my_robot_controller turtle_circle
```

### Terminal 3: Command line publisher
```bash
ros2 topic pub --rate 1 /turtle1/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: -1.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: -1.0}}"
```

**What happens?**
The turtle receives commands from **both** publishers! The behavior depends on:
- Which message arrives last
- Publication rates
- Network timing

**In real robots**: This can be dangerous! Use **namespaces** or **topic remapping** to avoid conflicts.

## Multiple Subscribers to One Topic

Multiple nodes can safely subscribe to the same topic.

### Terminal 1: TurtleSim
```bash
ros2 run turtlesim turtlesim_node
```

### Terminal 2: First monitor
```bash
ros2 run my_robot_controller turtle_position_monitor
```

### Terminal 3: Second monitor (same node, different instance)
```bash
ros2 run my_robot_controller turtle_position_monitor
```

### Terminal 4: Echo command
```bash
ros2 topic echo /turtle1/pose
```

All three subscribers receive **every** pose message! This is safe and common.

## Topic Communication Patterns

### 1:1 (One Publisher, One Subscriber)
```
[Camera] --/image--> [Display]
```
**Use case**: Simple data flow

### 1:N (One Publisher, Many Subscribers)
```
[Sensor] --/data--> [Logger]
                --> [Processor]
                --> [Display]
```
**Use case**: Broadcasting sensor data

### N:1 (Many Publishers, One Subscriber)
```
[Joystick] --\
[AI Brain] ---+--> /cmd_vel --> [Robot]
[Safety]   --/
```
**Use case**: Multiple control sources (⚠️ can cause conflicts!)

### N:M (Many Publishers, Many Subscribers)
```
[Camera 1] --\       /--> [Logger]
[Camera 2] ---+--> /images --> [AI]
[Camera 3] --/       \--> [Display]
```
**Use case**: Distributed systems

## Message Types Deep Dive

### Common Standard Messages

```bash
# List all available message types
ros2 interface list | grep msg
```

**Most used types**:

| Package | Message | Purpose |
|---------|---------|---------|
| `std_msgs` | `String`, `Int32`, `Float64`, `Bool` | Simple data |
| `geometry_msgs` | `Twist`, `Pose`, `Point` | Position, velocity |
| `sensor_msgs` | `Image`, `LaserScan`, `Imu` | Sensor data |
| `nav_msgs` | `Odometry`, `Path` | Navigation |

### Creating Custom Messages

You can define your own message types!

**Example**: Battery status message

Create `my_robot_controller/msg/BatteryStatus.msg`:
```
float32 voltage
float32 current
float32 temperature
bool is_charging
```

(We'll learn how to use custom messages in Week 2!)

## Quality of Service (QoS) Profiles

QoS determines **how** messages are delivered.

### Common QoS Profiles

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy

# Profile 1: Sensor data (best effort, volatile)
sensor_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,  # OK to drop messages
    durability=DurabilityPolicy.VOLATILE,       # Only send to existing subscribers
    depth=10
)

# Profile 2: Critical commands (reliable, transient)
command_qos = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,     # Guarantee delivery
    durability=DurabilityPolicy.TRANSIENT_LOCAL, # Save for late subscribers
    depth=10
)

# Use in publisher
self.publisher = self.create_publisher(
    Twist,
    '/cmd_vel',
    sensor_qos  # Use custom QoS
)
```

### QoS Matching

**Important**: Publishers and subscribers must have **compatible** QoS!

| Publisher | Subscriber | Result |
|-----------|------------|--------|
| RELIABLE | RELIABLE | ✅ Match |
| BEST_EFFORT | BEST_EFFORT | ✅ Match |
| RELIABLE | BEST_EFFORT | ✅ Match |
| BEST_EFFORT | RELIABLE | ❌ No match! |

**Why?** A best-effort publisher can't guarantee reliable delivery to a reliable subscriber.

## Debugging Pub/Sub Issues

### Issue 1: No Messages Received

**Symptom**: Subscriber callback never called

**Debug steps**:
```bash
# 1. Is the topic published?
ros2 topic list

# 2. Is anyone publishing?
ros2 topic info /my_topic

# 3. Can you see messages?
ros2 topic echo /my_topic

# 4. Check QoS compatibility
ros2 topic info /my_topic -v  # Verbose mode
```

### Issue 2: Messages Arriving Too Fast/Slow

```bash
# Check publication rate
ros2 topic hz /my_topic

# Expected: 10 Hz, Actual: 100 Hz?
# → Adjust timer in publisher
```

### Issue 3: Topic Name Mismatch

**Common mistake**:
```python
# Publisher
self.publisher = self.create_publisher(Twist, '/cmd_vel', 10)

# Subscriber (WRONG - missing leading /)
self.subscriber = self.create_subscription(Twist, 'cmd_vel', callback, 10)
```

**Fix**: Always use consistent topic names (with or without `/` prefix)

### Issue 4: Message Type Mismatch

**Error**:
```
TypeError: expected Twist, got String
```

**Fix**: Ensure publisher and subscriber use **exact same** message type

## Visualization with rqt_graph

```bash
# Install if needed
sudo apt install ros-humble-rqt*

# Launch graph visualizer
rqt_graph
```

This shows:
- All nodes (circles/boxes)
- All topics (arrows)
- Publisher/subscriber relationships

**Try it**: Run turtlesim + teleop + your custom nodes, then view the graph!

## Best Practices

### 1. Topic Naming Conventions

```
✅ Good:
/robot1/camera/image
/robot1/cmd_vel
/sensors/lidar/scan

❌ Bad:
/img
/data
/topic1
```

**Rules**:
- Use namespaces (`/robot1/...`)
- Descriptive names
- Lowercase with underscores

### 2. Queue Size

```python
# Too small: messages dropped during bursts
self.publisher = self.create_publisher(Twist, '/cmd_vel', 1)

# Too large: memory waste
self.publisher = self.create_publisher(Twist, '/cmd_vel', 10000)

# Good: balance between reliability and memory
self.publisher = self.create_publisher(Twist, '/cmd_vel', 10)
```

**Rule of thumb**: Use 10 for most topics

### 3. Callback Efficiency

```python
# ❌ BAD: Slow callback blocks other messages
def pose_callback(self, msg):
    time.sleep(5)  # NEVER do this!
    self.process(msg)

# ✅ GOOD: Fast callback, process in separate thread
def pose_callback(self, msg):
    self.latest_pose = msg  # Just store it

def control_loop(self):
    if self.latest_pose:
        self.process(self.latest_pose)  # Process in timer
```

### 4. Logging

```python
# Use appropriate log levels
self.get_logger().debug('Detailed debug info')    # For developers
self.get_logger().info('Normal operation')        # General info
self.get_logger().warn('Something unusual')       # Warnings
self.get_logger().error('Something went wrong')   # Errors
self.get_logger().fatal('Critical failure')       # Fatal errors
```

## Hands-On Lab: Traffic Light System

**Challenge**: Create a traffic light system with:
1. **Traffic light node** (publisher):
   - Publishes current light color every 3 seconds
   - Cycle: Green (3s) → Yellow (1s) → Red (3s) → repeat
   - Topic: `/traffic_light/state`
   - Message type: `std_msgs/String`

2. **Car node** (subscriber):
   - Subscribes to traffic light
   - Prints action based on color:
     - Green: "🚗 Driving"
     - Yellow: "⚠️  Slowing down"
     - Red: "🛑 Stopped"

### Starter Code

```python
# traffic_light.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class TrafficLight(Node):
    def __init__(self):
        super().__init__('traffic_light')
        self.publisher_ = self.create_publisher(String, '/traffic_light/state', 10)
        self.timer = self.create_timer(3.0, self.publish_state)
        self.states = ['Green', 'Yellow', 'Red']
        self.state_index = 0

    def publish_state(self):
        msg = String()
        msg.data = self.states[self.state_index]
        self.publisher_.publish(msg)
        self.get_logger().info(f'Light is {msg.data}')

        # TODO: Cycle to next state
        # Hint: Yellow should only last 1 second!

def main(args=None):
    rclpy.init(args=args)
    node = TrafficLight()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

```python
# car.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Car(Node):
    def __init__(self):
        super().__init__('car')
        self.subscription = self.create_subscription(
            String,
            '/traffic_light/state',
            self.light_callback,
            10
        )

    def light_callback(self, msg):
        # TODO: Print different messages based on msg.data
        pass

def main(args=None):
    rclpy.init(args=args)
    node = Car()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

**Bonus Challenge**: Make the car publish its position on `/car/pose` topic, and create a second subscriber that monitors if any cars are stuck at red lights too long!

## Common Mistakes & Solutions

### Mistake 1: Forgetting to source workspace

**Symptom**:
```
Package 'my_robot_controller' not found
```

**Solution**:
```bash
source ~/ros2_ws/install/setup.bash
# Or add to ~/.bashrc
echo "source ~/ros2_ws/install/setup.bash" >> ~/.bashrc
```

### Mistake 2: Not rebuilding after changes

**Symptom**: Code changes don't take effect

**Solution**:
```bash
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash
```

### Mistake 3: Topic name typos

**Symptom**: Publisher and subscriber don't communicate

**Solution**: Use `ros2 topic list` to verify exact names

### Mistake 4: Message type errors

**Symptom**:
```
TypeError: expected Twist, got Pose
```

**Solution**: Verify message types with `ros2 interface show <msg_type>`

## Performance Tips

### Tip 1: Publication Rate

```python
# High rate (100 Hz): For real-time control
self.timer = self.create_timer(0.01, self.callback)

# Medium rate (10 Hz): For monitoring
self.timer = self.create_timer(0.1, self.callback)

# Low rate (1 Hz): For status updates
self.timer = self.create_timer(1.0, self.callback)
```

**Rule**: Publish only as fast as needed!

### Tip 2: Message Size

```python
# ❌ BAD: Sending huge data frequently
# Publishing 4K images at 60 Hz → 1 GB/s bandwidth!

# ✅ GOOD: Compress or reduce resolution
# Publish compressed images at 30 Hz
```

### Tip 3: Subscriber Selectivity

```python
# ❌ BAD: Subscribe to everything
self.create_subscription(Image, '/camera/image', callback, 10)
self.create_subscription(Image, '/camera2/image', callback, 10)
self.create_subscription(LaserScan, '/scan', callback, 10)
# ... (only use 1 of these)

# ✅ GOOD: Subscribe only to what you need
self.create_subscription(Image, '/camera/image', callback, 10)
```

## Key Takeaways

✅ **Publisher-Subscriber** is ROS 2's core communication pattern
✅ **Topics** are named channels for message delivery
✅ **Messages** define the data structure (Twist, Pose, String, etc.)
✅ **Multiple publishers/subscribers** can use the same topic
✅ **QoS profiles** control delivery guarantees
✅ **Callbacks** should be fast (don't block)
✅ **Always rebuild** and source after code changes
✅ **Use rqt_graph** to visualize your system

## Next Steps

In Lab 1, you'll:
- Build a complete turtle control system
- Implement wall collision detection
- Create a turtle drawing program
- Debug complex pub/sub interactions

---

**Previous**: [Nodes and Topics](./nodes-and-topics.md) | **Next**: [Lab 1: Turtle Controller](./lab1.md)
