from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.sequence import AnalysisCreateRequest, AnalysisGoal, AnalysisOut
from app.services.ai_interpret import explain_results
from app.services.fasta_utils import call_variants, find_orfs, primer_report

router = APIRouter(prefix="/api/analyses", tags=["analyses"])


def _compute(payload: AnalysisCreateRequest) -> dict:
    if payload.goal in (AnalysisGoal.compare, AnalysisGoal.mutations):
        if not payload.query_sequence:
            raise HTTPException(400, detail="query_sequence is required for this goal")
        return call_variants(payload.reference_sequence, payload.query_sequence)
    if payload.goal == AnalysisGoal.orfs:
        return {"orfs": find_orfs(payload.reference_sequence)}
    if payload.goal == AnalysisGoal.primer:
        return primer_report(payload.reference_sequence)
    raise HTTPException(400, detail="Unsupported analysis goal")


@router.post("", response_model=AnalysisOut, status_code=201)
def create_analysis(
    payload: AnalysisCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Analysis:
    results = _compute(payload)
    ai_explanation = explain_results(payload.goal.value, results)

    analysis = Analysis(
        owner_id=current_user.id,
        name=payload.name,
        goal=payload.goal.value,
        reference_sequence=payload.reference_sequence,
        query_sequence=payload.query_sequence,
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
