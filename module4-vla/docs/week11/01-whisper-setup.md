---
sidebar_position: 1
---

# OpenAI Whisper Setup and Installation

## Overview

OpenAI Whisper is a state-of-the-art automatic speech recognition (ASR) system trained on 680,000 hours of multilingual data. This tutorial covers setting up Whisper for robotics applications, focusing on real-time voice command processing for humanoid robots.

## Learning Objectives

- Understand Whisper model architecture and available model sizes
- Install and configure Whisper for optimal performance
- Select appropriate models based on hardware constraints
- Implement basic speech-to-text functionality
- Benchmark model performance for real-time robotics applications

## Prerequisites

- Ubuntu 22.04 or compatible Linux distribution
- Python 3.8 or higher
- NVIDIA GPU with CUDA support (recommended for real-time processing)
- Basic Python programming knowledge
- 8GB+ RAM (16GB recommended for larger models)

## Introduction to Whisper

Whisper is a Transformer-based encoder-decoder model that can perform:
- Multilingual speech recognition (99 languages)
- Speech translation to English
- Language identification
- Voice activity detection
- Timestamp generation

### Model Sizes and Performance

| Model | Parameters | VRAM Required | Relative Speed | WER (English) |
|-------|-----------|---------------|----------------|---------------|
| tiny | 39M | ~1 GB | ~32x | ~5.0% |
| base | 74M | ~1 GB | ~16x | ~3.0% |
| small | 244M | ~2 GB | ~6x | ~2.5% |
| medium | 769M | ~5 GB | ~2x | ~2.0% |
| large | 1550M | ~10 GB | 1x | ~1.8% |
| large-v2 | 1550M | ~10 GB | 1x | ~1.6% |
| large-v3 | 1550M | ~10 GB | 1x | ~1.4% |

**For robotics applications:**
- **Real-time control**: Use `tiny` or `base` models
- **Balanced performance**: Use `small` model
- **High accuracy**: Use `medium` or `large-v3` models

## Installation

### Step 1: System Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install system dependencies
sudo apt install -y \
    python3-pip \
    python3-venv \
    ffmpeg \
    portaudio19-dev \
    python3-pyaudio \
    git

# Verify ffmpeg installation
ffmpeg -version
```

### Step 2: Create Python Virtual Environment

```bash
# Create dedicated environment for Whisper
cd ~/robotics_ws
python3 -m venv whisper_env
source whisper_env/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel
```

### Step 3: Install PyTorch with CUDA Support

```bash
# For CUDA 11.8 (check your CUDA version with: nvidia-smi)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# For CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# For CPU-only (not recommended for real-time use)
pip install torch torchvision torchaudio
```

### Step 4: Install Whisper

```bash
# Install official OpenAI Whisper
pip install openai-whisper

# Install faster-whisper (optimized implementation)
pip install faster-whisper

# Install additional dependencies
pip install numpy scipy soundfile librosa
```

### Step 5: Verify Installation

```python
# Create test script: test_whisper.py
import whisper
import torch

print(f"Whisper version: {whisper.__version__}")
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

# List available models
available_models = whisper.available_models()
print(f"\nAvailable models: {available_models}")
```

Run the test:

```bash
python test_whisper.py
```

Expected output:
```
Whisper version: 20231117
PyTorch version: 2.1.0+cu118
CUDA available: True
CUDA version: 11.8
GPU: NVIDIA GeForce RTX 3080
GPU Memory: 10.00 GB

Available models: ['tiny.en', 'tiny', 'base.en', 'base', 'small.en', 'small', 'medium.en', 'medium', 'large-v1', 'large-v2', 'large-v3']
```

## Basic Usage Examples

### Example 1: Transcribe Audio File

```python
import whisper

# Load model (downloads on first use)
model = whisper.load_model("base")

# Transcribe audio file
result = model.transcribe("audio.wav")

# Print results
print(f"Detected language: {result['language']}")
print(f"Text: {result['text']}")

# Access segments with timestamps
for segment in result['segments']:
    print(f"[{segment['start']:.2f}s -> {segment['end']:.2f}s] {segment['text']}")
```

### Example 2: Using faster-whisper for Better Performance

```python
from faster_whisper import WhisperModel

# Initialize model with optimizations
model = WhisperModel(
    "base",
    device="cuda",
    compute_type="float16"  # Use float16 for faster inference
)

# Transcribe with options
segments, info = model.transcribe(
    "audio.wav",
    beam_size=5,
    language="en",
    condition_on_previous_text=False
)

print(f"Detected language '{info.language}' with probability {info.language_probability}")

for segment in segments:
    print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
```

### Example 3: Real-time Audio Processing

```python
import whisper
import numpy as np
import sounddevice as sd
from scipy.io.wavfile import write

def record_audio(duration=5, sample_rate=16000):
    """Record audio from microphone"""
    print(f"Recording for {duration} seconds...")
    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype='float32'
    )
    sd.wait()
    return audio.flatten()

def transcribe_audio(audio_data, model):
    """Transcribe audio data"""
    # Whisper expects audio normalized to [-1, 1]
    audio_data = np.clip(audio_data, -1.0, 1.0)

    # Transcribe
    result = model.transcribe(
        audio_data,
        fp16=torch.cuda.is_available(),
        language="en"
    )

    return result['text']

# Main
model = whisper.load_model("base")

while True:
    input("Press Enter to record (Ctrl+C to quit)...")
    audio = record_audio(duration=3)
    text = transcribe_audio(audio, model)
    print(f"Transcription: {text}")
```

## Performance Optimization

### GPU Optimization

```python
import whisper
import torch

# Load model with optimizations
model = whisper.load_model(
    "base",
    device="cuda",
    download_root="./models"  # Cache models locally
)

# Enable TF32 for better performance on Ampere GPUs
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True

# Set optimal batch size
torch.cuda.set_per_process_memory_fraction(0.8)  # Use 80% of GPU memory

# Transcribe with optimizations
result = model.transcribe(
    "audio.wav",
    fp16=True,  # Use half-precision
    language="en",  # Skip language detection
    beam_size=5,  # Balance speed vs accuracy
    best_of=5,
    temperature=0.0  # Deterministic output
)
```

### CPU Optimization

```python
import torch
from faster_whisper import WhisperModel

# Set thread count for CPU inference
torch.set_num_threads(4)

# Use optimized model
model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"  # Quantized model for faster CPU inference
)

# Transcribe
segments, info = model.transcribe(
    "audio.wav",
    beam_size=1,  # Greedy decoding for speed
    language="en"
)
```

## Hands-on Exercises

### Exercise 1: Model Benchmarking

Create a script to benchmark different Whisper models on your hardware.

```python
import whisper
import time
import torch

def benchmark_model(model_name, audio_file="test_audio.wav"):
    """Benchmark a Whisper model"""
    print(f"\nBenchmarking {model_name}...")

    # Load model and measure loading time
    start = time.time()
    model = whisper.load_model(model_name)
    load_time = time.time() - start

    # Warm up
    _ = model.transcribe(audio_file, fp16=torch.cuda.is_available())

    # Benchmark transcription
    start = time.time()
    result = model.transcribe(audio_file, fp16=torch.cuda.is_available())
    transcribe_time = time.time() - start

    # Get GPU memory if available
    gpu_memory = 0
    if torch.cuda.is_available():
        gpu_memory = torch.cuda.max_memory_allocated() / 1e9
        torch.cuda.reset_peak_memory_stats()

    return {
        'model': model_name,
        'load_time': load_time,
        'transcribe_time': transcribe_time,
        'gpu_memory_gb': gpu_memory,
        'text': result['text']
    }

# Test models
models = ['tiny', 'base', 'small']
results = []

for model_name in models:
    result = benchmark_model(model_name)
    results.append(result)
    print(f"Load time: {result['load_time']:.2f}s")
    print(f"Transcribe time: {result['transcribe_time']:.2f}s")
    print(f"GPU memory: {result['gpu_memory_gb']:.2f} GB")
```

**Task**: Run this benchmark and document which model is best for real-time robotics control (target < 300ms latency).

### Exercise 2: Audio Preprocessing

Implement audio preprocessing to improve recognition accuracy.

```python
import numpy as np
from scipy import signal
import soundfile as sf

def preprocess_audio(audio_data, sample_rate=16000):
    """Preprocess audio for better recognition"""

    # 1. Normalize audio
    audio_data = audio_data / np.max(np.abs(audio_data))

    # 2. High-pass filter to remove low-frequency noise
    sos = signal.butter(10, 80, 'hp', fs=sample_rate, output='sos')
    audio_data = signal.sosfilt(sos, audio_data)

    # 3. Apply noise gate
    threshold = 0.01
    audio_data[np.abs(audio_data) < threshold] = 0

    # 4. Resample to 16kHz if needed (Whisper requirement)
    if sample_rate != 16000:
        num_samples = int(len(audio_data) * 16000 / sample_rate)
        audio_data = signal.resample(audio_data, num_samples)

    return audio_data

# Test
audio, sr = sf.read("noisy_audio.wav")
processed = preprocess_audio(audio, sr)
sf.write("processed_audio.wav", processed, 16000)
```

**Task**: Record audio in a noisy environment and compare recognition accuracy with and without preprocessing.

### Exercise 3: Language Detection

Implement automatic language detection for multilingual environments.

```python
import whisper

def detect_and_transcribe(audio_file):
    """Detect language and transcribe"""
    model = whisper.load_model("base")

    # Detect language using first 30 seconds
    audio = whisper.load_audio(audio_file)
    audio = whisper.pad_or_trim(audio)

    mel = whisper.log_mel_spectrogram(audio).to(model.device)
    _, probs = model.detect_language(mel)

    detected_lang = max(probs, key=probs.get)
    confidence = probs[detected_lang]

    print(f"Detected language: {detected_lang} (confidence: {confidence:.2f})")

    # Transcribe in detected language
    result = model.transcribe(audio_file, language=detected_lang)

    return {
        'language': detected_lang,
        'confidence': confidence,
        'text': result['text']
    }

# Test
result = detect_and_transcribe("multilingual_audio.wav")
print(f"Text: {result['text']}")
```

**Task**: Test with audio in different languages (English, Spanish, French, etc.).

## Troubleshooting Common Issues

### Issue 1: CUDA Out of Memory

**Symptom**: `RuntimeError: CUDA out of memory`

**Solutions**:
```python
# Option 1: Use smaller model
model = whisper.load_model("tiny")  # Instead of "large"

# Option 2: Clear cache
import torch
torch.cuda.empty_cache()

# Option 3: Reduce batch processing
result = model.transcribe(
    audio,
    fp16=True,
    condition_on_previous_text=False  # Reduces memory usage
)
```

### Issue 2: Slow Transcription

**Symptom**: Transcription takes > 5 seconds for 3-second audio

**Solutions**:
```python
# Use faster-whisper
from faster_whisper import WhisperModel

model = WhisperModel("base", device="cuda", compute_type="float16")

# Optimize parameters
segments, info = model.transcribe(
    audio,
    beam_size=1,  # Greedy decoding (faster)
    language="en",  # Skip detection
    vad_filter=True  # Skip silence
)
```

### Issue 3: Poor Recognition Accuracy

**Symptom**: Incorrect transcriptions

**Solutions**:
```python
# 1. Use larger model
model = whisper.load_model("medium")

# 2. Increase beam size
result = model.transcribe(audio, beam_size=10)

# 3. Set correct language
result = model.transcribe(audio, language="en")

# 4. Improve audio quality (see Exercise 2)
```

### Issue 4: ffmpeg Not Found

**Symptom**: `FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'`

**Solution**:
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# Verify installation
which ffmpeg
ffmpeg -version
```

## Best Practices and Safety Considerations

### 1. Model Selection for Robotics

```python
class RoboticsWhisperConfig:
    """Configuration for robotics applications"""

    # Real-time control (< 200ms latency requirement)
    REALTIME_CONTROL = {
        'model': 'tiny',
        'device': 'cuda',
        'fp16': True,
        'beam_size': 1,
        'language': 'en'
    }

    # High accuracy (< 1s latency acceptable)
    HIGH_ACCURACY = {
        'model': 'small',
        'device': 'cuda',
        'fp16': True,
        'beam_size': 5,
        'language': None  # Auto-detect
    }

    # Offline processing
    OFFLINE = {
        'model': 'large-v3',
        'device': 'cuda',
        'fp16': True,
        'beam_size': 10,
        'language': None
    }
```

### 2. Error Handling

```python
def safe_transcribe(audio_file, model, max_retries=3):
    """Transcribe with error handling"""
    for attempt in range(max_retries):
        try:
            result = model.transcribe(audio_file)

            # Validate result
            if not result['text'].strip():
                raise ValueError("Empty transcription")

            return result['text']

        except torch.cuda.OutOfMemoryError:
            print(f"OOM error, attempt {attempt + 1}/{max_retries}")
            torch.cuda.empty_cache()

        except Exception as e:
            print(f"Error: {e}, attempt {attempt + 1}/{max_retries}")
            if attempt == max_retries - 1:
                raise

    return None
```

### 3. Safety Constraints

```python
class SafetyChecker:
    """Validate voice commands for safety"""

    FORBIDDEN_COMMANDS = [
        'shutdown', 'kill', 'destroy', 'attack'
    ]

    MAX_VELOCITY_COMMANDS = [
        'fast', 'quickly', 'hurry', 'rush'
    ]

    @staticmethod
    def is_safe_command(text):
        """Check if command is safe"""
        text_lower = text.lower()

        # Check for forbidden words
        for word in SafetyChecker.FORBIDDEN_COMMANDS:
            if word in text_lower:
                print(f"WARNING: Forbidden command detected: {word}")
                return False

        # Flag high-velocity commands
        for word in SafetyChecker.MAX_VELOCITY_COMMANDS:
            if word in text_lower:
                print(f"CAUTION: High-velocity command: {word}")
                # Could limit speed or require confirmation

        return True

# Usage
text = transcribe_audio(audio, model)
if SafetyChecker.is_safe_command(text):
    execute_robot_command(text)
else:
    print("Command rejected for safety")
```

### 4. Resource Management

```python
class WhisperManager:
    """Manage Whisper model lifecycle"""

    def __init__(self, model_name="base"):
        self.model_name = model_name
        self.model = None

    def __enter__(self):
        """Load model"""
        self.model = whisper.load_model(self.model_name)
        return self.model

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Cleanup resources"""
        del self.model
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

# Usage
with WhisperManager("base") as model:
    result = model.transcribe("audio.wav")
    print(result['text'])
# Model automatically cleaned up
```

## Summary

In this tutorial, you learned:

- ✅ Whisper model architecture and available sizes
- ✅ Installation and setup for robotics applications
- ✅ Model selection based on latency and accuracy requirements
- ✅ Basic and advanced transcription techniques
- ✅ Performance optimization for GPU and CPU
- ✅ Error handling and safety considerations
- ✅ Best practices for production deployment

**Key Takeaways**:
- For real-time robot control, use `tiny` or `base` models
- Always implement safety checks on voice commands
- Use `faster-whisper` for production deployments
- Monitor GPU memory and implement proper error handling
- Preprocess audio to improve accuracy in noisy environments

## Next Steps

Continue to **[Audio Capture and Preprocessing](./02-audio-capture.md)** to learn:
- Real-time audio capture from multiple sources
- Advanced noise reduction techniques
- Voice Activity Detection (VAD)
- Audio streaming and buffering strategies
- Integration with ROS 2 audio topics

## Additional Resources

- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [faster-whisper Documentation](https://github.com/guillaumekln/faster-whisper)
- [Whisper Model Card](https://github.com/openai/whisper/blob/main/model-card.md)
- [PyTorch CUDA Optimization Guide](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html)
- [Audio Processing with Python](https://realpython.com/python-scipy-fft/)
