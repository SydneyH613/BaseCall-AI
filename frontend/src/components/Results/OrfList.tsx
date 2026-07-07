import type { OrfResult } from "../../types";

export function OrfList({ orfs }: { orfs: OrfResult[] }) {
  if (orfs.length === 0) {
    return <p className="text-muted" style={{ margin: 0 }}>No open reading frames found above the minimum length.</p>;
  }

  return (
    <div className="stack-sm">
      {orfs.map((orf, i) => (
        <div
          key={i}
          className="stack-xs"
          style={{
            padding: "12px 16px",
            background: "var(--bg-sunken)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <div className="row text-faint" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
            <span>
              {orf.start}–{orf.end} ({orf.length} bp)
            </span>
            <span>
              strand {orf.strand} · frame {orf.frame}
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
