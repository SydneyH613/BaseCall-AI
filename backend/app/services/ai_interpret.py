"""AI interpretation layer.

Important design decision: the LLM never sees raw sequence and never
performs the analysis itself. It only receives the *already-computed*,
deterministic results (variants, ORFs, primer stats) as structured JSON
and is asked to explain what they mean in plain language. This keeps the
science grounded in real algorithms and uses the model for what it's
actually good at: interpretation and communication.
"""

import json

from anthropic import Anthropic

from app.core.config import settings

MODEL = "claude-sonnet-5"

SYSTEM_PROMPT = """You are a molecular biology teaching assistant embedded in a \
bioinformatics tool called BaseCall AI. You are given structured, already-computed \
analysis results (sequence alignment, variant calls, ORFs, or primer metrics) as JSON. \
You did not perform this computation yourself and must not invent, second-guess, or \
recompute any numbers in it — treat every field as ground truth.

Explain the biological significance in clear, plain language for a biology student \
or early researcher. When discussing mutations, explain what the codon change does at \
the protein level and why that class of mutation (silent/missense/nonsense/frameshift) \
matters functionally. Note anything that looks scientifically noteworthy or worth \
discussing with a professor or PI. Never provide a clinical or diagnostic conclusion; \
if health-relevant sequences come up, explicitly state this tool is for educational \
purposes only and is not a diagnostic device. Keep the response to 3-6 short paragraphs \
or a tight bulleted list."""


def _client() -> Anthropic:
    return Anthropic(api_key=settings.anthropic_api_key)


def explain_results(goal: str, results: dict, sequence_label: str | None = None) -> str:
    if not settings.anthropic_api_key:
        return (
            "AI explanation is unavailable: no ANTHROPIC_API_KEY configured on the "
            "server. The computed results above are unaffected — set the key in your "
            "backend .env to enable plain-language interpretation."
        )

    label_line = f"Sequence label (from the user's FASTA header): {sequence_label}\n\n" if sequence_label else ""
    user_content = (
        f"Analysis goal: {goal}\n\n"
        f"{label_line}"
        f"Computed results (JSON):\n{json.dumps(results, indent=2)}\n\n"
        "Explain what these results mean."
    )

    response = _client().messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )
    return "".join(block.text for block in response.content if block.type == "text")
