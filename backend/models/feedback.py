from pydantic import BaseModel, Field
from typing import List, Literal

class Feedback(BaseModel):
    text: str = Field(..., min_length=5, max_length=1000)

class FeedbackAnalysis(BaseModel):
    sentiment: Literal["Positive", "Neutral", "Negative"]
    insights: List[str]
