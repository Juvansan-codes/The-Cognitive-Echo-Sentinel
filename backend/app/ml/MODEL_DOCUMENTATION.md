# 🧠 Acoustic Risk Model — Training & Integration Documentation

> **Project:** Cognitive Echo Sentinel  
> **Model Purpose:** Predict cognitive risk from speech/voice features  
> **Date:** February 27, 2026

---

## 📊 1. Dataset

**Name:** Parkinson Multiple Sound Recording  
**Location:** `backend/Parkinson_Multiple_Sound_Recording/`

| File | Rows | Columns | Used |
|---|---|---|---|
| `train_data.txt` | 1,040 | 29 (28 features + 1 label) | ✅ Yes |
| `test_data.txt` | 168 | 28 (mismatched) | ❌ Dropped |

- **No header row** — all values are numeric, comma-separated
- **Label column** (last column): `1` = Parkinson's, `0` = Healthy
- **Class balance:** 520 healthy + 520 Parkinson's (perfectly balanced)
- `test_data.txt` was excluded because it had 28 columns (vs 29) and contained only class `1`

### Feature Breakdown (28 columns)

| Index | Feature | Description |
|---|---|---|
| f0 | Subject ID | Patient identifier (1–40) |
| f1–f5 | Jitter variants | Jitter(%), Jitter(Abs), RAP, PPQ5, DDP |
| f6–f11 | Shimmer variants | Shimmer, Shimmer(dB), APQ3, APQ5, APQ11, DDA |
| f12 | Autocorrelation | Voice regularity |
| f13 | Noise-to-Harmonics | Inverse of HNR |
| f14 | Harmonics-to-Noise | Voice clarity (HNR) |
| f15–f19 | Pitch statistics | Median, Mean, StdDev, Min, Max pitch |
| f20–f21 | Pulse counts | Number of pulses, Number of periods |
| f22–f23 | Period stats | Mean period, StdDev period |
| f24 | Fraction unvoiced | % of unvoiced frames |
| f25–f26 | Voice breaks | Count and degree of breaks |
| f27 | UPDRS score | Clinical motor score |

---

## 🔬 2. Training Pipeline

**Script:** `backend/app/ml/train_acoustic_model.py`

### How to Run

```bash
cd backend
python -m app.ml.train_acoustic_model \
    --dataset "./Parkinson_Multiple_Sound_Recording" \
    --output  "./app/models"
```

### Pipeline Steps

1. **Load Data** — Reads `train_data.txt` with pandas, auto-detects headerless CSV, assigns column names
2. **Handle Mismatches** — If train/test have different column counts, keeps only matching files
3. **Clean Data** — Coerces to numeric, fills NaN with column medians, drops remaining bad rows
4. **Encode Labels** — `LabelEncoder` maps class names to integers
5. **Split** — Stratified 80/20 train/test split (`random_state=42`)
6. **Scale** — `StandardScaler` normalizes all features
7. **Train** — `RandomForestClassifier` with these hyperparameters:

| Parameter | Value | Why |
|---|---|---|
| `n_estimators` | 200 | Enough trees for stable predictions |
| `max_depth` | 10 | Prevents overfitting on small dataset |
| `class_weight` | `balanced` | Handles any class imbalance |
| `n_jobs` | -1 | Uses all CPU cores |
| `random_state` | 42 | Reproducibility |

8. **Evaluate** — Accuracy, precision, recall, F1, confusion matrix, top-10 feature importances
9. **Save Artifacts** — 4 `.pkl` files via `joblib`

### Dependencies

```
pandas
scikit-learn
joblib
numpy
```

---

## 📦 3. Saved Model Artifacts

All saved to `backend/app/models/`:

| File | Size | Purpose |
|---|---|---|
| `neuro_risk_model.pkl` | 501 KB | Full pipeline (StandardScaler + RandomForest) |
| `scaler.pkl` | 1.2 KB | Standalone scaler for feature normalization |
| `label_encoder.pkl` | 0.5 KB | Maps encoded predictions back to class names |
| `feature_names.pkl` | 0.4 KB | List of 28 feature names for validation |

---

## 🔗 4. Runtime Integration

**Modified file:** `backend/app/services/risk_engine.py`

### Model Loading (Global Scope)

```python
# Loaded ONCE at import time, not per-request
_ml_model = joblib.load("neuro_risk_model.pkl")
_ml_scaler = joblib.load("scaler.pkl")
_ml_label_encoder = joblib.load("label_encoder.pkl")
```

If loading fails → `_ml_ready = False` → automatic heuristic fallback.

### Feature Mapping (Live Audio → Model Input)

The live audio pipeline extracts **10 named features** (jitter, shimmer, pitch, HNR, etc.).  
The model expects **28 numeric features** from the Parkinson dataset.

`build_model_feature_vector()` maps between them:

| Live Feature | → Model Features |
|---|---|
| `jitter_percent` | f1–f5 (jitter variants derived mathematically) |
| `shimmer_percent` | f6–f11 (shimmer variants, scaled 3×) |
| `pitch_stability` | f12 (autocorrelation) |
| `harmonics_to_noise` | f13 (inverted), f14 (direct) |
| `mean_pitch_hz`, `pitch_std_hz` | f15–f19 (pitch statistics + derived min/max) |
| `speech_rate` | f20–f21 (pulse/period counts) |
| `pause_ratio` | f24–f26 (fraction unvoiced, voice breaks) |
| N/A | f0 = 20.5, f27 = 13.0 (global training means) |

> **Why global means for f0 and f27?** These features (subject ID, UPDRS motor score) are dataset artifacts — they can't be extracted from live audio. Setting them to the global mean makes them neutral so the model judges based on actual acoustic features.

### Scoring Strategy: Blended (40% ML + 60% Heuristic)

```
Final Risk = (ML Probability Score × 0.40) + (Heuristic Score × 0.60)
```

**Why blend instead of pure ML?**

The model's top discriminators from training were:
- `feature_0` (Subject ID) — 48.4% importance
- `feature_27` (UPDRS) — 38.2% importance

These are **non-acoustic** and can't be extracted from live audio. With them neutralized, the model's acoustic-only discrimination is limited (~60% vs 63% probability for healthy vs risky inputs).

The heuristic uses sigmoid-weighted jitter, shimmer, stability, HNR, and baseline deviation — providing reliable feature-level differentiation.

**Blending gives us the best of both:**
- ML contributes its learned patterns from 1,040 real patient recordings
- Heuristic ensures proper risk separation based on individual feature values

### Validation Results

| Input Profile | ML Score | Heuristic Score | **Blended** |
|---|---|---|---|
| Healthy (low jitter, high stability) | 64.2 | 5.2 | **28.9** ✅ Low |
| Moderate (mid-range features) | 66.7 | 36.4 | **48.5** ⚠️ Medium |
| At-Risk (high jitter, low HNR) | 68.6 | 79.2 | **74.9** 🔴 High |

### Error Handling

| Failure | Behavior |
|---|---|
| Model files missing | Heuristic-only scoring |
| joblib import fails | Heuristic-only scoring |
| Feature length mismatch | Logged warning → heuristic fallback |
| NaN/Inf in features | Replaced with 0.0 before inference |
| predict_proba fails | Caught → heuristic fallback |
| **API never crashes** | ✅ All failures are gracefully handled |

---

## 🏗️ 5. Architecture Flow

```
Audio File Upload
       │
       ▼
 extract_features()        ← librosa / parselmouth
       │
       ├──→ compare_to_baseline()
       │
       ▼
 compute_acoustic_risk()   ← ML model + heuristic blend
       │
       ├──→ run_lexical_analysis()  ← Featherless AI (async)
       │
       ▼
 compute_final_neuro_risk()
       │
       ▼
 JSON Response: { acoustic_risk, cognitive_risk, neuro_risk_level }
```

---

## 🔮 6. Future Improvements

1. **Retrain on audio-extracted features** — Train on features extracted by our own pipeline (librosa/parselmouth) rather than precomputed tabular data, eliminating the feature mapping layer
2. **Collect real user data** — Build a dataset from actual app recordings for domain-specific accuracy
3. **Remove dataset artifacts** — Drop subject ID and UPDRS from training to force the model to learn from acoustic features only
4. **Add cross-validation** — Use k-fold CV during training for more robust evaluation
5. **Upgrade to XGBoost/LightGBM** — Gradient boosting may outperform Random Forest on this dataset size
