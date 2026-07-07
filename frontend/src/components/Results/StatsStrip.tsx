import type { SequenceStats } from "../../types";

export function StatsStrip({ stats }: { stats: SequenceStats }) {
  return (
    <div className="row-wrap text-faint" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, gap: 16 }}>
      <span>{stats.length} bp</span>
      <span>GC {stats.gc_content_pct}%</span>
      <span>A {stats.a_count}</span>
      <span>T {stats.t_count}</span>
      <span>G {stats.g_count}</span>
      <span>C {stats.c_count}</span>
    </div>
  );
}
