---
sidebar_position: 11
---

# Testing ROS 2 Code

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2 hours
**Prerequisites**: Completed Packages and Launch sections

### Learning Objectives

- Understand ROS 2 testing philosophy
- Write unit tests with pytest
- Test publishers and subscribers
- Use mock objects
- Run tests with colcon

### Why Test?

**Benefits:**
- ✅ Catch bugs early
- ✅ Refactor with confidence
- ✅ Document expected behavior
- ✅ Enable CI/CD pipelines

### Unit Testing with pytest

**test/test_my_node.py**:
```python
import pytest
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

@pytest.fixture
def node():
    """Fixture to create and destroy node"""
    rclpy.init()
    test_node = Node('test_node')
    yield test_node
    test_node.destroy_node()
    rclpy.shutdown()

def test_node_creation(node):
    """Test that node is created correctly"""
    assert node.get_name() == 'test_node'
    assert node.get_namespace() == '/'

def test_publisher_creation(node):
    """Test creating a publisher"""
    pub = node.create_publisher(String, 'test_topic', 10)
    assert pub is not None
    assert pub.topic_name == '/test_topic'

def test_subscription_creation(node):
    """Test creating a subscription"""
    def callback(msg):
        pass

    sub = node.create_subscription(String, 'test_topic', callback, 10)
    assert sub is not None
    assert sub.topic_name == '/test_topic'
```

### Testing Publishers

**test/test_publisher.py**:
```python
import pytest
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import time

class TestPublisher:
    @pytest.fixture(autouse=True)
    def setup(self):
        rclpy.init()
        self.node = Node('test_publisher_node')
        yield
        self.node.destroy_node()
        rclpy.shutdown()

    def test_publish_message(self):
        """Test that message is published"""
        # Create publisher
        pub = self.node.create_publisher(String, 'test_topic', 10)

        # Create subscriber to receive message
        received_msgs = []

        def callback(msg):
            received_msgs.append(msg)

        sub = self.node.create_subscription(
            String, 'test_topic', callback, 10
        )

        # Publish message
        msg = String()
        msg.data = 'Test message'
        pub.publish(msg)

        # Spin to process callbacks
        executor = rclpy.executors.SingleThreadedExecutor()
        executor.add_node(self.node)
        executor.spin_once(timeout_sec=1.0)

        # Assert message was received
        assert len(received_msgs) == 1
        assert received_msgs[0].data == 'Test message'
```

### Testing with Mock Objects

**test/test_with_mocks.py**:
```python
import pytest
import rclpy
from unittest.mock import Mock, MagicMock
from my_robot_pkg.my_node import MyNode

class TestMyNode:
    @pytest.fixture(autouse=True)
    def setup(self):
        rclpy.init()
        yield
        rclpy.shutdown()

    def test_callback_processing(self):
        """Test that callback processes messages correctly"""
        # Create node
        node = MyNode()

        # Mock the logger
        node.get_logger = Mock()

        # Create test message
        from std_msgs.msg import String
        msg = String()
        msg.data = 'test'

        # Call the callback
        node.callback(msg)

        # Assert logger was called
        node.get_logger().info.assert_called()

        node.destroy_node()
```

### Running Tests

**Run all tests:**
```bash
# Run tests for specific package
colcon test --packages-select my_robot_pkg

# Show test results
colcon test-result --all

# Verbose output
colcon test --packages-select my_robot_pkg --event-handlers console_direct+
```

### Test Configuration

**Update setup.py:**
```python
setup(
    # ...
    tests_require=['pytest'],
    # ...
)
```

**Update package.xml:**
```xml
<test_depend>ament_copyright</test_depend>
<test_depend>ament_flake8</test_depend>
<test_depend>ament_pep257</test_depend>
<test_depend>python3-pytest</test_depend>
```

### Key Takeaways (Beginner)

✅ **pytest** is the standard testing framework
✅ **Fixtures** set up and tear down test environments
✅ **Mock objects** isolate units under test
✅ **colcon test** runs all package tests
✅ **Test publishers/subscribers** by spinning executor

---

## 🟡 Intermediate Level

**Duration**: 3 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Write integration tests
- Test with launch files (launch_testing)
- Implement parametrized tests
- Test services and actions
- Measure code coverage

### Integration Testing

**test/integration/test_system.py**:
```python
import pytest
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from my_robot_interfaces.srv import SetMode
import time

class IntegrationTestNode(Node):
    def __init__(self):
        super().__init__('integration_test_node')
        self.received_messages = []

    def message_callback(self, msg):
        self.received_messages.append(msg.data)

@pytest.fixture
def test_system():
    """Set up complete test system"""
    rclpy.init()

    # Create test node
    test_node = IntegrationTestNode()

    # Create subscriber
    sub = test_node.create_subscription(
        String,
        '/robot_status',
        test_node.message_callback,
        10
    )

    yield test_node

    test_node.destroy_node()
    rclpy.shutdown()

def test_full_system(test_system):
    """Test complete system integration"""
    # Give system time to initialize
    executor = rclpy.executors.SingleThreadedExecutor()
    executor.add_node(test_system)

    # Spin for a bit to receive messages
    for _ in range(10):
        executor.spin_once(timeout_sec=0.1)

    # Assert we received some messages
    assert len(test_system.received_messages) > 0
```

### Launch Testing

**test/test_with_launch.py**:
```python
import unittest
from launch import LaunchDescription
from launch_ros.actions import Node
import launch_testing
import launch_testing.actions
import pytest

@pytest.mark.launch_test
def generate_test_description():
    """Generate launch description for testing"""
    return LaunchDescription([
        Node(
            package='my_robot_pkg',
            executable='my_node',
            name='test_node'
        ),
        launch_testing.actions.ReadyToTest(),
    ])

class TestNodeLaunch(unittest.TestCase):
    def test_node_starts(self, proc_info):
        """Test that node starts successfully"""
        proc_info.assertWaitForStartup(timeout=5)

    def test_node_output(self, proc_output):
        """Test node output"""
        proc_output.assertWaitFor('Node started', timeout=5)
```

### Parametrized Tests

**test/test_parametrized.py**:
```python
import pytest
from my_robot_pkg.utils import calculate_distance

@pytest.mark.parametrize("x1,y1,x2,y2,expected", [
    (0, 0, 0, 0, 0.0),
    (0, 0, 3, 4, 5.0),
    (1, 1, 4, 5, 5.0),
    (-3, -4, 0, 0, 5.0),
])
def test_calculate_distance(x1, y1, x2, y2, expected):
    """Test distance calculation with multiple inputs"""
    result = calculate_distance(x1, y1, x2, y2)
    assert pytest.approx(result, rel=1e-5) == expected
```

### Testing Services

**test/test_service.py**:
```python
import pytest
import rclpy
from rclpy.node import Node
from my_robot_interfaces.srv import SetMode

class TestServiceClient(Node):
    def __init__(self):
        super().__init__('test_service_client')
        self.client = self.create_client(SetMode, 'set_mode')

    def call_service(self, mode):
        request = SetMode.Request()
        request.mode = mode

        future = self.client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=5.0)

        if future.result() is not None:
            return future.result()
        else:
            raise Exception('Service call failed')

@pytest.fixture
def test_client():
    rclpy.init()
    client = TestServiceClient()

    # Wait for service
    if not client.client.wait_for_service(timeout_sec=5.0):
        raise Exception('Service not available')

    yield client

    client.destroy_node()
    rclpy.shutdown()

def test_set_mode_service(test_client):
    """Test SetMode service"""
    response = test_client.call_service('autonomous')

    assert response.success == True
    assert 'autonomous' in response.message.lower()
```

### Testing Actions

**test/test_action.py**:
```python
import pytest
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from my_robot_interfaces.action import NavigateToGoal

class TestActionClient(Node):
    def __init__(self):
        super().__init__('test_action_client')
        self._action_client = ActionClient(
            self,
            NavigateToGoal,
            'navigate_to_goal'
        )

    def send_goal(self, x, y):
        goal_msg = NavigateToGoal.Goal()
        goal_msg.target_x = x
        goal_msg.target_y = y

        self._action_client.wait_for_server()

        send_goal_future = self._action_client.send_goal_async(goal_msg)
        rclpy.spin_until_future_complete(self, send_goal_future)

        goal_handle = send_goal_future.result()

        if not goal_handle.accepted:
            return None

        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future)

        return result_future.result().result

@pytest.fixture
def action_client():
    rclpy.init()
    client = TestActionClient()
    yield client
    client.destroy_node()
    rclpy.shutdown()

def test_navigate_action(action_client):
    """Test navigation action"""
    result = action_client.send_goal(5.0, 5.0)

    assert result is not None
    assert result.success == True
```

### Code Coverage

**Run tests with coverage:**
```bash
# Install coverage tools
pip3 install pytest-cov

# Run with coverage
pytest --cov=my_robot_pkg --cov-report=html test/

# View coverage report
firefox htmlcov/index.html
```

**Add to package.xml:**
```xml
<test_depend>python3-pytest-cov</test_depend>
```

### Key Takeaways (Intermediate)

✅ **Integration tests** verify system-level behavior
✅ **Launch testing** validates launch configurations
✅ **Parametrized tests** test multiple cases efficiently
✅ **Service/action testing** requires spinning executor
✅ **Code coverage** measures test completeness

---

## 🔴 Advanced Level

**Duration**: 2 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement performance testing
- Create property-based tests
- Build CI/CD pipelines
- Implement regression testing

### Performance Testing

**test/performance/test_latency.py**:
```python
import pytest
import rclpy
from rclpy.node import Node
from std_msgs.msg import Header
import time
import statistics

class LatencyTest(Node):
    def __init__(self):
        super().__init__('latency_test')
        self.publisher = self.create_publisher(Header, 'test_topic', 10)
        self.subscription = self.create_subscription(
            Header, 'test_topic', self.callback, 10
        )
        self.latencies = []

    def callback(self, msg):
        now = self.get_clock().now()
        sent_time = rclpy.time.Time.from_msg(msg.stamp)
        latency = (now - sent_time).nanoseconds / 1e6  # ms
        self.latencies.append(latency)

    def run_test(self, num_messages=1000):
        executor = rclpy.executors.SingleThreadedExecutor()
        executor.add_node(self)

        for _ in range(num_messages):
            msg = Header()
            msg.stamp = self.get_clock().now().to_msg()
            self.publisher.publish(msg)
            executor.spin_once(timeout_sec=0.001)

        return {
            'mean': statistics.mean(self.latencies),
            'std': statistics.stdev(self.latencies),
            'p95': sorted(self.latencies)[int(len(self.latencies) * 0.95)],
            'p99': sorted(self.latencies)[int(len(self.latencies) * 0.99)],
        }

def test_latency_performance():
    """Test that latency meets requirements"""
    rclpy.init()
    tester = LatencyTest()

    stats = tester.run_test(num_messages=1000)

    # Assert performance requirements
    assert stats['mean'] < 1.0, f"Mean latency {stats['mean']}ms exceeds 1ms"
    assert stats['p95'] < 2.0, f"P95 latency {stats['p95']}ms exceeds 2ms"
    assert stats['p99'] < 5.0, f"P99 latency {stats['p99']}ms exceeds 5ms"

    tester.destroy_node()
    rclpy.shutdown()
```

### Property-Based Testing with Hypothesis

**test/test_property_based.py**:
```python
import pytest
from hypothesis import given, strategies as st
from my_robot_pkg.utils import normalize_angle

@given(st.floats(min_value=-1000, max_value=1000))
def test_normalize_angle_always_in_range(angle):
    """Property: normalized angle always in [-pi, pi]"""
    import math
    result = normalize_angle(angle)
    assert -math.pi <= result <= math.pi

@given(st.floats(min_value=-10, max_value=10),
       st.floats(min_value=-10, max_value=10))
def test_distance_always_positive(x, y):
    """Property: distance is always non-negative"""
    from my_robot_pkg.utils import calculate_distance
    result = calculate_distance(0, 0, x, y)
    assert result >= 0
```

### GitHub Actions CI/CD

**.github/workflows/ros2_ci.yml**:
```yaml
name: ROS 2 CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-22.04

    steps:
    - uses: actions/checkout@v3

    - name: Setup ROS 2
      uses: ros-tooling/setup-ros@v0.7
      with:
        required-ros-distributions: humble

    - name: Build workspace
      run: |
        source /opt/ros/humble/setup.bash
        colcon build --packages-select my_robot_pkg

    - name: Run tests
      run: |
        source /opt/ros/humble/setup.bash
        source install/setup.bash
        colcon test --packages-select my_robot_pkg
        colcon test-result --verbose

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: build/my_robot_pkg/test_results/
```

### Key Takeaways (Advanced)

✅ **Performance testing** validates latency/throughput requirements
✅ **Property-based testing** finds edge cases automatically
✅ **CI/CD pipelines** automate testing on every commit
✅ **Regression testing** prevents reintroduction of bugs

---

## Additional Resources

- [ROS 2 Testing Documentation](https://docs.ros.org/en/humble/Tutorials/Intermediate/Testing/Testing-Main.html)
- [pytest Documentation](https://docs.pytest.org/)
- [launch_testing Package](https://github.com/ros2/launch/tree/humble/launch_testing)

---

**Next:** [Capstone Project →](./12-capstone.md)
