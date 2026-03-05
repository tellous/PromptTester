import type { SectionDefinition } from "../sectionData";

interface RecommendationPillsProps {
  unusedSections: SectionDefinition[];
  onInsert: (section: SectionDefinition) => void;
}

export default function RecommendationPills({
  unusedSections,
  onInsert,
}: RecommendationPillsProps) {
  const coreSections = unusedSections.filter(
    (section) => section.priority === "core"
  );
  const advancedSections = unusedSections.filter(
    (section) => section.priority === "advanced"
  );

  if (unusedSections.length === 0) {
    return (
      <div className="recommendations">
        <div className="rec-header">
          <span className="rec-check">&#10003;</span>
          <span>You covered the core sections.</span>
        </div>
        <p className="rec-subtext">
          Keep refining the wording, or switch views if a visual editor feels
          easier.
        </p>
      </div>
    );
  }

  return (
    <div className="recommendations">
      <div className="rec-header">
        <span>Helpful next sections</span>
      </div>
      <p className="rec-subtext">
        {coreSections.length > 0
          ? "Start with core structure, then add advanced control sections."
          : "Core structure is covered. Add advanced sections if you need tighter control."}
      </p>
      <div className="rec-groups">
        {coreSections.length > 0 && (
          <div className="rec-group">
            <div className="rec-group-header">
              <span className="rec-group-title">Core</span>
            </div>
            <div className="rec-pills">
              {coreSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className="rec-pill"
                  style={{
                    borderColor: section.color,
                    color: section.color,
                  }}
                  onClick={() => onInsert(section)}
                  title={`${section.summary} ${section.whenToUse}`}
                >
                  <span
                    className="pill-dot"
                    style={{ background: section.color }}
                  />
                  <span className="rec-pill-label">{section.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {advancedSections.length > 0 && (
          <div className="rec-group">
            <div className="rec-group-header">
              <span className="rec-group-title">Advanced</span>
            </div>
            <div className="rec-pills">
              {advancedSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className="rec-pill"
                  style={{
                    borderColor: section.color,
                    color: section.color,
                  }}
                  onClick={() => onInsert(section)}
                  title={`${section.summary} ${section.whenToUse}`}
                >
                  <span
                    className="pill-dot"
                    style={{ background: section.color }}
                  />
                  <span className="rec-pill-label">{section.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
