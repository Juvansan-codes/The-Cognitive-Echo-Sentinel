"""
Audio feature extraction service.

Extracts acoustic biomarkers from voice samples using librosa, numpy, and scipy.
Falls back to realistic mock data when audio libraries are unavailable.
"""

from __future__ import annotations

import io
import logging
import math
import random
import uuid
import subprocess
import tempfile
import os
from pathlib import Path

import numpy as np

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Try importing heavy audio libs; gracefully degrade to mocks
# ---------------------------------------------------------------------------
try:
    import librosa

    LIBROSA_AVAILABLE = True
    logger.info("REAL_AUDIO_PIPELINE_ENABLED: librosa version %s loaded", librosa.__version__)
except ImportError as e:
    LIBROSA_AVAILABLE = False
    logger.warning("MOCK_AUDIO_PIPELINE_ACTIVE: librosa not installed (%s)", e)

try:
    import parselmouth
    from parselmouth.praat import call as praat_call

    PRAAT_AVAILABLE = True
    logger.info("REAL_AUDIO_PIPELINE_ENABLED: parselmouth version %s loaded", parselmouth.__version__)
except ImportError as e:
    PRAAT_AVAILABLE = False
    logger.warning("MOCK_AUDIO_PIPELINE_ACTIVE: parselmouth not installed (%s)", e)

# One-Time Startup Banner
if LIBROSA_AVAILABLE:
    logger.info("🎤 Audio Pipeline Status: REAL")
else:
    logger.warning("⚠️ Audio Pipeline Status: MOCK (librosa missing)")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_features(audio_bytes: bytes, sample_rate: int = 16_000) -> dict:
    """
    Extract acoustic features from raw audio bytes.

    Returns a dict matching the AcousticFeatures schema.
    """
    if LIBROSA_AVAILABLE:
        logger.info("AUDIO_FEATURE_MODE=REAL")
        return _extract_real(audio_bytes, sample_rate)
    
    logger.warning("AUDIO_FEATURE_MODE=MOCK")
    return _extract_mock()


# ---------------------------------------------------------------------------
# Real extraction (when libs available)
# ---------------------------------------------------------------------------

def convert_webm_to_wav(input_path: str) -> str:
    """
    Convert WebM/Opus audio to WAV using FFmpeg.
    Returns path to WAV file.
    """
    output_path = str(Path(input_path).with_suffix(".wav"))

    try:
        process = subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, output_path],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True
        )
        logger.info("🎧 Converted WebM → WAV successfully")
        return output_path

    except subprocess.CalledProcessError as e:
        logger.error(f"❌ FFmpeg conversion failed with exit code {e.returncode}. Stderr: {e.stderr}")
        return input_path
    except Exception as e:
        logger.error(f"❌ FFmpeg conversion crashed: {e}")
        return input_path

def _extract_real(audio_bytes: bytes, sr: int) -> dict:
    """Extract features using librosa + parselmouth."""

    # 1. Safely handle WebM → WAV conversion
    # Create a temporary WebM file for ffmpeg
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_webm:
        tmp_webm.write(audio_bytes)
        webm_path = tmp_webm.name

    try:
        # Convert it
        wav_path = convert_webm_to_wav(webm_path)
        
        # Load audio from the converted WAV file
        try:
            y, sr = librosa.load(wav_path, sr=sr, mono=True)
        except Exception as e:
            logger.error("MOCK_AUDIO_PIPELINE_ACTIVE: librosa failed to decode audio format (%s). WebM Opus requires system FFmpeg. Falling back to mock acoustics.", e)
            return _extract_mock()
            
    finally:
        # Cleanup temporary audio files
        try:
            os.remove(webm_path)
            if 'wav_path' in locals() and wav_path != webm_path and os.path.exists(wav_path):
                os.remove(wav_path)
        except Exception:
            pass
        
    duration = librosa.get_duration(y=y, sr=sr)

    # ---- MFCC ----
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = mfcc.mean(axis=1).tolist()
    mfcc_std = mfcc.std(axis=1).tolist()

    # ---- Pitch (via librosa pyin) ----
    f0, voiced_flag, _ = librosa.pyin(
        y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"), sr=sr
    )
    f0_clean = f0[~np.isnan(f0)] if f0 is not None else np.array([150.0])
    mean_pitch = float(np.mean(f0_clean)) if len(f0_clean) > 0 else 150.0
    pitch_std = float(np.std(f0_clean)) if len(f0_clean) > 0 else 10.0
    pitch_stability = max(0.0, min(1.0, 1.0 - (pitch_std / (mean_pitch + 1e-6))))

    # ---- Pause / silence ratio ----
    rms = librosa.feature.rms(y=y)[0]
    silence_threshold = np.mean(rms) * 0.3
    silence_frames = np.sum(rms < silence_threshold)
    pause_ratio = float(silence_frames / (len(rms) + 1e-6))

    # ---- Speech rate (approximate via onset detection) ----
    onsets = librosa.onset.onset_detect(y=y, sr=sr, units="time")
    speech_rate = float(len(onsets) / max(duration, 0.1))

    # ---- HNR (simple approximation) ----
    hnr = _compute_hnr(y, sr)

    # ---- Jitter / Shimmer ----
    jitter, shimmer = _compute_jitter_shimmer(audio_bytes, sr)

    return {
        "mfcc_mean": [round(v, 4) for v in mfcc_mean],
        "mfcc_std": [round(v, 4) for v in mfcc_std],
        "jitter_percent": round(jitter, 4),
        "shimmer_percent": round(shimmer, 4),
        "mean_pitch_hz": round(mean_pitch, 2),
        "pitch_std_hz": round(pitch_std, 2),
        "pitch_stability": round(pitch_stability, 4),
        "pause_ratio": round(pause_ratio, 4),
        "speech_rate": round(speech_rate, 2),
        "harmonics_to_noise": round(hnr, 2),
        "_duration": round(duration, 2),
    }


def _compute_hnr(y: np.ndarray, sr: int) -> float:
    """Approximate HNR using autocorrelation."""
    try:
        frame_len = min(len(y), sr // 4)
        frame = y[:frame_len]
        autocorr = np.correlate(frame, frame, mode="full")
        autocorr = autocorr[len(autocorr) // 2 :]
        if autocorr[0] == 0:
            return 15.0
        peak = np.max(autocorr[1:]) / autocorr[0]
        hnr = 10 * math.log10(peak / (1 - peak + 1e-10) + 1e-10)
        return max(0.0, min(40.0, hnr))
    except Exception:
        return 15.0


def _compute_jitter_shimmer(audio_bytes: bytes, sr: int) -> tuple[float, float]:
    """Compute jitter and shimmer via parselmouth if available."""
    if not PRAAT_AVAILABLE:
        return _mock_jitter_shimmer()
    try:
        snd = parselmouth.Sound(io.BytesIO(audio_bytes))
        snd = snd.resample_new_frequency(sr)
        point_process = praat_call(
            snd, "To PointProcess (periodic, cc)", 75.0, 600.0
        )
        jitter = praat_call(
            point_process, "Get jitter (local)", 0.0, 0.0, 0.0001, 0.02, 1.3
        )
        shimmer = praat_call(
            [snd, point_process],
            "Get shimmer (local)",
            0.0, 0.0, 0.0001, 0.02, 1.3, 1.6,
        )
        jitter = jitter * 100 if jitter else 1.2
        shimmer = shimmer * 100 if shimmer else 3.5
        return (round(jitter, 4), round(shimmer, 4))
    except Exception:
        return _mock_jitter_shimmer()


def _mock_jitter_shimmer() -> tuple[float, float]:
    return (round(random.uniform(0.8, 2.5), 4), round(random.uniform(2.0, 6.0), 4))


# ---------------------------------------------------------------------------
# Mock extraction (demo / fallback)
# ---------------------------------------------------------------------------

def _extract_mock() -> dict:
    """Generate realistic-looking mock features for demo purposes."""
    mean_pitch = random.uniform(100, 250)
    pitch_std = random.uniform(5, 30)
    stability = max(0.0, min(1.0, 1.0 - pitch_std / mean_pitch))

    return {
        "mfcc_mean": [round(random.uniform(-30, 30), 4) for _ in range(13)],
        "mfcc_std": [round(random.uniform(1, 15), 4) for _ in range(13)],
        "jitter_percent": round(random.uniform(0.8, 2.5), 4),
        "shimmer_percent": round(random.uniform(2.0, 6.0), 4),
        "mean_pitch_hz": round(mean_pitch, 2),
        "pitch_std_hz": round(pitch_std, 2),
        "pitch_stability": round(stability, 4),
        "pause_ratio": round(random.uniform(0.05, 0.35), 4),
        "speech_rate": round(random.uniform(2.0, 5.5), 2),
        "harmonics_to_noise": round(random.uniform(10, 25), 2),
        "_duration": round(random.uniform(3, 15), 2),
    }
