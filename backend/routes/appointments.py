from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Appointment, Message, User
from datetime import datetime

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/book', methods=['POST'])
@jwt_required()
def book():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    appt = Appointment(
        user_id=user_id,
        name=data.get('name'), age=data.get('age'),
        gender=data.get('gender'), disease=data.get('disease'),
        preferred_date=datetime.strptime(data['preferred_date'], '%Y-%m-%d').date(),
        notes=data.get('notes', '')
    )
    db.session.add(appt)
    db.session.commit()
    return jsonify({'message': 'Appointment booked', 'id': appt.id}), 201

@appointments_bp.route('/my', methods=['GET'])
@jwt_required()
def my_appointments():
    user_id = int(get_jwt_identity())
    appts = Appointment.query.filter_by(user_id=user_id).order_by(Appointment.created_at.desc()).all()
    return jsonify({'appointments': [{
        'id': a.id, 'name': a.name, 'age': a.age, 'gender': a.gender,
        'disease': a.disease, 'preferred_date': str(a.preferred_date),
        'notes': a.notes, 'status': a.status, 'doctor_reply': a.doctor_reply,
        'created_at': a.created_at.isoformat()
    } for a in appts]})

@appointments_bp.route('/message', methods=['POST'])
@jwt_required()
def send_message():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    msg = Message(user_id=user_id, content=data.get('content', ''))
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': 'Message sent', 'id': msg.id}), 201

@appointments_bp.route('/messages', methods=['GET'])
@jwt_required()
def my_messages():
    user_id = int(get_jwt_identity())
    msgs = Message.query.filter_by(user_id=user_id).order_by(Message.created_at.desc()).all()
    return jsonify({'messages': [{
        'id': m.id, 'content': m.content, 'reply': m.reply,
        'is_read': m.is_read, 'created_at': m.created_at.isoformat()
    } for m in msgs]})

# ─── Admin/Doctor actions ────────────────────────────────────────────────────

@appointments_bp.route('/all', methods=['GET'])
@jwt_required()
def all_appointments():
    appts = Appointment.query.order_by(Appointment.created_at.desc()).all()
    return jsonify({'appointments': [{
        'id': a.id, 'name': a.name, 'age': a.age, 'gender': a.gender,
        'disease': a.disease, 'preferred_date': str(a.preferred_date),
        'notes': a.notes, 'status': a.status, 'doctor_reply': a.doctor_reply,
        'user_id': a.user_id, 'created_at': a.created_at.isoformat()
    } for a in appts]})

@appointments_bp.route('/<int:appt_id>/update', methods=['PUT'])
@jwt_required()
def update_appointment(appt_id):
    appt = Appointment.query.get_or_404(appt_id)
    data = request.get_json()
    if 'status' in data: appt.status = data['status']
    if 'doctor_reply' in data: appt.doctor_reply = data['doctor_reply']
    db.session.commit()
    return jsonify({'message': 'Updated'})

@appointments_bp.route('/all-messages', methods=['GET'])
@jwt_required()
def all_messages():
    msgs = Message.query.order_by(Message.created_at.desc()).all()
    users = {u.id: u.name for u in User.query.all()}
    return jsonify({'messages': [{
        'id': m.id, 'user_id': m.user_id, 'user_name': users.get(m.user_id, 'Unknown'),
        'content': m.content, 'reply': m.reply,
        'is_read': m.is_read, 'created_at': m.created_at.isoformat()
    } for m in msgs]})

@appointments_bp.route('/messages/<int:msg_id>/reply', methods=['PUT'])
@jwt_required()
def reply_message(msg_id):
    msg = Message.query.get_or_404(msg_id)
    data = request.get_json()
    msg.reply = data.get('reply', '')
    msg.is_read = True
    db.session.commit()
    return jsonify({'message': 'Reply sent'})
