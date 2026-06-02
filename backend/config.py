import os
import json
from dotenv import load_dotenv

load_dotenv()

class AppConfig:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY')
    FIREBASE_CREDENTIALS_JSON = os.getenv('FIREBASE_CREDENTIALS_JSON')
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID')
    FIREBASE_STORAGE_BUCKET = os.getenv('FIREBASE_STORAGE_BUCKET')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    SENTRY_DSN = os.getenv('SENTRY_DSN')
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
    MAX_UPLOAD_SIZE_MB = int(os.getenv('MAX_UPLOAD_SIZE_MB', 20))

    @classmethod
    def validate(cls):
        required_vars = [
            'SECRET_KEY',
            'FIREBASE_CREDENTIALS_JSON',
            'FIREBASE_PROJECT_ID',
            'FIREBASE_STORAGE_BUCKET',
            'GEMINI_API_KEY'
        ]
        missing = [var for var in required_vars if not getattr(cls, var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        
        # Ensure FIREBASE_CREDENTIALS_JSON is valid JSON
        try:
            json.loads(cls.FIREBASE_CREDENTIALS_JSON)
        except json.JSONDecodeError:
            raise ValueError("FIREBASE_CREDENTIALS_JSON is not a valid JSON string.")

# Run validation on module import
AppConfig.validate()
