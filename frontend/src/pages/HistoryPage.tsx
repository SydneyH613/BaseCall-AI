import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAnalysis, listAnalyses } from "../api/analyses";
import type { Analysis } from "../types";

const GOAL_LABELS: Record<string, string> = {
  mutations: "Find mutations",
  compare: "Compare sequences",
  orfs: "Find ORFs",
  primer: "Check primer",
};

export function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAnalyses()
      .then(setAnalyses)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    await deleteAnalysis(id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="page stack-md">
      <div className="stack-xs">
        <span className="eyebrow">Archive</span>
        <h1 style={{ fontSize: 28 }}>Saved analyses</h1>
      </div>

      {loading && <p className="text-muted">Loading…</p>}
      {!loading && analyses.length === 0 && (
        <p className="text-muted">
          No saved analyses yet. <Link to="/analyze">Run one</Link> and save it to see it here.
        </p>
      )}

      <div className="stack-sm">
        {analyses.map((a) => (
          <div key={a.id} className="card row-between" style={{ padding: "14px 18px" }}>
            <div>
              <Link to={`/history/${a.id}`} style={{ fontWeight: 500, fontFamily: "var(--font-display)", fontSize: 16 }}>
                {a.name}
              </Link>
              {a.reference_label && a.reference_label !== a.name && (
                <div className="text-muted" style={{ fontSize: 13 }}>{a.reference_label}</div>
              )}
              <div className="text-faint" style={{ fontSize: 12.5, marginTop: 3, fontFamily: "var(--font-mono)" }}>
                {GOAL_LABELS[a.goal] ?? a.goal} · {new Date(a.created_at).toLocaleString()}
              </div>
            </div>
            <button className="btn btn-danger" onClick={() => handleDelete(a.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
