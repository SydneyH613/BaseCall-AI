import type { ReactNode } from "react";

const SECTIONS = [
  { id: "dna-and-codons", label: "DNA & the genetic code" },
  { id: "reading-frames", label: "Reading frames & ORFs" },
  { id: "alignment", label: "Comparing sequences" },
  { id: "mutations", label: "Mutations" },
  { id: "primers", label: "Primers & PCR" },
  { id: "ai-role", label: "Where AI fits in" },
  { id: "glossary", label: "Glossary" },
];

const GLOSSARY: { term: string; detail: string }[] = [
  {
    term: "Codon",
    detail: "A group of three consecutive DNA/RNA bases that specifies one amino acid, or a stop signal.",
  },
  {
    term: "Reading frame",
    detail:
      "One of three ways to divide a sequence into consecutive codons, depending on which base you start counting from.",
  },
  {
    term: "ORF (open reading frame)",
    detail: "A run of codons from a start codon to an in-frame stop codon with no interruption — a candidate gene.",
  },
  {
    term: "Missense mutation",
    detail: "A base change that alters a codon so it now specifies a different amino acid.",
  },
  {
    term: "Nonsense mutation",
    detail: "A base change that turns a codon into a premature stop signal, truncating the protein.",
  },
  {
    term: "Silent mutation",
    detail: "A base change that still specifies the same amino acid, thanks to redundancy in the genetic code.",
  },
  {
    term: "Frameshift",
    detail:
      "An insertion or deletion whose length isn't a multiple of three, shifting every downstream codon out of register.",
  },
  {
    term: "Alignment",
    detail: "Arranging two sequences against each other, allowing gaps, to reveal where they match and differ.",
  },
  {
    term: "Melting temperature (Tm)",
    detail: "The temperature at which half of a primer–template duplex has separated — a proxy for binding strength.",
  },
  {
    term: "GC content",
    detail: "The percentage of a sequence made up of guanine or cytosine — G-C base pairs bond more strongly than A-T pairs.",
  },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="stack-md" style={{ scrollMarginTop: 24 }}>
      <h2 style={{ fontSize: 22 }}>{title}</h2>
      <div className="stack-sm">{children}</div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.7 }}>
      {children}
    </p>
  );
}

export function LearnPage() {
  return (
    <div className="page stack-lg">
      <div className="stack-md" style={{ maxWidth: 680 }}>
        <span className="eyebrow">Learn</span>
        <h1 style={{ fontSize: 34, lineHeight: 1.2 }}>The science behind BaseCall AI</h1>
        <p className="text-muted" style={{ fontSize: 16, lineHeight: 1.65, margin: 0 }}>
          This page covers the biology and algorithms each analysis actually runs on — genes and
          the genetic code, reading frames, sequence alignment, mutation classification, and
          primer design — so the results mean something, not just look official.
        </p>
      </div>

      <nav className="row-wrap" style={{ rowGap: 6, borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "10px 0" }}>
        {SECTIONS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} className="text-muted" style={{ fontSize: 13 }}>
            {i + 1}. {s.label}
          </a>
        ))}
      </nav>

      <Section id="dna-and-codons" title="DNA & the genetic code">
        <P>
          DNA is a sequence built from four bases — adenine (A), thymine (T), guanine (G), and
          cytosine (C). A gene is a stretch of DNA that, through an RNA intermediate, encodes a
          protein: a chain of amino acids that folds up and does the actual biochemical work in a
          cell.
        </P>
        <P>
          The coding sequence is read in non-overlapping groups of three bases called codons. With
          four possible bases in each of three positions, there are 4³ = 64 possible codons. Of
          those, 61 each specify one of the 20 amino acids, and 3 (TAA, TAG, TGA) are stop
          signals that end translation. Because there are more codons than amino acids, the code
          is <em>degenerate</em> — several codons can specify the same amino acid, usually
          differing only in the third position. That redundancy is exactly what makes some
          mutations "silent" (see below).
        </P>
        <P>
          Translation begins at a start codon — almost always ATG, which also codes for the
          amino acid methionine — and continues codon by codon until it hits a stop.
        </P>
      </Section>

      <Section id="reading-frames" title="Reading frames & open reading frames (ORFs)">
        <P>
          Where you start counting changes everything. The same stretch of DNA read starting one
          base to the right splits into an entirely different set of codons — a different{" "}
          <em>reading frame</em>. There are three possible reading frames per strand. DNA is also
          double-stranded, and the complementary (reverse) strand carries information too, in its
          own three reading frames — six reading frames in total for any given piece of DNA.
        </P>
        <P>
          An <strong>open reading frame (ORF)</strong> is a run of codons that starts at an ATG
          and continues, uninterrupted and in-frame, until it reaches a stop codon. It's a
          candidate for an actual protein-coding gene. BaseCall's ORF finder scans all six reading
          frames for exactly this pattern and translates whatever it finds to protein, so you can
          see at a glance whether a sequence — or its reverse complement — contains something
          worth investigating.
        </P>
      </Section>

      <Section id="alignment" title="Comparing two sequences: alignment">
        <P>
          Comparing two sequences base-by-base works only if nothing has been inserted or deleted.
          The moment one sequence gains or loses even a single base, every position downstream
          shifts out of register, and a naive comparison falls apart. <em>Sequence alignment</em>{" "}
          solves this by allowing gaps — it finds the arrangement of matches, mismatches, and gaps
          that best explains how two sequences relate to each other.
        </P>
        <P>
          BaseCall uses the <strong>Needleman-Wunsch algorithm</strong>, a classic dynamic
          programming method for global alignment (i.e., aligning two sequences end-to-end, not
          just their best-matching sub-regions). It scores every possible alignment path through a
          matrix — rewarding matches, penalizing mismatches and gaps — and then traces back the
          highest-scoring path. The result is a mathematically optimal alignment, not just a
          reasonable-looking one, which matters once you're using the alignment to call mutations.
        </P>
      </Section>

      <Section id="mutations" title="Mutations: what changes, and what it does to the protein">
        <P>
          Once two sequences are aligned, every difference is classified according to the reading
          frame it falls in — because the same base change can mean very different things
          depending on where it lands in a codon.
        </P>
        <div className="stack-sm">
          <p style={{ margin: 0, fontWeight: 500 }}>Single-base substitutions</p>
          <P>
            <strong>Silent</strong> — the new codon still specifies the same amino acid (thanks to
            code redundancy); the protein is unchanged. <strong>Missense</strong> — the codon now
            specifies a different amino acid; the protein sequence changes. <strong>Nonsense</strong>{" "}
            — the codon becomes a premature stop; the protein is truncated. <strong>Stop-loss</strong>{" "}
            — a stop codon is mutated into a sense codon, so translation runs on past where it
            should have ended.
          </P>
        </div>
        <div className="stack-sm">
          <p style={{ margin: 0, fontWeight: 500 }}>Insertions & deletions</p>
          <P>
            If the number of bases added or removed is a multiple of three, the reading frame
            downstream is undisturbed — an <strong>in-frame indel</strong> that gains or loses one
            or more whole amino acids but leaves the rest of the protein intact. Otherwise, every
            codon downstream is shifted — a <strong>frameshift</strong> — which almost always
            garbles the rest of the protein and runs into a premature stop soon after.
          </P>
        </div>

        <div className="panel-accent stack-sm">
          <span className="eyebrow">Worked example — sickle-cell disease</span>
          <P>
            The <em>HBB</em> gene, on chromosome 11, encodes beta-globin — one of the two protein
            chains that make up adult hemoglobin. A single point mutation, <strong>GAG → GTG</strong>,
            changes the codon for glutamic acid to the codon for valine at position 6 of the
            mature protein. One base, out of a 146-amino-acid chain. But glutamic acid is charged and
            valine is hydrophobic, and that one substitution is enough to let hemoglobin molecules
            stick together into rigid fibers under low oxygen, forcing red blood cells into the
            characteristic sickle shape. It's a textbook <strong>missense mutation</strong> — and a
            reminder that "small" and "consequential" aren't opposites. (Educational example only —
            not a diagnostic explanation of any individual's health.)
          </P>
        </div>
      </Section>

      <Section id="primers" title="Primers & PCR">
        <P>
          PCR (polymerase chain reaction) amplifies a specific stretch of DNA using two short
          synthetic fragments called <em>primers</em>, which bind to either end of the target
          region; DNA polymerase then extends outward from each one. A poorly designed primer
          binds weakly, binds in the wrong place, or simply fails to amplify anything — so a few
          numbers are checked before ordering one:
        </P>
        <P>
          <strong>Length</strong>, usually 18–24 bases — long enough to bind specifically
          somewhere in a genome, short enough to synthesize cheaply and bind quickly.{" "}
          <strong>GC content</strong>, ideally 40–60% — G-C base pairs form three hydrogen bonds
          versus two for A-T, so GC content directly affects binding strength.{" "}
          <strong>Melting temperature (Tm)</strong>, the temperature at which half of the
          primer–template duplexes have separated; for short oligos, the Wallace rule estimates it
          as 4°C for every G or C plus 2°C for every A or T, with good primers usually landing in
          the 50–65°C range. And a <strong>3′ GC clamp</strong> — ending the primer on a G or C —
          strengthens the final base pairs and helps polymerase extension start cleanly.
        </P>
        <P>
          BaseCall's primer check runs exactly these numbers on whatever you paste in and flags
          anything that falls outside the usual ranges.
        </P>
      </Section>

      <Section id="ai-role" title="Where AI fits in">
        <P>
          Everything above — alignment, codon translation, mutation classification, ORF scanning,
          primer metrics — is deterministic computation. Given the same sequence, you get the same
          answer every time; nothing is guessed or generated. Only once those numbers exist are
          the results handed to Claude, and only to put them into plain language: what a missense
          mutation at this position generally implies, whether an ORF looks like a meaningful
          candidate, whether a primer looks ready to order. The model never sees the raw sequence
          and never touches the computation — only the finished, already-correct results.
        </P>
      </Section>

      <Section id="glossary" title="Glossary">
        <dl className="stack-sm" style={{ margin: 0 }}>
          {GLOSSARY.map((g) => (
            <div key={g.term} className="definition-row">
              <dt>{g.term}</dt>
              <dd className="text-muted">{g.detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <p className="text-faint" style={{ fontSize: 12.5 }}>
        Educational content only — not medical or diagnostic advice. Do not use for clinical
        decision-making.
      </p>
    </div>
  );
}
