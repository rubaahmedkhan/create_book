---
sidebar_position: 16
---

# Capstone: Autonomous Navigation

## Overview

Final capstone project integrating all Module 3 skills: Build a complete autonomous navigation system in Isaac Sim with perception, SLAM, path planning, and sim-to-real deployment.

## Project Goals

Build an autonomous mobile robot that:
1. Explores unknown warehouse environment
2. Builds map using Visual SLAM
3. Detects and localizes objects
4. Navigates to target locations
5. Avoids dynamic obstacles
6. Ready for sim-to-real deployment

## Learning Objectives

- Integrate all Isaac Sim and Isaac ROS components
- Implement complete autonomy stack
- Debug complex multi-system integration
- Optimize for real-time performance
- Prepare for hardware deployment

## Prerequisites

- Completed all Module 3 tutorials (Week 7-10)
- Strong Python programming skills
- Understanding of robotics systems integration

## System Architecture

```
Capstone Architecture:
┌─────────────────────────────────────────────┐
│            Mission Planner                  │
│         (High-level task planning)          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────┴───────────────────────────┐
│          Behavior Executive                 │
│     (State machine, decision making)        │
└─────────┬──────────────────┬────────────────┘
          │                  │
┌─────────┴────────┐  ┌──────┴─────────────┐
│   Perception     │  │   Navigation       │
│  - Visual SLAM   │  │  - Nav2 stack      │
│  - Object Det.   │  │  - Path planning   │
│  - Tracking      │  │  - Obstacle avoid  │
└─────────┬────────┘  └──────┬─────────────┘
          │                  │
┌─────────┴──────────────────┴────────────────┐
│          Sensor Interface                   │
│   (Cameras, Lidar, IMU, Encoders)          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────┴───────────────────────────┐
│          Isaac Sim Environment              │
└─────────────────────────────────────────────┘
```

## Part 1: Environment Setup

### Create Warehouse Environment

```python
# capstone_environment.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import VisualCuboid, FixedCuboid, DynamicCuboid
from omni.isaac.core.utils.stage import add_reference_to_stage
import numpy as np

class WarehouseEnvironment:
    """Complete warehouse for capstone."""

    def __init__(self, world):
        self.world = world

    def build(self):
        """Build warehouse with obstacles and targets."""

        print("Building warehouse environment...")

        # Ground plane
        self.world.scene.add_default_ground_plane()

        # Walls
        self.create_walls()

        # Shelving units
        self.create_shelves()

        # Dynamic obstacles (moving workers/robots)
        self.create_dynamic_obstacles()

        # Target objects for retrieval
        self.create_targets()

        # Charging station
        self.create_charging_station()

        print("✓ Warehouse environment ready")

    def create_walls(self):
        """Create warehouse perimeter."""
        # 30m x 20m warehouse
        wall_height = 4.0
        # ... (walls implementation)

    def create_shelves(self):
        """Create storage shelves."""
        # ... (shelves implementation)

    def create_dynamic_obstacles(self):
        """Create moving obstacles."""
        # ... (dynamic obstacles)

    def create_targets(self):
        """Create target objects for retrieval."""
        # ... (targets implementation)

    def create_charging_station(self):
        """Create charging/home station."""
        # ... (charging station)

world = World()
env = WarehouseEnvironment(world)
env.build()

world.reset()

for i in range(300):
    world.step(render=True)

simulation_app.close()
```

## Part 2: Robot Configuration

### Multi-Sensor Mobile Robot

```python
# capstone_robot.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.sensor import Camera
from omni.isaac.wheeled_robots.robots import WheeledRobot
import numpy as np

class AutonomousRobot:
    """Fully equipped autonomous robot."""

    def __init__(self, world):
        self.world = world

        # Load base robot
        self.robot = world.scene.add(
            WheeledRobot(
                prim_path="/World/AutonomousRobot",
                name="autonomous_robot",
                wheel_dof_names=["joint_wheel_left", "joint_wheel_right"],
                create_robot=True,
                usd_path="/Isaac/Robots/Carter/carter_v1.usd"
            )
        )

        # Add sensors
        self.setup_sensors()

    def setup_sensors(self):
        """Configure all sensors."""

        # Front RGB camera
        self.front_camera = Camera(
            prim_path="/World/AutonomousRobot/front_camera",
            position=np.array([0.3, 0, 0.15]),
            resolution=(1280, 720),
            frequency=30
        )
        self.world.scene.add(self.front_camera)

        # Stereo cameras for SLAM
        self.stereo_left = Camera(
            prim_path="/World/AutonomousRobot/stereo_left",
            position=np.array([0.25, -0.06, 0.12]),
            resolution=(640, 480),
            frequency=30
        )
        self.world.scene.add(self.stereo_left)

        self.stereo_right = Camera(
            prim_path="/World/AutonomousRobot/stereo_right",
            position=np.array([0.25, 0.06, 0.12]),
            resolution=(640, 480),
            frequency=30
        )
        self.world.scene.add(self.stereo_right)

        # Depth camera (downward for obstacle detection)
        self.depth_camera = Camera(
            prim_path="/World/AutonomousRobot/depth_camera",
            position=np.array([0.2, 0, -0.1]),
            resolution=(640, 480)
        )
        self.world.scene.add(self.depth_camera)

        # 2D Lidar (already on Carter)

        print("✓ All sensors configured")

world = World()
robot = AutonomousRobot(world)

world.reset()

for i in range(300):
    world.step(render=True)

simulation_app.close()
```

## Part 3: ROS 2 Integration

### Complete ROS 2 Bridge

```python
# capstone_ros2_bridge.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.utils.extensions import enable_extension
import rclpy
from sensor_msgs.msg import Image, LaserScan
from nav_msgs.msg import Odometry
from geometry_msgs.msg import Twist
from vision_msgs.msg import Detection2DArray
from cv_bridge import CvBridge

enable_extension("omni.isaac.ros2_bridge")

class CapstoneROS2Bridge:
    """Complete ROS 2 interface for capstone."""

    def __init__(self, robot):
        self.robot = robot
        self.bridge = CvBridge()

        rclpy.init()
        self.node = rclpy.create_node('capstone_bridge')

        # Publishers
        self.setup_publishers()

        # Subscribers
        self.setup_subscribers()

        # State
        self.cmd_vel = Twist()

    def setup_publishers(self):
        """Create all publishers."""
        self.pubs = {
            'front_rgb': self.node.create_publisher(Image, '/camera/front/image_raw', 10),
            'stereo_left': self.node.create_publisher(Image, '/stereo/left/image', 10),
            'stereo_right': self.node.create_publisher(Image, '/stereo/right/image', 10),
            'depth': self.node.create_publisher(Image, '/camera/depth/image', 10),
            'lidar': self.node.create_publisher(LaserScan, '/scan', 10),
            'odom': self.node.create_publisher(Odometry, '/odom', 10)
        }

    def setup_subscribers(self):
        """Create all subscribers."""
        self.node.create_subscription(Twist, '/cmd_vel', self.cmd_vel_callback, 10)

    def cmd_vel_callback(self, msg):
        self.cmd_vel = msg

    def publish_all_sensors(self):
        """Publish data from all sensors."""
        # ... (publish RGB, stereo, depth, lidar, odom)
        pass

    def step(self, world):
        """Update at each simulation step."""
        rclpy.spin_once(self.node, timeout_sec=0)

        # Apply velocity commands
        # ... (convert Twist to wheel velocities)

        # Publish sensors
        self.publish_all_sensors()

# Setup
world = World()
# ... (create robot)

bridge = CapstoneROS2Bridge(robot)

world.reset()

for i in range(5000):
    bridge.step(world)
    world.step(render=True)

bridge.node.destroy_node()
rclpy.shutdown()
simulation_app.close()
```

## Part 4: Mission Executive

### Behavior State Machine

```python
# mission_executive.py
from enum import Enum

class MissionState(Enum):
    IDLE = 0
    EXPLORING = 1
    NAVIGATING_TO_TARGET = 2
    RETRIEVING_OBJECT = 3
    RETURNING_HOME = 4
    CHARGING = 5
    OBSTACLE_AVOIDANCE = 6

class MissionExecutive:
    """High-level mission control."""

    def __init__(self):
        self.state = MissionState.IDLE
        self.targets = []  # List of target locations
        self.current_target = None
        self.battery_level = 100.0

    def update(self, perception_data, localization_data):
        """Update mission state based on sensor data."""

        # State machine logic
        if self.state == MissionState.IDLE:
            self.handle_idle()

        elif self.state == MissionState.EXPLORING:
            self.handle_exploring(perception_data, localization_data)

        elif self.state == MissionState.NAVIGATING_TO_TARGET:
            self.handle_navigating(localization_data)

        elif self.state == MissionState.RETRIEVING_OBJECT:
            self.handle_retrieving(perception_data)

        elif self.state == MissionState.RETURNING_HOME:
            self.handle_returning_home(localization_data)

        elif self.state == MissionState.OBSTACLE_AVOIDANCE:
            self.handle_obstacle_avoidance(perception_data)

    def handle_idle(self):
        """Start mission."""
        print("Mission started: Exploring warehouse")
        self.state = MissionState.EXPLORING

    def handle_exploring(self, perception_data, localization_data):
        """Exploration behavior."""
        # If map coverage sufficient, transition to navigation
        if self.map_coverage > 0.8:
            self.state = MissionState.NAVIGATING_TO_TARGET
            self.current_target = self.targets[0] if self.targets else None

    def handle_navigating(self, localization_data):
        """Navigate to target."""
        # Check if reached target
        distance_to_target = self.compute_distance(
            localization_data['position'],
            self.current_target
        )

        if distance_to_target < 0.5:  # 50cm tolerance
            print(f"✓ Reached target: {self.current_target}")
            self.state = MissionState.RETRIEVING_OBJECT

    def handle_retrieving(self, perception_data):
        """Retrieve target object."""
        # Execute retrieval behavior
        # ... (gripper control, etc.)

        # After retrieval
        self.state = MissionState.RETURNING_HOME

    def handle_returning_home(self, localization_data):
        """Return to home/charging station."""
        # Navigate to home position
        # ... (navigation logic)

        # Check if home
        if self.at_home(localization_data):
            print("✓ Mission complete - returned home")
            self.state = MissionState.IDLE

    def handle_obstacle_avoidance(self, perception_data):
        """Emergency obstacle avoidance."""
        # ... (reactive avoidance behavior)
        pass

    def compute_distance(self, pos1, pos2):
        """Compute Euclidean distance."""
        import numpy as np
        return np.linalg.norm(np.array(pos1) - np.array(pos2))

    def at_home(self, localization_data):
        """Check if at home position."""
        home_pos = [0, 0, 0]
        return self.compute_distance(localization_data['position'], home_pos) < 0.5
```

## Part 5: Complete Integration

### Main Capstone Application

```python
# capstone_main.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
import rclpy
import numpy as np

# Import all components
# from capstone_environment import WarehouseEnvironment
# from capstone_robot import AutonomousRobot
# from capstone_ros2_bridge import CapstoneROS2Bridge
# from mission_executive import MissionExecutive, MissionState

class CapstoneApplication:
    """Main application integrating all systems."""

    def __init__(self):
        # Initialize ROS 2
        rclpy.init()

        # Create world
        self.world = World()

        # Build environment
        print("=" * 60)
        print("CAPSTONE: AUTONOMOUS WAREHOUSE NAVIGATION")
        print("=" * 60)

        # self.env = WarehouseEnvironment(self.world)
        # self.env.build()

        # Create robot
        # self.robot = AutonomousRobot(self.world)

        # ROS 2 bridge
        # self.ros_bridge = CapstoneROS2Bridge(self.robot.robot)

        # Mission executive
        # self.mission = MissionExecutive()

        # Target locations
        self.mission_targets = [
            np.array([10.0, 5.0, 0.0]),   # Shelf 1
            np.array([10.0, -5.0, 0.0]),  # Shelf 2
            np.array([5.0, 0.0, 0.0]),    # Shelf 3
        ]

        # self.mission.targets = self.mission_targets

        self.world.reset()

        print("\n✓ System initialized")
        print(f"  Targets: {len(self.mission_targets)}")
        print("  Starting mission...\n")

    def run(self):
        """Main execution loop."""

        step = 0
        mission_complete = False

        while not mission_complete:
            # ROS 2 callbacks
            # rclpy.spin_once(self.ros_bridge.node, timeout_sec=0)

            # Get perception data
            perception_data = {
                'detections': [],  # From object detection
                'obstacles': [],   # From lidar
            }

            # Get localization data
            localization_data = {
                'position': [0, 0, 0],  # From SLAM
                'orientation': [0, 0, 0, 1],
                'confidence': 0.95
            }

            # Update mission executive
            # self.mission.update(perception_data, localization_data)

            # Publish sensor data
            # if step % 3 == 0:
            #     self.ros_bridge.publish_all_sensors()

            # Step simulation
            self.world.step(render=True)

            # Status updates
            if step % 100 == 0:
                print(f"Step {step}: State = {self.mission.state}")

            # Check mission completion
            # if self.mission.state == MissionState.IDLE and step > 100:
            #     mission_complete = True

            step += 1

            # Safety timeout
            if step > 10000:
                print("\n⚠ Mission timeout")
                break

        print("\n" + "=" * 60)
        print("MISSION COMPLETE")
        print("=" * 60)

    def shutdown(self):
        """Clean shutdown."""
        # self.ros_bridge.node.destroy_node()
        rclpy.shutdown()
        simulation_app.close()

# Run capstone
app = CapstoneApplication()

try:
    app.run()
finally:
    app.shutdown()
```

## Part 6: Launch Instructions

### Terminal 1: Isaac Sim

```bash
cd /path/to/isaac_sim
./python.sh capstone_main.py
```

### Terminal 2: Isaac ROS Visual SLAM

```bash
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam_stereo.launch.py
```

### Terminal 3: Nav2

```bash
ros2 launch nav2_bringup navigation_launch.py \
    use_sim_time:=True \
    params_file:=capstone_nav2_params.yaml
```

### Terminal 4: Object Detection

```bash
ros2 launch isaac_ros_dnn_inference isaac_ros_yolov5.launch.py
```

### Terminal 5: RViz2 Visualization

```bash
ros2 run rviz2 rviz2 -d capstone_config.rviz
```

## Deliverables

### Required Outputs

1. **Complete system implementation** (all Python files)
2. **ROS 2 configuration files** (YAML parameters)
3. **Demo video** (3-5 minutes showing full mission)
4. **Technical report** (system architecture, results, challenges)
5. **Performance metrics**:
   - Mission success rate
   - Navigation accuracy
   - Perception accuracy
   - Execution time
6. **Sim-to-real preparation** (calibration data, deployment plan)

### Evaluation Criteria

- [ ] **Completeness**: All components integrated and functional
- [ ] **Performance**: >80% mission success rate in simulation
- [ ] **Code quality**: Well-documented, modular, maintainable
- [ ] **Innovation**: Creative solutions to challenges
- [ ] **Sim-to-real readiness**: Calibrated and deployment-ready

## Bonus Challenges

1. **Multi-robot coordination**: Deploy fleet of 3 robots
2. **Dynamic replanning**: Handle moving obstacles
3. **Learning-based control**: Train RL policy for navigation
4. **Real robot deployment**: Deploy on physical hardware
5. **Web interface**: Build monitoring dashboard

## Summary

Congratulations! You've completed the Isaac Sim capstone project by:
- ✓ Integrating environment, robot, sensors, perception, navigation
- ✓ Building complete autonomy stack with ROS 2
- ✓ Implementing mission-level decision making
- ✓ Preparing system for sim-to-real deployment
- ✓ Demonstrating end-to-end autonomous navigation

**You are now ready to build production-grade autonomous robots with NVIDIA Isaac!**

## Next Steps

- **Module 4**: Vision-Language-Action (VLA) Models
- Deploy capstone to physical robot
- Contribute to Isaac ROS open-source
- Build custom applications for your robotics projects

## Additional Resources

- [Isaac Sim Documentation](https://docs.omniverse.nvidia.com/isaacsim/latest/index.html)
- [Isaac ROS Documentation](https://nvidia-isaac-ros.github.io/)
- [Nav2 Documentation](https://navigation.ros.org/)
- [NVIDIA Robotics Community](https://forums.developer.nvidia.com/c/agx-autonomous-machines/isaac/isaac-ros/68)
