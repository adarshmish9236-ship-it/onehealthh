import api from './api'

export const aiService = {
  // Symptom Analyzer API
  async analyzeSymptoms(data) {
    // data: { symptoms: string[], duration: string, patient_context: object }
    const response = await api.post('/ai/analyze-symptoms', data)
    return response.data
  },

  // Analyze Lab Report
  async analyzeReport(formData) {
    const response = await api.post('/ai/analyze-report', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Health Risk Prediction
  async predictRisk(data) {
    const response = await api.post('/ai/risk-prediction', data)
    return response.data
  },

  // Health Report Generator API
  async generateHealthReport(data) {
    // data: { patient_context: object, health_records_summary: string }
    const response = await api.post('/ai/generate-health-report', data)
    return response.data
  },

  // Emergency Guidance API
  async getEmergencyGuidance(data) {
    // data: { symptoms_text: string, patient_context: object }
    const response = await api.post('/ai/emergency-guidance', data)
    return response.data
  },

  // Feedback Analysis (Direct AI call)
  async analyzeFeedback(text) {
    const response = await api.post('/ai/analyze-feedback', { text })
    return response.data
  },

  // Feedback Submission (Saves to DB)
  async submitFeedback(data) {
    // data: { text: string, rating: number }
    const response = await api.post('/feedback/', data)
    return response.data
  }
}
