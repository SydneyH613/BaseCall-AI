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
      <div className="container" style={{ padding: "40px 24px" }}>
        <p>
          Analysis not found. <Link to="/history">Back to history</Link>
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container" style={{ padding: "40px 24px" }}>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px 80px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Link to="/history" className="text-muted" style={{ fontSize: 14, textDecoration: "none" }}>
          ← Back to history
        </Link>
        <h1 style={{ fontSize: 26, margin: "8px 0 0" }}>{analysis.name}</h1>
        <p className="text-muted" style={{ margin: "4px 0 0" }}>
          {new Date(analysis.created_at).toLocaleString()}
        </p>
      </div>

      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {(analysis.goal === "mutations" || analysis.goal === "compare") && (
          <>
            <p className="text-muted" style={{ margin: 0 }}>
              {(analysis.results as AlignmentResult).identity_pct}% identity · alignment score{" "}
              {(analysis.results as AlignmentResult).score}
            </p>
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
