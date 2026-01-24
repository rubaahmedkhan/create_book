---
sidebar_position: 10
---

# Unity-ROS 2 Integration

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Unity Introduction, ROS 2 Basics

### Learning Objectives

- Set up ROS-TCP-Endpoint
- Establish Unity-ROS 2 connection
- Publish/subscribe to topics
- Control robot from ROS 2
- Visualize Unity sensors in RViz2

### Architecture Overview

**Communication flow**:
```
Unity (C#)
    ↕ TCP/IP
ROS-TCP-Endpoint (Python)
    ↕ ROS 2 Topics
ROS 2 Nodes
```

**Components**:
- **Unity**: ROS-TCP-Connector package (C#)
- **ROS 2**: ros_tcp_endpoint package (Python)
- **Protocol**: Custom TCP-based message serialization

### Install ROS-TCP-Endpoint

```bash
# Create ROS 2 workspace (if not exists)
mkdir -p ~/ros2_unity_ws/src
cd ~/ros2_unity_ws/src

# Clone ROS-TCP-Endpoint
git clone https://github.com/Unity-Technologies/ROS-TCP-Endpoint.git

# Install dependencies
cd ~/ros2_unity_ws
rosdep install --from-paths src --ignore-src -r -y

# Build
colcon build
source install/setup.bash
```

### Configure Unity Project

**1. Install ROS-TCP-Connector** (if not done):

```
Package Manager → + → Add package from git URL:
https://github.com/Unity-Technologies/ROS-TCP-Connector.git?path=/com.unity.robotics.ros-tcp-connector
```

**2. Configure ROSConnectionManager**:

```
1. Robotics → ROS Settings
2. ROS IP Address: localhost (or ROS machine IP)
3. ROS Port: 10000
4. Protocol: ROS 2
5. Serializer: MessageGeneration
```

**3. Generate message files**:

```
1. Robotics → Generate ROS Messages
2. Select ROS message packages (e.g., geometry_msgs, sensor_msgs)
3. Click "Build Messages"
4. Wait for generation to complete
```

### Start ROS-TCP-Endpoint

```bash
# Launch endpoint
ros2 run ros_tcp_endpoint default_server_endpoint --ros-args -p ROS_IP:=0.0.0.0
```

**Expected output**:
```
[INFO] Starting ROS-TCP-Endpoint
[INFO] Listening on 0.0.0.0:10000
```

### Publisher Example (Unity → ROS 2)

**Unity script: PublishPosition.cs**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Geometry;

public class PublishPosition : MonoBehaviour
{
    ROSConnection ros;
    public string topicName = "unity_position";
    public float publishRate = 10f; // Hz

    private float timer;

    void Start()
    {
        // Get ROS connection
        ros = ROSConnection.GetOrCreateInstance();

        // Register publisher
        ros.RegisterPublisher<PointMsg>(topicName);
    }

    void Update()
    {
        timer += Time.deltaTime;

        if (timer > 1f / publishRate)
        {
            timer = 0;

            // Create message
            PointMsg msg = new PointMsg
            {
                x = transform.position.x,
                y = transform.position.y,
                z = transform.position.z
            };

            // Publish
            ros.Publish(topicName, msg);
        }
    }
}
```

**Attach to GameObject**:
1. Select robot in Unity
2. Add Component → PublishPosition
3. Play

**Verify in ROS 2**:

```bash
# List topics
ros2 topic list

# Echo topic
ros2 topic echo /unity_position
```

### Subscriber Example (ROS 2 → Unity)

**Unity script: SubscribeVelocity.cs**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Geometry;

public class SubscribeVelocity : MonoBehaviour
{
    ROSConnection ros;
    public string topicName = "cmd_vel";

    public ArticulationBody leftWheel;
    public ArticulationBody rightWheel;

    public float wheelRadius = 0.1f;
    public float wheelSeparation = 0.5f;

    void Start()
    {
        // Get ROS connection
        ros = ROSConnection.GetOrCreateInstance();

        // Register subscriber
        ros.Subscribe<TwistMsg>(topicName, VelocityCallback);
    }

    void VelocityCallback(TwistMsg msg)
    {
        // Extract linear and angular velocities
        float linearVel = (float)msg.linear.x;
        float angularVel = (float)msg.angular.z;

        // Differential drive kinematics
        float leftVel = (linearVel - angularVel * wheelSeparation / 2) / wheelRadius;
        float rightVel = (linearVel + angularVel * wheelSeparation / 2) / wheelRadius;

        // Convert to degrees/sec
        leftVel *= Mathf.Rad2Deg;
        rightVel *= Mathf.Rad2Deg;

        // Set wheel velocities
        SetWheelVelocity(leftWheel, leftVel);
        SetWheelVelocity(rightWheel, rightVel);
    }

    void SetWheelVelocity(ArticulationBody wheel, float velocity)
    {
        var drive = wheel.xDrive;
        drive.targetVelocity = velocity;
        wheel.xDrive = drive;
    }
}
```

**Test control from ROS 2**:

```bash
# Send velocity command
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 0.5}, angular: {z: 0.3}}" -r 10

# Robot moves in Unity!
```

### Publish Camera Images

**Unity script: PublishCamera.cs**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class PublishCamera : MonoBehaviour
{
    ROSConnection ros;
    public string topicName = "camera/image_raw";
    public Camera sensorCamera;

    public int width = 640;
    public int height = 480;
    public float publishRate = 10f;

    private RenderTexture renderTexture;
    private Texture2D texture2D;
    private float timer;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<ImageMsg>(topicName);

        // Setup render texture
        renderTexture = new RenderTexture(width, height, 24);
        sensorCamera.targetTexture = renderTexture;
        texture2D = new Texture2D(width, height, TextureFormat.RGB24, false);
    }

    void Update()
    {
        timer += Time.deltaTime;

        if (timer > 1f / publishRate)
        {
            timer = 0;
            PublishImage();
        }
    }

    void PublishImage()
    {
        // Render to texture
        RenderTexture.active = renderTexture;
        texture2D.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        texture2D.Apply();

        // Convert to byte array
        byte[] imageData = texture2D.GetRawTextureData();

        // Create ROS message
        ImageMsg msg = new ImageMsg
        {
            header = new RosMessageTypes.Std.HeaderMsg
            {
                stamp = new RosMessageTypes.BuiltinInterfaces.TimeMsg
                {
                    sec = (int)Time.time,
                    nanosec = (uint)((Time.time % 1) * 1e9)
                },
                frame_id = "camera_link"
            },
            height = (uint)height,
            width = (uint)width,
            encoding = "rgb8",
            is_bigendian = 0,
            step = (uint)(width * 3),
            data = imageData
        };

        ros.Publish(topicName, msg);
    }
}
```

**View in RViz2**:

```bash
# Launch RViz2
rviz2

# Add → Image → Topic: /camera/image_raw
```

### Key Takeaways (Beginner)

✅ **ROS-TCP-Connector** bridges Unity and ROS 2
✅ **TCP/IP** connection via ros_tcp_endpoint
✅ **Publishers** send data from Unity to ROS 2
✅ **Subscribers** receive ROS 2 data in Unity
✅ **Camera images** can be visualized in RViz2

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Implement service calls
- Create custom message types
- Handle coordinate frame transformations
- Synchronize time
- Optimize message frequency

### Service Client (Unity calls ROS 2 service)

**ROS 2 service server**:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class SimpleServiceServer(Node):
    def __init__(self):
        super().__init__('simple_service_server')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_callback)

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Request: {request.a} + {request.b} = {response.sum}')
        return response

def main():
    rclpy.init()
    node = SimpleServiceServer()
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Unity service client**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Example;

public class ServiceClient : MonoBehaviour
{
    ROSConnection ros;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
    }

    public void CallService()
    {
        AddTwoIntsRequest request = new AddTwoIntsRequest
        {
            a = 5,
            b = 7
        };

        ros.SendServiceMessage<AddTwoIntsResponse>(
            "add_two_ints",
            request,
            ServiceCallback
        );
    }

    void ServiceCallback(AddTwoIntsResponse response)
    {
        Debug.Log($"Service response: {response.sum}");
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            CallService();
        }
    }
}
```

### Custom Message Types

**Create custom message** (ROS 2 side):

**my_robot_interfaces/msg/RobotState.msg**:

```
string robot_name
geometry_msgs/Pose pose
float32 battery_level
bool is_moving
```

**Build interface package**:

```bash
cd ~/ros2_unity_ws
colcon build --packages-select my_robot_interfaces
source install/setup.bash
```

**Generate in Unity**:

```
1. Robotics → Generate ROS Messages
2. Set ROS message path: ~/ros2_unity_ws/install/my_robot_interfaces/share/my_robot_interfaces
3. Select my_robot_interfaces
4. Build Messages
```

**Use custom message**:

```csharp
using RosMessageTypes.MyRobotInterfaces;

public class PublishRobotState : MonoBehaviour
{
    ROSConnection ros;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<RobotStateMsg>("robot_state");
    }

    void PublishState()
    {
        RobotStateMsg msg = new RobotStateMsg
        {
            robot_name = "unity_robot",
            pose = new RosMessageTypes.Geometry.PoseMsg
            {
                position = new RosMessageTypes.Geometry.PointMsg
                {
                    x = transform.position.x,
                    y = transform.position.y,
                    z = transform.position.z
                },
                orientation = new RosMessageTypes.Geometry.QuaternionMsg
                {
                    x = transform.rotation.x,
                    y = transform.rotation.y,
                    z = transform.rotation.z,
                    w = transform.rotation.w
                }
            },
            battery_level = 85.5f,
            is_moving = true
        };

        ros.Publish("robot_state", msg);
    }
}
```

### Coordinate Frame Transformations

**Unity vs ROS 2 coordinate systems**:

| | Unity | ROS 2 |
|---|-------|-------|
| Forward | +Z | +X |
| Left | +X | +Y |
| Up | +Y | +Z |
| Rotation | Left-handed | Right-handed |

**Conversion script**:

```csharp
using UnityEngine;

public static class CoordinateConverter
{
    // Unity → ROS 2
    public static Vector3 UnityToROS(Vector3 unityPos)
    {
        return new Vector3(unityPos.z, -unityPos.x, unityPos.y);
    }

    // ROS 2 → Unity
    public static Vector3 ROSToUnity(Vector3 rosPos)
    {
        return new Vector3(-rosPos.y, rosPos.z, rosPos.x);
    }

    // Unity rotation → ROS 2 quaternion
    public static Quaternion UnityToROSRotation(Quaternion unityRot)
    {
        // Convert left-handed to right-handed
        return new Quaternion(-unityRot.z, unityRot.x, -unityRot.y, unityRot.w);
    }

    // ROS 2 quaternion → Unity rotation
    public static Quaternion ROSToUnityRotation(Quaternion rosRot)
    {
        return new Quaternion(rosRot.y, -rosRot.z, -rosRot.x, rosRot.w);
    }
}
```

**Use in publisher**:

```csharp
void PublishOdometry()
{
    // Convert Unity position to ROS
    Vector3 rosPosition = CoordinateConverter.UnityToROS(transform.position);
    Quaternion rosRotation = CoordinateConverter.UnityToROSRotation(transform.rotation);

    OdometryMsg msg = new OdometryMsg
    {
        pose = new RosMessageTypes.Geometry.PoseWithCovarianceMsg
        {
            pose = new RosMessageTypes.Geometry.PoseMsg
            {
                position = new RosMessageTypes.Geometry.PointMsg
                {
                    x = rosPosition.x,
                    y = rosPosition.y,
                    z = rosPosition.z
                },
                orientation = new RosMessageTypes.Geometry.QuaternionMsg
                {
                    x = rosRotation.x,
                    y = rosRotation.y,
                    z = rosRotation.z,
                    w = rosRotation.w
                }
            }
        }
    };

    ros.Publish("odom", msg);
}
```

### Time Synchronization

**Publish clock** (Unity → ROS 2):

```csharp
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Rosgraph;

public class ClockPublisher : MonoBehaviour
{
    ROSConnection ros;
    public float publishRate = 100f; // Hz

    private float timer;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<ClockMsg>("clock");
    }

    void Update()
    {
        timer += Time.deltaTime;

        if (timer > 1f / publishRate)
        {
            timer = 0;

            ClockMsg msg = new ClockMsg
            {
                clock = new RosMessageTypes.BuiltinInterfaces.TimeMsg
                {
                    sec = (int)Time.time,
                    nanosec = (uint)((Time.time % 1) * 1e9)
                }
            };

            ros.Publish("clock", msg);
        }
    }
}
```

**Use sim time in ROS 2**:

```bash
# Set use_sim_time parameter
ros2 param set /my_node use_sim_time True
```

### Message Frequency Optimization

**Throttle high-frequency messages**:

```csharp
public class ThrottledPublisher : MonoBehaviour
{
    ROSConnection ros;
    public float publishRate = 10f; // Limit to 10 Hz

    private float timer;
    private bool hasNewData;
    private SensorData currentData;

    void Update()
    {
        // Collect data every frame
        currentData = CollectSensorData();
        hasNewData = true;
    }

    void FixedUpdate()
    {
        timer += Time.fixedDeltaTime;

        if (timer > 1f / publishRate && hasNewData)
        {
            timer = 0;
            PublishData(currentData);
            hasNewData = false;
        }
    }
}
```

**Batch messages**:

```csharp
public class BatchPublisher : MonoBehaviour
{
    private List<PointMsg> pointBatch = new List<PointMsg>();
    public int batchSize = 100;

    void AddPoint(Vector3 point)
    {
        pointBatch.Add(new PointMsg
        {
            x = point.x,
            y = point.y,
            z = point.z
        });

        if (pointBatch.Count >= batchSize)
        {
            PublishBatch();
        }
    }

    void PublishBatch()
    {
        // Publish all points as PointCloud
        ros.Publish("points", new PointCloudMsg
        {
            points = pointBatch.ToArray()
        });

        pointBatch.Clear();
    }
}
```

### Key Takeaways (Intermediate)

✅ **Service calls** enable request/response communication
✅ **Custom messages** require generation on both sides
✅ **Coordinate transforms** critical for position accuracy
✅ **Time sync** important for sensor fusion
✅ **Message throttling** reduces network load

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement action servers/clients
- Create bidirectional high-bandwidth communication
- Build production deployment pipeline
- Implement multi-robot coordination

### Action Server (Unity)

**Unity action server**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.ActionTutorials;
using System.Collections;

public class FibonacciActionServer : MonoBehaviour
{
    ROSConnection ros;
    private bool isExecuting = false;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();

        // Register action server
        ros.ImplementAction<FibonacciAction>("fibonacci");
    }

    // Called when goal received
    public void OnGoalReceived(FibonacciGoal goal)
    {
        if (!isExecuting)
        {
            StartCoroutine(ExecuteFibonacci(goal));
        }
    }

    IEnumerator ExecuteFibonacci(FibonacciGoal goal)
    {
        isExecuting = true;

        int order = goal.order;
        int[] sequence = new int[order];

        if (order > 0) sequence[0] = 0;
        if (order > 1) sequence[1] = 1;

        for (int i = 2; i < order; i++)
        {
            sequence[i] = sequence[i-1] + sequence[i-2];

            // Publish feedback
            FibonacciFeedback feedback = new FibonacciFeedback
            {
                sequence = sequence
            };
            ros.SendActionFeedback("fibonacci", feedback);

            yield return new WaitForSeconds(1.0f);
        }

        // Publish result
        FibonacciResult result = new FibonacciResult
        {
            sequence = sequence
        };
        ros.SendActionResult("fibonacci", result, true);

        isExecuting = false;
    }
}
```

**ROS 2 action client** (Python):

```python
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from action_tutorials_interfaces.action import Fibonacci

class FibonacciActionClient(Node):
    def __init__(self):
        super().__init__('fibonacci_action_client')
        self._action_client = ActionClient(self, Fibonacci, 'fibonacci')

    def send_goal(self, order):
        goal_msg = Fibonacci.Goal()
        goal_msg.order = order

        self._action_client.wait_for_server()
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg, feedback_callback=self.feedback_callback)

    def feedback_callback(self, feedback_msg):
        feedback = feedback_msg.feedback
        self.get_logger().info(f'Feedback: {feedback.sequence}')

def main():
    rclpy.init()
    client = FibonacciActionClient()
    client.send_goal(10)
    rclpy.spin(client)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### High-Bandwidth Communication

**Compress images** before sending:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class CompressedImagePublisher : MonoBehaviour
{
    ROSConnection ros;
    public Camera sensorCamera;
    public int quality = 75; // JPEG quality (0-100)

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<CompressedImageMsg>("camera/image_compressed");
    }

    void PublishCompressedImage()
    {
        // Capture image
        RenderTexture rt = new RenderTexture(640, 480, 24);
        sensorCamera.targetTexture = rt;
        Texture2D screenshot = new Texture2D(640, 480, TextureFormat.RGB24, false);

        RenderTexture.active = rt;
        screenshot.ReadPixels(new Rect(0, 0, 640, 480), 0, 0);
        screenshot.Apply();

        // Compress to JPEG
        byte[] compressedData = screenshot.EncodeToJPG(quality);

        // Create message
        CompressedImageMsg msg = new CompressedImageMsg
        {
            header = new RosMessageTypes.Std.HeaderMsg
            {
                stamp = GetROSTime(),
                frame_id = "camera_link"
            },
            format = "jpeg",
            data = compressedData
        };

        ros.Publish("camera/image_compressed", msg);

        // Cleanup
        RenderTexture.active = null;
        sensorCamera.targetTexture = null;
        Destroy(rt);
    }
}
```

### Production Deployment

**Automated build pipeline**:

**Build script (Editor/AutoBuild.cs)**:

```csharp
using UnityEditor;
using UnityEngine;

public class AutoBuild
{
    [MenuItem("Build/Build All Platforms")]
    static void BuildAll()
    {
        // Build Windows
        BuildPipeline.BuildPlayer(
            GetScenePaths(),
            "Builds/Windows/RobotSim.exe",
            BuildTarget.StandaloneWindows64,
            BuildOptions.None
        );

        // Build Linux
        BuildPipeline.BuildPlayer(
            GetScenePaths(),
            "Builds/Linux/RobotSim.x86_64",
            BuildTarget.StandaloneLinux64,
            BuildOptions.None
        );
    }

    static string[] GetScenePaths()
    {
        return new[] { "Assets/Scenes/MainScene.unity" };
    }
}
```

**Docker container**:

```dockerfile
FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libvulkan1 \
    xvfb

# Copy Unity build
COPY Builds/Linux/RobotSim.x86_64 /app/RobotSim.x86_64
RUN chmod +x /app/RobotSim.x86_64

# Run with virtual display
CMD xvfb-run --auto-servernum --server-args='-screen 0 1024x768x24' \
    /app/RobotSim.x86_64 -batchmode -nographics
```

### Multi-Robot Coordination

**Unity robot spawner**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;

public class MultiRobotManager : MonoBehaviour
{
    public GameObject robotPrefab;
    public int numberOfRobots = 3;

    private ROSConnection ros;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();

        for (int i = 0; i < numberOfRobots; i++)
        {
            SpawnRobot(i);
        }
    }

    void SpawnRobot(int id)
    {
        // Instantiate robot
        GameObject robot = Instantiate(robotPrefab);
        robot.name = $"robot_{id}";
        robot.transform.position = new Vector3(i * 3, 0.5f, 0);

        // Setup namespaced topics
        var publisher = robot.AddComponent<NamespacedPublisher>();
        publisher.namespace_prefix = $"/robot_{id}";
        publisher.Setup();
    }
}

public class NamespacedPublisher : MonoBehaviour
{
    public string namespace_prefix;
    private ROSConnection ros;

    public void Setup()
    {
        ros = ROSConnection.GetOrCreateInstance();

        // Register namespaced publisher
        ros.RegisterPublisher<RosMessageTypes.Geometry.TwistMsg>(
            $"{namespace_prefix}/cmd_vel"
        );
    }
}
```

### Key Takeaways (Advanced)

✅ **Actions** enable long-running tasks with feedback
✅ **Compression** reduces bandwidth for images
✅ **Automated builds** streamline deployment
✅ **Docker** ensures consistent environment
✅ **Multi-robot** requires proper namespacing

---

## Additional Resources

- [Unity Robotics Hub Tutorials](https://github.com/Unity-Technologies/Unity-Robotics-Hub/tree/main/tutorials)
- [ROS-TCP-Connector Documentation](https://github.com/Unity-Technologies/ROS-TCP-Connector)
- [Unity-ROS 2 Examples](https://github.com/Unity-Technologies/Robotics-Object-Pose-Estimation)

---

**Next:** [Sensor Simulation →](./11-sensor-sim.md)
