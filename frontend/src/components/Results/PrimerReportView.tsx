import type { PrimerResult } from "../../types";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "14px 18px", flex: 1, minWidth: 120 }}>
      <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{value}</div>
    </div>
  );
}

export function PrimerReportView({ report }: { report: PrimerResult }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatTile label="Length" value={`${report.length} bp`} />
        <StatTile label="GC content" value={`${report.gc_content_pct}%`} />
        <StatTile label="Melting temp (Tm)" value={`${report.melting_temp_c}°C`} />
      </div>
      {report.warnings.length > 0 ? (
        <div className="card" style={{ padding: 14, background: "var(--warning-soft)", border: "none" }}>
          <strong style={{ color: "var(--warning)" }}>Design warnings</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
            {report.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="card" style={{ padding: 14, background: "var(--success-soft)", border: "none" }}>
          <strong style={{ color: "var(--success)" }}>Looks good</strong> — no design warnings.
        </div>
      )}
    </div>
  );
}
