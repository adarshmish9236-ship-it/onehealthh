from flask import Blueprint, request, jsonify, g
from pydantic import ValidationError as PydanticValidationError
import datetime
import uuid

from middleware.auth import require_auth
from middleware.rate_limiter import rate_limit
from services.firebase_service import FirebaseService
from models.record import HealthRecord
from utils.exceptions import ValidationError, ResourceNotFoundError, FileTooLargeError, FileTypeInvalidError

records_bp = Blueprint('records', __name__)

@records_bp.route('', methods=['GET'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=100, window=60)
def get_records():
    role = g.user.get('role')
    if role == 'doctor':
        uid = request.args.get('patient_uid')
        if not uid:
            raise ValidationError({"reason": "patient_uid is required for doctors"})
    else:
        uid = g.user.get('uid')
        
    records = FirebaseService.query_documents("records", "patient_uid", "==", uid)
    return jsonify(records), 200

@records_bp.route('', methods=['POST'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=50, window=60)
def create_record():
    try:
        data = request.get_json()
        data['id'] = str(uuid.uuid4())
        data['patient_uid'] = data.get('patient_uid') or g.user.get('uid')
        data['uploaded_by'] = g.user.get('uid')
        data['created_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        data['updated_at'] = data['created_at']
        
        record = HealthRecord(**data)
        doc_id = FirebaseService.create_document("records", record.model_dump(mode='json'), doc_id=record.id)
        
        return jsonify(FirebaseService.get_document("records", doc_id)), 201
    except PydanticValidationError as e:
        raise ValidationError({"errors": e.errors()})

@records_bp.route('/<record_id>', methods=['GET'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=100, window=60)
def get_record(record_id):
    record = FirebaseService.get_document("records", record_id)
    # Check authorization
    if g.user.get('role') == 'patient' and record.get('patient_uid') != g.user.get('uid'):
        raise ResourceNotFoundError()
    return jsonify(record), 200

@records_bp.route('/<record_id>', methods=['PUT'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=50, window=60)
def update_record(record_id):
    record = FirebaseService.get_document("records", record_id)
    if g.user.get('role') == 'patient' and record.get('patient_uid') != g.user.get('uid'):
        raise ResourceNotFoundError()
        
    try:
        data = request.get_json()
        record.update(data)
        record['updated_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        validated_record = HealthRecord(**record)
        FirebaseService.update_document("records", record_id, validated_record.model_dump(mode='json'))
        
        return jsonify(FirebaseService.get_document("records", record_id)), 200
    except PydanticValidationError as e:
        raise ValidationError({"errors": e.errors()})

@records_bp.route('/<record_id>', methods=['DELETE'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=50, window=60)
def delete_record(record_id):
    record = FirebaseService.get_document("records", record_id)
    if g.user.get('role') == 'patient' and record.get('patient_uid') != g.user.get('uid'):
        raise ResourceNotFoundError()
        
    FirebaseService.delete_document("records", record_id)
    return jsonify({"message": "Record deleted successfully"}), 200

@records_bp.route('/upload', methods=['POST'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=20, window=60)
def upload_record_file():
    if 'file' not in request.files:
        raise ValidationError({"reason": "No file provided"})
        
    file = request.files['file']
    if file.filename == '':
        raise ValidationError({"reason": "Empty filename"})
        
    uid = g.user.get('uid')
    url = FirebaseService.upload_file(uid, file, folder="reports")
    
    return jsonify({"file_url": url}), 200
