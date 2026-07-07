export function AiExplanationPanel({ text }: { text: string }) {
  return (
    <div className="panel-accent stack-sm">
      <span className="eyebrow">AI interpretation</span>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65, fontSize: 14.5 }}>{text}</div>
    </div>
  );
}
