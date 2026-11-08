# ThreatLens ML Service (phishing URL risk scorer)

URL-only phishing risk model: Random Forest (handcrafted URL features + Tranco rank)
plus a character n-gram logistic regression, averaged. Output: risk score (0-1), tier,
reasons. It is a risk score, not a calibrated probability.

## Results (unseen domains, domain-grouped split, 149,130 test URLs)
ROC-AUC 0.932 | PR-AUC 0.805 | F1 0.753 (precision 0.756, recall 0.751)
Tiers: low_risk < 0.554 | suspicious >= 0.554 | likely_phishing >= 0.660
(likely_phishing on test: precision 0.83, recall 0.55, false-alarm rate 3.9%)

## Run the API (PowerShell, from ml-service/)
    python -m venv .venv
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    .venv\Scripts\python.exe -m uvicorn app.main:app --port 8000

The model artifacts (`models/ensemble.joblib`, `models/ensemble_meta.json`) and the Tranco reference dataset (`data/reference/top-1m.csv`) ARE included in the repository, so a fresh clone works without extra downloads (see Retrain below if you wish to rebuild them).

## API
- GET  /health
- POST /predict        body {"url": "..."}
- POST /predict/batch  (max about 50 URLs)
Response: url, tier, risk_score, ml_prediction (PHISHING|LEGITIMATE), ml_confidence,
model, reasons[], reputation_capped, domain_in_top_1m.
The Node backend (backend/src/services/ml.service.js) reads ml_prediction,
ml_confidence, model. Set ML_SERVICE_URL=http://127.0.0.1:8000 in backend/.env.

## Retrain (from ml-service/)
Needs data/raw/PhiUSIIL_Phishing_URL_Dataset.csv and data/raw/malicious_phish.csv.
    .venv\Scripts\python.exe -u src/preprocessing.py
    .venv\Scripts\python.exe -u src/train_ensemble.py

## Design notes
- Features use only the URL string (no page content, no network calls).
- URLs are normalized (scheme and leading www removed) in training and in the API.
- Split is grouped by registered domain: no website is in both train and test.
- PhiUSIIL alone has a shortcut (all legit URLs are bare https://www.domain.tld),
  so malicious_phish.csv was added for legit URLs with paths.
- Reputation cap: a non-hosting top-1000 domain can be at most "suspicious".
- Known weaknesses: bare-domain phishing looks like legit sites; non-ASCII hosts
  are over-flagged; popular sites on abused hosting need full-host judgement.
