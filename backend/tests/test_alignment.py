from app.services.alignment import needleman_wunsch, percent_identity


def test_identical_sequences_align_with_no_gaps():
    ref, qry, score = needleman_wunsch("ACGTACGT", "ACGTACGT")
    assert ref == "ACGTACGT"
    assert qry == "ACGTACGT"
    assert score == 2 * 8  # MATCH_SCORE * length, no mismatches/gaps
    assert percent_identity(ref, qry) == 100.0


def test_single_mismatch_stays_ungapped():
    ref, qry, _ = needleman_wunsch("ACGTACGT", "ACGAACGT")
    assert ref == "ACGTACGT"
    assert qry == "ACGAACGT"
    assert "-" not in ref and "-" not in qry
    assert percent_identity(ref, qry) == 87.5  # 7/8 match


def test_insertion_in_query_produces_gap_in_reference():
    ref, qry, _ = needleman_wunsch("ACGT", "ACGGT")
    assert len(ref) == len(qry) == 5
    assert ref.count("-") == 1
    assert qry.count("-") == 0


def test_deletion_in_query_produces_gap_in_query():
    ref, qry, _ = needleman_wunsch("ACGGT", "ACGT")
    assert len(ref) == len(qry) == 5
    assert qry.count("-") == 1
    assert ref.count("-") == 0


def test_percent_identity_counts_gap_column_as_aligned_but_not_matched():
    # 4 of 5 columns match; the gap column counts toward aligned length
    # but not toward matches.
    assert percent_identity("AC-GT", "ACGGT") == 80.0


def test_percent_identity_empty_sequences():
    assert percent_identity("", "") == 0.0
