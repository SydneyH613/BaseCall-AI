import type { SequenceStats } from "../../types";
import { baseColor } from "../../utils/baseColor";

const BASES: { key: keyof SequenceStats; base: string }[] = [
  { key: "a_count", base: "A" },
  { key: "t_count", base: "T" },
  { key: "g_count", base: "G" },
  { key: "c_count", base: "C" },
];

export function StatsStrip({ stats }: { stats: SequenceStats }) {
  return (
    <div className="stack-xs">
      {stats.length > 0 && (
        <div
          className="row"
          style={{ gap: 1, height: 6, borderRadius: 3, overflow: "hidden" }}
          title="Base composition"
        >
          {BASES.map(({ key, base }) => {
            const count = stats[key] as number;
            if (count === 0) return null;
            return (
              <div
                key={base}
                style={{
                  width: `${(count / stats.length) * 100}%`,
                  height: "100%",
                  background: baseColor(base),
                }}
              />
            );
          })}
        </div>
      )}
      <div className="row-wrap text-faint" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, gap: 16 }}>
        <span>{stats.length} bp</span>
        <span>GC {stats.gc_content_pct}%</span>
        {BASES.map(({ key, base }) => (
          <span key={base}>
            <span style={{ color: baseColor(base), fontWeight: 700 }}>{base}</span> {stats[key] as number}
          </span>
        ))}
      </div>
    </div>
  );
}
