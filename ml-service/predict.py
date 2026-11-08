"""
ThreatLens ML Service – Prediction Engine.

Handles:
- URL input validation
- Static feature extraction
- Model loading & caching
- Probabilistic confidence estimation
- Structured output formatting
"""

import json
import os
import sys
from typing import Any
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from feature_extraction import (
    FEATURE_NAMES,
    extract_features_dict,
    extract_features_vector,
)

DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "models", "best_model.joblib")
DEFAULT_META_PATH = os.path.join(BASE_DIR, "models", "model_meta.json")


class URLValidationError(ValueError):
    """Raised when URL input is missing, empty, or structurally invalid."""
    pass


class ModelNotLoadedError(RuntimeError):
    """Raised when the serialized model file is missing or unreadable."""
    pass


class PhishingPredictor:
    """Singleton predictor that caches the trained model in memory."""

    def __init__(self, model_path: str = DEFAULT_MODEL_PATH, meta_path: str = DEFAULT_META_PATH):
        self.model_path = model_path
        self.meta_path = meta_path
        self.model = None
        self.meta: dict[str, Any] = {}
        self.model_name = "RandomForest"
        self._load_model()

    def _load_model(self):
        if not os.path.exists(self.model_path):
            raise ModelNotLoadedError(
                f"Model file not found at '{self.model_path}'. "
                "Please run train.py to train and save the model."
            )
        try:
            self.model = joblib.load(self.model_path)
        except Exception as e:
            raise ModelNotLoadedError(f"Failed to load model from '{self.model_path}': {e}") from e

        if os.path.exists(self.meta_path):
            try:
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.meta = json.load(f)
                    self.model_name = self.meta.get("selected_model", "RandomForest")
            except Exception:
                self.model_name = "RandomForest"

    def validate_url(self, url: Any) -> str:
        """Validate input URL. Raises URLValidationError on invalid input."""
        if url is None:
            raise URLValidationError("URL cannot be null or None.")
        if not isinstance(url, str):
            raise URLValidationError(f"URL must be a string, got {type(url).__name__}.")
        cleaned = url.strip()
        if not cleaned:
            raise URLValidationError("URL cannot be empty or blank.")
        if len(cleaned) < 3 or ("." not in cleaned and "localhost" not in cleaned.lower()):
            raise URLValidationError(f"Invalid URL structure: '{cleaned}'. A valid domain or host is required.")
        return cleaned

    def predict(self, raw_url: str, include_features: bool = False) -> dict[str, Any]:
        """
        Classify a single URL.
        Returns a dictionary with prediction label, confidence score, and model name.
        """
        url = self.validate_url(raw_url)

        if self.model is None:
            self._load_model()

        feature_vector = extract_features_vector(url).reshape(1, -1)
        pred_label = int(self.model.predict(feature_vector)[0])

        # Calculate class probabilities
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(feature_vector)[0]
            prob_legit = float(probs[0])
            prob_phish = float(probs[1])
            # Confidence is the probability of the predicted class
            confidence = prob_phish if pred_label == 1 else prob_legit
        else:
            # Fallback if model doesn't support probabilities
            confidence = 1.0
            prob_phish = float(pred_label)
            prob_legit = float(1 - pred_label)

        result: dict[str, Any] = {
            "url": url,
            "ml_prediction": "PHISHING" if pred_label == 1 else "LEGITIMATE",
            "is_phishing": bool(pred_label == 1),
            "ml_confidence": round(confidence, 4),
            "probability_phishing": round(prob_phish, 4),
            "probability_legitimate": round(prob_legit, 4),
            "model": self.model_name,
        }

        if include_features:
            result["features"] = extract_features_dict(url)

        return result


# Module-level cached predictor instance
_predictor_instance: PhishingPredictor | None = None


def get_predictor() -> PhishingPredictor:
    """Get or create the global PhishingPredictor singleton."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = PhishingPredictor()
    return _predictor_instance


def predict_url(url: str, include_features: bool = False) -> dict[str, Any]:
    """Helper function to classify a single URL."""
    return get_predictor().predict(url, include_features=include_features)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
    else:
        target_url = "https://example.com"

    try:
        res = predict_url(target_url, include_features=True)
        print(json.dumps(res, indent=2))
    except Exception as err:
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)

