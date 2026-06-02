import os
import json
import requests
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from utils.exceptions import APIError
from config import AppConfig

# Initialize Gemini
if AppConfig.GEMINI_API_KEY:
    genai.configure(api_key=AppConfig.GEMINI_API_KEY)

# Safety settings per TRD 7.1
SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}

def get_generation_config(max_tokens: int):
    return genai.types.GenerationConfig(
        temperature=0.2,
        top_p=0.8,
        max_output_tokens=max_tokens,
        response_mime_type="application/json"
    )

def _call_groq_fallback(system_instruction: str, prompt: str, max_tokens: int):
    """Fallback handler to route the request to Groq if Gemini fails or is unavailable."""
    if not AppConfig.GROQ_API_KEY:
        raise APIError("INTERNAL_ERROR", "AI Service Error: Gemini failed and Groq API key is missing", 500)
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {AppConfig.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": max_tokens,
        "response_format": {"type": "json_object"}
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60.0)
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as e:
        raise APIError("INTERNAL_ERROR", f"AI Service Error (Groq Fallback): {str(e)}", 500)

def _call_ai(system_instruction: str, prompt: str, max_tokens: int):
    """Rotates/Falls back between Gemini and Groq for high availability."""
    try:
        if not AppConfig.GEMINI_API_KEY:
            raise ValueError("No Gemini key configured")
            
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction,
            generation_config=get_generation_config(max_tokens),
            safety_settings=SAFETY_SETTINGS
        )
        response = model.generate_content(prompt, request_options={"timeout": 60.0})
        return json.loads(response.text)
    except Exception as e:
        # Fallback to Groq
        print(f"Gemini failed, falling back to Groq. Reason: {e}")
        return _call_groq_fallback(system_instruction, prompt, max_tokens)

def analyze_symptoms(symptoms: list, duration: str, patient_context: dict):
    system_prompt = """You are a medical AI assistant for the oneHealth platform. Your role is to
analyze reported symptoms and provide helpful health guidance. You are NOT
a replacement for professional medical consultation.
Always respond in the following JSON format exactly:
{
  "severity": "low" | "medium" | "high",
  "severity_explanation": "string",
  "possible_conditions": [
    { "name": "string", "explanation": "string", "confidence": "low"|"medium"|"high" }
  ],
  "recommendations": ["string"],
  "otc_suggestions": [
    { "medicine": "string", "dosage_note": "string" }
  ],
  "warning_signs": ["string"],
  "seek_emergency": boolean,
  "disclaimer": "string"
}"""
    
    user_prompt = f"""Patient symptoms: {', '.join(symptoms)}
Duration: {duration}
Patient context:
- Age: {patient_context.get('age', 'N/A')}, Gender: {patient_context.get('gender', 'N/A')}
- Blood Group: {patient_context.get('blood_group', 'N/A')}
- Known allergies: {', '.join(patient_context.get('allergies', []))}
- Chronic conditions: {', '.join(patient_context.get('chronic_diseases', []))}
- Current medications: {', '.join(patient_context.get('current_medications', []))}
Analyze these symptoms and respond with the JSON format specified."""
    
    return _call_ai(system_prompt, user_prompt, max_tokens=1024)

def analyze_report(report_text: str, patient_context: dict):
    system_prompt = """You are a medical report interpreter for the oneHealth platform.
Extract all medical values from the provided report text and generate
a patient-friendly summary. Avoid medical jargon.
Respond ONLY in this JSON format:
{
  "report_type": "string",
  "extracted_values": [
    {
      "parameter": "string",
      "value": "string",
      "unit": "string",
      "reference_range": "string",
      "status": "normal" | "high" | "low" | "critical",
      "plain_explanation": "string"
    }
  ],
  "overall_summary": "string",
  "abnormal_findings": ["string"],
  "suggested_actions": ["string"],
  "urgency": "routine" | "soon" | "urgent"
}"""
    
    user_prompt = f"""[Extracted text from uploaded report PDF/image]
{report_text}

Patient context: Age {patient_context.get('age', 'N/A')}, Gender {patient_context.get('gender', 'N/A')}, Chronic conditions: {', '.join(patient_context.get('chronic_diseases', []))}"""
    
    return _call_ai(system_prompt, user_prompt, max_tokens=1024)

def risk_prediction(patient_context: dict, health_records_context: str):
    system_prompt = """You are a health risk prediction AI for the oneHealth platform.
Assess the patient's context and health records to predict future health risks.
Respond ONLY in this JSON format:
{
  "risks": [
    {
      "condition": "string",
      "level": "low" | "medium" | "high",
      "factors": ["string"],
      "recommendations": ["string"]
    }
  ]
}"""
    
    user_prompt = f"""Patient context:
- Age: {patient_context.get('age', 'N/A')}, Gender: {patient_context.get('gender', 'N/A')}
- Blood Group: {patient_context.get('blood_group', 'N/A')}
- Known allergies: {', '.join(patient_context.get('allergies', []))}
- Chronic conditions: {', '.join(patient_context.get('chronic_diseases', []))}
- Current medications: {', '.join(patient_context.get('current_medications', []))}

Health Records Summary:
{health_records_context}

Analyze these details and predict potential health risks."""
    
    return _call_ai(system_prompt, user_prompt, max_tokens=1024)

def emergency_guidance(symptoms_text: str, patient_context: dict):
    system_prompt = """You are an emergency medical guidance AI. Assess the described emergency
symptoms and provide clear, immediate guidance. If life-threatening signs
are present, always instruct the user to call emergency services.
Respond ONLY in this JSON format:
{
  "risk_level": "low" | "medium" | "high" | "critical",
  "possible_emergency": "string",
  "immediate_instructions": ["string"],
  "call_emergency_services": boolean,
  "emergency_number": "112",
  "reassurance": "string"
}"""
    
    user_prompt = f"""Emergency situation: {symptoms_text}
Patient: Age {patient_context.get('age', 'N/A')}, Blood Group {patient_context.get('blood_group', 'N/A')}
Chronic conditions: {', '.join(patient_context.get('chronic_diseases', []))}
Current medications: {', '.join(patient_context.get('current_medications', []))}
Allergies: {', '.join(patient_context.get('allergies', []))}"""
    
    return _call_ai(system_prompt, user_prompt, max_tokens=1024)

def analyze_feedback(feedback_text: str):
    system_prompt = """You are a senior feedback analysis AI. Analyze the user's feedback text about a healthcare interaction.
Determine the sentiment, confidence score, themes, key topics, and provide a concise summary.
Respond ONLY in this JSON format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": number (0-100),
  "positive_themes": ["string"],
  "negative_themes": ["string"],
  "key_topics": ["string"],
  "summary": "string"
}"""
    
    user_prompt = f"""Feedback text: {feedback_text}"""
    
    return _call_ai(system_prompt, user_prompt, max_tokens=512)

def generate_health_report(patient_context: dict, health_records_context: str):
    system_prompt = """You are a senior clinical analyst AI. Your task is to generate a 
comprehensive Health Summary Report for a patient based on their medical history, 
chronic conditions, and recent health data.
The report should be structured, professional, and provide clear actionable insights for both the patient and their doctor.
Respond ONLY in this JSON format:
{
  "report_title": "string",
  "patient_status": "string",
  "key_findings": [
    { "title": "string", "detail": "string", "severity": "success"|"info"|"warning"|"danger" }
  ],
  "risk_summary": {
    "cardiovascular": "low"|"medium"|"high",
    "metabolic": "low"|"medium"|"high",
    "respiratory": "low"|"medium"|"high",
    "general": "low"|"medium"|"high"
  },
  "recommendations": ["string"],
  "lifestyle": ["string"],
  "followup_plan": [
    { "action": "string", "date": "ISO8601 string" }
  ]
}"""
    
    user_prompt = f"""Patient Bio:
- Age: {patient_context.get('age', 'N/A')}, Gender: {patient_context.get('gender', 'N/A')}
- Blood Group: {patient_context.get('blood_group', 'N/A')}
- Allergies: {', '.join(patient_context.get('allergies', []))}
- Chronic conditions: {', '.join(patient_context.get('chronic_diseases', []))}
- Current medications: {', '.join(patient_context.get('current_medications', []))}

Medical Records Context (Last 12 months):
{health_records_context}

Generate the comprehensive clinical health report."""
    
    return _call_ai(system_prompt, user_prompt, max_tokens=2048)
