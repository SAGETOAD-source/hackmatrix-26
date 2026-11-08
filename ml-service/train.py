"""
ThreatLens ML Service – Model Training & Evaluation Pipeline.

Trains, evaluates, and compares two models:
1. Baseline: Logistic Regression (with StandardScaler)
2. Main Candidate: Random Forest Classifier

Metrics:
- Accuracy, Precision, Recall, F1-Score, ROC-AUC, Confusion Matrix
- Stratified 80/20 train/test split with fixed random seed (42)

Saves the best validated model and feature metadata to ml-service/models/.
"""

import json
import os
import sys
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Add parent directory to path so feature_extraction can be imported cleanly
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from feature_extraction import FEATURE_NAMES, extract_features_vector

DATA_FILE = os.path.join(BASE_DIR, "data", "dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

RANDOM_SEED = 42


def evaluate_model(name: str, model, X_test: np.ndarray, y_test: np.ndarray) -> dict:
    """Compute standard classification evaluation metrics on test set."""
    y_pred = model.predict(X_test)
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
    else:
        y_prob = y_pred

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    return {
        "model_name": name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "confusion_matrix": {
            "true_negatives": cm[0][0],
            "false_positives": cm[0][1],
            "false_negatives": cm[1][0],
            "true_positives": cm[1][1],
        },
    }


def train_and_evaluate():
    print("=" * 65)
    print("ThreatLens ML Training Pipeline")
    print("=" * 65)

    if not os.path.exists(DATA_FILE):
        raise FileNotFoundError(
            f"Dataset not found at {DATA_FILE}. Run download_dataset.py first."
        )

    print(f"Loading dataset from: {DATA_FILE}")
    df = pd.read_csv(DATA_FILE)
    print(f"Total rows loaded: {len(df)}")
    print(f"Class distribution:\n{df['label'].value_counts().to_string()}\n")

    # Drop any nulls or invalid values
    df = df.dropna(subset=["url", "label"]).reset_index(drop=True)

    print("Extracting features from URLs (this may take a few seconds)...")
    start_feat = time.time()
    feature_matrix = []
    for url in df["url"]:
        feature_matrix.append(extract_features_vector(url))
    X = np.array(feature_matrix, dtype=np.float64)
    y = df["label"].values.astype(int)
    print(f"Feature matrix shape: {X.shape} (extracted in {time.time() - start_feat:.2f}s)")
    print(f"Features: {FEATURE_NAMES}")

    # Stratified Train-Test Split (80% train, 20% test)
    print(f"\nPerforming stratified 80/20 train/test split (seed={RANDOM_SEED})...")
    X_train, X_test, y_train, y_test, urls_train, urls_test = train_test_split(
        X, y, df["url"].values, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )

    print(f"Train sample count: {len(y_train)} (Legitimate: {np.sum(y_train == 0)}, Phishing: {np.sum(y_train == 1)})")
    print(f"Test sample count:  {len(y_test)} (Legitimate: {np.sum(y_test == 0)}, Phishing: {np.sum(y_test == 1)})")

    # -------------------------------------------------------------
    # 1. Baseline Model: Logistic Regression
    # -------------------------------------------------------------
    print("\n" + "-" * 50)
    print("Training Model 1: Logistic Regression (Baseline)...")
    lr_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(random_state=RANDOM_SEED, max_iter=1000, C=1.0))
    ])
    start_lr = time.time()
    lr_pipeline.fit(X_train, y_train)
    lr_time = time.time() - start_lr
    print(f"Logistic Regression trained in {lr_time:.2f}s")

    lr_eval = evaluate_model("LogisticRegression", lr_pipeline, X_test, y_test)
    print(f"  Accuracy:  {lr_eval['accuracy']:.4f}")
    print(f"  Precision: {lr_eval['precision']:.4f}")
    print(f"  Recall:    {lr_eval['recall']:.4f}")
    print(f"  F1-Score:  {lr_eval['f1_score']:.4f}")
    print(f"  ROC-AUC:   {lr_eval['roc_auc']:.4f}")
    print(f"  Confusion Matrix: {lr_eval['confusion_matrix']}")

    # -------------------------------------------------------------
    # 2. Main Candidate: Random Forest Classifier
    # -------------------------------------------------------------
    print("\n" + "-" * 50)
    print("Training Model 2: Random Forest Classifier (Main Candidate)...")
    rf_classifier = RandomForestClassifier(
        n_estimators=150,
        max_depth=20,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=RANDOM_SEED,
        n_jobs=-1
    )
    start_rf = time.time()
    rf_classifier.fit(X_train, y_train)
    rf_time = time.time() - start_rf
    print(f"Random Forest trained in {rf_time:.2f}s")

    rf_eval = evaluate_model("RandomForest", rf_classifier, X_test, y_test)
    print(f"  Accuracy:  {rf_eval['accuracy']:.4f}")
    print(f"  Precision: {rf_eval['precision']:.4f}")
    print(f"  Recall:    {rf_eval['recall']:.4f}")
    print(f"  F1-Score:  {rf_eval['f1_score']:.4f}")
    print(f"  ROC-AUC:   {rf_eval['roc_auc']:.4f}")
    print(f"  Confusion Matrix: {rf_eval['confusion_matrix']}")

    # -------------------------------------------------------------
    # 3. Model Comparison and Selection
    # -------------------------------------------------------------
    print("\n" + "=" * 65)
    print("MODEL COMPARISON SUMMARY")
    print("=" * 65)
    print(f"{'Metric':<15} {'Logistic Regression':<22} {'Random Forest':<20}")
    print("-" * 65)
    for metric in ["accuracy", "precision", "recall", "f1_score", "roc_auc"]:
        print(f"{metric:<15} {lr_eval[metric]:<22} {rf_eval[metric]:<20}")

    if rf_eval["f1_score"] >= lr_eval["f1_score"]:
        best_name = "RandomForest"
        best_model = rf_classifier
        best_eval = rf_eval
        print(f"\n✓ Best Model Selected: Random Forest (F1-Score: {rf_eval['f1_score']})")
    else:
        best_name = "LogisticRegression"
        best_model = lr_pipeline
        best_eval = lr_eval
        print(f"\n✓ Best Model Selected: Logistic Regression (F1-Score: {lr_eval['f1_score']})")

    # Feature Importances (if Random Forest)
    feature_importances = {}
    if hasattr(best_model, "feature_importances_"):
        importances = best_model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]
        print("\nTop Predictive Features:")
        for idx in sorted_indices:
            feat_name = FEATURE_NAMES[idx]
            feat_score = round(float(importances[idx]), 4)
            feature_importances[feat_name] = feat_score
            print(f"  - {feat_name:<26}: {feat_score:.4f}")

    # -------------------------------------------------------------
    # 4. Save Models and Metadata
    # -------------------------------------------------------------
    best_model_path = os.path.join(MODELS_DIR, "best_model.joblib")
    rf_model_path = os.path.join(MODELS_DIR, "random_forest.joblib")
    lr_model_path = os.path.join(MODELS_DIR, "logistic_regression.joblib")
    meta_path = os.path.join(MODELS_DIR, "model_meta.json")

    print(f"\nSaving best model to: {best_model_path}")
    joblib.dump(best_model, best_model_path)
    joblib.dump(rf_classifier, rf_model_path)
    joblib.dump(lr_pipeline, lr_model_path)

    metadata = {
        "selected_model": best_name,
        "feature_names": FEATURE_NAMES,
        "num_features": len(FEATURE_NAMES),
        "random_seed": RANDOM_SEED,
        "training_samples": int(len(y_train)),
        "testing_samples": int(len(y_test)),
        "dataset_total": int(len(df)),
        "evaluation": {
            "logistic_regression": lr_eval,
            "random_forest": rf_eval,
        },
        "feature_importances": feature_importances,
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved evaluation metadata to: {meta_path}")

    print("\n✓ Training and evaluation completed successfully!")
    print("=" * 65)
    return metadata


if __name__ == "__main__":
    train_and_evaluate()

