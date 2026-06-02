from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ml_engine import get_predictor, ALL_SYMPTOMS
from models import db, Prediction

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/symptoms', methods=['GET'])
def symptoms():
    return jsonify({'symptoms': ALL_SYMPTOMS})

@prediction_bp.route('/disease', methods=['POST'])
@jwt_required()
def predict_disease():
    data = request.get_json()
    s1, s2, s3 = data.get('symptom1', ''), data.get('symptom2', ''), data.get('symptom3', '')
    if not all([s1, s2, s3]):
        return jsonify({'error': 'Please provide 3 symptoms'}), 400

    predictor = get_predictor()
    results = predictor.predict(s1, s2, s3)

    user_id = int(get_jwt_identity())
    pred = Prediction(
        user_id=user_id,
        symptom1=s1, symptom2=s2, symptom3=s3,
        predicted_disease=results[0]['disease'],
        confidence=results[0]['confidence']
    )
    db.session.add(pred)
    db.session.commit()

    return jsonify({'predictions': results, 'top': results[0]})

@prediction_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    user_id = int(get_jwt_identity())
    preds = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).limit(20).all()
    return jsonify({'history': [{
        'id': p.id, 'symptom1': p.symptom1, 'symptom2': p.symptom2, 'symptom3': p.symptom3,
        'predicted_disease': p.predicted_disease, 'confidence': p.confidence,
        'created_at': p.created_at.isoformat()
    } for p in preds]})
