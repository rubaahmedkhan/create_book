---
sidebar_position: 6
---

# Gazebo Physics & Sensors

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: Gazebo Introduction, URDF Sensors

### Learning Objectives

- Understand physics properties (gravity, friction, restitution)
- Configure contact properties
- Add and configure sensors in Gazebo
- Visualize sensor data in ROS 2
- Balance physics accuracy vs. speed

### Physics Properties Overview

**Gazebo simulates**:
- **Gravity**: Pulls objects down
- **Friction**: Resists sliding
- **Restitution**: Bounciness
- **Damping**: Energy loss over time
- **Contacts**: Collision responses

### Gravity

**Default**: Earth gravity (9.81 m/s² downward).

**Configure in world**:

```xml
<world name="my_world">
  <gravity>0 0 -9.81</gravity>  <!-- x y z -->

  <!-- For moon simulation -->
  <!-- <gravity>0 0 -1.62</gravity> -->

  <!-- For Mars -->
  <!-- <gravity>0 0 -3.71</gravity> -->

  <!-- Zero gravity (space) -->
  <!-- <gravity>0 0 0</gravity> -->

</world>
```

**Test gravity**:

```xml
<!-- Drop a ball -->
<model name="ball">
  <pose>0 0 5 0 0 0</pose>  <!-- 5m high -->
  <link name="link">
    <inertial>
      <mass>1.0</mass>
      <inertia>
        <ixx>0.4</ixx><iyy>0.4</iyy><izz>0.4</izz>
      </inertia>
    </inertial>
    <collision name="collision">
      <geometry>
        <sphere><radius>0.1</radius></sphere>
      </geometry>
    </collision>
    <visual name="visual">
      <geometry>
        <sphere><radius>0.1</radius></sphere>
      </geometry>
      <material>
        <ambient>1 0 0 1</ambient>
      </material>
    </visual>
  </link>
</model>
```

**Launch and press play**: Ball falls to ground.

### Friction

**Friction** resists relative motion between surfaces.

**Two coefficients**:
- **μ1** (mu1): Primary direction friction
- **μ2** (mu2): Secondary direction friction

**Typical values**:
- Rubber on concrete: μ ≈ 1.0-1.5
- Metal on metal: μ ≈ 0.4-0.6
- Ice on ice: μ ≈ 0.02-0.05

**Set friction in URDF** (Gazebo tags):

```xml
<gazebo reference="wheel_link">
  <mu1>1.5</mu1>  <!-- High friction (rubber tire) -->
  <mu2>1.5</mu2>
  <material>Gazebo/Black</material>
</gazebo>
```

**Example: Slippery surface**:

```xml
<model name="ice_rink">
  <static>true</static>
  <link name="link">
    <collision name="collision">
      <geometry>
        <plane><normal>0 0 1</normal></plane>
      </geometry>
      <surface>
        <friction>
          <ode>
            <mu>0.03</mu>   <!-- Very low friction -->
            <mu2>0.03</mu2>
          </ode>
        </friction>
      </surface>
    </collision>
    <visual name="visual">
      <geometry>
        <plane><normal>0 0 1</normal><size>20 20</size></plane>
      </geometry>
      <material>
        <ambient>0.7 0.9 1.0 1</ambient>  <!-- Light blue -->
      </material>
    </visual>
  </link>
</model>
```

### Restitution (Bounciness)

**Restitution** (e): How much energy is retained in a bounce.
- e = 0: No bounce (perfectly inelastic)
- e = 1: Perfect bounce (perfectly elastic)

**Set in URDF**:

```xml
<gazebo reference="ball_link">
  <mu1>0.5</mu1>
  <mu2>0.5</mu2>
  <kp>1000000.0</kp>  <!-- Contact stiffness -->
  <kd>1.0</kd>        <!-- Contact damping -->

  <!-- Restitution -->
  <minDepth>0.001</minDepth>
  <maxVel>0.1</maxVel>

  <material>Gazebo/Red</material>
</gazebo>
```

**In world file** (SDF format):

```xml
<collision name="collision">
  <geometry>
    <sphere><radius>0.1</radius></sphere>
  </geometry>
  <surface>
    <bounce>
      <restitution_coefficient>0.8</restitution_coefficient>  <!-- 80% bounce -->
      <threshold>0.1</threshold>
    </bounce>
    <friction>
      <ode>
        <mu>0.5</mu>
        <mu2>0.5</mu2>
      </ode>
    </friction>
    <contact>
      <ode>
        <kp>1000000</kp>
        <kd>1</kd>
      </ode>
    </contact>
  </surface>
</collision>
```

**Test**: Drop ball from height, observe bounce.

### Contact Properties

**Contact parameters**:
- **kp** (stiffness): How hard surfaces push back
- **kd** (damping): Energy loss at contact
- **max_vel**: Maximum contact correction velocity
- **min_depth**: Minimum penetration before contact

**Typical values**:
- Rigid objects: kp=1e6, kd=1
- Soft objects: kp=1e3, kd=10

**Example: Soft cushion**:

```xml
<collision name="cushion_collision">
  <geometry>
    <box><size>1 1 0.2</size></box>
  </geometry>
  <surface>
    <contact>
      <ode>
        <kp>100.0</kp>    <!-- Low stiffness (soft) -->
        <kd>10.0</kd>     <!-- High damping -->
        <max_vel>0.01</max_vel>
      </ode>
    </contact>
  </surface>
</collision>
```

### Simple Sensor Simulation

**Camera sensor** (basic setup):

```xml
<gazebo reference="camera_link">
  <sensor name="camera" type="camera">
    <update_rate>30</update_rate>

    <camera>
      <horizontal_fov>1.047</horizontal_fov>  <!-- 60° -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.05</near>
        <far>100</far>
      </clip>
    </camera>

    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/image_raw:=camera/image_raw</remapping>
      </ros>
      <frame_name>camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**LiDAR sensor** (basic 2D):

```xml
<gazebo reference="lidar_link">
  <sensor name="lidar" type="ray">
    <update_rate>10</update_rate>

    <ray>
      <scan>
        <horizontal>
          <samples>360</samples>
          <resolution>1</resolution>
          <min_angle>-3.14159</min_angle>
          <max_angle>3.14159</max_angle>
        </horizontal>
      </scan>
      <range>
        <min>0.2</min>
        <max>10.0</max>
        <resolution>0.01</resolution>
      </range>
    </ray>

    <plugin name="lidar_controller" filename="libgazebo_ros_ray_sensor.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/out:=scan</remapping>
      </ros>
      <output_type>sensor_msgs/LaserScan</output_type>
      <frame_name>lidar_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**Visualize in RViz2**:

```bash
# Launch Gazebo with robot
ros2 launch my_robot_pkg gazebo.launch.py

# Launch RViz2 (in another terminal)
rviz2

# Add displays:
# - LaserScan → Topic: /robot/scan
# - Camera → Topic: /robot/camera/image_raw
# - RobotModel
# - TF
```

### Physics Accuracy vs. Speed

**Trade-off**: More accurate = slower simulation.

**Key parameter**: **max_step_size**

```xml
<physics>
  <!-- Accurate (slow) -->
  <max_step_size>0.0001</max_step_size>  <!-- 0.1ms, 10kHz -->

  <!-- Balanced (default) -->
  <max_step_size>0.001</max_step_size>   <!-- 1ms, 1kHz -->

  <!-- Fast (less accurate) -->
  <max_step_size>0.01</max_step_size>    <!-- 10ms, 100Hz -->
</physics>
```

**When to use which**:
- **0.0001s**: Highly dynamic systems (fast collisions, stiff contacts)
- **0.001s**: Most robotics applications (default)
- **0.01s**: Slow-moving robots, large-scale sims

**Monitor real-time factor** (RTF):
- RTF = 1.0: Running at real-time speed
- RTF < 1.0: Simulation slower than real-time (physics too complex)
- RTF > 1.0: Simulation faster than real-time

```bash
# Check RTF
gz topic -e -t /stats
```

### Key Takeaways (Beginner)

✅ **Gravity** affects all dynamic objects
✅ **Friction** (mu1/mu2) determines surface grip
✅ **Restitution** controls bounciness
✅ **Contact properties** (kp/kd) define collision response
✅ **Physics timestep** trades accuracy for speed

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Configure advanced physics parameters
- Implement realistic sensor plugins
- Add sensor noise models
- Optimize physics performance
- Handle complex contact scenarios

### Advanced Physics Parameters

**Complete physics configuration**:

```xml
<physics name="ode_physics" type="ode">
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1.0</real_time_factor>
  <real_time_update_rate>1000</real_time_update_rate>

  <ode>
    <!-- Solver configuration -->
    <solver>
      <type>quick</type>  <!-- Options: quick, world -->
      <iters>50</iters>   <!-- Iterations (more = accurate, slower) -->
      <precon_iters>0</precon_iters>
      <sor>1.3</sor>      <!-- Successive Over-Relaxation (1.0-2.0) -->
      <use_dynamic_moi_rescaling>false</use_dynamic_moi_rescaling>
    </solver>

    <!-- Constraint parameters -->
    <constraints>
      <cfm>0.0</cfm>      <!-- Constraint Force Mixing (0.0 = rigid) -->
      <erp>0.2</erp>      <!-- Error Reduction Parameter (0.1-0.8) -->
      <contact_max_correcting_vel>100.0</contact_max_correcting_vel>
      <contact_surface_layer>0.001</contact_surface_layer>
    </constraints>
  </ode>
</physics>
```

**Parameters explained**:

1. **iters**: Solver iterations
   - More iterations = more accurate constraints
   - 20-50 typical, 100+ for complex mechanisms

2. **CFM** (Constraint Force Mixing):
   - 0.0 = perfectly rigid constraints
   - > 0 = "soft" constraints (allows some violation)
   - Use for numerical stability

3. **ERP** (Error Reduction Parameter):
   - How quickly to fix constraint errors
   - 0.2 = fix 20% of error per step
   - Higher = stiffer, but may oscillate

4. **contact_surface_layer**:
   - Allowed interpenetration before contact
   - Smaller = more accurate, less stable
   - 0.001m typical

### Realistic Sensor Plugins

**Camera with noise and distortion**:

```xml
<gazebo reference="camera_link">
  <sensor name="camera" type="camera">
    <update_rate>30</update_rate>

    <camera>
      <horizontal_fov>1.3962634</horizontal_fov>  <!-- 80° -->
      <image>
        <width>1920</width>
        <height>1080</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.02</near>
        <far>300</far>
      </clip>

      <!-- Lens distortion (barrel/pincushion) -->
      <distortion>
        <k1>-0.25</k1>    <!-- Radial distortion -->
        <k2>0.12</k2>
        <k3>0.0</k3>
        <p1>-0.00028</p1> <!-- Tangential distortion -->
        <p2>-0.00005</p2>
        <center>0.5 0.5</center>  <!-- Distortion center -->
      </distortion>

      <!-- Image noise -->
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.007</stddev>  <!-- ~2% noise -->
      </noise>
    </camera>

    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/image_raw:=camera/image_raw</remapping>
        <remapping>~/camera_info:=camera/camera_info</remapping>
      </ros>
      <frame_name>camera_link</frame_name>
      <hack_baseline>0.07</hack_baseline>  <!-- For stereo -->
    </plugin>
  </sensor>
</gazebo>
```

**3D LiDAR (e.g., Velodyne VLP-16)**:

```xml
<gazebo reference="lidar_3d_link">
  <sensor name="lidar_3d" type="gpu_ray">
    <update_rate>10</update_rate>

    <ray>
      <scan>
        <!-- Horizontal scan -->
        <horizontal>
          <samples>1800</samples>  <!-- 0.2° resolution -->
          <resolution>1</resolution>
          <min_angle>-3.14159</min_angle>
          <max_angle>3.14159</max_angle>
        </horizontal>

        <!-- Vertical scan (16 beams) -->
        <vertical>
          <samples>16</samples>
          <resolution>1</resolution>
          <min_angle>-0.2617994</min_angle>  <!-- -15° -->
          <max_angle>0.2617994</max_angle>   <!-- +15° -->
        </vertical>
      </scan>

      <range>
        <min>0.5</min>
        <max>100.0</max>
        <resolution>0.03</resolution>
      </range>

      <!-- Realistic noise -->
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.02</stddev>  <!-- 2cm noise -->
      </noise>
    </ray>

    <plugin name="lidar_3d_controller" filename="libgazebo_ros_ray_sensor.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/out:=points</remapping>
      </ros>
      <output_type>sensor_msgs/PointCloud2</output_type>
      <frame_name>lidar_3d_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**IMU with realistic noise**:

```xml
<gazebo reference="imu_link">
  <sensor name="imu" type="imu">
    <always_on>true</always_on>
    <update_rate>200</update_rate>  <!-- 200 Hz -->

    <imu>
      <!-- Orientation (from physics) -->
      <orientation_reference_frame>
        <localization>CUSTOM</localization>
        <custom_rpy parent_frame="world">0 0 0</custom_rpy>
      </orientation_reference_frame>

      <!-- Gyroscope (angular velocity) -->
      <angular_velocity>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.009</stddev>           <!-- Noise density (rad/s/√Hz) -->
            <bias_mean>0.00005</bias_mean>    <!-- Bias (rad/s) -->
            <bias_stddev>0.00001</bias_stddev>
            <dynamic_bias_stddev>0.00002</dynamic_bias_stddev>
            <dynamic_bias_correlation_time>400.0</dynamic_bias_correlation_time>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.009</stddev>
            <bias_mean>0.00005</bias_mean>
            <bias_stddev>0.00001</bias_stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.009</stddev>
            <bias_mean>0.00005</bias_mean>
            <bias_stddev>0.00001</bias_stddev>
          </noise>
        </z>
      </angular_velocity>

      <!-- Accelerometer (linear acceleration) -->
      <linear_acceleration>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.017</stddev>           <!-- m/s² -->
            <bias_mean>0.1</bias_mean>
            <bias_stddev>0.01</bias_stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.017</stddev>
            <bias_mean>0.1</bias_mean>
            <bias_stddev>0.01</bias_stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.017</stddev>
            <bias_mean>0.1</bias_mean>
            <bias_stddev>0.01</bias_stddev>
          </noise>
        </z>
      </linear_acceleration>
    </imu>

    <plugin name="imu_plugin" filename="libgazebo_ros_imu_sensor.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/out:=imu/data</remapping>
      </ros>
      <frame_name>imu_link</frame_name>
      <initial_orientation_as_reference>false</initial_orientation_as_reference>
    </plugin>
  </sensor>
</gazebo>
```

**Key noise parameters**:
- **stddev**: Standard deviation of white noise
- **bias_mean**: Constant offset
- **bias_stddev**: Variation in bias
- **dynamic_bias_correlation_time**: How quickly bias changes

### Depth Camera (RGB-D)

```xml
<gazebo reference="depth_camera_link">
  <sensor name="depth_camera" type="depth">
    <update_rate>30</update_rate>

    <camera>
      <horizontal_fov>1.047</horizontal_fov>
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.05</near>
        <far>10.0</far>
      </clip>

      <!-- RGB noise -->
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.007</stddev>
      </noise>
    </camera>

    <plugin name="depth_camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/image_raw:=depth_camera/image_raw</remapping>
        <remapping>~/depth/image_raw:=depth_camera/depth/image_raw</remapping>
        <remapping>~/points:=depth_camera/points</remapping>
      </ros>
      <frame_name>depth_camera_link</frame_name>

      <!-- Depth-specific settings -->
      <min_depth>0.05</min_depth>
      <max_depth>10.0</max_depth>

      <!-- Point cloud options -->
      <point_cloud_cutoff>0.5</point_cloud_cutoff>
      <point_cloud_min_depth>0.05</point_cloud_min_depth>
      <point_cloud_max_depth>10.0</point_cloud_max_depth>
    </plugin>
  </sensor>
</gazebo>
```

**Topics published**:
- `/robot/depth_camera/image_raw` (RGB)
- `/robot/depth_camera/depth/image_raw` (Depth image)
- `/robot/depth_camera/points` (PointCloud2)

### Physics Optimization

**Collision detection optimization**:

```xml
<!-- Use bounding box hierarchy -->
<model name="complex_robot">
  <link name="base_link">
    <collision name="collision">
      <geometry>
        <mesh>
          <uri>model://robot.dae</uri>
        </mesh>
      </geometry>
      <surface>
        <contact>
          <collide_bitmask>0x01</collide_bitmask>  <!-- Collision layers -->
        </contact>
      </surface>
    </collision>
  </link>
</model>

<!-- Static obstacle (doesn't collide with other static objects) -->
<model name="wall">
  <static>true</static>
  <link name="link">
    <collision name="collision">
      <geometry>
        <box><size>10 0.2 3</size></box>
      </geometry>
      <surface>
        <contact>
          <collide_bitmask>0x02</collide_bitmask>
        </contact>
      </surface>
    </collision>
  </link>
</model>
```

**Disable unnecessary collisions**:

```xml
<!-- Self-collision disabled -->
<model name="robot">
  <self_collide>false</self_collide>  <!-- Links don't collide with each other -->

  <link name="link1">...</link>
  <link name="link2">...</link>
</model>
```

### Complex Contact Scenarios

**Wheeled robot on rough terrain**:

```xml
<!-- Wheel with detailed contact -->
<gazebo reference="wheel_link">
  <mu1>1.5</mu1>
  <mu2>1.5</mu2>

  <kp>1000000.0</kp>
  <kd>100.0</kd>
  <minDepth>0.0001</minDepth>
  <maxVel>0.1</maxVel>

  <!-- Directional friction -->
  <fdir1>0 0 1</fdir1>  <!-- Primary friction direction -->

  <!-- Slip parameters -->
  <slip1>0.0</slip1>
  <slip2>0.0</slip2>

  <material>Gazebo/Black</material>
</gazebo>
```

**Gripper contacts** (for manipulation):

```xml
<gazebo reference="gripper_finger">
  <!-- High friction for gripping -->
  <mu1>2.0</mu1>
  <mu2>2.0</mu2>

  <!-- Soft contact (deformable) -->
  <kp>10000.0</kp>  <!-- Lower stiffness -->
  <kd>100.0</kd>    <!-- Higher damping -->

  <minDepth>0.001</minDepth>

  <material>Gazebo/Grey</material>
</gazebo>
```

### Key Takeaways (Intermediate)

✅ **Advanced physics** tuning (CFM, ERP, iterations)
✅ **Realistic sensors** include noise, bias, distortion
✅ **3D LiDAR** and depth cameras for perception
✅ **Contact optimization** improves performance
✅ **Collision bitmasks** control which objects collide

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement custom contact sensors
- Design advanced sensor models
- Compare physics engines
- Optimize real-time factor
- Handle soft-body physics

### Custom Contact Sensor

**Force/torque sensor** (measures forces at joints):

**Plugin: libgazebo_ros_ft_sensor.so**

```xml
<gazebo>
  <joint name="wrist_joint" type="revolute">
    <!-- Joint definition -->
  </joint>

  <!-- Force-torque sensor plugin -->
  <plugin name="ft_sensor" filename="libgazebo_ros_ft_sensor.so">
    <ros>
      <namespace>/robot</namespace>
      <remapping>~/out:=wrist_ft</remapping>
    </ros>
    <joint_name>wrist_joint</joint_name>
    <update_rate>100</update_rate>
    <gaussian_noise>0.01</gaussian_noise>
  </plugin>
</gazebo>
```

**Topic published**:
- `/robot/wrist_ft` (geometry_msgs/WrenchStamped)
  - force: (x, y, z) in Newtons
  - torque: (x, y, z) in N⋅m

**Bumper sensor** (detects contacts):

```xml
<gazebo reference="bumper_link">
  <sensor name="bumper" type="contact">
    <contact>
      <collision>bumper_collision</collision>
    </contact>
    <update_rate>50</update_rate>

    <plugin name="bumper_plugin" filename="libgazebo_ros_bumper.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/out:=bumper</remapping>
      </ros>
      <frame_name>bumper_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**Topic published**:
- `/robot/bumper` (gazebo_msgs/ContactsState)

### Advanced Sensor Models

**Radar with Doppler velocity**:

*Note: Requires custom plugin for full Doppler simulation.*

```xml
<gazebo reference="radar_link">
  <sensor name="radar" type="ray">
    <ray>
      <scan>
        <horizontal>
          <samples>128</samples>
          <min_angle>-0.52</min_angle>  <!-- ±30° -->
          <max_angle>0.52</max_angle>
        </horizontal>
        <vertical>
          <samples>8</samples>
          <min_angle>-0.17</min_angle>  <!-- ±10° -->
          <max_angle>0.17</max_angle>
        </vertical>
      </scan>
      <range>
        <min>1.0</min>
        <max>200.0</max>
        <resolution>0.5</resolution>
      </range>
    </ray>

    <update_rate>10</update_rate>

    <plugin name="radar_plugin" filename="libgazebo_ros_ray_sensor.so">
      <output_type>sensor_msgs/PointCloud2</output_type>
      <frame_name>radar_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**GPS with realistic errors**:

```xml
<gazebo reference="gps_link">
  <sensor name="gps" type="gps">
    <always_on>true</always_on>
    <update_rate>10</update_rate>

    <gps>
      <position_sensing>
        <horizontal>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2.0</stddev>  <!-- 2m horizontal error (consumer GPS) -->
          </noise>
        </horizontal>
        <vertical>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>4.0</stddev>  <!-- 4m vertical error -->
          </noise>
        </vertical>
      </position_sensing>

      <velocity_sensing>
        <horizontal>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.1</stddev>  <!-- 0.1 m/s -->
          </noise>
        </horizontal>
        <vertical>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.2</stddev>
          </noise>
        </vertical>
      </velocity_sensing>
    </gps>

    <plugin name="gps_plugin" filename="libgazebo_ros_gps_sensor.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/out:=gps/fix</remapping>
      </ros>
      <frame_name>gps_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

### Physics Engine Comparison

**Four engines in Gazebo**:

1. **ODE** (Open Dynamics Engine)
   - **Pros**: Fast, stable, good for most robots
   - **Cons**: Less accurate contacts, basic features
   - **Use for**: Mobile robots, basic manipulation

2. **Bullet**
   - **Pros**: Better collision detection, faster than ODE for complex scenes
   - **Cons**: Less stable for stacked objects
   - **Use for**: Multi-robot systems, complex environments

3. **DART** (Dynamic Animation and Robotics Toolkit)
   - **Pros**: Advanced constraints, humanoids, accurate dynamics
   - **Cons**: Slower, more complex
   - **Use for**: Humanoid robots, legged locomotion

4. **Simbody**
   - **Pros**: Very accurate, biomechanics
   - **Cons**: Slowest
   - **Use for**: Biomechanical systems, high-fidelity simulation

**Switch engine**:

```xml
<world name="my_world">
  <!-- Use DART -->
  <physics name="dart_physics" type="dart">
    <max_step_size>0.001</max_step_size>
    <dart>
      <solver>
        <solver_type>dantzig</solver_type>
      </solver>
      <collision_detector>fcl</collision_detector>
    </dart>
  </physics>

  <plugin filename="gz-sim-physics-system" name="gz::sim::systems::Physics">
    <engine>
      <filename>gz-physics-dartsim-plugin</filename>
    </engine>
  </plugin>
</world>
```

**Benchmarking**:

```python
#!/usr/bin/env python3
import time
import subprocess

engines = ['ode', 'bullet', 'dart']
world_file = 'benchmark.world'

for engine in engines:
    # Modify world file to use engine
    # ...

    start = time.time()
    proc = subprocess.Popen(['gz', 'sim', '-r', '-s', '--iterations', '10000', world_file])
    proc.wait()
    elapsed = time.time() - start

    print(f"{engine}: {elapsed:.2f}s ({10000/elapsed:.0f} steps/s)")
```

### Real-Time Factor Optimization

**Strategies**:

1. **Reduce physics rate**:
```xml
<physics>
  <max_step_size>0.005</max_step_size>  <!-- 200 Hz instead of 1000 Hz -->
</physics>
```

2. **Simplify geometry**:
```xml
<!-- Complex mesh -->
<visual>
  <geometry>
    <mesh><uri>robot_detailed.dae</uri></mesh>
  </geometry>
</visual>

<!-- Simple collision -->
<collision>
  <geometry>
    <box><size>0.5 0.3 0.2</size></box>  <!-- Bounding box -->
  </geometry>
</collision>
```

3. **Reduce sensor rates**:
```xml
<!-- High-rate sensors only when needed -->
<sensor name="camera" type="camera">
  <update_rate>10</update_rate>  <!-- Not 30 -->
</sensor>
```

4. **Use GPU sensors** (if available):
```xml
<sensor name="lidar" type="gpu_ray">  <!-- gpu_ray instead of ray -->
  <!-- ... -->
</sensor>
```

5. **Disable shadows**:
```xml
<light type="directional" name="sun">
  <cast_shadows>false</cast_shadows>
</light>
```

**Monitor RTF**:

```bash
gz topic -e -t /stats | grep real_time_factor
```

**Target RTF ≥ 1.0** for real-time applications.

### Soft-Body Physics (Experimental)

**Deformable objects** (requires DART):

```xml
<world name="soft_body_world">
  <physics type="dart">
    <dart>
      <collision_detector>bullet</collision_detector>
    </dart>
  </physics>

  <model name="soft_cube">
    <link name="link">
      <inertial>
        <mass>1.0</mass>
      </inertial>

      <collision name="collision">
        <geometry>
          <box><size>1 1 1</size></box>
        </geometry>
        <surface>
          <soft_contact>
            <dart>
              <kp>100.0</kp>     <!-- Stiffness -->
              <kd>10.0</kd>      <!-- Damping -->
            </dart>
          </soft_contact>
        </surface>
      </collision>

      <visual name="visual">
        <geometry>
          <box><size>1 1 1</size></box>
        </geometry>
        <material>
          <ambient>0.5 0.8 0.5 1</ambient>
        </material>
      </visual>
    </link>
  </model>
</world>
```

*Note*: Full soft-body simulation (FEM) not yet fully supported in Gazebo. Use specialized tools (e.g., Vega, SOFA) for advanced deformables.

### Key Takeaways (Advanced)

✅ **Custom sensors** (FT, bumper) for specialized tasks
✅ **Physics engines** (ODE, Bullet, DART) have trade-offs
✅ **RTF optimization** critical for real-time simulation
✅ **GPU sensors** accelerate rendering-heavy sensors
✅ **Soft-body** physics still experimental

---

## Additional Resources

- [Gazebo Physics Documentation](https://gazebosim.org/api/physics/7/index.html)
- [SDF Physics Spec](http://sdformat.org/spec?elem=physics)
- [Gazebo Sensors](https://gazebosim.org/api/sensors/7/index.html)
- [ODE Manual](https://ode.org/wiki/index.php/Manual)
- [DART Documentation](https://dartsim.github.io/)

---

**Next:** [Gazebo-ROS 2 Integration →](./07-gazebo-ros2.md)
