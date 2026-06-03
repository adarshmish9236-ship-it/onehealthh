from functools import wraps
from flask import request, g
import firebase_admin.auth
from utils.exceptions import AuthTokenInvalidError, AuthForbiddenError

def require_auth(roles=None):
    # Normalize roles: accept string or list
    if isinstance(roles, str):
        roles = [roles]

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                raise AuthTokenInvalidError({'reason': 'Missing or invalid Authorization header'})

            token = auth_header.split('Bearer ')[1]
            try:
                decoded_token = firebase_admin.auth.verify_id_token(token)

                # Populate canonical g.user dict (used by most routes)
                g.user = {
                    'uid': decoded_token.get('uid'),
                    'email': decoded_token.get('email', ''),
                    'role': decoded_token.get('role'),
                }
                # Also expose flat aliases for doctors.py backward-compat
                g.user_id = g.user['uid']
                g.role = g.user['role']

                if roles:
                    user_role = g.user['role']
                    if user_role not in roles:
                        raise AuthForbiddenError({'required_roles': roles, 'current_role': user_role})

            except firebase_admin.auth.InvalidIdTokenError:
                raise AuthTokenInvalidError({'reason': 'Invalid ID token'})
            except firebase_admin.auth.ExpiredIdTokenError:
                raise AuthTokenInvalidError({'reason': 'Expired ID token'})
            except firebase_admin.auth.RevokedIdTokenError:
                raise AuthTokenInvalidError({'reason': 'Revoked ID token'})
            except AuthForbiddenError:
                raise
            except Exception as e:
                raise AuthTokenInvalidError({'reason': 'An internal error occurred while validating the token'})

            return f(*args, **kwargs)
        return decorated_function
    return decorator
