import pytest
from pydantic import ValidationError

from app.api.routes.sequences import CompareIn, OrfQueryIn, SequenceIn
from app.schemas.sequence import AnalysisCreateRequest, AnalysisGoal
from app.services.fasta_utils import MAX_SEQUENCE_LENGTH


def test_max_sequence_length_accepts_boundary_length():
    SequenceIn(sequence="A" * MAX_SEQUENCE_LENGTH)


def test_sequence_in_rejects_oversized_input():
    with pytest.raises(ValidationError):
        SequenceIn(sequence="A" * (MAX_SEQUENCE_LENGTH + 1))


def test_orf_query_in_rejects_oversized_input():
    with pytest.raises(ValidationError):
        OrfQueryIn(sequence="A" * (MAX_SEQUENCE_LENGTH + 1))


def test_compare_in_rejects_oversized_reference_or_query():
    with pytest.raises(ValidationError):
        CompareIn(reference="A" * (MAX_SEQUENCE_LENGTH + 1), query="ACGT")
    with pytest.raises(ValidationError):
        CompareIn(reference="ACGT", query="A" * (MAX_SEQUENCE_LENGTH + 1))


def test_analysis_create_request_rejects_oversized_reference_or_query():
    with pytest.raises(ValidationError):
        AnalysisCreateRequest(
            name="test",
            goal=AnalysisGoal.mutations,
            reference_sequence="A" * (MAX_SEQUENCE_LENGTH + 1),
            query_sequence="ACGT",
        )
    with pytest.raises(ValidationError):
        AnalysisCreateRequest(
            name="test",
            goal=AnalysisGoal.mutations,
            reference_sequence="ACGT",
            query_sequence="A" * (MAX_SEQUENCE_LENGTH + 1),
        )
