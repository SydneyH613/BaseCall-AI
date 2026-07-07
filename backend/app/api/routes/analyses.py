from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.sequence import AnalysisCreateRequest, AnalysisGoal, AnalysisOut
from app.services.ai_interpret import explain_results
from app.services.fasta_utils import call_variants, find_orfs, parse_single_sequence, primer_report

router = APIRouter(prefix="/api/analyses", tags=["analyses"])


def _compute(goal: AnalysisGoal, reference: str, query: str | None) -> dict:
    if goal in (AnalysisGoal.compare, AnalysisGoal.mutations):
        if not query:
            raise HTTPException(400, detail="query_sequence is required for this goal")
        return call_variants(reference, query)
    if goal == AnalysisGoal.orfs:
        return {"orfs": find_orfs(reference)}
    if goal == AnalysisGoal.primer:
        return primer_report(reference)
    raise HTTPException(400, detail="Unsupported analysis goal")


@router.post("", response_model=AnalysisOut, status_code=201)
def create_analysis(
    payload: AnalysisCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Analysis:
    reference_label, reference = parse_single_sequence(payload.reference_sequence)
    query_label, query = (
        parse_single_sequence(payload.query_sequence) if payload.query_sequence else (None, None)
    )

    results = _compute(payload.goal, reference, query)
    ai_explanation = explain_results(payload.goal.value, results, sequence_label=reference_label)

    analysis = Analysis(
        owner_id=current_user.id,
        name=payload.name,
        goal=payload.goal.value,
        reference_sequence=reference,
        query_sequence=query,
        reference_label=reference_label,
        query_label=query_label,
        results=results,
        ai_explanation=ai_explanation,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("", response_model=list[AnalysisOut])
def list_analyses(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[Analysis]:
    return (
        db.query(Analysis)
        .filter(Analysis.owner_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Analysis:
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.owner_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(404, detail="Analysis not found")
    return analysis


@router.delete("/{analysis_id}", status_code=204)
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.owner_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(404, detail="Analysis not found")
    db.delete(analysis)
    db.commit()
