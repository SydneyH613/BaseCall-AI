"""FASTA parsing, sequence statistics, ORF finding, primer metrics, and
alignment-driven variant calling."""

import re

from app.services.alignment import needleman_wunsch, percent_identity
from app.services.codon import classify_point_mutation, translate_codon, translate_sequence

COMPLEMENT = {"A": "T", "T": "A", "G": "C", "C": "G", "N": "N"}
VALID_BASES = set("ACGTN")


def parse_fasta(raw: str) -> list[tuple[str, str]]:
    """Parse FASTA text into (header, sequence) records.

    Falls back to treating the whole input as one raw sequence if no
    ">" header lines are present, so users can just paste bare sequence.
    """
    raw = raw.strip()
    if not raw:
        return []
    if not raw.startswith(">"):
        return [("query", clean_sequence(raw))]

    records: list[tuple[str, str]] = []
    header = ""
    chunks: list[str] = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith(">"):
            if header:
                records.append((header, "".join(chunks)))
            header = line[1:].strip()
            chunks = []
        else:
            chunks.append(line)
    if header:
        records.append((header, "".join(chunks)))
    return [(h, clean_sequence(s)) for h, s in records]


def clean_sequence(seq: str) -> str:
    return re.sub(r"[^ACGTNacgtn]", "", seq).upper()


def parse_single_sequence(raw: str) -> tuple[str | None, str]:
    """Parse one textarea's worth of input -- either a bare sequence or a
    single-record FASTA -- into (header_or_None, cleaned_sequence).

    This is the single entry point every analysis endpoint must go through.
    Passing raw textarea input straight to sequence_stats/call_variants/etc
    without this step lets a FASTA header's text get miscounted as sequence
    data (e.g. the "C" and "A" in "HBB exon" would silently corrupt GC%,
    length, and alignment).
    """
    raw = raw.strip()
    if not raw:
        return None, ""
    if not raw.startswith(">"):
        return None, clean_sequence(raw)

    records = parse_fasta(raw)
    if not records:
        return None, ""
    header, seq = records[0]
    return header, seq


def reverse_complement(seq: str) -> str:
    return "".join(COMPLEMENT.get(b, "N") for b in reversed(seq.upper()))


def sequence_stats(seq: str) -> dict:
    seq = seq.upper()
    length = len(seq)
    a, t, g, c = seq.count("A"), seq.count("T"), seq.count("G"), seq.count("C")
    gc_pct = round(100 * (g + c) / length, 2) if length else 0.0
    return {
        "length": length,
        "gc_content_pct": gc_pct,
        "a_count": a,
        "t_count": t,
        "g_count": g,
        "c_count": c,
    }


def melting_temp_wallace(seq: str) -> float:
    """Wallace rule Tm estimate, standard for short primers (<14bp uses
    exact rule; longer primers use the common GC-content approximation)."""
    seq = seq.upper()
    length = len(seq)
    if length == 0:
        return 0.0
    gc = seq.count("G") + seq.count("C")
    at = seq.count("A") + seq.count("T")
    if length < 14:
        return float(4 * gc + 2 * at)
    return round(64.9 + 41 * (gc - 16.4) / length, 2)


def primer_report(seq: str) -> dict:
    stats = sequence_stats(seq)
    tm = melting_temp_wallace(seq)
    warnings: list[str] = []
    if stats["length"] < 18 or stats["length"] > 24:
        warnings.append("Primer length outside the typical 18-24bp range.")
    if not (40 <= stats["gc_content_pct"] <= 60):
        warnings.append("GC content outside the ideal 40-60% range.")
    if tm < 50 or tm > 65:
        warnings.append("Melting temperature outside the typical 50-65C range.")
    if seq.upper().endswith(("A", "T")):
        warnings.append("3' end is A/T — may reduce primer binding stability (no GC clamp).")
    return {
        "sequence": seq.upper(),
        "length": stats["length"],
        "gc_content_pct": stats["gc_content_pct"],
        "melting_temp_c": tm,
        "warnings": warnings,
    }


_STOP_CODONS = {"TAA", "TAG", "TGA"}


def find_orfs(seq: str, min_length: int = 30) -> list[dict]:
    """Find open reading frames (ATG...stop) across all 6 reading frames."""
    orfs: list[dict] = []
    strands = [("+", seq.upper())]
    rc = reverse_complement(seq)
    strands.append(("-", rc))

    for strand, s in strands:
        for frame in range(3):
            i = frame
            while i + 3 <= len(s):
                codon = s[i:i + 3]
                if codon == "ATG":
                    j = i
                    while j + 3 <= len(s):
                        stop_codon = s[j:j + 3]
                        if stop_codon in _STOP_CODONS:
                            orf_len = j + 3 - i
                            if orf_len >= min_length:
                                orfs.append({
                                    "start": i,
                                    "end": j + 3,
                                    "frame": frame + 1,
                                    "strand": strand,
                                    "length": orf_len,
                                    "protein": translate_sequence(s[i:j + 3]),
                                })
                            i = j + 3
                            break
                        j += 3
                    else:
                        i += 3
                        continue
                else:
                    i += 3
    orfs.sort(key=lambda o: o["length"], reverse=True)
    return orfs


def call_variants(reference: str, query: str) -> dict:
    """Align query to reference and classify differences.

    Substitutions are mapped back to reference-frame codons for
    silent/missense/nonsense classification. Contiguous gap runs are
    reported as single insertion/deletion events, flagged as frameshifts
    when their length isn't a multiple of 3.
    """
    aligned_ref, aligned_qry, score = needleman_wunsch(reference, query)
    identity = percent_identity(aligned_ref, aligned_qry)

    variants: list[dict] = []
    ref_pos = -1  # 0-based index into ungapped reference
    col = 0
    n = len(aligned_ref)

    while col < n:
        r, q = aligned_ref[col], aligned_qry[col]

        if r != "-" and q != "-":
            ref_pos += 1
            if r != q:
                codon_index = ref_pos // 3
                codon_start = codon_index * 3
                ref_codon = reference.upper()[codon_start:codon_start + 3]
                mutation_type = "unknown"
                ref_aa = alt_aa = None
                alt_codon = None
                if len(ref_codon) == 3:
                    pos_in_codon = ref_pos % 3
                    alt_codon = ref_codon[:pos_in_codon] + q + ref_codon[pos_in_codon + 1:]
                    mutation_type = classify_point_mutation(ref_codon, alt_codon)
                    ref_aa = translate_codon(ref_codon)
                    alt_aa = translate_codon(alt_codon)
                variants.append({
                    "position": ref_pos,
                    "ref_base": r,
                    "alt_base": q,
                    "ref_codon": ref_codon or None,
                    "alt_codon": alt_codon,
                    "ref_amino_acid": ref_aa,
                    "alt_amino_acid": alt_aa,
                    "mutation_type": mutation_type,
                    "codon_index": codon_index,
                })
            col += 1
            continue

        # Gap run: either an insertion (ref == '-') or deletion (qry == '-')
        is_insertion = r == "-"
        run_start_col = col
        run_ref_pos = ref_pos
        inserted_or_deleted = []
        while col < n and ((aligned_ref[col] == "-") if is_insertion else (aligned_qry[col] == "-")):
            if is_insertion:
                inserted_or_deleted.append(aligned_qry[col])
            else:
                inserted_or_deleted.append(aligned_ref[col])
                ref_pos += 1
            col += 1

        run_len = len(inserted_or_deleted)
        frameshift = run_len % 3 != 0
        mutation_type = ("frameshift_" if frameshift else "") + ("insertion" if is_insertion else "deletion")
        variants.append({
            "position": run_ref_pos + 1 if is_insertion else run_ref_pos - run_len + 1,
            "ref_base": "-" if is_insertion else "".join(inserted_or_deleted),
            "alt_base": "".join(inserted_or_deleted) if is_insertion else "-",
            "ref_codon": None,
            "alt_codon": None,
            "ref_amino_acid": None,
            "alt_amino_acid": None,
            "mutation_type": mutation_type,
            "codon_index": None,
        })

    return {
        "aligned_reference": aligned_ref,
        "aligned_query": aligned_qry,
        "score": score,
        "identity_pct": identity,
        "variants": variants,
    }
