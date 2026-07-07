/**
 * Nucleotide base -> CSS color variable, following the base-color
 * convention used across genome browsers and sequencing tools (IGV, UCSC,
 * JBrowse): each of A/T/G/C gets a fixed, distinct color so a sequence
 * reads at a glance instead of as an undifferentiated string of letters.
 */
export function baseColor(base: string): string | undefined {
  switch (base.toUpperCase()) {
    case "A":
      return "var(--base-a)";
    case "T":
      return "var(--base-t)";
    case "G":
      return "var(--base-g)";
    case "C":
      return "var(--base-c)";
    default:
      return undefined;
  }
}

export const BASE_LEGEND: { base: string; name: string }[] = [
  { base: "A", name: "Adenine" },
  { base: "T", name: "Thymine" },
  { base: "G", name: "Guanine" },
  { base: "C", name: "Cytosine" },
];
