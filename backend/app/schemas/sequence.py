from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class AnalysisGoal(str, Enum):
    mutations = "mutations"
    orfs = "orfs"
    primer = "primer"


class AnalysisCreateRequest(BaseModel):
    name: str
    goal: AnalysisGoal
    reference_sequence: str
    query_sequence: str | None = None


class Variant(BaseModel):
    position: int
    ref_base: str
    alt_base: str
    ref_codon: str | None = None
    alt_codon: str | None = None
    ref_amino_acid: str | None = None
    alt_amino_acid: str | None = None
    mutation_type: str  # silent | missense | nonsense | frameshift | insertion | deletion
    codon_index: int | None = None


class AlignmentResult(BaseModel):
    aligned_reference: str
    aligned_query: str
    score: int
    identity_pct: float
    variants: list[Variant]


class OrfResult(BaseModel):
    start: int
    end: int
    frame: int
    strand: str
    length: int
    protein: str


class SequenceStats(BaseModel):
    length: int
    gc_content_pct: float
    a_count: int
    t_count: int
    g_count: int
    c_count: int


class PrimerResult(BaseModel):
    sequence: str
    length: int
    gc_content_pct: float
    melting_temp_c: float
    warnings: list[str]


class AnalysisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    goal: AnalysisGoal
    reference_sequence: str
    query_sequence: str | None
    reference_label: str | None
    query_label: str | None
    results: dict
    ai_explanation: str | None
    created_at: datetime
