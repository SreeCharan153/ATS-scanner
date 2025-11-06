# core/scoring.py
from __future__ import annotations
import re
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple

from models.schemas import JobIn, ScoreOut, ScoreBreakdown, CoverageItem
from utilities.constants import ACTION_VERBS, OUTCOME_WORDS, RE_NUMBER
from .skills import normalize_skill, expand_skill

@dataclass
class MatchHit:
    skill: str
    weight: float  # 2 for required, 1 for nice
    match_type: str  # exact|alias
    locations: List[str]


def coverage_score(resume_text: str, job: JobIn) -> Tuple[float, List[MatchHit], List[str]]:
    required = [normalize_skill(s) for s in (job.required_skills or [])]
    nice = [normalize_skill(s) for s in (job.nice_skills or [])]
    resume_low = normalize_skill(resume_text)

    hits: List[MatchHit] = []
    misses: List[str] = []

    def find_locations(term: str) -> List[str]:
        ctx = []
        for m in re.finditer(rf"(.{{0,40}}\b{re.escape(term)}\b.{{0,40}})", resume_low):
            ctx.append(m.group(0))
        return ctx[:3]

    def check(skill: str, weight: float):
        for token in expand_skill(skill):
            if re.search(rf"\b{re.escape(token)}\b", resume_low):
                hits.append(
                    MatchHit(
                        skill=skill,
                        weight=weight,
                        match_type="exact" if token == skill else "alias",
                        locations=find_locations(token),
                    )
                )
                return True
        return False

    # run checks
    for s in required:
        if not check(s, 2.0):
            misses.append(s)
    for s in nice:
        if not check(s, 1.0):
            misses.append(s)

    max_points = 2.0 * len(required) + 1.0 * len(nice)
    got_points = sum(h.weight for h in hits)
    cov = 40.0 * (got_points / max_points) if max_points > 0 else 40.0

    return cov, hits, misses


def seniority_score(resume_text: str, job: JobIn) -> float:
    yrs = 0
    for m in re.finditer(r"(\d+)\s*\+?\s*years", resume_text.lower()):
        try:
            yrs = max(yrs, int(m.group(1)))
        except Exception:
            pass

    if job.min_years is None and job.max_years is None:
        return 15.0

    miny = job.min_years or 0
    maxy = job.max_years or max(miny, 10)

    if yrs < miny:
        return max(0.0, 15.0 * (yrs / max(1.0, miny)))
    if yrs > maxy:
        return max(0.0, 15.0 - 3.0 * (yrs - maxy))

    return 15.0


def impact_score(sections: Dict[str, Any]) -> float:
    def score_line(line: str) -> int:
        low = line.lower()
        has_num = bool(RE_NUMBER.search(low))
        has_verb = any(v in low for v in ACTION_VERBS)
        has_outcome = any(o in low for o in OUTCOME_WORDS)
        return 1 if (has_num and has_verb and has_outcome) else 0

    total_bullets = 0
    hits = 0

    for sec in ("experience", "projects"):
        for ln in sections.get(sec, [])[:100]:
            total_bullets += 1
            hits += score_line(ln)

    if total_bullets == 0:
        return 0.0

    return min(15.0, 15.0 * (hits / 8.0))


def format_risk_score(risks: List[str]) -> float:
    score = 10.0
    for r in risks:
        if r.startswith("layout_columns_hint"):
            score -= 4
        elif r == "multicolumn_or_tables_suspected":
            score -= 4
        elif r in {"header_repetition", "footer_repetition"}:
            score -= 2
        elif r.endswith("extractor_stub") or r.endswith("extraction_failed"):
            score -= 5
    return max(0.0, score)


def compute_score(parsed, job):
    cov, hits, misses = coverage_score(parsed.ats_view_text, job)
    sen = seniority_score(parsed.ats_view_text, job)
    imp = impact_score(parsed.sections)
    fr = format_risk_score(parsed.risks)

    subs = ScoreBreakdown(
        parse=parsed.parse_score,
        coverage=cov,
        seniority=sen,
        impact=imp,
        format_risk=fr,
    )

    total = parsed.parse_score + cov + sen + imp + fr

    explain = [
        f"{h.skill}: {h.match_type} -> e.g. {[l.replace(chr(10), ' ') for l in h.locations][:1]}"
        for h in hits
    ]

    return ScoreOut(
        total=round(total, 2),
        subscores=subs,
        coverage_hits=[CoverageItem(**h.__dict__) for h in hits],
        coverage_gaps=misses,
        explainability=explain,
    )
    
