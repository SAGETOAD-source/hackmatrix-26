import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import predict  # noqa: E402


@asynccontextmanager
async def lifespan(app):
    predict.score_url("example.com")  # warm-up: loads models and the rank list
    yield


app = FastAPI(title="Phishing URL Detection ML Service", version="1.0.0", lifespan=lifespan)


class UrlIn(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048)


class BatchIn(BaseModel):
    urls: list[str] = Field(..., min_length=1, max_length=50)


@app.get("/health")
def health():
    st = predict._load()
    return {"status": "ok", "model": predict.MODEL_NAME,
            "thresholds": {"suspicious": st["t_suspicious"], "likely_phishing": st["t_likely"]}}


@app.post("/predict")
def predict_url(body: UrlIn):
    try:
        return predict.score_url(body.url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        raise HTTPException(status_code=400, detail="could not analyse this URL")


@app.post("/predict/batch")
def predict_batch(body: BatchIn):
    out = []
    for u in body.urls:
        try:
            out.append(predict.score_url(u))
        except Exception as e:
            out.append({"url": u, "error": str(e)[:100]})
    return {"results": out}

