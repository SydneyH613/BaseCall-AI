const CHUNK_SIZE = 60;

interface Props {
  alignedReference: string;
  alignedQuery: string;
}

function chunk(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

export function AlignmentViewer({ alignedReference, alignedQuery }: Props) {
  const refChunks = chunk(alignedReference, CHUNK_SIZE);
  const qryChunks = chunk(alignedQuery, CHUNK_SIZE);

  return (
    <div className="sequence-block" style={{ overflowX: "auto" }}>
      {refChunks.map((refLine, lineIdx) => {
        const qryLine = qryChunks[lineIdx] ?? "";
        const offset = lineIdx * CHUNK_SIZE;
        return (
          <div key={lineIdx} style={{ marginBottom: 14 }}>
            <div className="text-muted" style={{ fontSize: 11, marginBottom: 2 }}>
              {offset}
            </div>
            <div>
              <span className="text-muted" style={{ marginRight: 8 }}>
                ref
              </span>
              {[...refLine].map((base, i) => (
                <span
                  key={i}
                  style={{
                    background: base === "-" ? "var(--bg-subtle)" : "transparent",
                    color: base === "-" ? "var(--text-muted)" : undefined,
                  }}
                >
                  {base}
                </span>
              ))}
            </div>
            <div>
              <span className="text-muted" style={{ marginRight: 8 }}>
                qry
              </span>
              {[...qryLine].map((base, i) => {
                const refBase = refLine[i];
                const isMismatch = refBase !== undefined && refBase !== base;
                const isGap = base === "-" || refBase === "-";
                return (
                  <span
                    key={i}
                    style={{
                      background: isGap
                        ? "var(--bg-subtle)"
                        : isMismatch
                          ? "var(--danger-soft)"
                          : "transparent",
                      color: isGap
                        ? "var(--text-muted)"
                        : isMismatch
                          ? "var(--danger)"
                          : undefined,
                      fontWeight: isMismatch ? 700 : 400,
                    }}
                  >
                    {base}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
