import { useEffect, useRef, useState } from "react";
import { BASE_LEGEND, baseColor } from "../../utils/baseColor";

const MIN_CHUNK_SIZE = 20;
const MAX_CHUNK_SIZE = 60;
// Rough monospace character width at this component's font-size (12.5px)
// plus letter-spacing, used to fit as many bases per line as the box
// actually has room for -- so short sequences read on one line without
// needing to scroll, and long ones wrap at a width that fits the screen.
const CHAR_WIDTH_PX = 8.2;
const LINE_PREFIX_WIDTH_PX = 34; // space reserved for the "ref "/"qry " label
const BOX_PADDING_PX = 36; // left+right padding of the sequence box itself

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

function useResponsiveChunkSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chunkSize, setChunkSize] = useState(MAX_CHUNK_SIZE);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const available = el.clientWidth - BOX_PADDING_PX - LINE_PREFIX_WIDTH_PX;
      const charsThatFit = Math.floor(available / CHAR_WIDTH_PX);
      setChunkSize(Math.max(MIN_CHUNK_SIZE, Math.min(MAX_CHUNK_SIZE, charsThatFit)));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, chunkSize };
}

export function AlignmentViewer({ alignedReference, alignedQuery }: Props) {
  const { containerRef, chunkSize } = useResponsiveChunkSize();
  const refChunks = chunk(alignedReference, chunkSize);
  const qryChunks = chunk(alignedQuery, chunkSize);

  return (
    <div className="stack-xs">
      <div className="row-wrap" style={{ gap: 12 }}>
        {BASE_LEGEND.map(({ base, name }) => (
          <span
            key={base}
            className="text-faint"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
            title={name}
          >
            <span style={{ color: baseColor(base), fontWeight: 700 }}>{base}</span> {name}
          </span>
        ))}
      </div>
      <div
        ref={containerRef}
        className="sequence-block scroll-x"
        style={{
          background: "var(--bg-sunken)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "16px 18px",
        }}
      >
        {refChunks.map((refLine, lineIdx) => {
          const qryLine = qryChunks[lineIdx] ?? "";
          const offset = lineIdx * chunkSize;
          return (
            <div key={lineIdx} style={{ marginBottom: 14 }}>
              <div className="text-faint" style={{ fontSize: 10.5, marginBottom: 2 }}>
                {offset}
              </div>
              <div>
                <span className="text-faint" style={{ marginRight: 8 }}>
                  ref
                </span>
                {[...refLine].map((base, i) => (
                  <span
                    key={i}
                    style={{
                      background: base === "-" ? "var(--bg-subtle)" : "transparent",
                      color: base === "-" ? "var(--text-muted)" : baseColor(base),
                      fontWeight: 600,
                    }}
                  >
                    {base}
                  </span>
                ))}
              </div>
              <div>
                <span className="text-faint" style={{ marginRight: 8 }}>
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
                        color: isGap ? "var(--text-muted)" : baseColor(base),
                        fontWeight: 600,
                        boxShadow: isMismatch ? "inset 0 -2px 0 var(--danger)" : undefined,
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
    </div>
  );
}
