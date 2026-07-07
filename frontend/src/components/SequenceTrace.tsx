const BAR_WIDTH = 3.2;
const GAP = 2.4;
const STEP = BAR_WIDTH + GAP;

// Each base gets a characteristic height tier, echoing how a real
// chromatogram trace has a per-channel baseline -- so the strip reads as
// a rhythmic pattern rather than random noise.
const HEIGHT_BY_BASE: Record<string, number> = { A: 1, T: 0.76, G: 0.54, C: 0.32 };

function colorVar(base: string): string {
  return `var(--base-${base.toLowerCase()})`;
}

export function SequenceTrace({ sequence, height = 56 }: { sequence: string; height?: number }) {
  const bases = [...sequence.toUpperCase()].filter((b) => b in HEIGHT_BY_BASE);
  const width = bases.length * STEP;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden
      style={{ display: "block" }}
    >
      {bases.map((base, i) => {
        const barHeight = HEIGHT_BY_BASE[base] * height;
        return (
          <rect
            key={i}
            x={i * STEP}
            y={height - barHeight}
            width={BAR_WIDTH}
            height={barHeight}
            rx={BAR_WIDTH / 2}
            style={{ fill: colorVar(base) }}
          />
        );
      })}
    </svg>
  );
}
