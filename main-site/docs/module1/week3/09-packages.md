---
sidebar_position: 9
---

# ROS 2 Packages

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Completed Week 1-2

### Learning Objectives

- Understand ROS 2 package structure
- Create Python packages with ament_python
- Configure package.xml and setup.py
- Build packages with colcon
- Install and use custom packages

### What is a Package?

A **ROS 2 package** is:
- The smallest unit of software organization
- Contains nodes, libraries, configuration files, message definitions
- Self-contained with declared dependencies
- Built and installed using colcon

**Analogy**: Like a Python pip package or npm module

### Package Types

| Build Type | Language | Use Case |
|------------|----------|----------|
| **ament_python** | Python | Pure Python packages |
| **ament_cmake** | C++ | C++ packages, message definitions |
| **ament_cmake_python** | Mixed | Both C++ and Python |

### Creating a Python Package

#### Step 1: Create Package

```bash
# Navigate to workspace src directory
cd ~/ros2_ws/src

# Create package
ros2 pkg create my_robot_pkg \
  --build-type ament_python \
  --dependencies rclpy std_msgs geometry_msgs

# Package created!
```

**Generated structure:**
```
my_robot_pkg/
├── my_robot_pkg/
│   └── __init__.py
├── package.xml
├── resource/
│   └── my_robot_pkg
├── setup.cfg
├── setup.py
└── test/
    ├── test_copyright.py
    ├── test_flake8.py
    └── test_pep257.py
```

#### Step 2: Understanding package.xml

**package.xml**:
```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_robot_pkg</name>
  <version>0.0.1</version>
  <description>My first ROS 2 package</description>
  <maintainer email="you@example.com">Your Name</maintainer>
  <license>Apache-2.0</license>

  <!-- Build tool dependency -->
  <buildtool_depend>ament_python</buildtool_depend>

  <!-- Dependencies -->
  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>geometry_msgs</depend>

  <!-- Test dependencies -->
  <test_depend>ament_copyright</test_depend>
  <test_depend>ament_flake8</test_depend>
  <test_depend>ament_pep257</test_depend>
  <test_depend>python3-pytest</test_depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>
```

**Key elements:**
- `<name>`: Package name (must match directory name)
- `<depend>`: Runtime dependencies
- `<build_depend>`: Build-time only dependencies
- `<test_depend>`: Testing dependencies
- `<build_type>`: ament_python for Python packages

#### Step 3: Understanding setup.py

**setup.py**:
```python
from setuptools import setup

package_name = 'my_robot_pkg'

setup(
    name=package_name,
    version='0.0.1',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='you@example.com',
    description='My first ROS 2 package',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            # Format: 'executable_name = package.module:main_function'
            'my_node = my_robot_pkg.my_node:main',
        ],
    },
)
```

#### Step 4: Create a Node

**my_robot_pkg/my_node.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.publisher = self.create_publisher(String, 'my_topic', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.counter = 0
        self.get_logger().info('My Node started!')

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello ROS 2! Counter: {self.counter}'
        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: {msg.data}')
        self.counter += 1

def main(args=None):
    rclpy.init(args=args)
    node = MyNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### Step 5: Update setup.py with Entry Point

Add to `entry_points`:
```python
entry_points={
    'console_scripts': [
        'my_node = my_robot_pkg.my_node:main',
    ],
},
```

#### Step 6: Build the Package

```bash
# Navigate to workspace root
cd ~/ros2_ws

# Build all packages
colcon build

# Build only your package
colcon build --packages-select my_robot_pkg

# Build with symlink install (faster iteration for Python)
colcon build --symlink-install --packages-select my_robot_pkg
```

**What happens during build:**
1. Resolves dependencies
2. Compiles code (if needed)
3. Installs to `install/` directory
4. Creates setup scripts

#### Step 7: Source and Run

```bash
# Source the workspace
source ~/ros2_ws/install/setup.bash

# Run your node
ros2 run my_robot_pkg my_node
```

### Workspace Structure

```
ros2_ws/
├── src/                    # Source code
│   ├── my_robot_pkg/
│   └── another_pkg/
├── build/                  # Build artifacts (auto-generated)
├── install/                # Installed files (auto-generated)
└── log/                    # Build logs (auto-generated)
```

**Important:**
- Only `src/` should be version-controlled
- `build/`, `install/`, `log/` are generated

### Adding Multiple Nodes

**my_robot_pkg/second_node.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SecondNode(Node):
    def __init__(self):
        super().__init__('second_node')
        self.subscription = self.create_subscription(
            String, 'my_topic', self.callback, 10
        )

    def callback(self, msg):
        self.get_logger().info(f'Received: {msg.data}')

def main(args=None):
    rclpy.init(args=args)
    node = SecondNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Update setup.py:**
```python
entry_points={
    'console_scripts': [
        'my_node = my_robot_pkg.my_node:main',
        'second_node = my_robot_pkg.second_node:main',
    ],
},
```

**Rebuild:**
```bash
colcon build --symlink-install --packages-select my_robot_pkg
source install/setup.bash
```

### Adding Config Files

Create `config/` directory:
```bash
mkdir -p my_robot_pkg/config
```

**my_robot_pkg/config/params.yaml**:
```yaml
my_node:
  ros__parameters:
    max_speed: 2.0
    robot_name: "robot1"
```

**Update setup.py to install config files:**
```python
import os
from glob import glob

setup(
    # ... (existing fields)
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        # Install config files
        (os.path.join('share', package_name, 'config'),
            glob('config/*.yaml')),
    ],
    # ...
)
```

### Key Takeaways (Beginner)

✅ **Packages** are the fundamental unit of ROS 2 software
✅ **ament_python** for Python packages
✅ **package.xml** declares dependencies
✅ **setup.py** defines entry points for executables
✅ **colcon build** compiles and installs packages
✅ **--symlink-install** enables faster Python iteration

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Create packages with custom messages
- Organize multi-package workspaces
- Handle complex dependencies
- Implement package versioning
- Optimize build performance

### Creating Interface Packages

Interface packages contain custom messages, services, and actions.

#### Step 1: Create Interface Package

```bash
cd ~/ros2_ws/src

# Must use ament_cmake for interfaces
ros2 pkg create my_robot_interfaces \
  --build-type ament_cmake \
  --dependencies rosidl_default_generators
```

#### Step 2: Define Custom Messages

**my_robot_interfaces/msg/RobotStatus.msg**:
```
# Robot status message
string robot_name
float32 battery_percentage
float32 battery_voltage
geometry_msgs/Pose current_pose
string[] active_sensors
bool emergency_stop_active
uint8 error_code

# Constants
uint8 ERROR_NONE = 0
uint8 ERROR_LOW_BATTERY = 1
uint8 ERROR_SENSOR_FAILURE = 2
```

**my_robot_interfaces/srv/SetMode.srv**:
```
# Request
string mode
---
# Response
bool success
string message
string previous_mode
```

**my_robot_interfaces/action/NavigateToGoal.action**:
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
float32 progress_percentage
```

#### Step 3: Configure CMakeLists.txt

**CMakeLists.txt**:
```cmake
cmake_minimum_required(VERSION 3.8)
project(my_robot_interfaces)

# Find dependencies
find_package(ament_cmake REQUIRED)
find_package(rosidl_default_generators REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(std_msgs REQUIRED)

# Declare ROS 2 interfaces
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/RobotStatus.msg"
  "srv/SetMode.srv"
  "action/NavigateToGoal.action"
  DEPENDENCIES geometry_msgs std_msgs
)

ament_package()
```

#### Step 4: Configure package.xml

**package.xml**:
```xml
<?xml version="1.0"?>
<package format="3">
  <name>my_robot_interfaces</name>
  <version>1.0.0</version>
  <description>Custom interfaces for my robot</description>
  <maintainer email="you@example.com">Your Name</maintainer>
  <license>Apache-2.0</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <build_depend>rosidl_default_generators</build_depend>
  <exec_depend>rosidl_default_runtime</exec_depend>

  <depend>geometry_msgs</depend>
  <depend>std_msgs</depend>

  <member_of_group>rosidl_interface_packages</member_of_group>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

#### Step 5: Build and Use

```bash
colcon build --packages-select my_robot_interfaces
source install/setup.bash

# Verify
ros2 interface show my_robot_interfaces/msg/RobotStatus
ros2 interface show my_robot_interfaces/srv/SetMode
ros2 interface show my_robot_interfaces/action/NavigateToGoal
```

#### Step 6: Use in Python Package

**Update my_robot_pkg/package.xml:**
```xml
<depend>my_robot_interfaces</depend>
```

**Use in code:**
```python
from my_robot_interfaces.msg import RobotStatus
from my_robot_interfaces.srv import SetMode
from my_robot_interfaces.action import NavigateToGoal

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')

        # Publisher
        self.status_pub = self.create_publisher(
            RobotStatus, 'robot_status', 10
        )

        # Service
        self.mode_service = self.create_service(
            SetMode, 'set_mode', self.set_mode_callback
        )

    def publish_status(self):
        msg = RobotStatus()
        msg.robot_name = 'robot1'
        msg.battery_percentage = 85.5
        msg.battery_voltage = 12.4
        msg.emergency_stop_active = False
        msg.error_code = RobotStatus.ERROR_NONE
        self.status_pub.publish(msg)
```

### Multi-Package Workspace

**Workspace with multiple packages:**
```
ros2_ws/
└── src/
    ├── my_robot_interfaces/       # Messages, services, actions
    ├── my_robot_core/             # Core functionality
    ├── my_robot_navigation/       # Navigation stack
    ├── my_robot_perception/       # Perception algorithms
    └── my_robot_bringup/          # Launch files, configs
```

**Build order matters:**
```bash
# Build interfaces first
colcon build --packages-select my_robot_interfaces

# Then build packages that depend on interfaces
colcon build --packages-select my_robot_core my_robot_navigation
```

**Or build all with proper ordering:**
```bash
colcon build --symlink-install
```

### Package Dependencies

**Types of dependencies:**
- **`<build_depend>`**: Needed only at build time
- **`<exec_depend>`**: Needed only at runtime
- **`<depend>`**: Both build and runtime (shorthand)
- **`<test_depend>`**: Needed only for testing

**Example package.xml with all types:**
```xml
<!-- Build only -->
<build_depend>rosidl_default_generators</build_depend>

<!-- Runtime only -->
<exec_depend>rosidl_default_runtime</exec_depend>

<!-- Both build and runtime -->
<depend>rclpy</depend>
<depend>geometry_msgs</depend>

<!-- Testing -->
<test_depend>ament_lint_auto</test_depend>
<test_depend>ament_lint_common</test_depend>
```

### Install Rules

**Installing Python modules:**
```python
from setuptools import setup, find_packages

setup(
    # ...
    packages=find_packages(exclude=['test']),
    # ...
)
```

**Installing launch files, config, etc.:**
```python
import os
from glob import glob

setup(
    # ...
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),

        # Launch files
        (os.path.join('share', package_name, 'launch'),
            glob('launch/*.launch.py')),

        # Config files
        (os.path.join('share', package_name, 'config'),
            glob('config/*.yaml')),

        # URDF files
        (os.path.join('share', package_name, 'urdf'),
            glob('urdf/*.urdf')),
    ],
    # ...
)
```

### Versioning and Releases

**Package versioning (package.xml):**
```xml
<version>1.2.3</version>
```

**Semantic versioning:**
- **MAJOR.MINOR.PATCH**
- **1.0.0**: Initial release
- **1.1.0**: New feature (backward compatible)
- **1.1.1**: Bug fix
- **2.0.0**: Breaking change

### Build Optimization

**Parallel builds:**
```bash
# Use all CPU cores
colcon build --parallel-workers $(nproc)

# Limit to 4 cores
colcon build --parallel-workers 4
```

**Selective building:**
```bash
# Build specific package and dependencies
colcon build --packages-up-to my_robot_navigation

# Build without tests
colcon build --cmake-args -DBUILD_TESTING=OFF
```

**Clean builds:**
```bash
# Clean build artifacts
rm -rf build install log

# Rebuild from scratch
colcon build
```

### Key Takeaways (Intermediate)

✅ **Interface packages** use ament_cmake for messages/services/actions
✅ **Multi-package workspaces** organize related functionality
✅ **Dependency types** control build and runtime requirements
✅ **Install rules** deploy launch files, configs, URDFs
✅ **Build optimization** with parallel workers

---

## 🔴 Advanced Level

**Duration**: 3-4 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement mixed C++/Python packages
- Create reusable package templates
- Implement custom build extensions
- Optimize for production deployment
- Create Debian packages

### Mixed C++/Python Package

Using **ament_cmake_python** for packages with both C++ and Python:

**CMakeLists.txt:**
```cmake
cmake_minimum_required(VERSION 3.8)
project(my_mixed_pkg)

find_package(ament_cmake REQUIRED)
find_package(ament_cmake_python REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclpy REQUIRED)

# C++ library
add_library(my_cpp_lib src/my_lib.cpp)
target_include_directories(my_cpp_lib PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>
)

# C++ executable
add_executable(my_cpp_node src/my_cpp_node.cpp)
ament_target_dependencies(my_cpp_node rclcpp)

# Install C++ targets
install(TARGETS my_cpp_lib my_cpp_node
  DESTINATION lib/${PROJECT_NAME}
)

# Python setup
ament_python_install_package(${PROJECT_NAME})

# Install Python executables
install(PROGRAMS
  scripts/my_python_node.py
  DESTINATION lib/${PROJECT_NAME}
)

ament_package()
```

### Production Deployment

**Debian package creation:**
```bash
# Install bloom
sudo apt install python3-bloom

# Create debian package
cd ~/ros2_ws/src/my_robot_pkg
bloom-generate rosdebian --os-name ubuntu --os-version jammy --ros-distro humble

# Build debian package
fakeroot debian/rules binary

# Install
sudo dpkg -i ../ros-humble-my-robot-pkg_*.deb
```

### Key Takeaways (Advanced)

✅ **Mixed packages** combine C++ and Python with ament_cmake_python
✅ **Production deployment** with Debian packages
✅ **Custom build extensions** for specialized workflows

---

## Additional Resources

- [Creating a Package](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package.html)
- [Using Colcon to Build Packages](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Colcon-Tutorial.html)
- [ament_cmake_python Documentation](https://docs.ros.org/en/humble/How-To-Guides/Ament-CMake-Python-Documentation.html)

---

**Next:** [Launch Files →](./10-launch.md)
