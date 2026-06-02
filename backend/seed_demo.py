import os
import sys
import datetime
import firebase_admin
from firebase_admin import auth, firestore

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.firebase_service import db

def get_or_create_user(email, password, display_name):
    try:
        user = auth.get_user_by_email(email)
        print(f"Found existing user {email} with UID: {user.uid}")
        return user.uid
    except auth.UserNotFoundError:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        print(f"Created user {email} with UID: {user.uid}")
        return user.uid

def seed_data():
    patient_uid = get_or_create_user('patient@onehealth.com', 'password123', 'Demo Patient')
    doctor_uid = get_or_create_user('doctor@onehealth.com', 'password123', 'Dr. Demo')

    print("Seeding patient profile...")
    user_ref = db.collection('users').document(patient_uid)
    user_ref.set({
        "uid": patient_uid,
        "name": "Demo Patient",
        "email": "patient@onehealth.com",
        "role": "patient",
        "profile": {
            "passport_id": "HP-DEMO1",
            "health_score": 85,
            "blood_group": "O+",
            "gender": "Male",
            "dob": "1990-01-01",
            "chronic_conditions": ["Healthy"]
        }
    }, merge=True)

    print("Seeding doctor profile...")
    doc_ref = db.collection('users').document(doctor_uid)
    doc_ref.set({
        "uid": doctor_uid,
        "name": "Dr. Demo",
        "email": "doctor@onehealth.com",
        "role": "doctor",
        "profile": {
            "specialty": "General Practitioner",
            "hospital": "City General"
        }
    }, merge=True)

    print("Cleaning up old patient records/meds...")
    for doc in db.collection('records').where('patient_uid', '==', patient_uid).stream():
        doc.reference.delete()
    for doc in db.collection('medications').where('patient_uid', '==', patient_uid).stream():
        doc.reference.delete()

    print("Seeding records...")
    r1 = db.collection('records').document()
    r1.set({
        "id": r1.id,
        "patient_uid": patient_uid,
        "title": "Complete Blood Count",
        "type": "report",
        "date": "2026-05-15",
        "metadata": {
            "hospital": "City General Lab",
            "doctor_name": "Dr. Sarah Smith"
        },
        "ai_analysis": {
            "summary": "Hemoglobin slightly low. WBC within normal limits. Platelets normal.",
            "extracted_values": [
                {"parameter": "Hemoglobin", "value": "11.2", "unit": "g/dL", "status": "low"},
                {"parameter": "WBC", "value": "7.5", "unit": "x10^9/L", "status": "normal"}
            ]
        },
        "created_at": firestore.SERVER_TIMESTAMP
    })

    r2 = db.collection('records').document()
    r2.set({
        "id": r2.id,
        "patient_uid": patient_uid,
        "title": "Chest X-Ray",
        "type": "report",
        "date": "2026-02-28",
        "metadata": {
            "hospital": "Metro Imaging Center",
            "doctor_name": "Dr. Emily Chen"
        },
        "ai_analysis": {
            "summary": "No acute cardiopulmonary abnormalities. Clear lung fields. Heart size normal.",
            "extracted_values": [
                {"parameter": "Heart Size", "value": "Normal", "unit": "", "status": "normal"}
            ]
        },
        "created_at": firestore.SERVER_TIMESTAMP
    })

    print("Seeding medications...")
    m1 = db.collection('medications').document()
    m1.set({
        "id": m1.id,
        "patient_uid": patient_uid,
        "name": "Vitamin D3 1000 IU",
        "dosage": "1 capsule",
        "frequency": "once",
        "timing": ["08:00"],
        "start_date": "2026-05-01",
        "end_date": "2026-08-01",
        "instructions": "Take with fatty meal for better absorption.",
        "status": "active",
        "prescribed_by": "Dr. Demo",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    m2 = db.collection('medications').document()
    m2.set({
        "id": m2.id,
        "patient_uid": patient_uid,
        "name": "Amlodipine 5mg",
        "dosage": "1 tablet",
        "frequency": "once",
        "timing": ["09:00"],
        "start_date": "2026-03-01",
        "end_date": "2026-09-01",
        "instructions": "Take in the morning with water. Do not crush.",
        "status": "active",
        "prescribed_by": "Dr. Demo",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    print("Seed data injected successfully!")

if __name__ == '__main__':
    seed_data()
