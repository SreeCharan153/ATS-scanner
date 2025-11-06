from typing import Dict, Tuple, List, Any
from fastapi import UploadFile
import re
import io

from pdfminer.high_level import extract_text
from docx import Document

from utilities.constants import MULTICOLUMN_HINTS, RE_EMAIL, RE_PHONE
from models.schemas import ResumeParseOut


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, List[str]]:
    """Real PDF extractor using pdfminer.six"""
    risks = []
    try:
        text = extract_text(io.BytesIO(file_bytes))
        if not text.strip():
            risks.append("pdf_text_extraction_empty")
        return text, risks
    except Exception:
        return "", ["pdf_text_extraction_failed"]


def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, List[str]]:
    """Real docx extractor using python-docx"""
    risks = []
    try:
        doc = Document(io.BytesIO(file_bytes))
        text = "\n".join(p.text for p in doc.paragraphs)
        if not text.strip():
            risks.append("docx_extraction_empty")
        return text, risks
    except Exception:
        return "", ["docx_extraction_failed"]


def guess_sections(text: str) -> Dict[str, Any]:
    lines = [l.strip() for l in text.splitlines()]
    blocks = {
        "contact": [],
        "education": [],
        "experience": [],
        "projects": [],
        "skills": [],
        "other": [],
    }
    curr = "other"
    for ln in lines:
        low = ln.lower()
        if re.match(r"^\s*(contact|contacts)$", low): curr = "contact"; continue
        if re.match(r"^\s*(education|academics)$", low): curr = "education"; continue
        if re.match(r"^\s*(experience|work experience|internship)s?$", low): curr = "experience"; continue
        if re.match(r"^\s*(project|projects)$", low): curr = "projects"; continue
        if re.match(r"^\s*(skills|technical skills)$", low): curr = "skills"; continue
        blocks[curr].append(ln)
    return blocks


def detect_pii(text: str) -> Dict[str, List[str]]:
    return {
        "emails": RE_EMAIL.findall(text),
        "phones": RE_PHONE.findall(text),
        "names": [],  # Add NER later
    }


def format_risks(text: str) -> List[str]:
    risks = []
    if text.count("\t") > 20:
        risks.append("multicolumn_or_tables_suspected")

    for hint in MULTICOLUMN_HINTS:
        if hint in text.lower():
            risks.append("layout_columns_hint:" + hint)
            break

    lines = text.splitlines()
    if len(lines) > 30:
        if lines.count(lines[0]) > 2:
            risks.append("header_repetition")
        if lines.count(lines[-1]) > 2:
            risks.append("footer_repetition")

    return risks


def parse_resume(file: UploadFile) -> ResumeParseOut:
    content = file.file.read()
    filename = (file.filename or "").lower()

    # Choose extractor
    if filename.endswith(".pdf"):
        text, risks = extract_text_from_pdf(content)
    elif filename.endswith(".docx"):
        text, risks = extract_text_from_docx(content)
    else:
        try:
            text = content.decode("utf-8", errors="ignore")
            risks = []
        except Exception:
            text, risks = "", ["unknown_format"]

    sections = guess_sections(text)
    pii = detect_pii(text)
    risks.extend(format_risks(text))

    # scoring for parse quality
    text_ratio = len(text.strip()) / max(1, len(content))
    section_count = sum(
        1 for k in ("contact", "education", "experience", "skills") if sections.get(k)
    )
    parse_score = 10 * min(1.0, text_ratio * 2.0) + 2.5 * section_count
    parse_score = max(0.0, min(20.0, parse_score))

    return ResumeParseOut(
        parse_score=parse_score,
        sections=sections,
        ats_view_text=text,
        risks=risks,
        pii=pii,
    )
