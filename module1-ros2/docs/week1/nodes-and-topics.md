---
sidebar_position: 2
---

# Nodes and Topics - Hands-On

**Level**: Beginner
**Duration**: 3 hours
**Prerequisites**: ROS 2 Architecture lesson completed

## Learning Objectives

- Create your first custom ROS 2 node in Python
- Publish messages to a topic
- Subscribe to topics and process data
- Understand Quality of Service (QoS) basics

## Creating Your First Node

###Step 1: Create a Workspace

A **workspace** is a directory where you develop ROS 2 packages.

```bash
# Create workspace directory
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src

# Verify you're in the right place
pwd
# Should show: /home/your_username/ros2_ws/src
```

### Step 2: Create a Package

```bash
# Create a Python package named 'my_robot_controller'
ros2 pkg create --build-type ament_python my_robot_controller

# Navigate into the package
cd my_robot_controller
```

**What just happened?**
- Created a ROS 2 package with Python support
- Generated standard files: `package.xml`, `setup.py`, `setup.cfg`

**Directory structure**:
```
my_robot_controller/
├── my_robot_controller/
│   └── __init__.py
├── resource/
│   └── my_robot_controller
├── test/
├── package.xml
├── setup.cfg
└── setup.py
```

### Step 3: Write Your First Node

Create a file `my_robot_controller/my_first_node.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node

class MyFirstNode(Node):
    """
    A simple ROS 2 node that prints messages.
    This is your first step into ROS 2 programming!
    """

    def __init__(self):
        # Initialize the node with a name
        super().__init__('my_first_node')

        # Print a startup message
        self.get_logger().info('Hello from my first ROS 2 node!')

        # Create a timer that calls our callback every second
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.counter = 0

    def timer_callback(self):
        """This function is called every second"""
        self.counter += 1
        self.get_logger().info(f'Heartbeat {self.counter} - Node is alive!')

def main(args=None):
    # Initialize ROS 2
    rclpy.init(args=args)

    # Create our node
    node = MyFirstNode()

    # Keep the node running
    rclpy.spin(node)

    # Cleanup when done
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Code Breakdown**:
1. **`rclpy.init()`**: Initializes ROS 2 Python client library
2. **`Node.__init__('my_first_node')`**: Creates a node with a name
3. **`create_timer(1.0, callback)`**: Creates a timer (1 second interval)
4. **`get_logger().info()`**: Prints messages with timestamps
5. **`rclpy.spin()`**: Keeps node running until Ctrl+C
6. **`rclpy.shutdown()`**: Cleans up resources

### Step 4: Update setup.py

Edit `setup.py` to add your node as an entry point:

```python
from setuptools import setup

package_name = 'my_robot_controller'

setup(
    name=package_name,
    version='0.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='your_name',
    maintainer_email='your_email@example.com',
    description='My first ROS 2 package',
    license='Apache License 2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'my_first_node = my_robot_controller.my_first_node:main'
        ],
    },
)
```

### Step 5: Build and Run

```bash
# Navigate to workspace root
cd ~/ros2_ws

# Build the package
colcon build --packages-select my_robot_controller

# Source the workspace (IMPORTANT!)
source install/setup.bash

# Run your node
ros2 run my_robot_controller my_first_node
```

**Expected Output**:
```
[INFO] [my_first_node]: Hello from my first ROS 2 node!
[INFO] [my_first_node]: Heartbeat 1 - Node is alive!
[INFO] [my_first_node]: Heartbeat 2 - Node is alive!
[INFO] [my_first_node]: Heartbeat 3 - Node is alive!
...
```

🎉 **Congratulations!** You just created and ran your first custom ROS 2 node!

## Publisher - Sending Messages

Now let's make our node **publish** data to a topic.

### Create a Publisher Node

Create `my_robot_controller/robot_news_station.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class RobotNewsStation(Node):
    """
    Publisher node that broadcasts robot status updates.
    Like a news station for your robot!
    """

    def __init__(self):
        super().__init__('robot_news_station')

        # Create a publisher
        # Topic: /robot_news
        # Message type: String
        # Queue size: 10 messages
        self.publisher_ = self.create_publisher(String, 'robot_news', 10)

        # Publish every 2 seconds
        self.timer = self.create_timer(2.0, self.publish_news)

        self.get_logger().info('Robot News Station is ON AIR!')

    def publish_news(self):
        """Publish a news message"""
        msg = String()
        msg.data = 'Robot is operational and ready for commands!'

        # Publish the message
        self.publisher_.publish(msg)

        # Log what we published
        self.get_logger().info(f'Publishing: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    node = RobotNewsStation()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Key Concepts**:
- **`create_publisher(msg_type, topic_name, qos)`**: Creates a publisher
- **`String()`**: Message object from `std_msgs`
- **`publisher_.publish(msg)`**: Sends the message

### Update setup.py

Add the new node:

```python
entry_points={
    'console_scripts': [
        'my_first_node = my_robot_controller.my_first_node:main',
        'robot_news_station = my_robot_controller.robot_news_station:main'
    ],
},
```

### Build and Run

```bash
# Rebuild
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash

# Run the publisher
ros2 run my_robot_controller robot_news_station
```

### Test the Publisher

In a **second terminal**:

```bash
# Source ROS 2
source /opt/ros/humble/setup.bash

# Listen to the topic
ros2 topic echo /robot_news
```

You should see:
```
data: 'Robot is operational and ready for commands!'
---
data: 'Robot is operational and ready for commands!'
---
```

## Subscriber - Receiving Messages

Now let's create a node that **subscribes** to the news.

### Create a Subscriber Node

Create `my_robot_controller/smartphone.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Smartphone(Node):
    """
    Subscriber node that listens to robot news.
    Like a smartphone app showing robot status!
    """

    def __init__(self):
        super().__init__('smartphone')

        # Create a subscriber
        # Topic: /robot_news
        # Message type: String
        # Callback: self.news_callback
        self.subscription = self.create_subscription(
            String,
            'robot_news',
            self.news_callback,
            10
        )

        self.get_logger().info('Smartphone is listening to robot news...')

    def news_callback(self, msg):
        """
        This function is called every time a message arrives.
        msg: The received String message
        """
        self.get_logger().info(f'ALERT: {msg.data}')

def main(args=None):
    rclpy.init(args=args)
    node = Smartphone()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Key Concepts**:
- **`create_subscription(type, topic, callback, qos)`**: Creates a subscriber
- **`news_callback(msg)`**: Function called when message arrives
- **`msg.data`**: Access the message content

### Update setup.py

```python
entry_points={
    'console_scripts': [
        'my_first_node = my_robot_controller.my_first_node:main',
        'robot_news_station = my_robot_controller.robot_news_station:main',
        'smartphone = my_robot_controller.smartphone:main'
    ],
},
```

### Test Publisher + Subscriber

```bash
# Rebuild
cd ~/ros2_ws
colcon build --packages-select my_robot_controller
source install/setup.bash

# Terminal 1: Run publisher
ros2 run my_robot_controller robot_news_station

# Terminal 2: Run subscriber
ros2 run my_robot_controller smartphone
```

**Terminal 1 (Publisher)**:
```
[INFO] [robot_news_station]: Publishing: "Robot is operational..."
```

**Terminal 2 (Subscriber)**:
```
[INFO] [smartphone]: ALERT: Robot is operational and ready for commands!
```

🎊 **Success!** Your nodes are talking to each other!

## Practical Example: Robot Speed Controller

Let's build something more realistic - a robot that listens to speed commands.

### Create Speed Commander (Publisher)

Create `my_robot_controller/speed_commander.py`:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class SpeedCommander(Node):
    """Sends velocity commands to a robot"""

    def __init__(self):
        super().__init__('speed_commander')
        self.publisher_ = self.create_publisher(Twist, 'cmd_vel', 10)
        self.timer = self.create_timer(1.0, self.send_command)

        self.forward = True  # Toggle between forward and turn

    def send_command(self):
        msg = Twist()

        if self.forward:
            msg.linear.x = 0.5  # Move forward at 0.5 m/s
            msg.angular.z = 0.0
            self.get_logger().info('Command: Move Forward')
        else:
            msg.linear.x = 0.0
            msg.angular.z = 0.3  # Turn at 0.3 rad/s
            self.get_logger().info('Command: Turn Left')

        self.publisher_.publish(msg)
        self.forward = not self.forward  # Toggle

def main(args=None):
    rclpy.init(args=args)
    node = SpeedCommander()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**New Message Type: `Twist`**
- `linear.x`: Forward/backward speed (m/s)
- `linear.y`: Left/right speed (m/s, rarely used)
- `angular.z`: Rotation speed (rad/s)

## Quality of Service (QoS)

**QoS** determines how messages are delivered. Think of it like shipping options:

| QoS Setting | Like... | Use For |
|-------------|---------|---------|
| Best Effort | Regular mail | Non-critical data (e.g., camera preview) |
| Reliable | Certified mail | Critical data (e.g., safety commands) |
| Volatile | Latest news only | You only care about newest data |
| Transient Local | Saved news | New subscribers get old messages |

### Example with Custom QoS

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

# Create custom QoS profile
qos_profile = QoSProfile(
    reliability=ReliabilityPolicy.RELIABLE,  # Guarantee delivery
    history=HistoryPolicy.KEEP_LAST,
    depth=10
)

# Use in publisher
self.publisher_ = self.create_publisher(
    String,
    'critical_messages',
    qos_profile
)
```

## Debugging Tools

### 1. Check if Node is Running

```bash
ros2 node list
# Should show: /robot_news_station, /smartphone, etc.
```

### 2. See Node Information

```bash
ros2 node info /robot_news_station
# Shows: publishers, subscribers, services, actions
```

### 3. Monitor Topic Data

```bash
# See messages in real-time
ros2 topic echo /robot_news

# See topic frequency
ros2 topic hz /robot_news

# See message bandwidth
ros2 topic bw /robot_news
```

### 4. Visualize with rqt_graph

```bash
rqt_graph
```

This shows all nodes and topics as a visual graph!

## Hands-On Lab

**Mission**: Create a temperature monitoring system

### Requirements:
1. **Publisher Node**: Simulates a temperature sensor
   - Publishes to `/temperature` topic
   - Uses `std_msgs/Float64`
   - Sends random temperature (20-30°C) every second

2. **Subscriber Node**: Temperature monitor
   - Subscribes to `/temperature`
   - Logs warning if temp > 27°C
   - Logs alert if temp > 29°C

### Starter Code

```python
# temperature_sensor.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64
import random

class TemperatureSensor(Node):
    def __init__(self):
        super().__init__('temperature_sensor')
        self.publisher_ = self.create_publisher(Float64, 'temperature', 10)
        self.timer = self.create_timer(1.0, self.publish_temperature)

    def publish_temperature(self):
        msg = Float64()
        msg.data = random.uniform(20.0, 30.0)  # Random temp
        self.publisher_.publish(msg)
        self.get_logger().info(f'Temperature: {msg.data:.2f}°C')

# TODO: Add main() function
```

```python
# temperature_monitor.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64

class TemperatureMonitor(Node):
    def __init__(self):
        super().__init__('temperature_monitor')
        self.subscription = self.create_subscription(
            Float64,
            'temperature',
            self.temperature_callback,
            10
        )

    def temperature_callback(self, msg):
        temp = msg.data
        if temp > 29.0:
            self.get_logger().error(f'🚨 ALERT! Temperature critical: {temp:.2f}°C')
        elif temp > 27.0:
            self.get_logger().warn(f'⚠️  WARNING! Temperature high: {temp:.2f}°C')
        else:
            self.get_logger().info(f'✅ Temperature normal: {temp:.2f}°C')

# TODO: Add main() function
```

**Challenge**: Add a third node that subscribes to temperature and publishes `True/False` to a `/cooling_system` topic when temperature exceeds 28°C.

## Common Issues & Solutions

### Issue 1: "Module not found"
```
ModuleNotFoundError: No module named 'my_robot_controller'
```
**Solution**: Did you forget to build and source?
```bash
cd ~/ros2_ws
colcon build
source install/setup.bash
```

### Issue 2: Node not showing up
```bash
ros2 node list  # Empty!
```
**Solution**: Is the node running in another terminal?

### Issue 3: No messages received
**Solution**: Check if publisher and subscriber use the **exact same topic name**
```bash
ros2 topic list  # Verify topic exists
ros2 topic info /robot_news  # Check pub/sub count
```

## Key Takeaways

✅ **Nodes** are created by inheriting from `rclpy.node.Node`
✅ **Publishers** send messages using `create_publisher()` and `.publish()`
✅ **Subscribers** receive messages using `create_subscription()` with a callback
✅ **Messages** must have the correct type (String, Twist, Float64, etc.)
✅ **QoS** controls message delivery reliability and history
✅ **Always** rebuild (`colcon build`) and source after changes

## Next Lesson

In the next lesson, we'll learn about **Publisher-Subscriber Patterns** and build a turtle robot controller!

---

**Previous**: [ROS 2 Architecture](./ros2-architecture.md) | **Next**: [Publisher-Subscriber Pattern](./publisher-subscriber.md)
