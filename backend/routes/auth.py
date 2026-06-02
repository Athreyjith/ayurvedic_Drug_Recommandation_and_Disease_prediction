from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        age=data.get('age'),
        gender=data.get('gender'),
        role=data.get('role', 'user')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': token,
        'user': {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role}
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'id': user.id, 'name': user.name, 'email': user.email,
                    'age': user.age, 'gender': user.gender, 'role': user.role})

@auth_bp.route('/update', methods=['PUT'])
@jwt_required()
def update():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()
    if 'name' in data: user.name = data['name']
    if 'age' in data: user.age = data['age']
    if 'gender' in data: user.gender = data['gender']
    if 'password' in data and data['password']:
        user.password = generate_password_hash(data['password'])
    db.session.commit()
    return jsonify({'message': 'Profile updated'})
