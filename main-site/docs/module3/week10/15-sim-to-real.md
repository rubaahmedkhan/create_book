---
sidebar_position: 15
---

# Sim-to-Real Transfer Techniques

## Overview

Bridge the reality gap between simulation and physical robots using domain randomization, system identification, and sim-to-real transfer best practices in Isaac Sim.

## Learning Objectives

- Understand the sim-to-real gap
- Implement domain randomization
- Perform system identification
- Calibrate physics parameters
- Validate sim-to-real transfer
- Deploy policies from simulation to hardware

## Prerequisites

- Completed all previous Module 3 tutorials
- Access to physical robot (optional but recommended)
- Understanding of machine learning concepts

## The Sim-to-Real Gap

**Sources of discrepancy**:
1. **Physics modeling errors**: Friction, contact, dynamics
2. **Sensor noise and calibration**: Camera distortion, lidar accuracy
3. **Actuator dynamics**: Motor delays, backlash
4. **Environmental differences**: Lighting, textures, obstacles

**Goal**: Train in simulation, deploy on real robot with minimal performance degradation.

## Domain Randomization

### Visual Domain Randomization

```python
# visual_domain_randomization.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from omni.isaac.core.materials import PreviewSurface
from pxr import Gf, UsdLux
import numpy as np
import omni.usd

class VisualDomainRandomizer:
    """Randomize visual properties for robust sim-to-real."""

    def __init__(self):
        self.stage = omni.usd.get_context().get_stage()

    def randomize_lighting(self):
        """Randomize scene lighting."""

        dome_light = UsdLux.DomeLight.Get(self.stage, "/World/DomeLight")

        if dome_light:
            # Random intensity
            intensity = np.random.uniform(100, 1000)
            dome_light.CreateIntensityAttr(intensity)

            # Random color temperature
            temp = np.random.uniform(0.7, 1.3)
            color = Gf.Vec3f(temp, temp * 0.95, temp * 0.85)
            dome_light.CreateColorAttr(color)

    def randomize_object_appearance(self, prim_path):
        """Randomize object colors and materials."""

        material = PreviewSurface(
            prim_path=f"{prim_path}_material",
            color=np.random.rand(3),  # Random color
            roughness=np.random.uniform(0.1, 0.9),
            metallic=np.random.uniform(0.0, 1.0)
        )

    def randomize_camera(self, camera):
        """Add camera noise and distortion."""

        # Randomize exposure
        # ... (camera parameters)

        # Add Gaussian noise to images
        # ... (post-processing)

        pass

# Usage
world = World()
randomizer = VisualDomainRandomizer()

for episode in range(10):
    print(f"Episode {episode}: Randomizing environment")

    randomizer.randomize_lighting()

    # Run simulation
    world.reset()
    for i in range(100):
        world.step(render=True)

simulation_app.close()
```

### Physics Domain Randomization

```python
# physics_domain_randomization.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
from pxr import UsdPhysics, PhysxSchema
import numpy as np
import omni.usd

class PhysicsDomainRandomizer:
    """Randomize physics parameters."""

    def __init__(self):
        self.stage = omni.usd.get_context().get_stage()

    def randomize_mass(self, prim_path, mass_range=(0.5, 2.0)):
        """Randomize object mass."""

        prim = self.stage.GetPrimAtPath(prim_path)
        mass_api = UsdPhysics.MassAPI.Get(self.stage, prim_path)

        if mass_api:
            random_mass = np.random.uniform(*mass_range)
            mass_api.GetMassAttr().Set(random_mass)

    def randomize_friction(self, prim_path, friction_range=(0.2, 1.0)):
        """Randomize friction coefficients."""

        # Create/modify physics material
        material_path = f"{prim_path}_physics_material"
        material = UsdPhysics.MaterialAPI.Define(self.stage, material_path)

        static_friction = np.random.uniform(*friction_range)
        dynamic_friction = static_friction * np.random.uniform(0.7, 0.95)

        material.CreateStaticFrictionAttr(static_friction)
        material.CreateDynamicFrictionAttr(dynamic_friction)

    def randomize_joint_dynamics(self, robot_prim_path):
        """Randomize robot joint properties."""

        # Add damping variation
        damping_scale = np.random.uniform(0.5, 1.5)

        # Add friction variation
        friction_scale = np.random.uniform(0.8, 1.2)

        # ... (apply to joints)

    def randomize_time_delay(self, delay_range=(0.01, 0.05)):
        """Simulate actuator/sensor delays."""

        delay = np.random.uniform(*delay_range)
        # Implement delay in action execution
        return delay

# Usage
world = World()
randomizer = PhysicsDomainRandomizer()

# Create objects
cube = DynamicCuboid(
    prim_path="/World/Cube",
    position=np.array([0, 0, 2]),
    size=0.5
)
world.scene.add(cube)

for episode in range(10):
    # Randomize physics each episode
    randomizer.randomize_mass("/World/Cube", mass_range=(0.5, 3.0))
    randomizer.randomize_friction("/World/Cube", friction_range=(0.1, 1.2))

    world.reset()

    for i in range(200):
        world.step(render=True)

simulation_app.close()
```

### Comprehensive Domain Randomization

```python
# comprehensive_dr.py
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
import numpy as np

class ComprehensiveDR:
    """All-in-one domain randomization."""

    def __init__(self, world):
        self.world = world
        self.visual_dr = VisualDomainRandomizer()
        self.physics_dr = PhysicsDomainRandomizer()

    def randomize_all(self, object_paths):
        """Apply all randomizations."""

        # Visual
        self.visual_dr.randomize_lighting()

        for obj_path in object_paths:
            self.visual_dr.randomize_object_appearance(obj_path)

        # Physics
        for obj_path in object_paths:
            self.physics_dr.randomize_mass(obj_path)
            self.physics_dr.randomize_friction(obj_path)

        # Dynamics
        # ... (randomize gravity, air resistance, etc.)

        print("✓ Domain randomization applied")

# Training loop with DR
world = World()
dr = ComprehensiveDR(world)

for episode in range(1000):
    # Randomize environment
    dr.randomize_all(["/World/Cube", "/World/Box"])

    # Collect experience
    # ... (RL training)

    world.reset()

simulation_app.close()
```

## System Identification

### Identify Real Robot Parameters

```python
# system_identification.py
import numpy as np
from scipy.optimize import minimize

class RobotSystemID:
    """Identify robot dynamics parameters."""

    def __init__(self, sim_robot):
        self.sim_robot = sim_robot

    def collect_real_data(self, real_robot):
        """Collect trajectory data from real robot."""

        real_data = {
            'commands': [],  # Joint torque commands
            'positions': [], # Measured joint positions
            'velocities': [], # Measured joint velocities
            'accelerations': [] # Computed from velocities
        }

        # Execute test trajectory on real robot
        # ... (data collection)

        return real_data

    def simulate_trajectory(self, commands, params):
        """Simulate trajectory with given parameters."""

        # Set simulation parameters
        # ... (mass, inertia, friction, etc.)

        sim_data = {
            'positions': [],
            'velocities': [],
            'accelerations': []
        }

        # Run simulation
        # ... (execute commands and record)

        return sim_data

    def objective_function(self, params, real_data):
        """Compute error between sim and real."""

        sim_data = self.simulate_trajectory(real_data['commands'], params)

        # Position error
        pos_error = np.mean((real_data['positions'] - sim_data['positions'])**2)

        # Velocity error
        vel_error = np.mean((real_data['velocities'] - sim_data['velocities'])**2)

        total_error = pos_error + vel_error

        return total_error

    def identify_parameters(self, real_data):
        """Optimize parameters to match real robot."""

        # Initial parameter guess
        initial_params = {
            'link_masses': [1.0, 0.5, 0.3],  # kg
            'joint_damping': [0.1, 0.1, 0.1], # Nm/rad/s
            'joint_friction': [0.05, 0.05, 0.05] # Nm
        }

        # Flatten parameters
        x0 = np.concatenate([
            initial_params['link_masses'],
            initial_params['joint_damping'],
            initial_params['joint_friction']
        ])

        # Optimize
        result = minimize(
            lambda x: self.objective_function(self.unpack_params(x), real_data),
            x0,
            method='Powell'
        )

        identified_params = self.unpack_params(result.x)

        return identified_params

    def unpack_params(self, x):
        """Convert flat array to parameter dict."""
        n_links = 3
        return {
            'link_masses': x[0:n_links],
            'joint_damping': x[n_links:2*n_links],
            'joint_friction': x[2*n_links:3*n_links]
        }

# Usage
# 1. Collect data from real robot
# 2. Run system identification
# 3. Update simulation parameters
```

## Calibration Workflow

### Camera Calibration

```python
# camera_calibration.py
import numpy as np
import cv2

def calibrate_camera_to_sim(real_camera_params):
    """Match simulation camera to real camera."""

    # Real camera intrinsics from calibration
    real_fx = real_camera_params['fx']
    real_fy = real_camera_params['fy']
    real_cx = real_camera_params['cx']
    real_cy = real_camera_params['cy']

    # Distortion coefficients
    dist_coeffs = real_camera_params['distortion']

    # In Isaac Sim: set matching parameters
    from omni.isaac.sensor import Camera

    camera = Camera(
        prim_path="/World/Camera",
        resolution=(real_camera_params['width'], real_camera_params['height'])
    )

    # Compute focal length from fx
    sensor_width = 20.955  # mm (full-frame sensor)
    focal_length_mm = (real_fx * sensor_width) / real_camera_params['width']

    camera.set_focal_length(focal_length_mm)
    camera.set_horizontal_aperture(sensor_width)

    print(f"✓ Camera calibrated to match real sensor")
    print(f"  Focal length: {focal_length_mm:.2f}mm")
    print(f"  Intrinsics: fx={real_fx}, fy={real_fy}")

    return camera
```

### Lidar Calibration

```python
# lidar_calibration.py
def calibrate_lidar_to_sim(real_lidar_params):
    """Match simulation lidar to real sensor."""

    # Real lidar parameters
    min_range = real_lidar_params['min_range']  # meters
    max_range = real_lidar_params['max_range']
    fov = real_lidar_params['fov']  # degrees
    resolution = real_lidar_params['angular_resolution']  # degrees

    # Configure simulation lidar
    # ... (set parameters to match)

    print(f"✓ Lidar calibrated")
    print(f"  Range: [{min_range}, {max_range}]m")
    print(f"  FOV: {fov}°")
    print(f"  Resolution: {resolution}°")
```

## Validation and Testing

### Sim-to-Real Validation Protocol

```python
# sim_to_real_validation.py

class SimToRealValidator:
    """Validate sim-to-real transfer quality."""

    def __init__(self, sim_env, real_env):
        self.sim_env = sim_env
        self.real_env = real_env

    def validate_task(self, policy, num_trials=10):
        """Test policy in both sim and real."""

        # Test in simulation
        sim_results = []
        for _ in range(num_trials):
            success, reward = self.run_episode(self.sim_env, policy)
            sim_results.append({'success': success, 'reward': reward})

        # Test on real robot
        real_results = []
        for _ in range(num_trials):
            success, reward = self.run_episode(self.real_env, policy)
            real_results.append({'success': success, 'reward': reward})

        # Compute metrics
        sim_success_rate = np.mean([r['success'] for r in sim_results])
        real_success_rate = np.mean([r['success'] for r in real_results])

        transfer_gap = sim_success_rate - real_success_rate

        print(f"Validation Results:")
        print(f"  Sim success rate: {sim_success_rate*100:.1f}%")
        print(f"  Real success rate: {real_success_rate*100:.1f}%")
        print(f"  Transfer gap: {transfer_gap*100:.1f}%")

        return {
            'sim_success': sim_success_rate,
            'real_success': real_success_rate,
            'transfer_gap': transfer_gap
        }

    def run_episode(self, env, policy):
        """Execute one episode."""
        # ... (implementation depends on environment)
        return True, 100.0
```

## Best Practices

### Sim-to-Real Checklist

- [ ] **Physics calibration**: Mass, inertia, friction matched
- [ ] **Sensor calibration**: Camera intrinsics, lidar parameters matched
- [ ] **Actuator modeling**: Delays, limits, dynamics characterized
- [ ] **Domain randomization**: Visual and physics DR applied
- [ ] **Safety testing**: Gradual deployment with safety checks
- [ ] **Performance monitoring**: Track sim vs real metrics
- [ ] **Iterative refinement**: Update sim based on real failures

## Summary

- ✓ Understood sim-to-real gap sources
- ✓ Implemented visual and physics domain randomization
- ✓ Performed system identification
- ✓ Calibrated sensors to match hardware
- ✓ Validated transfer with metrics

## Next Steps

Complete the final [Capstone: Autonomous Navigation](./16-capstone-isaac.md) project.

## Additional Resources

- [Domain Randomization for Transferring Deep Neural Networks](https://arxiv.org/abs/1703.06907)
- [Sim-to-Real Transfer in Robotics](https://lilianweng.github.io/posts/2019-05-05-domain-randomization/)
- [System Identification Tutorial](https://www.mathworks.com/help/ident/gs/about-system-identification.html)
