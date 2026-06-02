from flask import Blueprint, request
from pydantic import BaseModel, EmailStr, ValidationError as PydanticValidationError
import firebase_admin.auth
from utils.exceptions import ValidationError, ResourceNotFoundError, InternalServerError
from utils.formatters import format_success_response
from services.firebase_service import FirebaseService
from middleware.rate_limiter import rate_limit
from middleware.auth import require_auth
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    role: str

class VerifyOtpRequest(BaseModel):
    uid: str
    otp: str

class SetRoleRequest(BaseModel):
    uid: str
    role: str

@auth_bp.route('/register', methods=['POST'])
@rate_limit(limit=10, window=60)
def register():
    try:
        data = RegisterRequest(**request.json)
    except PydanticValidationError as e:
        raise ValidationError({'errors': e.errors()})
        
    try:
        user = firebase_admin.auth.create_user(
            email=data.email,
            password=data.password,
            display_name=data.name,
            phone_number=data.phone
        )
        
        firebase_admin.auth.set_custom_user_claims(user.uid, {'role': data.role})
        
        user_doc = {
            'uid': user.uid,
            'email': data.email,
            'name': data.name,
            'phone': data.phone,
            'role': data.role,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        FirebaseService.create_document('users', user_doc, doc_id=user.uid)
        
        return format_success_response({'uid': user.uid, 'message': 'User registered successfully'}, 201)
    except Exception as e:
        raise InternalServerError({'reason': str(e)})

@auth_bp.route('/verify-otp', methods=['POST'])
@rate_limit(limit=10, window=60)
def verify_otp():
    try:
        data = VerifyOtpRequest(**request.json)
    except PydanticValidationError as e:
        raise ValidationError({'errors': e.errors()})
        
    # In a real app, verify OTP here. For now, we simulate success and return custom token.
    try:
        custom_token = firebase_admin.auth.create_custom_token(data.uid)
        return format_success_response({'token': custom_token.decode('utf-8')})
    except Exception as e:
        raise InternalServerError({'reason': str(e)})

@auth_bp.route('/set-role', methods=['POST'])
@require_auth(roles=['admin'])
@rate_limit(limit=10, window=60)
def set_role():
    try:
        data = SetRoleRequest(**request.json)
    except PydanticValidationError as e:
        raise ValidationError({'errors': e.errors()})
        
    try:
        firebase_admin.auth.set_custom_user_claims(data.uid, {'role': data.role})
        FirebaseService.update_document('users', data.uid, {'role': data.role, 'updated_at': datetime.utcnow().isoformat()})
        return format_success_response({'message': 'Role updated successfully'})
    except ResourceNotFoundError:
        raise
    except Exception as e:
        raise InternalServerError({'reason': str(e)})
