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
    return <p className="text-muted" style={{ margin: 0 }}>No differences found — sequences are identical.</p>;
  }

  return (
    <div className="scroll-x">
      <table className="table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Change</th>
            <th>Codon</th>
            <th>Amino acid</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v, i) => (
            <tr key={i}>
              <td style={{ fontFamily: "var(--font-mono)" }}>{v.position}</td>
              <td style={{ fontFamily: "var(--font-mono)" }}>
                {v.ref_base} → {v.alt_base}
              </td>
              <td style={{ fontFamily: "var(--font-mono)" }}>
                {v.ref_codon ? `${v.ref_codon} → ${v.alt_codon}` : "—"}
              </td>
              <td style={{ fontFamily: "var(--font-mono)" }}>
                {v.ref_amino_acid ? `${v.ref_amino_acid} → ${v.alt_amino_acid}` : "—"}
              </td>
              <td>
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
