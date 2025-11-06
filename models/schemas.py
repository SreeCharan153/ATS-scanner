from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
class JobIn(BaseModel):
    title: str
    company: Optional[str] = None
    jd_text: str = Field(..., description="Raw job description text")
    required_skills: Optional[List[str]] = None
    nice_skills: Optional[List[str]] = None
    min_years: Optional[int] = None
    max_years: Optional[int] = None

class ResumeParseOut(BaseModel):
    parse_score: float
    sections: Dict[str, Any]
    ats_view_text: str
    risks: List[str]
    pii: Dict[str, List[str]]

class ScoreBreakdown(BaseModel):
    parse: float
    coverage: float
    seniority: float
    impact: float
    format_risk: float

class CoverageItem(BaseModel):
    skill: str
    weight: float
    match_type: str  # exact|alias|fuzzy
    locations: List[str]

class ScoreOut(BaseModel):
    total: float
    subscores: ScoreBreakdown
    coverage_hits: List[CoverageItem]
    coverage_gaps: List[str]
    explainability: List[str]

class SuggestIn(BaseModel):
    bullet: str
    jd_text: str

class SuggestOut(BaseModel):
    suggestion: str
    rationale: str
    changed_tokens: List[str]
    
class CalibrationOut(BaseModel):
    dataset_stats: Dict[str, Any]
    p_at_k: float
    recall: float
    version: str