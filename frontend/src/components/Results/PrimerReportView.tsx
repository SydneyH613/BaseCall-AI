import type { PrimerResult } from "../../types";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value">{value}</div>
    </div>
  );
}

export function PrimerReportView({ report }: { report: PrimerResult }) {
  return (
    <div className="stack-md">
      <div className="row-wrap">
        <StatTile label="Length" value={`${report.length} bp`} />
        <StatTile label="GC content" value={`${report.gc_content_pct}%`} />
        <StatTile label="Melting temp (Tm)" value={`${report.melting_temp_c}°C`} />
      </div>
      {report.warnings.length > 0 ? (
        <div className="stack-xs" style={{ padding: "14px 18px", background: "var(--warning-soft)", borderRadius: "var(--radius)" }}>
          <strong style={{ color: "var(--warning)", fontSize: 13 }}>Design warnings</strong>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
            {report.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ padding: "14px 18px", background: "var(--success-soft)", borderRadius: "var(--radius)", fontSize: 14 }}>
          <strong style={{ color: "var(--success)" }}>Looks good</strong> — no design warnings.
        </div>
      )}
    </div>
  );
}
