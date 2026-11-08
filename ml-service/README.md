# ThreatLens ML Service – Phishing & Malicious Website Detection

A production-ready machine learning microservice for classifying URLs as **PHISHING** or **LEGITIMATE** using static lexical and syntactic feature analysis.

---

## 1. Dataset Sources & Licensing

The training dataset is constructed from reputable, publicly verifiable cybersecurity and domain datasets without synthetic or fabricated data:

| Dataset Source | URL Type | Role | Licensing / Reference |
| :--- | :--- | :--- | :--- |
| **OpenPhish Community Feed** | Phishing | Active zero-day phishing feed | Public community feed ([openphish.com](https://openphish.com/)) |
| **Mitchell Krog Phishing.Database** | Phishing | Verified active phishing repository | MIT License ([github.com/mitchellkrogza/Phishing.Database](https://github.com/mitchellkrogza/Phishing.Database)) |
| **Tranco Top Sites List** | Legitimate | Academic research ranking of top 1M global domains | Tranco Academic License ([tranco-list.eu](https://tranco-list.eu/)) |
| **CISA Official .gov Domain List** | Legitimate | Authoritative US government web infrastructure | US Government Public Domain ([github.com/cisagov/dotgov-data](https://github.com/cisagov/dotgov-data)) |

### Dataset Characteristics
- **Total Samples:** 20,000 URLs
- **Phishing Samples (Label `1`):** 10,000 URLs
- **Legitimate Samples (Label `0`):** 10,000 URLs
- **Class Balance:** Exactly 50% / 50%
- **Preprocessing:** Canonical URL normalization, duplicate removal, cross-class collision removal, stratified 80/20 train/test split.

---

## 2. Extracted Features (Static Analysis)

The feature extraction pipeline (`feature_extraction.py`) extracts **17 static features** without making outbound network requests or visiting suspicious websites:

1. `url_length`: Total character count of the URL.
2. `domain_length`: Character length of the fully qualified domain name.
3. `num_dots`: Total occurrences of the `.` delimiter.
4. `num_hyphens`: Total occurrences of `-` (frequently used in domain impersonation).
5. `num_subdomains`: Number of subdomain labels beyond the second-level domain.
6. `num_digits`: Total numeric digit count.
7. `num_special_chars`: Count of URL-reserved punctuation characters (`_`, `=`, `?`, `&`, `%`, `+`, etc.).
8. `has_ip_address`: Binary indicator (`1` if host is raw IPv4 or IPv6, `0` otherwise).
9. `is_https`: Protocol indicator (`1` for HTTPS, `0` for HTTP).
10. `suspicious_keyword_count`: Frequency of credential-harvesting tokens (`login`, `signin`, `verify`, `account`, `banking`, `secure`, `update`, etc.).
11. `has_at_symbol`: Binary indicator (`1` if `@` delimiter is present, often used to obscure hostname).
12. `is_shortened`: Binary indicator (`1` if domain is a known URL shortening provider).
13. `num_path_segments`: Count of hierarchical path levels.
14. `query_param_count`: Total query string key-value parameters.
15. `suspicious_tld`: Binary indicator (`1` if TLD belongs to high-abuse TLDs such as `.tk`, `.ml`, `.xyz`, `.top`, `.click`, `.buzz`, etc.).
16. `domain_entropy`: Shannon entropy score of the domain name to detect domain generation algorithms (DGA) or random strings.
17. `has_punycode`: Binary indicator (`1` if domain contains `xn--` homograph indicators).

---

## 3. Installation Steps

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- pip

```bash
# Navigate to the service directory
cd ml-service

# (Optional) Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 4. Dataset Acquisition & Training Commands

### Re-download and Prepare Dataset
```bash
python data/download_dataset.py 10000
```
This fetches verified feeds, balances 10,000 legitimate and 10,000 phishing URLs, removes duplicates, and saves to `data/dataset.csv`.

### Train Models & Select Best Classifier
```bash
python train.py
```
This runs a stratified 80/20 split (16,000 training, 4,000 testing, seed=42), trains both Logistic Regression and Random Forest, performs evaluation, selects the best model, and serializes artifacts into `models/`.

---

## 5. Actual Evaluation Results

Evaluated on 4,000 held-out test samples (2,000 legitimate, 2,000 phishing):

| Evaluation Metric | Logistic Regression (Baseline) | Random Forest (Selected Model) |
| :--- | :--- | :--- |
| **Accuracy** | 0.9968 (99.68%) | **0.9985 (99.85%)** |
| **Precision** | 1.0000 (100.0%) | **0.9995 (99.95%)** |
| **Recall** | 0.9935 (99.35%) | **0.9975 (99.75%)** |
| **F1-Score** | 0.9967 | **0.9985** |
| **ROC-AUC** | 1.0000 | **1.0000** |

### Confusion Matrix on Test Set (4,000 URLs)

#### Random Forest (Selected Model):
```text
                  Predicted Legitimate    Predicted Phishing
Actual Legitimate         1,999 (TN)               1 (FP)
Actual Phishing               5 (FN)           1,995 (TP)
```
- **False Positive Rate:** 1 out of 2,000 legitimate sites (0.05%)
- **False Negative Rate:** 5 out of 2,000 phishing sites (0.25%)

### Top Predictive Feature Importances (Random Forest)
1. `num_path_segments` (24.61%)
2. `url_length` (24.08%)
3. `num_digits` (16.54%)
4. `num_special_chars` (13.76%)
5. `num_dots` (9.43%)
6. `is_https` (4.22%)
7. `num_subdomains` (2.94%)
8. `has_ip_address` (1.56%)

---

## 6. API Usage & Endpoints

Start the FastAPI microservice:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation is available at `http://localhost:8000/docs`.

### 1. Health Check
`GET /health`

**Response:**
```json
{
  "status": "healthy",
  "service": "ThreatLens ML Phishing Detection",
  "model_loaded": true,
  "model_name": "RandomForest",
  "version": "1.0.0"
}
```

### 2. URL Prediction
`POST /predict`

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response (Legitimate Example):**
```json
{
  "url": "https://example.com",
  "ml_prediction": "LEGITIMATE",
  "ml_confidence": 0.9964,
  "model": "RandomForest"
}
```

**Response (Phishing Example):**
```json
{
  "url": "http://paypal-verification-update.com.tk/login/auth.php?session=98213",
  "ml_prediction": "PHISHING",
  "ml_confidence": 1.0,
  "model": "RandomForest"
}
```

### 3. Backend Integration Endpoint
`POST /api/v1/analyze/url`

Compatible with ThreatLens Node.js backend (`backend/src/services/analysis.service.js`):
```json
{
  "url": "https://example.com",
  "risk_score": 0,
  "risk_level": "low",
  "verdict": "safe",
  "analysis": {
    "ml_prediction": "LEGITIMATE",
    "ml_confidence": 0.9964,
    "probability_phishing": 0.0036,
    "probability_legitimate": 0.9964,
    "model": "RandomForest",
    "features": { ... }
  }
}
```

---

## 7. Running Tests

Run the full automated pytest suite:
```bash
python -m pytest tests/test_service.py -v
```
All 15 unit and integration tests verify:
- Feature extraction vector consistency (17 features)
- IP address and TLD detection
- Health endpoint status
- Legitimate and phishing classification
- Empty, whitespace, and malformed URL handling (HTTP 400)
- Missing model file error handling (HTTP 503)
- Backend analysis compatibility

---

## 8. Limitations & Security Notice

> [!IMPORTANT]
> **Static URL-Only Classification Cannot Guarantee a Website is Safe.**
> - **Compromised Legitimate Domains:** If a reputable website is compromised and hosts phishing content within a normal URL path, lexical analysis alone may fail to identify it without deep content inspection.
> - **Zero-Day Obfuscation:** Attackers frequently test new domain naming schemes and novel TLD combinations.
> - **Defense in Depth:** ThreatLens treats ML prediction as **one layer (30% weight)** in its unified risk aggregation framework, combining it with TLS certificate validation, HTTP security headers, DNS analysis, and collaborative threat intelligence feeds. ML confidence should never be equated with absolute platform safety.

