# ThreatSentinel.ai — Intelligent Phishing & Malicious Website Detection

> **Enterprise Cybersecurity SaaS Platform Frontend**  
> An explainable, multi-vector malicious URL and brand impersonation detection platform combining lexical feature extraction, transport layer cryptographic analysis, HTTP security header hygiene, and simulated threat intelligence correlation.

---

## 🛡️ Project Overview

**ThreatSentinel.ai** is designed for modern Security Operations Centers (SOCs) and web safety analysts to ingest, analyze, and diagnose potentially malicious URLs in real-time. Instead of returning a generic binary safe/unsafe flag, ThreatSentinel correlates multi-pillar intelligence to produce an **explainable 0–100 risk score**, specific severity-rated findings, and actionable remediation steps.

> ⚠️ **Demonstration Notice:**  
> This frontend application operates in **demonstration mode**. All machine learning heuristics, risk scores, certificate validity attributes, and DNS records are computed deterministically client-side to demonstrate UI/UX workflows, responsive visualizations, and SOC telemetry handling without requiring external network probes or live backend dependencies.

---

## ⚡ Technology Stack

- **Framework:** React 19 (JavaScript + JSX)
- **Build System:** Vite 8 (with Rolldown engine & optimized code splitting)
- **Styling:** Tailwind CSS v4 (with `@custom-variant light` and dark theme default)
- **Routing:** React Router v7
- **Data Visualization:** Recharts (Area charts, Donut charts)
- **Icons:** Lucide React
- **Animations:** Framer Motion (page transitions, gauge animations, progression bars)
- **Linting & Code Quality:** ESLint 10 (strict zero-warning policy)

---

## 🚀 Key Features

### 1. High-Impact Cybersecurity Landing Page (`/`)
- Hero section with live search input, quick sample badges, and CTAs.
- Architecture breakdown: 4 core intelligence engines (AI Phishing Detection, SSL/TLS Analysis, Security Header Hygiene, Real-Time Threat Intelligence).
- 3-step inspection workflow walkthrough and interactive platform statistics.
- Seamless dark and light theme toggle with persistent user preference.

### 2. Security Operations Center (SOC) Dashboard (`/dashboard`)
- 4 real-time telemetry stat cards (Total Scans, Phishing Detected, Safe Websites, Suspicious Websites).
- **Interactive Scan Activity AreaChart:** 7-day throughput breakdown by threat category.
- **Threat Distribution Donut Chart:** Categorization into Credential Harvesting, Payment Portals, Brand Impersonation, Malware, and Typosquatting.
- Filterable Recent Scans audit table with risk meters and quick inspection actions.
- Embedded Rapid URL Scanner for instant triage.

### 3. Interactive URL Security Scanner (`/scanner`)
- Large URL input with live JavaScript validation (SSRF-hardened protocol checks).
- 5-stage animated analysis progression:
  1. *URL & SSRF Boundary Validation*
  2. *18-Feature Lexical & Shannon Entropy Analysis*
  3. *Passive HTTP Security Headers Audit*
  4. *Cryptographic TLS & Certificate Check*
  5. *Threat Intelligence Multi-Feed Correlation*
- Curated sample targets with one-click injection and immediate analysis.
- Automatically stores session telemetry and routes to results.

### 4. Explainable Security Scan Results (`/results`)
- Composite 0–100 Risk Score circular gauge with animated arc progression and risk level badges (`LOW`, `SUSPICIOUS`, `HIGH`, `CRITICAL`).
- **5-Pillar Score Breakdown:** ML Analysis (30%), Domain Lexical (20%), Web Security (15%), TLS Certificate (15%), and Threat Feeds (20%).
- **18 URL Characteristics:** Complete lexical audit including Shannon entropy, raw IP flags, subdomain stacking, punycode homographs, and keyword lures.
- **SSL/TLS & HTTP Header Analysis:** Certificate validity, days remaining, cipher suites, HSTS, CSP, and X-Frame-Options status.
- **Findings & Actions:** Copy URL, Rescan, Download `.txt` Audit Report, and Back to Dashboard.

### 5. Deep Security & Cryptographic Analysis (`/security`)
- Socket-level TLS certificate card displaying issuer CA, subject DN, expiration dates, days remaining, and validation badges.
- Comprehensive HTTP defensive header audit for CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy with remediation guidance.
- DNS routing information: A, AAAA, MX, and NS records with DNSSEC and CAA policy status.
- Prioritized security findings table.

### 6. Audited Scan History (`/history`)
- Complete historical record of all simulated scans stored persistently in `localStorage`.
- Real-time search by URL and domain name.
- Filter by Risk Level (`Critical`, `High`, `Suspicious`, `Low`) and Prediction (`Phishing`, `Suspicious`, `Legitimate`).
- Sort by date (newest/oldest) and risk score (highest/lowest).
- "View Report" action to open deep telemetry for any historical scan.
- Clear History action with modal confirmation.
- CSV export for corporate compliance logging.

---

## 📁 Project Structure

```text
phishing-detection-frontend/
├── public/
│   ├── favicon.svg              # Platform SVG favicon
│   └── icons.svg
├── src/
│   ├── assets/                  # Hero and brand images
│   ├── components/
│   │   ├── common/              # Navbar, Footer
│   │   ├── dashboard/           # Sidebar, TopNavbar, StatCard, Charts, RecentScanTable, QuickScanner
│   │   └── results/             # RiskGauge, FindingCard, HeaderAuditRow, CertificateCard
│   ├── context/
│   │   └── ThemeContext.jsx     # Dark/light theme context with localStorage persistence
│   ├── data/
│   │   └── mockData.js          # SOC telemetry, activity stats, sample scans
│   ├── pages/
│   │   ├── LandingPage.jsx      # Cybersecurity SaaS marketing & CTA
│   │   ├── DashboardPage.jsx    # SOC operations overview
│   │   ├── ScannerPage.jsx      # Multi-stage interactive URL scanner
│   │   ├── ScanResultsPage.jsx  # Explainable risk assessment report
│   │   ├── SecurityAnalysisPage.jsx # TLS, DNS, and header deep-dive
│   │   └── ScanHistoryPage.jsx  # Searchable & filterable scan logs
│   ├── services/
│   │   ├── api.js               # Centralized Axios client with interceptors & mode switcher
│   │   ├── scanService.js       # URL scan dispatcher with API normalization & mock fallback
│   │   ├── historyService.js    # Scan history service with API endpoints & local storage sync
│   │   └── securityService.js   # Deep TLS, DNS, & header analysis dispatcher
│   ├── utils/
│   │   ├── simulateScan.js      # Deterministic 18-feature client-side heuristics & report generator
│   │   ├── scanStorage.js       # localStorage scan persistence & history manager
│   │   └── securityAnalysisData.js # Cryptographic and DNS posture generator
│   ├── App.jsx                  # React Router routes definition
│   ├── index.css                # Tailwind CSS v4 variables & custom variants
│   └── main.jsx                 # Entry point
├── .env.example                 # Environment variables template
├── vercel.json                  # Single-Page Application rewrites for Vercel
├── vite.config.js               # Optimized Vite configuration with manual chunking
└── package.json
```

---

## 🛠️ Installation & Local Development

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd HackMatrix/phishing-detection-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Run code quality linting:**
   ```bash
   npm run lint
   ```

5. **Generate a production build:**
   ```bash
   npm run build
   ```

6. **Preview the production build locally:**
   ```bash
   npm run preview
   ```

---

## 🔌 Backend API Integration & Mode Configuration

ThreatSentinel features a decoupled service architecture allowing seamless switching between local demonstration (`mock`) and live backend API (`api`) modes without modifying UI components.

### Environment Configuration

Create a `.env` file in the root of `phishing-detection-frontend/` based on `.env.example`:

```env
# Operating Mode: 'mock' (default standalone demo) or 'api' (connects to live backend)
VITE_DATA_MODE=mock

# Centralized API Base URL (Node.js API Gateway or Python FastAPI service)
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Switching to Live Backend API

1. Set `VITE_DATA_MODE=api` in `.env`.
2. Set `VITE_API_BASE_URL` to your live API endpoint (e.g. `http://localhost:5000/api/v1` or production URL).
3. Restart the dev server (`npm run dev`) or build for production (`npm run build`).

### Automatic Fallback & Resiliency

When `VITE_DATA_MODE=api` is enabled, the centralized services (`scanService`, `historyService`, `securityService`) will attempt live requests. If the backend is temporarily unreachable or returns network/server errors, the frontend gracefully falls back to cached local heuristics, alerts the user with an intuitive status banner, and provides instant **Retry** controls.

---

## 🚢 Deployment Instructions (Vercel)

This application is fully pre-configured for one-click deployment on **Vercel** with SPA routing support.

### Option 1: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Deploy via Vercel Dashboard (GitHub / GitLab / Bitbucket)
1. Push your code to your Git repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Configure the project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `phishing-detection-frontend` (or `./` if deployed standalone)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**. Vercel will build and serve the application globally with SSL and edge caching. The included `vercel.json` ensures all deep links (`/dashboard`, `/scanner`, `/results`, `/security`, `/history`) resolve seamlessly without 404 errors on page refresh.

---

## 📸 Screenshots & Workflow Walkthrough

| Route | View | Description |
|---|---|---|
| `/` | **Landing Page** | ThreatSentinel brand landing page with hero search, platform stats, and workflow steps |
| `/dashboard` | **SOC Dashboard** | Executive telemetry overview with Recharts activity graphs, threat breakdown, and quick scanner |
| `/scanner` | **URL Scanner** | Interactive input with real-time validation, test sample palette, and 5-stage progress animation |
| `/results` | **Scan Results** | Explainable 0-100 gauge, 5-pillar weighting, 18 lexical features, and downloadable audit report |
| `/security` | **Security Analysis** | Deep inspection of SSL certificates, HSTS/CSP security headers, and DNS records |
| `/history` | **Scan History** | Filterable, searchable, and exportable audit trail with modal confirmation controls |

---

## 📄 License & Compliance

Developed for cybersecurity evaluation, educational research, and SOC demonstration. Compliant with RFC 1918 / RFC 4193 SSRF protection baselines.
