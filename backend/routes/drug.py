from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ml_engine import get_recommender
from models import db, DrugRecommendation
import os

drug_bp = Blueprint('drug', __name__)

def _get_excel_paths():
    cfg = current_app.config
    paths = [
        cfg.get('ACTUAL_DATASET', ''),
        cfg.get('TRAINING_DATASET', ''),
        cfg.get('TESTING_DATASET', ''),
    ]
    return [p for p in paths if p and os.path.exists(p)]

@drug_bp.route('/recommend', methods=['POST'])
@jwt_required()
def recommend():
    data = request.get_json()
    disease = data.get('disease', '')
    age = data.get('age', 25)
    gender = data.get('gender', 'any')
    severity = data.get('severity', 'mild')

    if not disease:
        return jsonify({'error': 'Disease is required'}), 400

    paths = _get_excel_paths()
    recommender = get_recommender(paths if paths else None)
    results = recommender.recommend(disease, age, gender, severity)

    user_id = int(get_jwt_identity())
    if results:
        top = results[0]
        rec = DrugRecommendation(
            user_id=user_id,
            disease=disease, age=age, gender=gender, severity=severity,
            recommended_drug=top['drug'],
            dosage=top['dosage'],
            precautions=top['precautions'],
            contraindications=top['contraindications'],
            confidence=top['confidence']
        )
        db.session.add(rec)
        db.session.commit()

    return jsonify({'recommendations': results})

@drug_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    user_id = int(get_jwt_identity())
    recs = DrugRecommendation.query.filter_by(user_id=user_id).order_by(
        DrugRecommendation.created_at.desc()).limit(20).all()
    return jsonify({'history': [{
        'id': r.id, 'disease': r.disease, 'age': r.age, 'gender': r.gender,
        'severity': r.severity, 'recommended_drug': r.recommended_drug,
        'dosage': r.dosage, 'precautions': r.precautions,
        'contraindications': r.contraindications,
        'confidence': r.confidence, 'created_at': r.created_at.isoformat()
    } for r in recs]})
