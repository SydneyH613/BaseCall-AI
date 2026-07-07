export function AiExplanationPanel({ text }: { text: string }) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        background: "var(--accent-soft)",
        border: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          fontWeight: 700,
          color: "var(--accent-strong)",
        }}
      >
        <span aria-hidden>✨</span> AI Interpretation
      </div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}
