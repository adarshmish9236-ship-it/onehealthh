import base64
import json
import uuid
import datetime
from typing import Optional, Dict, Any, List
import firebase_admin
from firebase_admin import credentials, firestore, storage
from werkzeug.datastructures import FileStorage

from config import AppConfig
from utils.exceptions import ResourceNotFoundError, FileTooLargeError, FileTypeInvalidError

def initialize_firebase():
    if not firebase_admin._apps:
        if AppConfig.FIREBASE_CREDENTIALS_JSON:
            try:
                # Attempt to parse as direct JSON string
                cert_dict = json.loads(AppConfig.FIREBASE_CREDENTIALS_JSON)
                cred = credentials.Certificate(cert_dict)
            except ValueError:
                try:
                    # Attempt to decode as base64
                    decoded_cert = base64.b64decode(AppConfig.FIREBASE_CREDENTIALS_JSON).decode('utf-8')
                    cert_dict = json.loads(decoded_cert)
                    cred = credentials.Certificate(cert_dict)
                except Exception:
                    # Fallback to treat it as a file path
                    cred = credentials.Certificate(AppConfig.FIREBASE_CREDENTIALS_JSON)
        else:
            # Fallback to default credentials
            cred = credentials.ApplicationDefault()
            
        firebase_admin.initialize_app(cred, {
            'projectId': AppConfig.FIREBASE_PROJECT_ID,
            'storageBucket': AppConfig.FIREBASE_STORAGE_BUCKET
        })

initialize_firebase()
db = firestore.client()
bucket = storage.bucket()

class FirebaseService:
    ALLOWED_MIME_TYPES = {'application/pdf', 'image/jpeg', 'image/png'}
    MAX_FILE_SIZE = AppConfig.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @staticmethod
    def get_document(collection: str, doc_id: str) -> Dict[str, Any]:
        doc_ref = db.collection(collection).document(doc_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise ResourceNotFoundError({"collection": collection, "doc_id": doc_id})
        return doc.to_dict()

    @staticmethod
    def create_document(collection: str, doc_data: Dict[str, Any], doc_id: Optional[str] = None) -> str:
        if doc_id:
            db.collection(collection).document(doc_id).set(doc_data)
            return doc_id
        else:
            doc_ref = db.collection(collection).document()
            doc_data['id'] = doc_ref.id
            doc_ref.set(doc_data)
            return doc_ref.id

    @staticmethod
    def update_document(collection: str, doc_id: str, doc_data: Dict[str, Any]) -> None:
        doc_ref = db.collection(collection).document(doc_id)
        if not doc_ref.get().exists:
            raise ResourceNotFoundError({"collection": collection, "doc_id": doc_id})
        doc_ref.update(doc_data)

    @staticmethod
    def delete_document(collection: str, doc_id: str) -> None:
        doc_ref = db.collection(collection).document(doc_id)
        if not doc_ref.get().exists:
            raise ResourceNotFoundError({"collection": collection, "doc_id": doc_id})
        doc_ref.delete()

    @staticmethod
    def query_documents(collection: str, field: str, operator: str, value: Any) -> List[Dict[str, Any]]:
        docs = db.collection(collection).where(field, operator, value).stream()
        return [doc.to_dict() for doc in docs]

    @staticmethod
    def upload_file(user_id: str, file: FileStorage, folder: str = "reports") -> str:
        if file.mimetype not in FirebaseService.ALLOWED_MIME_TYPES:
            raise FileTypeInvalidError({"mimetype": file.mimetype, "allowed": list(FirebaseService.ALLOWED_MIME_TYPES)})

        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)

        if file_size > FirebaseService.MAX_FILE_SIZE:
            raise FileTooLargeError({"size": file_size, "limit": FirebaseService.MAX_FILE_SIZE})

        ext = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
        file_name = f"{uuid.uuid4()}.{ext}"
        blob_path = f"{folder}/{user_id}/{file_name}"

        blob = bucket.blob(blob_path)
        blob.upload_from_file(file, content_type=file.mimetype)

        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(days=7),
            method="GET"
        )
        return url
