---
sidebar_position: 11
---

# Sensor Simulation

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Unity-ROS 2 Integration

### Learning Objectives

- Implement camera sensors in Unity
- Create LiDAR simulation with raycasting
- Add IMU sensor simulation
- Publish sensor data to ROS 2
- Visualize sensors in RViz2

### Camera Simulation

**Basic camera setup**:

```
1. Select robot GameObject
2. Right-click → Camera
3. Name: "RobotCamera"
4. Position: (0, 0.5, 0.2)
5. Rotation: (0, 0, 0)
```

**Camera publisher script**:

**Scripts/CameraPublisher.cs**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class CameraPublisher : MonoBehaviour
{
    ROSConnection ros;
    public Camera sensorCamera;
    public string topicName = "camera/image_raw";
    public string cameraInfoTopic = "camera/camera_info";

    public int width = 640;
    public int height = 480;
    public float publishRate = 10f; // Hz

    private RenderTexture renderTexture;
    private Texture2D texture2D;
    private float timer;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<ImageMsg>(topicName);
        ros.RegisterPublisher<CameraInfoMsg>(cameraInfoTopic);

        // Create render texture
        renderTexture = new RenderTexture(width, height, 24);
        sensorCamera.targetTexture = renderTexture;

        // Create texture for reading pixels
        texture2D = new Texture2D(width, height, TextureFormat.RGB24, false);
    }

    void Update()
    {
        timer += Time.deltaTime;

        if (timer >= 1f / publishRate)
        {
            timer = 0;
            CaptureAndPublish();
        }
    }

    void CaptureAndPublish()
    {
        // Render camera to texture
        RenderTexture.active = renderTexture;
        texture2D.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        texture2D.Apply();

        // Get pixel data
        byte[] imageData = texture2D.GetRawTextureData();

        // Create Image message
        ImageMsg imageMsg = new ImageMsg
        {
            header = GetHeader(),
            height = (uint)height,
            width = (uint)width,
            encoding = "rgb8",
            is_bigendian = 0,
            step = (uint)(width * 3),
            data = imageData
        };

        // Create CameraInfo message
        CameraInfoMsg infoMsg = new CameraInfoMsg
        {
            header = GetHeader(),
            height = (uint)height,
            width = (uint)width,
            distortion_model = "plumb_bob",
            d = new double[] { 0, 0, 0, 0, 0 }, // No distortion
            k = GetCameraMatrix(),
            r = new double[] { 1, 0, 0, 0, 1, 0, 0, 0, 1 }, // Identity
            p = GetProjectionMatrix()
        };

        // Publish
        ros.Publish(topicName, imageMsg);
        ros.Publish(cameraInfoTopic, infoMsg);
    }

    RosMessageTypes.Std.HeaderMsg GetHeader()
    {
        return new RosMessageTypes.Std.HeaderMsg
        {
            stamp = new RosMessageTypes.BuiltinInterfaces.TimeMsg
            {
                sec = (int)Time.time,
                nanosec = (uint)((Time.time % 1) * 1e9)
            },
            frame_id = "camera_link"
        };
    }

    double[] GetCameraMatrix()
    {
        // Camera intrinsic matrix K
        float fov = sensorCamera.fieldOfView * Mathf.Deg2Rad;
        float fx = width / (2 * Mathf.Tan(fov / 2));
        float fy = fx;
        float cx = width / 2;
        float cy = height / 2;

        return new double[] {
            fx, 0, cx,
            0, fy, cy,
            0, 0, 1
        };
    }

    double[] GetProjectionMatrix()
    {
        double[] K = GetCameraMatrix();
        return new double[] {
            K[0], K[1], K[2], 0,
            K[3], K[4], K[5], 0,
            K[6], K[7], K[8], 0
        };
    }
}
```

**Attach to camera**:
1. Select RobotCamera
2. Add Component → CameraPublisher
3. Drag RobotCamera to "Sensor Camera" field
4. Play

**View in RViz2**:

```bash
rviz2

# Add → Image → Topic: /camera/image_raw
```

### LiDAR Simulation (2D)

**LiDAR raycasting script**:

**Scripts/LidarPublisher.cs**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class LidarPublisher : MonoBehaviour
{
    ROSConnection ros;
    public string topicName = "scan";

    public int numSamples = 360;
    public float minAngle = 0f;       // degrees
    public float maxAngle = 360f;     // degrees
    public float minRange = 0.2f;     // meters
    public float maxRange = 10f;      // meters
    public float publishRate = 10f;   // Hz

    private float timer;
    private float[] ranges;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<LaserScanMsg>(topicName);

        ranges = new float[numSamples];
    }

    void Update()
    {
        timer += Time.deltaTime;

        if (timer >= 1f / publishRate)
        {
            timer = 0;
            PerformScan();
            PublishScan();
        }
    }

    void PerformScan()
    {
        float angleIncrement = (maxAngle - minAngle) / numSamples;

        for (int i = 0; i < numSamples; i++)
        {
            float angle = minAngle + i * angleIncrement;

            // Convert angle to direction (Unity coordinates: +Z forward)
            Vector3 direction = Quaternion.Euler(0, angle, 0) * transform.forward;

            RaycastHit hit;
            if (Physics.Raycast(transform.position, direction, out hit, maxRange))
            {
                ranges[i] = hit.distance;

                // Debug visualization (optional)
                Debug.DrawRay(transform.position, direction * hit.distance, Color.red);
            }
            else
            {
                ranges[i] = maxRange;
                Debug.DrawRay(transform.position, direction * maxRange, Color.green);
            }
        }
    }

    void PublishScan()
    {
        LaserScanMsg msg = new LaserScanMsg
        {
            header = new RosMessageTypes.Std.HeaderMsg
            {
                stamp = new RosMessageTypes.BuiltinInterfaces.TimeMsg
                {
                    sec = (int)Time.time,
                    nanosec = (uint)((Time.time % 1) * 1e9)
                },
                frame_id = "lidar_link"
            },
            angle_min = minAngle * Mathf.Deg2Rad,
            angle_max = maxAngle * Mathf.Deg2Rad,
            angle_increment = ((maxAngle - minAngle) / numSamples) * Mathf.Deg2Rad,
            time_increment = 0,
            scan_time = 1f / publishRate,
            range_min = minRange,
            range_max = maxRange,
            ranges = ranges,
            intensities = new float[0] // Not simulating intensities
        };

        ros.Publish(topicName, msg);
    }
}
```

**Add LiDAR to robot**:

```
1. Create Empty GameObject as child of robot base
2. Name: "LidarSensor"
3. Position: (0, 0.5, 0)
4. Add Component → LidarPublisher
5. Play
```

**View in RViz2**:

```bash
# Add → LaserScan → Topic: /scan
# Set Size: 0.05
# Set Color: Red
```

### IMU Simulation

**IMU publisher script**:

**Scripts/ImuPublisher.cs**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class ImuPublisher : MonoBehaviour
{
    ROSConnection ros;
    public string topicName = "imu";
    public float publishRate = 100f; // Hz

    public Rigidbody rb; // or ArticulationBody

    private float timer;
    private Vector3 previousVelocity;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<ImuMsg>(topicName);

        if (rb == null)
            rb = GetComponent<Rigidbody>();

        previousVelocity = Vector3.zero;
    }

    void FixedUpdate()
    {
        timer += Time.fixedDeltaTime;

        if (timer >= 1f / publishRate)
        {
            timer = 0;
            PublishImu();
        }
    }

    void PublishImu()
    {
        // Calculate linear acceleration
        Vector3 acceleration = (rb.velocity - previousVelocity) / Time.fixedDeltaTime;
        previousVelocity = rb.velocity;

        // Add gravity (IMU measures acceleration including gravity)
        acceleration += Physics.gravity;

        // Get angular velocity
        Vector3 angularVelocity = rb.angularVelocity;

        // Get orientation
        Quaternion orientation = transform.rotation;

        // Convert to ROS coordinates
        Vector3 rosAccel = UnityToROS(acceleration);
        Vector3 rosAngVel = UnityToROS(angularVelocity);
        Quaternion rosOrient = UnityToROSRotation(orientation);

        ImuMsg msg = new ImuMsg
        {
            header = new RosMessageTypes.Std.HeaderMsg
            {
                stamp = new RosMessageTypes.BuiltinInterfaces.TimeMsg
                {
                    sec = (int)Time.time,
                    nanosec = (uint)((Time.time % 1) * 1e9)
                },
                frame_id = "imu_link"
            },
            orientation = new RosMessageTypes.Geometry.QuaternionMsg
            {
                x = rosOrient.x,
                y = rosOrient.y,
                z = rosOrient.z,
                w = rosOrient.w
            },
            angular_velocity = new RosMessageTypes.Geometry.Vector3Msg
            {
                x = rosAngVel.x,
                y = rosAngVel.y,
                z = rosAngVel.z
            },
            linear_acceleration = new RosMessageTypes.Geometry.Vector3Msg
            {
                x = rosAccel.x,
                y = rosAccel.y,
                z = rosAccel.z
            }
        };

        ros.Publish(topicName, msg);
    }

    Vector3 UnityToROS(Vector3 unityVec)
    {
        return new Vector3(unityVec.z, -unityVec.x, unityVec.y);
    }

    Quaternion UnityToROSRotation(Quaternion unityRot)
    {
        return new Quaternion(-unityRot.z, unityRot.x, -unityRot.y, unityRot.w);
    }
}
```

### Key Takeaways (Beginner)

✅ **Cameras** render to texture and publish as ROS Image messages
✅ **LiDAR** simulated with raycasting
✅ **IMU** calculates acceleration and angular velocity from Rigidbody
✅ **Coordinate conversion** required for ROS compatibility
✅ **RViz2** visualizes all sensor data

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Implement depth cameras (RGB-D)
- Add realistic noise models
- Create multi-sensor fusion
- Simulate stereo cameras
- Optimize sensor performance

### Depth Camera (RGB-D)

**Depth camera script**:

**Scripts/DepthCameraPublisher.cs**:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class DepthCameraPublisher : MonoBehaviour
{
    ROSConnection ros;
    public Camera depthCamera;
    public string imageTopic = "depth_camera/image_raw";
    public string depthTopic = "depth_camera/depth/image_raw";
    public string pointsTopic = "depth_camera/points";

    public int width = 640;
    public int height = 480;
    public float minDepth = 0.1f;
    public float maxDepth = 10f;
    public float publishRate = 10f;

    private RenderTexture colorRT;
    private RenderTexture depthRT;
    private Texture2D colorTex;
    private Texture2D depthTex;
    private Shader depthShader;
    private float timer;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<ImageMsg>(imageTopic);
        ros.RegisterPublisher<ImageMsg>(depthTopic);
        ros.RegisterPublisher<PointCloud2Msg>(pointsTopic);

        // Setup render textures
        colorRT = new RenderTexture(width, height, 24);
        depthRT = new RenderTexture(width, height, 24, RenderTextureFormat.RFloat);

        depthCamera.targetTexture = colorRT;

        colorTex = new Texture2D(width, height, TextureFormat.RGB24, false);
        depthTex = new Texture2D(width, height, TextureFormat.RFloat, false);

        // Load depth shader
        depthShader = Shader.Find("Custom/DepthShader");
    }

    void Update()
    {
        timer += Time.deltaTime;

        if (timer >= 1f / publishRate)
        {
            timer = 0;
            CaptureAndPublish();
        }
    }

    void CaptureAndPublish()
    {
        // Capture color
        RenderTexture.active = colorRT;
        colorTex.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        colorTex.Apply();

        // Capture depth
        CaptureDepth();

        // Publish RGB image
        PublishColorImage();

        // Publish depth image
        PublishDepthImage();

        // Publish point cloud
        PublishPointCloud();
    }

    void CaptureDepth()
    {
        // Use replacement shader to render depth
        Camera tempCam = new GameObject("TempDepthCam").AddComponent<Camera>();
        tempCam.CopyFrom(depthCamera);
        tempCam.targetTexture = depthRT;
        tempCam.SetReplacementShader(depthShader, "");
        tempCam.Render();
        Destroy(tempCam.gameObject);

        RenderTexture.active = depthRT;
        depthTex.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        depthTex.Apply();
    }

    void PublishColorImage()
    {
        ImageMsg msg = new ImageMsg
        {
            header = GetHeader(),
            height = (uint)height,
            width = (uint)width,
            encoding = "rgb8",
            step = (uint)(width * 3),
            data = colorTex.GetRawTextureData()
        };

        ros.Publish(imageTopic, msg);
    }

    void PublishDepthImage()
    {
        // Convert float depth to uint16 (millimeters)
        float[] depthData = depthTex.GetRawTextureData<float>().ToArray();
        byte[] depthBytes = new byte[width * height * 2];

        for (int i = 0; i < depthData.Length; i++)
        {
            ushort depthMM = (ushort)(depthData[i] * 1000); // meters to millimeters
            depthBytes[i * 2] = (byte)(depthMM & 0xFF);
            depthBytes[i * 2 + 1] = (byte)((depthMM >> 8) & 0xFF);
        }

        ImageMsg msg = new ImageMsg
        {
            header = GetHeader(),
            height = (uint)height,
            width = (uint)width,
            encoding = "16UC1",
            step = (uint)(width * 2),
            data = depthBytes
        };

        ros.Publish(depthTopic, msg);
    }

    void PublishPointCloud()
    {
        float[] depthData = depthTex.GetRawTextureData<float>().ToArray();
        Color[] colorData = colorTex.GetPixels();

        // Build point cloud
        byte[] cloudData = new byte[width * height * 16]; // 16 bytes per point (x,y,z,rgb)

        // ... (Point cloud generation - simplified for brevity)
        // Convert pixels + depth to 3D points

        PointCloud2Msg msg = new PointCloud2Msg
        {
            header = GetHeader(),
            height = (uint)height,
            width = (uint)width,
            fields = GetPointFieldsRGB(),
            is_bigendian = false,
            point_step = 16,
            row_step = (uint)(width * 16),
            data = cloudData,
            is_dense = false
        };

        ros.Publish(pointsTopic, msg);
    }

    PointFieldMsg[] GetPointFieldsRGB()
    {
        return new PointFieldMsg[]
        {
            new PointFieldMsg { name = "x", offset = 0, datatype = 7, count = 1 },
            new PointFieldMsg { name = "y", offset = 4, datatype = 7, count = 1 },
            new PointFieldMsg { name = "z", offset = 8, datatype = 7, count = 1 },
            new PointFieldMsg { name = "rgb", offset = 12, datatype = 7, count = 1 }
        };
    }

    RosMessageTypes.Std.HeaderMsg GetHeader()
    {
        return new RosMessageTypes.Std.HeaderMsg
        {
            stamp = new RosMessageTypes.BuiltinInterfaces.TimeMsg
            {
                sec = (int)Time.time,
                nanosec = (uint)((Time.time % 1) * 1e9)
            },
            frame_id = "depth_camera_link"
        };
    }
}
```

### Sensor Noise Models

**Add noise to LiDAR**:

```csharp
public class NoisyLidar : MonoBehaviour
{
    public float gaussianNoise = 0.01f; // Standard deviation (meters)
    public float dropoutProbability = 0.01f; // 1% dropout

    float AddNoise(float range)
    {
        // Dropout (return max range)
        if (Random.value < dropoutProbability)
            return maxRange;

        // Gaussian noise
        float noise = GaussianRandom(0f, gaussianNoise);
        return Mathf.Clamp(range + noise, minRange, maxRange);
    }

    float GaussianRandom(float mean, float stdDev)
    {
        float u1 = 1.0f - Random.value;
        float u2 = 1.0f - Random.value;
        float randStdNormal = Mathf.Sqrt(-2.0f * Mathf.Log(u1)) * Mathf.Sin(2.0f * Mathf.PI * u2);
        return mean + stdDev * randStdNormal;
    }
}
```

**Add noise to camera** (Shader):

**Shaders/CameraNoise.shader**:

```glsl
Shader "Custom/CameraNoise"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _NoiseAmount ("Noise Amount", Range(0, 1)) = 0.02
    }
    SubShader
    {
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            float _NoiseAmount;

            float rand(float2 co)
            {
                return frac(sin(dot(co.xy, float2(12.9898, 78.233))) * 43758.5453);
            }

            struct v2f
            {
                float4 pos : SV_POSITION;
                float2 uv : TEXCOORD0;
            };

            v2f vert(appdata_base v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv = v.texcoord;
                return o;
            }

            fixed4 frag(v2f i) : SV_Target
            {
                fixed4 col = tex2D(_MainTex, i.uv);
                float noise = rand(i.uv + _Time.y) * _NoiseAmount;
                col.rgb += noise;
                return col;
            }
            ENDCG
        }
    }
}
```

### Key Takeaways (Intermediate)

✅ **Depth cameras** provide RGB + depth data
✅ **Noise models** make simulation realistic
✅ **Point clouds** generated from depth images
✅ **Shaders** enable GPU-accelerated processing
✅ **Sensor calibration** parameters critical for accuracy

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement radar simulation
- Create thermal camera
- Build custom sensor plugins
- Optimize multi-sensor systems
- Implement sensor calibration

### Radar Simulation

**Radar sensor** (simplified):

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class RadarSensor : MonoBehaviour
{
    public float maxRange = 200f;
    public float fieldOfView = 60f;    // degrees
    public int azimuthSamples = 128;
    public int elevationSamples = 8;

    void Scan()
    {
        float azStep = fieldOfView / azimuthSamples;
        float elStep = 30f / elevationSamples; // ±15° elevation

        for (int az = 0; az < azimuthSamples; az++)
        {
            for (int el = 0; el < elevationSamples; el++)
            {
                float azAngle = -fieldOfView / 2 + az * azStep;
                float elAngle = -15f + el * elStep;

                Vector3 dir = Quaternion.Euler(elAngle, azAngle, 0) * transform.forward;

                RaycastHit hit;
                if (Physics.Raycast(transform.position, dir, out hit, maxRange))
                {
                    // Calculate radar cross-section (simplified)
                    float rcs = CalculateRCS(hit.collider);

                    // Add to detection list with range, azimuth, elevation, velocity
                    // (velocity via Doppler requires tracking over time)
                }
            }
        }
    }

    float CalculateRCS(Collider collider)
    {
        // Simplified: RCS proportional to surface area
        Bounds bounds = collider.bounds;
        return bounds.size.x * bounds.size.y;
    }
}
```

### Key Takeaways (Advanced)

✅ **Radar** requires RCS and Doppler velocity
✅ **Thermal** uses temperature-based rendering
✅ **Custom sensors** extend base sensor classes
✅ **Multi-sensor** optimization critical for performance
✅ **Calibration** ensures accuracy

---

## Additional Resources

- [Unity Sensors Package](https://github.com/Unity-Technologies/com.unity.perception)
- [Point Cloud Library (PCL)](https://pointclouds.org/)
- [ROS Sensor Messages](http://docs.ros.org/en/api/sensor_msgs/html/index-msg.html)

---

**Next:** [Capstone: Simulation Environment →](./12-capstone-sim.md)
