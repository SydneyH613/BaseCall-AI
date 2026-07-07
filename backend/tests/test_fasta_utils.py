import pytest

from app.services.fasta_utils import (
    call_variants,
    clean_sequence,
    find_orfs,
    melting_temp_wallace,
    parse_fasta,
    parse_single_sequence,
    primer_report,
    reverse_complement,
    sequence_stats,
)
from tests.biology_fixtures import GAPDH_FWD_PRIMER, HBB_OPENING


# --- parsing ---------------------------------------------------------------

def test_parse_fasta_with_header():
    records = parse_fasta(">seq1\nACGT\nACGT\n")
    assert records == [("seq1", "ACGTACGT")]


def test_parse_fasta_multiple_records():
    records = parse_fasta(">a\nACGT\n>b\nTTTT\n")
    assert records == [("a", "ACGT"), ("b", "TTTT")]


def test_parse_fasta_raw_sequence_without_header():
    records = parse_fasta("acgtACGT")
    assert records == [("query", "ACGTACGT")]


def test_parse_fasta_empty_input():
    assert parse_fasta("   ") == []


def test_parse_single_sequence_no_header_returns_none_label():
    label, seq = parse_single_sequence(HBB_OPENING)
    assert label is None
    assert seq == HBB_OPENING


def test_parse_single_sequence_extracts_fasta_header():
    label, seq = parse_single_sequence(f">HBB exon 1, sickle-cell region\n{HBB_OPENING}")
    assert label == "HBB exon 1, sickle-cell region"
    assert seq == HBB_OPENING


def test_parse_single_sequence_header_text_does_not_leak_into_sequence():
    # Regression test: previously the raw textarea input (including the
    # ">header" line) was passed directly to sequence_stats/call_variants,
    # so letters like the "C" and "A" in "HBB exon" were silently counted
    # as sequence data, corrupting length/GC%/alignment.
    label, seq = parse_single_sequence(f">HBB exon 1, sickle-cell region\n{HBB_OPENING}")
    assert len(seq) == len(HBB_OPENING)
    stats = sequence_stats(seq)
    assert stats == sequence_stats(HBB_OPENING)


def test_parse_single_sequence_empty_input():
    assert parse_single_sequence("") == (None, "")
    assert parse_single_sequence("   ") == (None, "")


def test_clean_sequence_strips_non_bases():
    # '-', spaces, digits, and non-IUPAC letters (x, y, z) are all stripped;
    # only A/C/G/T/N survive.
    assert clean_sequence("ACG-T 123\nxyzN") == "ACGTN"


def test_reverse_complement():
    assert reverse_complement("ACGT") == "ACGT"  # palindrome
    assert reverse_complement("ATGGCC") == "GGCCAT"


# --- sequence stats ----------------------------------------------------------

def test_sequence_stats_counts_and_gc():
    stats = sequence_stats("ATGC")
    assert stats == {
        "length": 4,
        "gc_content_pct": 50.0,
        "a_count": 1,
        "t_count": 1,
        "g_count": 1,
        "c_count": 1,
    }


def test_sequence_stats_empty_sequence():
    stats = sequence_stats("")
    assert stats["length"] == 0
    assert stats["gc_content_pct"] == 0.0


# --- primer design -----------------------------------------------------------

def test_melting_temp_wallace_short_primer_uses_exact_rule():
    # Wallace rule for <14bp: Tm = 4*(G+C) + 2*(A+T)
    assert melting_temp_wallace("GCGC") == 16.0  # 4*(2*2)
    assert melting_temp_wallace("ATAT") == 8.0  # 2*4


def test_primer_report_flags_at_3prime_end():
    report = primer_report("GAAGGTGAAGGTCGGAGTCA")  # real GAPDH fwd primer, ends in A
    assert report["length"] == 20
    assert any("3' end" in w for w in report["warnings"])


def test_primer_report_gc_matches_manual_count():
    report = primer_report(GAPDH_FWD_PRIMER)
    manual_gc = 100 * (GAPDH_FWD_PRIMER.count("G") + GAPDH_FWD_PRIMER.count("C")) / len(GAPDH_FWD_PRIMER)
    assert report["gc_content_pct"] == pytest.approx(manual_gc, abs=0.01)


def test_primer_report_no_warnings_for_well_designed_primer():
    # 20bp, 50% GC, ends in G (has a GC clamp), Tm in range.
    good_primer = "ACGTACGTACGTACGTACGG"
    report = primer_report(good_primer)
    assert report["warnings"] == []


# --- ORF finding ---------------------------------------------------------------

def test_find_orfs_finds_start_to_stop_and_translates():
    seq = HBB_OPENING + "GCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAG" + "TAA"
    orfs = find_orfs(seq, min_length=30)
    assert len(orfs) == 1
    orf = orfs[0]
    assert orf["start"] == 0
    assert orf["end"] == len(seq)
    assert orf["strand"] == "+"
    assert orf["protein"].startswith("M")
    assert orf["protein"].endswith("*")


def test_find_orfs_respects_min_length():
    assert find_orfs(HBB_OPENING, min_length=1000) == []


def test_find_orfs_finds_reverse_strand_orf():
    # An ORF on the reverse strand: forward sequence has no ATG...stop, but
    # its reverse complement does.
    fwd_orf = "ATGAAATAA"  # M-K-* on the + strand
    seq = reverse_complement(fwd_orf)
    orfs = find_orfs(seq, min_length=3)
    minus_strand_orfs = [o for o in orfs if o["strand"] == "-"]
    assert len(minus_strand_orfs) == 1
    assert minus_strand_orfs[0]["protein"] == "MK*"


# --- variant calling / mutation classification (core biological logic) -------

def test_identical_sequences_produce_no_variants():
    result = call_variants(HBB_OPENING, HBB_OPENING)
    assert result["variants"] == []
    assert result["identity_pct"] == 100.0


def test_call_variants_sickle_cell_missense():
    # The real sickle-cell mutation: codon 7 (0-based index 6) GAG -> GTG,
    # Glu -> Val (HbS). Middle base of that codon is at position 19.
    sickle = HBB_OPENING[:19] + "T" + HBB_OPENING[20:]
    result = call_variants(HBB_OPENING, sickle)
    assert len(result["variants"]) == 1
    v = result["variants"][0]
    assert v["codon_index"] == 6
    assert v["ref_codon"] == "GAG"
    assert v["alt_codon"] == "GTG"
    assert v["ref_amino_acid"] == "E"
    assert v["alt_amino_acid"] == "V"
    assert v["mutation_type"] == "missense"


def test_call_variants_silent_mutation():
    # Codon 4 (index 3): CTG -> CTA, Leu -> Leu (wobble position).
    silent = HBB_OPENING[:11] + "A" + HBB_OPENING[12:]
    result = call_variants(HBB_OPENING, silent)
    v = result["variants"][0]
    assert v["mutation_type"] == "silent"
    assert v["ref_amino_acid"] == v["alt_amino_acid"] == "L"


def test_call_variants_nonsense_mutation():
    # Codon 9 (index 8): AAG -> TAG, Lys -> Stop.
    nonsense = HBB_OPENING[:24] + "T" + HBB_OPENING[25:]
    result = call_variants(HBB_OPENING, nonsense)
    v = result["variants"][0]
    assert v["mutation_type"] == "nonsense"
    assert v["ref_amino_acid"] == "K"
    assert v["alt_amino_acid"] == "*"


def test_call_variants_frameshift_deletion():
    frameshift_del = HBB_OPENING[:15] + HBB_OPENING[16:]  # 1bp removed
    result = call_variants(HBB_OPENING, frameshift_del)
    assert result["variants"][0]["mutation_type"] == "frameshift_deletion"


def test_call_variants_inframe_deletion_not_flagged_as_frameshift():
    # CFTR delta-F508-style: a whole codon (3bp) removed, frame preserved.
    inframe_del = HBB_OPENING[:12] + HBB_OPENING[15:]
    result = call_variants(HBB_OPENING, inframe_del)
    assert result["variants"][0]["mutation_type"] == "deletion"


def test_call_variants_frameshift_insertion():
    frameshift_ins = HBB_OPENING[:15] + "GG" + HBB_OPENING[15:]  # 2bp inserted
    result = call_variants(HBB_OPENING, frameshift_ins)
    assert result["variants"][0]["mutation_type"] == "frameshift_insertion"


def test_call_variants_inframe_insertion_not_flagged_as_frameshift():
    inframe_ins = HBB_OPENING[:15] + "GGG" + HBB_OPENING[15:]  # 3bp inserted
    result = call_variants(HBB_OPENING, inframe_ins)
    assert result["variants"][0]["mutation_type"] == "insertion"
