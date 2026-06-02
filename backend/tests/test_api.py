import pytest
from unittest.mock import patch

def test_health_check(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json == {"status": "healthy"}

def test_unauthorized_access(client):
    # Try to access a protected route without token
    response = client.get('/patients/profile')
    assert response.status_code == 401

@patch('middleware.auth.auth.verify_id_token')
def test_authorized_access_patient(mock_verify, client):
    # Mock firebase token verification
    mock_verify.return_value = {
        'uid': 'test_user_123',
        'role': 'patient'
    }
    
    with patch('routes.patients.FirebaseService.get_document') as mock_get_doc:
        mock_get_doc.return_value = {'name': 'Test User', 'role': 'patient'}
        response = client.get('/patients/profile', headers={'Authorization': 'Bearer test_token'})
        assert response.status_code == 200
        assert response.json['data']['name'] == 'Test User'

@patch('middleware.auth.auth.verify_id_token')
def test_authorized_access_wrong_role(mock_verify, client):
    # Mock firebase token verification for a patient trying to access doctor route
    mock_verify.return_value = {
        'uid': 'test_patient_123',
        'role': 'patient'
    }
    
    response = client.get('/doctors/patients', headers={'Authorization': 'Bearer test_token'})
    assert response.status_code == 403
