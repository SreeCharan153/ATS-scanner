from __future__ import annotations
import re

ACTION_VERBS = {
    "improved","reduced","increased","decreased","boosted","cut","optimized",
    "accelerated","launched","built","designed","implemented","shipped","delivered",
    "migrated","refactored","automated","scaled","hardened","secured","led","mentored",
}

OUTCOME_WORDS = {
    "latency","throughput","revenue","cost","error","downtime","availability",
    "conversion","retention","adoption","accuracy","precision","recall","f1","coverage",
}

MULTICOLUMN_HINTS = {"columns", "two-column", "table"}

RE_PHONE = re.compile(r"(?:(?:\+\d{1,3}[ -]?)?(?:\d{3}[ -]?){2}\d{4})")
RE_EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
RE_NUMBER = re.compile(r"\b\d+(?:\.\d+)?%?\b")

# A tiny seed ontology. Replace/extend with a curated list + aliases per niche.
SKILL_ONTOLOGY = {
    "python": {"aliases": ["py", "python3", "py3"]},
    "fastapi": {"aliases": []},
    "django": {"aliases": []},
    "flask": {"aliases": []},
    "postgres": {"aliases": ["postgresql", "psql"]},
    "mysql": {"aliases": []},
    "mongodb": {"aliases": ["mongo"]},
    "redis": {"aliases": []},
    "celery": {"aliases": []},
    "kafka": {"aliases": []},
    "docker": {"aliases": []},
    "kubernetes": {"aliases": ["k8s"]},
    "aws": {"aliases": ["amazon web services", "lambda", "s3", "ec2"]},
    "gcp": {"aliases": ["google cloud"]},
    "azure": {"aliases": []},
    "git": {"aliases": ["github", "gitlab"]},
    "linux": {"aliases": []},
}