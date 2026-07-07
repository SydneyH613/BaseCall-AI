"""Real, well-documented biological sequences used across the test suite.

HBB_OPENING is the canonical opening 13 codons of the human beta-globin
(HBB) mRNA coding sequence -- the standard textbook fragment used to teach
the sickle-cell mutation. It translates (with the initiator Met cleaved
from the mature protein) to the known mature beta-globin N-terminus:
Val-His-Leu-Thr-Pro-Glu-Glu-Lys-Ser-Ala-Val-Thr.

Codon 7 of the CDS (0-based codon_index 6; Glu, protein position 6 in the
mature chain) is the real site of the sickle-cell mutation: GAG -> GTG,
Glu6Val (HbS).
"""

HBB_OPENING = "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACT"
HBB_OPENING_PROTEIN = "MVHLTPEEKSAVT"

# A real, widely-used qPCR forward primer for human GAPDH.
GAPDH_FWD_PRIMER = "GAAGGTGAAGGTCGGAGTCA"
