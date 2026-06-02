import uuid
from flask import jsonify

def format_error_response(code: str, message: str, status: int, details: dict = None):
    response = {
        "error": {
            "code": code,
            "message": message,
            "status": status,
            "details": details or {},
            "request_id": str(uuid.uuid4())
        }
    }
    return jsonify(response), status

def format_success_response(data: dict, status: int = 200):
    return jsonify(data), status
