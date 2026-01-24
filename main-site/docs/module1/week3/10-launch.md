---
sidebar_position: 10
---

# Launch Files

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2 hours
**Prerequisites**: Completed Packages section

### Learning Objectives

- Understand ROS 2 launch system
- Write Python launch files
- Launch multiple nodes
- Set parameters and remappings
- Use launch arguments

### What are Launch Files?

**Launch files** automate starting multiple nodes with configuration.

**Instead of:**
```bash
ros2 run pkg1 node1
ros2 run pkg2 node2 --ros-args -p param:=value
ros2 run pkg3 node3 --ros-args -r old:=new
```

**Use:**
```bash
ros2 launch my_pkg my_launch.launch.py
```

### Basic Python Launch File

**launch/simple_launch.launch.py**:
```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='sim'
        ),
        Node(
            package='turtlesim',
            executable='turtle_teleop_key',
            name='teleop',
            prefix='xterm -e',  # Run in separate terminal
            output='screen'
        )
    ])
```

**Run it:**
```bash
ros2 launch my_robot_pkg simple_launch.launch.py
```

### Launching Multiple Nodes

**launch/multi_node_launch.launch.py**:
```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_robot_pkg',
            executable='publisher_node',
            name='publisher',
            output='screen'
        ),
        Node(
            package='my_robot_pkg',
            executable='subscriber_node',
            name='subscriber',
            output='screen'
        ),
        Node(
            package='my_robot_pkg',
            executable='controller_node',
            name='controller',
            output='screen'
        ),
    ])
```

### Setting Parameters

**launch/params_launch.launch.py**:
```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_robot_pkg',
            executable='my_node',
            name='my_node',
            parameters=[{
                'max_speed': 2.0,
                'robot_name': 'robot1',
                'enable_safety': True
            }],
            output='screen'
        ),
    ])
```

### Loading Parameters from YAML

**launch/yaml_params_launch.launch.py**:
```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    # Get path to config file
    config = os.path.join(
        get_package_share_directory('my_robot_pkg'),
        'config',
        'params.yaml'
    )

    return LaunchDescription([
        Node(
            package='my_robot_pkg',
            executable='my_node',
            name='my_node',
            parameters=[config],
            output='screen'
        ),
    ])
```

### Topic Remapping

**launch/remap_launch.launch.py**:
```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='sim',
            remappings=[
                ('/turtle1/cmd_vel', '/cmd_vel'),
            ]
        ),
    ])
```

### Launch Arguments

**launch/args_launch.launch.py**:
```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Declare argument
        DeclareLaunchArgument(
            'robot_name',
            default_value='robot1',
            description='Name of the robot'
        ),

        # Use argument
        Node(
            package='my_robot_pkg',
            executable='my_node',
            name=LaunchConfiguration('robot_name'),
            parameters=[{
                'robot_name': LaunchConfiguration('robot_name')
            }],
            output='screen'
        ),
    ])
```

**Run with custom argument:**
```bash
ros2 launch my_robot_pkg args_launch.launch.py robot_name:=robot2
```

### Install Launch Files

**Update setup.py:**
```python
import os
from glob import glob

setup(
    # ...
    data_files=[
        # ...
        (os.path.join('share', package_name, 'launch'),
            glob('launch/*.launch.py')),
    ],
)
```

**Rebuild:**
```bash
colcon build --packages-select my_robot_pkg --symlink-install
```

### Key Takeaways (Beginner)

✅ **Launch files** start multiple nodes with one command
✅ **Python launch files** use `generate_launch_description()`
✅ **Parameters** can be set inline or loaded from YAML
✅ **Remapping** changes topic names
✅ **Launch arguments** enable runtime customization

---

## 🟡 Intermediate Level

**Duration**: 3 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Implement conditional launching
- Create composable launch files
- Use event handlers
- Implement launch configurations
- Handle namespaces

### Conditional Launching

**launch/conditional_launch.launch.py**:
```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.conditions import IfCondition, UnlessCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        DeclareLaunchArgument(
            'use_sim',
            default_value='true',
            description='Use simulation or real robot'
        ),

        # Launch simulator only if use_sim is true
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='sim',
            condition=IfCondition(LaunchConfiguration('use_sim')),
            output='screen'
        ),

        # Launch hardware driver only if use_sim is false
        Node(
            package='my_robot_pkg',
            executable='hardware_driver',
            name='driver',
            condition=UnlessCondition(LaunchConfiguration('use_sim')),
            output='screen'
        ),

        # This node always launches
        Node(
            package='my_robot_pkg',
            executable='controller',
            name='controller',
            output='screen'
        ),
    ])
```

### Including Other Launch Files

**launch/main_launch.launch.py**:
```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node

def generate_launch_description():
    # Get path to other launch file
    other_launch = os.path.join(
        get_package_share_directory('my_robot_pkg'),
        'launch',
        'params_launch.launch.py'
    )

    return LaunchDescription([
        # Include another launch file
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(other_launch),
            launch_arguments={
                'robot_name': 'main_robot'
            }.items()
        ),

        # Add more nodes
        Node(
            package='my_robot_pkg',
            executable='additional_node',
            name='additional',
            output='screen'
        ),
    ])
```

### Event Handlers

**launch/events_launch.launch.py**:
```python
from launch import LaunchDescription
from launch.actions import RegisterEventHandler, LogInfo
from launch.event_handlers import OnProcessStart, OnProcessExit
from launch_ros.actions import Node

def generate_launch_description():
    turtlesim_node = Node(
        package='turtlesim',
        executable='turtlesim_node',
        name='sim'
    )

    teleop_node = Node(
        package='turtlesim',
        executable='turtle_teleop_key',
        name='teleop'
    )

    return LaunchDescription([
        turtlesim_node,

        # Start teleop when turtlesim starts
        RegisterEventHandler(
            OnProcessStart(
                target_action=turtlesim_node,
                on_start=[
                    LogInfo(msg='Turtlesim started, launching teleop'),
                    teleop_node
                ]
            )
        ),

        # Log when turtlesim exits
        RegisterEventHandler(
            OnProcessExit(
                target_action=turtlesim_node,
                on_exit=[
                    LogInfo(msg='Turtlesim exited')
                ]
            )
        ),
    ])
```

### Namespaces and Multi-Robot

**launch/multi_robot_launch.launch.py**:
```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Robot 1
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='sim',
            namespace='robot1',
            output='screen'
        ),

        # Robot 2
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='sim',
            namespace='robot2',
            output='screen'
        ),

        # Controller for robot 1
        Node(
            package='my_robot_pkg',
            executable='controller',
            name='controller',
            namespace='robot1',
            remappings=[
                ('/cmd_vel', '/robot1/turtle1/cmd_vel'),
            ],
            output='screen'
        ),

        # Controller for robot 2
        Node(
            package='my_robot_pkg',
            executable='controller',
            name='controller',
            namespace='robot2',
            remappings=[
                ('/cmd_vel', '/robot2/turtle1/cmd_vel'),
            ],
            output='screen'
        ),
    ])
```

### Launch Configuration Management

**launch/config_launch.launch.py**:
```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, GroupAction, SetParameter
from launch.substitutions import LaunchConfiguration, PythonExpression
from launch_ros.actions import Node, PushRosNamespace

def generate_launch_description():
    return LaunchDescription([
        # Arguments
        DeclareLaunchArgument('robot_name', default_value='robot1'),
        DeclareLaunchArgument('use_sim_time', default_value='false'),
        DeclareLaunchArgument('log_level', default_value='info'),

        # Set global parameters
        SetParameter(name='use_sim_time', value=LaunchConfiguration('use_sim_time')),

        # Group actions with namespace
        GroupAction([
            PushRosNamespace(LaunchConfiguration('robot_name')),

            Node(
                package='my_robot_pkg',
                executable='sensor_node',
                name='sensor',
                arguments=['--ros-args', '--log-level', LaunchConfiguration('log_level')],
                output='screen'
            ),

            Node(
                package='my_robot_pkg',
                executable='controller_node',
                name='controller',
                output='screen'
            ),
        ]),
    ])
```

### Key Takeaways (Intermediate)

✅ **Conditional launching** with IfCondition/UnlessCondition
✅ **Include launch files** for modularity
✅ **Event handlers** coordinate node startup
✅ **Namespaces** enable multi-robot systems
✅ **GroupAction** organizes related nodes

---

## 🔴 Advanced Level

**Duration**: 2 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Create dynamic launch configurations
- Implement launch testing
- Build reusable launch components
- Optimize launch performance

### Dynamic Node Generation

**launch/dynamic_launch.launch.py**:
```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    # Generate nodes dynamically
    nodes = []

    num_robots = 3  # Could be a launch argument

    for i in range(num_robots):
        robot_name = f'robot{i+1}'

        nodes.append(
            Node(
                package='my_robot_pkg',
                executable='robot_node',
                name='robot',
                namespace=robot_name,
                parameters=[{
                    'robot_id': i,
                    'robot_name': robot_name
                }],
                output='screen'
            )
        )

    return LaunchDescription(nodes)
```

### Production Launch Template

**launch/production_launch.launch.py**:
```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import (
    DeclareLaunchArgument,
    GroupAction,
    IncludeLaunchDescription,
    SetEnvironmentVariable,
    TimerAction
)
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration, PythonExpression
from launch_ros.actions import Node, PushRosNamespace, SetParameter

def generate_launch_description():
    pkg_dir = get_package_share_directory('my_robot_pkg')

    # Arguments
    declare_robot_name = DeclareLaunchArgument(
        'robot_name',
        default_value='robot1',
        description='Robot identifier'
    )

    declare_use_sim = DeclareLaunchArgument(
        'use_sim',
        default_value='true',
        choices=['true', 'false'],
        description='Use simulation'
    )

    declare_log_level = DeclareLaunchArgument(
        'log_level',
        default_value='info',
        choices=['debug', 'info', 'warn', 'error', 'fatal'],
        description='Logging level'
    )

    # Configuration
    config_file = os.path.join(pkg_dir, 'config', 'robot_config.yaml')

    # Set environment variables
    set_env = SetEnvironmentVariable('RCUTILS_CONSOLE_OUTPUT_FORMAT',
        '[{severity}] [{name}]: {message}')

    # Core nodes group
    core_nodes = GroupAction([
        PushRosNamespace(LaunchConfiguration('robot_name')),
        SetParameter(name='use_sim_time', value=LaunchConfiguration('use_sim')),

        Node(
            package='my_robot_pkg',
            executable='state_publisher',
            name='state_publisher',
            parameters=[config_file],
            arguments=['--ros-args', '--log-level', LaunchConfiguration('log_level')],
            output='screen'
        ),

        Node(
            package='my_robot_pkg',
            executable='controller',
            name='controller',
            parameters=[config_file],
            output='screen'
        ),

        # Delayed node start
        TimerAction(
            period=2.0,
            actions=[
                Node(
                    package='my_robot_pkg',
                    executable='safety_monitor',
                    name='safety',
                    parameters=[config_file],
                    output='screen'
                ),
            ]
        ),
    ])

    # Simulation nodes (conditional)
    sim_nodes = GroupAction(
        condition=IfCondition(LaunchConfiguration('use_sim')),
        actions=[
            Node(
                package='gazebo_ros',
                executable='spawn_entity.py',
                arguments=['-entity', LaunchConfiguration('robot_name')],
                output='screen'
            ),
        ]
    )

    return LaunchDescription([
        set_env,
        declare_robot_name,
        declare_use_sim,
        declare_log_level,
        core_nodes,
        sim_nodes,
    ])
```

### Key Takeaways (Advanced)

✅ **Dynamic generation** creates nodes programmatically
✅ **Production templates** include logging, monitoring, safety
✅ **Environment variables** configure system behavior
✅ **Delayed starts** with TimerAction
✅ **Modular organization** with GroupAction

---

## Additional Resources

- [ROS 2 Launch Documentation](https://docs.ros.org/en/humble/Tutorials/Intermediate/Launch/Launch-Main.html)
- [Launch File Examples](https://github.com/ros2/launch/tree/humble/launch/examples)

---

**Next:** [Testing →](./11-testing.md)
