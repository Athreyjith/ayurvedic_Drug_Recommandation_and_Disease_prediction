import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'ayurvedic-secret-key-2024')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-2024')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://root:password@localhost/ayurvedic_db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

    # Excel dataset paths
    ACTUAL_DATASET = os.environ.get('ACTUAL_DATASET', 'data/ActualDataset.xls')
    TRAINING_DATASET = os.environ.get('TRAINING_DATASET', 'data/TrainingDataset.xls')
    TESTING_DATASET = os.environ.get('TESTING_DATASET', 'data/TestingDataset.xls')
