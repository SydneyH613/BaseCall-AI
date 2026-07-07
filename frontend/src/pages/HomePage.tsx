import { Link } from "react-router-dom";
import { SequenceTrace } from "../components/SequenceTrace";
import { BASE_LEGEND, baseColor } from "../utils/baseColor";

const CAPABILITIES = [
  {
    term: "Mutation & variant calling",
    detail:
      "Needleman-Wunsch global alignment, implemented from scratch, mapped back to reference-frame codons to classify substitutions as silent, missense, nonsense, or stop-loss — and gap runs as frameshift or in-frame insertions/deletions.",
  },
  {
    term: "ORF finder",
    detail:
      "Scans all six reading frames — three forward, three on the reverse complement — for start-to-stop open reading frames, translating each to protein.",
  },
  {
    term: "Primer design check",
    detail:
      "GC content, Wallace-rule melting temperature, and the design warnings a bench scientist would check before ordering a primer.",
  },
  {
    term: "AI interpretation",
    detail:
      "The already-computed results are handed to Claude as structured data — never the raw sequence, never the computation itself — to produce a plain-language read of biological significance.",
  },
];

// The real HBB (beta-globin) fragment used throughout this project's own
// test suite -- the sickle-cell mutation region -- rendered as an actual
// base-colored trace rather than decorative noise.
const HERO_SEQUENCE = "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACT";

export function HomePage() {
  return (
    <div className="page stack-lg">
      <section className="stack-md" style={{ maxWidth: 620 }}>
        <span className="eyebrow">Sequence analysis · powered by real algorithms</span>
        <h1 style={{ fontSize: 40, lineHeight: 1.2 }}>From raw sequence to real understanding.</h1>
        <p className="text-muted" style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}>
          BaseCall AI runs the actual bioinformatics algorithms — sequence alignment, codon
          translation, mutation classification — as deterministic computation. AI is used for
          exactly one thing afterward: explaining what the results mean.
        </p>
        <div>
          <Link to="/analyze" className="btn">
            Start an analysis →
          </Link>
        </div>
      </section>

      <div className="stack-xs">
        <SequenceTrace sequence={HERO_SEQUENCE} />
        <div className="row-between">
          <span className="text-faint" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
            HBB, exon 1 — the sickle-cell mutation region (39 real bases)
          </span>
          <div className="row-wrap" style={{ gap: 10 }}>
            {BASE_LEGEND.map(({ base, name }) => (
              <span key={base} className="text-faint" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }} title={name}>
                <span style={{ color: baseColor(base), fontWeight: 700 }}>{base}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="genomic-ruler" />

      <section className="stack-md">
        <span className="eyebrow">What it does</span>
        <dl className="stack-md" style={{ margin: 0 }}>
          {CAPABILITIES.map((c) => (
            <div key={c.term} className="definition-row">
              <dt>{c.term}</dt>
              <dd className="text-muted">{c.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-faint" style={{ fontSize: 12.5 }}>
        Educational tool only — not a diagnostic device. Do not use for clinical decision-making.
      </p>
    </div>
  );
}
