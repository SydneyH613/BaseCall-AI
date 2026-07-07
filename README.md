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
- **AI interpretation** — the *already-computed* JSON results (never raw
  sequence, never the computation itself) are handed to Claude to produce a
  plain-language explanation of biological significance.

## Architecture

```
frontend/   React 19 + TypeScript + Vite, Redux Toolkit, React Router
backend/    FastAPI (Python), SQLAlchemy + PostgreSQL, JWT auth
```

- `backend/app/services/alignment.py` — Needleman-Wunsch alignment
- `backend/app/services/codon.py` — codon table, translation, mutation classification
- `backend/app/services/fasta_utils.py` — FASTA parsing, GC/ORF/primer stats, variant calling
- `backend/app/services/ai_interpret.py` — Claude interpretation layer
- `backend/app/api/routes/sequences.py` — stateless preview endpoints (no auth, no persistence)
- `backend/app/api/routes/analyses.py` — authenticated create/list/get/delete, persists + AI explanation

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

## Deployment

- **Frontend** → Vercel (or Netlify): point at `frontend/`, set `VITE_API_BASE_URL` to the deployed backend URL.
- **Backend** → Render: point at `backend/`, use the included `Dockerfile`, provision a managed PostgreSQL instance and set `DATABASE_URL`/`JWT_SECRET_KEY`/`ANTHROPIC_API_KEY` as environment variables.
