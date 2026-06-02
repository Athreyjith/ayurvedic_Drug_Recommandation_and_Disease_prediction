from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, ChatHistory
import openai

chat_bp = Blueprint('chat', __name__)

SYSTEM_PROMPT = """You are an expert Ayurvedic health assistant. You ONLY answer questions related to:
- Ayurvedic medicines, herbs, and treatments
- Disease symptoms and their Ayurvedic remedies
- Diet and lifestyle recommendations from an Ayurvedic perspective
- General health and wellness in the Ayurvedic tradition

If a question is NOT related to health, medicine, or Ayurveda, politely decline and redirect the user.
Keep your answers concise, accurate, and helpful. Always recommend consulting a doctor for serious conditions."""

@chat_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask():
    data = request.get_json()
    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400

    user_id = int(get_jwt_identity())

    # Save user message
    db.session.add(ChatHistory(user_id=user_id, role='user', message=user_message))
    db.session.commit()

    # Get recent history
    history = ChatHistory.query.filter_by(user_id=user_id).order_by(
        ChatHistory.created_at.desc()).limit(10).all()
    history.reverse()

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in history[:-1]:  # exclude the message we just added
        messages.append({"role": h.role, "content": h.message})
    messages.append({"role": "user", "content": user_message})

    try:
        api_key = current_app.config.get('OPENAI_API_KEY', '')
        if not api_key:
            reply = ("I'm the Ayurvedic Health Assistant. To enable AI responses, "
                     "please configure your OpenAI API key. "
                     "For now, I can tell you that Ayurveda recommends balanced diet, "
                     "proper sleep, and herbal remedies tailored to your body type.")
        else:
            openai.api_key = api_key
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            reply = response.choices[0].message.content
    except Exception as e:
        reply = f"AI service temporarily unavailable. Please try again later."

    db.session.add(ChatHistory(user_id=user_id, role='assistant', message=reply))
    db.session.commit()

    return jsonify({'reply': reply})

@chat_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    user_id = int(get_jwt_identity())
    chats = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.created_at).limit(50).all()
    return jsonify({'history': [{
        'role': c.role, 'message': c.message, 'created_at': c.created_at.isoformat()
    } for c in chats]})

@chat_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear():
    user_id = int(get_jwt_identity())
    ChatHistory.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify({'message': 'Chat history cleared'})
