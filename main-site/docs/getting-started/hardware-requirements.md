---
sidebar_position: 2
---

# Hardware Requirements

This course has varying computational requirements depending on the module.

## Three Deployment Paths

### 1. Local Development (Recommended)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU** | RTX 3060 (8GB VRAM) | RTX 4070 Ti (12GB VRAM) |
| **CPU** | Intel i7 13th Gen | AMD Ryzen 9 |
| **RAM** | 32 GB DDR5 | 64 GB DDR5 |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| **Storage** | 250 GB SSD | 500 GB NVMe |

### 2. Cloud Instances

- **AWS g5.2xlarge**: ~$1.00/hour
- **Estimated cost**: $200-250/quarter (10 hours/week)
- **Ubuntu 22.04 LTS** required

### 3. Edge Deployment

- **NVIDIA Jetson Orin Nano** (8GB): ~$250
- For Module 3-4 (Isaac Sim, VLA)
- Lower performance but good for learning

## Module-Specific Requirements

- **Module 1-2**: Can run on integrated graphics (limited)
- **Module 3**: Requires RTX GPU or cloud instance
- **Module 4**: RTX GPU strongly recommended for real-time VLA
