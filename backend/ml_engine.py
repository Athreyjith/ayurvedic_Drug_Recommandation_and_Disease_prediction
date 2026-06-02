import pandas as pd
import numpy as np
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import CountVectorizer
import json
import os
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base path relative to ml_engine.py
DATA_DIR = Path(__file__).resolve().parent / "data"

def load_json_dataset(filename, default_fallback):
    path = DATA_DIR / filename
    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load dataset {filename} from {path}: {e}")
    else:
        logger.warning(f"Dataset {filename} not found at {path}. Using inline fallback.")
    return default_fallback

# Inline fallback datasets (matching original lists exactly)
DEFAULT_DISEASE_DATASET = [
    {"symptom1": "fever", "symptom2": "cough", "symptom3": "headache", "disease": "Flu"},
    {"symptom1": "sneezing", "symptom2": "runny_nose", "symptom3": "nasal_congestion", "disease": "Common Cold"},
    {"symptom1": "loss_of_taste", "symptom2": "fever", "symptom3": "cough", "disease": "COVID-19"},
    {"symptom1": "stomach_pain", "symptom2": "vomiting", "symptom3": "fever", "disease": "Food Poisoning"},
    {"symptom1": "headache", "symptom2": "fever", "symptom3": "body_pain", "disease": "Dengue"},
    {"symptom1": "shortness_of_breath", "symptom2": "cough", "symptom3": "fever", "disease": "Pneumonia"},
    {"symptom1": "runny_nose", "symptom2": "headache", "symptom3": "sneezing", "disease": "Allergy"},
    {"symptom1": "vomiting", "symptom2": "stomach_pain", "symptom3": "headache", "disease": "Gastritis"},
    {"symptom1": "fever", "symptom2": "headache", "symptom3": "vomiting", "disease": "Typhoid"},
    {"symptom1": "cough", "symptom2": "shortness_of_breath", "symptom3": "chest_pain", "disease": "Asthma"},
    {"symptom1": "joint_pain", "symptom2": "fever", "symptom3": "fatigue", "disease": "Arthritis"},
    {"symptom1": "fatigue", "symptom2": "weight_loss", "symptom3": "fever", "disease": "Tuberculosis"},
    {"symptom1": "skin_rash", "symptom2": "itching", "symptom3": "redness", "disease": "Eczema"},
    {"symptom1": "chest_pain", "symptom2": "sweating", "symptom3": "shortness_of_breath", "disease": "Heart Disease"},
    {"symptom1": "frequent_urination", "symptom2": "thirst", "symptom3": "fatigue", "disease": "Diabetes"},
    {"symptom1": "back_pain", "symptom2": "fever", "symptom3": "frequent_urination", "disease": "Kidney Infection"},
    {"symptom1": "yellowing_skin", "symptom2": "fatigue", "symptom3": "stomach_pain", "disease": "Jaundice"},
    {"symptom1": "sore_throat", "symptom2": "fever", "symptom3": "swollen_glands", "disease": "Tonsillitis"},
]

DEFAULT_FALLBACK_DRUG_DATA = [
    {"disease": "Flu", "age_min": 0, "age_max": 120, "gender": "any", "severity": "mild",
     "drug": "Tulsi Ginger Tea", "dosage": "2-3 cups daily", "precautions": "Avoid cold drinks", "contraindications": "None"},
    {"disease": "Flu", "age_min": 0, "age_max": 120, "gender": "any", "severity": "moderate",
     "drug": "Sitopaladi Churna", "dosage": "1 tsp with honey twice daily", "precautions": "Drink warm water", "contraindications": "Pregnancy"},
    {"disease": "Common Cold", "age_min": 0, "age_max": 120, "gender": "any", "severity": "mild",
     "drug": "Trikatu Churna", "dosage": "500mg twice daily", "precautions": "Avoid cold exposure", "contraindications": "Hyperacidity"},
    {"disease": "COVID-19", "age_min": 0, "age_max": 120, "gender": "any", "severity": "mild",
     "drug": "Ashwagandha + Giloy", "dosage": "500mg each twice daily", "precautions": "Rest and hydration", "contraindications": "Auto-immune conditions"},
    {"disease": "Food Poisoning", "age_min": 0, "age_max": 120, "gender": "any", "severity": "mild",
     "drug": "Kutajghan Vati", "dosage": "2 tablets twice daily", "precautions": "ORS hydration", "contraindications": "Kidney disease"},
    {"disease": "Dengue", "age_min": 0, "age_max": 120, "gender": "any", "severity": "moderate",
     "drug": "Papaya Leaf Extract", "dosage": "30ml twice daily", "precautions": "Monitor platelets", "contraindications": "Pregnancy"},
    {"disease": "Pneumonia", "age_min": 0, "age_max": 120, "gender": "any", "severity": "severe",
     "drug": "Vasaka (Malabar Nut)", "dosage": "2-4g daily", "precautions": "Steam inhalation", "contraindications": "Pregnancy"},
    {"disease": "Allergy", "age_min": 0, "age_max": 120, "gender": "any", "severity": "mild",
     "drug": "Haridra Khand", "dosage": "1 tsp with warm milk twice daily", "precautions": "Avoid allergens", "contraindications": "Diabetes (high sugar content)"},
    {"disease": "Gastritis", "age_min": 0, "age_max": 120, "gender": "any", "severity": "mild",
     "drug": "Avipattikar Churna", "dosage": "1 tsp before meals", "precautions": "Avoid spicy food", "contraindications": "Diarrhea"},
    {"disease": "Typhoid", "age_min": 0, "age_max": 120, "gender": "any", "severity": "moderate",
     "drug": "Sanjivani Vati", "dosage": "2 tablets twice daily", "precautions": "Light diet only", "contraindications": "None"},
    {"disease": "Asthma", "age_min": 0, "age_max": 120, "gender": "any", "severity": "moderate",
     "drug": "Kanakasava", "dosage": "15-30ml after meals", "precautions": "Avoid dust and smoke", "contraindications": "Pregnancy"},
    {"disease": "Arthritis", "age_min": 0, "age_max": 120, "gender": "any", "severity": "moderate",
     "drug": "Yograj Guggulu", "dosage": "2 tablets twice daily", "precautions": "Warm oil massage", "contraindications": "Thyroid disorders"},
    {"disease": "Tuberculosis", "age_min": 0, "age_max": 120, "gender": "any", "severity": "severe",
     "drug": "Chyawanprash + Vasavaleha", "dosage": "1 tsp each twice daily", "precautions": "Consult doctor", "contraindications": "Pregnancy"},
    {"disease": "Eczema", "age_min": 0, "age_max": 120, "gender": "any", "severity": "mild",
     "drug": "Neem Capsules + Manjistha", "dosage": "500mg each twice daily", "precautions": "Avoid scratching", "contraindications": "Pregnancy"},
    {"disease": "Heart Disease", "age_min": 0, "age_max": 120, "gender": "any", "severity": "severe",
     "drug": "Arjuna Capsules", "dosage": "500mg twice daily", "precautions": "Low-fat diet", "contraindications": "Anticoagulant therapy"},
    {"disease": "Diabetes", "age_min": 0, "age_max": 120, "gender": "any", "severity": "moderate",
     "drug": "Karela + Jamun Powder", "dosage": "1 tsp twice daily before meals", "precautions": "Monitor blood sugar", "contraindications": "Hypoglycemia"},
    {"disease": "Kidney Infection", "age_min": 0, "age_max": 120, "gender": "any", "severity": "moderate",
     "drug": "Punarnava Mandura", "dosage": "2 tablets twice daily", "precautions": "Plenty of water", "contraindications": "Severe renal failure"},
    {"disease": "Jaundice", "age_min": 0, "age_max": 120, "gender": "any", "severity": "moderate",
     "drug": "Arogyavardhini Vati", "dosage": "2 tablets twice daily", "precautions": "Avoid fatty foods", "contraindications": "Liver failure"},
    {"disease": "Tonsillitis", "age_min": 0, "age_max": 120, "gender": "any", "severity": "mild",
     "drug": "Khadiradi Vati", "dosage": "1 tablet every 4 hours", "precautions": "Gargle with warm salt water", "contraindications": "None"},
]

DISEASE_DATASET = load_json_dataset("disease_dataset.json", DEFAULT_DISEASE_DATASET)
FALLBACK_DRUG_DATA = load_json_dataset("fallback_drug_data.json", DEFAULT_FALLBACK_DRUG_DATA)

ALL_SYMPTOMS = sorted(set(
    s for row in DISEASE_DATASET for s in [row['symptom1'], row['symptom2'], row['symptom3']]
))


class DiseasePredictor:
    def __init__(self):
        self.vectorizer = CountVectorizer()
        self.model = MultinomialNB()
        self.le = LabelEncoder()
        self._train()

    def _train(self):
        texts = [
            f"{r['symptom1']} {r['symptom2']} {r['symptom3']}"
            for r in DISEASE_DATASET
        ]
        labels = [r['disease'] for r in DISEASE_DATASET]
        X = self.vectorizer.fit_transform(texts)
        y = self.le.fit_transform(labels)
        self.model.fit(X, y)

    def predict(self, s1, s2, s3):
        text = f"{s1} {s2} {s3}"
        X = self.vectorizer.transform([text])
        probs = self.model.predict_proba(X)[0]
        top_idx = np.argsort(probs)[::-1][:3]
        results = []
        for idx in top_idx:
            results.append({
                "disease": str(self.le.classes_[idx]),
                "confidence": round(float(probs[idx]) * 100, 2)
            })
        return results

    def get_symptoms(self):
        return ALL_SYMPTOMS


class DrugRecommender:
    def __init__(self, excel_paths=None):
        self.df = self._load_data(excel_paths)
        self.model = None
        self.le_disease = LabelEncoder()
        self.le_gender = LabelEncoder()
        self.le_severity = LabelEncoder()
        self.le_drug = LabelEncoder()
        self._train()

    def _load_data(self, excel_paths):
        dfs = []
        if excel_paths:
            for path in excel_paths:
                if os.path.exists(path):
                    try:
                        df = pd.read_excel(path, engine='xlrd')
                        dfs.append(df)
                    except Exception as e:
                        print(f"Warning: Could not load {path}: {e}")
        if dfs:
            combined = pd.concat(dfs, ignore_index=True)
            # Normalize columns
            combined.columns = [c.lower().strip().replace(' ', '_') for c in combined.columns]
            return combined
        # Fallback to built-in data
        return pd.DataFrame(FALLBACK_DRUG_DATA)

    def _train(self):
        df = self.df.copy()
        # Map column names flexibly
        col_map = {}
        for col in df.columns:
            cl = col.lower()
            if 'disease' in cl: col_map['disease'] = col
            elif 'dosage' in cl or 'dose' in cl: col_map['dosage'] = col
            elif 'age' in cl: col_map['age'] = col
            elif 'gender' in cl or 'sex' in cl: col_map['gender'] = col
            elif 'severity' in cl: col_map['severity'] = col
            elif 'drug' in cl or 'medicine' in cl or 'remedy' in cl: col_map['drug'] = col
            elif 'precaution' in cl: col_map['precautions'] = col
            elif 'contra' in cl: col_map['contraindications'] = col

        self.col_map = col_map
        required = ['disease', 'gender', 'severity', 'drug']
        if not all(k in col_map for k in required):
            # Use fallback df
            self.df = pd.DataFrame(FALLBACK_DRUG_DATA)
            self.col_map = {
                'disease': 'disease', 'age': 'age_min', 'gender': 'gender',
                'severity': 'severity', 'drug': 'drug',
                'dosage': 'dosage', 'precautions': 'precautions',
                'contraindications': 'contraindications'
            }
            df = self.df.copy()
            col_map = self.col_map

        diseases = df[col_map['disease']].fillna('Unknown').astype(str)
        genders = df[col_map['gender']].fillna('any').astype(str).str.lower()
        severities = df[col_map['severity']].fillna('mild').astype(str).str.lower()
        drugs = df[col_map['drug']].fillna('Ashwagandha').astype(str)

        self.le_disease.fit(diseases)
        self.le_gender.fit(list(set(genders.tolist() + ['any', 'male', 'female'])))
        self.le_severity.fit(list(set(severities.tolist() + ['mild', 'moderate', 'severe'])))
        self.le_drug.fit(drugs)

        X = np.column_stack([
            self.le_disease.transform(diseases),
            self.le_gender.transform(genders),
            self.le_severity.transform(severities)
        ])
        y = self.le_drug.transform(drugs)
        self.model = MultinomialNB()
        self.model.fit(X, y)
        self.drugs_df = df

    def recommend(self, disease, age, gender, severity):
        gender_lower = gender.lower() if gender else 'any'
        severity_lower = severity.lower() if severity else 'mild'

        # Safe encode
        def safe_encode(le, val, fallback):
            try:
                return le.transform([val])[0]
            except:
                return le.transform([fallback])[0]

        col_map = self.col_map
        # Try to find disease in encoder
        try:
            d_enc = self.le_disease.transform([disease])[0]
        except:
            # Find closest
            classes = self.le_disease.classes_
            matches = [c for c in classes if disease.lower() in c.lower()]
            disease = matches[0] if matches else classes[0]
            d_enc = self.le_disease.transform([disease])[0]

        g_enc = safe_encode(self.le_gender, gender_lower, 'any')
        s_enc = safe_encode(self.le_severity, severity_lower, 'mild')

        X = np.array([[d_enc, g_enc, s_enc]])
        probs = self.model.predict_proba(X)[0]
        top_idx = np.argsort(probs)[::-1][:3]

        results = []
        for idx in top_idx:
            drug_name = str(self.le_drug.classes_[idx])
            # Find matching row for extra info
            df = self.drugs_df
            match = df[df[col_map['drug']].astype(str) == drug_name]
            if len(match) > 0:
                row = match.iloc[0]
                results.append({
                    "drug": drug_name,
                    "dosage": str(row.get(col_map.get('dosage', ''), 'As directed by physician')),
                    "precautions": str(row.get(col_map.get('precautions', ''), 'Consult your physician')),
                    "contraindications": str(row.get(col_map.get('contraindications', ''), 'None known')),
                    "confidence": round(float(probs[idx]) * 100, 2)
                })
            else:
                results.append({
                    "drug": drug_name,
                    "dosage": "As directed by physician",
                    "precautions": "Consult your physician",
                    "contraindications": "None known",
                    "confidence": round(float(probs[idx]) * 100, 2)
                })
        return results


# Singletons
_predictor = None
_recommender = None

def get_predictor():
    global _predictor
    if _predictor is None:
        _predictor = DiseasePredictor()
    return _predictor

def get_recommender(excel_paths=None):
    global _recommender
    if _recommender is None:
        _recommender = DrugRecommender(excel_paths)
    return _recommender
