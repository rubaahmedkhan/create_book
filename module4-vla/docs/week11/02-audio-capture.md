---
sidebar_position: 2
---

# Audio Capture and Preprocessing

## Overview

Real-time audio capture and preprocessing are critical for responsive voice-controlled robotics systems. This tutorial covers professional-grade audio capture techniques, noise reduction, voice activity detection (VAD), and integration with audio processing pipelines optimized for robotics applications.

## Learning Objectives

- Implement real-time audio capture from multiple sources
- Apply advanced noise reduction and audio enhancement techniques
- Implement Voice Activity Detection (VAD) for efficient processing
- Design audio buffering strategies for continuous recognition
- Integrate audio pipelines with ROS 2 systems

## Prerequisites

- Completed [Whisper Setup and Installation](./01-whisper-setup.md)
- Python 3.8+ with virtual environment
- Microphone or audio input device
- Basic understanding of digital signal processing
- Linux/Ubuntu system with audio drivers configured

## Audio Fundamentals for Robotics

### Key Concepts

**Sample Rate**: Number of samples per second (Hz)
- Whisper requirement: 16,000 Hz
- Human speech range: 80-260 Hz (fundamental) + harmonics
- Nyquist theorem: Sample at 2x highest frequency

**Bit Depth**: Bits per sample (dynamic range)
- 16-bit: 96 dB dynamic range (sufficient for speech)
- 32-bit float: Maximum precision for processing

**Channels**:
- Mono: Single channel (sufficient for speech)
- Stereo: Two channels (useful for direction finding)
- Multi-channel: Microphone arrays (advanced localization)

### Audio Quality Requirements

| Application | Sample Rate | Bit Depth | Channels | Latency |
|-------------|-------------|-----------|----------|---------|
| Voice Commands | 16 kHz | 16-bit | Mono | < 200ms |
| Natural Conversation | 16 kHz | 16-bit | Mono | < 500ms |
| Audio Logging | 16 kHz | 16-bit | Stereo | N/A |
| Source Localization | 16 kHz | 16-bit | 4+ | < 100ms |

## Setting Up Audio Capture

### Installing Audio Libraries

```bash
# System dependencies
sudo apt install -y \
    portaudio19-dev \
    python3-pyaudio \
    libasound2-dev \
    libsndfile1-dev \
    pulseaudio \
    pavucontrol

# Python libraries
pip install pyaudio sounddevice soundfile scipy numpy librosa webrtcvad
```

### Listing Audio Devices

```python
import sounddevice as sd
import pyaudio

def list_audio_devices():
    """List all available audio input devices"""
    print("=== Available Audio Devices ===\n")

    # Using sounddevice
    devices = sd.query_devices()
    for idx, device in enumerate(devices):
        if device['max_input_channels'] > 0:
            print(f"[{idx}] {device['name']}")
            print(f"    Channels: {device['max_input_channels']}")
            print(f"    Sample Rate: {device['default_samplerate']} Hz")
            print(f"    Host API: {sd.query_hostapis(device['hostapi'])['name']}\n")

    # Set default device
    default_device = sd.query_devices(kind='input')
    print(f"Default Input Device: {default_device['name']}")

    return devices

# Test
devices = list_audio_devices()
```

### Testing Audio Input

```python
import sounddevice as sd
import numpy as np

def test_audio_input(duration=5, device=None):
    """Test audio input by recording and playing back"""

    sample_rate = 16000
    print(f"Recording {duration} seconds...")

    # Record audio
    recording = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype='float32',
        device=device
    )

    sd.wait()  # Wait until recording is finished

    print(f"Recording complete. Playing back...")

    # Play back
    sd.play(recording, sample_rate)
    sd.wait()

    # Analyze recording
    print(f"\nRecording Statistics:")
    print(f"  Duration: {len(recording) / sample_rate:.2f}s")
    print(f"  Peak amplitude: {np.max(np.abs(recording)):.3f}")
    print(f"  RMS level: {np.sqrt(np.mean(recording**2)):.3f}")
    print(f"  Dynamic range: {20 * np.log10(np.max(np.abs(recording)) / (np.sqrt(np.mean(recording**2)) + 1e-10)):.1f} dB")

    return recording

# Test
audio = test_audio_input(duration=3)
```

## Real-time Audio Capture

### Callback-based Streaming

```python
import sounddevice as sd
import numpy as np
from queue import Queue
import threading

class AudioStreamer:
    """Real-time audio streaming with callback"""

    def __init__(self, sample_rate=16000, channels=1, chunk_size=1024):
        self.sample_rate = sample_rate
        self.channels = channels
        self.chunk_size = chunk_size
        self.audio_queue = Queue()
        self.is_recording = False
        self.stream = None

    def audio_callback(self, indata, frames, time, status):
        """Callback function called by sounddevice"""
        if status:
            print(f"Audio callback status: {status}")

        # Add audio chunk to queue
        self.audio_queue.put(indata.copy())

    def start(self, device=None):
        """Start audio streaming"""
        self.is_recording = True

        self.stream = sd.InputStream(
            device=device,
            channels=self.channels,
            samplerate=self.sample_rate,
            blocksize=self.chunk_size,
            callback=self.audio_callback,
            dtype='float32'
        )

        self.stream.start()
        print(f"Audio streaming started (device: {device or 'default'})")

    def stop(self):
        """Stop audio streaming"""
        self.is_recording = False

        if self.stream:
            self.stream.stop()
            self.stream.close()

        print("Audio streaming stopped")

    def get_audio_chunk(self, timeout=1.0):
        """Get next audio chunk from queue"""
        try:
            return self.audio_queue.get(timeout=timeout)
        except:
            return None

    def get_audio_buffer(self, duration=3.0):
        """Get audio buffer of specified duration"""
        num_chunks = int(duration * self.sample_rate / self.chunk_size)
        chunks = []

        for _ in range(num_chunks):
            chunk = self.get_audio_chunk()
            if chunk is not None:
                chunks.append(chunk)

        if chunks:
            return np.concatenate(chunks)
        return None

# Usage example
def main():
    streamer = AudioStreamer(sample_rate=16000, chunk_size=1024)

    try:
        streamer.start()

        while True:
            # Get 3 seconds of audio
            audio_buffer = streamer.get_audio_buffer(duration=3.0)

            if audio_buffer is not None:
                print(f"Captured {len(audio_buffer)} samples")
                # Process audio here (e.g., send to Whisper)

    except KeyboardInterrupt:
        print("\nStopping...")
    finally:
        streamer.stop()

if __name__ == "__main__":
    main()
```

### PyAudio Alternative

```python
import pyaudio
import numpy as np
from queue import Queue
import threading

class PyAudioStreamer:
    """Real-time audio streaming using PyAudio"""

    def __init__(self, sample_rate=16000, channels=1, chunk_size=1024):
        self.sample_rate = sample_rate
        self.channels = channels
        self.chunk_size = chunk_size
        self.audio_queue = Queue()
        self.is_recording = False

        self.p = pyaudio.PyAudio()
        self.stream = None

    def start(self, device_index=None):
        """Start audio streaming"""
        self.is_recording = True

        self.stream = self.p.open(
            format=pyaudio.paFloat32,
            channels=self.channels,
            rate=self.sample_rate,
            input=True,
            input_device_index=device_index,
            frames_per_buffer=self.chunk_size,
            stream_callback=self._callback
        )

        self.stream.start_stream()
        print("PyAudio streaming started")

    def _callback(self, in_data, frame_count, time_info, status):
        """PyAudio callback"""
        audio_data = np.frombuffer(in_data, dtype=np.float32)
        self.audio_queue.put(audio_data)
        return (None, pyaudio.paContinue)

    def stop(self):
        """Stop streaming"""
        self.is_recording = False

        if self.stream:
            self.stream.stop_stream()
            self.stream.close()

        self.p.terminate()
        print("PyAudio streaming stopped")

    def get_audio_chunk(self):
        """Get next audio chunk"""
        if not self.audio_queue.empty():
            return self.audio_queue.get()
        return None
```

## Audio Preprocessing Pipeline

### Noise Reduction

```python
import numpy as np
from scipy import signal
import noisereduce as nr

class AudioPreprocessor:
    """Comprehensive audio preprocessing"""

    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate

    def normalize(self, audio):
        """Normalize audio to [-1, 1]"""
        max_val = np.max(np.abs(audio))
        if max_val > 0:
            return audio / max_val
        return audio

    def high_pass_filter(self, audio, cutoff=80):
        """Remove low-frequency noise"""
        sos = signal.butter(
            10,
            cutoff,
            btype='hp',
            fs=self.sample_rate,
            output='sos'
        )
        return signal.sosfilt(sos, audio)

    def low_pass_filter(self, audio, cutoff=8000):
        """Remove high-frequency noise"""
        sos = signal.butter(
            10,
            cutoff,
            btype='lp',
            fs=self.sample_rate,
            output='sos'
        )
        return signal.sosfilt(sos, audio)

    def bandpass_filter(self, audio, low=80, high=8000):
        """Keep only speech frequencies"""
        sos = signal.butter(
            10,
            [low, high],
            btype='bp',
            fs=self.sample_rate,
            output='sos'
        )
        return signal.sosfilt(sos, audio)

    def noise_gate(self, audio, threshold=0.01):
        """Remove low-amplitude noise"""
        audio_copy = audio.copy()
        audio_copy[np.abs(audio_copy) < threshold] = 0
        return audio_copy

    def spectral_gating(self, audio, noise_profile=None):
        """Advanced noise reduction using spectral gating"""
        # Use noisereduce library
        reduced = nr.reduce_noise(
            y=audio,
            sr=self.sample_rate,
            stationary=True,
            prop_decrease=1.0
        )
        return reduced

    def preemphasis(self, audio, coef=0.97):
        """Apply pre-emphasis filter to boost high frequencies"""
        return np.append(audio[0], audio[1:] - coef * audio[:-1])

    def deemphasis(self, audio, coef=0.97):
        """Reverse pre-emphasis"""
        deemphasized = np.zeros_like(audio)
        deemphasized[0] = audio[0]
        for i in range(1, len(audio)):
            deemphasized[i] = audio[i] + coef * deemphasized[i-1]
        return deemphasized

    def process(self, audio, apply_noise_reduction=True):
        """Full preprocessing pipeline"""
        # 1. Normalize
        audio = self.normalize(audio)

        # 2. High-pass filter (remove rumble)
        audio = self.high_pass_filter(audio, cutoff=80)

        # 3. Low-pass filter (remove high-frequency noise)
        audio = self.low_pass_filter(audio, cutoff=8000)

        # 4. Noise gate
        audio = self.noise_gate(audio, threshold=0.01)

        # 5. Spectral gating (optional, slower)
        if apply_noise_reduction:
            audio = self.spectral_gating(audio)

        # 6. Final normalization
        audio = self.normalize(audio)

        return audio

# Usage
preprocessor = AudioPreprocessor(sample_rate=16000)
clean_audio = preprocessor.process(noisy_audio)
```

### Advanced Noise Reduction

```python
import librosa
import soundfile as sf

class AdvancedNoiseReducer:
    """Advanced noise reduction techniques"""

    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate

    def spectral_subtraction(self, audio, noise_profile):
        """Spectral subtraction noise reduction"""
        # Compute STFT
        D = librosa.stft(audio)
        magnitude = np.abs(D)
        phase = np.angle(D)

        # Estimate noise spectrum from noise profile
        noise_D = librosa.stft(noise_profile)
        noise_magnitude = np.abs(noise_D)
        noise_estimate = np.mean(noise_magnitude, axis=1, keepdims=True)

        # Subtract noise (with over-subtraction factor)
        alpha = 2.0  # Over-subtraction factor
        clean_magnitude = magnitude - alpha * noise_estimate
        clean_magnitude = np.maximum(clean_magnitude, 0.1 * magnitude)

        # Reconstruct signal
        clean_D = clean_magnitude * np.exp(1j * phase)
        clean_audio = librosa.istft(clean_D)

        return clean_audio

    def wiener_filter(self, audio, noise_profile):
        """Wiener filtering for noise reduction"""
        # Compute power spectra
        D = librosa.stft(audio)
        signal_power = np.abs(D) ** 2

        noise_D = librosa.stft(noise_profile)
        noise_power = np.mean(np.abs(noise_D) ** 2, axis=1, keepdims=True)

        # Wiener filter
        wiener_gain = signal_power / (signal_power + noise_power)
        wiener_gain = np.clip(wiener_gain, 0.1, 1.0)

        # Apply filter
        clean_D = D * wiener_gain
        clean_audio = librosa.istft(clean_D)

        return clean_audio

    def record_noise_profile(self, duration=2.0):
        """Record background noise profile"""
        print(f"Recording noise profile for {duration} seconds...")
        print("Please remain silent.")

        noise = sd.rec(
            int(duration * self.sample_rate),
            samplerate=self.sample_rate,
            channels=1,
            dtype='float32'
        )
        sd.wait()

        return noise.flatten()

# Usage
reducer = AdvancedNoiseReducer(sample_rate=16000)

# Record noise profile
noise_profile = reducer.record_noise_profile(duration=2.0)

# Record audio
audio = record_audio(duration=5.0)

# Apply noise reduction
clean_audio = reducer.wiener_filter(audio, noise_profile)
```

## Voice Activity Detection (VAD)

### WebRTC VAD Implementation

```python
import webrtcvad
import collections

class VoiceActivityDetector:
    """Voice Activity Detection using WebRTC VAD"""

    def __init__(self, sample_rate=16000, aggressiveness=3):
        """
        Initialize VAD
        Args:
            sample_rate: Must be 8000, 16000, 32000, or 48000 Hz
            aggressiveness: 0-3, higher = more aggressive filtering
        """
        self.sample_rate = sample_rate
        self.vad = webrtcvad.Vad(aggressiveness)

        # Frame duration in ms (10, 20, or 30)
        self.frame_duration_ms = 30
        self.frame_length = int(sample_rate * self.frame_duration_ms / 1000)

    def is_speech(self, audio_frame):
        """Check if frame contains speech"""
        # Convert float32 to int16
        audio_int16 = (audio_frame * 32767).astype(np.int16)
        return self.vad.is_speech(audio_int16.tobytes(), self.sample_rate)

    def detect_speech_segments(self, audio):
        """Detect speech segments in audio"""
        num_frames = len(audio) // self.frame_length
        speech_frames = []

        for i in range(num_frames):
            start = i * self.frame_length
            end = start + self.frame_length
            frame = audio[start:end]

            if self.is_speech(frame):
                speech_frames.append(frame)

        if speech_frames:
            return np.concatenate(speech_frames)
        return np.array([])

    def segment_audio(self, audio, padding_duration_ms=300):
        """
        Segment audio into speech and non-speech regions
        Returns list of (start_time, end_time, is_speech) tuples
        """
        num_padding_frames = int(padding_duration_ms / self.frame_duration_ms)
        ring_buffer = collections.deque(maxlen=num_padding_frames)

        triggered = False
        voiced_frames = []
        segments = []
        current_segment_start = 0

        num_frames = len(audio) // self.frame_length

        for i in range(num_frames):
            start = i * self.frame_length
            end = start + self.frame_length
            frame = audio[start:end]

            is_speech = self.is_speech(frame)

            if not triggered:
                ring_buffer.append((frame, is_speech))
                num_voiced = len([f for f, speech in ring_buffer if speech])

                if num_voiced > 0.9 * ring_buffer.maxlen:
                    triggered = True
                    current_segment_start = start - len(ring_buffer) * self.frame_length
                    voiced_frames.extend([f for f, s in ring_buffer])
                    ring_buffer.clear()
            else:
                voiced_frames.append(frame)
                ring_buffer.append((frame, is_speech))
                num_unvoiced = len([f for f, speech in ring_buffer if not speech])

                if num_unvoiced > 0.9 * ring_buffer.maxlen:
                    triggered = False
                    segments.append({
                        'start': current_segment_start / self.sample_rate,
                        'end': (start + self.frame_length) / self.sample_rate,
                        'audio': np.concatenate(voiced_frames)
                    })
                    voiced_frames = []
                    ring_buffer.clear()

        # Add final segment if still triggered
        if voiced_frames:
            segments.append({
                'start': current_segment_start / self.sample_rate,
                'end': len(audio) / self.sample_rate,
                'audio': np.concatenate(voiced_frames)
            })

        return segments

# Usage
vad = VoiceActivityDetector(sample_rate=16000, aggressiveness=3)

# Detect speech in audio
segments = vad.segment_audio(audio)

for i, segment in enumerate(segments):
    print(f"Segment {i}: {segment['start']:.2f}s - {segment['end']:.2f}s")
    # Process segment['audio'] with Whisper
```

### Energy-based VAD

```python
class EnergyVAD:
    """Simple energy-based Voice Activity Detection"""

    def __init__(self, sample_rate=16000, frame_length=0.025, frame_shift=0.010):
        self.sample_rate = sample_rate
        self.frame_length = int(frame_length * sample_rate)
        self.frame_shift = int(frame_shift * sample_rate)

    def compute_energy(self, frame):
        """Compute frame energy"""
        return np.sum(frame ** 2) / len(frame)

    def detect_speech(self, audio, energy_threshold=0.01):
        """Detect speech using energy threshold"""
        speech_frames = []
        num_frames = (len(audio) - self.frame_length) // self.frame_shift + 1

        for i in range(num_frames):
            start = i * self.frame_shift
            end = start + self.frame_length
            frame = audio[start:end]

            energy = self.compute_energy(frame)

            if energy > energy_threshold:
                speech_frames.append(frame)

        if speech_frames:
            return np.concatenate(speech_frames)
        return np.array([])

    def adaptive_threshold(self, audio, percentile=50):
        """Compute adaptive energy threshold"""
        num_frames = (len(audio) - self.frame_length) // self.frame_shift + 1
        energies = []

        for i in range(num_frames):
            start = i * self.frame_shift
            end = start + self.frame_length
            frame = audio[start:end]
            energies.append(self.compute_energy(frame))

        return np.percentile(energies, percentile)

# Usage
energy_vad = EnergyVAD(sample_rate=16000)
threshold = energy_vad.adaptive_threshold(audio, percentile=60)
speech = energy_vad.detect_speech(audio, energy_threshold=threshold)
```

## Audio Buffering Strategies

### Circular Buffer for Continuous Recognition

```python
class CircularAudioBuffer:
    """Circular buffer for continuous audio streaming"""

    def __init__(self, max_duration=10.0, sample_rate=16000):
        self.sample_rate = sample_rate
        self.max_samples = int(max_duration * sample_rate)
        self.buffer = np.zeros(self.max_samples, dtype=np.float32)
        self.write_pos = 0
        self.is_full = False

    def write(self, audio_chunk):
        """Write audio chunk to buffer"""
        chunk_len = len(audio_chunk)

        if self.write_pos + chunk_len <= self.max_samples:
            # Write fits in remaining space
            self.buffer[self.write_pos:self.write_pos + chunk_len] = audio_chunk
            self.write_pos += chunk_len
        else:
            # Wrap around
            remaining = self.max_samples - self.write_pos
            self.buffer[self.write_pos:] = audio_chunk[:remaining]
            self.buffer[:chunk_len - remaining] = audio_chunk[remaining:]
            self.write_pos = chunk_len - remaining
            self.is_full = True

    def read(self, duration=None):
        """Read audio from buffer"""
        if duration is None:
            # Read all available audio
            if self.is_full:
                # Buffer wrapped, reorder
                return np.concatenate([
                    self.buffer[self.write_pos:],
                    self.buffer[:self.write_pos]
                ])
            else:
                return self.buffer[:self.write_pos].copy()
        else:
            # Read specific duration
            num_samples = int(duration * self.sample_rate)
            num_samples = min(num_samples, self.max_samples)

            if self.is_full:
                read_pos = (self.write_pos - num_samples) % self.max_samples
                if read_pos < self.write_pos:
                    return self.buffer[read_pos:self.write_pos].copy()
                else:
                    return np.concatenate([
                        self.buffer[read_pos:],
                        self.buffer[:self.write_pos]
                    ])
            else:
                read_pos = max(0, self.write_pos - num_samples)
                return self.buffer[read_pos:self.write_pos].copy()

    def clear(self):
        """Clear buffer"""
        self.buffer.fill(0)
        self.write_pos = 0
        self.is_full = False

# Usage
buffer = CircularAudioBuffer(max_duration=10.0, sample_rate=16000)

# Continuously add audio
while True:
    chunk = get_audio_chunk()
    buffer.write(chunk)

    # Read last 3 seconds for processing
    audio_to_process = buffer.read(duration=3.0)
    # Process with Whisper
```

### Sliding Window Buffer

```python
class SlidingWindowBuffer:
    """Sliding window buffer for overlapping recognition"""

    def __init__(self, window_duration=3.0, overlap=0.5, sample_rate=16000):
        self.window_duration = window_duration
        self.overlap = overlap
        self.sample_rate = sample_rate

        self.window_samples = int(window_duration * sample_rate)
        self.hop_samples = int(window_samples * (1 - overlap))

        self.buffer = []
        self.total_samples = 0

    def add_audio(self, audio_chunk):
        """Add audio chunk to buffer"""
        self.buffer.append(audio_chunk)
        self.total_samples += len(audio_chunk)

    def get_windows(self):
        """Get all complete windows"""
        if not self.buffer:
            return []

        # Concatenate buffer
        audio = np.concatenate(self.buffer)

        windows = []
        start = 0

        while start + self.window_samples <= len(audio):
            window = audio[start:start + self.window_samples]
            windows.append(window)
            start += self.hop_samples

        # Keep remaining audio in buffer
        if start < len(audio):
            self.buffer = [audio[start:]]
            self.total_samples = len(audio) - start
        else:
            self.buffer = []
            self.total_samples = 0

        return windows

# Usage
sliding_buffer = SlidingWindowBuffer(
    window_duration=3.0,
    overlap=0.5,
    sample_rate=16000
)

while True:
    chunk = get_audio_chunk()
    sliding_buffer.add_audio(chunk)

    # Process all complete windows
    windows = sliding_buffer.get_windows()
    for window in windows:
        # Process with Whisper
        pass
```

## Hands-on Exercises

### Exercise 1: Microphone Calibration

Create a calibration tool to optimize microphone settings.

```python
import sounddevice as sd
import numpy as np
import matplotlib.pyplot as plt

def calibrate_microphone(duration=10):
    """Calibrate microphone and analyze environment"""
    sample_rate = 16000

    print("Calibrating microphone...")
    print("Please speak normally for 10 seconds")

    # Record
    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype='float32'
    )
    sd.wait()

    audio = audio.flatten()

    # Analyze
    peak = np.max(np.abs(audio))
    rms = np.sqrt(np.mean(audio ** 2))
    snr = 20 * np.log10(peak / (rms + 1e-10))

    print(f"\nCalibration Results:")
    print(f"  Peak level: {peak:.3f} ({20*np.log10(peak):.1f} dB)")
    print(f"  RMS level: {rms:.3f} ({20*np.log10(rms):.1f} dB)")
    print(f"  SNR estimate: {snr:.1f} dB")

    # Recommendations
    if peak > 0.95:
        print("⚠️  WARNING: Clipping detected! Reduce microphone gain.")
    elif peak < 0.1:
        print("⚠️  WARNING: Signal too quiet! Increase microphone gain.")
    else:
        print("✅ Signal level is good")

    if snr < 10:
        print("⚠️  WARNING: High noise level. Consider noise reduction.")
    else:
        print("✅ Noise level is acceptable")

    # Plot waveform
    plt.figure(figsize=(12, 4))
    plt.plot(audio)
    plt.title("Recorded Audio Waveform")
    plt.xlabel("Sample")
    plt.ylabel("Amplitude")
    plt.tight_layout()
    plt.savefig("calibration.png")
    plt.show()

    return {
        'peak': peak,
        'rms': rms,
        'snr': snr,
        'audio': audio
    }

# Run calibration
results = calibrate_microphone(duration=10)
```

**Task**: Run calibration and adjust your microphone settings until you get good signal levels without clipping.

### Exercise 2: Build Real-time VAD System

Implement a complete real-time voice activity detection system.

```python
import sounddevice as sd
import numpy as np
import webrtcvad
from queue import Queue
import threading

class RealtimeVAD:
    """Real-time Voice Activity Detection system"""

    def __init__(self, sample_rate=16000, aggressiveness=3):
        self.sample_rate = sample_rate
        self.vad = webrtcvad.Vad(aggressiveness)

        self.frame_duration_ms = 30
        self.frame_length = int(sample_rate * self.frame_duration_ms / 1000)

        self.audio_queue = Queue()
        self.is_running = False

        self.speech_buffer = []
        self.is_speaking = False
        self.silence_frames = 0
        self.silence_threshold = 20  # ~600ms of silence

    def audio_callback(self, indata, frames, time, status):
        """Audio callback"""
        if status:
            print(f"Status: {status}")
        self.audio_queue.put(indata.copy())

    def is_speech_frame(self, frame):
        """Check if frame contains speech"""
        audio_int16 = (frame * 32767).astype(np.int16)
        return self.vad.is_speech(audio_int16.tobytes(), self.sample_rate)

    def process_audio(self):
        """Process audio stream"""
        while self.is_running:
            if not self.audio_queue.empty():
                frame = self.audio_queue.get()
                frame = frame.flatten()

                # Pad if needed
                if len(frame) < self.frame_length:
                    frame = np.pad(frame, (0, self.frame_length - len(frame)))
                elif len(frame) > self.frame_length:
                    frame = frame[:self.frame_length]

                is_speech = self.is_speech_frame(frame)

                if is_speech:
                    if not self.is_speaking:
                        print("\n🎤 Speech detected - Recording...")
                        self.is_speaking = True

                    self.speech_buffer.append(frame)
                    self.silence_frames = 0
                else:
                    if self.is_speaking:
                        self.silence_frames += 1

                        if self.silence_frames >= self.silence_threshold:
                            print("🔇 Speech ended")
                            self.process_speech()
                            self.is_speaking = False
                            self.speech_buffer = []
                            self.silence_frames = 0

    def process_speech(self):
        """Process detected speech segment"""
        if self.speech_buffer:
            audio = np.concatenate(self.speech_buffer)
            duration = len(audio) / self.sample_rate

            print(f"📝 Processing speech segment ({duration:.2f}s)")

            # Save or process audio here
            # For example: transcribe with Whisper

    def start(self):
        """Start VAD system"""
        self.is_running = True

        # Start audio stream
        self.stream = sd.InputStream(
            channels=1,
            samplerate=self.sample_rate,
            blocksize=self.frame_length,
            callback=self.audio_callback,
            dtype='float32'
        )
        self.stream.start()

        # Start processing thread
        self.process_thread = threading.Thread(target=self.process_audio)
        self.process_thread.start()

        print("🎙️  Real-time VAD started. Speak to test...")

    def stop(self):
        """Stop VAD system"""
        self.is_running = False
        self.stream.stop()
        self.stream.close()
        self.process_thread.join()
        print("VAD system stopped")

# Usage
vad_system = RealtimeVAD(sample_rate=16000, aggressiveness=3)

try:
    vad_system.start()
    input("Press Enter to stop...\n")
except KeyboardInterrupt:
    print("\nInterrupted")
finally:
    vad_system.stop()
```

**Task**: Test the VAD system in different noise environments and adjust aggressiveness level for best results.

### Exercise 3: Audio Quality Monitor

Build a real-time audio quality monitoring system.

```python
import sounddevice as sd
import numpy as np
from collections import deque
import time

class AudioQualityMonitor:
    """Monitor audio quality in real-time"""

    def __init__(self, sample_rate=16000, window_size=100):
        self.sample_rate = sample_rate
        self.window_size = window_size

        self.rms_history = deque(maxlen=window_size)
        self.peak_history = deque(maxlen=window_size)
        self.clip_count = 0
        self.total_frames = 0

    def audio_callback(self, indata, frames, time_info, status):
        """Monitor audio in callback"""
        audio = indata.flatten()

        # Compute metrics
        rms = np.sqrt(np.mean(audio ** 2))
        peak = np.max(np.abs(audio))

        self.rms_history.append(rms)
        self.peak_history.append(peak)
        self.total_frames += 1

        # Check for clipping
        if peak > 0.99:
            self.clip_count += 1

        # Print status every 10 frames
        if self.total_frames % 10 == 0:
            avg_rms = np.mean(self.rms_history)
            avg_peak = np.mean(self.peak_history)
            clip_rate = self.clip_count / self.total_frames * 100

            status_line = (
                f"\rRMS: {avg_rms:.3f} | "
                f"Peak: {avg_peak:.3f} | "
                f"Clip Rate: {clip_rate:.1f}%"
            )

            # Add warnings
            if avg_peak > 0.95:
                status_line += " ⚠️ CLIPPING"
            elif avg_rms < 0.01:
                status_line += " ⚠️ TOO QUIET"
            else:
                status_line += " ✅ OK"

            print(status_line, end='')

    def start_monitoring(self, duration=30):
        """Start monitoring"""
        print(f"Monitoring audio quality for {duration} seconds...")
        print("Speak normally into the microphone\n")

        with sd.InputStream(
            channels=1,
            samplerate=self.sample_rate,
            callback=self.audio_callback,
            dtype='float32'
        ):
            sd.sleep(int(duration * 1000))

        print("\n\nMonitoring complete!")
        self.print_summary()

    def print_summary(self):
        """Print monitoring summary"""
        print("\n=== Audio Quality Summary ===")
        print(f"Average RMS: {np.mean(self.rms_history):.3f}")
        print(f"Average Peak: {np.mean(self.peak_history):.3f}")
        print(f"Clipping Rate: {self.clip_count / self.total_frames * 100:.1f}%")

        if self.clip_count == 0:
            print("✅ No clipping detected")
        else:
            print(f"⚠️  {self.clip_count} frames clipped - reduce gain")

# Usage
monitor = AudioQualityMonitor(sample_rate=16000)
monitor.start_monitoring(duration=30)
```

**Task**: Run the monitor and adjust your microphone settings until you achieve consistent, clip-free audio.

## Troubleshooting Common Issues

### Issue 1: PortAudio Not Found

**Symptom**: `ImportError: No module named '_portaudio'`

**Solution**:
```bash
# Reinstall portaudio
sudo apt remove portaudio19-dev python3-pyaudio
sudo apt install portaudio19-dev
pip uninstall pyaudio
pip install pyaudio
```

### Issue 2: High Latency

**Symptom**: Noticeable delay between speaking and processing

**Solution**:
```python
# Reduce block size
stream = sd.InputStream(
    channels=1,
    samplerate=16000,
    blocksize=512,  # Smaller = lower latency
    callback=callback,
    dtype='float32'
)

# Disable unnecessary processing
# Use greedy decoding in Whisper (beam_size=1)
```

### Issue 3: Audio Dropouts

**Symptom**: Missing audio chunks, `InputOverflowed` errors

**Solution**:
```python
# Increase queue size
audio_queue = Queue(maxsize=100)

# Use larger block size
blocksize = 2048

# Increase callback priority (Linux)
# Run with: sudo nice -n -10 python script.py
```

### Issue 4: Poor VAD Performance

**Symptom**: VAD misses speech or triggers on noise

**Solution**:
```python
# For noisy environments: use higher aggressiveness
vad = webrtcvad.Vad(3)  # 0-3, 3 = most aggressive

# For quiet environments: use lower aggressiveness
vad = webrtcvad.Vad(1)

# Combine with energy-based VAD
def hybrid_vad(frame):
    webrtc_speech = webrtc_vad.is_speech(frame)
    energy_speech = energy > threshold
    return webrtc_speech and energy_speech
```

## Best Practices and Safety Considerations

### 1. Resource Management

```python
class ManagedAudioStreamer:
    """Audio streamer with proper resource management"""

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()

# Usage
with ManagedAudioStreamer() as streamer:
    # Audio automatically cleaned up
    audio = streamer.get_audio_buffer()
```

### 2. Error Handling

```python
def robust_audio_capture(duration=3.0, max_retries=3):
    """Robust audio capture with retries"""
    for attempt in range(max_retries):
        try:
            audio = sd.rec(
                int(duration * 16000),
                samplerate=16000,
                channels=1,
                dtype='float32'
            )
            sd.wait()
            return audio.flatten()

        except sd.PortAudioError as e:
            print(f"Audio error (attempt {attempt + 1}): {e}")
            time.sleep(0.5)

        except Exception as e:
            print(f"Unexpected error: {e}")
            raise

    raise RuntimeError("Failed to capture audio after retries")
```

### 3. Privacy Considerations

```python
class PrivacyAwareRecorder:
    """Audio recorder with privacy features"""

    def __init__(self):
        self.is_recording = False
        self.privacy_mode = False

    def enable_privacy_mode(self):
        """Disable audio capture"""
        self.privacy_mode = True
        print("🔒 Privacy mode enabled - audio capture disabled")

    def disable_privacy_mode(self):
        """Enable audio capture"""
        self.privacy_mode = False
        print("🔓 Privacy mode disabled - audio capture enabled")

    def record_audio(self, duration):
        """Record only if privacy mode is off"""
        if self.privacy_mode:
            print("❌ Recording blocked by privacy mode")
            return None

        # Record audio
        return sd.rec(...)
```

## Summary

In this tutorial, you learned:

- ✅ Real-time audio capture from multiple sources
- ✅ Comprehensive audio preprocessing techniques
- ✅ Voice Activity Detection (VAD) implementation
- ✅ Audio buffering strategies for continuous recognition
- ✅ Quality monitoring and troubleshooting
- ✅ Best practices for production systems

**Key Takeaways**:
- Always preprocess audio before ASR
- Use VAD to reduce unnecessary processing
- Implement proper buffer management
- Monitor audio quality in real-time
- Handle errors gracefully
- Respect user privacy

## Next Steps

Continue to **[Integrating Whisper with ROS 2](./03-whisper-integration.md)** to learn:
- ROS 2 audio message types
- Creating Whisper ROS 2 nodes
- Publishing transcription results
- Integration with robot control systems
- Building complete voice control pipeline

## Additional Resources

- [PyAudio Documentation](https://people.csail.mit.edu/hubert/pyaudio/docs/)
- [sounddevice Documentation](https://python-sounddevice.readthedocs.io/)
- [WebRTC VAD](https://github.com/wiseman/py-webrtcvad)
- [librosa Audio Processing](https://librosa.org/doc/latest/index.html)
- [Digital Signal Processing Guide](https://www.dspguide.com/)
