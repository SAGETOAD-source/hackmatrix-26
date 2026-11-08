"""
ThreatLens ML Service – Automated Test Suite.

Tests:
1. Health endpoint
2. Legitimate URL prediction
3. Phishing URL prediction
4. IP address URL prediction
5. Empty / whitespace URL input (HTTP 400)
6. Invalid URL format (HTTP 400)
7. Malformed request body (HTTP 422)
8. Feature extraction dimensions and sanity
9. Missing model file error handling (HTTP 503 / ModelNotLoadedError)
10. Backend integration endpoint (/api/v1/analyze/url)
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from feature_extraction import (
    FEATURE_NAMES,
    extract_features_dict,
    extract_features_vector,
)
from main import app
from predict import ModelNotLoadedError, PhishingPredictor, URLValidationError

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


class TestFeatureExtraction:
    def test_feature_vector_dimensions(self):
        """Feature vector length must match FEATURE_NAMES count exactly."""
        vec = extract_features_vector("https://example.com/test?query=1")
        assert len(vec) == len(FEATURE_NAMES)
        assert len(FEATURE_NAMES) == 17

    def test_ip_address_detection(self):
        """Feature extraction must flag raw IP address domains."""
        feats = extract_features_dict("http://192.168.1.100/admin")
        assert feats["has_ip_address"] == 1

        feats_clean = extract_features_dict("https://www.wikipedia.org")
        assert feats_clean["has_ip_address"] == 0

    def test_suspicious_tld_detection(self):
        """Feature extraction must identify high-risk TLDs."""
        feats = extract_features_dict("http://secure-update.click/account")
        assert feats["suspicious_tld"] == 1

    def test_empty_string_feature_extraction(self):
        """Feature extraction on empty string returns valid zero-vector without crashing."""
        feats = extract_features_dict("")
        assert len(feats) == len(FEATURE_NAMES)
        assert all(v == 0.0 for v in feats.values())


class TestFastAPIEndpoints:
    def test_health_check(self, client):
        """GET /health should return 200 and healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["model_loaded"] is True
        assert data["model_name"] in ("RandomForest", "LogisticRegression")

    def test_predict_legitimate_url(self, client):
        """POST /predict on standard legitimate domain."""
        response = client.post("/predict", json={"url": "https://www.google.com"})
        assert response.status_code == 200
        data = response.json()
        assert data["url"] == "https://www.google.com"
        assert data["ml_prediction"] == "LEGITIMATE"
        assert 0.5 <= data["ml_confidence"] <= 1.0
        assert data["model"] == "RandomForest"

    def test_predict_phishing_url(self, client):
        """POST /predict on phishing pattern URL."""
        phish_url = "http://paypal-verification-update.com.tk/login/auth.php?session=98213"
        response = client.post("/predict", json={"url": phish_url})
        assert response.status_code == 200
        data = response.json()
        assert data["ml_prediction"] == "PHISHING"
        assert 0.5 <= data["ml_confidence"] <= 1.0
        assert data["model"] == "RandomForest"

    def test_predict_ip_address_url(self, client):
        """POST /predict on raw IP address URL with login path."""
        ip_url = "http://188.128.111.33/iptv/tv1324/login.php"
        response = client.post("/predict", json={"url": ip_url})
        assert response.status_code == 200
        data = response.json()
        assert "ml_prediction" in data
        assert data["ml_confidence"] >= 0.5

    def test_predict_empty_url(self, client):
        """POST /predict with empty URL string should return 400 Bad Request."""
        response = client.post("/predict", json={"url": ""})
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    def test_predict_whitespace_url(self, client):
        """POST /predict with whitespace URL should return 400 Bad Request."""
        response = client.post("/predict", json={"url": "   "})
        assert response.status_code == 400

    def test_predict_invalid_url_structure(self, client):
        """POST /predict with invalid structure (no dot/domain) should return 400."""
        response = client.post("/predict", json={"url": "invalidstring"})
        assert response.status_code == 400

    def test_predict_malformed_json_body(self, client):
        """POST /predict with missing 'url' key should return 422 Unprocessable Entity."""
        response = client.post("/predict", json={"not_url": "https://example.com"})
        assert response.status_code == 422

    def test_backend_integration_endpoint(self, client):
        """POST /api/v1/analyze/url should return risk_score and verdict for Node.js backend."""
        response = client.post("/api/v1/analyze/url", json={"url": "https://www.github.com"})
        assert response.status_code == 200
        data = response.json()
        assert "risk_score" in data
        assert isinstance(data["risk_score"], int)
        assert 0 <= data["risk_score"] <= 100
        assert data["risk_level"] in ("low", "medium", "high", "critical")
        assert data["verdict"] in ("safe", "suspicious", "malicious")
        assert "analysis" in data


class TestErrorHandlingAndEdgeCases:
    def test_missing_model_file_handling(self):
        """Instantiating predictor with nonexistent path raises ModelNotLoadedError."""
        with pytest.raises(ModelNotLoadedError):
            PhishingPredictor(model_path="nonexistent_model.joblib")

    def test_url_validation_rejection(self):
        """URL validation helper rejects None and non-string types."""
        predictor = PhishingPredictor()
        with pytest.raises(URLValidationError):
            predictor.validate_url(None)
        with pytest.raises(URLValidationError):
            predictor.validate_url(12345)
