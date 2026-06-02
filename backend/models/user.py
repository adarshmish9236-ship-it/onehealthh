from typing import List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str

class Profile(BaseModel):
    dob: str
    gender: Literal["male", "female", "other"]
    blood_group: str
    height_cm: float
    weight_kg: float
    photo_url: str
    allergies: List[str] = Field(default_factory=list)
    chronic_diseases: List[str] = Field(default_factory=list)
    medical_notes: str = ""
    emergency_contacts: List[EmergencyContact] = Field(default_factory=list)

class DoctorProfile(BaseModel):
    registration_number: str
    specialisation: str
    hospital: str
    verified: bool = False
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None

class ReminderTimes(BaseModel):
    morning: str
    afternoon: str
    night: str

class Settings(BaseModel):
    notifications_enabled: bool = True
    reminder_times: ReminderTimes
    theme: Literal["light", "dark"] = "light"
    language: str = "en"

class User(BaseModel):
    uid: str
    email: str
    name: str
    phone: str
    role: Literal["patient", "doctor", "admin"]
    created_at: datetime
    updated_at: datetime
    profile: Optional[Profile] = None
    doctor_profile: Optional[DoctorProfile] = None
    settings: Optional[Settings] = None
