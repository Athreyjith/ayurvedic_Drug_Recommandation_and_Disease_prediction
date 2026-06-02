from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    role = db.Column(db.String(20), default='user')  # user | admin | doctor
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Prediction(db.Model):
    __tablename__ = 'predictions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    symptom1 = db.Column(db.String(100))
    symptom2 = db.Column(db.String(100))
    symptom3 = db.Column(db.String(100))
    predicted_disease = db.Column(db.String(150))
    confidence = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DrugRecommendation(db.Model):
    __tablename__ = 'drug_recommendations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    disease = db.Column(db.String(150))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    severity = db.Column(db.String(50))
    recommended_drug = db.Column(db.String(200))
    dosage = db.Column(db.Text)
    precautions = db.Column(db.Text)
    contraindications = db.Column(db.Text)
    confidence = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    disease = db.Column(db.String(150))
    preferred_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    admin_note = db.Column(db.Text)
    status = db.Column(db.String(30), default='pending')  # pending|approved|rejected
    doctor_reply = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    content = db.Column(db.Text)
    reply = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    feedback_type = db.Column(db.String(50))  # general|incorrect|suggestion
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    role = db.Column(db.String(20))  # user | assistant
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
