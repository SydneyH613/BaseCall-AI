import type { SequenceStats } from "../../types";

export function StatsStrip({ stats }: { stats: SequenceStats }) {
  return (
    <div style={{ display: "flex", gap: 16, fontSize: 12 }} className="text-muted">
      <span>{stats.length} bp</span>
      <span>GC {stats.gc_content_pct}%</span>
      <span>A {stats.a_count}</span>
      <span>T {stats.t_count}</span>
      <span>G {stats.g_count}</span>
      <span>C {stats.c_count}</span>
    </div>
  );
}
