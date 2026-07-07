import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Mutation & variant calling",
    body:
      "Needleman-Wunsch global alignment implemented from scratch, mapped back to reference-frame codons to classify silent, missense, nonsense, and frameshift mutations.",
  },
  {
    title: "ORF finder",
    body: "Scans all 6 reading frames for start-to-stop open reading frames and translates them to protein.",
  },
  {
    title: "Primer design check",
    body: "GC content, Wallace-rule melting temperature, and design warnings for PCR primers.",
  },
  {
    title: "AI interpretation",
    body:
      "Computed, deterministic results are handed to Claude to generate a plain-language explanation of biological significance — the AI explains, it never computes.",
  },
];

export function HomePage() {
  return (
    <div className="container" style={{ padding: "64px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: 40, lineHeight: 1.15, margin: "0 0 16px" }}>
          From raw sequence to real understanding.
        </h1>
        <p className="text-muted" style={{ fontSize: 17, margin: "0 0 32px" }}>
          BaseCall AI runs real bioinformatics algorithms — sequence alignment, codon
          translation, mutation classification — then uses AI to explain what the results
          mean, in plain language.
        </p>
        <Link to="/analyze" className="btn" style={{ fontSize: 16, padding: "12px 28px" }}>
          Start an analysis
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 64,
        }}
      >
        {FEATURES.map((f) => (
          <div key={f.title} className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{f.title}</h3>
            <p className="text-muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              {f.body}
            </p>
          </div>
        ))}
      </div>

      <p className="text-muted" style={{ fontSize: 12, marginTop: 48, textAlign: "center" }}>
        Educational tool only — not a diagnostic device. Do not use for clinical decision-making.
      </p>
    </div>
  );
}
