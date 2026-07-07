import type { OrfResult } from "../../types";

export function OrfList({ orfs }: { orfs: OrfResult[] }) {
  if (orfs.length === 0) {
    return <p className="text-muted">No open reading frames found above the minimum length.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {orfs.map((orf, i) => (
        <div
          key={i}
          className="card"
          style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}
        >
          <div style={{ display: "flex", gap: 12, fontSize: 13 }} className="text-muted">
            <span>
              {orf.start}–{orf.end} ({orf.length} bp)
            </span>
            <span>
              Strand {orf.strand}, frame {orf.frame}
            </span>
          </div>
          <div className="sequence-block" style={{ wordBreak: "break-all" }}>
            {orf.protein}
          </div>
        </div>
      ))}
    </div>
  );
}
