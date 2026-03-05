import {
  getSectionDefinitionById,
  type SectionDefinition,
} from "./sectionData";

export const EXAMPLE_PROMPT = `# Role
You are a principal TypeScript and React code reviewer for a production SaaS platform.

# Context
We are reviewing a pull request for a healthcare dashboard that handles sensitive user data and has strict uptime requirements.

# Task
Review the pull request diff and identify the most important issues related to security, correctness, performance, and maintainability.

# Input
\`\`\`diff
[paste PR diff here]
\`\`\`

# Output Format
Return a markdown list where each finding includes:
- Severity
- File
- Problem
- Why it matters
- Recommended fix

# Success Criteria
- Prioritize the 5 most important findings first
- Explain impact in concrete production terms
- Only flag issues that are supported by the diff

# Constraints
- Do not comment on formatting unless it affects readability
- Do not invent files or implementation details
- Keep each finding under 120 words

# Non-Goals
- Do not rewrite the entire component
- Do not suggest adding comments to obvious code
- Do not praise the code unless it explains a tradeoff

# Clarifying Questions
Ask up to 2 concise questions before reviewing if the diff is incomplete or key context is missing.

# Examples
Input: \`const data = await fetch(url)\`
Output:
- Severity: High
- File: api.ts
- Problem: The fetch call has no error handling or timeout.
- Why it matters: Network failures can surface as unhandled promise rejections and leave the UI in an inconsistent state.
- Recommended fix: Wrap the request in try/catch and convert failures into a typed error state.

# Fallback Behavior
If the diff does not contain enough evidence, say "Need more context" and list the missing information.
`;

export function getSectionSnippet(
  section: Pick<SectionDefinition, "id">
): string {
  return getSectionDefinitionById(section.id)?.snippet ?? "";
}

export function appendSectionSnippet(text: string, snippet: string): string {
  const base = text.trimEnd();
  return base ? `${base}\n\n${snippet}` : snippet;
}
