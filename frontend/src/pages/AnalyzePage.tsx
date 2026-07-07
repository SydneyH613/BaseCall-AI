import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SequenceTextArea } from "../components/SequenceInput/SequenceTextArea";
import { StatsStrip } from "../components/Results/StatsStrip";
import { AlignmentViewer } from "../components/Results/AlignmentViewer";
import { VariantTable } from "../components/Results/VariantTable";
import { OrfList } from "../components/Results/OrfList";
import { PrimerReportView } from "../components/Results/PrimerReportView";
import { AiExplanationPanel } from "../components/Results/AiExplanationPanel";
import { previewCompare, previewOrfs, previewPrimer, previewStats } from "../api/sequences";
import { createAnalysis } from "../api/analyses";
import { useAppSelector } from "../store/hooks";
import type { AlignmentResult, AnalysisGoal, OrfResult, PrimerResult, SequenceStats } from "../types";

const GOALS: { id: AnalysisGoal; label: string; needsQuery: boolean }[] = [
  { id: "mutations", label: "Find mutations", needsQuery: true },
  { id: "compare", label: "Compare sequences", needsQuery: true },
  { id: "orfs", label: "Find ORFs", needsQuery: false },
  { id: "primer", label: "Check primer", needsQuery: false },
];

type PreviewResult =
  | { goal: "mutations" | "compare"; data: AlignmentResult }
  | { goal: "orfs"; data: OrfResult[] }
  | { goal: "primer"; data: PrimerResult };

export function AnalyzePage() {
  const [goal, setGoal] = useState<AnalysisGoal>("mutations");
  const [name, setName] = useState("Untitled analysis");
  const [reference, setReference] = useState("");
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<SequenceStats | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [runLoading, setRunLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAppSelector((state) => state.auth.user);
  const activeGoal = GOALS.find((g) => g.id === goal)!;

  useEffect(() => {
    if (!reference.trim()) {
      setStats(null);
      return;
    }
    const timeout = setTimeout(() => {
      previewStats(reference).then(setStats).catch(() => setStats(null));
    }, 400);
    return () => clearTimeout(timeout);
  }, [reference]);

  async function handleRun() {
    setError(null);
    setAiExplanation(null);
    setPreview(null);
    if (!reference.trim()) {
      setError("Enter a reference sequence first.");
      return;
    }
    if (activeGoal.needsQuery && !query.trim()) {
      setError("This analysis needs a second (query) sequence to compare against.");
      return;
    }
    setRunLoading(true);
    try {
      if (goal === "mutations" || goal === "compare") {
        const data = await previewCompare(reference, query);
        setPreview({ goal, data });
      } else if (goal === "orfs") {
        const data = await previewOrfs(reference);
        setPreview({ goal: "orfs", data });
      } else {
        const data = await previewPrimer(reference);
        setPreview({ goal: "primer", data });
      }
    } catch {
      setError("Analysis failed. Check that your sequence only contains valid bases (A, T, G, C, N).");
    } finally {
      setRunLoading(false);
    }
  }

  async function handleSave() {
    if (!preview) return;
    setSaveLoading(true);
    setError(null);
    try {
      const saved = await createAnalysis({
        name,
        goal,
        reference_sequence: reference,
        query_sequence: activeGoal.needsQuery ? query : undefined,
      });
      setAiExplanation(saved.ai_explanation);
    } catch {
      setError("Could not save analysis. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: "40px 24px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, margin: "0 0 4px" }}>Analyze a sequence</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Real algorithms compute the results; AI explains what they mean.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setGoal(g.id);
              setPreview(null);
              setAiExplanation(null);
              setError(null);
            }}
            className={goal === g.id ? "btn" : "btn btn-secondary"}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label">Analysis name (used when saving)</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <SequenceTextArea
          label={activeGoal.needsQuery ? "Reference sequence" : "Sequence"}
          value={reference}
          onChange={setReference}
        />
        {stats && <StatsStrip stats={stats} />}

        {activeGoal.needsQuery && (
          <SequenceTextArea label="Query sequence" value={query} onChange={setQuery} />
        )}

        {error && <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}

        <div>
          <button className="btn" onClick={handleRun} disabled={runLoading}>
            {runLoading ? "Running..." : "Run analysis"}
          </button>
        </div>
      </div>

      {preview && (
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Results</h2>

          {(preview.goal === "mutations" || preview.goal === "compare") && (
            <>
              <p className="text-muted" style={{ margin: 0 }}>
                {preview.data.identity_pct}% identity · alignment score {preview.data.score}
              </p>
              <AlignmentViewer
                alignedReference={preview.data.aligned_reference}
                alignedQuery={preview.data.aligned_query}
              />
              <VariantTable variants={preview.data.variants} />
            </>
          )}
          {preview.goal === "orfs" && <OrfList orfs={preview.data} />}
          {preview.goal === "primer" && <PrimerReportView report={preview.data} />}

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <button className="btn" onClick={handleSave} disabled={saveLoading || !!aiExplanation}>
                {saveLoading ? "Saving & asking AI..." : aiExplanation ? "Saved" : "Save & get AI explanation"}
              </button>
            ) : (
              <p className="text-muted" style={{ margin: 0 }}>
                <Link to="/login">Log in</Link> to save this analysis and get an AI explanation.
              </p>
            )}
          </div>

          {aiExplanation && <AiExplanationPanel text={aiExplanation} />}
        </div>
      )}
    </div>
  );
}
