import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

def verify_gemini_credentials():
    load_dotenv()
    
    raw_key = os.getenv('GEMINI_API_KEY')
    if not raw_key:
        print("ERROR: GEMINI_API_KEY is completely missing from the environment.")
        sys.exit(1)
        
    # Safely parse and sanitize the key string
    sanitized_key = raw_key.strip().strip("'\"")
    
    if len(sanitized_key) < 10:
        print("ERROR: GEMINI_API_KEY is too short to be valid.")
        sys.exit(1)
        
    print("Testing connection to Google AI Studio with sanitized API key...")
    try:
        genai.configure(api_key=sanitized_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        # Execute a safe, real network handshake call
        response = model.generate_content("Say hello", request_options={"timeout": 30.0})
        if response.text:
            print("SUCCESS: Gemini API key is valid and connection is fully operational.")
            sys.exit(0)
        else:
            print("ERROR: Gemini returned an empty response.")
            sys.exit(1)
    except Exception as e:
        error_msg = str(e)
        if "403" in error_msg or "API_KEY_INVALID" in error_msg:
            print(f"ERROR: API Key is invalid or restricted. Google SDK Error: {error_msg}")
        elif "timeout" in error_msg.lower() or "deadline" in error_msg.lower():
            print(f"ERROR: Network timeout connecting to Google AI Studio. Error: {error_msg}")
        else:
            print(f"ERROR: Failed to connect or validate API key. Error: {error_msg}")
        sys.exit(1)

if __name__ == "__main__":
    verify_gemini_credentials()
