import { getSectionCoverage, type SectionId } from "../sectionData";

interface ScoreBarProps {
  detectedIds: ReadonlySet<SectionId>;
}

export default function ScoreBar({ detectedIds }: ScoreBarProps) {
  const coverage = getSectionCoverage(detectedIds);
  const pct = coverage.corePercent;

  let label: string;
  let barColor: string;
  if (coverage.coreDetected === 0) {
    label = "Add core sections.";
    barColor = "#b8a48a";
  } else if (pct < 40) {
    label = "Add more core sections.";
    barColor = "#d97757";
  } else if (pct < 75) {
    label = "One more core section will help.";
    barColor = "#d9a441";
  } else if (coverage.advancedDetected < 2) {
    label = "Core is strong. Add controls if needed.";
    barColor = "#4f9b84";
  } else {
    label = "Structure looks solid.";
    barColor = "#4f7cb8";
  }

  return (
    <div className="score-bar">
      <div className="score-info">
        <span className="score-label">{label}</span>
        <span className="score-count">
          {coverage.coreDetected}/{coverage.coreTotal} core
          {coverage.advancedDetected > 0
            ? ` | ${coverage.advancedDetected} adv`
            : ""}
        </span>
      </div>
      <div
        className="score-track"
        role="progressbar"
        aria-label="Core prompt structure coverage"
        aria-valuemin={0}
        aria-valuemax={coverage.coreTotal}
        aria-valuenow={coverage.coreDetected}
      >
        <div
          className="score-fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}
