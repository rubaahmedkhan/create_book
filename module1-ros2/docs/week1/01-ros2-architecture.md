---
sidebar_position: 1
---

# ROS 2 Architecture & Setup

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Basic Python knowledge, command-line familiarity

### Learning Objectives

By the end of the beginner section, you will:
- Understand what ROS 2 is and why it's used in robotics
- Grasp the core architectural concepts of ROS 2
- Install and configure a ROS 2 environment
- Run your first ROS 2 demo programs
- Use basic ROS 2 command-line tools

### What is ROS 2?

**ROS 2 (Robot Operating System 2)** is an open-source middleware framework for building robot applications. Think of it as the "nervous system" that connects all parts of your robot.

#### Real-World Analogy

Imagine you're building a humanoid robot:
- **Sensors** (cameras, LiDAR, IMUs) gather information
- **Processing nodes** analyze data (object detection, SLAM)
- **Control systems** coordinate motors (walk, grasp, balance)
- **Decision-making** determines behavior

Without ROS 2, you'd manually write thousands of lines to handle:
- Inter-process communication
- Message serialization
- Service discovery
- Time synchronization
- Data distribution

**With ROS 2**, these complexities are abstracted into clean APIs.

:::tip Industry Adoption
Companies like Boston Dynamics, NASA, autonomous vehicle manufacturers, and hundreds of robotics startups use ROS for everything from warehouse robots to Mars rovers. ROS 2 Humble has long-term support (LTS) until May 2027.
:::

### Core Concepts

#### 1. Nodes - The Building Blocks

A **node** is an independent executable that performs a specific task.

**Example in a humanoid robot:**
- `camera_node` - Captures images
- `vision_node` - Detects objects
- `motion_controller_node` - Controls motors
- `decision_node` - Makes high-level decisions

Each node runs independently and can be started, stopped, or restarted without affecting others.

```python
# Minimal node example (conceptual - we'll write real code soon)
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('my_first_node')
        self.get_logger().info('Hello from ROS 2!')

def main():
    rclpy.init()
    node = MinimalNode()
    rclpy.spin(node)
    rclpy.shutdown()
```

:::info Why Nodes?
**Modularity**: If your vision algorithm crashes, only that node stops - the rest of your robot keeps running!
**Reusability**: Write a camera node once, use it across multiple projects.
**Testability**: Test each component in isolation.
:::

#### 2. Topics - The Communication Highway

**Topics** are named channels where nodes publish and subscribe to messages.

**Real-World Analogy:**
- Topics are like YouTube channels
- Publishers are content creators
- Subscribers are viewers
- Messages are videos

**Example:** Camera image streaming
```
[Camera Node] --publishes--> [/camera/image] <--subscribes-- [Vision Node]
```

**Message Flow:**
1. Camera node captures an image at 30 Hz
2. Publishes it to `/camera/image` topic
3. Vision node subscribes to this topic
4. Receives the image and processes it

Multiple nodes can publish to the same topic, and multiple nodes can subscribe to it.

#### 3. Messages - The Data Format

**Messages** are strongly-typed data structures sent over topics.

**Common Message Types:**
- `sensor_msgs/Image` - Camera images
- `geometry_msgs/Twist` - Velocity commands (linear + angular)
- `sensor_msgs/LaserScan` - LiDAR data
- `std_msgs/String` - Simple text

```python
# Publishing a Twist message (we'll practice this soon)
from geometry_msgs.msg import Twist

cmd = Twist()
cmd.linear.x = 0.5   # Move forward at 0.5 m/s
cmd.angular.z = 0.1  # Turn slightly left
publisher.publish(cmd)
```

#### 4. Services - Request/Response Pattern

**Services** enable synchronous, one-time operations.

**Topics vs Services:**
| Feature | Topics | Services |
|---------|--------|----------|
| Pattern | Publish/Subscribe | Request/Response |
| Communication | Continuous stream | One-time call |
| Use Case | Sensor data (cameras, LiDAR) | Commands ("reset odometry", "add two numbers") |
| Response | None | Always returns a response |

**Example:** Reset odometry service
```
[Client] --request--> [/reset_odometry] --response--> [Client]
         "Please reset"                   "Success!"
```

:::warning When to Use Services
Services should return **quickly** (< 1 second). For long-running tasks, use **Actions** instead.
:::

#### 5. Actions - Long-Running Tasks

**Actions** are for tasks that:
- Take significant time (seconds to minutes)
- Provide periodic feedback
- Can be canceled mid-execution

**Example:** Navigate to a location
```
[Client] --goal--> [/navigate_to_pose]
         "Go to (x=2, y=5)"

         <-- feedback -- "50% complete, 5 meters remaining"
         <-- feedback -- "75% complete, 2 meters remaining"
         <-- result --- "Success! Arrived at goal"
```

**Real-world use cases:**
- Navigation to a waypoint
- Grasping an object
- Following a trajectory

### ROS 2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Your Robot System                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐   /cmd_vel     ┌──────────┐              │
│  │ Keyboard │ ────(Topic)───> │  Motor   │              │
│  │   Node   │                 │ Control  │              │
│  └──────────┘                 └──────────┘              │
│                                                          │
│  ┌──────────┐  /camera/image  ┌──────────┐             │
│  │  Camera  │ ────(Topic)────> │  Object  │             │
│  │   Node   │                  │ Detection│             │
│  └──────────┘                  └──────────┘             │
│                                      │                   │
│                                      v                   │
│                              /detected_objects           │
│                                                          │
│  ┌──────────────┐          ┌──────────────┐            │
│  │   Planning   │<─Service─│  Navigation  │            │
│  │     Node     │          │     Node     │            │
│  └──────────────┘          └──────────────┘            │
│                                                          │
├─────────────────────────────────────────────────────────┤
│            ROS 2 Middleware (DDS)                        │
│        Handles all communication automatically!          │
└─────────────────────────────────────────────────────────┘
```

### ROS 2 vs ROS 1

If you've heard of ROS 1, here's what changed:

| Feature | ROS 1 | ROS 2 |
|---------|-------|-------|
| **Real-time** | Not supported | Full real-time support |
| **Security** | None | Built-in DDS security (encryption, authentication) |
| **Multi-robot** | Difficult (requires master) | Native support (no master node) |
| **Platforms** | Linux only | Linux, Windows, macOS, embedded |
| **Production** | Research-focused | Production-ready |
| **Quality of Service** | Best-effort only | Configurable (reliable, best-effort, etc.) |
| **Support** | EOL in 2025 | Active development |

:::warning Important
We're learning **ROS 2 (Humble or newer)**, NOT ROS 1. ROS 1 reaches end-of-life in 2025. Always use ROS 2 for new projects.
:::

### Installing ROS 2 Humble

#### System Requirements
- **OS**: Ubuntu 22.04 LTS (Jammy Jellyfish)
- **Alternatives**: Windows 10/11, macOS (with limitations), Docker
- **Python**: 3.10+

#### Installation Steps (Ubuntu 22.04)

```bash
# 1. Set locale
sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

# 2. Setup sources
sudo apt install software-properties-common
sudo add-apt-repository universe

# 3. Add ROS 2 GPG key
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
  -o /usr/share/keyrings/ros-archive-keyring.gpg

# 4. Add repository to sources list
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

# 5. Install ROS 2 Humble Desktop (includes RViz, rqt, demos)
sudo apt update
sudo apt upgrade
sudo apt install ros-humble-desktop

# 6. Install development tools
sudo apt install python3-colcon-common-extensions python3-rosdep
```

#### Verify Installation

```bash
# Source ROS 2 environment (required in every new terminal)
source /opt/ros/humble/setup.bash

# Check version
ros2 --version
# Expected output: ros2 cli version 0.25.x

# List available commands
ros2 --help
```

#### Make ROS 2 Available Automatically (Recommended)

```bash
# Add to ~/.bashrc so ROS 2 is sourced in every new terminal
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

### Your First ROS 2 Demo

Let's verify everything works!

#### Terminal 1: Start a Publisher (Talker)

```bash
ros2 run demo_nodes_cpp talker
```

**Output:**
```
[INFO] [talker]: Publishing: 'Hello World: 1'
[INFO] [talker]: Publishing: 'Hello World: 2'
[INFO] [talker]: Publishing: 'Hello World: 3'
...
```

#### Terminal 2: Start a Subscriber (Listener)

```bash
ros2 run demo_nodes_cpp listener
```

**Output:**
```
[INFO] [listener]: I heard: 'Hello World: 1'
[INFO] [listener]: I heard: 'Hello World: 2'
[INFO] [listener]: I heard: 'Hello World: 3'
...
```

**What just happened?**
1. `talker` node publishes messages to the `/chatter` topic
2. `listener` node subscribes to `/chatter`
3. They discover each other automatically (no master node needed!)
4. Messages flow from talker → topic → listener

🎉 **Congratulations!** You just saw your first ROS 2 publish-subscribe communication!

### Essential Command-Line Tools

While talker/listener are running, open a **third terminal** and explore:

```bash
# List all running nodes
ros2 node list
# Output: /talker, /listener

# List active topics
ros2 topic list
# Output: /chatter, /parameter_events, /rosout

# See messages flowing on a topic (Ctrl+C to stop)
ros2 topic echo /chatter

# Get info about a topic
ros2 topic info /chatter
# Output: Type: std_msgs/msg/String
#         Publisher count: 1
#         Subscription count: 1

# See the structure of a message type
ros2 interface show std_msgs/msg/String
# Output: string data

# Get info about a node
ros2 node info /talker
```

### Practical Exercise

**Exercise 1: Explore the System**

With talker and listener running:

1. Run `rqt_graph` to visualize the communication:
```bash
# Install rqt tools if needed
sudo apt install ros-humble-rqt*

# Launch graph visualizer
rqt_graph
```

You'll see a visual diagram: `talker` → `/chatter` → `listener`

2. Monitor topic frequency:
```bash
ros2 topic hz /chatter
# Shows publishing rate (approximately 1 Hz)
```

3. Publish a message manually:
```bash
ros2 topic pub /chatter std_msgs/msg/String "data: 'Hello from CLI!'"
```

The listener will receive your message!

**Exercise 2: Experiment**

1. What happens if you start the listener *before* the talker?
2. What happens if you start multiple talker nodes?
3. Can you find other demo nodes? (Hint: `ros2 pkg executables demo_nodes_cpp`)

### Key Takeaways

✅ **ROS 2 is middleware** that handles communication between robot components
✅ **Nodes** are independent programs performing specific tasks
✅ **Topics** enable continuous data streaming (publish/subscribe)
✅ **Services** enable one-time request/response calls
✅ **Actions** handle long-running tasks with feedback and cancellation
✅ **Messages** define strongly-typed data structures
✅ **No master node** - nodes discover each other automatically using DDS

### Common Beginner Mistakes

❌ **Forgetting to source**: Always run `source /opt/ros/humble/setup.bash`
❌ **Wrong ROS version**: Ensure you're using ROS 2, not ROS 1
❌ **Missing dependencies**: Install `python3-colcon-common-extensions`
❌ **Wrong Python version**: ROS 2 Humble requires Python 3.10+
❌ **Mixing distros**: Don't mix Humble packages with Foxy or Iron

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Completed beginner section, comfortable with Python and Linux

### Learning Objectives

- Understand ROS 2 vs ROS 1 architectural differences in depth
- Master DDS middleware concepts and configuration
- Implement multi-robot systems with domain IDs
- Configure Quality of Service (QoS) policies
- Use advanced introspection and debugging tools
- Optimize discovery and network performance

### ROS 2 Architecture Deep Dive

#### The Death of the Master Node

**ROS 1** used a centralized master node:
```
Master Node (roscore)
    ↓ ↓ ↓
Node1 Node2 Node3
```

Problems:
- Single point of failure
- Scalability bottleneck
- Difficult multi-robot coordination
- No real-time guarantees

**ROS 2** uses peer-to-peer DDS discovery:
```
Node1 ←→ Node2 ←→ Node3
  ↖       ↕       ↗
      Node4
```

Benefits:
- No master node needed
- Fault-tolerant
- Scales to hundreds of nodes
- Native multi-robot support
- Real-time capable

#### DDS (Data Distribution Service)

ROS 2 is built on **DDS**, an industry-standard middleware (OMG specification) used in:
- Military systems
- Medical devices
- Autonomous vehicles
- Industrial automation

**Key DDS Concepts:**
1. **Data-Centric Publish-Subscribe (DCPS)**: Topics, publishers, subscribers
2. **Discovery**: Automatic peer finding without central server
3. **Quality of Service (QoS)**: Fine-grained reliability and performance control
4. **Security**: Built-in authentication and encryption

#### DDS Implementations

ROS 2 supports multiple DDS vendors:

| Vendor | Default? | Pros | Cons |
|--------|----------|------|------|
| **Fast-DDS** (eProsima) | Yes (Humble) | Fast, feature-rich, good documentation | Higher memory usage |
| **Cyclone DDS** (Eclipse) | No | Low latency, minimal overhead | Fewer advanced features |
| **Connext DDS** (RTI) | No | Enterprise-grade, ultra-reliable | Commercial license required for production |

**Switching DDS implementation:**

```bash
# Install Cyclone DDS
sudo apt install ros-humble-rmw-cyclonedds-cpp

# Set environment variable
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp

# Verify
ros2 doctor --report | grep middleware
```

**When to switch:**
- Cyclone DDS: Lower latency, embedded systems
- Fast-DDS: Default, well-tested, good balance
- Connext: Enterprise deployments, safety-critical systems

### Domain IDs and Multi-Robot Systems

**Domain ID** isolates ROS 2 networks. Nodes with different domain IDs cannot communicate.

**Use cases:**
- Multiple robots in the same physical space
- Isolated testing environments
- Preventing interference

```bash
# Terminal 1: Robot A (domain 0 - default)
export ROS_DOMAIN_ID=0
ros2 run demo_nodes_cpp talker

# Terminal 2: Robot B (domain 1)
export ROS_DOMAIN_ID=1
ros2 run demo_nodes_cpp talker

# Terminal 3: Listen to Robot A
export ROS_DOMAIN_ID=0
ros2 topic list  # Sees Robot A's topics

# Terminal 4: Listen to Robot B
export ROS_DOMAIN_ID=1
ros2 topic list  # Sees Robot B's topics
```

**Valid range:** 0-101 for Fast-DDS, 0-232 for Cyclone DDS

**Best practices:**
- Use domain 0 for development
- Assign unique domains for each robot in production
- Document domain assignments

### Quality of Service (QoS) Policies

QoS determines **how** data is transmitted. Critical for real-world robotics.

#### Core QoS Policies

**1. Reliability**
```python
from rclpy.qos import QoSProfile, ReliabilityPolicy

# Best Effort: May lose messages (like UDP)
qos_best_effort = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    depth=10
)

# Reliable: Guarantees delivery (like TCP)
qos_reliable = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    depth=10
)
```

**When to use:**
- **Best Effort**: High-frequency sensor data (camera at 30 Hz, LiDAR at 20 Hz)
- **Reliable**: Commands, state machines, critical messages

**2. Durability**
```python
from rclpy.qos import DurabilityPolicy

# Transient Local: "Latch" behavior - new subscribers get last message
qos_transient = QoSProfile(
    durability=DurabilityPolicy.TRANSIENT_LOCAL,
    depth=1
)

# Volatile: Only live messages
qos_volatile = QoSProfile(
    durability=DurabilityPolicy.VOLATILE,
    depth=10
)
```

**When to use:**
- **Transient Local**: Maps, robot descriptions, static configurations
- **Volatile**: Real-time sensor streams

**3. History**
```python
from rclpy.qos import HistoryPolicy

# Keep Last N: Circular buffer
qos = QoSProfile(
    history=HistoryPolicy.KEEP_LAST,
    depth=10  # Keep last 10 messages
)

# Keep All: Unbounded queue (dangerous!)
qos = QoSProfile(
    history=HistoryPolicy.KEEP_ALL
)
```

**4. Liveliness**
```python
from rclpy.qos import LivelinessPolicy
import time

qos = QoSProfile(
    liveliness=LivelinessPolicy.AUTOMATIC,
    liveliness_lease_duration=time.Duration(seconds=2)
)
```

Detects if a publisher has crashed or become unresponsive.

#### QoS Matching Rules

Publishers and subscribers must have **compatible** QoS:

| Policy | Publisher | Subscriber | Compatible? |
|--------|-----------|------------|-------------|
| Reliability | Best Effort | Best Effort | ✅ Yes |
| Reliability | Reliable | Reliable | ✅ Yes |
| Reliability | Best Effort | Reliable | ❌ No |
| Reliability | Reliable | Best Effort | ✅ Yes (downgrades) |
| Durability | Transient | Transient | ✅ Yes |
| Durability | Transient | Volatile | ✅ Yes |
| Durability | Volatile | Transient | ❌ No |

**Check incompatibilities:**
```bash
ros2 topic info /my_topic -v  # verbose shows QoS
```

#### Predefined QoS Profiles

ROS 2 provides common presets:

```python
from rclpy.qos import qos_profile_sensor_data, qos_profile_system_default

# Sensor data: Best effort, volatile
pub = node.create_publisher(LaserScan, '/scan', qos_profile_sensor_data)

# System default: Reliable, volatile, depth 10
pub = node.create_publisher(String, '/status', qos_profile_system_default)
```

**Available profiles:**
- `qos_profile_sensor_data`: Best effort, keep last 5
- `qos_profile_parameters`: Reliable, transient local, keep last 1000
- `qos_profile_default`: Reliable, volatile, keep last 10
- `qos_profile_services_default`: Reliable, volatile, keep last 10
- `qos_profile_system_default`: Reliable, volatile, keep last 10

### Advanced Introspection Tools

#### 1. ros2 doctor

Diagnoses ROS 2 system health:

```bash
ros2 doctor --report

# Checks:
# - Network configuration
# - DDS middleware
# - QoS incompatibilities
# - Package installations
```

#### 2. ros2 daemon

Background service for faster CLI performance:

```bash
# Check daemon status
ros2 daemon status

# Stop daemon (if causing issues)
ros2 daemon stop

# Start daemon
ros2 daemon start
```

#### 3. ros2 bag

Record and replay data:

```bash
# Record all topics
ros2 bag record -a

# Record specific topics
ros2 bag record /camera/image /scan

# Replay
ros2 bag play my_bag

# Inspect
ros2 bag info my_bag
```

#### 4. RQt Plugins

```bash
# Console: View logs from all nodes
rqt_console

# Plot: Real-time data visualization
rqt_plot /turtle1/pose/x

# Service caller GUI
rqt

# TF tree visualization
ros2 run rqt_tf_tree rqt_tf_tree
```

### Multi-Robot Coordination Example

**Scenario**: Two turtlebots in the same room, different domains

```bash
# Terminal 1: Robot 1 (domain 10)
export ROS_DOMAIN_ID=10
export ROBOT_NAMESPACE=robot1
ros2 run turtlesim turtlesim_node --ros-args -r __ns:=/robot1

# Terminal 2: Robot 2 (domain 20)
export ROS_DOMAIN_ID=20
export ROBOT_NAMESPACE=robot2
ros2 run turtlesim turtlesim_node --ros-args -r __ns:=/robot2

# Terminal 3: Coordinator (bridge between domains)
# Use ros2 domain bridge or custom relay nodes
```

**For same domain, different namespaces:**

```bash
# Terminal 1
ros2 run turtlesim turtlesim_node --ros-args -r __ns:=/robot1

# Terminal 2
ros2 run turtlesim turtlesim_node --ros-args -r __ns:=/robot2

# Terminal 3: List topics
ros2 topic list
# /robot1/turtle1/cmd_vel
# /robot2/turtle1/cmd_vel
```

### Network Configuration

#### Localhost-Only Communication (Faster, Secure)

```bash
# Cyclone DDS: Edit ~/.bashrc
export CYCLONEDDS_URI=file:///path/to/cyclonedds.xml
```

**cyclonedds.xml**:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<CycloneDDS xmlns="https://cdds.io/config">
  <Domain>
    <General>
      <NetworkInterfaceAddress>lo</NetworkInterfaceAddress>
    </General>
  </Domain>
</CycloneDDS>
```

#### Multi-Machine Setup

**Computer A (192.168.1.100):**
```bash
export ROS_DOMAIN_ID=42
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp
ros2 run demo_nodes_cpp talker
```

**Computer B (192.168.1.101):**
```bash
export ROS_DOMAIN_ID=42
export RMW_IMPLEMENTATION=rmw_fastrtps_cpp
ros2 run demo_nodes_cpp listener
```

Nodes discover each other automatically over the network!

**Troubleshooting:**
- Ensure computers are on the same subnet
- Check firewall rules (UDP multicast required)
- Verify with `ping` and `ifconfig`

### Key Takeaways (Intermediate)

✅ ROS 2 uses **peer-to-peer DDS discovery** (no master node)
✅ **Domain IDs** isolate ROS 2 networks for multi-robot systems
✅ **QoS policies** control reliability, durability, and performance
✅ **QoS compatibility** matters: check with `ros2 topic info -v`
✅ **DDS vendors** (Fast-DDS, Cyclone DDS) have performance trade-offs
✅ Use **ros2 doctor** to diagnose system issues

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed, experience with distributed systems

### Learning Objectives

- Configure ROS 2 for hard real-time systems
- Implement custom DDS QoS profiles for production
- Deploy SROS2 security for encrypted communication
- Optimize discovery and bandwidth for large-scale deployments
- Cross-compile for embedded and edge platforms
- Profile and benchmark ROS 2 performance
- Design production-grade system architectures

### Real-Time ROS 2

ROS 2 can achieve **deterministic, real-time** behavior with proper configuration.

#### Real-Time Operating Systems (RTOS)

**Standard Linux** is not real-time:
- Process scheduling is best-effort
- Kernel preemption causes jitter
- Memory allocation can block

**Real-Time Linux** patches (PREEMPT_RT):
```bash
# Check if RT kernel is installed
uname -a | grep PREEMPT_RT

# If not, install (Ubuntu):
sudo apt install linux-image-rt-amd64
sudo reboot
```

#### Real-Time Node Configuration

```python
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy
from rclpy.executors import StaticSingleThreadedExecutor
import os

class RealtimeNode(Node):
    def __init__(self):
        super().__init__('realtime_node')

        # Lock memory to prevent page faults
        self.lock_memory()

        # Set thread priority
        self.set_priority()

        # Use reliable QoS with strict deadlines
        qos = QoSProfile(
            reliability=ReliabilityPolicy.RELIABLE,
            history=HistoryPolicy.KEEP_LAST,
            depth=1,
            deadline=Duration(seconds=0, nanoseconds=10_000_000)  # 10ms deadline
        )

        self.timer = self.create_timer(0.001, self.timer_callback)  # 1kHz

    def lock_memory(self):
        """Prevent memory from being swapped to disk"""
        try:
            import ctypes
            libc = ctypes.CDLL('libc.so.6')
            MCL_CURRENT = 1
            MCL_FUTURE = 2
            libc.mlockall(MCL_CURRENT | MCL_FUTURE)
        except Exception as e:
            self.get_logger().warn(f'Could not lock memory: {e}')

    def set_priority(self):
        """Set real-time priority"""
        try:
            import os
            os.sched_setscheduler(0, os.SCHED_FIFO, os.sched_param(80))
        except PermissionError:
            self.get_logger().warn('Run with sudo for real-time priority')

    def timer_callback(self):
        # High-frequency real-time loop
        pass

def main():
    rclpy.init()
    node = RealtimeNode()

    # Use static executor for deterministic behavior
    executor = StaticSingleThreadedExecutor()
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

**Run with real-time priority:**
```bash
sudo chrt -f 80 python3 realtime_node.py
```

#### Benchmarking Real-Time Performance

```bash
# Install performance tools
sudo apt install ros-humble-performance-test

# Run latency test
ros2 run performance_test perf_test \
  -c rclcpp-single-threaded-executor \
  -t Array1k --max_runtime 30
```

### Advanced QoS Configuration

#### Custom QoS Profile for Critical Systems

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy, \
                       HistoryPolicy, LivelinessPolicy
from rclpy.duration import Duration

# Safety-critical profile: no message loss, detect failures
safety_critical_qos = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.TRANSIENT_LOCAL,
    history=HistoryPolicy.KEEP_LAST,
    depth=10,
    liveliness=LivelinessPolicy.AUTOMATIC,
    liveliness_lease_duration=Duration(seconds=1),
    deadline=Duration(seconds=0, nanoseconds=100_000_000)  # 100ms max latency
)

# High-throughput profile: sacrifice reliability for speed
high_throughput_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    durability=DurabilityPolicy.VOLATILE,
    history=HistoryPolicy.KEEP_LAST,
    depth=1  # Only latest message matters
)

# Map distribution profile: late-joiners get map
map_qos = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.TRANSIENT_LOCAL,
    history=HistoryPolicy.KEEP_LAST,
    depth=1  # Only need latest map
)
```

#### QoS Event Callbacks

Detect QoS policy violations:

```python
from rclpy.event_handler import PublisherEventCallbacks, SubscriptionEventCallbacks
from rclpy.qos_event import QoSLivelinessLostInfo, QoSDeadlineMissedInfo

class QoSMonitor(Node):
    def __init__(self):
        super().__init__('qos_monitor')

        # Publisher callbacks
        pub_callbacks = PublisherEventCallbacks(
            deadline_callback=self.pub_deadline_missed,
            liveliness_callback=self.pub_liveliness_lost
        )

        # Subscriber callbacks
        sub_callbacks = SubscriptionEventCallbacks(
            deadline_callback=self.sub_deadline_missed,
            liveliness_callback=self.sub_liveliness_lost
        )

        self.pub = self.create_publisher(
            String, '/critical_data',
            10,
            event_callbacks=pub_callbacks
        )

        self.sub = self.create_subscription(
            String, '/critical_data',
            self.callback,
            10,
            event_callbacks=sub_callbacks
        )

    def pub_deadline_missed(self, event: QoSDeadlineMissedInfo):
        self.get_logger().error(f'Publisher deadline missed: {event.total_count}')

    def pub_liveliness_lost(self, event):
        self.get_logger().error('Publisher liveliness lost')

    def sub_deadline_missed(self, event: QoSDeadlineMissedInfo):
        self.get_logger().error(f'Subscriber deadline missed: {event.total_count}')

    def sub_liveliness_lost(self, event):
        self.get_logger().error('Subscriber liveliness lost')

    def callback(self, msg):
        pass
```

### SROS2: Secure ROS 2

Enable encryption, authentication, and access control.

#### Setup Security Enclave

```bash
# Install SROS2
sudo apt install ros-humble-sros2

# Create keystore
ros2 security create_keystore ~/sros2_keystore

# Create keys for a node
ros2 security create_enclave ~/sros2_keystore /my_robot/camera_node
ros2 security create_enclave ~/sros2_keystore /my_robot/vision_node

# List enclaves
ros2 security list_enclaves ~/sros2_keystore
```

#### Run Nodes with Security

```bash
# Set environment variables
export ROS_SECURITY_KEYSTORE=~/sros2_keystore
export ROS_SECURITY_ENABLE=true
export ROS_SECURITY_STRATEGY=Enforce

# Run secured node
ros2 run my_package camera_node --ros-args --enclave /my_robot/camera_node
```

**Nodes without valid certificates will be rejected!**

#### Define Access Control Policies

**permissions.xml** (in enclave folder):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<policy version="0.2.0">
  <enclaves>
    <enclave path="/my_robot/camera_node">
      <profiles>
        <profile ns="/" node="camera_node">
          <topics publish="ALLOW" subscribe="DENY">
            <topic>/camera/image</topic>
          </topics>
          <services reply="DENY" request="DENY"/>
          <actions call="DENY" execute="DENY"/>
        </profile>
      </profiles>
    </enclave>
  </enclaves>
</policy>
```

### DDS Tuning for Production

#### Fast-DDS Configuration

**fastdds.xml**:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<dds xmlns="http://www.eprosima.com/XMLSchemas/fastRTPS_Profiles">
  <profiles>
    <transport_descriptors>
      <transport_descriptor>
        <transport_id>SharedMemTransport</transport_id>
        <type>SHM</type>
      </transport_descriptor>
    </transport_descriptors>

    <participant profile_name="default_participant">
      <rtps>
        <builtin>
          <discovery_config>
            <leaseDuration>
              <sec>10</sec>
            </leaseDuration>
          </discovery_config>
        </builtin>

        <useBuiltinTransports>false</useBuiltinTransports>
        <userTransports>
          <transport_id>SharedMemTransport</transport_id>
        </userTransports>
      </rtps>
    </participant>
  </profiles>
</dds>
```

**Enable:**
```bash
export FASTRTPS_DEFAULT_PROFILES_FILE=/path/to/fastdds.xml
```

**Shared memory transport** provides:
- Zero-copy for same-machine communication
- 10-100x lower latency
- Reduced CPU usage

### Cross-Platform Deployment

#### Docker Containerization

**Dockerfile**:
```dockerfile
FROM ros:humble

# Install dependencies
RUN apt-get update && apt-get install -y \
    ros-humble-navigation2 \
    ros-humble-slam-toolbox \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace
COPY ./my_robot_ws /ros_ws
WORKDIR /ros_ws

# Build
RUN . /opt/ros/humble/setup.sh && \
    colcon build --cmake-args -DCMAKE_BUILD_TYPE=Release

# Entrypoint
CMD ["bash", "-c", "source /opt/ros/humble/setup.bash && \
                     source /ros_ws/install/setup.bash && \
                     ros2 launch my_robot_bringup robot.launch.py"]
```

**Run:**
```bash
docker build -t my_robot:humble .
docker run --net=host my_robot:humble
```

#### Embedded Cross-Compilation (Raspberry Pi)

```bash
# Install cross-compiler
sudo apt install crossbuild-essential-armhf

# Setup ROS 2 for ARM
mkdir -p ~/ros2_arm/src
cd ~/ros2_arm

# Clone minimal ROS 2 repos
vcs import src < ros2.repos

# Cross-compile
colcon build \
  --cmake-args \
    -DCMAKE_TOOLCHAIN_FILE=~/toolchain-arm.cmake \
    -DBUILD_TESTING=OFF
```

### Performance Profiling

#### CPU Profiling with perf

```bash
# Record performance data
sudo perf record -g ros2 run my_package my_node

# Generate report
sudo perf report
```

#### Memory Profiling with Valgrind

```bash
valgrind --tool=massif ros2 run my_package my_node

# Analyze
ms_print massif.out.*
```

#### ROS 2 Tracing with ros2_tracing

```bash
# Install
sudo apt install ros-humble-ros2trace

# Trace a node
ros2 trace my_node

# Analyze with Trace Compass
tracecompass
```

### Production Architecture Patterns

#### Fault-Tolerant System

```python
from rclpy.node import Node
from rclpy.executors import MultiThreadedExecutor
import signal
import sys

class FaultTolerantNode(Node):
    def __init__(self):
        super().__init__('fault_tolerant_node')

        # Watchdog timer
        self.watchdog_timer = self.create_timer(1.0, self.watchdog_callback)
        self.last_heartbeat = self.get_clock().now()

        # Health monitoring
        self.create_subscription(Heartbeat, '/system/heartbeat',
                                  self.heartbeat_callback, 10)

        # Graceful shutdown handler
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

    def watchdog_callback(self):
        """Detect system failures"""
        now = self.get_clock().now()
        if (now - self.last_heartbeat).nanoseconds > 5e9:  # 5 seconds
            self.get_logger().error('System heartbeat lost - initiating recovery')
            self.emergency_stop()

    def heartbeat_callback(self, msg):
        self.last_heartbeat = self.get_clock().now()

    def emergency_stop(self):
        """Safe shutdown procedure"""
        self.get_logger().warn('Emergency stop initiated')
        # Stop motors, save state, etc.

    def signal_handler(self, sig, frame):
        """Handle Ctrl+C gracefully"""
        self.get_logger().info('Shutdown signal received')
        self.emergency_stop()
        sys.exit(0)
```

#### High-Availability Deployment

```yaml
# docker-compose.yml for redundant nodes
version: '3.8'
services:
  navigation_primary:
    image: my_robot:humble
    command: ros2 run my_robot navigation_node --ros-args -p mode:=primary
    restart: always

  navigation_backup:
    image: my_robot:humble
    command: ros2 run my_robot navigation_node --ros-args -p mode:=backup
    restart: always
    depends_on:
      - navigation_primary
```

### Key Takeaways (Advanced)

✅ **Real-time ROS 2** requires RT kernel + memory locking + priority scheduling
✅ **SROS2** provides encryption and authentication for production systems
✅ **Custom QoS profiles** optimize for specific use cases (safety, throughput, latency)
✅ **Shared memory transport** dramatically reduces intra-machine latency
✅ **Performance profiling** with perf, valgrind, and ros2_tracing
✅ **Production patterns**: fault tolerance, health monitoring, graceful shutdown

---

## Additional Resources

**Official Documentation:**
- [ROS 2 Humble Docs](https://docs.ros.org/en/humble/index.html)
- [ROS 2 Tutorials](https://docs.ros.org/en/humble/Tutorials.html)
- [Topics vs Services vs Actions](https://docs.ros.org/en/humble/How-To-Guides/Topics-Services-Actions.html)

**DDS & Middleware:**
- [About Quality of Service Settings](https://docs.ros.org/en/humble/Concepts/Intermediate/About-Quality-of-Service-Settings.html)
- [Fast-DDS Documentation](https://fast-dds.docs.eprosima.com/)
- [Cyclone DDS GitHub](https://github.com/eclipse-cyclonedds/cyclonedds)

**Security:**
- [SROS2 Tutorial](https://docs.ros.org/en/humble/Tutorials/Advanced/Security/Introducing-ros2-security.html)

**Real-Time:**
- [Real-time Programming in ROS 2](https://docs.ros.org/en/humble/Tutorials/Miscellaneous/Real-Time-Programming.html)

---

## Quiz

### Beginner
1. What is the difference between a topic and a service in ROS 2?
2. Why doesn't ROS 2 require a master node like ROS 1?
3. What command lists all running nodes?
4. When should you use actions instead of services?

### Intermediate
5. Explain the difference between RELIABLE and BEST_EFFORT QoS reliability policies.
6. How do domain IDs help in multi-robot systems?
7. What are the trade-offs between Fast-DDS and Cyclone DDS?
8. What does TRANSIENT_LOCAL durability do?

### Advanced
9. How would you configure a ROS 2 node for hard real-time operation?
10. Explain the QoS matching rules for reliability policies.
11. What are the security benefits of SROS2?
12. How does shared memory transport improve performance?

---

**Next:** [Nodes & Topics →](./02-nodes-topics.md)

---

**Sources:**
- [ROS 2 Humble Documentation](https://docs.ros.org/en/humble/index.html)
- [ROS 2 Tutorials](https://docs.ros.org/en/humble/Tutorials.html)
- [Writing a simple publisher and subscriber (Python)](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html)
- [Understanding Services](https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Services/Understanding-ROS2-Services.html)
- [Understanding Actions](https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Actions/Understanding-ROS2-Actions.html)
- [Topics vs Services vs Actions](https://docs.ros.org/en/humble/How-To-Guides/Topics-Services-Actions.html)
