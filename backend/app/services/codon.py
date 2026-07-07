"""Standard genetic code and codon-level mutation classification."""

CODON_TABLE: dict[str, str] = {
    "TTT": "F", "TTC": "F", "TTA": "L", "TTG": "L",
    "CTT": "L", "CTC": "L", "CTA": "L", "CTG": "L",
    "ATT": "I", "ATC": "I", "ATA": "I", "ATG": "M",
    "GTT": "V", "GTC": "V", "GTA": "V", "GTG": "V",
    "TCT": "S", "TCC": "S", "TCA": "S", "TCG": "S",
    "CCT": "P", "CCC": "P", "CCA": "P", "CCG": "P",
    "ACT": "T", "ACC": "T", "ACA": "T", "ACG": "T",
    "GCT": "A", "GCC": "A", "GCA": "A", "GCG": "A",
    "TAT": "Y", "TAC": "Y", "TAA": "*", "TAG": "*",
    "CAT": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
    "AAT": "N", "AAC": "N", "AAA": "K", "AAG": "K",
    "GAT": "D", "GAC": "D", "GAA": "E", "GAG": "E",
    "TGT": "C", "TGC": "C", "TGA": "*", "TGG": "W",
    "CGT": "R", "CGC": "R", "CGA": "R", "CGG": "R",
    "AGT": "S", "AGC": "S", "AGA": "R", "AGG": "R",
    "GGT": "G", "GGC": "G", "GGA": "G", "GGG": "G",
}

AMINO_ACID_NAMES: dict[str, str] = {
    "A": "Alanine", "R": "Arginine", "N": "Asparagine", "D": "Aspartate",
    "C": "Cysteine", "Q": "Glutamine", "E": "Glutamate", "G": "Glycine",
    "H": "Histidine", "I": "Isoleucine", "L": "Leucine", "K": "Lysine",
    "M": "Methionine (Start)", "F": "Phenylalanine", "P": "Proline",
    "S": "Serine", "T": "Threonine", "W": "Tryptophan", "Y": "Tyrosine",
    "V": "Valine", "*": "Stop",
}


def translate_codon(codon: str) -> str | None:
    return CODON_TABLE.get(codon.upper())


def translate_sequence(seq: str) -> str:
    seq = seq.upper()
    protein = []
    for i in range(0, len(seq) - len(seq) % 3, 3):
        aa = translate_codon(seq[i:i + 3])
        if aa is None:
            break
        protein.append(aa)
        if aa == "*":
            break
    return "".join(protein)


def classify_point_mutation(ref_codon: str, alt_codon: str) -> str:
    """Classify a single-base substitution given the codon it falls in."""
    ref_aa = translate_codon(ref_codon)
    alt_aa = translate_codon(alt_codon)
    if ref_aa is None or alt_aa is None:
        return "unknown"
    if ref_aa == alt_aa:
        return "silent"
    if alt_aa == "*":
        return "nonsense"
    if ref_aa == "*":
        return "stop_loss"
    return "missense"
