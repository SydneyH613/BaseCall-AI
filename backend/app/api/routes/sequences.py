"""Stateless, unauthenticated compute endpoints for instant UI feedback.

These return raw computed results only (no AI explanation, no DB
persistence) so the frontend can show live stats/ORFs/alignment as a
user types or uploads, before they commit to saving a full analysis.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.fasta_utils import (
    MAX_SEQUENCE_LENGTH,
    call_variants,
    find_orfs,
    parse_single_sequence,
    primer_report,
    sequence_stats,
)

router = APIRouter(prefix="/api/sequences", tags=["sequences"])


class SequenceIn(BaseModel):
    sequence: str = Field(max_length=MAX_SEQUENCE_LENGTH)


class OrfQueryIn(BaseModel):
    sequence: str = Field(max_length=MAX_SEQUENCE_LENGTH)
    min_length: int = 30


class CompareIn(BaseModel):
    reference: str = Field(max_length=MAX_SEQUENCE_LENGTH)
    query: str = Field(max_length=MAX_SEQUENCE_LENGTH)


@router.post("/stats")
def stats(payload: SequenceIn) -> dict:
    label, cleaned = parse_single_sequence(payload.sequence)
    return {"label": label, **sequence_stats(cleaned)}


@router.post("/orfs")
def orfs(payload: OrfQueryIn) -> dict:
    label, cleaned = parse_single_sequence(payload.sequence)
    return {"label": label, "orfs": find_orfs(cleaned, min_length=payload.min_length)}


@router.post("/primer")
def primer(payload: SequenceIn) -> dict:
    label, cleaned = parse_single_sequence(payload.sequence)
    return {"label": label, **primer_report(cleaned)}


@router.post("/compare")
def compare(payload: CompareIn) -> dict:
    reference_label, reference = parse_single_sequence(payload.reference)
    query_label, query = parse_single_sequence(payload.query)
    return {
        "reference_label": reference_label,
        "query_label": query_label,
        **call_variants(reference, query),
    }
