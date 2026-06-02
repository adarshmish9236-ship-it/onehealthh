from flask import Blueprint, request, jsonify, g
from pydantic import ValidationError as PydanticValidationError
import uuid

from middleware.auth import require_auth
from middleware.rate_limiter import rate_limit
from services.medication_service import MedicationService
from utils.exceptions import ValidationError

medications_bp = Blueprint('medications', __name__)

@medications_bp.route('', methods=['GET'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=100, window=60)
def get_medications():
    role = g.user.get('role')
    if role == 'doctor':
        uid = request.args.get('patient_uid')
        if not uid:
            raise ValidationError({"reason": "patient_uid is required for doctors"})
    else:
        uid = g.user.get('uid')
        
    meds = MedicationService.get_medications(uid)
    return jsonify(meds), 200

@medications_bp.route('', methods=['POST'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=50, window=60)
def create_medication():
    try:
        data = request.get_json()
        data['id'] = str(uuid.uuid4())
        
        patient_uid = data.get('patient_uid')
        if not patient_uid:
            if g.user.get('role') == 'patient':
                patient_uid = g.user.get('uid')
            else:
                raise ValidationError({"reason": "patient_uid is required"})
                
        med = MedicationService.create_medication(patient_uid, data)
        return jsonify(med), 201
    except PydanticValidationError as e:
        raise ValidationError({"errors": e.errors()})

@medications_bp.route('/<med_id>', methods=['GET'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=100, window=60)
def get_medication(med_id):
    role = g.user.get('role')
    if role == 'doctor':
        uid = request.args.get('patient_uid')
        if not uid:
            raise ValidationError({"reason": "patient_uid is required for doctors"})
    else:
        uid = g.user.get('uid')
        
    med = MedicationService.get_medication(med_id, uid)
    return jsonify(med), 200

@medications_bp.route('/<med_id>', methods=['PUT'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=50, window=60)
def update_medication(med_id):
    role = g.user.get('role')
    if role == 'doctor':
        uid = request.args.get('patient_uid')
        if not uid:
            raise ValidationError({"reason": "patient_uid is required for doctors"})
    else:
        uid = g.user.get('uid')
        
    try:
        data = request.get_json()
        med = MedicationService.update_medication(med_id, uid, data)
        return jsonify(med), 200
    except PydanticValidationError as e:
        raise ValidationError({"errors": e.errors()})

@medications_bp.route('/<med_id>', methods=['DELETE'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=50, window=60)
def delete_medication(med_id):
    role = g.user.get('role')
    if role == 'doctor':
        uid = request.args.get('patient_uid')
        if not uid:
            raise ValidationError({"reason": "patient_uid is required for doctors"})
    else:
        uid = g.user.get('uid')
        
    MedicationService.delete_medication(med_id, uid)
    return jsonify({"message": "Medication deleted successfully"}), 200

@medications_bp.route('/<med_id>/dose', methods=['POST'])
@require_auth(roles=['patient'])
@rate_limit(limit=50, window=60)
def mark_dose(med_id):
    uid = g.user.get('uid')
    data = request.get_json()
    date_str = data.get('date')
    taken = data.get('taken', True)
    
    if not date_str:
        raise ValidationError({"reason": "date is required"})
        
    med = MedicationService.mark_dose(med_id, uid, date_str, taken)
    return jsonify(med), 200
