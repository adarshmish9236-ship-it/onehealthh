from typing import List, Literal
from datetime import datetime
from pydantic import BaseModel, Field

class AdherenceLog(BaseModel):
    date: str
    taken: bool
    taken_at: datetime

class Medication(BaseModel):
    id: str
    patient_uid: str
    prescribed_by: str
    name: str
    dosage: str
    frequency: Literal["once", "twice", "thrice", "weekly", "as_needed"]
    timing: List[str]
    start_date: datetime
    end_date: datetime
    instructions: str
    status: Literal["active", "completed", "stopped"]
    refill_alert_days: int
    adherence_log: List[AdherenceLog] = Field(default_factory=list)
    created_at: datetime
