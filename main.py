from __future__ import annotations
import json
import re

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    JobIn,
    ResumeParseOut,
    ScoreOut,
    SuggestIn,
    SuggestOut,
    CalibrationOut,
)
from core.parsing import parse_resume
from core.scoring import compute_score
from utilities.constants import ACTION_VERBS, OUTCOME_WORDS, RE_NUMBER

app = FastAPI(title="ATS Simulator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Parse Resume ----
@app.post("/parse-resume", response_model=ResumeParseOut)
async def api_parse_resume(file: UploadFile = File(...)):
    return parse_resume(file)


# ---- Score Resume ----
@app.post("/score", response_model=ScoreOut)
async def api_score(
    file: UploadFile = File(...),
    job_json: str = Form(...),
):
    try:
        job = JobIn.parse_raw(job_json)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid job JSON: {e}")

    parsed = parse_resume(file)
    return compute_score(parsed, job)


# ---- Bullet Rewrite Suggestion ----
@app.post("/suggest", response_model=SuggestOut)
async def api_suggest(payload: SuggestIn):
    src = payload.bullet.strip()
    low = src.lower()

    has_num = bool(RE_NUMBER.search(low))
    if not has_num:
        rationale = "Add a concrete metric (%, ms, ₹) tied to outcome; we won’t invent it."
    else:
        rationale = "Good: metric present. Tightened verb + outcome focus."

    # Strengthen verb
    if not any(low.startswith(v + " ") for v in ACTION_VERBS):
        src = "Implemented " + src[0].lower() + src[1:]

    # Remove weak phrases
    suggestion = re.sub(
        r"\b(responsible for|worked on|helped)\b", "", src, flags=re.I
    ).strip()

    # Add outcome prompt
    if not any(o in suggestion.lower() for o in OUTCOME_WORDS):
        suggestion += " — resulting in [outcome e.g., 35% lower latency]."

    changed = []
    for v in ("implemented", "optimized", "reduced", "increased"):
        if v in suggestion.lower() and v not in low:
            changed.append(v)

    return SuggestOut(suggestion=suggestion, rationale=rationale, changed_tokens=changed)


# ---- Calibration ----
@app.get("/calibration", response_model=CalibrationOut)
async def api_calibration():
    return CalibrationOut(
        dataset_stats={"pairs": 0, "niche": "SWE early-career (IN)"},
        p_at_k=0.0,
        recall=0.0,
        version="v0",
    )

# ---- Health Check ----
@app.get("/health")
async def api_health():
    return {"status": "healthy"}