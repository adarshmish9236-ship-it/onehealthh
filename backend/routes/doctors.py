from flask import Blueprint, request, jsonify, g
from pydantic import BaseModel, ValidationError as PydanticValidationError
import datetime
from typing import List, Optional

from middleware.auth import require_auth
from middleware.rate_limiter import rate_limit
from services.firebase_service import FirebaseService, db
from utils.exceptions import ValidationError, ResourceNotFoundError, ConsentRequiredError

doctors_bp = Blueprint('doctors', __name__)

def verify_consent(doctor_uid: str, patient_uid: str):
    consents = db.collection('doctor_consents').where('doctor_uid', '==', doctor_uid).where('patient_uid', '==', patient_uid).where('status', '==', 'active').stream()
    if not list(consents):
        raise ConsentRequiredError({"reason": "No active consent for this patient"})

@doctors_bp.route('/patients', methods=['GET'])
@require_auth(roles=['doctor'])
@rate_limit(limit=100, window=60)
def get_patients():
    doctor_uid = g.user_id
    consents = db.collection('doctor_consents').where('doctor_uid', '==', doctor_uid).where('status', '==', 'active').stream()
    
    patients = []
    for consent in consents:
        c_data = consent.to_dict()
        try:
            patient = FirebaseService.get_document("users", c_data.get('patient_uid'))
            patients.append({
                "uid": patient.get("uid"),
                "name": patient.get("name"),
                "email": patient.get("email"),
                "profile": patient.get("profile", {})
            })
        except ResourceNotFoundError:
            continue
            
    return jsonify({"patients": patients}), 200

@doctors_bp.route('/patients/<patient_uid>/timeline', methods=['GET'])
@require_auth(roles=['doctor'])
@rate_limit(limit=50, window=60)
def get_patient_timeline(patient_uid):
    doctor_uid = g.user_id
    verify_consent(doctor_uid, patient_uid)
    
    records = FirebaseService.query_documents("records", "patient_uid", "==", patient_uid)
    medications = FirebaseService.query_documents("medications", "patient_uid", "==", patient_uid)
    
    timeline = []
    for r in records:
        timeline.append({"type": "record", "date": r.get("date"), "data": r})
    for m in medications:
        timeline.append({"type": "medication", "date": m.get("start_date"), "data": m})
        
    timeline.sort(key=lambda x: x["date"], reverse=True)
    return jsonify({"timeline": timeline}), 200

class DiagnosisRequest(BaseModel):
    title: str
    notes: str
    hospital: str

@doctors_bp.route('/patients/<patient_uid>/diagnosis', methods=['POST'])
@require_auth(roles=['doctor'])
@rate_limit(limit=50, window=60)
def add_diagnosis(patient_uid):
    doctor_uid = g.user_id
    verify_consent(doctor_uid, patient_uid)
    
    try:
        data = request.get_json()
        req = DiagnosisRequest(**data)
        
        doctor_user = FirebaseService.get_document("users", doctor_uid)
        doctor_name = doctor_user.get("name", "Unknown Doctor")
        
        record_doc = {
            "patient_uid": patient_uid,
            "uploaded_by": doctor_uid,
            "type": "diagnosis",
            "date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "title": req.title,
            "metadata": {
                "doctor_name": doctor_name,
                "hospital": req.hospital,
                "doctor_uid": doctor_uid,
                "notes": req.notes
            },
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        doc_id = FirebaseService.create_document("records", record_doc)
        record_doc["id"] = doc_id
        
        return jsonify(record_doc), 201
    except PydanticValidationError as e:
        raise ValidationError({"errors": e.errors()})

class PrescriptionRequest(BaseModel):
    name: str
    dosage: str
    frequency: str
    timing: List[str]
    end_date: str
    instructions: str
    refill_alert_days: int

@doctors_bp.route('/patients/<patient_uid>/prescription', methods=['POST'])
@require_auth(roles=['doctor'])
@rate_limit(limit=50, window=60)
def add_prescription(patient_uid):
    doctor_uid = g.user_id
    verify_consent(doctor_uid, patient_uid)
    
    try:
        data = request.get_json()
        req = PrescriptionRequest(**data)
        
        med_doc = {
            "patient_uid": patient_uid,
            "prescribed_by": doctor_uid,
            "name": req.name,
            "dosage": req.dosage,
            "frequency": req.frequency,
            "timing": req.timing,
            "start_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "end_date": req.end_date,
            "instructions": req.instructions,
            "status": "active",
            "refill_alert_days": req.refill_alert_days,
            "adherence_log": [],
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        doc_id = FirebaseService.create_document("medications", med_doc)
        med_doc["id"] = doc_id
        
        return jsonify(med_doc), 201
    except PydanticValidationError as e:
        raise ValidationError({"errors": e.errors()})

class FollowupRequest(BaseModel):
    title: str
    notes: str
    hospital: str

@doctors_bp.route('/patients/<patient_uid>/followup', methods=['POST'])
@require_auth(roles=['doctor'])
@rate_limit(limit=50, window=60)
def add_followup(patient_uid):
    doctor_uid = g.user_id
    verify_consent(doctor_uid, patient_uid)
    
    try:
        data = request.get_json()
        req = FollowupRequest(**data)
        
        doctor_user = FirebaseService.get_document("users", doctor_uid)
        doctor_name = doctor_user.get("name", "Unknown Doctor")
        
        record_doc = {
            "patient_uid": patient_uid,
            "uploaded_by": doctor_uid,
            "type": "followup",
            "date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "title": req.title,
            "metadata": {
                "doctor_name": doctor_name,
                "hospital": req.hospital,
                "doctor_uid": doctor_uid,
                "notes": req.notes
            },
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        doc_id = FirebaseService.create_document("records", record_doc)
        record_doc["id"] = doc_id
        
        return jsonify(record_doc), 201
    except PydanticValidationError as e:
        raise ValidationError({"errors": e.errors()})
