"""
ThreatLens ML Service – FastAPI Microservice.

Endpoints:
- POST /predict: Core URL classification endpoint per specification.
- GET /health: Health check and model metadata.
- POST /api/v1/analyze/url: Backward-compatible endpoint for ThreatLens Node.js backend.
"""

from contextlib import asynccontextmanager
import os
import sys
from typing import Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from predict import (
    ModelNotLoadedError,
    PhishingPredictor,
    URLValidationError,
    get_predictor,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup and cache predictor."""
    print("ThreatLens ML Service starting up...")
    try:
        predictor = get_predictor()
        print(f"✓ Model '{predictor.model_name}' loaded successfully at startup.")
    except Exception as e:
        print(f"⚠ Warning: Model could not be loaded at startup: {e}")
    yield
    print("ThreatLens ML Service shutting down.")


app = FastAPI(
    title="ThreatLens ML Phishing Detection API",
    description="Machine Learning service for classifying URLs as PHISHING or LEGITIMATE.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration to allow local frontend and backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request & Response Models
class PredictRequest(BaseModel):
    url: str = Field(
        ...,
        description="The target URL to be analyzed.",
        examples=["https://example.com"],
    )


class PredictResponse(BaseModel):
    url: str
    ml_prediction: str
    ml_confidence: float
    model: str


class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool
    model_name: str
    version: str


class BackendAnalysisResponse(BaseModel):
    url: str
    risk_score: int
    risk_level: str
    verdict: str
    analysis: dict[str, Any]


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Health check endpoint providing model status and service metadata."""
    try:
        predictor = get_predictor()
        is_loaded = predictor.model is not None
        model_name = predictor.model_name
    except Exception:
        is_loaded = False
        model_name = "None"

    return {
        "status": "healthy" if is_loaded else "degraded",
        "service": "ThreatLens ML Phishing Detection",
        "model_loaded": is_loaded,
        "model_name": model_name,
        "version": "1.0.0",
    }


@app.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    tags=["Prediction"],
)
def predict(request: PredictRequest):
    """
    Classify a URL as PHISHING or LEGITIMATE using the trained ML model.

    Returns the predicted classification, confidence score, and model name.
    """
    if not request.url or not request.url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'url' field cannot be empty or blank.",
        )

    try:
        predictor = get_predictor()
        result = predictor.predict(request.url)
        return {
            "url": result["url"],
            "ml_prediction": result["ml_prediction"],
            "ml_confidence": result["ml_confidence"],
            "model": result["model"],
        }
    except URLValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except ModelNotLoadedError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model unavailable: {e}",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during prediction: {e}",
        ) from e


@app.post(
    "/api/v1/analyze/url",
    response_model=BackendAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Integration"],
)
def analyze_url_for_backend(request: PredictRequest):
    """
    Integration endpoint matching ThreatLens Node.js backend requirements
    (backend/src/services/analysis.service.js).
    """
    if not request.url or not request.url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'url' field cannot be empty or blank.",
        )

    try:
        predictor = get_predictor()
        pred = predictor.predict(request.url, include_features=True)

        is_phish = pred["is_phishing"]
        phish_prob = pred["probability_phishing"]

        # Risk score calibrated 0-100 from phishing probability
        risk_score = int(round(phish_prob * 100))

        if risk_score >= 80:
            risk_level = "critical"
            verdict = "malicious"
        elif risk_score >= 60:
            risk_level = "high"
            verdict = "suspicious"
        elif risk_score >= 30:
            risk_level = "medium"
            verdict = "suspicious"
        else:
            risk_level = "low"
            verdict = "safe"

        return {
            "url": pred["url"],
            "risk_score": risk_score,
            "risk_level": risk_level,
            "verdict": verdict,
            "analysis": {
                "ml_prediction": pred["ml_prediction"],
                "ml_confidence": pred["ml_confidence"],
                "probability_phishing": pred["probability_phishing"],
                "probability_legitimate": pred["probability_legitimate"],
                "model": pred["model"],
                "features": pred.get("features", {}),
            },
        }
    except URLValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except ModelNotLoadedError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)) from e


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

