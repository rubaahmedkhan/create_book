---
sidebar_position: 1
---

# Isaac Sim Installation and Setup

## Overview

NVIDIA Isaac Sim is a scalable robotics simulation application and synthetic data generation tool built on NVIDIA Omniverse. This tutorial guides you through installing and configuring Isaac Sim for robot development and testing.

## Learning Objectives

- Install NVIDIA Isaac Sim and required dependencies
- Configure GPU drivers and CUDA toolkit
- Verify installation with sample scenes
- Understand Isaac Sim workspace organization
- Configure performance settings for optimal simulation

## Prerequisites

### Hardware Requirements

- **GPU**: NVIDIA RTX GPU (RTX 2070 or higher recommended)
  - Minimum: GTX 1660 or higher
  - Recommended: RTX 3070 or higher for real-time ray tracing
- **CPU**: Intel Core i7 or AMD Ryzen 7 (or higher)
- **RAM**: 32 GB minimum (64 GB recommended)
- **Storage**: 50 GB free space (SSD strongly recommended)
- **OS**: Ubuntu 20.04/22.04 or Windows 10/11

### Software Prerequisites

- NVIDIA GPU Driver 525.60.11 or later
- Docker (for Linux containerized deployment)
- Python 3.7 or later

## Installation Methods

Isaac Sim offers multiple installation methods. Choose based on your needs:

1. **Omniverse Launcher** (Recommended for beginners)
2. **Docker Container** (Recommended for Linux/production)
3. **Pip Installation** (For Python developers)
4. **Workstation Installation** (Native installation)

## Method 1: Omniverse Launcher Installation (Recommended)

### Step 1: Install NVIDIA Graphics Drivers

```bash
# Ubuntu - Check current driver version
nvidia-smi

# If driver needs updating
sudo apt update
sudo apt install nvidia-driver-535

# Reboot after driver installation
sudo reboot
```

For Windows, download drivers from [NVIDIA Driver Downloads](https://www.nvidia.com/Download/index.aspx).

### Step 2: Download Omniverse Launcher

1. Visit [NVIDIA Omniverse](https://www.nvidia.com/en-us/omniverse/)
2. Click "Download" and create/login to NVIDIA account
3. Download the launcher for your OS

```bash
# Ubuntu - Install Omniverse Launcher
chmod +x omniverse-launcher-linux.AppImage
./omniverse-launcher-linux.AppImage
```

### Step 3: Install Isaac Sim via Launcher

1. Launch Omniverse Launcher
2. Navigate to **Exchange** tab
3. Search for "Isaac Sim"
4. Click **Install** on "Isaac Sim" (latest version)
5. Wait for installation (approximately 15-20 minutes)

```bash
# Default installation paths:
# Linux: ~/.local/share/ov/pkg/isaac_sim-2023.1.1
# Windows: C:\Users\[username]\AppData\Local\ov\pkg\isaac_sim-2023.1.1
```

### Step 4: Configure Cache and Logging

```bash
# Linux - Set cache directory (recommended for faster loading)
mkdir -p ~/.nvidia-omniverse/cache
export OMNI_CACHE_DIR=~/.nvidia-omniverse/cache

# Add to ~/.bashrc for persistence
echo 'export OMNI_CACHE_DIR=~/.nvidia-omniverse/cache' >> ~/.bashrc
```

## Method 2: Docker Container Installation (Linux)

### Step 1: Install Docker and NVIDIA Container Toolkit

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt update
sudo apt install -y nvidia-container-toolkit
sudo systemctl restart docker

# Verify installation
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

### Step 2: Pull Isaac Sim Docker Image

```bash
# Login to NVIDIA NGC
docker login nvcr.io
# Username: $oauthtoken
# Password: [Your NGC API Key from ngc.nvidia.com]

# Pull Isaac Sim container
docker pull nvcr.io/nvidia/isaac-sim:2023.1.1

# Verify image
docker images | grep isaac-sim
```

### Step 3: Run Isaac Sim Container

```bash
# Create workspace directory
mkdir -p ~/isaac-sim-workspace

# Run container with GUI support
docker run --name isaac-sim --entrypoint bash -it --gpus all \
  -e "ACCEPT_EULA=Y" \
  -e "PRIVACY_CONSENT=Y" \
  -v ~/docker/isaac-sim/cache/kit:/isaac-sim/kit/cache:rw \
  -v ~/docker/isaac-sim/cache/ov:/root/.cache/ov:rw \
  -v ~/docker/isaac-sim/cache/pip:/root/.cache/pip:rw \
  -v ~/docker/isaac-sim/cache/glcache:/root/.cache/nvidia/GLCache:rw \
  -v ~/docker/isaac-sim/cache/computecache:/root/.nv/ComputeCache:rw \
  -v ~/docker/isaac-sim/logs:/root/.nvidia-omniverse/logs:rw \
  -v ~/docker/isaac-sim/data:/root/.local/share/ov/data:rw \
  -v ~/isaac-sim-workspace:/workspace:rw \
  --network=host \
  nvcr.io/nvidia/isaac-sim:2023.1.1

# Inside container - launch Isaac Sim
./runapp.sh
```

## Method 3: Pip Installation

```bash
# Create Python virtual environment
python3 -m venv isaac-sim-venv
source isaac-sim-venv/bin/activate

# Install Isaac Sim Python package
pip install isaacsim==2023.1.1 --extra-index-url https://pypi.nvidia.com

# Verify installation
python -c "from isaacsim import SimulationApp; print('Isaac Sim installed successfully')"
```

## Verifying Installation

### Launch Isaac Sim

```bash
# Via Omniverse Launcher
# Click "Launch" button in Library tab

# Via command line (Omniverse installation)
cd ~/.local/share/ov/pkg/isaac_sim-2023.1.1
./isaac-sim.sh

# Via Docker
docker exec -it isaac-sim ./runapp.sh

# Via Python
python -m isaacsim
```

### Load Sample Scene

1. **File** → **Open**
2. Navigate to: `Isaac/Samples/Isaac_Sim/Scenario/simple_room.usd`
3. Click **Open**
4. Press **Play** button (or spacebar) to start simulation

Expected result: A simple room with basic objects falling due to gravity.

### Check Performance Metrics

```python
# Enable FPS counter
# Window → Utilities → Statistics
# Check Physics and Rendering FPS

# Recommended performance targets:
# - Physics FPS: 60+
# - Rendering FPS: 30+
```

## Workspace Organization

### Isaac Sim Directory Structure

```
isaac_sim-2023.1.1/
├── apps/                    # Application configurations
├── exts/                    # Extensions and plugins
│   └── omni.isaac.*/       # Isaac-specific extensions
├── kit/                     # Kit SDK files
├── python_packages/         # Python dependencies
├── standalone_examples/     # Python example scripts
│   ├── api/                # API usage examples
│   └── tutorials/          # Tutorial scripts
├── tools/                   # Utility tools
├── isaac-sim.sh            # Launch script (Linux)
└── isaac-sim.bat           # Launch script (Windows)
```

### Recommended Project Structure

```bash
# Create organized workspace
mkdir -p ~/isaac-projects
cd ~/isaac-projects

# Create project folders
mkdir -p my_robot_project/{scenes,scripts,assets,configs}

# Example structure:
my_robot_project/
├── scenes/          # USD scene files
├── scripts/         # Python automation scripts
├── assets/          # Robot models, textures
├── configs/         # Configuration files
└── README.md        # Project documentation
```

## Configuration and Optimization

### Performance Settings

1. **Open Settings**: Edit → Preferences → Isaac Sim

```python
# Recommended settings for development:
{
    "Physics": {
        "updateToUsd": True,
        "useFastCache": True,
        "gpuDynamics": True
    },
    "Renderer": {
        "mode": "RayTracing",  # Use PathTracing for final renders
        "samples_per_pixel": 1,
        "max_bounces": 4,
        "async_rendering": True
    },
    "Viewport": {
        "defaultResolution": [1920, 1080],
        "antiAliasing": "FXAA"
    }
}
```

### Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc

# Isaac Sim installation path
export ISAAC_SIM_PATH=~/.local/share/ov/pkg/isaac_sim-2023.1.1

# Python path for scripting
export PYTHONPATH=$PYTHONPATH:$ISAAC_SIM_PATH
export PYTHONPATH=$PYTHONPATH:$ISAAC_SIM_PATH/exts/omni.isaac.core

# Performance optimizations
export OMNI_CACHE_DIR=~/.nvidia-omniverse/cache
export CARB_LOGGING_LEVEL=2  # Reduce verbose logging

# GPU selection (if multiple GPUs)
export CUDA_VISIBLE_DEVICES=0

# Reload configuration
source ~/.bashrc
```

### Extension Manager

Enable useful extensions:

1. **Window** → **Extensions**
2. Enable these extensions:
   - ✓ omni.isaac.core
   - ✓ omni.isaac.sensor
   - ✓ omni.isaac.robot_assembler
   - ✓ omni.isaac.wheeled_robots
   - ✓ omni.isaac.ros2_bridge

## Hands-On Exercises

### Exercise 1: Verify GPU Acceleration

```python
# Create: ~/isaac-projects/test_gpu.py
from isaacsim import SimulationApp

simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicCuboid
import carb

# Get GPU info
gpu_info = carb.settings.get_settings().get("/renderer/activeGpu")
print(f"Active GPU: {gpu_info}")

# Create world with GPU physics
world = World(stage_units_in_meters=1.0, physics_dt=1.0/60.0, rendering_dt=1.0/60.0)

# Add multiple cubes to test performance
for i in range(100):
    cube = DynamicCuboid(
        prim_path=f"/World/Cube_{i}",
        position=[i % 10, i // 10, 5.0],
        size=0.5,
        color=[1.0, 0.0, 0.0]
    )
    world.scene.add(cube)

world.reset()

# Run simulation
for i in range(300):
    world.step(render=True)
    if i % 60 == 0:
        print(f"Simulated {i/60:.1f} seconds")

simulation_app.close()
```

Run the script:
```bash
cd ~/isaac-projects
$ISAAC_SIM_PATH/python.sh test_gpu.py
```

### Exercise 2: Benchmark Performance

```python
# Create: ~/isaac-projects/benchmark.py
from isaacsim import SimulationApp
import time

simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.objects import DynamicSphere
import numpy as np

world = World(stage_units_in_meters=1.0)

# Create stress test with many objects
num_objects = 500
print(f"Creating {num_objects} physics objects...")

for i in range(num_objects):
    x = (i % 25) * 0.5
    y = (i // 25) * 0.5
    z = 2.0 + np.random.random() * 3.0

    sphere = DynamicSphere(
        prim_path=f"/World/Sphere_{i}",
        position=[x, y, z],
        radius=0.1
    )
    world.scene.add(sphere)

world.reset()

# Benchmark
start_time = time.time()
frames = 300

print("Running benchmark...")
for i in range(frames):
    world.step(render=True)

elapsed = time.time() - start_time
avg_fps = frames / elapsed

print(f"\nBenchmark Results:")
print(f"Total time: {elapsed:.2f} seconds")
print(f"Average FPS: {avg_fps:.2f}")
print(f"Objects: {num_objects}")

simulation_app.close()
```

### Exercise 3: Explore Sample Scenes

```bash
# List all sample scenes
find $ISAAC_SIM_PATH -name "*.usd" | grep -i sample

# Open each sample to understand different features:
# 1. Simple Room - Basic physics
# 2. Warehouse - Complex environment
# 3. Carter Robot - Mobile robot
# 4. Franka Robot - Manipulation
```

## Troubleshooting Common Issues

### Issue 1: "GPU not found" or Poor Performance

**Symptoms**: Low FPS, CPU rendering, no GPU acceleration

**Solutions**:
```bash
# Check NVIDIA driver
nvidia-smi

# Should show driver version 525.60.11 or higher
# If not, update driver:
sudo apt update
sudo apt install nvidia-driver-535
sudo reboot

# Verify CUDA
nvcc --version

# Check GPU in Isaac Sim
# Window → Rendering → Settings
# Verify GPU is listed and selected
```

### Issue 2: Failed to Load USD Files

**Symptoms**: Error loading scenes, missing assets

**Solutions**:
```bash
# Clear cache
rm -rf ~/.nvidia-omniverse/cache/*

# Check Nucleus server connection
# Window → Omniverse → Nucleus
# Ensure localhost connection is active

# Re-download assets
# Window → Content → Isaac → Samples
# Right-click → Redownload
```

### Issue 3: Python Import Errors

**Symptoms**: `ModuleNotFoundError: No module named 'omni'`

**Solutions**:
```bash
# Use Isaac Sim's Python interpreter
$ISAAC_SIM_PATH/python.sh your_script.py

# NOT system Python:
python your_script.py  # This won't work

# For development, configure IDE:
# PyCharm: Settings → Project → Python Interpreter
# Add: $ISAAC_SIM_PATH/python.sh

# VSCode: .vscode/settings.json
{
    "python.defaultInterpreterPath": "${env:ISAAC_SIM_PATH}/python.sh"
}
```

### Issue 4: Docker Display Issues

**Symptoms**: GUI doesn't appear in Docker container

**Solutions**:
```bash
# Enable X11 forwarding
xhost +local:docker

# Run container with display
docker run -it --gpus all \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix:rw \
  --network=host \
  nvcr.io/nvidia/isaac-sim:2023.1.1

# For headless rendering (no GUI needed)
docker run -it --gpus all \
  -e HEADLESS=1 \
  nvcr.io/nvidia/isaac-sim:2023.1.1
```

### Issue 5: Slow Loading Times

**Symptoms**: Isaac Sim takes minutes to start

**Solutions**:
```bash
# Enable shader cache
export OMNI_CACHE_DIR=~/.nvidia-omniverse/cache
mkdir -p $OMNI_CACHE_DIR

# Use SSD for cache directory
# Move cache to SSD if on HDD

# Disable unnecessary extensions
# Window → Extensions → Third Party
# Disable unused extensions

# Use headless mode for scripts
simulation_app = SimulationApp({"headless": True})
```

## Summary

You've successfully:
- ✓ Installed NVIDIA Isaac Sim using your preferred method
- ✓ Configured GPU drivers and performance settings
- ✓ Verified installation with sample scenes
- ✓ Organized your workspace for development
- ✓ Learned troubleshooting techniques for common issues

**Key Takeaways**:
- Isaac Sim requires NVIDIA RTX GPU for optimal performance
- Multiple installation methods available (Launcher, Docker, Pip)
- Proper configuration is critical for performance
- Use Isaac Sim's Python interpreter for scripting
- Cache configuration significantly improves loading times

## Next Steps

Continue to [Creating Your First Robot Simulation](./02-first-simulation.md) to learn how to:
- Load and manipulate robot models
- Configure physics properties
- Add sensors and actuators
- Run basic simulations
- Record and analyze simulation data

## Additional Resources

- [Isaac Sim Documentation](https://docs.omniverse.nvidia.com/isaacsim/latest/index.html)
- [Omniverse Documentation](https://docs.omniverse.nvidia.com/)
- [Isaac Sim Forum](https://forums.developer.nvidia.com/c/omniverse/simulation/69)
- [Isaac Sim GitHub Examples](https://github.com/NVIDIA-Omniverse/IsaacSimExamples)
- [NGC Container Registry](https://ngc.nvidia.com/catalog/containers/nvidia:isaac-sim)
