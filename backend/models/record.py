from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field

class Metadata(BaseModel):
    doctor_name: str
    hospital: str
    doctor_uid: Optional[str] = None
    notes: str

class ExtractedValue(BaseModel):
    parameter: str
    value: str
    unit: str
    reference_range: str
    status: Literal["normal", "high", "low", "critical"]

class AIAnalysis(BaseModel):
    extracted_values: List[ExtractedValue]
    summary: str
    suggested_actions: List[str]
    processed_at: datetime

class HealthRecord(BaseModel):
    id: str
    patient_uid: str
    uploaded_by: str
    type: Literal["report", "prescription", "diagnosis", "vaccination", "symptom_check", "treatment", "followup"]
    date: datetime
    title: str
    file_url: Optional[str] = None
    metadata: Metadata
    ai_analysis: Optional[AIAnalysis] = None
    created_at: datetime
    updated_at: datetime
