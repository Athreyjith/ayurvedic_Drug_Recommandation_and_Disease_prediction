from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models import db, Feedback

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        from flask_jwt_extended import get_jwt_identity
        uid = get_jwt_identity()
        if uid: user_id = int(uid)
    except:
        pass

    fb = Feedback(
        user_id=user_id,
        name=data.get('name', ''),
        email=data.get('email', ''),
        feedback_type=data.get('feedback_type', 'general'),
        message=data.get('message', '')
    )
    db.session.add(fb)
    db.session.commit()
    return jsonify({'message': 'Feedback submitted, thank you!'}), 201

@feedback_bp.route('/all', methods=['GET'])
@jwt_required()
def all_feedback():
    fbs = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify({'feedbacks': [{
        'id': f.id, 'name': f.name, 'email': f.email,
        'feedback_type': f.feedback_type, 'message': f.message,
        'status': f.status, 'created_at': f.created_at.isoformat()
    } for f in fbs]})

@feedback_bp.route('/<int:fb_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve(fb_id):
    fb = Feedback.query.get_or_404(fb_id)
    fb.status = 'resolved'
    db.session.commit()
    return jsonify({'message': 'Marked as resolved'})
