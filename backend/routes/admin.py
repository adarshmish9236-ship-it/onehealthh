from flask import Blueprint, jsonify, g
import datetime

from middleware.auth import require_auth
from middleware.rate_limiter import rate_limit
from services.firebase_service import FirebaseService, db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@require_auth(roles=['admin'])
@rate_limit(limit=100, window=60)
def get_all_users():
    users_stream = db.collection('users').stream()
    users = []
    for user in users_stream:
        u_data = user.to_dict()
        users.append({
            "uid": u_data.get("uid"),
            "email": u_data.get("email"),
            "name": u_data.get("name"),
            "role": u_data.get("role"),
            "created_at": u_data.get("created_at")
        })
    return jsonify({"users": users}), 200

@admin_bp.route('/doctors/<uid>/verify', methods=['PUT'])
@require_auth(roles=['admin'])
@rate_limit(limit=50, window=60)
def verify_doctor(uid):
    from utils.exceptions import ValidationError
    user_doc = FirebaseService.get_document("users", uid)
    if user_doc.get("role") != "doctor":
        raise ValidationError({"reason": "User is not a doctor"})
        
    doctor_profile = user_doc.get("doctor_profile", {})
    doctor_profile["verified"] = True
    doctor_profile["verified_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    doctor_profile["verified_by"] = g.user.get('uid')
    
    FirebaseService.update_document("users", uid, {"doctor_profile": doctor_profile})
    
    return jsonify({"message": "Doctor verified successfully", "doctor_profile": doctor_profile}), 200

@admin_bp.route('/analytics', methods=['GET'])
@require_auth(roles=['admin'])
@rate_limit(limit=50, window=60)
def get_analytics():
    users_stream = db.collection('users').stream()
    records_stream = db.collection('records').stream()
    
    total_patients = 0
    total_doctors = 0
    total_admins = 0
    
    for u in users_stream:
        role = u.to_dict().get("role")
        if role == "patient":
            total_patients += 1
        elif role == "doctor":
            total_doctors += 1
        elif role == "admin":
            total_admins += 1
            
    total_records = sum(1 for _ in records_stream)
    
    return jsonify({
        "total_users": total_patients + total_doctors + total_admins,
        "role_breakdown": {
            "patients": total_patients,
            "doctors": total_doctors,
            "admins": total_admins
        },
        "total_records": total_records
    }), 200
