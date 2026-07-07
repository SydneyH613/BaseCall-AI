"""Stateless, unauthenticated compute endpoints for instant UI feedback.

These return raw computed results only (no AI explanation, no DB
persistence) so the frontend can show live stats/ORFs/alignment as a
user types or uploads, before they commit to saving a full analysis.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.fasta_utils import call_variants, find_orfs, primer_report, sequence_stats

router = APIRouter(prefix="/api/sequences", tags=["sequences"])


class SequenceIn(BaseModel):
    sequence: str


class OrfQueryIn(BaseModel):
    sequence: str
    min_length: int = 30


class CompareIn(BaseModel):
    reference: str
    query: str


@router.post("/stats")
def stats(payload: SequenceIn) -> dict:
    return sequence_stats(payload.sequence)


@router.post("/orfs")
def orfs(payload: OrfQueryIn) -> list[dict]:
    return find_orfs(payload.sequence, min_length=payload.min_length)


@router.post("/primer")
def primer(payload: SequenceIn) -> dict:
    return primer_report(payload.sequence)


@router.post("/compare")
def compare(payload: CompareIn) -> dict:
    return call_variants(payload.reference, payload.query)
