from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, User, Prediction, Appointment, Feedback, DrugRecommendation, Message

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    return jsonify({
        'total_users': User.query.filter_by(role='user').count(),
        'total_predictions': Prediction.query.count(),
        'total_appointments': Appointment.query.count(),
        'pending_appointments': Appointment.query.filter_by(status='pending').count(),
        'total_feedback': Feedback.query.count(),
        'pending_messages': Message.query.filter_by(is_read=False).count(),
        'total_drug_recommendations': DrugRecommendation.query.count(),
    })

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def users():
    us = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [{
        'id': u.id, 'name': u.name, 'email': u.email,
        'age': u.age, 'gender': u.gender, 'role': u.role,
        'created_at': u.created_at.isoformat()
    } for u in us]})

@admin_bp.route('/users/<int:uid>', methods=['DELETE'])
@jwt_required()
def delete_user(uid):
    user = User.query.get_or_404(uid)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})
