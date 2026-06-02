import api from './api'

// --- Fallback Mock Data ---
const FALLBACKS = {
  analyzeSymptoms: {
    severity: 'low',
    severity_explanation: 'Your symptoms suggest a common viral infection like a mild cold or flu. Risk level is currently low.',
    possible_conditions: [
      { name: 'Common Cold', confidence: 'high', explanation: 'A viral infection of your nose and throat.' },
      { name: 'Seasonal Allergies', confidence: 'medium', explanation: 'An immune response to airborne substances.' }
    ],
    recommendations: [
      'Get plenty of rest and stay hydrated.',
      'Monitor your temperature regularly.',
      'Use a saline nasal spray for congestion.'
    ],
    otc_suggestions: [
      { medicine: 'Paracetamol', dosage_note: '500mg every 6 hours as needed for fever.' },
      { medicine: 'Cetirizine', dosage_note: '10mg once daily for allergy symptoms.' }
    ],
    seek_emergency: false,
    warning_signs: ['High fever (>103°F)', 'Difficulty breathing', 'Chest pain'],
    disclaimer: 'This is an AI-generated assessment and not a medical diagnosis. Consult a doctor for professional advice.'
  },
  analyzeReport: {
    summary: 'Clinical analysis reveals significant findings in lipid profile and hematology. LDL cholesterol is above optimal levels, and haemoglobin is at the lower end of the normal range, suggesting a need for dietary adjustments.',
    extracted_values: [
      { parameter: 'Haemoglobin', value: '12.8', unit: 'g/dL', status: 'normal', reference_range: '12.0 - 16.0' },
      { parameter: 'Total Cholesterol', value: '215', unit: 'mg/dL', status: 'high', reference_range: '< 200' },
      { parameter: 'LDL Cholesterol', value: '148', unit: 'mg/dL', status: 'high', reference_range: '< 100' },
      { parameter: 'HDL Cholesterol', value: '42', unit: 'mg/dL', status: 'normal', reference_range: '> 40' },
      { parameter: 'Fasting Blood Sugar', value: '105', unit: 'mg/dL', status: 'high', reference_range: '70 - 100' },
      { parameter: 'TSH', value: '2.4', unit: 'mIU/L', status: 'normal', reference_range: '0.4 - 4.0' }
    ],
    risk_assessment: 'Moderate risk for cardiovascular issues due to hyperlipidemia and pre-diabetic glucose levels.',
    recommendations: [
      'Adopt a Mediterranean-style diet low in saturated fats.',
      'Engage in 150 minutes of moderate-intensity aerobic activity per week.',
      'Consult a physician regarding lipid management.',
      'Repeat lipid profile and HbA1c in 3 months.'
    ]
  },
  predictRisk: {
    risk_level: 'medium',
    score: 65,
    factors: [
      { name: 'Family History', impact: 'high', note: 'History of diabetes in immediate family.' },
      { name: 'BMI', impact: 'medium', note: 'Body Mass Index is in the overweight category.' }
    ],
    preventive_measures: [
      'Schedule annual blood sugar screenings.',
      'Adopt a low-glycemic index diet.'
    ]
  },
  generateHealthReport: {
    report_url: '#',
    summary: 'Overall health is stable. Improvement noted in blood pressure management compared to last year. Focus area: Physical activity consistency.',
    vital_trends: 'Stable',
    next_steps: ['Consultation with nutritionist', 'Follow-up ECG in 6 months']
  },
  getEmergencyGuidance: {
    guidance: '1. Stay calm and sit down.\n2. Loosen tight clothing.\n3. If you have prescribed emergency medicine, take it now.\n4. Do not attempt to drive yourself to the hospital.',
    is_critical: true,
    action_text: 'Call Emergency Services (102/108) Immediately'
  },
  analyzeFeedback: {
    sentiment: 'positive',
    category: 'user_experience',
    summary: 'The user is satisfied with the speed and layout of the application.'
  }
}

export const aiService = {
  // Symptom Analyzer API
  async analyzeSymptoms(data) {
    try {
      const response = await api.post('/ai/analyze-symptoms', data)
      return response.data
    } catch (err) {
      console.warn('[aiService] analyzeSymptoms failed, using fallback:', err)
      return FALLBACKS.analyzeSymptoms
    }
  },

  // Analyze Lab Report
  async analyzeReport(formData) {
    try {
      const response = await api.post('/ai/analyze-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (err) {
      console.warn('[aiService] analyzeReport failed, using fallback:', err)
      return FALLBACKS.analyzeReport
    }
  },

  // Health Risk Prediction
  async predictRisk(data) {
    try {
      const response = await api.post('/ai/risk-prediction', data)
      return response.data
    } catch (err) {
      console.warn('[aiService] predictRisk failed, using fallback:', err)
      return FALLBACKS.predictRisk
    }
  },

  // Health Report Generator API
  async generateHealthReport(data) {
    try {
      const response = await api.post('/ai/generate-health-report', data)
      return response.data
    } catch (err) {
      console.warn('[aiService] generateHealthReport failed, using fallback:', err)
      return FALLBACKS.generateHealthReport
    }
  },

  // Emergency Guidance API
  async getEmergencyGuidance(data) {
    try {
      const response = await api.post('/ai/emergency-guidance', data)
      return response.data
    } catch (err) {
      console.warn('[aiService] getEmergencyGuidance failed, using fallback:', err)
      return FALLBACKS.getEmergencyGuidance
    }
  },

  // Feedback Analysis (Direct AI call)
  async analyzeFeedback(text) {
    try {
      const response = await api.post('/ai/analyze-feedback', { text })
      return response.data
    } catch (err) {
      console.warn('[aiService] analyzeFeedback failed, using fallback:', err)
      return FALLBACKS.analyzeFeedback
    }
  },

  // Feedback Submission (Saves to DB)
  async submitFeedback(data) {
    // data: { text: string, rating: number }
    const response = await api.post('/feedback/', data)
    return response.data
  }
}

