import pytest
from unittest.mock import MagicMock
from services.firebase_service import FirebaseService
from utils.exceptions import ResourceNotFoundError

def test_get_document_success(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"name": "test"}
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc
    
    result = FirebaseService.get_document("users", "123")
    assert result == {"name": "test"}

def test_get_document_not_found(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = False
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc
    
    with pytest.raises(ResourceNotFoundError):
        FirebaseService.get_document("users", "123")

def test_create_document_with_id(mock_db):
    FirebaseService.create_document("users", {"name": "test"}, "123")
    mock_db.collection.return_value.document.assert_called_with("123")
    mock_db.collection.return_value.document.return_value.set.assert_called_with({"name": "test"})

def test_create_document_without_id(mock_db):
    mock_ref = MagicMock()
    mock_ref.id = "auto_123"
    mock_db.collection.return_value.document.return_value = mock_ref
    
    doc_id = FirebaseService.create_document("users", {"name": "test"})
    assert doc_id == "auto_123"
    mock_ref.set.assert_called_with({"name": "test", "id": "auto_123"})

def test_update_document_success(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc
    
    FirebaseService.update_document("users", "123", {"name": "new_test"})
    mock_db.collection.return_value.document.return_value.update.assert_called_with({"name": "new_test"})

def test_delete_document_success(mock_db):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc
    
    FirebaseService.delete_document("users", "123")
    mock_db.collection.return_value.document.return_value.delete.assert_called_once()
