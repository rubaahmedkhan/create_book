---
sidebar_position: 9
---

# Unity Robotics Introduction

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Basic Unity knowledge helpful but not required

### Learning Objectives

- Understand Unity for robotics simulation
- Install Unity and Unity Robotics Hub
- Set up a basic robotics scene
- Import robot models
- Configure basic physics

### Why Unity for Robotics?

**Unity advantages**:
- **High-quality graphics**: Photorealistic rendering
- **Cross-platform**: Windows, Linux, Mac, VR/AR
- **Large asset ecosystem**: 3D models, environments
- **ML-Agents integration**: Reinforcement learning
- **Real-time rendering**: Fast iteration

**Use cases**:
- **Synthetic data generation**: Training computer vision models
- **Human-robot interaction**: VR/AR interfaces
- **Photorealistic visualization**: Demos, marketing
- **Sim-to-real transfer**: Visual domain randomization

**Unity vs Gazebo**:

| Feature | Gazebo | Unity |
|---------|--------|-------|
| Physics accuracy | High | Medium-High |
| Graphics quality | Medium | Very High |
| Sensor simulation | Excellent | Good |
| Learning curve | Steep | Moderate |
| Best for | Physics-heavy | Vision-heavy |

### Installation

**1. Install Unity Hub**:

Download from: https://unity.com/download

```bash
# Linux
wget https://public-cdn.cloud.unity3d.com/hub/prod/UnityHub.AppImage
chmod +x UnityHub.AppImage
./UnityHub.AppImage
```

**2. Install Unity Editor**:

- Open Unity Hub
- Go to "Installs" → "Install Editor"
- Choose **Unity 2021.3 LTS** (Long Term Support)
- Add modules:
  - Linux Build Support (if on Windows/Mac)
  - Documentation

**3. Install Unity Robotics Hub**:

```bash
# Clone Unity Robotics Hub
cd ~/
git clone https://github.com/Unity-Technologies/Unity-Robotics-Hub.git
```

**4. Install ROS-TCP-Connector** (in Unity):

- Open Unity Hub → New Project → 3D (URP)
- Name: "RoboticsSimulation"
- Open Package Manager (Window → Package Manager)
- Click "+" → "Add package from git URL"
- Enter: `https://github.com/Unity-Technologies/ROS-TCP-Connector.git?path=/com.unity.robotics.ros-tcp-connector`

### Unity Interface Overview

**Main panels**:

1. **Scene View**: 3D viewport for editing
2. **Game View**: Runtime camera view
3. **Hierarchy**: List of GameObjects in scene
4. **Inspector**: Properties of selected GameObject
5. **Project**: Assets (models, scripts, materials)
6. **Console**: Debug messages and errors

**Navigation**:
- **Right-click + WASD**: Fly camera
- **Alt + Left-click**: Orbit around selection
- **Scroll wheel**: Zoom
- **F**: Frame selected object

### Create Simple Scene

**Step 1: Create ground plane**:

1. Right-click in Hierarchy → 3D Object → Plane
2. Name it "Ground"
3. In Inspector:
   - Position: (0, 0, 0)
   - Scale: (10, 1, 10)

**Step 2: Add lighting**:

1. GameObject → Light → Directional Light
2. Name it "Sun"
3. Rotation: (50, -30, 0)

**Step 3: Create simple robot** (placeholder):

```
1. GameObject → 3D Object → Cube
2. Name: "RobotBase"
3. Position: (0, 0.5, 0)
4. Scale: (0.5, 0.2, 0.7)

5. GameObject → 3D Object → Cylinder
6. Name: "LeftWheel"
7. Position: (-0.3, 0.3, 0)
8. Rotation: (0, 0, 90)
9. Scale: (0.2, 0.05, 0.2)

10. Drag LeftWheel onto RobotBase (make child)
11. Duplicate LeftWheel → RightWheel
12. Position: (0.3, 0.3, 0)
```

**Step 4: Add materials**:

1. Project → Create → Material → "RobotMaterial"
2. Set Albedo color to blue
3. Drag material onto RobotBase

**Step 5: Save scene**:

- File → Save As → "RobotScene"

### Import URDF Model

**Install URDF Importer**:

1. Package Manager → "+" → "Add package from git URL"
2. Enter: `https://github.com/Unity-Technologies/URDF-Importer.git?path=/com.unity.robotics.urdf-importer`

**Import robot URDF**:

1. Assets → Import Robot from URDF
2. Browse to your URDF file (from previous labs)
3. Click "Import URDF"
4. Robot appears in scene!

**Common import issues**:
- **Missing meshes**: Ensure mesh files (.stl, .dae) are in correct path
- **Wrong orientation**: Adjust rotation in Inspector
- **Scale issues**: Check URDF units (meters)

### Basic Physics Configuration

**Add Rigidbody** (for physics simulation):

1. Select RobotBase
2. Add Component → Rigidbody
3. Settings:
   - Mass: 10
   - Drag: 0
   - Angular Drag: 0.05
   - Use Gravity: ✓

**Add Collider**:

1. Add Component → Box Collider
2. Adjust size to match visual

**Test physics**:

1. Move robot higher: Position Y = 5
2. Click Play ▶️
3. Robot should fall and land on ground

**Friction settings**:

1. Project → Create → Physic Material → "RobotPhysics"
2. Settings:
   - Dynamic Friction: 0.6
   - Static Friction: 0.6
   - Bounciness: 0
3. Drag material to Collider's Material slot

### Key Takeaways (Beginner)

✅ **Unity** offers high-quality graphics for robotics
✅ **Unity Hub** manages Unity installations
✅ **URDF Importer** brings ROS robots into Unity
✅ **Rigidbody** enables physics simulation
✅ **Scene/Game views** for editing and testing

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Use Articulation Bodies for robot joints
- Configure advanced physics
- Import complex robot models
- Implement sensors in Unity
- Optimize performance

### Articulation Bodies

**ArticulationBody**: Unity's component for robotic joints (replaces ConfigurableJoint).

**Advantages**:
- More stable for robot chains
- Built-in PID control
- Faster simulation
- Better for manipulators

**Create articulated robot**:

**Base**:
```
1. GameObject → Create Empty → "ArticulatedRobot"
2. Add child: 3D Object → Cube → "Base"
3. Select Base → Add Component → ArticulationBody
4. ArticulationBody settings:
   - Immovable: ✓ (fixed base)
   - Mass: 5
```

**Link 1** (revolute joint):
```
1. Create child of Base: Cube → "Link1"
2. Position: (0, 1, 0)
3. Add Component → ArticulationBody
4. Settings:
   - Immovable: ✗
   - Articulation Body Type: Revolute
   - Anchor Rotation: X=90, Y=0, Z=0 (rotation axis)
   - X Drive:
     - Lower Limit: -180
     - Upper Limit: 180
     - Stiffness: 10000
     - Damping: 100
     - Force Limit: 1000
```

**Link 2** (revolute joint):
```
1. Create child of Link1: Cube → "Link2"
2. Position: (0, 1, 0)
3. Add Component → ArticulationBody
4. Settings:
   - Revolute (same as Link1)
   - X Drive: (same limits)
```

**Control joints via script**:

**Scripts/ArticulationController.cs**:

```csharp
using UnityEngine;

public class ArticulationController : MonoBehaviour
{
    public ArticulationBody joint;
    public float targetPosition = 0f; // degrees
    public float speed = 30f; // degrees/sec

    void FixedUpdate()
    {
        // Get current position
        float currentPos = joint.xDrive.target;

        // Move towards target
        float newPos = Mathf.MoveTowards(currentPos, targetPosition, speed * Time.fixedDeltaTime);

        // Set joint target
        var drive = joint.xDrive;
        drive.target = newPos;
        joint.xDrive = drive;
    }
}
```

**Attach script**:
1. Select Link1
2. Add Component → ArticulationController
3. Drag Link1's ArticulationBody to "joint" field
4. Play and change "Target Position" in Inspector

### URDF to Articulation Body

**Automatic import** with URDF Importer:

**Import settings** (when importing URDF):
- Articulation Body Type: Articulation Body
- Axis Type: Unity Native
- Mesh Decomposer: Unity

**After import**:
- Each link has ArticulationBody
- Joints configured automatically
- Colliders generated

**Verify import**:
1. Expand robot in Hierarchy
2. Select each link → Check ArticulationBody component
3. Check joint types match URDF

### Physics Configuration

**Project Settings → Physics**:

1. Edit → Project Settings → Physics
2. Settings:
   - Gravity: (0, -9.81, 0)
   - Default Solver Iterations: 6
   - Default Solver Velocity Iterations: 1
   - Bounce Threshold: 2
   - Sleep Threshold: 0.005
   - Default Contact Offset: 0.01

**For better stability**:
- Increase Solver Iterations: 10-20
- Smaller Time.fixedDeltaTime: 0.01 (Edit → Project Settings → Time)

**ArticulationBody advanced settings**:

```csharp
ArticulationBody body = GetComponent<ArticulationBody>();

// Increase solver iterations for this body
body.solverIterations = 20;
body.solverVelocityIterations = 10;

// Collision detection
body.collisionDetectionMode = CollisionDetectionMode.Continuous;

// Joint friction
body.jointFriction = 0.5f;

// Angular damping
body.angularDamping = 0.05f;
```

### Camera Sensor

**Add camera to robot**:

```
1. Select robot head link
2. Right-click → Camera
3. Position: (0, 0.2, 0.1)
4. Rotation: (0, 0, 0)
5. Name: "RobotCamera"
```

**Render to texture**:

**Script: CameraCapture.cs**:

```csharp
using UnityEngine;

public class CameraCapture : MonoBehaviour
{
    public Camera sensorCamera;
    public int width = 640;
    public int height = 480;

    private RenderTexture renderTexture;
    private Texture2D texture2D;

    void Start()
    {
        // Create render texture
        renderTexture = new RenderTexture(width, height, 24);
        sensorCamera.targetTexture = renderTexture;

        // Create texture to read pixels
        texture2D = new Texture2D(width, height, TextureFormat.RGB24, false);
    }

    public Texture2D CaptureImage()
    {
        // Render camera to texture
        RenderTexture.active = renderTexture;
        texture2D.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        texture2D.Apply();

        return texture2D;
    }
}
```

### LiDAR Sensor (Ray casting)

**Script: LidarSensor.cs**:

```csharp
using UnityEngine;

public class LidarSensor : MonoBehaviour
{
    public int numRays = 360;
    public float maxRange = 10f;
    public float angleMin = 0f;
    public float angleMax = 360f;

    private float[] ranges;

    void Start()
    {
        ranges = new float[numRays];
    }

    void FixedUpdate()
    {
        Scan();
    }

    void Scan()
    {
        float angleIncrement = (angleMax - angleMin) / numRays;

        for (int i = 0; i < numRays; i++)
        {
            float angle = angleMin + i * angleIncrement;
            Vector3 direction = Quaternion.Euler(0, angle, 0) * transform.forward;

            RaycastHit hit;
            if (Physics.Raycast(transform.position, direction, out hit, maxRange))
            {
                ranges[i] = hit.distance;

                // Debug visualization
                Debug.DrawRay(transform.position, direction * hit.distance, Color.red);
            }
            else
            {
                ranges[i] = maxRange;
                Debug.DrawRay(transform.position, direction * maxRange, Color.green);
            }
        }
    }

    public float[] GetRanges()
    {
        return ranges;
    }
}
```

**Add to robot**:
1. Create empty GameObject as child of robot base
2. Name: "LidarSensor"
3. Position: (0, 0.5, 0)
4. Add Component → LidarSensor
5. Play and see ray visualization in Scene view

### Performance Optimization

**1. Mesh optimization**:
- Use low-poly models for collision
- High-poly for visual only

**2. Physics layers**:
- Edit → Project Settings → Tags and Layers
- Create layers: "Robot", "Environment", "Sensors"
- Physics → Layer Collision Matrix → Disable unnecessary collisions

**3. Occlusion culling**:
- Window → Rendering → Occlusion Culling
- Bake occlusion data for static objects

**4. Quality settings**:
- Edit → Project Settings → Quality
- Reduce shadow distance
- Adjust texture quality

**5. Profile performance**:
- Window → Analysis → Profiler
- Monitor CPU, GPU, Physics

### Key Takeaways (Intermediate)

✅ **Articulation Bodies** are best for robot joints
✅ **URDF Importer** creates ArticulationBody chains
✅ **Physics tuning** critical for stability
✅ **Sensors** implemented via raycasting and rendering
✅ **Performance** requires optimization for real-time

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Integrate ML-Agents for learning
- Implement high-fidelity rendering
- Create custom shaders
- Build production-ready simulation
- Implement advanced sensors

### ML-Agents Integration

**Install ML-Agents**:

```bash
# Install Python package
pip install mlagents

# In Unity Package Manager
# Add: com.unity.ml-agents
```

**Create RL environment**:

**Script: RobotAgent.cs**:

```csharp
using Unity.MLAgents;
using Unity.MLAgents.Actuators;
using Unity.MLAgents.Sensors;
using UnityEngine;

public class RobotAgent : Agent
{
    public ArticulationBody leftWheel;
    public ArticulationBody rightWheel;
    public Transform target;

    private float maxSpeed = 10f;

    public override void OnEpisodeBegin()
    {
        // Reset robot position
        transform.localPosition = new Vector3(0, 0.5f, 0);
        transform.localRotation = Quaternion.identity;

        // Randomize target position
        target.localPosition = new Vector3(
            Random.Range(-5f, 5f),
            0.5f,
            Random.Range(-5f, 5f)
        );
    }

    public override void CollectObservations(VectorSensor sensor)
    {
        // Robot position and rotation
        sensor.AddObservation(transform.localPosition);
        sensor.AddObservation(transform.localRotation);

        // Target position
        sensor.AddObservation(target.localPosition);

        // Wheel velocities
        sensor.AddObservation(leftWheel.velocity);
        sensor.AddObservation(rightWheel.velocity);
    }

    public override void OnActionReceived(ActionBuffers actions)
    {
        // Get actions (continuous: left and right wheel speeds)
        float leftSpeed = actions.ContinuousActions[0] * maxSpeed;
        float rightSpeed = actions.ContinuousActions[1] * maxSpeed;

        // Apply to wheels
        SetWheelSpeed(leftWheel, leftSpeed);
        SetWheelSpeed(rightWheel, rightSpeed);

        // Reward based on distance to target
        float distanceToTarget = Vector3.Distance(transform.localPosition, target.localPosition);

        if (distanceToTarget < 1.5f)
        {
            SetReward(1.0f);
            EndEpisode();
        }

        // Small penalty for time
        AddReward(-0.001f);
    }

    public override void Heuristic(in ActionBuffers actionsOut)
    {
        // Manual control for testing
        var continuousActions = actionsOut.ContinuousActions;
        continuousActions[0] = Input.GetAxis("Vertical");
        continuousActions[1] = Input.GetAxis("Vertical");
    }

    void SetWheelSpeed(ArticulationBody wheel, float speed)
    {
        var drive = wheel.xDrive;
        drive.targetVelocity = speed;
        wheel.xDrive = drive;
    }
}
```

**Train agent**:

```bash
# Create config file: config/robot_config.yaml
mlagents-learn config/robot_config.yaml --run-id=robot_navigation

# Press Play in Unity to start training
```

### High-Fidelity Rendering (HDRP)

**Setup HDRP**:

1. Window → Package Manager
2. Install "High Definition RP"
3. Edit → Render Pipeline → HD Render Pipeline → Wizard
4. Fix all issues

**HDRP features**:
- **Ray tracing**: Realistic reflections
- **Volumetric lighting**: Fog, atmosphere
- **Physical camera**: Depth of field, motion blur
- **Advanced materials**: Subsurface scattering

**Create realistic environment**:

```
1. Import free HDRI from Poly Haven
2. Lighting → Environment → HDRI Sky
3. Add Post-Processing Volume
4. Enable:
   - Bloom
   - Motion Blur
   - Depth of Field
   - Tonemapping
```

### Custom Shaders

**Depth shader** (for depth camera):

**Shaders/DepthCamera.shader**:

```glsl
Shader "Custom/DepthCamera"
{
    Properties
    {
        _MinDistance ("Min Distance", Float) = 0.1
        _MaxDistance ("Max Distance", Float) = 10.0
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
            };

            struct v2f
            {
                float4 pos : SV_POSITION;
                float depth : TEXCOORD0;
            };

            float _MinDistance;
            float _MaxDistance;

            v2f vert (appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.depth = -UnityObjectToViewPos(v.vertex).z;
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                float normalizedDepth = (i.depth - _MinDistance) / (_MaxDistance - _MinDistance);
                normalizedDepth = saturate(normalizedDepth);
                return fixed4(normalizedDepth, normalizedDepth, normalizedDepth, 1);
            }
            ENDCG
        }
    }
}
```

**Use depth shader**:

```csharp
using UnityEngine;

public class DepthCamera : MonoBehaviour
{
    public Camera depthCamera;
    public Shader depthShader;

    void Start()
    {
        depthCamera.SetReplacementShader(depthShader, "");
    }
}
```

### Domain Randomization

**For sim-to-real transfer**:

**Script: DomainRandomizer.cs**:

```csharp
using UnityEngine;

public class DomainRandomizer : MonoBehaviour
{
    public Light directionalLight;
    public Camera mainCamera;
    public Renderer[] objectsToRandomize;

    void OnEpisodeBegin()
    {
        // Randomize lighting
        directionalLight.intensity = Random.Range(0.5f, 2.0f);
        directionalLight.color = new Color(
            Random.Range(0.8f, 1.0f),
            Random.Range(0.8f, 1.0f),
            Random.Range(0.8f, 1.0f)
        );

        // Randomize camera
        mainCamera.fieldOfView = Random.Range(50f, 70f);

        // Randomize object colors
        foreach (var renderer in objectsToRandomize)
        {
            renderer.material.color = new Color(
                Random.value,
                Random.value,
                Random.value
            );
        }

        // Randomize object positions (slight)
        foreach (var renderer in objectsToRandomize)
        {
            renderer.transform.localPosition += new Vector3(
                Random.Range(-0.1f, 0.1f),
                0,
                Random.Range(-0.1f, 0.1f)
            );
        }
    }
}
```

### Production Pipeline

**Build automation**:

**Build script** (Editor/BuildScript.cs):

```csharp
using UnityEditor;
using UnityEngine;

public class BuildScript
{
    [MenuItem("Build/Build Linux")]
    static void BuildLinux()
    {
        BuildPlayerOptions options = new BuildPlayerOptions();
        options.scenes = new[] { "Assets/Scenes/RobotScene.unity" };
        options.locationPathName = "Builds/Linux/RobotSim";
        options.target = BuildTarget.StandaloneLinux64;
        options.options = BuildOptions.None;

        BuildPipeline.BuildPlayer(options);
    }
}
```

**Run headless**:

```bash
# Build for Linux
# From Unity: Build → Build Linux

# Run headless
./Builds/Linux/RobotSim -batchmode -nographics
```

**Docker deployment**:

```dockerfile
FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libvulkan1

COPY Builds/Linux/RobotSim /app/RobotSim

CMD ["/app/RobotSim", "-batchmode", "-nographics"]
```

### Key Takeaways (Advanced)

✅ **ML-Agents** enables reinforcement learning
✅ **HDRP** provides photorealistic rendering
✅ **Custom shaders** for specialized sensors
✅ **Domain randomization** improves sim-to-real transfer
✅ **Production builds** enable deployment

---

## Additional Resources

- [Unity Robotics Hub](https://github.com/Unity-Technologies/Unity-Robotics-Hub)
- [Unity ML-Agents](https://github.com/Unity-Technologies/ml-agents)
- [URDF Importer](https://github.com/Unity-Technologies/URDF-Importer)
- [Unity Learn](https://learn.unity.com/)

---

**Next:** [Unity-ROS 2 Integration →](./10-unity-ros2.md)
