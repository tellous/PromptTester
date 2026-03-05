import {
  findMatchingSectionDefinition,
  type SectionId,
  type SectionDefinition,
} from "./sectionData";

export interface DetectedSection {
  definition: SectionDefinition;
  startLine: number;
  endLine: number;
  headerText: string;
}

const PLAIN_SECTION_LABEL_PATTERN =
  /^[a-z][a-z0-9_-]*(?: [a-z][a-z0-9_-]*){0,3}:\s*$/i;

function isStandalonePlainLabelBoundaryLine(
  line: string,
  previousLine: string | undefined
): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  if (!PLAIN_SECTION_LABEL_PATTERN.test(trimmed)) {
    return false;
  }

  // Plain "Section:" labels should start a new block, not split prose such as
  // "Return a markdown list where each finding includes:" within a section.
  return !(previousLine?.trim() ?? "");
}

function isStructuredSectionBoundaryLine(
  line: string,
  previousLine: string | undefined
): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  return (
    /^#{1,6}\s+\S/.test(trimmed) ||
    /^<([a-z_][a-z0-9_-]*)>\s*$/i.test(trimmed) ||
    /^\*\*\s*[^*]+\s*:?\s*\*\*$/.test(trimmed) ||
    isStandalonePlainLabelBoundaryLine(trimmed, previousLine)
  );
}

function findMatchingSectionBoundaryDefinition(
  line: string,
  previousLine: string | undefined
): SectionDefinition | null {
  if (!isStructuredSectionBoundaryLine(line, previousLine)) {
    return null;
  }

  return findMatchingSectionDefinition(line);
}

function isSectionBoundaryLine(
  line: string,
  previousLine: string | undefined
): boolean {
  return isStructuredSectionBoundaryLine(line, previousLine);
}

export function detectSections(text: string): DetectedSection[] {
  const lines = text.split("\n");
  const boundaries: number[] = [];
  const found: { def: SectionDefinition; lineIdx: number; headerText: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const previousLine = i > 0 ? lines[i - 1] : undefined;
    if (!isSectionBoundaryLine(line, previousLine)) continue;

    boundaries.push(i);

    const matchedDef = findMatchingSectionBoundaryDefinition(line, previousLine);
    if (matchedDef) {
      found.push({ def: matchedDef, lineIdx: i, headerText: line.trim() });
    }
  }

  // Sort by line position
  found.sort((a, b) => a.lineIdx - b.lineIdx);
  boundaries.sort((a, b) => a - b);

  // Convert to sections with start/end ranges. Section ranges always end at the
  // next boundary line so edited/unrecognized headings still split outlines.
  let boundaryIndex = 0;
  const sections: DetectedSection[] = found.map((f) => {
    while (
      boundaryIndex < boundaries.length &&
      boundaries[boundaryIndex] <= f.lineIdx
    ) {
      boundaryIndex += 1;
    }

    const nextStart = boundaries[boundaryIndex] ?? lines.length;

    let endLine = nextStart - 1;
    // Do not let a section visually "bleed" into the next one via spacer lines.
    while (endLine > f.lineIdx && !lines[endLine].trim()) {
      endLine -= 1;
    }

    return {
      definition: f.def,
      startLine: f.lineIdx,
      endLine,
      headerText: f.headerText,
    };
  });

  return sections;
}

export function detectSectionIds(text: string): Set<SectionId> {
  const ids = new Set<SectionId>();
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;
    const previousLine = i > 0 ? lines[i - 1] : undefined;
    const matchedDef = findMatchingSectionBoundaryDefinition(line, previousLine);
    if (matchedDef) {
      ids.add(matchedDef.id);
    }
  }

  return ids;
}

export function getDetectedIds(sections: DetectedSection[]): Set<SectionId> {
  return new Set(sections.map((s) => s.definition.id));
}
