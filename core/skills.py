import re
from typing import List, Dict, Any
from utilities.constants import SKILL_ONTOLOGY

def normalize_skill(s: str) -> str:
    return re.sub(r"[^a-z0-9+.#]", " ", s.lower()).strip()


def expand_skill(skill: str) -> List[str]:
    s = normalize_skill(skill)
    aliases = SKILL_ONTOLOGY.get(s, {}).get("aliases", [])
    return [s] + [normalize_skill(a) for a in aliases]


def extract_skills_from_text(text: str) -> List[str]:
    text_low = normalize_skill(text)
    hits = set()
    for base, meta in SKILL_ONTOLOGY.items():
        aliases = {base, *{normalize_skill(a) for a in meta.get("aliases", [])}}
        for a in aliases:
            if re.search(rf"\b{re.escape(a)}\b", text_low):
                hits.add(base)
    return sorted(hits)
