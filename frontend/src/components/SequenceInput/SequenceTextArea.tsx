import { useRef, useState, type DragEvent } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function SequenceTextArea({ label, value, onChange, placeholder, rows = 6 }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onChange(await file.text());
    }
  }

  async function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onChange(await file.text());
    }
    event.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      style={{
        borderRadius: "var(--radius)",
        outline: isDragging ? "2px dashed var(--accent)" : "none",
        outlineOffset: 4,
      }}
    >
      <div className="row-between" style={{ marginBottom: 7 }}>
        <label className="label" style={{ margin: 0 }}>
          {label}
        </label>
        <button type="button" className="field-action" onClick={() => inputRef.current?.click()}>
          Upload .fasta / .txt
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".fasta,.fa,.txt"
          onChange={handleFilePick}
          style={{ display: "none" }}
        />
      </div>
      <textarea
        className="textarea mono"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Paste a raw sequence or FASTA (>header + sequence), or drag a file here"}
        spellCheck={false}
      />
    </div>
  );
}
