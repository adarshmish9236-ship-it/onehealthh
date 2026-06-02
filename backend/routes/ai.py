from flask import Blueprint, request, jsonify, g
from middleware.auth import require_auth
from services.gemini_service import (
    analyze_symptoms,
    analyze_report,
    risk_prediction,
    emergency_guidance,
    generate_health_report,
    analyze_feedback
)
from services.report_parser import parse_report_file
from utils.exceptions import APIError, ValidationError
from pydantic import BaseModel, Field, ValidationError as PydanticValidationError
from typing import List, Optional, Dict, Any

ai_bp = Blueprint('ai', __name__)

class PatientContext(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[List[str]] = []
    chronic_diseases: Optional[List[str]] = []
    current_medications: Optional[List[str]] = []

class AnalyzeSymptomsRequest(BaseModel):
    symptoms: List[str] = Field(..., min_length=1)
    duration: str
    patient_context: PatientContext

class RiskPredictionRequest(BaseModel):
    patient_id: str
    patient_context: PatientContext
    health_records_summary: str = ""

class EmergencyGuidanceRequest(BaseModel):
    symptoms_text: str
    patient_context: PatientContext

def format_error(e):
    if isinstance(e, APIError):
        return jsonify({
            "error": {
                "code": e.code,
                "message": e.message,
                "status": e.status
            }
        }), e.status
    return jsonify({
        "error": {
            "code": "INTERNAL_ERROR",
            "message": str(e),
            "status": 500
        }
    }), 500

@ai_bp.route('/analyze-symptoms', methods=['POST'])
@require_auth('patient')
def handle_analyze_symptoms():
    try:
        data = request.get_json()
        if not data:
            raise APIError("VALIDATION_ERROR", "Missing JSON body", 422)
        try:
            req = AnalyzeSymptomsRequest(**data)
        except PydanticValidationError as ve:
            raise APIError("VALIDATION_ERROR", str(ve), 422)
        
        result = analyze_symptoms(
            symptoms=req.symptoms,
            duration=req.duration,
            patient_context=req.patient_context.model_dump()
        )
        return jsonify(result), 200
    except Exception as e:
        return format_error(e)

@ai_bp.route('/analyze-report', methods=['POST'])
@require_auth('patient')
def handle_analyze_report():
    try:
        # Check if multipart form data
        if 'file' not in request.files:
            raise APIError("VALIDATION_ERROR", "Missing file in request", 422)
            
        file = request.files['file']
        if file.filename == '':
            raise APIError("VALIDATION_ERROR", "No selected file", 422)
            
        # Parse patient context from form data
        patient_context_raw = request.form.get('patient_context', '{}')
        import json
        try:
            patient_context_dict = json.loads(patient_context_raw)
            patient_context = PatientContext(**patient_context_dict)
        except Exception:
            patient_context = PatientContext()

        extracted_text = parse_report_file(file.stream, file.filename)
        if not extracted_text:
            raise APIError("VALIDATION_ERROR", "Could not extract text from file", 422)
            
        result = analyze_report(
            report_text=extracted_text,
            patient_context=patient_context.model_dump()
        )
        return jsonify(result), 200
    except Exception as e:
        return format_error(e)

@ai_bp.route('/risk-prediction', methods=['POST'])
@require_auth('patient')
def handle_risk_prediction():
    try:
        data = request.get_json()
        if not data:
            raise APIError("VALIDATION_ERROR", "Missing JSON body", 422)
        try:
            req = RiskPredictionRequest(**data)
        except PydanticValidationError as ve:
            raise APIError("VALIDATION_ERROR", str(ve), 422)
            
        result = risk_prediction(
            patient_context=req.patient_context.model_dump(),
            health_records_context=req.health_records_summary
        )
        return jsonify(result), 200
    except Exception as e:
        return format_error(e)

@ai_bp.route('/emergency-guidance', methods=['POST'])
@require_auth('patient')
def handle_emergency_guidance():
    try:
        data = request.get_json()
        if not data:
            raise APIError("VALIDATION_ERROR", "Missing JSON body", 422)
        try:
            req = EmergencyGuidanceRequest(**data)
        except PydanticValidationError as ve:
            raise APIError("VALIDATION_ERROR", str(ve), 422)
            
        result = emergency_guidance(
            symptoms_text=req.symptoms_text,
            patient_context=req.patient_context.model_dump()
        )
        return jsonify(result), 200
    except Exception as e:
        return format_error(e)

@ai_bp.route('/generate-health-report', methods=['POST'])
@require_auth('patient')
def handle_generate_health_report():
    try:
        data = request.get_json()
        if not data:
            raise APIError("VALIDATION_ERROR", "Missing JSON body", 422)
            
        patient_context = data.get('patient_context', {})
        health_records_summary = data.get('health_records_summary', "")
        
        result = generate_health_report(
            patient_context=patient_context,
            health_records_context=health_records_summary
        )
        return jsonify(result), 200
    except Exception as e:
        return format_error(e)

@ai_bp.route('/analyze-feedback', methods=['POST'])
@require_auth(['doctor', 'patient'])
def handle_analyze_feedback():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            raise APIError("VALIDATION_ERROR", "Missing feedback text", 422)
            
        result = analyze_feedback(data['text'])
        return jsonify(result), 200
    except Exception as e:
        return format_error(e)
