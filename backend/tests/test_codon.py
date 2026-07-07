from app.services.codon import (
    CODON_TABLE,
    classify_point_mutation,
    translate_codon,
    translate_sequence,
)
from tests.biology_fixtures import HBB_OPENING, HBB_OPENING_PROTEIN


def test_codon_table_has_all_64_codons():
    assert len(CODON_TABLE) == 64


def test_codon_table_has_three_stop_codons():
    stops = [codon for codon, aa in CODON_TABLE.items() if aa == "*"]
    assert sorted(stops) == ["TAA", "TAG", "TGA"]


def test_translate_codon_known_values():
    assert translate_codon("ATG") == "M"
    assert translate_codon("TGG") == "W"  # Trp has only one codon
    assert translate_codon("TAA") == "*"


def test_translate_codon_case_insensitive():
    assert translate_codon("atg") == "M"


def test_translate_sequence_hbb_opening_matches_known_protein():
    assert translate_sequence(HBB_OPENING) == HBB_OPENING_PROTEIN


def test_translate_sequence_stops_at_stop_codon():
    # ATG AAA TAA GGG -- translation must stop at the stop codon and not
    # continue translating the GGG that follows it.
    assert translate_sequence("ATGAAATAAGGG") == "MK*"


def test_classify_point_mutation_silent_wobble():
    # CTG -> CTA: third-position wobble, both encode Leucine.
    assert classify_point_mutation("CTG", "CTA") == "silent"


def test_classify_point_mutation_missense_sickle_cell():
    # The real sickle-cell mutation: Glu (GAG) -> Val (GTG).
    assert classify_point_mutation("GAG", "GTG") == "missense"


def test_classify_point_mutation_nonsense():
    # Lys (AAG) -> Stop (TAG): introduces a premature stop codon.
    assert classify_point_mutation("AAG", "TAG") == "nonsense"


def test_classify_point_mutation_stop_loss():
    # Stop (TAA) -> Tyr (TAT): removes the stop codon, protein reads through.
    assert classify_point_mutation("TAA", "TAT") == "stop_loss"
