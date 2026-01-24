---
sidebar_position: 7
---

# Parameters & Dynamic Configuration

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2 hours
**Prerequisites**: Completed Services section

### Learning Objectives

- Understand ROS 2 parameters
- Declare and use parameters in nodes
- Set parameters from command line and files
- Use ros2 param CLI tools
- Load parameters from YAML files

### What are Parameters?

**Parameters** are configuration values for nodes that can be:
- Set at launch time
- Changed at runtime
- Saved to/loaded from files
- Specific to each node

**Use cases:**
- Robot dimensions (wheel radius, base width)
- Sensor settings (camera FPS, LiDAR range)
- Controller gains (PID values)
- Behavior settings (speed limits, timeouts)

### Parameter Types

ROS 2 supports:
- `bool`
- `int64`
- `float64`
- `string`
- Arrays: `bool[]`, `int64[]`, `float64[]`, `string[]`

### Declaring Parameters

**parameter_node.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node

class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # Declare parameters with default values
        self.declare_parameter('robot_name', 'my_robot')
        self.declare_parameter('max_speed', 1.0)
        self.declare_parameter('enable_safety', True)
        self.declare_parameter('wheel_radius', 0.05)

        # Get parameter values
        robot_name = self.get_parameter('robot_name').value
        max_speed = self.get_parameter('max_speed').value
        enable_safety = self.get_parameter('enable_safety').value

        self.get_logger().info(f'Robot: {robot_name}')
        self.get_logger().info(f'Max speed: {max_speed} m/s')
        self.get_logger().info(f'Safety: {enable_safety}')

        # Use parameters
        self.timer = self.create_timer(1.0, self.timer_callback)

    def timer_callback(self):
        """Use current parameter values"""
        max_speed = self.get_parameter('max_speed').value
        self.get_logger().info(f'Current max speed: {max_speed}')

def main(args=None):
    rclpy.init(args=args)
    node = ParameterNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Setting Parameters from Command Line

```bash
# Run with default parameters
python3 parameter_node.py

# Override parameters at launch
ros2 run my_package parameter_node --ros-args \
  -p robot_name:=robot1 \
  -p max_speed:=2.5 \
  -p enable_safety:=false
```

### Parameter CLI Tools

```bash
# Start your node
python3 parameter_node.py

# List all parameters
ros2 param list

# Get parameter value
ros2 param get /parameter_node max_speed
# Output: Double value is: 1.0

# Set parameter value (runtime)
ros2 param set /parameter_node max_speed 3.0
# Output: Set parameter successful

# Dump all parameters to file
ros2 param dump /parameter_node --output-dir .
# Creates: parameter_node.yaml

# Load parameters from file
ros2 param load /parameter_node parameter_node.yaml
```

### Parameter Files (YAML)

**robot_config.yaml**:
```yaml
/parameter_node:
  ros__parameters:
    robot_name: "production_robot"
    max_speed: 2.0
    enable_safety: true
    wheel_radius: 0.06
```

**Load from file:**
```bash
ros2 run my_package parameter_node --ros-args \
  --params-file robot_config.yaml
```

### Parameter Descriptions

**descriptive_parameters.py**:
```python
from rcl_interfaces.msg import ParameterDescriptor

class DescriptiveNode(Node):
    def __init__(self):
        super().__init__('descriptive_node')

        # Declare with description
        max_speed_descriptor = ParameterDescriptor(
            description='Maximum robot speed in m/s',
            read_only=False
        )

        self.declare_parameter(
            'max_speed',
            1.0,
            max_speed_descriptor
        )

        # Read-only parameter
        robot_id_descriptor = ParameterDescriptor(
            description='Robot unique identifier',
            read_only=True
        )

        self.declare_parameter(
            'robot_id',
            'ROBOT_001',
            robot_id_descriptor
        )
```

**Check descriptions:**
```bash
ros2 param describe /descriptive_node max_speed
```

### Key Takeaways (Beginner)

✅ **Parameters** configure node behavior at runtime
✅ **declare_parameter()** creates parameters with defaults
✅ **get_parameter()** retrieves current values
✅ **YAML files** store parameter configurations
✅ **CLI tools** inspect and modify parameters

---

## 🟡 Intermediate Level

**Duration**: 3 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Implement parameter validation
- Use parameter callbacks for runtime changes
- Handle parameter constraints
- Organize parameter hierarchies
- Dynamically reconfigure nodes

### Parameter Validation

**validated_parameters.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rcl_interfaces.msg import ParameterDescriptor, SetParametersResult

class ValidatedParameterNode(Node):
    def __init__(self):
        super().__init__('validated_parameter_node')

        # Declare parameters
        self.declare_parameter('max_speed', 1.0)
        self.declare_parameter('min_speed', 0.1)
        self.declare_parameter('robot_mode', 'idle')

        # Register parameter callback
        self.add_on_set_parameters_callback(self.parameter_callback)

        self.get_logger().info('Validated parameter node started')

    def parameter_callback(self, params):
        """Validate parameter changes"""
        result = SetParametersResult()
        result.successful = True

        for param in params:
            if param.name == 'max_speed':
                if param.value < 0.0 or param.value > 5.0:
                    result.successful = False
                    result.reason = 'max_speed must be between 0 and 5 m/s'
                    self.get_logger().warn(result.reason)
                    return result

            elif param.name == 'min_speed':
                if param.value < 0.0 or param.value > 1.0:
                    result.successful = False
                    result.reason = 'min_speed must be between 0 and 1 m/s'
                    return result

                # Ensure min < max
                max_speed = self.get_parameter('max_speed').value
                if param.value >= max_speed:
                    result.successful = False
                    result.reason = 'min_speed must be less than max_speed'
                    return result

            elif param.name == 'robot_mode':
                valid_modes = ['idle', 'manual', 'autonomous']
                if param.value not in valid_modes:
                    result.successful = False
                    result.reason = f'robot_mode must be one of {valid_modes}'
                    return result

        if result.successful:
            self.get_logger().info('Parameter update accepted')

        return result

def main(args=None):
    rclpy.init(args=args)
    node = ValidatedParameterNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Test validation:**
```bash
# Valid change
ros2 param set /validated_parameter_node max_speed 3.0
# Success

# Invalid change (out of range)
ros2 param set /validated_parameter_node max_speed 10.0
# Rejected: max_speed must be between 0 and 5 m/s

# Invalid mode
ros2 param set /validated_parameter_node robot_mode invalid
# Rejected
```

### Dynamic Reconfiguration

**dynamic_config_node.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rcl_interfaces.msg import SetParametersResult
from geometry_msgs.msg import Twist

class DynamicConfigNode(Node):
    def __init__(self):
        super().__init__('dynamic_config_node')

        # Declare parameters
        self.declare_parameter('linear_gain', 1.0)
        self.declare_parameter('angular_gain', 1.0)
        self.declare_parameter('speed_limit', 2.0)

        # Register callback
        self.add_on_set_parameters_callback(self.parameter_callback)

        # Publisher
        self.cmd_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.timer = self.create_timer(0.1, self.control_loop)

        self.target_linear = 1.0
        self.target_angular = 0.5

    def parameter_callback(self, params):
        """React to parameter changes"""
        result = SetParametersResult()
        result.successful = True

        for param in params:
            self.get_logger().info(
                f'Parameter changed: {param.name} = {param.value}'
            )

            # Update internal state immediately
            if param.name == 'speed_limit':
                if param.value <= 0:
                    result.successful = False
                    result.reason = 'speed_limit must be positive'

        return result

    def control_loop(self):
        """Use latest parameter values"""
        # Get current parameters
        linear_gain = self.get_parameter('linear_gain').value
        angular_gain = self.get_parameter('angular_gain').value
        speed_limit = self.get_parameter('speed_limit').value

        # Apply gains
        linear_vel = self.target_linear * linear_gain
        angular_vel = self.target_angular * angular_gain

        # Apply speed limit
        linear_vel = max(-speed_limit, min(speed_limit, linear_vel))

        # Publish
        msg = Twist()
        msg.linear.x = linear_vel
        msg.angular.z = angular_vel
        self.cmd_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = DynamicConfigNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Dynamically adjust:**
```bash
# Start node
python3 dynamic_config_node.py

# Adjust gains in real-time
ros2 param set /dynamic_config_node linear_gain 2.0
ros2 param set /dynamic_config_node angular_gain 0.5

# Adjust speed limit
ros2 param set /dynamic_config_node speed_limit 1.5
```

### Parameter Hierarchies

**hierarchical_params.yaml**:
```yaml
/robot_controller:
  ros__parameters:
    # Motor parameters
    motors:
      left_wheel:
        max_rpm: 100
        gear_ratio: 20.0
      right_wheel:
        max_rpm: 100
        gear_ratio: 20.0

    # Sensor parameters
    sensors:
      lidar:
        range: 10.0
        frequency: 20
      camera:
        fps: 30
        resolution: [640, 480]

    # Controller parameters
    controller:
      pid:
        kp: 1.0
        ki: 0.1
        kd: 0.05
      limits:
        max_linear: 2.0
        max_angular: 1.5
```

**Access nested parameters:**
```python
class HierarchicalNode(Node):
    def __init__(self):
        super().__init__('robot_controller')

        # Declare nested parameters
        self.declare_parameter('motors.left_wheel.max_rpm', 100)
        self.declare_parameter('motors.right_wheel.max_rpm', 100)
        self.declare_parameter('sensors.lidar.range', 10.0)
        self.declare_parameter('controller.pid.kp', 1.0)

        # Get nested values
        left_rpm = self.get_parameter('motors.left_wheel.max_rpm').value
        lidar_range = self.get_parameter('sensors.lidar.range').value
        kp = self.get_parameter('controller.pid.kp').value
```

### Parameter Client (Access Other Node's Parameters)

**parameter_client.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rcl_interfaces.srv import GetParameters, SetParameters
from rcl_interfaces.msg import Parameter, ParameterValue, ParameterType

class ParameterClient(Node):
    def __init__(self):
        super().__init__('parameter_client')

        # Create clients for another node's parameters
        self.get_params_client = self.create_client(
            GetParameters,
            '/parameter_node/get_parameters'
        )

        self.set_params_client = self.create_client(
            SetParameters,
            '/parameter_node/set_parameters'
        )

    def get_remote_parameter(self, param_name):
        """Get parameter from another node"""
        request = GetParameters.Request()
        request.names = [param_name]

        future = self.get_params_client.call_async(request)
        rclpy.spin_until_future_complete(self, future)

        if future.result() is not None:
            values = future.result().values
            if len(values) > 0:
                return values[0]

        return None

    def set_remote_parameter(self, param_name, value):
        """Set parameter on another node"""
        param = Parameter()
        param.name = param_name

        param_value = ParameterValue()
        param_value.type = ParameterType.PARAMETER_DOUBLE
        param_value.double_value = value

        param.value = param_value

        request = SetParameters.Request()
        request.parameters = [param]

        future = self.set_params_client.call_async(request)
        rclpy.spin_until_future_complete(self, future)

        return future.result()

def main():
    rclpy.init()
    client = ParameterClient()

    # Get parameter from another node
    value = client.get_remote_parameter('max_speed')
    client.get_logger().info(f'Remote max_speed: {value}')

    # Set parameter on another node
    result = client.set_remote_parameter('max_speed', 3.0)
    client.get_logger().info(f'Set result: {result}')

    client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Key Takeaways (Intermediate)

✅ **Parameter callbacks** validate and react to changes
✅ **Dynamic reconfiguration** updates behavior at runtime
✅ **Hierarchical parameters** organize complex configurations
✅ **Parameter clients** access other nodes' parameters
✅ **Validation** prevents invalid configurations

---

## 🔴 Advanced Level

**Duration**: 3 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement production parameter management
- Handle parameter persistence
- Optimize parameter access
- Design parameter schemas
- Implement parameter security

### Production Parameter Management

**production_params.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from rcl_interfaces.msg import ParameterDescriptor, ParameterType, SetParametersResult
from rcl_interfaces.msg import IntegerRange, FloatingPointRange
import yaml
import os

class ProductionParameterNode(Node):
    """Production-grade parameter management with:
    - Validation with ranges
    - Persistence
    - Change logging
    - Rollback capability
    """

    def __init__(self):
        super().__init__('production_params')

        # Parameter history for rollback
        self.param_history = {}

        # Declare parameters with constraints
        self.declare_parameters_with_constraints()

        # Register callback
        self.add_on_set_parameters_callback(self.parameter_callback)

        # Auto-save parameters periodically
        self.create_timer(60.0, self.autosave_parameters)

        self.get_logger().info('Production parameter node started')

    def declare_parameters_with_constraints(self):
        """Declare parameters with validation constraints"""
        # Speed parameter with range
        speed_descriptor = ParameterDescriptor(
            name='max_speed',
            type=ParameterType.PARAMETER_DOUBLE,
            description='Maximum speed in m/s',
            read_only=False,
            floating_point_range=[FloatingPointRange(
                from_value=0.0,
                to_value=5.0,
                step=0.1
            )]
        )
        self.declare_parameter('max_speed', 1.0, speed_descriptor)

        # Integer parameter with range
        sensor_rate_descriptor = ParameterDescriptor(
            name='sensor_rate',
            type=ParameterType.PARAMETER_INTEGER,
            description='Sensor update rate in Hz',
            integer_range=[IntegerRange(
                from_value=1,
                to_value=100,
                step=1
            )]
        )
        self.declare_parameter('sensor_rate', 20, sensor_rate_descriptor)

        # String parameter (enum-like)
        mode_descriptor = ParameterDescriptor(
            name='robot_mode',
            type=ParameterType.PARAMETER_STRING,
            description='Robot operating mode',
            additional_constraints='One of: idle, manual, autonomous'
        )
        self.declare_parameter('robot_mode', 'idle', mode_descriptor)

    def parameter_callback(self, params):
        """Validate and log parameter changes"""
        result = SetParametersResult()
        result.successful = True

        for param in params:
            # Store old value for rollback
            if param.name not in self.param_history:
                old_value = self.get_parameter(param.name).value
                self.param_history[param.name] = old_value

            # Custom validation
            if param.name == 'robot_mode':
                valid_modes = ['idle', 'manual', 'autonomous']
                if param.value not in valid_modes:
                    result.successful = False
                    result.reason = f'Invalid mode. Must be one of {valid_modes}'
                    return result

            # Log change
            old_value = self.get_parameter(param.name).value
            self.get_logger().info(
                f'Parameter change: {param.name}: {old_value} -> {param.value}'
            )

        return result

    def rollback_parameter(self, param_name):
        """Rollback parameter to previous value"""
        if param_name in self.param_history:
            old_value = self.param_history[param_name]
            self.set_parameters([
                rclpy.parameter.Parameter(
                    param_name,
                    rclpy.Parameter.Type.from_parameter_value(old_value),
                    old_value
                )
            ])
            self.get_logger().info(f'Rolled back {param_name} to {old_value}')

    def autosave_parameters(self):
        """Automatically save parameters to file"""
        config_file = os.path.expanduser('~/robot_config_backup.yaml')

        try:
            params = self.get_parameters(self._parameters.keys())
            param_dict = {}

            for param in params:
                param_dict[param.name] = param.value

            with open(config_file, 'w') as f:
                yaml.dump(param_dict, f)

            self.get_logger().info(f'Auto-saved parameters to {config_file}')

        except Exception as e:
            self.get_logger().error(f'Failed to auto-save parameters: {e}')

def main():
    rclpy.init()
    node = ProductionParameterNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Parameter Schema Validation

**param_schema.py**:
```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class ParameterSchema:
    """Define parameter schema for validation"""
    name: str
    type: type
    default: any
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    valid_values: Optional[List] = None
    description: str = ""

class SchemaValidatedNode(Node):
    """Node with schema-based parameter validation"""

    def __init__(self):
        super().__init__('schema_validated_node')

        # Define parameter schema
        self.param_schema = {
            'max_speed': ParameterSchema(
                name='max_speed',
                type=float,
                default=1.0,
                min_value=0.0,
                max_value=5.0,
                description='Maximum robot speed'
            ),
            'robot_mode': ParameterSchema(
                name='robot_mode',
                type=str,
                default='idle',
                valid_values=['idle', 'manual', 'autonomous'],
                description='Operating mode'
            ),
            'sensor_count': ParameterSchema(
                name='sensor_count',
                type=int,
                default=4,
                min_value=1,
                max_value=10,
                description='Number of sensors'
            )
        }

        # Declare parameters from schema
        for schema in self.param_schema.values():
            self.declare_parameter(schema.name, schema.default)

        self.add_on_set_parameters_callback(self.validate_parameters)

    def validate_parameters(self, params):
        """Validate using schema"""
        result = SetParametersResult()
        result.successful = True

        for param in params:
            if param.name not in self.param_schema:
                result.successful = False
                result.reason = f'Unknown parameter: {param.name}'
                return result

            schema = self.param_schema[param.name]

            # Type check
            if not isinstance(param.value, schema.type):
                result.successful = False
                result.reason = f'{param.name} must be {schema.type.__name__}'
                return result

            # Range check
            if schema.min_value is not None and param.value < schema.min_value:
                result.successful = False
                result.reason = f'{param.name} must be >= {schema.min_value}'
                return result

            if schema.max_value is not None and param.value > schema.max_value:
                result.successful = False
                result.reason = f'{param.name} must be <= {schema.max_value}'
                return result

            # Valid values check
            if schema.valid_values and param.value not in schema.valid_values:
                result.successful = False
                result.reason = f'{param.name} must be one of {schema.valid_values}'
                return result

        return result
```

### Key Takeaways (Advanced)

✅ **Production management** includes validation, persistence, rollback
✅ **Parameter constraints** enforce ranges and valid values
✅ **Schema validation** provides structured parameter definitions
✅ **Auto-save** persists parameters periodically
✅ **Parameter history** enables rollback to previous values

---

## Additional Resources

- [Using Parameters in a Class (Python)](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Using-Parameters-In-A-Class-Python.html)
- [Understanding Parameters](https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Parameters/Understanding-ROS2-Parameters.html)
- [Parameters Concepts](https://docs.ros.org/en/humble/Concepts/Basic/About-Parameters.html)

---

**Next:** [Lab 2: Robot Controller →](./08-lab2-controller.md)
