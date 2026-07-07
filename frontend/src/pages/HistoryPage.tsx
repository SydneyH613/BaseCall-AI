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
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Saved analyses</h1>

      {loading && <p className="text-muted">Loading...</p>}
      {!loading && analyses.length === 0 && (
        <p className="text-muted">
          No saved analyses yet. <Link to="/analyze">Run one</Link> and save it to see it here.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {analyses.map((a) => (
          <div
            key={a.id}
            className="card"
            style={{
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <Link to={`/history/${a.id}`} style={{ fontWeight: 600, textDecoration: "none" }}>
                {a.name}
              </Link>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
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
