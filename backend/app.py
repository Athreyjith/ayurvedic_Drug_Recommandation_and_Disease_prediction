from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import mysql.connector
import pandas as pd
import numpy as np
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import LabelEncoder
import os
from datetime import timedelta
import hashlib
import warnings
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
import mysql.connector

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)
warnings.filterwarnings('ignore')

AI_SYSTEM_PROMPT = (
    "You are an Ayurvedic health assistant. Only answer questions about Ayurvedic medicine, "
    "herbs, treatments, symptoms, diseases, diet, and healthy lifestyle. If asked about non-health "
    "topics, politely redirect to health topics."
)

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'ayurvedic-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)
jwt = JWTManager(app)

# Ensure Flask responds to CORS preflight requests
@app.after_request
def add_cors_headers(resp):
    resp.headers.setdefault('Access-Control-Allow-Origin', '*')
    resp.headers.setdefault('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    resp.headers.setdefault('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    return resp


# Expose 403 details for debugging (frontend fetch would otherwise just fail)
from flask import request as _flask_request

@app.errorhandler(403)
def handle_403(err):
    try:
        return jsonify({
            'error': 'Forbidden',
            'path': _flask_request.path,
            'method': _flask_request.method,
        }), 403
    except Exception:
        return 'Forbidden', 403


# DB_CONFIG = {
#     'host': os.getenv('DB_HOST', 'localhost'),
#     'user': os.getenv('DB_USER', 'root'),
#     'password': os.getenv('DB_PASSWORD', ''),
#     'database': os.getenv('DB_NAME', 'ayurvedic_db')
# }

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    port=int(os.getenv("DB_PORT", 3306))
)
def get_db():
    return mysql.connector.connect(**DB_CONFIG)


def ensure_admin_note_column():
    try:
        db = get_db(); cursor = db.cursor()
        cursor.execute("ALTER TABLE appointments ADD COLUMN admin_note TEXT")
        db.commit()
    except Exception:
        pass
    finally:
        if 'db' in locals(): db.close()


def hash_password(p):
    return hashlib.sha256(p.encode()).hexdigest()

ensure_admin_note_column()

from ml_engine import get_predictor, get_recommender, ALL_SYMPTOMS, DISEASE_DATASET, FALLBACK_DRUG_DATA

# Auth
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email=%s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'error': 'Email already exists'}), 400
        cursor.execute("INSERT INTO users (name,email,password,age,gender,role) VALUES (%s,%s,%s,%s,%s,'user')",
                       (data['name'], data['email'], hash_password(data['password']), data.get('age',0), data.get('gender','Other')))
        db.commit(); uid = cursor.lastrowid
        token = create_access_token(identity=str(uid))
        return jsonify({'token': token, 'user': {'id': uid, 'name': data['name'], 'email': data['email'], 'role': 'user'}})
    except Exception as e: return jsonify({'error': str(e)}), 500
    finally:
        if 'db' in locals(): db.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email=%s AND password=%s", (data['email'], hash_password(data['password'])))
        user = cursor.fetchone()
        if not user: return jsonify({'error': 'Invalid credentials'}), 401
        token = create_access_token(identity=str(user['id']))
        return jsonify({'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'role': user['role']}})
    except Exception as e: return jsonify({'error': str(e)}), 500
    finally:
        if 'db' in locals(): db.close()

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    uid = get_jwt_identity()
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id,name,email,age,gender,role,created_at FROM users WHERE id=%s", (uid,))
        u = cursor.fetchone()
        if u and u.get('created_at'): u['created_at'] = str(u['created_at'])
        return jsonify(u)
    except Exception as e: return jsonify({'error': str(e)}), 500
    finally:
        if 'db' in locals(): db.close()

@app.route('/api/auth/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    uid = get_jwt_identity(); data = request.json
    try:
        db = get_db(); cursor = db.cursor()
        if data.get('password'):
            cursor.execute("UPDATE users SET name=%s,age=%s,gender=%s,password=%s WHERE id=%s",
                           (data['name'], data.get('age'), data.get('gender'), hash_password(data['password']), uid))
        else:
            cursor.execute("UPDATE users SET name=%s,age=%s,gender=%s WHERE id=%s",
                           (data['name'], data.get('age'), data.get('gender'), uid))
        db.commit(); return jsonify({'message': 'Updated'})
    except Exception as e: return jsonify({'error': str(e)}), 500
    finally:
        if 'db' in locals(): db.close()

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    return jsonify(ALL_SYMPTOMS)

@app.route('/api/diseases', methods=['GET'])
def get_diseases_list():
    try:
        recommender = get_recommender()
        diseases = sorted(list(recommender.le_disease.classes_))
        return jsonify(diseases)
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/predict/disease', methods=['POST'])
@jwt_required()
def predict_disease():
    uid = get_jwt_identity(); data = request.json
    s1,s2,s3 = data.get('symptom1',''),data.get('symptom2',''),data.get('symptom3','')
    try:
        predictor = get_predictor()
        results = predictor.predict(s1, s2, s3)
        predicted,confidence = results[0]['disease'],results[0]['confidence']
        db = get_db(); cursor = db.cursor()
        cursor.execute("INSERT INTO predictions (user_id,symptom1,symptom2,symptom3,predicted_disease,confidence,type) VALUES (%s,%s,%s,%s,%s,%s,'disease')",
                       (uid,s1,s2,s3,predicted,confidence))
        db.commit(); db.close()
        return jsonify({'predicted': predicted, 'confidence': confidence, 'top3': results})
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/recommend/drug', methods=['POST'])
@jwt_required()
def recommend_drug():
    uid = get_jwt_identity(); data = request.json
    disease = data.get('disease',''); age = int(data.get('age',30))
    gender = data.get('gender','Any'); severity = data.get('severity','Mild')
    try:
        recommender = get_recommender()
        recs = recommender.recommend(disease, age, gender, severity)
        db = get_db(); cursor = db.cursor()
        cursor.execute("INSERT INTO drug_recommendations (user_id,disease,age,gender,severity,recommended_drug) VALUES (%s,%s,%s,%s,%s,%s)",
                       (uid,disease,age,gender,severity,recs[0]['drug'] if recs else 'N/A'))
        db.commit(); db.close()
        return jsonify({'recommendations': recs, 'disease': disease})
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/recommend/history', methods=['GET'])
@jwt_required()
def rec_history():
    uid = get_jwt_identity()
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM drug_recommendations WHERE user_id=%s ORDER BY created_at DESC LIMIT 10",(uid,))
        rows = cursor.fetchall()
        for r in rows:
            if r.get('created_at'): r['created_at'] = str(r['created_at'])
        db.close(); return jsonify(rows)
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/recommend/disease', methods=['POST'])
@jwt_required()
def recommend_disease():
    data = request.json; s1,s2,s3 = data.get('symptom1',''),data.get('symptom2',''),data.get('symptom3','')
    try:
        predictor = get_predictor()
        results = predictor.predict(s1, s2, s3)
        return jsonify({'recommendations': results})
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
@jwt_required()
def ai_chat():
    uid = get_jwt_identity(); data = request.json; message = data.get('message','')
    api_key = os.getenv('OPENAI_API_KEY', '')
    if not api_key:
        return jsonify({'response': 'AI service error. Set OPENAI_API_KEY in backend/.env'}), 200
    try:
        client = OpenAI(api_key=api_key)
        resp = client.chat.completions.create(
            model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
            max_tokens=500,
            temperature=0.7,
            messages=[
                {"role": "system", "content": AI_SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ],
        )
        reply = resp.choices[0].message.content
        db = get_db(); cursor = db.cursor()
        cursor.execute("INSERT INTO chat_history (user_id,message,response) VALUES (%s,%s,%s)",(uid,message,reply))
        db.commit(); db.close(); return jsonify({'response': reply})
    except Exception as e:
        err = str(e)
        if 'insufficient_quota' in err or '429' in err:
            msg = 'OpenAI quota exceeded. Add billing/credits at platform.openai.com and try again.'
        elif 'invalid_api_key' in err or 'Incorrect API key' in err:
            msg = 'Invalid OpenAI API key. Check OPENAI_API_KEY in backend/.env and restart the server.'
        elif 'proxies' in err:
            msg = 'OpenAI library mismatch. Run: pip install -r requirements.txt and restart the server.'
        else:
            msg = f'AI service error: {err[:200]}'
        return jsonify({'response': msg}), 200

@app.route('/api/chat/history', methods=['GET'])
@jwt_required()
def chat_history():
    uid = get_jwt_identity()
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM chat_history WHERE user_id=%s ORDER BY created_at DESC LIMIT 20",(uid,))
        rows = cursor.fetchall()
        for r in rows:
            if r.get('created_at'): r['created_at'] = str(r['created_at'])
        db.close(); return jsonify(rows[::-1])
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def book_appointment():
    uid = get_jwt_identity(); data = request.json
    try:
        db = get_db(); cursor = db.cursor()
        cursor.execute("INSERT INTO appointments (user_id,name,age,gender,disease,preferred_date,notes,status) VALUES (%s,%s,%s,%s,%s,%s,%s,'Pending')",
                       (uid,data['name'],data['age'],data['gender'],data['disease'],data['preferred_date'],data.get('notes','')))
        db.commit(); db.close(); return jsonify({'message': 'Appointment booked'})
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    uid = get_jwt_identity()
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM appointments WHERE user_id=%s ORDER BY created_at DESC",(uid,))
        rows = cursor.fetchall()
        for r in rows:
            for k in ['created_at','preferred_date']:
                if r.get(k): r[k] = str(r[k])
        db.close(); return jsonify(rows)
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/appointments/messages', methods=['GET'])
@jwt_required()
def get_appointment_messages():
    uid = get_jwt_identity()
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM messages WHERE user_id=%s ORDER BY created_at DESC",(uid,))
        rows = cursor.fetchall()
        for r in rows:
            if r.get('created_at'):
                r['created_at'] = str(r['created_at'])
        db.close(); return jsonify(rows)
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/appointments/message', methods=['POST'])
@jwt_required()
def send_message():
    uid = get_jwt_identity(); data = request.json
    try:
        db = get_db(); cursor = db.cursor()
        cursor.execute("INSERT INTO messages (user_id,appointment_id,message,sender) VALUES (%s,%s,%s,'user')",
                       (uid,data.get('appointment_id'),data['message']))
        db.commit(); db.close(); return jsonify({'message': 'Sent'})
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    uid = get_jwt_identity(); data = request.json
    try:
        db = get_db(); cursor = db.cursor()
        cursor.execute("INSERT INTO feedback (user_id,type,message,rating) VALUES (%s,%s,%s,%s)",
                       (uid,data.get('type','General'),data['message'],data.get('rating',5)))
        db.commit(); db.close(); return jsonify({'message': 'Feedback submitted'})
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    try:
        db = get_db(); cursor = db.cursor(dictionary=True); stats = {}
        for t,k in [('users','total_users'),('predictions','total_predictions'),
                    ('appointments','total_appointments'),('feedback','total_feedback')]:
            cursor.execute(f"SELECT COUNT(*) as count FROM {t}")
            stats[k] = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(*) as count FROM appointments WHERE status='Pending'")
        stats['pending_appointments'] = cursor.fetchone()['count']
        db.close(); return jsonify(stats)
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def admin_users():
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id,name,email,age,gender,role,created_at FROM users ORDER BY created_at DESC")
        rows = cursor.fetchall()
        for r in rows:
            if r.get('created_at'): r['created_at'] = str(r['created_at'])
        db.close(); return jsonify(rows)
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:uid>', methods=['DELETE'])
@jwt_required()
def delete_user(uid):
    try:
        db = get_db(); cursor = db.cursor()
        cursor.execute("DELETE FROM users WHERE id=%s",(uid,))
        db.commit(); db.close(); return jsonify({'message': 'Deleted'})
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/admin/appointments', methods=['GET'])
@jwt_required()
def admin_appointments():
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT a.*,u.name as user_name,u.email FROM appointments a JOIN users u ON a.user_id=u.id ORDER BY a.created_at DESC")
        rows = cursor.fetchall()
        for r in rows:
            for k in ['created_at','preferred_date']:
                if r.get(k): r[k] = str(r[k])
        db.close(); return jsonify(rows)
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/admin/appointments/<int:appt_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appt_id):
    data = request.json
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT user_id FROM appointments WHERE id=%s",(appt_id,))
        row = cursor.fetchone()
        if not row:
            db.close(); return jsonify({'error': 'Appointment not found'}), 404
        status = data.get('status')
        note = data.get('note', '')
        cursor.execute("UPDATE appointments SET status=%s, admin_note=%s WHERE id=%s",(status,note,appt_id))
        message = f"Your appointment request has been {status.lower()}."
        if note:
            message = f"{message} Note: {note}"
        cursor.execute("INSERT INTO messages (user_id,appointment_id,message,sender) VALUES (%s,%s,%s,'doctor')",
                       (row['user_id'], appt_id, message))
        db.commit(); db.close(); return jsonify({'message': 'Updated'})
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/admin/feedback', methods=['GET'])
@jwt_required()
def admin_feedback():
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT f.*,u.name as user_name FROM feedback f JOIN users u ON f.user_id=u.id ORDER BY f.created_at DESC")
        rows = cursor.fetchall()
        for r in rows:
            if r.get('created_at'): r['created_at'] = str(r['created_at'])
        db.close(); return jsonify(rows)
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/admin/diseases', methods=['GET'])
def get_diseases():
    return jsonify(DISEASE_DATASET)

@app.route('/api/admin/drugs', methods=['GET'])
@jwt_required()
def get_drugs():
    return jsonify(FALLBACK_DRUG_DATA)

@app.route('/api/admin/messages', methods=['GET'])
@jwt_required()
def admin_messages():
    try:
        db = get_db(); cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT m.*,u.name as user_name FROM messages m JOIN users u ON m.user_id=u.id ORDER BY m.created_at DESC LIMIT 50")
        rows = cursor.fetchall()
        for r in rows:
            if r.get('created_at'): r['created_at'] = str(r['created_at'])
        db.close(); return jsonify(rows)
    except Exception as e: return jsonify({'error': str(e)}), 500

@app.route('/api/admin/messages/reply', methods=['POST'])
@jwt_required()
def reply_message():
    data = request.json
    try:
        db = get_db(); cursor = db.cursor()
        cursor.execute("INSERT INTO messages (user_id,appointment_id,message,sender) VALUES (%s,%s,%s,'doctor')",
                       (data['user_id'],data.get('appointment_id'),data['message']))
        db.commit(); db.close(); return jsonify({'message': 'Reply sent'})
    except Exception as e: return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Port 5000 is reserved/blocked on many Windows installs (HTTP.sys / AirPlay).
    port = int(os.getenv('PORT', 5001))
    app.run(debug=True, host='127.0.0.1', port=port)
