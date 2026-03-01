"""
Seed Learning Content

Populates the database with learning modules and lessons
for all skill levels (beginner, intermediate, advanced).
"""

from uuid import uuid4
from src.db.database import SessionLocal
from src.models.learning_content import LearningModule, Lesson


def seed_content():
    """Seed learning content for all skill levels."""
    db = SessionLocal()

    try:
        # Clear existing content
        db.query(Lesson).delete()
        db.query(LearningModule).delete()
        db.commit()

        print("Seeding learning content...")

        # ============================================================
        # BEGINNER CONTENT
        # ============================================================

        # Module 1: Foundations - Programming Basics
        foundations_beginner = LearningModule(
            id=uuid4(),
            title="Programming Fundamentals",
            description="Learn the basics of programming with Python - the foundation for robotics development",
            skill_level="beginner",
            category="foundations",
            order=1,
            icon="🐍",
            estimated_hours=20,
            prerequisites=[],
            learning_objectives=[
                "Understand variables, data types, and operators",
                "Write functions and use control structures",
                "Work with lists, dictionaries, and file I/O",
                "Debug simple programs"
            ]
        )
        db.add(foundations_beginner)

        # Lessons for Programming Fundamentals
        lessons_prog_basics = [
            Lesson(
                id=uuid4(),
                module_id=foundations_beginner.id,
                title="Python Basics: Variables and Data Types",
                description="Learn about variables, numbers, strings, and basic operations",
                content_type="tutorial",
                content_text="""# Python Variables and Data Types

## What are Variables?
Variables are containers for storing data values. Think of them as labeled boxes.

## Basic Data Types

### Numbers
```python
age = 25  # Integer
height = 5.9  # Float
```

### Strings
```python
name = "Robot"
message = 'Hello, World!'
```

### Booleans
```python
is_active = True
is_sleeping = False
```

## Try it yourself:
Create variables for a robot's properties (name, speed, battery_level).""",
                order=1,
                duration_minutes=30,
                difficulty="easy",
                tags=["python", "basics", "variables"]
            ),
            Lesson(
                id=uuid4(),
                module_id=foundations_beginner.id,
                title="Control Flow: If Statements and Loops",
                description="Learn how to make decisions and repeat actions in your code",
                content_type="tutorial",
                content_text="""# Control Flow

## If Statements - Making Decisions

```python
battery_level = 20

if battery_level < 30:
    print("Battery low! Returning to base...")
elif battery_level < 60:
    print("Battery medium")
else:
    print("Battery full")
```

## Loops - Repeating Actions

### For Loops
```python
for i in range(5):
    print(f"Moving forward: step {i}")
```

### While Loops
```python
distance = 0
while distance < 100:
    distance += 10
    print(f"Traveled {distance}cm")
```

## Exercise:
Write a program that makes a robot patrol 10 times.""",
                order=2,
                duration_minutes=45,
                difficulty="easy",
                tags=["python", "control-flow", "loops"]
            ),
            Lesson(
                id=uuid4(),
                module_id=foundations_beginner.id,
                title="Functions: Reusable Code",
                description="Learn to organize code into reusable functions",
                content_type="tutorial",
                content_text="""# Functions

## What are Functions?
Functions are reusable blocks of code that perform specific tasks.

## Creating Functions

```python
def greet_robot(name):
    return f"Hello, {name}!"

def move_forward(distance):
    print(f"Moving {distance}cm forward")
    return distance

# Using functions
robot_name = "R2D2"
greeting = greet_robot(robot_name)
print(greeting)

moved = move_forward(50)
```

## Function with Multiple Parameters

```python
def calculate_speed(distance, time):
    speed = distance / time
    return speed

robot_speed = calculate_speed(100, 5)  # 20 cm/s
print(f"Robot speed: {robot_speed} cm/s")
```

## Exercise:
Create functions for a robot: turn_left(), turn_right(), check_obstacle()""",
                order=3,
                duration_minutes=40,
                difficulty="easy",
                tags=["python", "functions", "code-organization"]
            )
        ]

        for lesson in lessons_prog_basics:
            db.add(lesson)

        # Module 2: ROS2 Basics for Beginners
        ros2_beginner = LearningModule(
            id=uuid4(),
            title="ROS2 Fundamentals",
            description="Introduction to ROS2 - the Robot Operating System used by professionals worldwide",
            skill_level="beginner",
            category="ros2",
            order=2,
            icon="🤖",
            estimated_hours=25,
            prerequisites=["Basic Python knowledge"],
            learning_objectives=[
                "Understand what ROS2 is and why it's used",
                "Set up a ROS2 development environment",
                "Create simple ROS2 nodes",
                "Publish and subscribe to topics"
            ]
        )
        db.add(ros2_beginner)

        lessons_ros2_basics = [
            Lesson(
                id=uuid4(),
                module_id=ros2_beginner.id,
                title="What is ROS2?",
                description="Understand the Robot Operating System and its role in robotics",
                content_type="reading",
                content_text="""# What is ROS2?

## Introduction
ROS2 (Robot Operating System 2) is a flexible framework for writing robot software. It's a collection of tools, libraries, and conventions that simplify creating complex robot behaviors.

## Why Use ROS2?

### 1. **Communication Made Easy**
- Robots have many parts: cameras, motors, sensors
- ROS2 helps these parts talk to each other
- Like a messenger service for robot components

### 2. **Pre-built Tools**
- Visualization tools (RViz)
- Simulation (Gazebo)
- Navigation stacks
- Computer vision libraries

### 3. **Industry Standard**
- Used by companies like NASA, Boston Dynamics, and universities worldwide
- Large community support
- Thousands of ready-to-use packages

## Key Concepts

### Nodes
- Independent programs that do one thing well
- Example: camera_node reads from camera, motor_node controls wheels

### Topics
- Channels where nodes send messages
- Like radio stations - nodes can broadcast or listen

### Messages
- Data packets sent between nodes
- Example: sensor data, commands, status updates

## Real-World Example
Imagine a delivery robot:
- **camera_node**: Captures images
- **detector_node**: Finds obstacles in images
- **navigator_node**: Plans path around obstacles
- **motor_node**: Controls wheel movements

All these nodes work together through ROS2!""",
                order=1,
                duration_minutes=20,
                difficulty="easy",
                tags=["ros2", "introduction", "concepts"]
            ),
            Lesson(
                id=uuid4(),
                module_id=ros2_beginner.id,
                title="Your First ROS2 Node",
                description="Create and run your first ROS2 program",
                content_type="tutorial",
                content_text="""# Creating Your First ROS2 Node

## Simple Publisher Node

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class HelloRobotNode(Node):
    def __init__(self):
        super().__init__('hello_robot')
        # Create a publisher
        self.publisher = self.create_publisher(String, 'robot_says', 10)
        # Create a timer to publish every second
        self.timer = self.create_timer(1.0, self.say_hello)
        self.counter = 0

    def say_hello(self):
        msg = String()
        msg.data = f'Hello from robot! Count: {self.counter}'
        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: {msg.data}')
        self.counter += 1

def main():
    rclpy.init()
    node = HelloRobotNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## How to Run

1. Save as `hello_robot.py`
2. Run: `python3 hello_robot.py`
3. In another terminal: `ros2 topic echo /robot_says`

## What's Happening?
- Node starts and says "Hello!" every second
- Messages are sent to the 'robot_says' topic
- Other nodes can listen to this topic

## Exercise:
Modify the code to publish robot status (battery level, position)""",
                order=2,
                duration_minutes=45,
                difficulty="easy",
                tags=["ros2", "nodes", "publisher", "hands-on"]
            )
        ]

        for lesson in lessons_ros2_basics:
            db.add(lesson)

        # Module 3: Hardware Basics
        hardware_beginner = LearningModule(
            id=uuid4(),
            title="Hardware Fundamentals",
            description="Learn about robot hardware: sensors, motors, and microcontrollers",
            skill_level="beginner",
            category="hardware",
            order=3,
            icon="⚙️",
            estimated_hours=15,
            prerequisites=[],
            learning_objectives=[
                "Understand basic electronic components",
                "Learn about common robot sensors",
                "Control motors and servos",
                "Connect Arduino to computers"
            ]
        )
        db.add(hardware_beginner)

        # ============================================================
        # INTERMEDIATE CONTENT
        # ============================================================

        # Module 4: Advanced ROS2
        ros2_intermediate = LearningModule(
            id=uuid4(),
            title="ROS2 Services and Actions",
            description="Master ROS2 services, actions, and parameters for complex robot behaviors",
            skill_level="intermediate",
            category="ros2",
            order=1,
            icon="🔧",
            estimated_hours=30,
            prerequisites=["ROS2 Fundamentals", "Python proficiency"],
            learning_objectives=[
                "Implement ROS2 services for request-response patterns",
                "Create action servers for long-running tasks",
                "Use parameters for dynamic configuration",
                "Build multi-node robot applications"
            ]
        )
        db.add(ros2_intermediate)

        lessons_ros2_intermediate = [
            Lesson(
                id=uuid4(),
                module_id=ros2_intermediate.id,
                title="ROS2 Services: Request-Response Communication",
                description="Learn to create services for synchronous robot operations",
                content_type="tutorial",
                content_text="""# ROS2 Services

## What are Services?
Services provide request-response communication, unlike topics which are one-way.

## Use Cases
- Taking a picture: request → camera responds with image
- Calculating path: send goal → planner returns path
- Checking battery: request → get current level

## Creating a Service Server

```python
from example_interfaces.srv import AddTwoInts

class ServiceNode(Node):
    def __init__(self):
        super().__init__('add_service')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_callback
        )

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'{request.a} + {request.b} = {response.sum}')
        return response
```

## Creating a Service Client

```python
class ClientNode(Node):
    def __init__(self):
        super().__init__('add_client')
        self.client = self.create_client(AddTwoInts, 'add_two_ints')

    def send_request(self, a, b):
        request = AddTwoInts.Request()
        request.a = a
        request.b = b
        future = self.client.call_async(request)
        return future
```

## Real Robot Example: Camera Trigger Service

```python
from std_srvs.srv import Trigger

class CameraService(Node):
    def __init__(self):
        super().__init__('camera_service')
        self.srv = self.create_service(
            Trigger,
            'take_picture',
            self.take_picture_callback
        )

    def take_picture_callback(self, request, response):
        # Trigger camera
        success = self.capture_image()
        response.success = success
        response.message = "Image captured!" if success else "Failed"
        return response
```

## Exercise:
Create a battery check service that returns current battery percentage""",
                order=1,
                duration_minutes=60,
                difficulty="medium",
                tags=["ros2", "services", "communication"]
            )
        ]

        for lesson in lessons_ros2_intermediate:
            db.add(lesson)

        # Module 5: Simulation with Gazebo
        simulation_intermediate = LearningModule(
            id=uuid4(),
            title="Robot Simulation with Gazebo",
            description="Learn to simulate robots in realistic 3D environments before deploying to hardware",
            skill_level="intermediate",
            category="simulation",
            order=2,
            icon="🎮",
            estimated_hours=25,
            prerequisites=["ROS2 Fundamentals", "Basic 3D concepts"],
            learning_objectives=[
                "Set up Gazebo simulation environments",
                "Create robot models (URDF)",
                "Add sensors to simulated robots",
                "Test navigation algorithms in simulation"
            ]
        )
        db.add(simulation_intermediate)

        # Module 6: Computer Vision Basics
        aiml_intermediate = LearningModule(
            id=uuid4(),
            title="Computer Vision for Robotics",
            description="Enable your robot to see and understand its environment using cameras and AI",
            skill_level="intermediate",
            category="aiml",
            order=3,
            icon="👁️",
            estimated_hours=35,
            prerequisites=["Python", "Basic ML concepts"],
            learning_objectives=[
                "Process camera images with OpenCV",
                "Detect objects using pre-trained models",
                "Track objects in real-time",
                "Integrate vision with robot control"
            ]
        )
        db.add(aiml_intermediate)

        # ============================================================
        # ADVANCED CONTENT
        # ============================================================

        # Module 7: SLAM and Navigation
        ros2_advanced = LearningModule(
            id=uuid4(),
            title="SLAM and Autonomous Navigation",
            description="Master simultaneous localization and mapping for autonomous robot navigation",
            skill_level="advanced",
            category="ros2",
            order=1,
            icon="🗺️",
            estimated_hours=40,
            prerequisites=["ROS2 Services", "Coordinate transformations", "Probability"],
            learning_objectives=[
                "Implement SLAM algorithms (Cartographer, SLAM Toolbox)",
                "Configure Nav2 navigation stack",
                "Tune behavior trees for navigation",
                "Handle dynamic obstacles"
            ]
        )
        db.add(ros2_advanced)

        lessons_slam = [
            Lesson(
                id=uuid4(),
                module_id=ros2_advanced.id,
                title="Understanding SLAM: Simultaneous Localization and Mapping",
                description="Deep dive into how robots build maps while localizing themselves",
                content_type="reading",
                content_text="""# SLAM: Simultaneous Localization and Mapping

## The SLAM Problem

Imagine you're in a dark room with a flashlight:
- You need to create a map of the room (Mapping)
- But you also need to know where YOU are in the room (Localization)
- And you need to do BOTH at the same time!

This is the SLAM problem that every autonomous robot faces.

## Why is SLAM Hard?

### The Chicken-and-Egg Problem
- To build a map, you need to know where you are
- To know where you are, you need a map
- SLAM solves both problems simultaneously

## Key Components

### 1. **Sensors**
- **Lidar**: Laser scanner that measures distances (most common)
- **Cameras**: Visual SLAM using features
- **IMU**: Measures orientation and acceleration

### 2. **Odometry**
- Estimates robot motion from wheel encoders
- Has drift error over time
- SLAM corrects this drift

### 3. **Loop Closure**
- Recognizing when robot returns to a known location
- Corrects accumulated errors
- Critical for large environments

## Popular SLAM Algorithms

### Cartographer (Google)
- Graph-based SLAM
- Excellent for large indoor environments
- Used in Google's self-driving cars

```yaml
# Cartographer Configuration Example
TRAJECTORY_BUILDER_2D.use_imu_data = true
TRAJECTORY_BUILDER_2D.min_range = 0.3
TRAJECTORY_BUILDER_2D.max_range = 100.0
POSE_GRAPH.optimize_every_n_nodes = 90
```

### SLAM Toolbox
- Modern ROS2 SLAM solution
- Supports lifelong mapping
- Can save and load maps

## The SLAM Pipeline

1. **Data Acquisition**: Read sensor data (Lidar scans)
2. **Scan Matching**: Match current scan to previous scans
3. **Pose Estimation**: Estimate robot's new position
4. **Map Update**: Add new information to map
5. **Loop Closure**: Check for revisited locations
6. **Graph Optimization**: Minimize overall error

## Math Behind SLAM (Simplified)

### Bayes Filter
SLAM uses probabilistic methods:
- **Prediction**: Where will robot be based on motion?
- **Update**: Correct prediction using sensor data

### Pose Graph
- Nodes: Robot poses (positions + orientations)
- Edges: Constraints between poses
- Optimization: Find poses that satisfy all constraints

## Practical Example: Office Robot

```python
# Simplified SLAM pseudo-code
class SimpleSLAM:
    def __init__(self):
        self.map = OccupancyGrid()
        self.pose = Pose()
        self.particles = []  # For particle filter

    def process_scan(self, scan, odometry):
        # 1. Predict new pose from odometry
        predicted_pose = self.predict(self.pose, odometry)

        # 2. Match scan to map
        matched_pose = self.scan_match(scan, self.map)

        # 3. Update pose (fusion)
        self.pose = self.fuse(predicted_pose, matched_pose)

        # 4. Update map with new scan
        self.map.update(scan, self.pose)

        # 5. Check for loop closure
        if self.detect_loop_closure(scan):
            self.optimize_graph()
```

## Challenges in Real Robots

### Dynamic Environments
- People walking, doors opening
- Solution: Filter out moving objects

### Sensor Noise
- Lidar reflections, shadows
- Solution: Probabilistic filtering

### Computational Cost
- Real-time constraint
- Solution: Efficient data structures (octrees, kdtrees)

## Advanced Topics

### Visual SLAM (VSLAM)
- Uses cameras instead of Lidar
- Cheaper but more complex
- ORB-SLAM2, VINS-Mono

### Multi-Robot SLAM
- Multiple robots building one map
- Data association challenge
- Communication overhead

### 3D SLAM
- Full 6DOF pose estimation
- Used in drones, underwater robots

## Next Steps

1. Learn coordinate transformations (TF2)
2. Study particle filters and Kalman filters
3. Practice with simulation first
4. Move to real robot with Lidar

## Recommended Reading
- "Probabilistic Robotics" by Thrun, Burgard, Fox
- ROS2 Navigation documentation
- Cartographer documentation""",
                order=1,
                duration_minutes=90,
                difficulty="hard",
                tags=["slam", "navigation", "algorithms", "theory"]
            ),
            Lesson(
                id=uuid4(),
                module_id=ros2_advanced.id,
                title="Implementing Cartographer SLAM",
                description="Set up and configure Google Cartographer for 2D SLAM",
                content_type="tutorial",
                content_text="""# Implementing Cartographer SLAM

## Installation

```bash
sudo apt install ros-humble-cartographer ros-humble-cartographer-ros
```

## Robot Configuration

### 1. URDF with Lidar

```xml
<robot name="my_robot">
  <link name="base_link"/>

  <link name="lidar_link">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.05"/>
      </geometry>
    </visual>
  </link>

  <joint name="lidar_joint" type="fixed">
    <parent link="base_link"/>
    <child link="lidar_link"/>
    <origin xyz="0 0 0.2" rpy="0 0 0"/>
  </joint>
</robot>
```

### 2. Cartographer Configuration

Create `cartographer.lua`:

```lua
include "map_builder.lua"
include "trajectory_builder.lua"

options = {
  map_builder = MAP_BUILDER,
  trajectory_builder = TRAJECTORY_BUILDER,
  map_frame = "map",
  tracking_frame = "base_link",
  published_frame = "odom",
  odom_frame = "odom",
  provide_odom_frame = false,
  publish_frame_projected_to_2d = true,
  use_odometry = true,
  use_nav_sat = false,
  use_landmarks = false,
  num_laser_scans = 1,
  num_multi_echo_laser_scans = 0,
  num_subdivisions_per_laser_scan = 1,
  num_point_clouds = 0,
  lookup_transform_timeout_sec = 0.2,
  submap_publish_period_sec = 0.3,
  pose_publish_period_sec = 5e-3,
}

MAP_BUILDER.use_trajectory_builder_2d = true

TRAJECTORY_BUILDER_2D.min_range = 0.3
TRAJECTORY_BUILDER_2D.max_range = 100.0
TRAJECTORY_BUILDER_2D.use_imu_data = false

POSE_GRAPH.optimize_every_n_nodes = 90

return options
```

## Launch File

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='cartographer_ros',
            executable='cartographer_node',
            name='cartographer_node',
            parameters=[{'use_sim_time': True}],
            arguments=[
                '-configuration_directory', '/path/to/config',
                '-configuration_basename', 'cartographer.lua'
            ]
        ),

        Node(
            package='cartographer_ros',
            executable='occupancy_grid_node',
            name='occupancy_grid_node',
            parameters=[{'use_sim_time': True}]
        ),
    ])
```

## Running SLAM

```bash
# Terminal 1: Launch robot/simulation
ros2 launch my_robot robot.launch.py

# Terminal 2: Launch Cartographer
ros2 launch my_robot cartographer.launch.py

# Terminal 3: Visualize in RViz
ros2 run rviz2 rviz2
```

## RViz Configuration

Add these displays:
- Map (topic: /map)
- LaserScan (topic: /scan)
- RobotModel
- TF

## Saving the Map

```bash
ros2 run nav2_map_server map_saver_cli -f my_map
```

This creates:
- `my_map.pgm`: Image file
- `my_map.yaml`: Metadata

## Tuning Parameters

### For Small Indoor Spaces
```lua
TRAJECTORY_BUILDER_2D.min_range = 0.1
TRAJECTORY_BUILDER_2D.max_range = 10.0
POSE_GRAPH.optimize_every_n_nodes = 30
```

### For Large Warehouses
```lua
TRAJECTORY_BUILDER_2D.min_range = 0.5
TRAJECTORY_BUILDER_2D.max_range = 100.0
POSE_GRAPH.optimize_every_n_nodes = 120
```

## Common Issues

### Map Drift
- Increase `optimize_every_n_nodes`
- Drive slower for better scan matching

### Incorrect Loop Closures
- Adjust `POSE_GRAPH.constraint_builder.min_score`

### Poor Performance
- Reduce `submap_publish_period_sec`
- Decrease `max_range`

## Exercise

1. Create a simulated environment in Gazebo
2. Add a Lidar sensor to your robot
3. Configure Cartographer
4. Map a room
5. Save and reload the map

## Next Lesson: Navigation with Nav2""",
                order=2,
                duration_minutes=120,
                difficulty="hard",
                tags=["slam", "cartographer", "hands-on", "ros2"]
            )
        ]

        for lesson in lessons_slam:
            db.add(lesson)

        # Module 8: Advanced AI/ML
        aiml_advanced = LearningModule(
            id=uuid4(),
            title="Deep Learning for Robot Perception",
            description="Train and deploy neural networks for object detection, semantic segmentation, and scene understanding",
            skill_level="advanced",
            category="aiml",
            order=2,
            icon="🧠",
            estimated_hours=50,
            prerequisites=["Computer Vision", "PyTorch/TensorFlow", "Linear Algebra"],
            learning_objectives=[
                "Train object detection models (YOLO, Faster R-CNN)",
                "Implement semantic segmentation for scene understanding",
                "Deploy models on edge devices (Jetson, Coral)",
                "Optimize models for real-time inference"
            ]
        )
        db.add(aiml_advanced)

        # Module 9: Advanced Hardware
        hardware_advanced = LearningModule(
            id=uuid4(),
            title="Custom Robot Design and Fabrication",
            description="Design and build custom robot platforms with advanced sensors and actuators",
            skill_level="advanced",
            category="hardware",
            order=3,
            icon="🔩",
            estimated_hours=60,
            prerequisites=["Electronics", "CAD", "Manufacturing basics"],
            learning_objectives=[
                "Design robot chassis in CAD (Fusion360, SolidWorks)",
                "Select motors, gearboxes, and power systems",
                "Design custom PCBs for robot control",
                "Integrate advanced sensors (Lidar, depth cameras)"
            ]
        )
        db.add(hardware_advanced)

        db.commit()

        # Count modules and lessons
        module_count = db.query(LearningModule).count()
        lesson_count = db.query(Lesson).count()

        print(f"\nSuccess! Created {module_count} modules and {lesson_count} lessons")
        print("\nModules by skill level:")
        for level in ["beginner", "intermediate", "advanced"]:
            count = db.query(LearningModule).filter(LearningModule.skill_level == level).count()
            print(f"  {level.capitalize()}: {count} modules")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_content()
