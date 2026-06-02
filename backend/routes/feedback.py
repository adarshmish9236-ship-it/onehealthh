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

@feedback_bp.route('/analytics', methods=['GET'])
@require_auth(roles=['patient', 'doctor', 'admin'])
def get_analytics():
    feedbacks = FirebaseService.get_collection("platform_feedback")
    
    total = len(feedbacks)
    if total == 0:
        return jsonify({
            "overall_satisfaction": 0,
            "distribution": {"positive": 0, "neutral": 0, "negative": 0},
            "top_complaints": [],
            "top_appreciations": []
        }), 200
        
    distribution = {"positive": 0, "neutral": 0, "negative": 0}
    for f in feedbacks:
        dist_key = f.get('sentiment', 'neutral').lower()
        if dist_key in distribution:
            distribution[dist_key] += 1
            
    overall_satisfaction = int((distribution["positive"] / total) * 100) if total > 0 else 0
    
    # Just grab some mock themes from the recent ones
    complaints = set()
    appreciations = set()
    for f in feedbacks:
        insights = f.get('insights', {})
        if isinstance(insights, dict):
            for t in insights.get('negative_themes', []):
                complaints.add(t)
            for t in insights.get('positive_themes', []):
                appreciations.add(t)
                
    return jsonify({
        "overall_satisfaction": overall_satisfaction,
        "distribution": distribution,
        "top_complaints": list(complaints)[:3],
        "top_appreciations": list(appreciations)[:3]
    }), 200
