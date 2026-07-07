# BaseCall AI

*From raw sequence to real understanding.*

A capstone project combining full-stack engineering, applied AI, and a biology
background: a bioinformatics tool that runs real sequence-analysis algorithms
and uses an LLM purely as an interpretation layer on top of deterministic,
already-computed results — never as a substitute for the computation itself.

> Educational tool only. Not a diagnostic device. Do not use for clinical
> decision-making.

## What it does

- **Mutation & variant calling** — Needleman-Wunsch global alignment
  implemented from scratch, mapped back to reference-frame codons to classify
  substitutions as silent, missense, nonsense, or stop-loss, and gap runs as
  insertions/deletions (flagged as frameshifts when not a multiple of 3).
- **ORF finder** — scans all 6 reading frames (3 forward + 3 reverse
  complement) for start-to-stop open reading frames and translates them.
- **Primer design check** — GC content, Wallace-rule melting temperature, and
  common primer design warnings.
- **Gene/sequence labeling** — if pasted input is a FASTA record (`>header`),
  the header is parsed out, never treated as sequence data, and surfaced as
  the analysis's label throughout the UI and saved history.
- **AI interpretation** — the *already-computed* JSON results (never raw
  sequence, never the computation itself) are handed to Claude to produce a
  plain-language explanation of biological significance. A failed or slow AI
  call never blocks saving the underlying results.
- **Learn page** (`/learn`) — a written explainer of the biology and
  algorithms behind every analysis: the genetic code, reading frames,
  sequence alignment, mutation classification, and primer design, including
  a worked example using the real sickle-cell mutation.

## Architecture

```
frontend/   React 19 + TypeScript + Vite, Redux Toolkit, React Router
backend/    FastAPI (Python), SQLAlchemy + PostgreSQL, JWT auth
```

- `backend/app/services/alignment.py` — Needleman-Wunsch alignment
- `backend/app/services/codon.py` — codon table, translation, mutation classification
- `backend/app/services/fasta_utils.py` — FASTA parsing, GC/ORF/primer stats, variant calling
  (all sequence input is capped at `MAX_SEQUENCE_LENGTH`, 5,000 bases, to keep the O(n·m)
  alignment cost bounded)
- `backend/app/services/ai_interpret.py` — Claude interpretation layer; failures fall back to a
  graceful message instead of blocking a save
- `backend/app/api/routes/sequences.py` — stateless preview endpoints (no auth, no persistence)
- `backend/app/api/routes/analyses.py` — authenticated create/list/get/delete; persists results and generates an AI explanation
- `frontend/src/pages/LearnPage.tsx` — the educational `/learn` page

## Local development

### Backend

Requires Python 3.12 and a local PostgreSQL instance.

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit DATABASE_URL / ANTHROPIC_API_KEY as needed
uvicorn app.main:app --reload
```

The app creates its tables automatically on startup (no migrations to run for
this project's scope).

Alternatively, use Docker Compose to get Postgres running:

```bash
docker compose up db
```

then run the backend locally against `localhost:5432` as above.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend URL
npm run dev
```

### Environment variables

**backend/.env**
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret for signing auth tokens |
| `ANTHROPIC_API_KEY` | Claude API key. If unset, AI explanations show a graceful fallback message — computed results are unaffected |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |

**frontend/.env**
| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

## Testing

The core biological logic (alignment, codon translation, mutation
classification, ORF finding, primer checks) has an automated `pytest` suite —
55 tests covering, among other things:

- a validation against the real, well-documented sickle-cell mutation in
  human HBB (beta-globin): GAG→GTG, Glu6Val
- FASTA parsing edge cases (empty headers, header-only input) that previously
  corrupted results
- the AI interpretation layer's graceful fallback when the provider is
  unavailable or errors out
- request-schema validation of the sequence-length cap

```bash
cd backend
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest tests/ -v
```

## Limitations

- Sequence inputs are capped at 5,000 bases per field. This keeps the O(n·m)
  Needleman-Wunsch alignment tractable within a single request; longer
  sequences are rejected with a 422 rather than left to run unbounded.
- Only the first record of a multi-sequence FASTA paste is used — this tool
  is built around one sequence (or one reference/query pair) per analysis,
  not batch processing.
- The `/api/sequences/*` preview endpoints are intentionally unauthenticated
  (for instant feedback before signing up), so the length cap is also their
  only protection against abuse — there's no rate limiting.

## Deployment

- **Frontend** → Vercel (or Netlify): point at `frontend/`, set `VITE_API_BASE_URL` to the deployed backend URL.
- **Backend** → Render: point at `backend/`, use the included `Dockerfile`, provision a managed PostgreSQL instance and set `DATABASE_URL`/`JWT_SECRET_KEY`/`ANTHROPIC_API_KEY` as environment variables.
