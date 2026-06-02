from flask import Blueprint, request, jsonify, g
from pydantic import ValidationError as PydanticValidationError
import datetime

from middleware.auth import require_auth
from services.firebase_service import FirebaseService
from services.gemini_service import analyze_feedback
from models.feedback import Feedback, FeedbackAnalysis
from utils.exceptions import ValidationError

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/', methods=['POST'])
@require_auth(roles=['patient'])
def submit_feedback():
    try:
        data = request.get_json()
        feedback = Feedback(**data)
        
        analysis_result = analyze_feedback(feedback.text)
        analysis = FeedbackAnalysis(**analysis_result)
        
        uid = g.user.get('uid')
        
        doc_data = {
            "patient_uid": uid,
            "text": feedback.text,
            "sentiment": analysis.sentiment,
            "insights": analysis.insights,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        doc_id = FirebaseService.create_document("platform_feedback", doc_data)
        doc_data["id"] = doc_id
        
        return jsonify(doc_data), 201
    except PydanticValidationError as e:
        raise ValidationError({"errors": e.errors()})
