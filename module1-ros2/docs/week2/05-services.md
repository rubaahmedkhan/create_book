---
sidebar_position: 5
---

# Services

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Completed Week 1

### Learning Objectives

- Understand the request-response communication pattern
- Differentiate between topics and services
- Create service servers in Python
- Call services from client nodes
- Use standard ROS 2 service types
- Debug services with CLI tools

### What are Services?

**Services** implement a **request-response** (or call-and-response) communication pattern.

**Key characteristics:**
- **Synchronous**: Client waits for response
- **One-to-one**: Single client connects to single server
- **Bidirectional**: Request sent, response returned
- **Short-lived**: Should complete quickly (< 1 second)

**Real-world analogy:**
- **Service** = Restaurant order
- **Client** = Customer ordering food
- **Server** = Kitchen preparing food
- **Request** = Order ("One burger, please")
- **Response** = Result ("Here's your burger" or "Sorry, out of stock")

### Topics vs Services

| Feature | Topics | Services |
|---------|--------|----------|
| **Pattern** | Publish/Subscribe | Request/Response |
| **Communication** | Asynchronous | Synchronous |
| **Directionality** | One-way | Two-way |
| **Cardinality** | Many-to-many | One-to-one per call |
| **Use Case** | Continuous data streams | One-time operations |
| **Example** | Sensor readings | "Reset odometry", "Add two numbers" |

**When to use services:**
- ✅ One-time commands ("take a picture", "save map")
- ✅ Query operations ("get battery level", "is path clear?")
- ✅ Configuration changes ("set mode", "enable/disable feature")
- ❌ Continuous data streams (use topics instead)
- ❌ Long-running tasks > 1 second (use actions instead)

### Standard Service Types

```bash
# List all service types
ros2 interface list | grep srv

# Common standard services
ros2 interface show std_srvs/srv/Empty        # No request/response data
ros2 interface show std_srvs/srv/SetBool      # Enable/disable
ros2 interface show std_srvs/srv/Trigger      # Trigger with success/message response
ros2 interface show example_interfaces/srv/AddTwoInts  # Add two integers
```

#### Example Service Structures

**std_srvs/srv/Empty**:
```
---
# No request or response fields
```

**std_srvs/srv/SetBool**:
```
bool data  # true = enable, false = disable
---
bool success
string message
```

**example_interfaces/srv/AddTwoInts**:
```
int64 a
int64 b
---
int64 sum
```

### Creating a Service Server

**Example: Add two integers service**

**add_two_ints_server.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddTwoIntsServer(Node):
    def __init__(self):
        super().__init__('add_two_ints_server')

        # Create service
        # Parameters: service_type, service_name, callback_function
        self.service = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_two_ints_callback
        )

        self.get_logger().info('Add Two Ints Server started')

    def add_two_ints_callback(self, request, response):
        """
        Called when a service request is received

        Args:
            request: Contains request.a and request.b
            response: Object to fill and return

        Returns:
            response: Filled response object
        """
        # Perform calculation
        response.sum = request.a + request.b

        # Log the request
        self.get_logger().info(
            f'Incoming request: a={request.a}, b={request.b}'
        )
        self.get_logger().info(f'Returning sum: {response.sum}')

        return response

def main(args=None):
    rclpy.init(args=args)
    node = AddTwoIntsServer()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Creating a Service Client

**add_two_ints_client.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts
import sys

class AddTwoIntsClient(Node):
    def __init__(self):
        super().__init__('add_two_ints_client')

        # Create client
        # Parameters: service_type, service_name
        self.client = self.create_client(AddTwoInts, 'add_two_ints')

        # Wait for service to be available
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Waiting for service to become available...')

        self.get_logger().info('Service is available!')

    def send_request(self, a, b):
        """Send service request and wait for response"""
        # Create request
        request = AddTwoInts.Request()
        request.a = a
        request.b = b

        # Call service asynchronously
        self.future = self.client.call_async(request)

        # Wait for response
        rclpy.spin_until_future_complete(self, self.future)

        # Get result
        if self.future.result() is not None:
            response = self.future.result()
            self.get_logger().info(f'{a} + {b} = {response.sum}')
            return response.sum
        else:
            self.get_logger().error('Service call failed')
            return None

def main(args=None):
    rclpy.init(args=args)

    # Get arguments from command line
    if len(sys.argv) != 3:
        print('Usage: python3 add_two_ints_client.py <a> <b>')
        return

    a = int(sys.argv[1])
    b = int(sys.argv[2])

    # Create client and send request
    client_node = AddTwoIntsClient()
    result = client_node.send_request(a, b)

    client_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Run it:**

```bash
# Terminal 1: Start server
python3 add_two_ints_server.py

# Terminal 2: Call service
python3 add_two_ints_client.py 10 5
# Output: 10 + 5 = 15

python3 add_two_ints_client.py 100 200
# Output: 100 + 200 = 300
```

### Service Introspection (CLI)

```bash
# List all active services
ros2 service list

# Get service type
ros2 service type /add_two_ints
# Output: example_interfaces/srv/AddTwoInts

# Call service from command line
ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts "{a: 5, b: 3}"
# Output: sum: 8

# Find services of specific type
ros2 service find example_interfaces/srv/AddTwoInts
```

### Practical Example: Turtlesim Services

Turtlesim provides several useful services:

```bash
# Start turtlesim
ros2 run turtlesim turtlesim_node

# List services
ros2 service list
# /clear                    (std_srvs/srv/Empty)
# /kill                     (turtlesim/srv/Kill)
# /reset                    (std_srvs/srv/Empty)
# /spawn                    (turtlesim/srv/Spawn)
# /turtle1/set_pen          (turtlesim/srv/SetPen)
# /turtle1/teleport_absolute (turtlesim/srv/TeleportAbsolute)
# /turtle1/teleport_relative (turtlesim/srv/TeleportRelative)

# Clear the drawing
ros2 service call /clear std_srvs/srv/Empty

# Teleport turtle
ros2 service call /turtle1/teleport_absolute turtlesim/srv/TeleportAbsolute "{x: 5.5, y: 5.5, theta: 0}"

# Change pen color
ros2 service call /turtle1/set_pen turtlesim/srv/SetPen "{r: 255, g: 0, b: 0, width: 3, 'off': 0}"

# Spawn new turtle
ros2 service call /spawn turtlesim/srv/Spawn "{x: 2, y: 2, theta: 0, name: 'turtle2'}"
```

### Beginner Exercise: Reset Service

Create a node that periodically resets turtlesim:

**reset_periodically.py**:
```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_srvs.srv import Empty

class PeriodicReset(Node):
    def __init__(self):
        super().__init__('periodic_reset')

        # Create service client
        self.reset_client = self.create_client(Empty, '/reset')

        # Wait for service
        while not self.reset_client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Waiting for /reset service...')

        # Reset every 10 seconds
        self.timer = self.create_timer(10.0, self.reset_callback)

        self.get_logger().info('Periodic reset started (every 10 seconds)')

    def reset_callback(self):
        """Reset turtlesim"""
        request = Empty.Request()
        future = self.reset_client.call_async(request)

        # Non-blocking callback when done
        future.add_done_callback(self.reset_done)

    def reset_done(self, future):
        """Called when reset completes"""
        self.get_logger().info('Turtlesim reset!')

def main(args=None):
    rclpy.init(args=args)
    node = PeriodicReset()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Key Takeaways (Beginner)

✅ **Services** are request-response, synchronous communication
✅ **Servers** provide functionality, **clients** request it
✅ **Service callbacks** process requests and return responses
✅ **call_async()** makes non-blocking service calls
✅ **wait_for_service()** ensures service is available before calling
✅ Use services for **one-time operations**, not continuous data

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Create custom service definitions
- Implement callback-based async service calls
- Handle service timeouts and errors
- Use multiple concurrent service calls
- Implement service discovery patterns
- Optimize service performance

### Creating Custom Services

#### Step 1: Define Service in Interface Package

**srv/ComputeRectangleArea.srv**:
```
# Request
float64 length
float64 width
---
# Response
float64 area
bool success
string message
```

**srv/GetBatteryStatus.srv**:
```
# Request (empty - just query)
---
# Response
float32 voltage
float32 percentage
bool charging
string health_status
```

**srv/SetRobotMode.srv**:
```
# Request
string mode  # "idle", "manual", "autonomous", "charging"
---
# Response
bool success
string previous_mode
string message
```

#### Step 2: Configure CMakeLists.txt

```cmake
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/BatteryStatus.msg"
  "srv/ComputeRectangleArea.srv"
  "srv/GetBatteryStatus.srv"
  "srv/SetRobotMode.srv"
  DEPENDENCIES std_msgs
)
```

#### Step 3: Build and Use

```bash
colcon build --packages-select my_robot_interfaces
source install/setup.bash

# Verify
ros2 interface show my_robot_interfaces/srv/ComputeRectangleArea
```

**Using custom service:**

```python
from my_robot_interfaces.srv import ComputeRectangleArea

class AreaCalculatorServer(Node):
    def __init__(self):
        super().__init__('area_calculator')

        self.service = self.create_service(
            ComputeRectangleArea,
            'compute_rectangle_area',
            self.compute_area_callback
        )

    def compute_area_callback(self, request, response):
        if request.length <= 0 or request.width <= 0:
            response.success = False
            response.area = 0.0
            response.message = 'Invalid dimensions (must be > 0)'
        else:
            response.success = True
            response.area = request.length * request.width
            response.message = f'Computed area successfully'

        return response
```

### Async Service Calls with Callbacks

**Non-blocking service client:**

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AsyncServiceClient(Node):
    def __init__(self):
        super().__init__('async_service_client')

        self.client = self.create_client(AddTwoInts, 'add_two_ints')

        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Waiting for service...')

        # Send multiple requests without blocking
        self.send_request_async(10, 5)
        self.send_request_async(20, 15)
        self.send_request_async(100, 200)

    def send_request_async(self, a, b):
        """Send request asynchronously with callback"""
        request = AddTwoInts.Request()
        request.a = a
        request.b = b

        # Call async and register callback
        future = self.client.call_async(request)
        future.add_done_callback(
            lambda f: self.service_callback(f, a, b)
        )

    def service_callback(self, future, a, b):
        """Called when service response arrives"""
        try:
            response = future.result()
            self.get_logger().info(f'{a} + {b} = {response.sum}')
        except Exception as e:
            self.get_logger().error(f'Service call failed: {e}')

def main(args=None):
    rclpy.init(args=args)
    node = AsyncServiceClient()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Timeout Handling

**Service call with timeout:**

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts
from rclpy.executors import MultiThreadedExecutor
import concurrent.futures

class TimeoutServiceClient(Node):
    def __init__(self):
        super().__init__('timeout_client')

        self.client = self.create_client(AddTwoInts, 'add_two_ints')

    def call_with_timeout(self, a, b, timeout_sec=2.0):
        """Call service with timeout"""
        if not self.client.wait_for_service(timeout_sec=5.0):
            self.get_logger().error('Service not available')
            return None

        request = AddTwoInts.Request()
        request.a = a
        request.b = b

        future = self.client.call_async(request)

        # Wait with timeout
        try:
            rclpy.spin_until_future_complete(
                self,
                future,
                timeout_sec=timeout_sec
            )

            if future.done():
                if future.result() is not None:
                    return future.result().sum
                else:
                    self.get_logger().error('Service call failed')
                    return None
            else:
                self.get_logger().error('Service call timed out')
                return None

        except Exception as e:
            self.get_logger().error(f'Exception during service call: {e}')
            return None

def main():
    rclpy.init()
    node = TimeoutServiceClient()

    result = node.call_with_timeout(10, 5, timeout_sec=2.0)
    if result is not None:
        print(f'Result: {result}')

    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Multiple Concurrent Service Calls

**Calling multiple services in parallel:**

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts
import concurrent.futures

class MultiServiceClient(Node):
    def __init__(self):
        super().__init__('multi_service_client')

        self.client1 = self.create_client(AddTwoInts, 'add_service_1')
        self.client2 = self.create_client(AddTwoInts, 'add_service_2')
        self.client3 = self.create_client(AddTwoInts, 'add_service_3')

    def call_all_services(self):
        """Call all services concurrently"""
        # Create requests
        req1 = AddTwoInts.Request()
        req1.a, req1.b = 10, 5

        req2 = AddTwoInts.Request()
        req2.a, req2.b = 20, 15

        req3 = AddTwoInts.Request()
        req3.a, req3.b = 100, 200

        # Send all requests
        future1 = self.client1.call_async(req1)
        future2 = self.client2.call_async(req2)
        future3 = self.client3.call_async(req3)

        # Wait for all to complete
        futures = [future1, future2, future3]

        while not all(f.done() for f in futures):
            rclpy.spin_once(self, timeout_sec=0.1)

        # Process results
        results = []
        for i, future in enumerate(futures):
            if future.result() is not None:
                results.append(future.result().sum)
                self.get_logger().info(f'Service {i+1} result: {future.result().sum}')
            else:
                self.get_logger().error(f'Service {i+1} failed')
                results.append(None)

        return results
```

### Service Discovery

**Find services dynamically:**

```python
class ServiceDiscovery(Node):
    def __init__(self):
        super().__init__('service_discovery')

        # Discover services of specific type
        service_names_and_types = self.get_service_names_and_types()

        add_services = []
        for name, types in service_names_and_types:
            if 'example_interfaces/srv/AddTwoInts' in types:
                add_services.append(name)

        self.get_logger().info(f'Found AddTwoInts services: {add_services}')

        # Create clients dynamically
        self.clients = {}
        for service_name in add_services:
            self.clients[service_name] = self.create_client(
                AddTwoInts, service_name
            )
```

### Error Handling Best Practices

```python
class RobustServiceClient(Node):
    def __init__(self):
        super().__init__('robust_client')
        self.client = self.create_client(AddTwoInts, 'add_two_ints')

    def call_service_robust(self, a, b, max_retries=3):
        """Call service with retry logic"""
        # Wait for service with timeout
        if not self.client.wait_for_service(timeout_sec=5.0):
            self.get_logger().error('Service not available after waiting')
            return None

        for attempt in range(max_retries):
            try:
                request = AddTwoInts.Request()
                request.a = a
                request.b = b

                future = self.client.call_async(request)
                rclpy.spin_until_future_complete(self, future, timeout_sec=2.0)

                if future.done():
                    if future.exception() is not None:
                        raise future.exception()

                    response = future.result()
                    if response is not None:
                        return response.sum
                    else:
                        raise Exception('Empty response')
                else:
                    raise TimeoutError('Service call timed out')

            except Exception as e:
                self.get_logger().warn(
                    f'Attempt {attempt + 1}/{max_retries} failed: {e}'
                )

                if attempt < max_retries - 1:
                    self.get_logger().info('Retrying...')
                else:
                    self.get_logger().error('All retry attempts exhausted')

        return None
```

### Key Takeaways (Intermediate)

✅ **Custom services** defined in .srv files with request/response sections
✅ **Async callbacks** enable non-blocking service calls
✅ **Timeouts** prevent indefinite blocking
✅ **Retry logic** improves reliability
✅ **Service discovery** finds available services dynamically
✅ **Multiple concurrent calls** maximize throughput

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement production-grade service patterns
- Optimize service performance and latency
- Handle service lifecycle and cleanup
- Design service-based architectures
- Implement service proxies and facades
- Profile and benchmark service performance

### Production Service Server Pattern

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.executors import MultiThreadedExecutor
import time
import threading

class ProductionServiceServer(Node):
    """Production-grade service server with:
    - Thread-safe operation
    - Request queuing
    - Performance monitoring
    - Error handling
    - Graceful shutdown
    """

    def __init__(self):
        super().__init__('production_service_server')

        # Use reentrant callback group for concurrent requests
        self.callback_group = ReentrantCallbackGroup()

        # Create service
        self.service = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.service_callback,
            callback_group=self.callback_group
        )

        # Performance metrics
        self.request_count = 0
        self.total_processing_time = 0.0
        self.lock = threading.Lock()

        # Monitoring timer
        self.monitor_timer = self.create_timer(10.0, self.log_statistics)

        self.get_logger().info('Production service server started')

    def service_callback(self, request, response):
        """Handle service request"""
        start_time = time.time()

        try:
            # Validate input
            if not isinstance(request.a, int) or not isinstance(request.b, int):
                self.get_logger().error('Invalid input types')
                response.sum = 0
                return response

            # Process request
            response.sum = request.a + request.b

            # Update metrics
            processing_time = time.time() - start_time

            with self.lock:
                self.request_count += 1
                self.total_processing_time += processing_time

            self.get_logger().info(
                f'Processed request {self.request_count}: '
                f'{request.a} + {request.b} = {response.sum} '
                f'(took {processing_time*1000:.2f}ms)',
                throttle_duration_sec=1.0
            )

        except Exception as e:
            self.get_logger().error(f'Error processing request: {e}')
            response.sum = 0

        return response

    def log_statistics(self):
        """Log performance statistics"""
        with self.lock:
            if self.request_count > 0:
                avg_time = (self.total_processing_time / self.request_count) * 1000
                self.get_logger().info(
                    f'Statistics: {self.request_count} requests, '
                    f'avg processing time: {avg_time:.2f}ms'
                )

def main():
    rclpy.init()

    node = ProductionServiceServer()

    # Use multi-threaded executor for concurrent requests
    executor = MultiThreadedExecutor(num_threads=4)
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

### Service Facade Pattern

**Coordinating multiple services:**

```python
class RobotControlFacade(Node):
    """High-level facade coordinating multiple low-level services"""

    def __init__(self):
        super().__init__('robot_control_facade')

        # Create clients for low-level services
        self.motor_client = self.create_client(SetMotorSpeed, 'set_motor_speed')
        self.sensor_client = self.create_client(ReadSensor, 'read_sensor')
        self.config_client = self.create_client(SetConfig, 'set_config')

        # Create high-level service
        self.service = self.create_service(
            RobotCommand,
            'execute_robot_command',
            self.execute_command
        )

    def execute_command(self, request, response):
        """Execute complex command by coordinating multiple services"""
        try:
            # Step 1: Read sensor data
            sensor_response = self.call_sync(
                self.sensor_client,
                ReadSensor.Request()
            )

            if sensor_response is None:
                response.success = False
                response.message = 'Failed to read sensors'
                return response

            # Step 2: Update configuration based on sensor data
            config_request = SetConfig.Request()
            config_request.mode = 'safe' if sensor_response.obstacle_detected else 'normal'

            config_response = self.call_sync(self.config_client, config_request)

            # Step 3: Execute motor command
            motor_request = SetMotorSpeed.Request()
            motor_request.speed = request.desired_speed

            motor_response = self.call_sync(self.motor_client, motor_request)

            if motor_response and motor_response.success:
                response.success = True
                response.message = 'Command executed successfully'
            else:
                response.success = False
                response.message = 'Motor command failed'

        except Exception as e:
            self.get_logger().error(f'Command execution failed: {e}')
            response.success = False
            response.message = str(e)

        return response

    def call_sync(self, client, request, timeout=2.0):
        """Synchronous service call with timeout"""
        if not client.wait_for_service(timeout_sec=1.0):
            return None

        future = client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=timeout)

        return future.result() if future.done() else None
```

### Service Performance Benchmarking

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts
import time
import statistics
import numpy as np

class ServiceBenchmark(Node):
    def __init__(self):
        super().__init__('service_benchmark')

        self.client = self.create_client(AddTwoInts, 'add_two_ints')

        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Waiting for service...')

    def run_benchmark(self, num_calls=1000):
        """Benchmark service latency"""
        latencies = []

        self.get_logger().info(f'Starting benchmark: {num_calls} calls')

        for i in range(num_calls):
            request = AddTwoInts.Request()
            request.a = i
            request.b = i + 1

            start_time = time.time()

            future = self.client.call_async(request)
            rclpy.spin_until_future_complete(self, future)

            latency = (time.time() - start_time) * 1000  # Convert to ms
            latencies.append(latency)

            if (i + 1) % 100 == 0:
                self.get_logger().info(f'Progress: {i + 1}/{num_calls}')

        # Calculate statistics
        self.print_statistics(latencies)

    def print_statistics(self, latencies):
        """Print latency statistics"""
        latencies = np.array(latencies)

        self.get_logger().info('=== Benchmark Results ===')
        self.get_logger().info(f'Total calls: {len(latencies)}')
        self.get_logger().info(f'Mean latency: {latencies.mean():.2f} ms')
        self.get_logger().info(f'Std dev: {latencies.std():.2f} ms')
        self.get_logger().info(f'Min latency: {latencies.min():.2f} ms')
        self.get_logger().info(f'Max latency: {latencies.max():.2f} ms')
        self.get_logger().info(f'Median (p50): {np.percentile(latencies, 50):.2f} ms')
        self.get_logger().info(f'p95: {np.percentile(latencies, 95):.2f} ms')
        self.get_logger().info(f'p99: {np.percentile(latencies, 99):.2f} ms')
        self.get_logger().info(f'p99.9: {np.percentile(latencies, 99.9):.2f} ms')

def main():
    rclpy.init()
    benchmark = ServiceBenchmark()
    benchmark.run_benchmark(num_calls=1000)
    benchmark.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Key Takeaways (Advanced)

✅ **Reentrant callback groups** enable concurrent service requests
✅ **Service facades** coordinate multiple low-level services
✅ **Performance monitoring** tracks request counts and latencies
✅ **Benchmarking** quantifies p50, p95, p99 latencies
✅ **Production patterns** include validation, metrics, graceful shutdown

---

## Additional Resources

- [Writing a Service and Client (Python)](https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Service-And-Client.html)
- [Understanding Services](https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Services/Understanding-ROS2-Services.html)
- [Services Concepts](https://docs.ros.org/en/humble/Concepts/Basic/About-Services.html)

---

**Next:** [Actions →](./06-actions.md)
