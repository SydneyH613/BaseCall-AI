import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAnalysis } from "../api/analyses";
import { AlignmentViewer } from "../components/Results/AlignmentViewer";
import { VariantTable } from "../components/Results/VariantTable";
import { OrfList } from "../components/Results/OrfList";
import { PrimerReportView } from "../components/Results/PrimerReportView";
import { AiExplanationPanel } from "../components/Results/AiExplanationPanel";
import type { Analysis, AlignmentResult, OrfResult, PrimerResult } from "../types";

export function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAnalysis(Number(id))
      .then(setAnalysis)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="page">
        <p>
          Analysis not found. <Link to="/history">Back to history</Link>
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="page">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page stack-md">
      <div className="stack-xs">
        <Link to="/history" className="text-muted" style={{ fontSize: 13 }}>
          ← Back to history
        </Link>
        <h1 style={{ fontSize: 26 }}>{analysis.name}</h1>
        {analysis.reference_label && analysis.reference_label !== analysis.name && (
          <p className="text-muted" style={{ margin: 0, fontSize: 14 }}>{analysis.reference_label}</p>
        )}
        <p className="text-faint" style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
          {new Date(analysis.created_at).toLocaleString()}
        </p>
      </div>

      <div className="card card-pad stack-md">
        {(analysis.goal === "mutations" || analysis.goal === "compare") && (
          <>
            <span className="text-faint" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
              {(analysis.results as AlignmentResult).identity_pct}% identity · score{" "}
              {(analysis.results as AlignmentResult).score}
            </span>
            <AlignmentViewer
              alignedReference={(analysis.results as AlignmentResult).aligned_reference}
              alignedQuery={(analysis.results as AlignmentResult).aligned_query}
            />
            <VariantTable variants={(analysis.results as AlignmentResult).variants} />
          </>
        )}
        {analysis.goal === "orfs" && <OrfList orfs={(analysis.results as { orfs: OrfResult[] }).orfs} />}
        {analysis.goal === "primer" && <PrimerReportView report={analysis.results as PrimerResult} />}
      </div>

      {analysis.ai_explanation && <AiExplanationPanel text={analysis.ai_explanation} />}
    </div>
  );
}
