"""Needleman-Wunsch global sequence alignment, implemented from scratch.

Used to align a query sequence against a reference so that downstream
variant-calling logic can walk both sequences in lockstep even when
insertions/deletions have shifted their coordinates.
"""

MATCH_SCORE = 2
MISMATCH_SCORE = -1
GAP_PENALTY = -2
GAP_CHAR = "-"


def needleman_wunsch(reference: str, query: str) -> tuple[str, str, int]:
    """Return (aligned_reference, aligned_query, score)."""
    ref = reference.upper()
    qry = query.upper()
    n, m = len(ref), len(qry)

    # dp[i][j] = best score aligning ref[:i] with qry[:j]
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        dp[i][0] = dp[i - 1][0] + GAP_PENALTY
    for j in range(1, m + 1):
        dp[0][j] = dp[0][j - 1] + GAP_PENALTY

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            match_score = MATCH_SCORE if ref[i - 1] == qry[j - 1] else MISMATCH_SCORE
            diagonal = dp[i - 1][j - 1] + match_score
            up = dp[i - 1][j] + GAP_PENALTY
            left = dp[i][j - 1] + GAP_PENALTY
            dp[i][j] = max(diagonal, up, left)

    # Traceback
    aligned_ref: list[str] = []
    aligned_qry: list[str] = []
    i, j = n, m
    while i > 0 or j > 0:
        current = dp[i][j]
        if i > 0 and j > 0:
            match_score = MATCH_SCORE if ref[i - 1] == qry[j - 1] else MISMATCH_SCORE
            if current == dp[i - 1][j - 1] + match_score:
                aligned_ref.append(ref[i - 1])
                aligned_qry.append(qry[j - 1])
                i -= 1
                j -= 1
                continue
        if i > 0 and current == dp[i - 1][j] + GAP_PENALTY:
            aligned_ref.append(ref[i - 1])
            aligned_qry.append(GAP_CHAR)
            i -= 1
            continue
        aligned_qry.append(qry[j - 1])
        aligned_ref.append(GAP_CHAR)
        j -= 1

    return "".join(reversed(aligned_ref)), "".join(reversed(aligned_qry)), dp[n][m]


def percent_identity(aligned_a: str, aligned_b: str) -> float:
    if not aligned_a:
        return 0.0
    matches = sum(1 for a, b in zip(aligned_a, aligned_b) if a == b and a != GAP_CHAR)
    aligned_len = sum(1 for a, b in zip(aligned_a, aligned_b) if a != GAP_CHAR or b != GAP_CHAR)
    return round(100 * matches / aligned_len, 2) if aligned_len else 0.0
