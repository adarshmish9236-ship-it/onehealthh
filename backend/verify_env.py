import os
import json
import base64
import sys

# Initialize Firebase for testing
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai

# Load AppConfig (will run validation on import)
try:
    from config import AppConfig
except Exception as e:
    print(f"AppConfig Validation Error: {e}")
    sys.exit(1)

def verify_environment():
    checklist = {
        "FIREBASE_CREDENTIALS_JSON": False,
        "FIREBASE_CREDENTIALS_PARSABLE": False,
        "FIREBASE_SDK_INIT": False,
        "GEMINI_API_KEY": False,
        "GEMINI_SDK_INIT": False,
    }

    firebase_creds = AppConfig.FIREBASE_CREDENTIALS_JSON
    if firebase_creds:
        checklist["FIREBASE_CREDENTIALS_JSON"] = True
        try:
            creds_json = json.loads(firebase_creds)
            
            # Check for essential keys
            required_keys = ['type', 'project_id', 'private_key', 'client_email']
            if all(key in creds_json for key in required_keys):
                checklist["FIREBASE_CREDENTIALS_PARSABLE"] = True
                
                # Attempt to initialize Firebase SDK
                try:
                    if not firebase_admin._apps:
                        cred = credentials.Certificate(creds_json)
                        firebase_admin.initialize_app(cred, {
                            'projectId': AppConfig.FIREBASE_PROJECT_ID or creds_json.get('project_id'),
                            'storageBucket': AppConfig.FIREBASE_STORAGE_BUCKET or 'test.appspot.com'
                        })
                    
                    # Test firestore connection
                    db = firestore.client()
                    # Just a simple read to check auth
                    list(db.collection('health_checks').limit(1).stream())
                    checklist["FIREBASE_SDK_INIT"] = True
                except Exception as e:
                    print(f"Firebase SDK Initialization Error: {e}")
            else:
                print("Firebase Credentials JSON missing required keys.")
                
        except Exception as e:
            print(f"Error parsing FIREBASE_CREDENTIALS_JSON: {e}")
    
    gemini_key = AppConfig.GEMINI_API_KEY
    if gemini_key:
        checklist["GEMINI_API_KEY"] = True
        try:
            genai.configure(api_key=gemini_key)
            # A simple lightweight call to check if the key is valid
            models = list(genai.list_models())
            if any("gemini" in m.name.lower() for m in models):
                checklist["GEMINI_SDK_INIT"] = True
        except Exception as e:
            print(f"Gemini SDK Initialization Error: {e}")

    print("\n--- Environment Verification Checklist ---")
    for key, status in checklist.items():
        print(f"{key}: {'[PASS]' if status else '[FAIL]'}")
    
    if all(checklist.values()):
        print("\nAll systems initialized successfully.")
        return True
    else:
        print("\nEnvironment verification failed. Please check your configuration.")
        return False

if __name__ == "__main__":
    success = verify_environment()
    sys.exit(0 if success else 1)
