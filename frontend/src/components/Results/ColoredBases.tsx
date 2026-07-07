import { baseColor } from "../../utils/baseColor";

/** Renders a short nucleotide string with each base colored by identity. */
export function ColoredBases({ text }: { text: string }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <span key={i} style={{ color: baseColor(ch), fontWeight: 600 }}>
          {ch}
        </span>
      ))}
    </>
  );
}
