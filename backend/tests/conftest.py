import pytest
import sys
import datetime
from unittest.mock import MagicMock, patch
import os
from dotenv import load_dotenv

# Ensure we load the environment BEFORE checking credentials
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

if not os.environ.get('FIREBASE_CREDENTIALS_JSON'):
    # Mock firebase_admin completely before importing any app modules
    sys.modules['firebase_admin'] = MagicMock()
    sys.modules['firebase_admin.credentials'] = MagicMock()
    sys.modules['firebase_admin.firestore'] = MagicMock()
    sys.modules['firebase_admin.storage'] = MagicMock()
    sys.modules['firebase_admin.messaging'] = MagicMock()
    sys.modules['firebase_admin.auth'] = MagicMock()

from app import create_app
from config import AppConfig

class TestConfig(AppConfig):
    TESTING = True
    FIREBASE_PROJECT_ID = "test-project"
    
@pytest.fixture
def app():
    app = create_app(TestConfig)
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def mock_db():
    with patch('services.firebase_service.db') as mock:
        yield mock

@pytest.fixture
def mock_bucket():
    with patch('services.firebase_service.bucket') as mock:
        yield mock

@pytest.fixture
def mock_messaging():
    with patch('services.notification_service.messaging') as mock:
        yield mock

@pytest.fixture
def sample_medication():
    now = datetime.datetime.now(datetime.timezone.utc)
    return {
        'id': 'med_123',
        'patient_uid': 'user_123',
        'name': 'Aspirin',
        'dosage': '100mg',
        'timing': [now.strftime('%H:%M')],
        'end_date': (now + datetime.timedelta(days=3)).isoformat(),
        'status': 'active'
    }
