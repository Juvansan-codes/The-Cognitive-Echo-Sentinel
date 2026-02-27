#!/usr/bin/env python3
"""
Cognitive Echo Sentinel – Acoustic Risk Model Training Pipeline (Tabular)

Trains a Random Forest classifier from precomputed tabular speech features.
Does NOT use librosa or parselmouth – those remain in the live FastAPI pipeline.

Usage:
    python -m app.ml.train_acoustic_model \
        --dataset ./Parkinson_Multiple_Sound_Recording \
        --output  ./app/models

Expected dataset structure:
    Parkinson_Multiple_Sound_Recording/
      train_data.txt
      test_data.txt

The files should contain numeric speech features with a label column (e.g. "status").
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("train")

# ─── Constants ────────────────────────────────────────────────────────────────

# Common label column names to auto-detect (case-insensitive)
LABEL_CANDIDATES: list[str] = [
    "status",
    "label",
    "class",
    "target",
    "diagnosis",
    "category",
]

# Columns to always drop if present (non-feature identifiers)
DROP_CANDIDATES: list[str] = [
    "name",
    "id",
    "subject",
    "patient_id",
    "file",
    "filename",
    "recording",
]


# ═══════════════════════════════════════════════════════════════════════════════
#  DATA LOADING
# ═══════════════════════════════════════════════════════════════════════════════


def _try_read(path: Path) -> pd.DataFrame:
    """Attempt to read a tabular file (comma, tab, or whitespace delimited).

    Handles headerless files: if every value in the first row is numeric,
    the file is re-read with header=None and auto-generated column names
    (feature_0 … feature_N, with the last column named 'status').
    """
    for sep in [",", "\t", None]:
        try:
            df = pd.read_csv(path, sep=sep, engine="python")
            if df.shape[1] > 1:
                # Check if the header row is actually data (all numeric)
                first_row_numeric = all(
                    _is_numeric(str(c)) for c in df.columns
                )
                if first_row_numeric:
                    logger.info(
                        "No header detected in %s – assigning auto column names.",
                        path.name,
                    )
                    df = pd.read_csv(path, sep=sep, header=None, engine="python")
                    n_cols = df.shape[1]
                    col_names = [f"feature_{i}" for i in range(n_cols - 1)] + ["status"]
                    df.columns = col_names
                return df
        except Exception:
            continue
    logger.error("Could not parse %s with any common delimiter.", path)
    sys.exit(1)


def _is_numeric(s: str) -> bool:
    """Check if a string represents a numeric value."""
    try:
        float(s)
        return True
    except (ValueError, TypeError):
        return False


def _find_label_column(df: pd.DataFrame) -> str:
    """Auto-detect the label column from common names."""
    cols_lower = {c.lower().strip(): c for c in df.columns}
    for candidate in LABEL_CANDIDATES:
        if candidate in cols_lower:
            return cols_lower[candidate]

    # Fallback: last column
    last_col = df.columns[-1]
    logger.warning(
        "Could not auto-detect label column. Using last column: '%s'", last_col
    )
    return last_col


def _drop_non_feature_columns(df: pd.DataFrame, label_col: str) -> pd.DataFrame:
    """Drop identifier columns that are not features."""
    cols_lower = {c.lower().strip(): c for c in df.columns}
    to_drop: list[str] = []
    for candidate in DROP_CANDIDATES:
        if candidate in cols_lower and cols_lower[candidate] != label_col:
            to_drop.append(cols_lower[candidate])
    if to_drop:
        logger.info("Dropping non-feature columns: %s", to_drop)
        df = df.drop(columns=to_drop)
    return df


def load_dataset(
    dataset_dir: Path,
) -> tuple[np.ndarray, np.ndarray, list[str], list[str]]:
    """
    Load train and test tabular data from the dataset directory.

    Returns:
        X: Feature matrix (n_samples, n_features)
        y: Label array (n_samples,) as strings
        feature_names: List of feature column names (for consistency)
        class_names: Sorted unique class labels
    """
    if not dataset_dir.is_dir():
        logger.error("Dataset directory not found: %s", dataset_dir)
        sys.exit(1)

    # Find data files
    train_file = _find_file(dataset_dir, ["train_data.txt", "train_data.csv", "train.txt", "train.csv"])
    test_file = _find_file(dataset_dir, ["test_data.txt", "test_data.csv", "test.txt", "test.csv"])

    frames: list[pd.DataFrame] = []

    if train_file:
        logger.info("Loading training data: %s", train_file.name)
        frames.append(_try_read(train_file))

    if test_file:
        logger.info("Loading test data: %s", test_file.name)
        frames.append(_try_read(test_file))

    if not frames:
        # Try loading any .txt or .csv in the directory
        for ext in ("*.txt", "*.csv"):
            for f in sorted(dataset_dir.glob(ext)):
                logger.info("Loading: %s", f.name)
                frames.append(_try_read(f))
        if not frames:
            logger.error("No data files found in %s", dataset_dir)
            sys.exit(1)

    # Handle column count mismatches between files
    col_counts = [f.shape[1] for f in frames]
    if len(set(col_counts)) > 1:
        # Group by column count, keep the group with the most total rows
        from collections import Counter
        count_freq = Counter(col_counts)
        majority_cols = count_freq.most_common(1)[0][0]
        kept = [f for f in frames if f.shape[1] == majority_cols]
        dropped_count = len(frames) - len(kept)
        logger.warning(
            "Column count mismatch across files (%s). Keeping %d file(s) with %d columns, dropping %d.",
            dict(count_freq), len(kept), majority_cols, dropped_count,
        )
        frames = kept

    df = pd.concat(frames, ignore_index=True)
    logger.info("Combined dataset: %d rows x %d columns", df.shape[0], df.shape[1])

    # Detect label column
    label_col = _find_label_column(df)
    logger.info("Label column: '%s'", label_col)

    # Drop non-feature columns
    df = _drop_non_feature_columns(df, label_col)

    # Separate features and labels
    y_raw = df[label_col].astype(str).values
    X_df = df.drop(columns=[label_col])

    # Coerce all feature columns to numeric
    X_df = X_df.apply(pd.to_numeric, errors="coerce")

    # Handle missing values
    n_missing = int(X_df.isna().sum().sum())
    if n_missing > 0:
        logger.warning(
            "Found %d missing values across feature columns. Filling with column median.",
            n_missing,
        )
        X_df = X_df.fillna(X_df.median())

    # Drop any remaining all-NaN columns
    all_nan_cols = X_df.columns[X_df.isna().all()].tolist()
    if all_nan_cols:
        logger.warning("Dropping all-NaN columns: %s", all_nan_cols)
        X_df = X_df.drop(columns=all_nan_cols)

    # Drop rows that still have NaN
    nan_rows = X_df.isna().any(axis=1).sum()
    if nan_rows > 0:
        logger.warning("Dropping %d rows with remaining NaN values.", nan_rows)
        valid_mask = ~X_df.isna().any(axis=1)
        X_df = X_df[valid_mask]
        y_raw = y_raw[valid_mask.values]

    feature_names = X_df.columns.tolist()
    X = X_df.values.astype(np.float64)

    class_names = sorted(np.unique(y_raw).tolist())

    logger.info(
        "Final dataset: %d samples, %d features", X.shape[0], X.shape[1]
    )
    unique, counts = np.unique(y_raw, return_counts=True)
    for cls, cnt in zip(unique, counts):
        logger.info("  %-20s %d samples", cls, cnt)

    return X, y_raw, feature_names, class_names


def _find_file(directory: Path, candidates: list[str]) -> Path | None:
    """Find the first matching filename in a directory (case-insensitive)."""
    existing = {f.name.lower(): f for f in directory.iterdir() if f.is_file()}
    for name in candidates:
        if name.lower() in existing:
            return existing[name.lower()]
    return None


# ═══════════════════════════════════════════════════════════════════════════════
#  TRAINING
# ═══════════════════════════════════════════════════════════════════════════════


def build_pipeline() -> Pipeline:
    """Create a StandardScaler -> RandomForest pipeline."""
    return Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=200,
                    max_depth=10,
                    random_state=42,
                    n_jobs=-1,
                    class_weight="balanced",
                ),
            ),
        ]
    )


def train_and_evaluate(
    X: np.ndarray,
    y: np.ndarray,
    feature_names: list[str],
    class_names: list[str],
) -> tuple[Pipeline, LabelEncoder]:
    """
    Train the model and print evaluation metrics.

    Returns:
        pipeline: Trained sklearn Pipeline (scaler + model)
        le: Fitted LabelEncoder
    """
    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    logger.info(
        "Label mapping: %s",
        dict(zip(le.classes_.tolist(), le.transform(le.classes_).tolist())),
    )

    # Stratified train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=y_encoded,
    )

    logger.info("Train: %d samples | Test: %d samples", len(X_train), len(X_test))

    # Build and fit pipeline
    pipeline = build_pipeline()
    logger.info("Training RandomForest (n_estimators=200, max_depth=10) ...")
    pipeline.fit(X_train, y_train)

    # Predict
    y_pred = pipeline.predict(X_test)

    # ── Evaluation ────────────────────────────────────────────────────
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print("\n" + "=" * 60)
    print("  ACOUSTIC RISK MODEL - EVALUATION RESULTS")
    print("=" * 60)
    print(f"\n  Accuracy  : {acc:.4f}")
    print(f"  Precision : {prec:.4f}  (weighted)")
    print(f"  Recall    : {rec:.4f}  (weighted)")
    print(f"  F1-Score  : {f1:.4f}  (weighted)")

    print(f"\n{'-' * 60}")
    print("  Classification Report")
    print(f"{'-' * 60}")
    print(
        classification_report(
            y_test,
            y_pred,
            target_names=le.classes_,
            zero_division=0,
        )
    )

    print(f"{'-' * 60}")
    print("  Confusion Matrix")
    print(f"{'-' * 60}")
    cm = confusion_matrix(y_test, y_pred)
    header = "  " + " " * 15 + "  ".join(f"{c:>12s}" for c in le.classes_)
    print(header)
    for i, row in enumerate(cm):
        row_str = "  ".join(f"{v:>12d}" for v in row)
        print(f"  {le.classes_[i]:<15s}{row_str}")
    print("=" * 60)

    # Feature importances (top 10)
    rf: RandomForestClassifier = pipeline.named_steps["classifier"]
    importances = rf.feature_importances_
    top_indices = np.argsort(importances)[::-1][:10]
    print("\n  Top 10 Feature Importances:")
    for rank, idx in enumerate(top_indices, 1):
        name = feature_names[idx] if idx < len(feature_names) else f"feature_{idx}"
        print(f"    {rank:>2d}. {name:<25s}  {importances[idx]:.4f}")
    print()

    return pipeline, le


# ═══════════════════════════════════════════════════════════════════════════════
#  SAVE ARTIFACTS
# ═══════════════════════════════════════════════════════════════════════════════


def save_artifacts(
    pipeline: Pipeline,
    label_encoder: LabelEncoder,
    feature_names: list[str],
    output_dir: Path,
) -> None:
    """Save trained model artifacts using joblib."""
    output_dir.mkdir(parents=True, exist_ok=True)

    model_path = output_dir / "neuro_risk_model.pkl"
    scaler_path = output_dir / "scaler.pkl"
    encoder_path = output_dir / "label_encoder.pkl"
    features_path = output_dir / "feature_names.pkl"

    # Save full pipeline (scaler + model)
    joblib.dump(pipeline, model_path)
    logger.info("Saved pipeline -> %s", model_path)

    # Save scaler separately for standalone use
    scaler = pipeline.named_steps["scaler"]
    joblib.dump(scaler, scaler_path)
    logger.info("Saved scaler -> %s", scaler_path)

    # Save label encoder
    joblib.dump(label_encoder, encoder_path)
    logger.info("Saved label encoder -> %s", encoder_path)

    # Save feature names for consistency verification at inference time
    joblib.dump(feature_names, features_path)
    logger.info("Saved feature names -> %s", features_path)

    print(f"\n  Model artifacts saved to: {output_dir.resolve()}")
    print(f"     neuro_risk_model.pkl  ({model_path.stat().st_size / 1024:.1f} KB)")
    print(f"     scaler.pkl            ({scaler_path.stat().st_size / 1024:.1f} KB)")
    print(f"     label_encoder.pkl     ({encoder_path.stat().st_size / 1024:.1f} KB)")
    print(f"     feature_names.pkl     ({features_path.stat().st_size / 1024:.1f} KB)")


# ═══════════════════════════════════════════════════════════════════════════════
#  CLI ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Train Cognitive Echo Sentinel acoustic risk model (tabular)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Example:\n"
            "  python -m app.ml.train_acoustic_model \\\n"
            "      --dataset ./Parkinson_Multiple_Sound_Recording \\\n"
            "      --output  ./app/models\n"
        ),
    )
    parser.add_argument(
        "--dataset",
        type=Path,
        default=Path("./Parkinson_Multiple_Sound_Recording"),
        help="Path to dataset directory containing train_data.txt / test_data.txt",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("./app/models"),
        help="Directory to save model artifacts (default: ./app/models)",
    )
    return parser.parse_args()


def main() -> None:
    """Main training entry point."""
    args = parse_args()

    print()
    print("Cognitive Echo Sentinel - Acoustic Risk Model Trainer (Tabular)")
    print("=" * 60)
    print(f"  Dataset  : {args.dataset.resolve()}")
    print(f"  Output   : {args.output.resolve()}")
    print("=" * 60)
    print()

    # 1. Load dataset
    logger.info("Step 1/3: Loading dataset ...")
    X, y, feature_names, class_names = load_dataset(args.dataset)

    # 2. Train & evaluate
    logger.info("Step 2/3: Training & evaluating ...")
    pipeline, label_encoder = train_and_evaluate(X, y, feature_names, class_names)

    # 3. Save
    logger.info("Step 3/3: Saving model artifacts ...")
    save_artifacts(pipeline, label_encoder, feature_names, args.output)

    print("\nTraining complete!\n")


if __name__ == "__main__":
    main()
