# OneHealth Platform Backend Blueprint

## System Overview
The OneHealth Platform backend serves as the digital health passport REST API layer. It provides secure, robust, and scalable endpoints for managing patient health records, medication schedules, real-time feedback, and role-based access for doctors and administrators. It integrates deeply with AI services to provide intelligent symptom analysis, report processing, and risk prediction.

## Tech Stack & Matrix
*   **Web Framework:** Flask 3.x
*   **Data Validation:** Pydantic v2
*   **Database & Authentication:** Firebase Admin SDK (Firestore, Storage, Auth)
*   **AI Engine:** Google Gemini 1.5 Pro
*   **Rate Limiting:** In-Memory
*   **Document Generation:** ReportLab
*   **Testing:** pytest

## Environment Configuration
To run the OneHealth backend locally, configure the following environment variables in a `.env` file at the `backend/` directory:

1.  `GEMINI_API_KEY`: Obtain from Google AI Studio. Used for all AI-driven features (symptom checker, PDF parsing).
2.  `FIREBASE_CREDENTIALS_JSON`: Absolute path to your Firebase Service Account JSON key. Required for Firestore, Auth, and Storage. Generate this from the Firebase Console (Project Settings -> Service Accounts).

*Important:* Never commit your `.env` or `firebase_credentials.json` files to version control.

## Complete Directory Blueprint
```text
backend/
├── app.py                      # Application entry point and Flask factory
├── .env                        # Local environment variables (DO NOT COMMIT)
├── .gitignore                  # Backend-specific ignore profile
├── requirements.txt            # Python dependencies
├── README.md                   # Platform documentation (this file)
├── core/
│   ├── config.py               # Environment and application configuration
│   ├── security.py             # Authentication, JWT, and Firebase Auth helpers
│   ├── error_handlers.py       # Global standardized JSON error responses
│   └── rate_limiter.py         # In-memory rate limiting logic
├── models/
│   ├── user.py                 # Pydantic schemas for Users (Patients, Doctors, Admins)
│   ├── record.py               # Pydantic schemas for Health Records
│   ├── medication.py           # Pydantic schemas for Medications and Schedules
│   └── feedback.py             # Pydantic schemas for AI Feedback
├── routes/
│   ├── auth.py                 # Authentication endpoints
│   ├── patients.py             # Patient profile and general endpoints
│   ├── records.py              # Health record management endpoints
│   ├── medications.py          # Medication CRUD endpoints
│   ├── ai_engine.py            # Gemini AI integration endpoints
│   ├── doctors.py              # Doctor-specific management endpoints
│   ├── admin.py                # Admin portal endpoints
│   └── feedback.py             # AI Feedback endpoint
├── services/
│   ├── firebase_service.py     # Firestore and Storage wrapper
│   ├── gemini_service.py       # Gemini AI API wrapper
│   ├── medication_service.py   # Complex medication business logic
│   └── notification_service.py # FCM background notification logic
├── utils/
│   └── helpers.py              # Utility functions (e.g., PDF generation)
└── tests/                      # Pytest suite
    ├── conftest.py             # Test fixtures
    ├── test_auth.py            # Auth route tests
    ├── test_records.py         # Records route tests
    ├── test_medications.py     # Medications route tests
    ├── test_ai_engine.py       # AI Engine route tests
    ├── test_services.py        # Service layer unit tests
    └── test_e2e.py             # End-to-end user lifecycle pipeline
```

## Endpoint Reference Matrix

| Group | Method | Endpoint | Access / Custom Claims | Response Type |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/register` | Public | `{ "message", "uid" }` |
| **Auth** | POST | `/auth/verify-otp` | Public | `{ "token" }` |
| **Auth** | POST | `/auth/set-role` | `admin` | `{ "message" }` |
| **Patients** | GET | `/patients/profile` | `patient` | `UserSchema` |
| **Patients** | PUT | `/patients/profile` | `patient` | `{ "message" }` |
| **Patients** | GET | `/patients/export-report`| `patient` | `application/pdf` |
| **Records** | POST | `/records/` | `patient`, `doctor` | `{ "message", "record_id" }` |
| **Records** | GET | `/records/` | `patient`, `doctor` | `List[RecordSchema]` |
| **Records** | GET | `/records/<id>` | `patient`, `doctor` | `RecordSchema` |
| **Medications**| POST | `/medications/` | `patient`, `doctor` | `{ "message", "med_id" }` |
| **Medications**| GET | `/medications/` | `patient`, `doctor` | `List[MedicationSchema]` |
| **Medications**| PUT | `/medications/<id>`| `patient`, `doctor` | `{ "message" }` |
| **Medications**| DELETE| `/medications/<id>`| `patient`, `doctor` | `{ "message" }` |
| **AI Engine** | POST | `/ai/symptom-checker`| `patient` | `{ "analysis" }` |
| **AI Engine** | POST | `/ai/parse-report` | `patient`, `doctor` | `{ "parsed_data" }` |
| **AI Engine** | POST | `/ai/predict-risk` | `doctor` | `{ "risk_assessment" }` |
| **AI Engine** | GET | `/ai/emergency` | Public | `{ "guidance" }` |
| **Doctors** | GET | `/doctors/patients` | `doctor` | `List[UserSchema]` |
| **Doctors** | GET | `/doctors/patients/<id>`| `doctor` | `UserSchema` |
| **Admin** | GET | `/admin/users` | `admin` | `List[UserSchema]` |
| **Admin** | DELETE| `/admin/users/<id>` | `admin` | `{ "message" }` |
| **Feedback** | POST | `/feedback/` | `patient`, `doctor` | `{ "message" }` |

## Execution & Test Manual

### Native Execution
1.  Ensure Python 3.12+ is installed.
2.  Navigate to the `backend/` directory: `cd backend`
3.  Create a virtual environment: `python -m venv venv`
4.  Activate the virtual environment:
    *   Windows: `venv\Scripts\activate`
    *   Unix/macOS: `source venv/bin/activate`
5.  Install dependencies: `pip install -r requirements.txt`
6.  Run the Flask development server: `flask run` (The API will be available at `http://localhost:5000`).

### Docker Execution (Phase 1 Configuration)
*(Assuming a `Dockerfile` and `docker-compose.yml` are present at the project root)*
1.  Navigate to the project root.
2.  Build and start the containers: `docker-compose up --build -d`
3.  The backend API will be exposed on the configured port (typically 5000).
4.  To view logs: `docker-compose logs -f backend`

### Automated End-to-End Testing pipeline (Phase 8)
To trigger the complete Phase 8 end-to-end user lifecycle pipeline:
1.  Ensure the local environment is active and configured (including Firebase and Gemini credentials).
2.  Navigate to the `backend/` directory: `cd backend`
3.  Run the test suite: `pytest tests/test_e2e.py -v`
4.  For comprehensive coverage reporting across the entire backend: `pytest --cov=. tests/`
