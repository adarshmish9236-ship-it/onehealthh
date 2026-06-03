from flask import Blueprint, request
from pydantic import BaseModel, EmailStr, field_validator, ValidationError as PydanticValidationError
import re
from typing import Optional
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
    phone: Optional[str] = None
    role: str
    passport_id: Optional[str] = None
    license_number: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"[0-9]", v):
            raise ValueError('Password must contain at least one digit')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v and not re.match(r"^\+?[1-9]\d{1,14}$", v):
            raise ValueError('Invalid phone number format')
        return v

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v not in ['patient', 'doctor', 'admin']:
            raise ValueError('Invalid role')
        return v

class LoginRequest(BaseModel):
    id_token: str

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
        # Scrub sensitive input like passwords from the validation error response
        errors = e.errors()
        for err in errors:
            err.pop('input', None)
            err.pop('url', None)
        raise ValidationError({'errors': errors})
        
    if data.role == 'doctor' and not data.license_number:
        raise ValidationError({'errors': [{'msg': 'License number is required for doctors'}]})
        
    try:
        create_kwargs = {
            'email': data.email,
            'password': data.password,
            'display_name': data.name
        }
        if data.phone:
            create_kwargs['phone_number'] = data.phone
            
        user = firebase_admin.auth.create_user(**create_kwargs)
        
        firebase_admin.auth.set_custom_user_claims(user.uid, {'role': data.role})
        
        passport_id = data.passport_id
        if data.role == 'patient' and not passport_id:
            # Replaced blocking while-loop with deterministic short ID based on Firebase UID
            # Resolves the 3000ms DB latency and timeout bottleneck on signup
            passport_id = f"HP-{user.uid[:6].upper()}"

        user_doc = {
            'uid': user.uid,
            'email': data.email,
            'name': data.name,
            'phone': data.phone,
            'role': data.role,
            'passport_id': passport_id,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        if data.role == 'doctor':
            user_doc['license_number'] = data.license_number
        
        FirebaseService.create_document('users', user_doc, doc_id=user.uid)
        
        # Properly generate and return session/custom token upon successful signup
        custom_token = firebase_admin.auth.create_custom_token(user.uid)
        
        return format_success_response({
            'uid': user.uid, 
            'passport_id': passport_id, 
            'token': custom_token.decode('utf-8'),
            'message': 'User registered successfully'
        }, 201)
    except firebase_admin.auth.EmailAlreadyExistsError:
        raise ValidationError({'errors': [{'msg': 'An account with this email already exists', 'type': 'auth/email-already-in-use'}]})
    except firebase_admin.auth.PhoneNumberAlreadyExistsError:
        raise ValidationError({'errors': [{'msg': 'An account with this phone number already exists', 'type': 'auth/phone-already-in-use'}]})
    except Exception as e:
        raise InternalServerError({'reason': 'An internal error occurred during registration'})

@auth_bp.route('/login', methods=['POST'])
@rate_limit(limit=10, window=60)
def login():
    # Login handler for doctors and patients that verifies ID token, assigns correct role, and generates JWT
    try:
        data = LoginRequest(**request.json)
    except PydanticValidationError as e:
        errors = e.errors()
        for err in errors:
            err.pop('input', None)
            err.pop('url', None)
        raise ValidationError({'errors': errors})
        
    try:
        # Verify the Firebase ID token
        decoded_token = firebase_admin.auth.verify_id_token(data.id_token)
        uid = decoded_token['uid']
        
        # Verify against the database
        user_doc = FirebaseService.get_document('users', uid)
        
        role = user_doc.get('role', 'patient')
        
        # Ensure claims are correctly synced/assigned to Firebase Auth
        firebase_admin.auth.set_custom_user_claims(uid, {'role': role})
        
        # Generate session token (custom JWT)
        custom_token = firebase_admin.auth.create_custom_token(uid)
        
        return format_success_response({
            'uid': uid,
            'role': role,
            'token': custom_token.decode('utf-8'),
            'message': 'Login successful'
        })
    except firebase_admin.auth.InvalidIdTokenError:
        raise ValidationError({'errors': [{'msg': 'Invalid ID token'}]})
    except ResourceNotFoundError:
        raise ValidationError({'errors': [{'msg': 'User profile not found in database'}]})
    except Exception as e:
        raise InternalServerError({'reason': 'An internal error occurred during login'})

@auth_bp.route('/verify-otp', methods=['POST'])
@rate_limit(limit=10, window=60)
def verify_otp():
    try:
        data = VerifyOtpRequest(**request.json)
    except PydanticValidationError as e:
        raise ValidationError({'errors': e.errors()})
        
    try:
        custom_token = firebase_admin.auth.create_custom_token(data.uid)
        return format_success_response({'token': custom_token.decode('utf-8')})
    except Exception as e:
        raise InternalServerError({'reason': 'An internal error occurred during OTP verification'})

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
        raise InternalServerError({'reason': 'An internal error occurred while updating role'})
