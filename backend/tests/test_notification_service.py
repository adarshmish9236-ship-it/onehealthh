import pytest
import datetime
from unittest.mock import MagicMock, patch
from services.notification_service import NotificationService

def test_send_push_notification_success(mock_messaging):
    # Setup mock user doc
    mock_doc = MagicMock()
    mock_doc.get.return_value = ['token_123']
    
    with patch('services.notification_service.FirebaseService.get_document', return_value=mock_doc):
        NotificationService.send_push_notification('user_1', 'Title', 'Body')
        
    mock_messaging.send_multicast.assert_called_once()
    args, kwargs = mock_messaging.send_multicast.call_args
    assert args[0].tokens == ['token_123']
    assert args[0].notification.title == 'Title'

def test_send_push_notification_no_tokens(mock_messaging):
    mock_doc = MagicMock()
    mock_doc.get.return_value = []
    
    with patch('services.notification_service.FirebaseService.get_document', return_value=mock_doc):
        NotificationService.send_push_notification('user_1', 'Title', 'Body')
        
    mock_messaging.send_multicast.assert_not_called()

def test_check_medication_reminders(sample_medication, mock_db, mock_messaging):
    # Setup mock firestore query
    mock_stream = MagicMock()
    mock_doc = MagicMock()
    mock_doc.to_dict.return_value = sample_medication
    mock_doc.id = 'med_123'
    mock_stream.__iter__.return_value = [mock_doc]
    
    mock_db.collection.return_value.where.return_value.stream.return_value = mock_stream
    
    # Mock FirebaseService.get_document to return tokens
    mock_user_doc = MagicMock()
    mock_user_doc.get.return_value = ['token_123']
    
    with patch('services.notification_service.FirebaseService.get_document', return_value=mock_user_doc):
        NotificationService.check_medication_reminders()
        
    # The current time is mocked to match the sample_medication timing within 7 minutes
    mock_messaging.send_multicast.assert_called_once()
    
def test_check_refill_alerts(sample_medication, mock_db, mock_messaging):
    mock_stream = MagicMock()
    mock_doc = MagicMock()
    mock_doc.to_dict.return_value = sample_medication
    mock_doc.id = 'med_123'
    mock_stream.__iter__.return_value = [mock_doc]
    
    mock_db.collection.return_value.where.return_value.stream.return_value = mock_stream
    
    mock_user_doc = MagicMock()
    mock_user_doc.get.return_value = ['token_123']
    
    with patch('services.notification_service.FirebaseService.get_document', return_value=mock_user_doc):
        NotificationService.check_refill_alerts()
        
    mock_messaging.send_multicast.assert_called_once()
    args, kwargs = mock_messaging.send_multicast.call_args
    assert "refill" in args[0].notification.title.lower()
