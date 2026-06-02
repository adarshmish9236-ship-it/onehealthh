from flask import Blueprint, request, jsonify, g, send_file
from pydantic import ValidationError as PydanticValidationError
import uuid
import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from middleware.auth import require_auth
from middleware.rate_limiter import rate_limit
from services.firebase_service import FirebaseService
from models.user import Profile, User
from utils.exceptions import ValidationError, ResourceNotFoundError

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/profile', methods=['GET'])
@require_auth(roles=['patient'])
@rate_limit(limit=100, window=60)
def get_profile():
    uid = g.user.get('uid')
    try:
        user_data = FirebaseService.get_document("users", uid)
        return jsonify(user_data.get("profile", {})), 200
    except ResourceNotFoundError:
        return jsonify({}), 200

@patients_bp.route('/profile', methods=['PUT'])
@require_auth(roles=['patient'])
@rate_limit(limit=50, window=60)
def update_profile():
    uid = g.user.get('uid')
    try:
        data = request.get_json()
        profile = Profile(**data)
        
        # Merge into user document
        try:
            user_data = FirebaseService.get_document("users", uid)
        except ResourceNotFoundError:
            # Should not happen if registered correctly, but fallback
            user_data = {"uid": uid, "role": "patient", "email": g.user.get('email')}
            
        user_data["profile"] = profile.model_dump(mode='json')
        user_data["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # Avoid overriding full user, use update_document. But we might need create if not exists
        FirebaseService.create_document("users", user_data, doc_id=uid)
        
        return jsonify(user_data["profile"]), 200
    except PydanticValidationError as e:
        raise ValidationError({"errors": e.errors()})

@patients_bp.route('/timeline', methods=['GET'])
@require_auth(roles=['patient', 'doctor'])
@rate_limit(limit=50, window=60)
def get_timeline():
    # Patient uid is themselves if patient, or from query if doctor
    role = g.user.get('role')
    if role == 'doctor':
        uid = request.args.get('patient_uid')
        if not uid:
            raise ValidationError({"reason": "patient_uid is required for doctors"})
    else:
        uid = g.user.get('uid')

    records = FirebaseService.query_documents("records", "patient_uid", "==", uid)
    medications = FirebaseService.query_documents("medications", "patient_uid", "==", uid)
    
    # Sort and aggregate
    timeline = []
    for r in records:
        timeline.append({"type": "record", "date": r.get("date"), "data": r})
    for m in medications:
        timeline.append({"type": "medication", "date": m.get("start_date"), "data": m})
        
    timeline.sort(key=lambda x: x["date"], reverse=True)
    return jsonify({"timeline": timeline}), 200

@patients_bp.route('/emergency-card', methods=['GET'])
@require_auth(roles=['patient', 'admin', 'doctor'])
@rate_limit(limit=50, window=60)
def get_emergency_card():
    # Can also be public if passing a share token, but require_auth is requested
    # We will assume for now it's authenticated. If a share link is used, a different endpoint or auth bypass would be needed.
    # The prompt says "Implement the endpoints from TRD Section 5.2 (profile management, timeline retrieval, emergency card data, and generating the emergency share link)."
    uid = g.user.get('uid')
    user_data = FirebaseService.get_document("users", uid)
    profile = user_data.get("profile", {})
    medications = FirebaseService.query_documents("medications", "patient_uid", "==", uid)
    active_meds = [m for m in medications if m.get("status") == "active"]
    
    emergency_card = {
        "name": user_data.get("name"),
        "blood_group": profile.get("blood_group"),
        "allergies": profile.get("allergies", []),
        "chronic_diseases": profile.get("chronic_diseases", []),
        "emergency_contacts": profile.get("emergency_contacts", []),
        "active_medications": active_meds
    }
    return jsonify(emergency_card), 200

@patients_bp.route('/emergency-share', methods=['POST'])
@require_auth(roles=['patient'])
@rate_limit(limit=10, window=60)
def generate_emergency_share():
    uid = g.user.get('uid')
    token = str(uuid.uuid4())
    expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    
    share_doc = {
        "patient_uid": uid,
        "token": token,
        "expires_at": expiry.isoformat(),
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    FirebaseService.create_document("emergency_shares", share_doc, doc_id=token)
    
    return jsonify({"share_token": token, "expires_at": share_doc["expires_at"]}), 201

@patients_bp.route('/export-report', methods=['GET'])
@require_auth(roles=['patient'])
@rate_limit(limit=10, window=60)
def export_report():
    uid = g.user.get('uid')
    
    try:
        user_data = FirebaseService.get_document("users", uid)
        profile = user_data.get("profile", {})
    except ResourceNotFoundError:
        user_data = {}
        profile = {}
        
    medications = FirebaseService.query_documents("medications", "patient_uid", "==", uid)
    active_meds = [m for m in medications if m.get("status") == "active"]
    
    records = FirebaseService.query_documents("records", "patient_uid", "==", uid)
    
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Health Summary Report")
    
    c.setFont("Helvetica", 12)
    y = height - 80
    
    c.drawString(50, y, f"Name: {user_data.get('name', 'N/A')}")
    y -= 20
    c.drawString(50, y, f"Blood Group: {profile.get('blood_group', 'N/A')}")
    y -= 20
    c.drawString(50, y, f"Allergies: {', '.join(profile.get('allergies', []))}")
    y -= 40
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Active Medications")
    y -= 20
    c.setFont("Helvetica", 12)
    for med in active_meds:
        c.drawString(50, y, f"- {med.get('name')} ({med.get('dosage')})")
        y -= 20
    y -= 20
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Recent Events")
    y -= 20
    c.setFont("Helvetica", 12)
    timeline = []
    for r in records:
        timeline.append({"date": r.get("date"), "desc": f"Record uploaded: {r.get('type', 'N/A')}"})
    for m in medications:
        timeline.append({"date": m.get("start_date"), "desc": f"Medication started: {m.get('name')}"})
        
    timeline.sort(key=lambda x: x["date"], reverse=True)
    for event in timeline[:5]:
        c.drawString(50, y, f"- {event['date'][:10]}: {event['desc']}")
        y -= 20
        if y < 50:
            c.showPage()
            c.setFont("Helvetica", 12)
            y = height - 50
    
    c.save()
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name="health_summary.pdf",
        mimetype="application/pdf"
    )
