
A full-stack web app using React + Flask + MySQL + Naive Bayes ML
<img width="1730" height="801" alt="image" src="https://github.com/user-attachments/assets/cf4183c7-b535-4c93-8b24-7218cf782990" />


## Project Structure
```
ayurvedic-app/
├── backend/
│   ├── app.py              # Flask REST API
│   ├── schema.sql          # MySQL database schema
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
└── frontend/
    ├── src/
    │   ├── App.jsx         # Complete React application
    │   ├── index.js
    │   └── index.css
    ├── public/index.html
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

<img width="1424" height="813" alt="image" src="https://github.com/user-attachments/assets/c5e3881d-1e70-4d2a-9737-982e6bcc2744" /># 🌿 Ayurvedic Health Assistant System

## Setup Instructions

### 1. MySQL Database

Set your MySQL root password in `backend/.env` (`DB_PASSWORD=`). This must match the password you use to log into MySQL.

```bash
mysql -u root -p < backend/schema.sql

Get-Content schema.sql | mysql -u root -u root -p
```

If you forgot the root password, reset it via MySQL Workbench or the MySQL Installer on Windows.

### 2. Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MySQL credentials and OpenAI API key
python app.py
```
Backend runs on: http://localhost:5001 (port 5000 is often blocked on Windows)

### 3. Frontend (React)
```bash
cd frontend
npm install
npm start
```
Frontend runs on: http://localhost:3000

## Default Login Credentials
| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@ayurveda.com     | admin123   |
| Doctor| doctor@ayurveda.com    | doctor123  |

## Features

### User Side
- **Home** — Welcome dashboard with quick navigation
- **Disease Prediction** — Naive Bayes ML predicts disease from 3 symptoms
- **Drug Recommendation** — Recommends Ayurvedic medicines based on disease, age, severity
  - Auto-predict disease from symptoms
  - Top 3 medicine recommendations
  - Dosage, precautions, contraindications
  - Confidence scores
  - Recommendation history
- **Disease Recommendation** — Top 3 probable diseases with probability bars
- **AI Health Assistant** — OpenAI-powered chat (Ayurvedic topics only)
- **Doctor Consultation** — Book appointments, send messages
- **Feedback** — Submit ratings and suggestions
- **Profile** — Update info and password

### Admin/Doctor Panel
- Dashboard with stats (users, predictions, appointments, feedback)
- User management (view, delete)
- Appointment management (approve/reject)
- Messaging center with replies
- Feedback management
- Drug database viewer
- Disease dataset viewer

## Tech Stack
- **Frontend**: React 18, Tailwind CSS
- **Backend**: Flask, Flask-JWT-Extended, Flask-CORS
- **ML**: scikit-learn Naive Bayes, pandas, numpy
- **Database**: MySQL
- **AI**: OpenAI API
- **Auth**: JWT tokens

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/symptoms | Get all symptoms |
| POST | /api/predict/disease | Predict disease |
| POST | /api/recommend/drug | Drug recommendation |
| GET | /api/recommend/history | Recommendation history |
| POST | /api/recommend/disease | Disease recommendation |
| POST | /api/chat | AI chat |
| POST | /api/appointments | Book appointment |
| POST | /api/feedback | Submit feedback |
| GET | /api/admin/stats | Admin statistics |
| GET | /api/admin/users | All users |
| GET | /api/admin/appointments | All appointments |
