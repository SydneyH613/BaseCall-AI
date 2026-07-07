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
import type { AlignmentResult, AnalysisGoal, OrfPreviewResult, PrimerResult, SequenceStats } from "../types";

const DEFAULT_NAME = "Untitled analysis";

interface GoalDef {
  id: AnalysisGoal;
  label: string;
  description: string;
  needsQuery: boolean;
  referenceLabel: string;
  referenceHint: string;
  queryHint?: string;
}

const GOALS: GoalDef[] = [
  {
    id: "mutations",
    label: "Find mutations",
    description:
      "Aligns a reference and query sequence, then classifies every difference — silent, missense, nonsense, or frameshift.",
    needsQuery: true,
    referenceLabel: "Reference sequence",
    referenceHint: "The known/baseline sequence",
    queryHint: "The sequence you want to check against it",
  },
  {
    id: "orfs",
    label: "Find ORFs",
    description: "Scans all 6 reading frames for start-to-stop open reading frames and translates each to protein.",
    needsQuery: false,
    referenceLabel: "Sequence",
    referenceHint: "The sequence to scan for genes",
  },
  {
    id: "primer",
    label: "Check primer",
    description: "Checks GC content, melting temperature, and common design issues before you order a primer.",
    needsQuery: false,
    referenceLabel: "Primer sequence",
    referenceHint: "The primer to check",
  },
];

type PreviewResult =
  | { goal: "mutations"; data: AlignmentResult }
  | { goal: "orfs"; data: OrfPreviewResult }
  | { goal: "primer"; data: PrimerResult };

function detectedLabel(preview: PreviewResult): string | null {
  if (preview.goal === "mutations") {
    const parts = [preview.data.reference_label, preview.data.query_label].filter(
      (label): label is string => Boolean(label),
    );
    return parts.length > 0 ? parts.join(" / ") : null;
  }
  return preview.data.label;
}

export function AnalyzePage() {
  const [goal, setGoal] = useState<AnalysisGoal>("mutations");
  const [name, setName] = useState(DEFAULT_NAME);
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
      setError(activeGoal.needsQuery ? "Enter a reference sequence first." : "Enter a sequence first.");
      return;
    }
    if (activeGoal.needsQuery && !query.trim()) {
      setError("This analysis needs a second (query) sequence to compare against.");
      return;
    }
    setRunLoading(true);
    try {
      let result: PreviewResult;
      if (goal === "mutations") {
        result = { goal, data: await previewCompare(reference, query) };
      } else if (goal === "orfs") {
        result = { goal: "orfs", data: await previewOrfs(reference) };
      } else {
        result = { goal: "primer", data: await previewPrimer(reference) };
      }
      setPreview(result);

      // If the user pasted a FASTA header, use it to fill in the analysis
      // name automatically -- but only if they haven't already typed their
      // own name, so we never clobber a custom label.
      const label = detectedLabel(result);
      if (label && name === DEFAULT_NAME) {
        setName(label);
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

  const label = preview ? detectedLabel(preview) : null;

  return (
    <div className="page stack-lg">
      <div className="stack-xs">
        <span className="eyebrow">Analysis</span>
        <h1 style={{ fontSize: 28 }}>Analyze a sequence</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Real algorithms compute the results; AI explains what they mean.
        </p>
      </div>

      <div className="stack-sm">
        <span className="eyebrow">Step 1 — choose an analysis</span>
        <div className="tabs">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setGoal(g.id);
                setPreview(null);
                setAiExplanation(null);
                setError(null);
              }}
              className={goal === g.id ? "tab active" : "tab"}
            >
              {g.label}
            </button>
          ))}
        </div>
        <p className="text-muted" style={{ margin: 0, fontSize: 14 }}>{activeGoal.description}</p>
      </div>

      <div className="stack-sm">
        <span className="eyebrow">
          Step 2 — enter your {activeGoal.needsQuery ? "sequences" : "sequence"}
        </span>
        <div className="card card-pad stack-md">
          <SequenceTextArea
            label={activeGoal.referenceLabel}
            hint={activeGoal.referenceHint}
            value={reference}
            onChange={setReference}
            placeholder="Paste a raw sequence, or a FASTA record with a >header (e.g. '>HBB exon 1') to auto-label this analysis by gene"
          />
          {stats && <StatsStrip stats={stats} />}

          {activeGoal.needsQuery && (
            <SequenceTextArea
              label="Query sequence"
              hint={activeGoal.queryHint}
              value={query}
              onChange={setQuery}
            />
          )}

          {error && <p style={{ color: "var(--danger)", margin: 0, fontSize: 14 }}>{error}</p>}

          <div>
            <button className="btn" onClick={handleRun} disabled={runLoading}>
              {runLoading ? "Running…" : "Run analysis"}
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="stack-sm">
          <span className="eyebrow">Step 3 — results</span>
          <div className="card card-pad stack-md">
            <div className="row-between">
              <div className="stack-xs" style={{ gap: 2 }}>
                {label ? (
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{label}</span>
                ) : (
                  <span className="text-faint" style={{ fontSize: 12.5 }}>
                    No gene label detected — paste a FASTA {"'>"}header to auto-label this analysis.
                  </span>
                )}
              </div>
              {preview.goal === "mutations" && (
                <span className="text-faint" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {preview.data.identity_pct}% identity · score {preview.data.score}
                </span>
              )}
            </div>

            {preview.goal === "mutations" && (
              <>
                <AlignmentViewer
                  alignedReference={preview.data.aligned_reference}
                  alignedQuery={preview.data.aligned_query}
                />
                <VariantTable variants={preview.data.variants} />
              </>
            )}
            {preview.goal === "orfs" && <OrfList orfs={preview.data.orfs} />}
            {preview.goal === "primer" && <PrimerReportView report={preview.data} />}

            <hr className="divider" />

            {user ? (
              aiExplanation ? (
                <span className="text-muted" style={{ fontSize: 14 }}>Saved to your history.</span>
              ) : (
                <div className="row" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 260px" }}>
                    <label className="label">Name this analysis</label>
                    <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <button className="btn" onClick={handleSave} disabled={saveLoading}>
                    {saveLoading ? "Saving & asking AI…" : "Save & get AI explanation"}
                  </button>
                </div>
              )
            ) : (
              <p className="text-muted" style={{ margin: 0, fontSize: 14 }}>
                <Link to="/login">Log in</Link> to save this analysis and get an AI explanation.
              </p>
            )}

            {aiExplanation && <AiExplanationPanel text={aiExplanation} />}
          </div>
        </div>
      )}
    </div>
  );
}
