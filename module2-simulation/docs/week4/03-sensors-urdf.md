---
sidebar_position: 3
---

# Sensors in URDF

**Complete Guide**: Beginner → Intermediate → Advanced

---

## 🟢 Beginner Level

**Duration**: 2-3 hours
**Prerequisites**: URDF Basics, Links & Joints

### Learning Objectives

- Add camera sensors to URDF
- Implement LiDAR sensors
- Add IMU (Inertial Measurement Unit)
- Understand sensor coordinate frames
- Visualize sensor data in RViz2

### Why Add Sensors to URDF?

**Sensors** provide perception for:
- **Navigation**: LiDAR for obstacle detection
- **Vision**: Cameras for object recognition
- **Localization**: IMU for orientation, GPS for position
- **Manipulation**: Depth cameras for grasping

**In URDF**: Define sensor placement and properties.
**In Gazebo**: Sensor plugins generate simulated data.

### Camera Sensor

**Add camera link to URDF**:

```xml
<?xml version="1.0"?>
<robot name="robot_with_camera">

  <!-- Base link (simplified) -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.6 0.4 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.6 0.4 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0"/>
      <inertia ixx="0.17" ixy="0" ixz="0" iyy="0.37" iyz="0" izz="0.47"/>
    </inertial>
  </link>

  <!-- Camera link -->
  <link name="camera_link">
    <visual>
      <geometry>
        <box size="0.05 0.05 0.05"/>
      </geometry>
      <material name="red">
        <color rgba="0.8 0 0 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.05 0.05 0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.1"/>
      <inertia ixx="0.00001" ixy="0" ixz="0" iyy="0.00001" iyz="0" izz="0.00001"/>
    </inertial>
  </link>

  <!-- Camera joint (fixed to base) -->
  <joint name="camera_joint" type="fixed">
    <parent link="base_link"/>
    <child link="camera_link"/>
    <!-- Mount camera at front, 0.2m up, pointing forward -->
    <origin xyz="0.3 0 0.2" rpy="0 0 0"/>
  </joint>

</robot>
```

**Add Gazebo camera plugin**:

```xml
<gazebo reference="camera_link">
  <!-- Camera sensor -->
  <sensor name="camera" type="camera">
    <update_rate>30.0</update_rate>  <!-- 30 FPS -->
    <camera>
      <horizontal_fov>1.047</horizontal_fov>  <!-- 60° -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.05</near>  <!-- Min distance -->
        <far>100.0</far>   <!-- Max distance -->
      </clip>
    </camera>

    <!-- Plugin to publish to ROS -->
    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/image_raw:=camera/image_raw</remapping>
        <remapping>~/camera_info:=camera/camera_info</remapping>
      </ros>
      <camera_name>camera</camera_name>
      <frame_name>camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**Topics published**:
- `/robot/camera/image_raw` (sensor_msgs/Image)
- `/robot/camera/camera_info` (sensor_msgs/CameraInfo)

### LiDAR Sensor

**2D LiDAR (laser scanner)**:

```xml
<!-- LiDAR link -->
<link name="lidar_link">
  <visual>
    <geometry>
      <cylinder radius="0.05" length="0.07"/>
    </geometry>
    <material name="black">
      <color rgba="0 0 0 1"/>
    </material>
  </visual>
  <collision>
    <geometry>
      <cylinder radius="0.05" length="0.07"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="0.2"/>
    <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
  </inertial>
</link>

<!-- LiDAR joint -->
<joint name="lidar_joint" type="fixed">
  <parent link="base_link"/>
  <child link="lidar_link"/>
  <origin xyz="0.2 0 0.15" rpy="0 0 0"/>
</joint>
```

**Gazebo LiDAR plugin**:

```xml
<gazebo reference="lidar_link">
  <sensor name="lidar" type="ray">
    <update_rate>10</update_rate>  <!-- 10 Hz -->
    <ray>
      <scan>
        <horizontal>
          <samples>360</samples>        <!-- 360 points -->
          <resolution>1</resolution>
          <min_angle>-3.14159</min_angle>  <!-- -180° -->
          <max_angle>3.14159</max_angle>   <!-- +180° -->
        </horizontal>
      </scan>
      <range>
        <min>0.2</min>   <!-- Min range: 0.2m -->
        <max>10.0</max>  <!-- Max range: 10m -->
        <resolution>0.01</resolution>
      </range>
    </ray>

    <!-- Plugin -->
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

**Topic published**:
- `/robot/scan` (sensor_msgs/LaserScan)

### IMU Sensor

**IMU provides**:
- Linear acceleration (m/s²)
- Angular velocity (rad/s)
- Orientation (quaternion)

```xml
<!-- IMU link (usually inside robot body) -->
<link name="imu_link">
  <visual>
    <geometry>
      <box size="0.02 0.02 0.01"/>
    </geometry>
    <material name="green">
      <color rgba="0 0.8 0 1"/>
    </material>
  </visual>
  <inertial>
    <mass value="0.01"/>
    <inertia ixx="0.000001" ixy="0" ixz="0" iyy="0.000001" iyz="0" izz="0.000001"/>
  </inertial>
</link>

<!-- IMU joint -->
<joint name="imu_joint" type="fixed">
  <parent link="base_link"/>
  <child link="imu_link"/>
  <origin xyz="0 0 0.05" rpy="0 0 0"/>  <!-- Center of base -->
</joint>
```

**Gazebo IMU plugin**:

```xml
<gazebo reference="imu_link">
  <sensor name="imu" type="imu">
    <update_rate>100</update_rate>  <!-- 100 Hz -->
    <imu>
      <angular_velocity>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.01</stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.01</stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.01</stddev>
          </noise>
        </z>
      </angular_velocity>
      <linear_acceleration>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.1</stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.1</stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.1</stddev>
          </noise>
        </z>
      </linear_acceleration>
    </imu>

    <plugin name="imu_plugin" filename="libgazebo_ros_imu_sensor.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/out:=imu</remapping>
      </ros>
      <frame_name>imu_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**Topic published**:
- `/robot/imu` (sensor_msgs/Imu)

### Sensor Coordinate Frames

**Key principle**: Sensor data is in the sensor's frame.

**ROS convention** (REP 105):
- **Camera**: X forward, Y left, Z up
- **LiDAR**: X forward (0°), Y left, Z up
- **IMU**: X forward, Y left, Z up (body frame)

**Example**: Camera mounted at 30° down:

```xml
<joint name="camera_joint" type="fixed">
  <parent link="base_link"/>
  <child link="camera_link"/>
  <!-- Pitch down 30° = 0.524 rad -->
  <origin xyz="0.3 0 0.2" rpy="0 0.524 0"/>
</joint>
```

**Image points** will be rotated accordingly in camera frame.

### Visualizing Sensor Data in RViz2

**Launch robot with sensors**:

```bash
# Launch Gazebo with robot
ros2 launch my_robot_pkg spawn_robot.launch.py

# In another terminal, launch RViz2
rviz2
```

**RViz2 configuration**:

1. **Add camera display**:
   - Click "Add" → "By topic" → `/robot/camera/image_raw` → "Camera"

2. **Add LaserScan display**:
   - Click "Add" → "By topic" → `/robot/scan` → "LaserScan"
   - Set color, size

3. **Add TF display**:
   - Click "Add" → "TF"
   - Shows all sensor frames

4. **Set Fixed Frame**:
   - Change "Fixed Frame" to `base_link` or `odom`

**Save configuration**:
```bash
# File → Save Config As → my_robot.rviz
```

### Complete Example: Robot with All Sensors

**robot_with_sensors.urdf.xacro**:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="sensor_robot">

  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.6 0.4 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 0.8 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.6 0.4 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0"/>
      <inertia ixx="0.17" ixy="0" ixz="0" iyy="0.37" iyz="0" izz="0.47"/>
    </inertial>
  </link>

  <!-- Camera -->
  <link name="camera_link">
    <visual>
      <geometry>
        <box size="0.05 0.05 0.05"/>
      </geometry>
      <material name="red">
        <color rgba="0.8 0 0 1"/>
      </material>
    </visual>
    <inertial>
      <mass value="0.1"/>
      <inertia ixx="0.00001" ixy="0" ixz="0" iyy="0.00001" iyz="0" izz="0.00001"/>
    </inertial>
  </link>

  <joint name="camera_joint" type="fixed">
    <parent link="base_link"/>
    <child link="camera_link"/>
    <origin xyz="0.3 0 0.2" rpy="0 0 0"/>
  </joint>

  <gazebo reference="camera_link">
    <sensor name="camera" type="camera">
      <update_rate>30</update_rate>
      <camera>
        <horizontal_fov>1.047</horizontal_fov>
        <image>
          <width>640</width>
          <height>480</height>
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

  <!-- LiDAR -->
  <link name="lidar_link">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.07"/>
      </geometry>
      <material name="black">
        <color rgba="0 0 0 1"/>
      </material>
    </visual>
    <inertial>
      <mass value="0.2"/>
      <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
    </inertial>
  </link>

  <joint name="lidar_joint" type="fixed">
    <parent link="base_link"/>
    <child link="lidar_link"/>
    <origin xyz="0.2 0 0.15" rpy="0 0 0"/>
  </joint>

  <gazebo reference="lidar_link">
    <sensor name="lidar" type="ray">
      <update_rate>10</update_rate>
      <ray>
        <scan>
          <horizontal>
            <samples>360</samples>
            <min_angle>-3.14159</min_angle>
            <max_angle>3.14159</max_angle>
          </horizontal>
        </scan>
        <range>
          <min>0.2</min>
          <max>10.0</max>
        </range>
      </ray>
      <plugin name="lidar_controller" filename="libgazebo_ros_ray_sensor.so">
        <ros>
          <remapping>~/out:=scan</remapping>
        </ros>
        <output_type>sensor_msgs/LaserScan</output_type>
        <frame_name>lidar_link</frame_name>
      </plugin>
    </sensor>
  </gazebo>

  <!-- IMU -->
  <link name="imu_link">
    <inertial>
      <mass value="0.01"/>
      <inertia ixx="0.000001" ixy="0" ixz="0" iyy="0.000001" iyz="0" izz="0.000001"/>
    </inertial>
  </link>

  <joint name="imu_joint" type="fixed">
    <parent link="base_link"/>
    <child link="imu_link"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
  </joint>

  <gazebo reference="imu_link">
    <sensor name="imu" type="imu">
      <update_rate>100</update_rate>
      <plugin name="imu_plugin" filename="libgazebo_ros_imu_sensor.so">
        <ros>
          <remapping>~/out:=imu</remapping>
        </ros>
        <frame_name>imu_link</frame_name>
      </plugin>
    </sensor>
  </gazebo>

</robot>
```

**Test sensors**:

```bash
# Check camera topic
ros2 topic echo /robot/camera/image_raw --once

# Check LiDAR topic
ros2 topic echo /robot/scan --once

# Check IMU topic
ros2 topic echo /robot/imu --once
```

### Key Takeaways (Beginner)

✅ **Sensors** are added as links with Gazebo plugins
✅ **Camera**: Visual perception, publishes images
✅ **LiDAR**: Range sensing, publishes LaserScan
✅ **IMU**: Orientation and acceleration
✅ **Coordinate frames** matter for sensor data interpretation

---

## 🟡 Intermediate Level

**Duration**: 3-4 hours
**Prerequisites**: Beginner section completed

### Learning Objectives

- Implement realistic sensor noise models
- Add depth cameras (RGB-D)
- Configure multiple sensor instances
- Implement GPS simulation
- Optimize sensor performance

### Sensor Noise Models

**Real sensors have noise**. Simulate this for realistic testing.

**Noise types**:
1. **Gaussian**: Random noise (mean, stddev)
2. **Uniform**: Evenly distributed
3. **Salt & pepper**: Random dropouts

**Camera noise**:

```xml
<gazebo reference="camera_link">
  <sensor name="camera" type="camera">
    <camera>
      <horizontal_fov>1.047</horizontal_fov>
      <image>
        <width>640</width>
        <height>480</height>
      </image>
      <clip>
        <near>0.05</near>
        <far>100</far>
      </clip>

      <!-- Image noise -->
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.007</stddev>  <!-- ~2% noise -->
      </noise>
    </camera>

    <update_rate>30</update_rate>

    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <remapping>~/image_raw:=camera/image_raw</remapping>
      </ros>
      <frame_name>camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**LiDAR noise**:

```xml
<gazebo reference="lidar_link">
  <sensor name="lidar" type="ray">
    <ray>
      <scan>
        <horizontal>
          <samples>360</samples>
          <min_angle>-3.14159</min_angle>
          <max_angle>3.14159</max_angle>
        </horizontal>
      </scan>
      <range>
        <min>0.2</min>
        <max>10.0</max>
        <resolution>0.01</resolution>
      </range>

      <!-- Range noise -->
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.01</stddev>  <!-- 1cm stddev -->
      </noise>
    </ray>

    <update_rate>10</update_rate>

    <plugin name="lidar_controller" filename="libgazebo_ros_ray_sensor.so">
      <output_type>sensor_msgs/LaserScan</output_type>
      <frame_name>lidar_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**IMU noise** (more complex):

```xml
<gazebo reference="imu_link">
  <sensor name="imu" type="imu">
    <imu>
      <!-- Gyroscope (angular velocity) -->
      <angular_velocity>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.009</stddev>      <!-- Noise density -->
            <bias_mean>0.00005</bias_mean>
            <bias_stddev>0.00001</bias_stddev>
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

      <!-- Accelerometer -->
      <linear_acceleration>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>0.017</stddev>      <!-- m/s² -->
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

    <update_rate>100</update_rate>

    <plugin name="imu_plugin" filename="libgazebo_ros_imu_sensor.so">
      <frame_name>imu_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**Typical real-world values**:
- **Camera noise**: 0.5-2% of pixel intensity
- **LiDAR noise**: 1-5 cm stddev
- **IMU gyro**: 0.01-0.1 rad/s stddev
- **IMU accel**: 0.01-0.1 m/s² stddev

### Depth Camera (RGB-D)

**Provides**: Color image + depth map (like Intel RealSense, Kinect).

```xml
<!-- Depth camera link -->
<link name="depth_camera_link">
  <visual>
    <geometry>
      <box size="0.08 0.025 0.025"/>
    </geometry>
    <material name="dark_gray">
      <color rgba="0.2 0.2 0.2 1"/>
    </material>
  </visual>
  <inertial>
    <mass value="0.15"/>
    <inertia ixx="0.00001" ixy="0" ixz="0" iyy="0.00001" iyz="0" izz="0.00001"/>
  </inertial>
</link>

<joint name="depth_camera_joint" type="fixed">
  <parent link="base_link"/>
  <child link="depth_camera_link"/>
  <origin xyz="0.3 0 0.25" rpy="0 0 0"/>
</joint>

<gazebo reference="depth_camera_link">
  <sensor name="depth_camera" type="depth">
    <update_rate>30</update_rate>

    <camera>
      <horizontal_fov>1.047</horizontal_fov>  <!-- 60° -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>   <!-- Min depth -->
        <far>10.0</far>    <!-- Max depth -->
      </clip>

      <!-- Depth camera noise -->
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
      <min_depth>0.1</min_depth>
      <max_depth>10.0</max_depth>
    </plugin>
  </sensor>
</gazebo>
```

**Topics published**:
- `/robot/depth_camera/image_raw` (RGB image)
- `/robot/depth_camera/depth/image_raw` (depth image)
- `/robot/depth_camera/points` (PointCloud2)

**Visualize point cloud in RViz2**:
```
Add → PointCloud2 → Topic: /robot/depth_camera/points
```

### GPS Sensor

**Provides**: Latitude, longitude, altitude.

```xml
<!-- GPS link (antenna) -->
<link name="gps_link">
  <visual>
    <geometry>
      <cylinder radius="0.02" length="0.05"/>
    </geometry>
    <material name="white">
      <color rgba="1 1 1 1"/>
    </material>
  </visual>
  <inertial>
    <mass value="0.05"/>
    <inertia ixx="0.000001" ixy="0" ixz="0" iyy="0.000001" iyz="0" izz="0.000001"/>
  </inertial>
</link>

<joint name="gps_joint" type="fixed">
  <parent link="base_link"/>
  <child link="gps_link"/>
  <origin xyz="0 0 0.3" rpy="0 0 0"/>  <!-- Top of robot -->
</joint>

<gazebo reference="gps_link">
  <sensor name="gps" type="gps">
    <update_rate>5</update_rate>  <!-- 5 Hz -->

    <gps>
      <position_sensing>
        <horizontal>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2.0</stddev>  <!-- 2m horizontal accuracy -->
          </noise>
        </horizontal>
        <vertical>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>4.0</stddev>  <!-- 4m vertical accuracy -->
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
            <stddev>0.1</stddev>
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

**Topic published**:
- `/robot/gps/fix` (sensor_msgs/NavSatFix)

### Multiple Sensor Configurations

**Example: Multi-camera setup** (front, left, right, back):

```xml
<!-- XACRO macro for cameras -->
<xacro:macro name="camera_sensor" params="name parent xyz rpy">
  <link name="${name}_link">
    <visual>
      <geometry>
        <box size="0.03 0.03 0.03"/>
      </geometry>
      <material name="camera_mat">
        <color rgba="0.3 0.3 0.3 1"/>
      </material>
    </visual>
    <inertial>
      <mass value="0.05"/>
      <inertia ixx="0.000001" ixy="0" ixz="0" iyy="0.000001" iyz="0" izz="0.000001"/>
    </inertial>
  </link>

  <joint name="${name}_joint" type="fixed">
    <parent link="${parent}"/>
    <child link="${name}_link"/>
    <origin xyz="${xyz}" rpy="${rpy}"/>
  </joint>

  <gazebo reference="${name}_link">
    <sensor name="${name}" type="camera">
      <update_rate>30</update_rate>
      <camera>
        <horizontal_fov>1.57</horizontal_fov>  <!-- 90° wide angle -->
        <image>
          <width>640</width>
          <height>480</height>
        </image>
        <clip>
          <near>0.05</near>
          <far>50</far>
        </clip>
      </camera>
      <plugin name="${name}_controller" filename="libgazebo_ros_camera.so">
        <ros>
          <remapping>~/image_raw:=${name}/image_raw</remapping>
        </ros>
        <frame_name>${name}_link</frame_name>
      </plugin>
    </sensor>
  </gazebo>
</xacro:macro>

<!-- Instantiate cameras -->
<xacro:camera_sensor name="front_camera" parent="base_link"
                     xyz="0.3 0 0.2" rpy="0 0 0"/>

<xacro:camera_sensor name="left_camera" parent="base_link"
                     xyz="0 0.2 0.2" rpy="0 0 1.5708"/>  <!-- 90° left -->

<xacro:camera_sensor name="right_camera" parent="base_link"
                     xyz="0 -0.2 0.2" rpy="0 0 -1.5708"/>  <!-- 90° right -->

<xacro:camera_sensor name="back_camera" parent="base_link"
                     xyz="-0.3 0 0.2" rpy="0 0 3.14159"/>  <!-- 180° back -->
```

**Topics**:
- `/front_camera/image_raw`
- `/left_camera/image_raw`
- `/right_camera/image_raw`
- `/back_camera/image_raw`

### Sensor Performance Optimization

**Update rates**:
- Too high → computational load
- Too low → missing events

**Recommended rates**:
- Camera: 15-30 Hz
- LiDAR: 5-10 Hz
- IMU: 50-200 Hz
- GPS: 1-10 Hz

**Resolution trade-offs**:

```xml
<!-- Low-res for faster processing -->
<image>
  <width>320</width>
  <height>240</height>
</image>

<!-- High-res for detailed perception -->
<image>
  <width>1920</width>
  <height>1080</height>
</image>
```

**LiDAR samples**:

```xml
<!-- Sparse (faster) -->
<horizontal>
  <samples>180</samples>  <!-- Every 2° -->
</horizontal>

<!-- Dense (slower, more accurate) -->
<horizontal>
  <samples>720</samples>  <!-- Every 0.5° -->
</horizontal>
```

### Key Takeaways (Intermediate)

✅ **Noise models** make simulation realistic
✅ **Depth cameras** provide RGB + depth data
✅ **GPS** for outdoor localization
✅ **Sensor macros** enable multi-sensor configurations
✅ **Performance tuning** balances accuracy and speed

---

## 🔴 Advanced Level

**Duration**: 4-6 hours
**Prerequisites**: Intermediate section completed

### Learning Objectives

- Implement custom sensor plugins
- Design sensor fusion architectures
- Optimize multi-sensor configurations
- Implement advanced sensor models (radar, thermal)
- Handle sensor calibration

### Custom Sensor Plugin

**Create custom plugin** for specialized sensor (e.g., ultrasonic array).

**ultrasonic_plugin.cpp**:

```cpp
#include <gazebo/gazebo.hh>
#include <gazebo/sensors/sensors.hh>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/range.hpp>

namespace gazebo
{
  class UltrasonicPlugin : public SensorPlugin
  {
  public:
    UltrasonicPlugin() : SensorPlugin() {}

    virtual void Load(sensors::SensorPtr _sensor, sdf::ElementPtr _sdf)
    {
      // Get parent sensor
      this->parentSensor = std::dynamic_pointer_cast<sensors::RaySensor>(_sensor);

      if (!this->parentSensor)
      {
        gzerr << "UltrasonicPlugin requires a Ray sensor.\n";
        return;
      }

      // ROS 2 node
      this->rosNode = rclcpp::Node::make_shared("ultrasonic_sensor");

      // Publisher
      this->pub = this->rosNode->create_publisher<sensor_msgs::msg::Range>(
        "ultrasonic/range", 10
      );

      // Connect to sensor update
      this->updateConnection = this->parentSensor->ConnectUpdated(
        std::bind(&UltrasonicPlugin::OnUpdate, this)
      );

      // Activate sensor
      this->parentSensor->SetActive(true);
    }

    virtual void OnUpdate()
    {
      // Get range
      double range = this->parentSensor->Range(0);  // First ray

      // Publish ROS message
      auto msg = sensor_msgs::msg::Range();
      msg.header.stamp = this->rosNode->now();
      msg.header.frame_id = "ultrasonic_link";
      msg.radiation_type = sensor_msgs::msg::Range::ULTRASOUND;
      msg.field_of_view = 0.26;  // ~15° cone
      msg.min_range = 0.02;
      msg.max_range = 4.0;
      msg.range = range;

      this->pub->publish(msg);
    }

  private:
    sensors::RaySensorPtr parentSensor;
    rclcpp::Node::SharedPtr rosNode;
    rclcpp::Publisher<sensor_msgs::msg::Range>::SharedPtr pub;
    event::ConnectionPtr updateConnection;
  };

  GZ_REGISTER_SENSOR_PLUGIN(UltrasonicPlugin)
}
```

**CMakeLists.txt** (to build plugin):

```cmake
cmake_minimum_required(VERSION 3.5)
project(my_gazebo_plugins)

find_package(gazebo REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)

add_library(ultrasonic_plugin SHARED src/ultrasonic_plugin.cpp)
target_link_libraries(ultrasonic_plugin ${GAZEBO_LIBRARIES})
ament_target_dependencies(ultrasonic_plugin rclcpp sensor_msgs)
```

**Use in URDF**:

```xml
<gazebo reference="ultrasonic_link">
  <sensor name="ultrasonic" type="ray">
    <ray>
      <scan>
        <horizontal>
          <samples>5</samples>
          <resolution>1</resolution>
          <min_angle>-0.13</min_angle>  <!-- -7.5° -->
          <max_angle>0.13</max_angle>   <!-- +7.5° -->
        </horizontal>
      </scan>
      <range>
        <min>0.02</min>
        <max>4.0</max>
      </range>
    </ray>
    <update_rate>20</update_rate>
    <plugin name="ultrasonic_plugin" filename="libultrasonic_plugin.so"/>
  </sensor>
</gazebo>
```

### Radar Simulation

**Simulated automotive radar** (simplified):

```xml
<link name="radar_link">
  <visual>
    <geometry>
      <box size="0.1 0.05 0.05"/>
    </geometry>
    <material name="gray">
      <color rgba="0.5 0.5 0.5 1"/>
    </material>
  </visual>
  <inertial>
    <mass value="0.3"/>
    <inertia ixx="0.00001" ixy="0" ixz="0" iyy="0.00001" iyz="0" izz="0.00001"/>
  </inertial>
</link>

<joint name="radar_joint" type="fixed">
  <parent link="base_link"/>
  <child link="radar_link"/>
  <origin xyz="0.35 0 0.1" rpy="0 0 0"/>
</joint>

<gazebo reference="radar_link">
  <sensor name="radar" type="ray">
    <ray>
      <scan>
        <horizontal>
          <samples>100</samples>
          <resolution>1</resolution>
          <min_angle>-0.52</min_angle>  <!-- -30° -->
          <max_angle>0.52</max_angle>   <!-- +30° -->
        </horizontal>
        <vertical>
          <samples>10</samples>
          <min_angle>-0.17</min_angle>  <!-- -10° -->
          <max_angle>0.17</max_angle>   <!-- +10° -->
        </vertical>
      </scan>
      <range>
        <min>1.0</min>
        <max>200.0</max>  <!-- 200m range -->
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

**Key radar properties**:
- Long range (50-300m)
- Lower angular resolution than LiDAR
- Works in fog, rain, darkness
- Doppler velocity (requires custom plugin)

### Thermal Camera

**Simulated thermal imaging**:

```xml
<gazebo reference="thermal_camera_link">
  <sensor name="thermal_camera" type="thermal">
    <update_rate>10</update_rate>

    <camera>
      <horizontal_fov>0.785</horizontal_fov>  <!-- 45° -->
      <image>
        <width>320</width>
        <height>240</height>
        <format>L8</format>  <!-- Grayscale for temperature -->
      </image>
      <clip>
        <near>0.1</near>
        <far>100</far>
      </clip>
    </camera>

    <!-- Temperature settings -->
    <thermal>
      <min_temp>253.15</min_temp>  <!-- -20°C in Kelvin -->
      <max_temp>323.15</max_temp>  <!-- +50°C in Kelvin -->
      <resolution>0.1</resolution>  <!-- 0.1K resolution -->
    </thermal>

    <plugin name="thermal_camera_plugin" filename="libgazebo_ros_thermal_camera.so">
      <ros>
        <remapping>~/image_raw:=thermal_camera/image_raw</remapping>
      </ros>
      <frame_name>thermal_camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**Use case**: Detecting people, hot machinery, fires.

### Sensor Fusion Architecture

**Multi-sensor localization** example:

```
Sensors:
  IMU (100 Hz) → Orientation, acceleration
  Wheel odometry (50 Hz) → Velocity estimate
  GPS (10 Hz) → Absolute position
  LiDAR (10 Hz) → Relative positioning

Fusion:
  robot_localization package (Extended Kalman Filter)
```

**Configuration** (config/ekf.yaml):

```yaml
ekf_filter_node:
  ros__parameters:
    frequency: 50.0
    sensor_timeout: 0.1

    # Frame names
    map_frame: map
    odom_frame: odom
    base_link_frame: base_link
    world_frame: odom

    # IMU input
    imu0: /robot/imu
    imu0_config: [false, false, false,    # x, y, z position
                  true,  true,  true,     # roll, pitch, yaw
                  false, false, false,    # x_dot, y_dot, z_dot
                  true,  true,  true,     # roll_dot, pitch_dot, yaw_dot
                  true,  true,  true]     # x_ddot, y_ddot, z_ddot

    # Wheel odometry input
    odom0: /wheel_odom
    odom0_config: [false, false, false,
                   false, false, false,
                   true,  true,  false,   # Use x_dot, y_dot
                   false, false, true,    # Use yaw_dot
                   false, false, false]

    # GPS input
    gps0: /robot/gps/fix
    gps0_config: [true,  true,  true,    # Use lat, lon, alt as x, y, z
                  false, false, false,
                  false, false, false,
                  false, false, false,
                  false, false, false]
```

**Launch sensor fusion**:

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='robot_localization',
            executable='ekf_node',
            name='ekf_filter_node',
            parameters=['config/ekf.yaml'],
            output='screen'
        ),
    ])
```

### Sensor Calibration

**Extrinsic calibration**: Sensor position/orientation relative to robot.

**Camera-LiDAR calibration** (example workflow):

1. **Collect calibration data**:
   - Checkerboard visible to both camera and LiDAR
   - Multiple poses

2. **Calibration tool**:
```bash
# Example using camera_lidar_calibration package
ros2 run camera_lidar_calibration calibrate \
  --camera_topic /camera/image_raw \
  --lidar_topic /scan \
  --board_size 8x6 \
  --square_size 0.05
```

3. **Update URDF** with calibrated transforms:

```xml
<joint name="lidar_joint" type="fixed">
  <parent link="base_link"/>
  <child link="lidar_link"/>
  <!-- Calibrated transform -->
  <origin xyz="0.201 0.003 0.152" rpy="0.002 -0.001 0.005"/>
</joint>
```

**Intrinsic calibration**: Camera internal parameters.

**Use camera_calibration package**:

```bash
ros2 run camera_calibration cameracalibrator \
  --size 8x6 \
  --square 0.05 \
  --no-service-check \
  image:=/camera/image_raw
```

**Update camera parameters**:

```xml
<camera>
  <horizontal_fov>1.047</horizontal_fov>
  <image>
    <width>640</width>
    <height>480</height>
  </image>

  <!-- Calibrated distortion -->
  <distortion>
    <k1>-0.2573</k1>
    <k2>0.0893</k2>
    <k3>0.0</k3>
    <p1>-0.0014</p1>
    <p2>0.0008</p2>
  </distortion>
</camera>
```

### Key Takeaways (Advanced)

✅ **Custom plugins** enable specialized sensors
✅ **Radar and thermal** for specific use cases
✅ **Sensor fusion** combines multiple sources for robust estimation
✅ **Calibration** ensures accurate sensor alignment
✅ **Advanced models** replicate real-world sensors

---

## Additional Resources

- [Gazebo Sensors](https://gazebosim.org/api/sensors/7/namespaceignition_1_1sensors.html)
- [gazebo_ros_pkgs Sensors](https://github.com/ros-simulation/gazebo_ros_pkgs/wiki)
- [ROS 2 Sensor Msgs](https://github.com/ros2/common_interfaces/tree/humble/sensor_msgs)
- [robot_localization](http://docs.ros.org/en/noetic/api/robot_localization/html/index.html)
- [camera_calibration](https://navigation.ros.org/tutorials/docs/camera_calibration.html)

---

**Next:** [Lab: Build Your Robot →](./04-lab-build-robot.md)
