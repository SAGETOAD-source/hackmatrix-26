# <p align="center">🛡️ ThreatLens</p>

<p align="center">
  <strong>Intelligent Multi-Pillar Phishing & Malicious Website Detection Platform</strong><br>
  <em>Built for Hackmatrix-26</em>
</p>

<p align="center">
  <a href="https://hackmatrix-26.vercel.app">
    <img src="https://img.shields.io/badge/Live_Demo-hackmatrix--26.vercel.app-7C5CFF?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="scikit-learn" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

> **🌐 Live Demo:** **[https://hackmatrix-26.vercel.app](https://hackmatrix-26.vercel.app)**  
> *(Note: The backend API and ML service run on free-tier cloud hosting that sleeps when idle. Please allow ~60 seconds for the initial scan to spin up containers on first request.)*  
> *(The web UI header displays **PhishGuard.UV**).*

---

## 📑 Table of Contents

- [📌 Overview](#-overview)
- [⚡ Quick Start (Local, 3 Terminals)](#-quick-start-local-3-terminals)
- [🏗️ System Architecture](#️-system-architecture)
- [🔬 5-Pillar Detection Engine & Scoring](#-5-pillar-detection-engine--scoring)
- [📊 Machine Learning Model & Benchmark Results](#-machine-learning-model--benchmark-results)
- [⚠️ Known Limitations](#️-known-limitations)
- [📁 Repository Structure](#-repository-structure)
- [🔌 API Reference](#-api-reference)
- [🔐 Environment Variables](#-environment-variables)
- [🚀 Cloud Deployment Guide](#-cloud-deployment-guide)
- [🖼️ Screenshots](#️-screenshots)
- [👥 Team & Acknowledgements](#-team--acknowledgements)
- [🎯 Judge Quick Recap](#-judge-quick-recap)

---

## 📌 Overview

**ThreatLens** is an automated, explainable cybersecurity platform built for **Hackmatrix-26**. Users or security analysts submit a target URL and receive:
1. An aggregated **0–100 unified risk score**.
2. A definitive threat classification (**Safe**, **Suspicious**, or **Phishing**).
3. Fine-grained, transparent diagnostics broken down across **5 independent security pillars**: an ensemble ML model, deep lexical URL analysis, cryptographic TLS validation, HTTP security header posture, and known threat-intelligence lookup.

Instead of treating detection as an opaque black box, ThreatLens exposes full signal traceability—letting analysts verify *why* a domain was flagged.

---

## ⚡ Quick Start (Local, 3 Terminals)

Run a complete ThreatLens environment locally from a fresh clone using **Windows PowerShell** (or Linux/macOS).

### 0. Clone Repository

```powershell
git clone https://github.com/SAGETOAD-source/hackmatrix-26.git
cd hackmatrix-26
```

### Terminal 1: Python ML Service (FastAPI)

```powershell
cd ml-service
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
```
> *Runs on `http://127.0.0.1:8000` (interactive docs available at `/docs`).*

### Terminal 2: Node.js Backend API & Database

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Edit .env with your local PostgreSQL credentials or cloud DATABASE_URL
npm run migrate
npm run seed
npm start
```
> *Runs on `http://localhost:5000` (`npm run seed` populates demo indicators; use `npm run seed -- --feed` to also load OpenPhish).*

### Terminal 3: React + Vite Frontend

```powershell
cd phishing-detection-frontend
npm install
# Set VITE_DATA_MODE=api and VITE_API_BASE_URL=http://localhost:5000/api/v1 (or copy .env.example)
npm run dev
```
> *Runs on `http://localhost:5173`.*

<details>
<summary><strong>🐧 Linux / macOS Commands</strong></summary>

```bash
# Terminal 1: ML Service
cd ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000

# Terminal 2: Backend
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm start

# Terminal 3: Frontend
cd phishing-detection-frontend
npm install
npm run dev
```
</details>

### Automated Verification

```powershell
# Unit & integration tests
cd backend
npm test

# End-to-end smoke test (while backend is running)
npm run smoke
```

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User(["👤 User / Security Analyst"]) --> Frontend["💻 React + Vite Frontend (Vercel)"]
    Frontend -->|"HTTPS / REST (JWT Auth)"| BackendAPI["🛡️ Node.js / Express API Gateway (Port 5000)"]

    subgraph Pipeline ["5-Pillar Security Evaluation Engine"]
        direction TB
        Lexical["1. Lexical & Structural Analysis (20%)"]
        TLS["2. TLS/SSL Certificate Audit (15%)"]
        Headers["3. HTTP Security Headers & Redirection (15%)"]
        ThreatIntel["4. Threat Intelligence Match (20%)"]
        MLCall["5. ML Phishing Scorer (30%)"]
        Aggregator["⚖️ Dynamic Risk Score Normalizer & Aggregator"]

        Lexical --> Aggregator
        TLS --> Aggregator
        Headers --> Aggregator
        ThreatIntel --> Aggregator
        MLCall --> Aggregator
    end

    BackendAPI --> Pipeline

    ThreatIntel <-->|"SQL Queries (pg)"| Database[("🗄️ PostgreSQL Database (Neon)")]
    BackendAPI <-->|"Users, Scans, Reports"| Database

    MLCall <-->|"POST /predict"| MLService["🤖 Python FastAPI ML Service (Port 8000)"]
```

---

## 🔬 5-Pillar Detection Engine & Scoring

Each URL scan triggers concurrent evaluations across 5 independent vectors:

| Pillar | Default Weight | Description & Signals Evaluated |
|---|:---:|---|
| **1. ML Phishing Model** | **30%** | Dual-model ensemble (Random Forest + Char n-gram Logistic Regression) analyzing 29 lexical features and Tranco global popularity. |
| **2. Lexical & Structural Analysis** | **20%** | Subdomain depth, raw IP hostnames, `@` symbols, high-abuse TLDs (`.xyz`, `.top`, `.tk`), URL shorteners, and credential lures (`login`, `verify`, `banking`). |
| **3. TLS Certificate Validation** | **15%** | Active cryptographic handshake check: expiration, CA trust chain status, SAN matching, and cleartext HTTP detection. |
| **4. HTTP Security Headers** | **15%** | Passive inspection of defense-in-depth headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and redirect chains. |
| **5. Threat Intelligence Feed** | **20%** | Exact and domain match against active threat feeds stored in PostgreSQL (`threat_intelligence` table). Seeded with demo fixtures and OpenPhish feeds. |

### Dynamic Weight Normalization
If an external or remote component is unavailable (e.g., target domain DNS fails or ML microservice is unreachable), **the check is excluded and remaining weights are renormalized to 100%**. *Unknown status is never assumed to be safe.*

### Risk Thresholds & Verdicts
Calculated score $(0 - 100)$ maps to actionable operational tiers:

| Aggregated Risk Score | Severity Level | Security Verdict | Operational Guidance |
|:---:|:---:|:---:|---|
| **60 – 100** | Critical | 🔴 **Phishing** | Active threat indicators or confirmed phishing patterns. Block navigation immediately. |
| **40 – 59** | High | 🟠 **Phishing** | Strong malicious signals; high structural and model risk. Treat as hostile. |
| **35 – 39** | Medium | 🟡 **Suspicious** | Anomaly detected (missing TLS/headers, suspicious TLD, or borderline ML score). Manual inspection recommended. |
| **0 – 34** | Low | 🟢 **Safe** | Clean lexical footprint, valid certificate, standard security headers, and clean threat feeds. |

*Note: Threshold cut-offs were tuned and validated against a benchmark of 600 live URLs.*

---

## 📊 Machine Learning Model & Benchmark Results

### Model Architecture
- **Classifier:** Ensemble combining a **Random Forest** (29 handcrafted URL features + Tranco rank features) and a **hashed character n-gram Logistic Regression**, averaged.
- **Input:** URL string only (zero network latency, zero DOM rendering, privacy-preserving).
- **Output:** Continuous risk score $(0.0 - 1.0)$, operational tier, and explainable feature trigger reasons.
- **Reputation Cap:** A non-hosting top-1,000 domain is capped at "Suspicious" to minimize false disruptions on major services.

### Benchmark Evaluation (Domain-Grouped Split)
Trained and evaluated on **149,130 test URLs** partitioned with a domain-grouped split (ensuring no domain appeared in both training and test sets):

| Metric | Score | Note |
|---|:---:|---|
| **ROC-AUC** | **0.932** | Area under the ROC curve |
| **PR-AUC** | **0.805** | Precision-Recall AUC on imbalanced classes |
| **F1-Score** | **0.753** | Harmonic mean of precision and recall |
| **Precision** | **0.756** | True positives / total positive calls |
| **Recall** | **0.751** | Captured phishing instances |

### Live Evaluation on 600 Fresh In-the-Wild URLs
Evaluated against 600 real-world active URLs (thresholds tuned on this set):
- **ML-Only ROC-AUC:** `0.915`
- **Full Backend 5-Pillar ROC-AUC:** `0.946`
- **Phishing Tier Recall:** `67.7%` at `4.7%` false alarm rate
- **Suspicious-or-Worse Tier Recall:** `82.0%` at `9.3%` false alarm rate

<details>
<summary><strong>🔁 Model Retraining Instructions</strong></summary>

The pre-trained model files (`models/ensemble.joblib`, `models/ensemble_meta.json`) and Tranco reference dataset (`data/reference/top-1m.csv`) are committed directly to the repo. If you wish to retrain from scratch:

```powershell
cd ml-service
# Ensure data/raw/PhiUSIIL_Phishing_URL_Dataset.csv and data/raw/malicious_phish.csv are in place
.venv\Scripts\python.exe -u src/preprocessing.py
.venv\Scripts\python.exe -u src/train_ensemble.py
```
</details>

---

## ⚠️ Known Limitations

Transparent engineering builds trust. The current version of ThreatLens operates under the following known boundaries:

1. **URL-Only Lexical ML:** The machine learning model inspects only the URL string itself. It does not fetch page HTML, render JavaScript, or capture browser DOM screenshots.
2. **Abused Shared Hosting Platforms:** Phishing attacks hosted on legitimate free providers (e.g. `blogspot.com`, `pages.dev`, `workers.dev`, `firebaseapp.com`) can be missed by the URL-only ML model if the path contains no obvious lure words.
3. **Small Legitimate Websites:** Personal blogs or small developer portfolios (e.g. `github.io`, `.me` domains) lacking security headers may occasionally trigger false-alarm "Suspicious" warnings.
4. **Internationalized / Non-ASCII Domains:** Hostnames using Punycode (`xn--`) or exotic character sets are treated aggressively by heuristic filters and may be over-flagged.

---

## 📁 Repository Structure

```text
hackmatrix-26/
├── backend/                             # Node.js + Express API Gateway
│   ├── migrations/                      # Plain SQL migration files (pg)
│   ├── scripts/                         # E2E smoke tests (smoke.js)
│   ├── seeds/                           # Threat intelligence seed datasets
│   ├── src/
│   │   ├── config/                      # Database pool, migrations, and seed logic
│   │   ├── controllers/                 # Auth, scan, report, and intelligence handlers
│   │   ├── middleware/                  # JWT auth, rate limiting, and Zod validation
│   │   ├── routes/                      # Express route definitions (/api/v1/...)
│   │   ├── services/                    # Analysis, TLS, ML client, and threat-intel lookup
│   │   ├── utils/                       # JWT sign/verify utilities
│   │   ├── validators/                  # Zod validation schemas
│   │   ├── app.js                       # Express app configuration & middleware
│   │   └── server.js                    # Server bootstrap
│   ├── tests/                           # Node test runner suite
│   ├── .env.example                     # Backend environment template
│   └── package.json
│
├── ml-service/                          # Python + FastAPI ML Microservice
│   ├── app/
│   │   └── main.py                      # FastAPI routes (/health, /predict, /predict/batch)
│   ├── data/
│   │   └── reference/                   # Tranco top-1M reference dataset (in git)
│   ├── models/                          # Serialized ensemble model & metadata (in git)
│   ├── src/                             # Preprocessing, feature extraction, and training
│   ├── requirements.txt                 # Python dependencies (scikit-learn, fastapi, uvicorn)
│   └── README.md
│
└── phishing-detection-frontend/         # React 19 + Vite + Tailwind CSS Single-Page App
    ├── public/                          # Static assets & icons
    ├── src/
    │   ├── components/                  # Navbar, forms, cards, radar charts, modals
    │   ├── context/                     # Theme and auth state providers
    │   ├── pages/                       # ScanResultsPage, History, Dashboard, Intel
    │   ├── services/                    # API client (Axios) and scan normalizers
    │   ├── utils/                       # Local simulated scan fallback engine
    │   ├── App.jsx                      # Router & layout entry point
    │   └── main.jsx
    ├── .env.example                     # Frontend environment template
    └── package.json
```

---

## 🔌 API Reference

### Backend API (`/api/v1`) — Node.js & Express

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/v1/auth/register` | Public | Register a new analyst account (Zod validated, rate-limited). |
| `POST` | `/api/v1/auth/login` | Public | Authenticate analyst and return JWT access token. |
| `GET` | `/api/v1/auth/me` | Bearer | Retrieve profile for authenticated user. |
| `GET` | `/api/v1/health` | Public | Service health and uptime check. |
| `POST` | `/api/v1/scans` | Bearer | Submit a target URL for automated 5-pillar analysis. |
| `GET` | `/api/v1/scans` | Bearer | Fetch scan history for the authenticated user. |
| `GET` | `/api/v1/scans/:id` | Bearer | Fetch full scan details, component scores, and recommendations. |
| `POST` | `/api/v1/reports` | Bearer | Submit a community threat report for a malicious URL. |
| `GET` | `/api/v1/reports` | Bearer | List submitted community threat reports. |
| `GET` | `/api/v1/reports/:id` | Bearer | Retrieve details of a specific threat report. |
| `GET` | `/api/v1/intelligence` | Public | Query indicators stored in the threat intelligence feed. |

### ML Microservice — Python & FastAPI

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service status, loaded model identifier, and threshold parameters. |
| `POST` | `/predict` | Evaluates single URL `{"url": "..."}`; returns risk score, tier, and reasons. |
| `POST` | `/predict/batch` | Evaluates a batch of up to 50 URLs in a single call. |

---

## 🔐 Environment Variables

> **⚠️ Security Warning:** Never commit `.env` files, API keys, database credentials, or JWT secrets to source control.

### Variable Names Reference

| Service | Variable Name | Purpose | Example / Default |
|---|---|---|---|
| **Backend** | `PORT` | Local server port | `5000` |
| **Backend** | `CLIENT_ORIGIN` | Allowed CORS origin (no trailing slash) | `http://localhost:5173` |
| **Backend** | `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| **Backend** | `DATABASE_URL` | PostgreSQL connection string (Neon / local) | `postgresql://...` |
| **Backend** | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Fallback granular DB connection params | *(Used if `DATABASE_URL` not set)* |
| **Backend** | `JWT_SECRET` | Cryptographic secret for signing JWT tokens | *(High-entropy random string)* |
| **Backend** | `JWT_EXPIRES_IN` | Token expiration duration | `15m` |
| **Backend** | `ML_SERVICE_URL` | URL to Python FastAPI service | `http://127.0.0.1:8000` |
| **Frontend** | `VITE_DATA_MODE` | Operation mode (`api` for live backend, `mock` for client demo) | `api` |
| **Frontend** | `VITE_API_BASE_URL` | Base endpoint for the Node backend API | `http://localhost:5000/api/v1` |

<details>
<summary><strong>📄 Backend .env Example Template</strong></summary>

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development

DATABASE_URL=postgresql://user:password@localhost:5432/threatlens_db
JWT_SECRET=your_secure_random_secret_here
JWT_EXPIRES_IN=15m
ML_SERVICE_URL=http://127.0.0.1:8000
```
</details>

---

## 🚀 Cloud Deployment Guide

ThreatLens is architected for straightforward independent cloud deployment:

### 1. Database (Neon Serverless PostgreSQL)
1. Provision a free PostgreSQL database on [Neon](https://neon.tech).
2. Copy the connection string (`DATABASE_URL`).
3. Run migrations and demo seeds locally against the Neon database:
   ```bash
   DATABASE_URL="your-neon-url" npm run migrate
   DATABASE_URL="your-neon-url" npm run seed
   ```

### 2. Python ML Service (Render / Railway)
1. Deploy `ml-service/` as a Python Web Service.
2. Set build command: `pip install -r requirements.txt`.
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### 3. Node.js Backend API (Render / Railway)
1. Deploy `backend/` as a Node Web Service.
2. Configure Environment Variables:
   - `DATABASE_URL`: Connection string from Neon.
   - `JWT_SECRET`: Random 64-character secret.
   - `CLIENT_ORIGIN`: Exact production frontend URL (e.g. `https://hackmatrix-26.vercel.app`, no trailing slash).
   - `ML_SERVICE_URL`: Deployed URL of the Python ML service.
3. Start command: `npm start`.

### 4. React Frontend (Vercel)
1. Import repository and set root directory to `phishing-detection-frontend`.
2. Configure Environment Variables:
   - `VITE_DATA_MODE=api`
   - `VITE_API_BASE_URL=https://<your-deployed-backend>/api/v1`
3. Deploy.

---

## 🖼️ Screenshots

<!-- Add screenshots here -->
> *Add screenshots here (Scan Results, 5-Pillar Score Breakdown, Radar Chart, Brand Impersonation Warning, Threat Intelligence Table).*

---

## 👥 Team & Acknowledgements

**Built for Hackmatrix-26**

| Role / Contribution | Member |
|---|---|
| **AI / Machine Learning Architecture** | **Krishnendu** |
| *Full-Stack / Backend / Security Analysis* | **Nisat** |
| *Frontend UI / UX & Visualizations* | **Harshit & Sabita** |

---

## 🎯 Judge Quick Recap

- **Live URL:** **[https://hackmatrix-26.vercel.app](https://hackmatrix-26.vercel.app)** *(allow ~60s if containers are sleeping).*
- **Local Run (3 commands):**
  1. `cd ml-service; .venv\Scripts\uvicorn.exe app.main:app --port 8000`
  2. `cd backend; npm run migrate; npm run seed; npm start`
  3. `cd phishing-detection-frontend; npm run dev`
- **Key Technical Highlights:**
  - 5-pillar composite scoring with dynamic re-normalization when checks are unavailable.
  - Transparent feature attribution and SSL handshake verification.
  - Zero external ML dependencies at runtime: model artifacts & Tranco reference are packaged in-repo.
  - Built with Node.js, Express, PostgreSQL, Python, FastAPI, React 19, and Vite.
