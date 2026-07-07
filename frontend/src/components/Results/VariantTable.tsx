import type { Variant } from "../../types";

const MUTATION_LABELS: Record<string, string> = {
  silent: "Silent",
  missense: "Missense",
  nonsense: "Nonsense",
  stop_loss: "Stop-loss",
  insertion: "Insertion",
  deletion: "Deletion",
  frameshift_insertion: "Frameshift (insertion)",
  frameshift_deletion: "Frameshift (deletion)",
  unknown: "Unknown",
};

export function VariantTable({ variants }: { variants: Variant[] }) {
  if (variants.length === 0) {
    return <p className="text-muted">No differences found — sequences are identical.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "8px 12px" }}>Position</th>
            <th style={{ padding: "8px 12px" }}>Change</th>
            <th style={{ padding: "8px 12px" }}>Codon</th>
            <th style={{ padding: "8px 12px" }}>Amino acid</th>
            <th style={{ padding: "8px 12px" }}>Type</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)" }}>{v.position}</td>
              <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)" }}>
                {v.ref_base} → {v.alt_base}
              </td>
              <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)" }}>
                {v.ref_codon ? `${v.ref_codon} → ${v.alt_codon}` : "—"}
              </td>
              <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)" }}>
                {v.ref_amino_acid ? `${v.ref_amino_acid} → ${v.alt_amino_acid}` : "—"}
              </td>
              <td style={{ padding: "8px 12px" }}>
                <span className={`badge badge-${v.mutation_type}`}>
                  {MUTATION_LABELS[v.mutation_type] ?? v.mutation_type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
