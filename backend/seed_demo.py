import os
import sys
import datetime
import firebase_admin
from firebase_admin import auth, firestore

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.firebase_service import db

def get_or_create_user(email, password, display_name, role):
    try:
        user = auth.get_user_by_email(email)
        print(f"Found existing user {email} with UID: {user.uid}")
        auth.set_custom_user_claims(user.uid, {'role': role})
        print(f"Set custom claim 'role': '{role}' for {email}")
        return user.uid
    except auth.UserNotFoundError:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        print(f"Created user {email} with UID: {user.uid}")
        auth.set_custom_user_claims(user.uid, {'role': role})
        print(f"Set custom claim 'role': '{role}' for {email}")
        return user.uid

def seed_data():
    patient_uid = get_or_create_user('patient@onehealth.com', 'password123', 'Demo Patient', 'patient')
    patient2_uid = get_or_create_user('john.doe@example.com', 'password123', 'John Doe', 'patient')
    patient3_uid = get_or_create_user('jane.miller@example.com', 'password123', 'Jane Miller', 'patient')
    doctor_uid = get_or_create_user('doctor@onehealth.com', 'password123', 'Dr. Demo', 'doctor')

    print("Seeding patient profiles...")
    user_ref = db.collection('users').document(patient_uid)
    user_ref.set({
        "uid": patient_uid,
        "name": "Demo Patient",
        "email": "patient@onehealth.com",
        "role": "patient",
        "passport_id": "HP-DEMO1",
        "profile": {
            "passport_id": "HP-DEMO1",
            "blood_group": "O+",
            "gender": "Male",
            "dob": "1990-01-01",
            "allergies": ["Penicillin", "Peanuts"],
            "chronic_diseases": ["Asthma", "Hypertension"],
            "current_medications": [
                { "name": "Salbutamol 100mcg", "dosage": "2 puffs SOS" },
                { "name": "Amlodipine 5mg", "dosage": "1 tablet daily" }
            ],
            "emergency_contacts": [
                { "name": "Rahul Sharma", "relationship": "Spouse", "phone": "+91 98765 43211" },
                { "name": "Dr. Arjun", "relationship": "Family Doctor", "phone": "+91 98765 00000" }
            ]
        }
    }, merge=True)

    user2_ref = db.collection('users').document(patient2_uid)
    user2_ref.set({
        "uid": patient2_uid,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "patient",
        "profile": {
            "passport_id": "HP-JD002",
            "health_score": 72,
            "blood_group": "A-",
            "gender": "Male",
            "dob": "1985-05-12",
            "chronic_conditions": ["Hypertension"],
            "allergies": ["Dust Mites"],
            "chronic_diseases": ["Hypertension"],
            "current_medications": [
                { "name": "Lisinopril 10mg", "dosage": "1 tablet daily" },
                { "name": "Omega-3 Fish Oil 1000mg", "dosage": "1 capsule twice daily" }
            ],
            "emergency_contacts": [
                { "name": "Jane Doe", "relationship": "Spouse", "phone": "+1 555-1234" }
            ]
        }
    }, merge=True)

    user3_ref = db.collection('users').document(patient3_uid)
    user3_ref.set({
        "uid": patient3_uid,
        "name": "Jane Miller",
        "email": "jane.miller@example.com",
        "role": "patient",
        "profile": {
            "passport_id": "HP-JM003",
            "health_score": 91,
            "blood_group": "B+",
            "gender": "Female",
            "dob": "1993-09-24",
            "chronic_conditions": ["Asthma"],
            "allergies": ["Dust Mites", "Timothy Grass"],
            "chronic_diseases": ["Asthma"],
            "current_medications": [
                { "name": "Albuterol HFA Inhaler", "dosage": "2 puffs as needed" }
            ],
            "emergency_contacts": [
                { "name": "Mark Miller", "relationship": "Parent", "phone": "+1 555-9876" }
            ]
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
    for p_uid in [patient_uid, patient2_uid, patient3_uid]:
        for doc in db.collection('records').where('patient_uid', '==', p_uid).stream():
            doc.reference.delete()
        for doc in db.collection('medications').where('patient_uid', '==', p_uid).stream():
            doc.reference.delete()

    print("Cleaning up old consents...")
    for doc in db.collection('doctor_consents').where('doctor_uid', '==', doctor_uid).stream():
        doc.reference.delete()

    print("Seeding doctor consents...")
    for p_uid in [patient_uid, patient2_uid, patient3_uid]:
        c = db.collection('doctor_consents').document()
        c.set({
            "id": c.id,
            "doctor_uid": doctor_uid,
            "patient_uid": p_uid,
            "status": "active",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        })


    print("Seeding records...")
    # Record 1: CBC
    r1 = db.collection('records').document()
    r1.set({
        "id": r1.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-05-15T10:00:00Z",
        "title": "Complete Blood Count",
        "metadata": {
            "hospital": "City General Lab",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Annual physical checkup lab results."
        },
        "ai_analysis": {
            "summary": "Mild anemia indicated by slightly low hemoglobin. Other cell lines (WBC, Platelets) are within normal limits.",
            "extracted_values": [
                {"parameter": "Hemoglobin", "value": "11.2", "unit": "g/dL", "reference_range": "12.0 - 16.0", "status": "low"},
                {"parameter": "WBC", "value": "7.5", "unit": "x10^9/L", "reference_range": "4.0 - 11.0", "status": "normal"},
                {"parameter": "Platelets", "value": "250", "unit": "x10^9/L", "reference_range": "150 - 450", "status": "normal"}
            ],
            "suggested_actions": [
                "Increase dietary iron intake (spinach, red meat, legumes)",
                "Consider a gentle iron supplement after consulting your physician",
                "Recheck blood count in 3 months"
            ],
            "processed_at": "2026-05-15T12:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Record 2: Lipid Profile
    r2 = db.collection('records').document()
    r2.set({
        "id": r2.id,
        "patient_uid": patient_uid,
        "uploaded_by": patient_uid,
        "type": "report",
        "date": "2026-05-02T09:30:00Z",
        "title": "Lipid Panel",
        "metadata": {
            "hospital": "Metro Diagnostics",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Fasting lipid profile."
        },
        "ai_analysis": {
            "summary": "Elevated LDL (bad cholesterol) and borderline high triglycerides. Total cholesterol is above optimal level.",
            "extracted_values": [
                {"parameter": "Total Cholesterol", "value": "245", "unit": "mg/dL", "reference_range": "100 - 200", "status": "high"},
                {"parameter": "LDL Cholesterol", "value": "160", "unit": "mg/dL", "reference_range": "0 - 100", "status": "high"},
                {"parameter": "HDL Cholesterol", "value": "45", "unit": "mg/dL", "reference_range": "40 - 60", "status": "normal"},
                {"parameter": "Triglycerides", "value": "180", "unit": "mg/dL", "reference_range": "30 - 150", "status": "high"}
            ],
            "suggested_actions": [
                "Switch to a heart-healthy diet low in saturated fats",
                "Aim for at least 30 minutes of moderate aerobic exercise 5 days a week",
                "Consider taking Omega-3 fish oil supplements"
            ],
            "processed_at": "2026-05-02T11:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Record 3: Thyroid Panel
    r3 = db.collection('records').document()
    r3.set({
        "id": r3.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-04-10T08:15:00Z",
        "title": "Thyroid Function Test",
        "metadata": {
            "hospital": "City General Lab",
            "doctor_name": "Dr. Emily Chen",
            "notes": "Follow-up for reported fatigue."
        },
        "ai_analysis": {
            "summary": "Subclinical hypothyroidism suggested by slightly elevated TSH. Free T4 is within normal range.",
            "extracted_values": [
                {"parameter": "TSH", "value": "4.8", "unit": "mIU/L", "reference_range": "0.4 - 4.0", "status": "high"},
                {"parameter": "Free T4", "value": "1.1", "unit": "ng/dL", "reference_range": "0.8 - 1.8", "status": "normal"}
            ],
            "suggested_actions": [
                "Monitor for clinical symptoms of hypothyroidism (fatigue, weight gain, dry skin)",
                "Repeat TSH and Free T4 in 3 months to evaluate trend"
            ],
            "processed_at": "2026-04-10T10:30:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Record 4: Blood Glucose & HbA1c
    r4 = db.collection('records').document()
    r4.set({
        "id": r4.id,
        "patient_uid": patient_uid,
        "uploaded_by": patient_uid,
        "type": "report",
        "date": "2026-03-15T07:45:00Z",
        "title": "Glucose and HbA1c Report",
        "metadata": {
            "hospital": "Metro Diagnostics",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Routine diabetic screening."
        },
        "ai_analysis": {
            "summary": "Borderline prediabetes. HbA1c and fasting blood glucose are slightly above the normal thresholds.",
            "extracted_values": [
                {"parameter": "HbA1c", "value": "5.8", "unit": "%", "reference_range": "4.0 - 5.6", "status": "high"},
                {"parameter": "Fasting Glucose", "value": "105", "unit": "mg/dL", "reference_range": "70 - 99", "status": "high"}
            ],
            "suggested_actions": [
                "Reduce intake of refined carbohydrates, sugars, and sweetened beverages",
                "Increase daily physical activity and monitor blood sugar levels",
                "Repeat screening in 6 months"
            ],
            "processed_at": "2026-03-15T09:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Record 5: Prescription
    r5 = db.collection('records').document()
    r5.set({
        "id": r5.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "prescription",
        "date": "2026-05-18T14:00:00Z",
        "title": "Hypertension Prescription",
        "metadata": {
            "hospital": "City General Hospital",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Prescribed Amlodipine 5mg to manage mild hypertension. Take daily in the morning."
        },
        "ai_analysis": {
            "summary": "Active prescription for daily Amlodipine 5mg for high blood pressure management.",
            "extracted_values": [
                {"parameter": "Amlodipine Dosage", "value": "5", "unit": "mg", "reference_range": "5 - 10", "status": "normal"}
            ],
            "suggested_actions": [
                "Take 1 tablet daily in the morning with water",
                "Monitor home blood pressure weekly and record readings",
                "Report any ankle swelling or dizziness to your doctor"
            ],
            "processed_at": "2026-05-18T14:15:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Record 6: Vaccination Record
    r6 = db.collection('records').document()
    r6.set({
        "id": r6.id,
        "patient_uid": patient_uid,
        "uploaded_by": patient_uid,
        "type": "vaccination",
        "date": "2026-01-20T11:00:00Z",
        "title": "COVID-19 Booster Vaccination",
        "metadata": {
            "hospital": "Community Vaccination Center",
            "doctor_name": "Nurse Practitioner J. Doe",
            "notes": "Pfizer-BioNTech COVID-19 Vaccine Booster Dose. Batch #PZ12345."
        },
        "ai_analysis": {
            "summary": "Completed booster dose immunization against COVID-19.",
            "extracted_values": [
                {"parameter": "Dose Number", "value": "3", "unit": "", "reference_range": "1 - 3", "status": "normal"}
            ],
            "suggested_actions": [
                "Keep immunization card updated",
                "Monitor for common local side effects (soreness, low fever) for 24-48 hours"
            ],
            "processed_at": "2026-01-20T11:30:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # ==================== EXTRA HISTORICAL RECORDS FOR PATIENT 1 (TREND DATA) ====================
    print("Seeding trend history records for Demo Patient...")

    # Historical CBC — Jan 2026
    rh1 = db.collection('records').document()
    rh1.set({
        "id": rh1.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-01-10T09:00:00Z",
        "title": "Complete Blood Count (Jan)",
        "metadata": {
            "hospital": "City General Lab",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Routine quarterly check."
        },
        "ai_analysis": {
            "summary": "Moderate anemia. WBC and platelets normal.",
            "extracted_values": [
                {"parameter": "Hemoglobin", "value": "10.4", "unit": "g/dL", "reference_range": "12.0 - 16.0", "status": "low"},
                {"parameter": "WBC", "value": "6.9", "unit": "x10^9/L", "reference_range": "4.0 - 11.0", "status": "normal"},
                {"parameter": "Platelets", "value": "230", "unit": "x10^9/L", "reference_range": "150 - 450", "status": "normal"}
            ],
            "suggested_actions": ["Iron supplementation advised"],
            "processed_at": "2026-01-10T10:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Historical CBC — March 2026
    rh2 = db.collection('records').document()
    rh2.set({
        "id": rh2.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-03-05T09:00:00Z",
        "title": "Complete Blood Count (Mar)",
        "metadata": {
            "hospital": "City General Lab",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Follow-up after iron supplementation."
        },
        "ai_analysis": {
            "summary": "Mild improvement in hemoglobin. Still below optimal.",
            "extracted_values": [
                {"parameter": "Hemoglobin", "value": "10.9", "unit": "g/dL", "reference_range": "12.0 - 16.0", "status": "low"},
                {"parameter": "WBC", "value": "7.2", "unit": "x10^9/L", "reference_range": "4.0 - 11.0", "status": "normal"},
                {"parameter": "Platelets", "value": "242", "unit": "x10^9/L", "reference_range": "150 - 450", "status": "normal"}
            ],
            "suggested_actions": ["Continue iron supplementation for 2 more months"],
            "processed_at": "2026-03-05T10:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Historical Lipid Panel — Jan 2026
    rh3 = db.collection('records').document()
    rh3.set({
        "id": rh3.id,
        "patient_uid": patient_uid,
        "uploaded_by": patient_uid,
        "type": "report",
        "date": "2026-01-20T08:00:00Z",
        "title": "Lipid Panel (Jan)",
        "metadata": {
            "hospital": "Metro Diagnostics",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Baseline lipid profile."
        },
        "ai_analysis": {
            "summary": "Very high cholesterol and LDL at baseline.",
            "extracted_values": [
                {"parameter": "Total Cholesterol", "value": "268", "unit": "mg/dL", "reference_range": "100 - 200", "status": "high"},
                {"parameter": "LDL Cholesterol", "value": "185", "unit": "mg/dL", "reference_range": "0 - 100", "status": "high"},
                {"parameter": "HDL Cholesterol", "value": "38", "unit": "mg/dL", "reference_range": "40 - 60", "status": "low"},
                {"parameter": "Triglycerides", "value": "210", "unit": "mg/dL", "reference_range": "30 - 150", "status": "high"}
            ],
            "suggested_actions": ["Dietary changes, increase exercise"],
            "processed_at": "2026-01-20T09:30:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Historical Lipid Panel — Mar 2026
    rh4 = db.collection('records').document()
    rh4.set({
        "id": rh4.id,
        "patient_uid": patient_uid,
        "uploaded_by": patient_uid,
        "type": "report",
        "date": "2026-03-20T08:30:00Z",
        "title": "Lipid Panel (Mar)",
        "metadata": {
            "hospital": "Metro Diagnostics",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Follow-up after diet changes."
        },
        "ai_analysis": {
            "summary": "Moderate improvement in LDL and Triglycerides. Still above target.",
            "extracted_values": [
                {"parameter": "Total Cholesterol", "value": "255", "unit": "mg/dL", "reference_range": "100 - 200", "status": "high"},
                {"parameter": "LDL Cholesterol", "value": "172", "unit": "mg/dL", "reference_range": "0 - 100", "status": "high"},
                {"parameter": "HDL Cholesterol", "value": "42", "unit": "mg/dL", "reference_range": "40 - 60", "status": "normal"},
                {"parameter": "Triglycerides", "value": "195", "unit": "mg/dL", "reference_range": "30 - 150", "status": "high"}
            ],
            "suggested_actions": ["Continue dietary modifications, consider statin therapy"],
            "processed_at": "2026-03-20T10:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Historical Blood Glucose — Jan 2026
    rh5 = db.collection('records').document()
    rh5.set({
        "id": rh5.id,
        "patient_uid": patient_uid,
        "uploaded_by": patient_uid,
        "type": "report",
        "date": "2026-01-15T07:30:00Z",
        "title": "Glucose & HbA1c (Jan)",
        "metadata": {
            "hospital": "Metro Diagnostics",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Diabetic risk screening baseline."
        },
        "ai_analysis": {
            "summary": "Prediabetic range. HbA1c and glucose elevated.",
            "extracted_values": [
                {"parameter": "HbA1c", "value": "6.1", "unit": "%", "reference_range": "4.0 - 5.6", "status": "high"},
                {"parameter": "Fasting Glucose", "value": "112", "unit": "mg/dL", "reference_range": "70 - 99", "status": "high"}
            ],
            "suggested_actions": ["Reduce sugar intake, increase physical activity"],
            "processed_at": "2026-01-15T08:30:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Historical Thyroid — Jan 2026
    rh6 = db.collection('records').document()
    rh6.set({
        "id": rh6.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-01-25T08:00:00Z",
        "title": "Thyroid Function (Jan)",
        "metadata": {
            "hospital": "City General Lab",
            "doctor_name": "Dr. Emily Chen",
            "notes": "Baseline thyroid panel."
        },
        "ai_analysis": {
            "summary": "TSH significantly elevated. Possible hypothyroidism.",
            "extracted_values": [
                {"parameter": "TSH", "value": "5.9", "unit": "mIU/L", "reference_range": "0.4 - 4.0", "status": "high"},
                {"parameter": "Free T4", "value": "0.9", "unit": "ng/dL", "reference_range": "0.8 - 1.8", "status": "normal"}
            ],
            "suggested_actions": ["Repeat in 3 months, monitor symptoms"],
            "processed_at": "2026-01-25T09:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Thyroid — Feb 2026
    rh7 = db.collection('records').document()
    rh7.set({
        "id": rh7.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-02-28T08:00:00Z",
        "title": "Thyroid Function (Feb)",
        "metadata": {
            "hospital": "City General Lab",
            "doctor_name": "Dr. Emily Chen",
            "notes": "Monitoring thyroid function."
        },
        "ai_analysis": {
            "summary": "TSH improved slightly but still above normal.",
            "extracted_values": [
                {"parameter": "TSH", "value": "5.3", "unit": "mIU/L", "reference_range": "0.4 - 4.0", "status": "high"},
                {"parameter": "Free T4", "value": "1.0", "unit": "ng/dL", "reference_range": "0.8 - 1.8", "status": "normal"}
            ],
            "suggested_actions": ["Continue monitoring"],
            "processed_at": "2026-02-28T09:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Blood Pressure Report — Jan 2026
    rh8 = db.collection('records').document()
    rh8.set({
        "id": rh8.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-01-05T10:00:00Z",
        "title": "Blood Pressure Monitor (Jan)",
        "metadata": {
            "hospital": "City General Hospital",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Home BP monitoring log review."
        },
        "ai_analysis": {
            "summary": "Stage 1 hypertension. Systolic consistently elevated.",
            "extracted_values": [
                {"parameter": "Systolic BP", "value": "148", "unit": "mmHg", "reference_range": "90 - 120", "status": "high"},
                {"parameter": "Diastolic BP", "value": "95", "unit": "mmHg", "reference_range": "60 - 80", "status": "high"},
                {"parameter": "Heart Rate", "value": "82", "unit": "bpm", "reference_range": "60 - 100", "status": "normal"}
            ],
            "suggested_actions": ["Start antihypertensive medication"],
            "processed_at": "2026-01-05T10:30:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Blood Pressure — Feb 2026
    rh9 = db.collection('records').document()
    rh9.set({
        "id": rh9.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-02-10T10:00:00Z",
        "title": "Blood Pressure Monitor (Feb)",
        "metadata": {
            "hospital": "City General Hospital",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "1-month follow-up on Amlodipine."
        },
        "ai_analysis": {
            "summary": "Improving response to medication. Systolic trending down.",
            "extracted_values": [
                {"parameter": "Systolic BP", "value": "138", "unit": "mmHg", "reference_range": "90 - 120", "status": "high"},
                {"parameter": "Diastolic BP", "value": "88", "unit": "mmHg", "reference_range": "60 - 80", "status": "high"},
                {"parameter": "Heart Rate", "value": "78", "unit": "bpm", "reference_range": "60 - 100", "status": "normal"}
            ],
            "suggested_actions": ["Continue Amlodipine, recheck in 4 weeks"],
            "processed_at": "2026-02-10T10:30:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Blood Pressure — Apr 2026
    rh10 = db.collection('records').document()
    rh10.set({
        "id": rh10.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-04-15T10:00:00Z",
        "title": "Blood Pressure Monitor (Apr)",
        "metadata": {
            "hospital": "City General Hospital",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "3-month Amlodipine review."
        },
        "ai_analysis": {
            "summary": "Good BP control achieved. Approaching target range.",
            "extracted_values": [
                {"parameter": "Systolic BP", "value": "128", "unit": "mmHg", "reference_range": "90 - 120", "status": "high"},
                {"parameter": "Diastolic BP", "value": "82", "unit": "mmHg", "reference_range": "60 - 80", "status": "high"},
                {"parameter": "Heart Rate", "value": "74", "unit": "bpm", "reference_range": "60 - 100", "status": "normal"}
            ],
            "suggested_actions": ["Maintain current dose, lifestyle adherence"],
            "processed_at": "2026-04-15T10:30:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Blood Pressure — latest May 2026
    rh11 = db.collection('records').document()
    rh11.set({
        "id": rh11.id,
        "patient_uid": patient_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-05-20T10:00:00Z",
        "title": "Blood Pressure Monitor (May)",
        "metadata": {
            "hospital": "City General Hospital",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Ongoing BP monitoring."
        },
        "ai_analysis": {
            "summary": "BP near normal. Good medication adherence.",
            "extracted_values": [
                {"parameter": "Systolic BP", "value": "122", "unit": "mmHg", "reference_range": "90 - 120", "status": "high"},
                {"parameter": "Diastolic BP", "value": "80", "unit": "mmHg", "reference_range": "60 - 80", "status": "normal"},
                {"parameter": "Heart Rate", "value": "72", "unit": "bpm", "reference_range": "60 - 100", "status": "normal"}
            ],
            "suggested_actions": ["Excellent progress, continue current management"],
            "processed_at": "2026-05-20T10:30:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # ==================== SEED DATA FOR PATIENT 2: JOHN DOE ====================
    print("Seeding records for John Doe...")

    r2_1 = db.collection('records').document()
    r2_1.set({
        "id": r2_1.id,
        "patient_uid": patient2_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-05-20T09:00:00Z",
        "title": "Renal Function Panel",
        "metadata": {
            "hospital": "City General Lab",
            "doctor_name": "Dr. Demo",
            "notes": "Routine renal checkup."
        },
        "ai_analysis": {
            "summary": "Kidney function is stable. EGFR and BUN are well within normal limits, though creatinine is near the upper limit.",
            "extracted_values": [
                {"parameter": "eGFR", "value": "95", "unit": "mL/min/1.73m2", "reference_range": ">90", "status": "normal"},
                {"parameter": "BUN", "value": "16", "unit": "mg/dL", "reference_range": "7 - 20", "status": "normal"},
                {"parameter": "Creatinine", "value": "1.2", "unit": "mg/dL", "reference_range": "0.6 - 1.3", "status": "normal"}
            ],
            "suggested_actions": [
                "Maintain adequate hydration throughout the day",
                "Limit excessive intake of protein supplements"
            ],
            "processed_at": "2026-05-20T11:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    r2_2 = db.collection('records').document()
    r2_2.set({
        "id": r2_2.id,
        "patient_uid": patient2_uid,
        "uploaded_by": patient2_uid,
        "type": "report",
        "date": "2026-04-18T08:30:00Z",
        "title": "Lipid Profile",
        "metadata": {
            "hospital": "Metro Diagnostics",
            "doctor_name": "Dr. Demo",
            "notes": "Follow-up for cardiovascular assessment."
        },
        "ai_analysis": {
            "summary": "Total Cholesterol and LDL are slightly high. Patient has mild hyperlipidemia.",
            "extracted_values": [
                {"parameter": "Total Cholesterol", "value": "210", "unit": "mg/dL", "reference_range": "<200", "status": "high"},
                {"parameter": "LDL", "value": "135", "unit": "mg/dL", "reference_range": "<100", "status": "high"},
                {"parameter": "HDL", "value": "42", "unit": "mg/dL", "reference_range": ">40", "status": "normal"}
            ],
            "suggested_actions": [
                "Reduce dietary intake of saturated fats",
                "Increase daily exercise and follow up in 6 months"
            ],
            "processed_at": "2026-04-18T10:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    r2_3 = db.collection('records').document()
    r2_3.set({
        "id": r2_3.id,
        "patient_uid": patient2_uid,
        "uploaded_by": doctor_uid,
        "type": "prescription",
        "date": "2026-05-20T10:15:00Z",
        "title": "Hypertension Medication Prescription",
        "metadata": {
            "hospital": "City General Hospital",
            "doctor_name": "Dr. Demo",
            "notes": "Take 1 tablet daily for blood pressure control."
        },
        "ai_analysis": {
            "summary": "Prescribed Lisinopril 10mg once daily.",
            "extracted_values": [
                {"parameter": "Lisinopril", "value": "10", "unit": "mg", "reference_range": "5 - 40", "status": "normal"}
            ],
            "suggested_actions": [
                "Take at the same time every morning with water",
                "Monitor for side effects like a dry cough"
            ],
            "processed_at": "2026-05-20T10:20:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # ==================== SEED DATA FOR PATIENT 3: JANE MILLER ====================
    print("Seeding records for Jane Miller...")
    r3_1 = db.collection('records').document()
    r3_1.set({
        "id": r3_1.id,
        "patient_uid": patient3_uid,
        "uploaded_by": doctor_uid,
        "type": "report",
        "date": "2026-05-22T11:00:00Z",
        "title": "Spirometry / Lung Function Test",
        "metadata": {
            "hospital": "Pulmonary Health Clinic",
            "doctor_name": "Dr. Emily Chen",
            "notes": "Asthma evaluation."
        },
        "ai_analysis": {
            "summary": "Mild obstructive defect observed, consistent with well-controlled asthma. FEV1/FVC ratio is slightly low.",
            "extracted_values": [
                {"parameter": "FEV1", "value": "2.8", "unit": "L", "reference_range": "2.5 - 3.5", "status": "normal"},
                {"parameter": "FEV1/FVC Ratio", "value": "73", "unit": "%", "reference_range": "75 - 85", "status": "low"}
            ],
            "suggested_actions": [
                "Continue using inhaler as prescribed",
                "Avoid dust and smoke triggers"
            ],
            "processed_at": "2026-05-22T12:30:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    r3_2 = db.collection('records').document()
    r3_2.set({
        "id": r3_2.id,
        "patient_uid": patient3_uid,
        "uploaded_by": patient3_uid,
        "type": "report",
        "date": "2026-03-12T14:00:00Z",
        "title": "Allergy IgE Panel",
        "metadata": {
            "hospital": "Metro Diagnostics",
            "doctor_name": "Dr. Sarah Smith",
            "notes": "Inhalant allergen screening."
        },
        "ai_analysis": {
            "summary": "Positive for severe dust mite allergy and moderate grass pollen allergy.",
            "extracted_values": [
                {"parameter": "Dust Mite IgE", "value": "15.4", "unit": "kUA/L", "reference_range": "<0.35", "status": "critical"},
                {"parameter": "Timothy Grass IgE", "value": "4.2", "unit": "kUA/L", "reference_range": "<0.35", "status": "high"}
            ],
            "suggested_actions": [
                "Use allergen-proof mattress and pillow covers",
                "Consider taking over-the-counter antihistamines during high pollen season"
            ],
            "processed_at": "2026-03-12T16:00:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    r3_3 = db.collection('records').document()
    r3_3.set({
        "id": r3_3.id,
        "patient_uid": patient3_uid,
        "uploaded_by": doctor_uid,
        "type": "prescription",
        "date": "2026-05-22T12:00:00Z",
        "title": "Asthma Action Plan Inhaler",
        "metadata": {
            "hospital": "Pulmonary Health Clinic",
            "doctor_name": "Dr. Emily Chen",
            "notes": "For acute asthma flare-ups."
        },
        "ai_analysis": {
            "summary": "Prescribed Albuterol HFA Inhaler for rescue use.",
            "extracted_values": [
                {"parameter": "Albuterol Inhaler", "value": "90", "unit": "mcg", "reference_range": "90 - 180", "status": "normal"}
            ],
            "suggested_actions": [
                "Inhale 2 puffs every 4-6 hours as needed for shortness of breath or wheezing",
                "Rinse mouth with water after use"
            ],
            "processed_at": "2026-05-22T12:15:00Z"
        },
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # ==================== SEEDING MEDICATIONS ====================
    print("Seeding medications...")
    # Patient 1 Medications
    m1 = db.collection('medications').document()
    m1.set({
        "id": m1.id,
        "patient_uid": patient_uid,
        "name": "Amlodipine 5mg",
        "dosage": "1 tablet",
        "frequency": "once",
        "timing": ["08:00"],
        "start_date": "2026-01-05",
        "end_date": "2026-12-31",
        "instructions": "Take every morning with water. Do not crush. For blood pressure.",
        "condition": "Hypertension",
        "category": "Antihypertensive",
        "color": "#6366f1",
        "status": "active",
        "prescribed_by": "Dr. Sarah Smith",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    m2 = db.collection('medications').document()
    m2.set({
        "id": m2.id,
        "patient_uid": patient_uid,
        "name": "Metformin 500mg",
        "dosage": "1 tablet",
        "frequency": "twice",
        "timing": ["08:00", "21:00"],
        "start_date": "2026-02-15",
        "end_date": "2026-12-31",
        "instructions": "Take with meals to reduce stomach upset. For prediabetes management.",
        "condition": "Prediabetes",
        "category": "Antidiabetic",
        "color": "#10b981",
        "status": "active",
        "prescribed_by": "Dr. Sarah Smith",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    m3_pat1 = db.collection('medications').document()
    m3_pat1.set({
        "id": m3_pat1.id,
        "patient_uid": patient_uid,
        "name": "Ferrous Sulfate 325mg",
        "dosage": "1 tablet",
        "frequency": "once",
        "timing": ["13:00"],
        "start_date": "2026-01-10",
        "end_date": "2026-07-10",
        "instructions": "Take on an empty stomach or with vitamin C for better absorption. Avoid antacids within 2 hours.",
        "condition": "Iron Deficiency Anemia",
        "category": "Iron Supplement",
        "color": "#ef4444",
        "status": "active",
        "prescribed_by": "Dr. Sarah Smith",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    m4_pat1 = db.collection('medications').document()
    m4_pat1.set({
        "id": m4_pat1.id,
        "patient_uid": patient_uid,
        "name": "Levothyroxine 25mcg",
        "dosage": "1 tablet",
        "frequency": "once",
        "timing": ["07:00"],
        "start_date": "2026-02-01",
        "end_date": "2027-02-01",
        "instructions": "Take 30 minutes BEFORE breakfast on an empty stomach. Do not take with calcium or antacids.",
        "condition": "Subclinical Hypothyroidism",
        "category": "Thyroid Hormone",
        "color": "#f59e0b",
        "status": "active",
        "prescribed_by": "Dr. Emily Chen",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    m5_pat1 = db.collection('medications').document()
    m5_pat1.set({
        "id": m5_pat1.id,
        "patient_uid": patient_uid,
        "name": "Rosuvastatin 10mg",
        "dosage": "1 tablet",
        "frequency": "once",
        "timing": ["21:00"],
        "start_date": "2026-03-20",
        "end_date": "2026-12-31",
        "instructions": "Take at night. Avoid grapefruit juice. For high cholesterol.",
        "condition": "Hypercholesterolemia",
        "category": "Statin",
        "color": "#8b5cf6",
        "status": "active",
        "prescribed_by": "Dr. Sarah Smith",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    m6_pat1 = db.collection('medications').document()
    m6_pat1.set({
        "id": m6_pat1.id,
        "patient_uid": patient_uid,
        "name": "Vitamin D3 1000 IU",
        "dosage": "1 capsule",
        "frequency": "once",
        "timing": ["08:00"],
        "start_date": "2026-05-01",
        "end_date": "2026-08-01",
        "instructions": "Take with fatty meal for better absorption.",
        "condition": "Vitamin D Deficiency",
        "category": "Supplement",
        "color": "#f97316",
        "status": "active",
        "prescribed_by": "Dr. Sarah Smith",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    # Patient 2 Medications (John Doe)
    m2_1 = db.collection('medications').document()
    m2_1.set({
        "id": m2_1.id,
        "patient_uid": patient2_uid,
        "name": "Lisinopril 10mg",
        "dosage": "1 tablet",
        "frequency": "once",
        "timing": ["08:00"],
        "start_date": "2026-05-20",
        "end_date": "2026-11-20",
        "instructions": "Take daily in the morning with or without food.",
        "status": "active",
        "prescribed_by": "Dr. Demo",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    m2_2 = db.collection('medications').document()
    m2_2.set({
        "id": m2_2.id,
        "patient_uid": patient2_uid,
        "name": "Omega-3 Fish Oil 1000mg",
        "dosage": "1 capsule",
        "frequency": "twice",
        "timing": ["08:00", "20:00"],
        "start_date": "2026-04-18",
        "end_date": "2026-10-18",
        "instructions": "Take with meals to minimize fishy aftertaste.",
        "status": "active",
        "prescribed_by": "Dr. Demo",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    # Patient 3 Medications (Jane Miller)
    m3_1 = db.collection('medications').document()
    m3_1.set({
        "id": m3_1.id,
        "patient_uid": patient3_uid,
        "name": "Albuterol HFA Inhaler",
        "dosage": "2 puffs",
        "frequency": "as_needed",
        "timing": [],
        "start_date": "2026-05-22",
        "end_date": "2027-05-22",
        "instructions": "Inhale 2 puffs for wheezing or shortness of breath. Rinse mouth after use.",
        "status": "active",
        "prescribed_by": "Dr. Demo",
        "adherence_log": [],
        "created_at": firestore.SERVER_TIMESTAMP
    })

    print("Seeding feedback analytics...")
    feedbacks_to_seed = [
        {
            "patient_uid": patient_uid,
            "text": "The app is very fast and easy to use. I loved the risk prediction feature.",
            "sentiment": "positive",
            "insights": {
                "positive_themes": ["App speed", "Ease of use", "Risk Prediction"],
                "negative_themes": []
            },
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        },
        {
            "patient_uid": patient2_uid,
            "text": "Consultation was okay, but the video was a bit laggy.",
            "sentiment": "neutral",
            "insights": {
                "positive_themes": [],
                "negative_themes": ["Video lag"]
            },
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        },
        {
            "patient_uid": patient3_uid,
            "text": "I could not find my prescription history easily. It's confusing.",
            "sentiment": "negative",
            "insights": {
                "positive_themes": [],
                "negative_themes": ["Confusing UI", "Prescription history difficult to find"]
            },
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        },
        {
            "patient_uid": patient_uid,
            "text": "Really helpful health reports! Great job.",
            "sentiment": "positive",
            "insights": {
                "positive_themes": ["Helpful reports"],
                "negative_themes": []
            },
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
    ]
    for f in feedbacks_to_seed:
        f_ref = db.collection('platform_feedback').document()
        f["id"] = f_ref.id
        f_ref.set(f)

    print("Seed data injected successfully!")


if __name__ == '__main__':
    seed_data()

