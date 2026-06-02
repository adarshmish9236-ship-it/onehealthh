# 🏥 OneHealth Digital Passport Platform

> **A secure, AI-augmented digital health record system** built for the modern healthcare ecosystem. OneHealth enables patients to own and share their entire medical history, empowers doctors with consent-gated record access, and leverages Google Gemini 1.5 Pro to deliver real-time clinical intelligence.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Ecosystem Architecture](#2-ecosystem-architecture)
3. [Project Directory Tree](#3-project-directory-tree)
4. [Environment Variables Ledger](#4-environment-variables-ledger)
5. [Unified API Reference Matrix](#5-unified-api-reference-matrix)
6. [Bootstrapping Guide](#6-bootstrapping-guide)
7. [Docker Multi-Container Profile](#7-docker-multi-container-profile)
8. [Automated Testing Guide](#8-automated-testing-guide)

---

## 1. System Overview

OneHealth is a **digital health passport** platform that consolidates fragmented medical records into a single, patient-controlled, cryptographically-secured profile. It supports three actor roles:

| Role | Capabilities |
|------|-------------|
| **Patient** | Manage personal health profile; upload/view records; track medications; generate emergency share links; export PDF health reports; AI symptom & risk analysis |
| **Doctor** | Access consent-gated patient timelines; add diagnoses, prescriptions, and follow-up notes |
| **Admin** | List and moderate all platform users; verify doctor credentials; view aggregate analytics |

### Core Feature Pillars

- **Identity & Auth** — Firebase Authentication with custom JWT claims for RBAC
- **Health Records** — Structured Firestore documents + Firebase Storage for file uploads
- **Medication Tracking** — Full CRUD with adherence logging and APScheduler-driven reminders
- **AI Engine** — Gemini 1.5 Pro for symptom analysis, report OCR parsing, risk prediction, emergency guidance, and feedback sentiment
- **Emergency Card** — Shareable, time-limited (24 h) tokenized emergency data card
- **PDF Export** — ReportLab-generated health summary PDF

---

## 2. Ecosystem Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                             │
│                                                                     │
│  React 19 + Vite + TailwindCSS + Zustand                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Firebase JS SDK v12                                         │   │
│  │  • signInWithEmailAndPassword → ID Token (JWT)              │   │
│  │  • getIdToken() → attached as Authorization: Bearer <JWT>   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Axios API Client  (src/services/api.js)                    │   │
│  │  baseURL: VITE_API_BASE_URL → http://localhost:10000/api/v1 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS / JSON
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND  (Flask 3.x / Gunicorn)                  │
│                    host: 0.0.0.0  port: 10000                       │
│                                                                     │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐    │
│  │ CORS Layer   │  │ @require_auth decorator                   │    │
│  │ /api/*       │  │  firebase_admin.auth.verify_id_token(JWT) │    │
│  │ ALLOWED_ORIGINS│ │  → populates g.user{uid, email, role}    │    │
│  └──────────────┘  └──────────────────────────────────────────┘    │
│                                                                     │
│  Blueprints mounted at /api/v1/*                                    │
│  /auth  /patients  /records  /medications  /ai                      │
│  /doctors  /admin  /feedback                                        │
│                                                                     │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐     │
│  │ APScheduler       │  │ Sentry SDK                          │     │
│  │ • medication      │  │ • Flask integration                 │     │
│  │   reminders (1m)  │  │ • traces_sample_rate=1.0            │     │
│  │ • refill alerts   │  └─────────────────────────────────────┘     │
│  │   (daily 10:00Z)  │                                              │
│  └──────────────────┘                                              │
└───────────┬─────────────────────┬───────────────────────────────────┘
            │                     │
            ▼                     ▼
┌───────────────────┐   ┌─────────────────────────────────────────────┐
│  Firebase Admin   │   │  Google Generative AI (Gemini 1.5 Pro)      │
│  SDK v6           │   │  • analyze_symptoms                         │
│  • Firestore      │   │  • analyze_report (OCR via pdfplumber +      │
│  • Firebase Auth  │   │    pytesseract)                             │
│  • Cloud Storage  │   │  • risk_prediction                          │
│  • FCM (push)     │   │  • emergency_guidance                       │
└───────────────────┘   │  • analyze_feedback                         │
                        └─────────────────────────────────────────────┘
```

### Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.x |
| Build Tool | Vite | 8.x |
| CSS Framework | TailwindCSS | 4.x |
| State Management | Zustand | 5.x |
| HTTP Client | Axios | 1.x |
| Backend Framework | Flask | 3.x |
| WSGI Server | Gunicorn | 21.x |
| Auth Platform | Firebase Admin SDK | 6.x |
| Database | Cloud Firestore | — |
| File Storage | Firebase Cloud Storage | — |
| AI Inference | Google Gemini 1.5 Pro | — |
| PDF Generation | ReportLab | 4.x |
| Task Scheduler | APScheduler | 3.x |
| Error Tracking | Sentry SDK | 1.x |
| Data Validation | Pydantic | 2.x |

---

## 3. Project Directory Tree

```
HealthOne/
├── .gitignore                        # Root ignore — frontend artifacts, IDE, env files
├── README.md                         # ← This file
├── firestore.rules                   # Firestore security rules
│
├── backend/
│   ├── .gitignore                    # Python-specific ignores
│   ├── .env                          # ⚠️  NEVER commit — local secrets
│   ├── .env.example                  # Safe template — commit this
│   ├── app.py                        # Application factory (create_app)
│   ├── config.py                     # AppConfig class + env validation
│   ├── requirements.txt              # Pinned Python dependencies
│   ├── Dockerfile                    # Production container definition
│   │
│   ├── middleware/
│   │   ├── auth.py                   # @require_auth RBAC decorator
│   │   └── rate_limiter.py           # Redis-backed sliding window limiter
│   │
│   ├── models/
│   │   ├── user.py                   # User, Profile Pydantic schemas
│   │   ├── record.py                 # HealthRecord schema
│   │   ├── medication.py             # Medication schema
│   │   └── feedback.py              # Feedback, FeedbackAnalysis schemas
│   │
│   ├── routes/
│   │   ├── auth.py                   # POST /register, /verify-otp, /set-role
│   │   ├── patients.py               # Profile, timeline, emergency card, PDF export
│   │   ├── records.py                # Health record CRUD + file upload
│   │   ├── medications.py            # Medication CRUD + dose tracking
│   │   ├── ai.py                     # Gemini inference endpoints
│   │   ├── doctors.py                # Doctor portal — consent-gated patient access
│   │   ├── admin.py                  # Admin portal — user list, analytics, doctor verify
│   │   └── feedback.py              # AI-analysed platform feedback
│   │
│   ├── services/
│   │   ├── firebase_service.py       # Firestore CRUD + Storage upload helpers
│   │   ├── gemini_service.py         # Gemini 1.5 Pro service wrapper
│   │   ├── report_parser.py          # PDF/image OCR text extraction
│   │   ├── medication_service.py     # Medication business logic
│   │   └── notification_service.py  # FCM push + scheduled reminder checks
│   │
│   ├── utils/
│   │   ├── exceptions.py             # Typed API exception hierarchy
│   │   └── formatters.py            # Standardised JSON response formatters
│   │
│   └── tests/
│       ├── conftest.py               # Pytest fixtures (app, mock clients)
│       ├── test_api.py               # Health check & basic smoke tests
│       ├── test_e2e_journey.py       # Full end-to-end user journey suite
│       ├── test_firebase_service.py  # Firebase service unit tests
│       └── test_notification_service.py  # Scheduler / FCM unit tests
│
└── frontend/
    ├── .gitignore                    # Node artifacts, env files
    ├── index.html                    # Vite entry HTML
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    │
    └── src/
        ├── main.jsx                  # React root mount
        ├── App.jsx                   # Router & layout shell
        │
        ├── services/
        │   ├── api.js                # ★ Axios singleton — baseURL /api/v1 + JWT injector
        │   ├── firebase.js           # Firebase app initialisation (no mock fallbacks)
        │   ├── authService.js        # register / login / logout helpers
        │   ├── aiService.js          # Gemini AI endpoint calls
        │   ├── medicationService.js  # Medication CRUD wrappers
        │   └── recordsService.js     # Health record CRUD wrappers
        │
        ├── store/                    # Zustand global state slices
        ├── hooks/                    # Custom React hooks
        ├── components/               # Reusable UI components
        ├── pages/                    # Route-level page components
        ├── styles/                   # Global CSS / design tokens
        └── utils/                   # Shared utility functions
```

---

## 4. Environment Variables Ledger

### 4.1 Backend (`backend/.env`)

| Variable | Required | Description | How to Obtain |
|----------|----------|-------------|---------------|
| `FLASK_ENV` | ✅ | `development` or `production` | Set manually |
| `SECRET_KEY` | ✅ | Cryptographically random 256-bit string | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `FIREBASE_CREDENTIALS_JSON` | ✅ | Full Firebase service-account JSON as a single-line string | Firebase Console → Project Settings → Service Accounts → Generate New Private Key → serialize JSON |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID (e.g. `onehealth-prod`) | Firebase Console → Project Settings |
| `FIREBASE_STORAGE_BUCKET` | ✅ | Cloud Storage bucket (e.g. `onehealth-prod.appspot.com`) | Firebase Console → Storage → Get Started |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key for Gemini 1.5 Pro | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated list of frontend origins | e.g. `http://localhost:5173,https://onehealth.vercel.app` |
| `SENTRY_DSN` | ⬜ | Sentry project DSN for error tracking | [sentry.io](https://sentry.io) → New Project → DSN |
| `MAX_UPLOAD_SIZE_MB` | ⬜ | Max file upload size in MB (default: `20`) | Set manually |

> **Security Note:** `FIREBASE_CREDENTIALS_JSON` must be serialized as a **single JSON string** on one line, not a file path. Use:
> ```bash
> python -c "import json; print(json.dumps(json.load(open('service-account.json'))))"
> ```

### 4.2 Frontend (`frontend/.env`)

| Variable | Required | Description | How to Obtain |
|----------|----------|-------------|---------------|
| `VITE_API_BASE_URL` | ✅ | Backend base URL including `/api/v1` | e.g. `http://localhost:10000/api/v1` or `https://api.onehealth.in/api/v1` |
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Web API key | Firebase Console → Project Settings → Your apps → Web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain | Same as above |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID | Same as above |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Cloud Storage bucket | Same as above |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | FCM sender ID | Same as above |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID | Same as above |

> **Important:** All frontend env vars must be prefixed with `VITE_` to be exposed by Vite. Variables without this prefix are never sent to the browser.

---

## 5. Unified API Reference Matrix

All endpoints are mounted under `/api/v1`. The health check endpoint lives at `/health` (no prefix).

### Health Check

| Verb | Absolute Path | Required Role | Description | Response |
|------|--------------|---------------|-------------|----------|
| `GET` | `/health` | Public | Liveness probe | `200 { status, version }` |

### Phase 3 — Authentication (`/api/v1/auth`)

| Verb | Absolute Path | Required Role | Description | Response |
|------|--------------|---------------|-------------|----------|
| `POST` | `/api/v1/auth/register` | Public | Create Firebase user + Firestore profile; assign custom role claim | `201 { uid, message }` |
| `POST` | `/api/v1/auth/verify-otp` | Public | Verify OTP and issue Firebase custom token | `200 { token }` |
| `POST` | `/api/v1/auth/set-role` | `admin` | Override a user's custom role claim | `200 { message }` |

### Phase 4 — Patients (`/api/v1/patients`)

| Verb | Absolute Path | Required Role | Description | Response |
|------|--------------|---------------|-------------|----------|
| `GET` | `/api/v1/patients/profile` | `patient` | Retrieve authenticated patient's profile | `200 Profile` |
| `PUT` | `/api/v1/patients/profile` | `patient` | Update patient profile fields | `200 Profile` |
| `GET` | `/api/v1/patients/timeline` | `patient`, `doctor` | Chronological health timeline (records + medications) | `200 { timeline[] }` |
| `GET` | `/api/v1/patients/emergency-card` | `patient`, `doctor`, `admin` | Critical health snapshot for emergency use | `200 EmergencyCard` |
| `POST` | `/api/v1/patients/emergency-share` | `patient` | Generate a 24-hour shareable emergency link token | `201 { share_token, expires_at }` |
| `GET` | `/api/v1/patients/export-report` | `patient` | Stream a ReportLab-generated PDF health summary | `200 application/pdf` |

### Phase 4 — Health Records (`/api/v1/records`)

| Verb | Absolute Path | Required Role | Description | Response |
|------|--------------|---------------|-------------|----------|
| `GET` | `/api/v1/records` | `patient`, `doctor` | List all health records for user (doctor requires `?patient_uid=`) | `200 HealthRecord[]` |
| `POST` | `/api/v1/records` | `patient`, `doctor` | Create a new health record | `201 HealthRecord` |
| `GET` | `/api/v1/records/<record_id>` | `patient`, `doctor` | Fetch a single health record | `200 HealthRecord` |
| `PUT` | `/api/v1/records/<record_id>` | `patient`, `doctor` | Update health record fields | `200 HealthRecord` |
| `DELETE` | `/api/v1/records/<record_id>` | `patient`, `doctor` | Delete a health record | `200 { message }` |
| `POST` | `/api/v1/records/upload` | `patient`, `doctor` | Upload a medical document to Firebase Storage | `200 { file_url }` |

### Phase 4 — Medications (`/api/v1/medications`)

| Verb | Absolute Path | Required Role | Description | Response |
|------|--------------|---------------|-------------|----------|
| `GET` | `/api/v1/medications` | `patient`, `doctor` | List all medications | `200 Medication[]` |
| `POST` | `/api/v1/medications` | `patient`, `doctor` | Create a medication entry | `201 Medication` |
| `GET` | `/api/v1/medications/<med_id>` | `patient`, `doctor` | Fetch a single medication | `200 Medication` |
| `PUT` | `/api/v1/medications/<med_id>` | `patient`, `doctor` | Update medication details | `200 Medication` |
| `DELETE` | `/api/v1/medications/<med_id>` | `patient`, `doctor` | Delete a medication | `200 { message }` |
| `POST` | `/api/v1/medications/<med_id>/dose` | `patient` | Mark a dose as taken/skipped for a date | `200 Medication` |

### Phase 5 — AI Engine (`/api/v1/ai`)

| Verb | Absolute Path | Required Role | Description | Response |
|------|--------------|---------------|-------------|----------|
| `POST` | `/api/v1/ai/analyze-symptoms` | `patient` | Gemini 1.5 Pro symptom triage and differential analysis | `200 AIAnalysisResult` |
| `POST` | `/api/v1/ai/analyze-report` | `patient` | OCR + Gemini analysis of an uploaded medical report PDF/image | `200 AIAnalysisResult` |
| `POST` | `/api/v1/ai/risk-prediction` | `patient` | Predictive health risk scoring based on patient context | `200 RiskPredictionResult` |
| `POST` | `/api/v1/ai/emergency-guidance` | `patient` | Real-time emergency triage guidance from symptom text | `200 EmergencyGuidanceResult` |

### Phase 6 — Doctor Portal (`/api/v1/doctors`)

| Verb | Absolute Path | Required Role | Description | Response |
|------|--------------|---------------|-------------|----------|
| `GET` | `/api/v1/doctors/patients` | `doctor` | List all patients who have granted active consent | `200 { patients[] }` |
| `GET` | `/api/v1/doctors/patients/<patient_uid>/timeline` | `doctor` | Consent-verified patient timeline | `200 { timeline[] }` |
| `POST` | `/api/v1/doctors/patients/<patient_uid>/diagnosis` | `doctor` | Add a diagnosis record to patient chart | `201 HealthRecord` |
| `POST` | `/api/v1/doctors/patients/<patient_uid>/prescription` | `doctor` | Add a prescription medication for patient | `201 Medication` |
| `POST` | `/api/v1/doctors/patients/<patient_uid>/followup` | `doctor` | Add a follow-up note to patient chart | `201 HealthRecord` |

### Phase 6 — Admin Portal (`/api/v1/admin`)

| Verb | Absolute Path | Required Role | Description | Response |
|------|--------------|---------------|-------------|----------|
| `GET` | `/api/v1/admin/users` | `admin` | List all registered platform users with role breakdown | `200 { users[] }` |
| `PUT` | `/api/v1/admin/doctors/<uid>/verify` | `admin` | Verify a doctor's credentials | `200 { message, doctor_profile }` |
| `GET` | `/api/v1/admin/analytics` | `admin` | Aggregate platform usage analytics | `200 AnalyticsResult` |

### Phase 8 — Feedback (`/api/v1/feedback`)

| Verb | Absolute Path | Required Role | Description | Response |
|------|--------------|---------------|-------------|----------|
| `POST` | `/api/v1/feedback/` | `patient` | Submit feedback; Gemini analyses sentiment + insights; stored in Firestore | `201 FeedbackDocument` |

---

## 6. Bootstrapping Guide

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | ≥ 3.11 | [python.org](https://python.org) |
| Node.js | ≥ 20 LTS | [nodejs.org](https://nodejs.org) |
| Git | any | [git-scm.com](https://git-scm.com) |
| Docker + Compose | ≥ 24 | [docker.com](https://docker.com) (optional) |

### 6.1 Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/onehealth.git
cd onehealth/HealthOne/backend

# 2. Create and activate a virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env and fill in all required values (see Section 4.1)

# 5. Start the development server
python app.py
# Server starts at http://localhost:10000

# 6. Verify liveness
curl http://localhost:10000/health
# → {"status": "healthy", "version": "1.0.0"}
```

### 6.2 Frontend Setup

```bash
cd ../frontend

# 1. Install Node dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env and fill in all VITE_ values (see Section 4.2)

# 3. Start the Vite dev server
npm run dev
# → Local: http://localhost:5173
```

> **CORS alignment:** `backend/.env` `ALLOWED_ORIGINS` must include `http://localhost:5173` for local development.
> `frontend/.env` `VITE_API_BASE_URL` must be `http://localhost:10000/api/v1`.

---

## 7. Docker Multi-Container Profile

```bash
# From project root (HealthOne/)
docker compose up --build

# Services started:
# - backend  → http://localhost:10000
# - (frontend can be added as a second service)

# Teardown
docker compose down
```

The `backend/Dockerfile` uses Gunicorn as the WSGI entrypoint for production-grade concurrency.

---

## 8. Automated Testing Guide

### 8.1 Backend Test Suite (pytest)

```bash
cd backend

# Activate virtual environment first (see 6.1 step 2)

# Run the full test suite with coverage report
pytest tests/ -v --cov=. --cov-report=term-missing --cov-report=html

# Run only the end-to-end journey tests
pytest tests/test_e2e_journey.py -v

# Run specific test file
pytest tests/test_firebase_service.py -v

# Run with JUnit XML output (for CI pipelines)
pytest tests/ --junitxml=junit-report.xml
```

Coverage HTML report is generated at `backend/htmlcov/index.html`.

### 8.2 Integration Test Notes

The test suite (`tests/conftest.py`) patches Firebase Admin SDK and Gemini services with `pytest-mock` so **no live Firebase project is required** to run tests. Integration tests that hit live endpoints require valid `.env` credentials.

### 8.3 Frontend Linting

```bash
cd frontend

# ESLint static analysis
npm run lint
```

### 8.4 Pre-flight Environment Check

```bash
cd backend

# Verify all required environment variables are set and valid
python verify_env.py
```

---

## Security Considerations

- **JWT Tokens** are verified server-side on every request via `firebase_admin.auth.verify_id_token()`. The client never sees or stores raw tokens beyond the Firebase SDK session.
- **RBAC** is enforced at the decorator level (`@require_auth(roles=[...])`). Route handlers trust `g.user['role']` which is populated exclusively from the verified token claims.
- **ALLOWED_ORIGINS** is parsed from `.env` at startup; `*` is **never** a valid production value.
- **Service Account keys** must never be committed. Use `FIREBASE_CREDENTIALS_JSON` as a serialized JSON string in the environment.
- **Rate Limiting** is applied on all auth and write endpoints via a Redis-backed sliding window.

---

*Generated for OneHealth Platform v1.0.0 — Hackverse 2026*
