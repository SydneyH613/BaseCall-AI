/**
 * The app's mark: four signal bars of varying height, standing in for a
 * base-calling trace -- the fluorescence-peak signal a sequencer produces,
 * which base-calling software interprets into A/T/G/C. Same motif as
 * public/favicon.svg, kept in sync by hand since one is a static asset and
 * the other needs to theme with light/dark mode.
 */
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden style={{ color: "var(--bg)" }}>
      <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
        <rect x="6.4" y="13" width="3.2" height="10" rx="1.6" fill="currentColor" />
        <rect x="11.6" y="7" width="3.2" height="16" rx="1.6" fill="currentColor" />
        <rect x="16.8" y="11" width="3.2" height="12" rx="1.6" fill="currentColor" />
        <rect x="22" y="4" width="3.2" height="19" rx="1.6" fill="currentColor" />
      </svg>
    </span>
  );
}
