export const SECTION_IDS = [
  "role",
  "context",
  "task",
  "input",
  "output_format",
  "examples",
  "constraints",
  "success_criteria",
  "assumptions",
  "non_goals",
  "clarifying_questions",
  "workflow",
  "evaluation_rubric",
  "sources",
  "fallback_behavior",
  "tone",
  "audience",
  "edge_cases",
  "chain_of_thought",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
export type SectionPriority = "core" | "advanced";

export interface SectionExample {
  label: string;
  content: string;
}

export interface SectionDefinition {
  id: SectionId;
  name: string;
  patterns: readonly RegExp[];
  summary: string;
  explanation: string;
  whenToUse: string;
  examples: readonly SectionExample[];
  snippet: string;
  color: string;
  priority: SectionPriority;
}

export interface SectionCoverage {
  coreDetected: number;
  coreTotal: number;
  advancedDetected: number;
  advancedTotal: number;
  totalDetected: number;
  totalAvailable: number;
  corePercent: number;
}

export const SECTION_DEFINITIONS: readonly SectionDefinition[] = [
  {
    id: "role",
    name: "Role",
    patterns: [
      /^#{1,3}\s*(role|persona|identity|who you are|character|act as)/im,
      /^(role|persona|identity|character)\s*[:]/im,
      /^<(role|persona|system_role|character)>/im,
      /^you are\b/im,
      /^\*\*\s*(role|persona)\s*[:]*\s*\*\*/im,
    ],
    summary: "Anchors the assistant's expertise, stance, and decision style.",
    explanation:
      "Role prompting reduces drift by telling the model what kind of expert or collaborator it should emulate throughout the task.",
    whenToUse:
      "Use when the task depends on domain judgment, communication style, or a specific level of rigor.",
    examples: [
      {
        label: "Minimal",
        content:
          "Role: You are a senior product marketer writing launch copy for B2B SaaS.",
      },
      {
        label: "Structured",
        content:
          "# Role\nYou are a staff frontend engineer reviewing React pull requests for maintainability and accessibility.",
      },
      {
        label: "Specialized",
        content:
          "# Role\nYou are an incident commander summarizing production outages for executives and on-call engineers.",
      },
    ],
    snippet:
      "# Role\nYou are a [domain expert] helping with [type of task]. Prioritize [quality bar or decision style].",
    color: "#6366f1",
    priority: "core",
  },
  {
    id: "context",
    name: "Context",
    patterns: [
      /^#{1,3}\s*(context|background|situation|overview|about)/im,
      /^(context|background|situation)\s*[:]/im,
      /^<(context|background|situation)>/im,
      /^\*\*\s*(context|background)\s*[:]*\s*\*\*/im,
    ],
    summary: "Supplies the background the model would otherwise guess.",
    explanation:
      "Relevant context narrows the solution space and makes the response more accurate, specific, and less generic.",
    whenToUse:
      "Use when business goals, prior decisions, domain rules, or system constraints matter to the answer.",
    examples: [
      {
        label: "Product",
        content:
          "# Context\nWe are redesigning onboarding for a fintech app with a high drop-off rate on identity verification.",
      },
      {
        label: "Engineering",
        content:
          "# Context\nThe service runs on Node.js, the team deploys weekly, and database schema changes are expensive.",
      },
      {
        label: "Policy",
        content:
          "# Context\nThe audience is internal support staff who need guidance that matches current company refund policy.",
      },
    ],
    snippet:
      "# Context\n[Describe the background, constraints, and why this task matters right now.]",
    color: "#8b5cf6",
    priority: "core",
  },
  {
    id: "task",
    name: "Task",
    patterns: [
      /^#{1,3}\s*(task|instructions?|objective|goal|what to do|assignment)/im,
      /^(task|instructions?|objective|goal)\s*[:]/im,
      /^<(task|instructions?|objective)>/im,
      /^\*\*\s*(task|instructions?|objective)\s*[:]*\s*\*\*/im,
    ],
    summary: "States the exact job you want the model to do.",
    explanation:
      "A clear task statement is the core of the prompt. Specific actions produce more reliable responses than vague requests.",
    whenToUse:
      "Use in every prompt where you care about the output being deliberate instead of improvisational.",
    examples: [
      {
        label: "Analysis",
        content:
          "Task: Compare these two pricing strategies and recommend one for a mid-market SaaS launch.",
      },
      {
        label: "Code review",
        content:
          "# Task\nReview the following PR diff and identify the highest-risk issues related to security, correctness, and performance.",
      },
      {
        label: "Rewrite",
        content:
          "# Task\nRewrite the email so it is shorter, clearer, and suitable for an executive audience.",
      },
    ],
    snippet:
      "# Task\n[Describe exactly what you want the AI to produce, evaluate, rewrite, or decide.]",
    color: "#ec4899",
    priority: "core",
  },
  {
    id: "input",
    name: "Input",
    patterns: [
      /^#{1,3}\s*(input|data|given|provided|source|content to analyze)/im,
      /^(input|data|given|provided data)\s*[:]/im,
      /^<(input|data|user_input|source)>/im,
      /^\*\*\s*(input|data|provided)\s*[:]*\s*\*\*/im,
    ],
    summary: "Separates the raw material from the instructions about it.",
    explanation:
      "Explicitly marking the input prevents the model from confusing user data with the rules it should follow.",
    whenToUse:
      "Use whenever the prompt includes code, prose, data, transcripts, or any other payload the model must process.",
    examples: [
      {
        label: "Code",
        content: "# Input\n```ts\nconst response = await fetch(url);\n```",
      },
      {
        label: "Research notes",
        content:
          "# Input\n- Customer churn rose 12% after the pricing change.\n- Support volume increased in the first 2 weeks.",
      },
      {
        label: "Dataset",
        content:
          "# Input\nRegion | Revenue | Growth\nNorth America | 1.2M | 8%\nEMEA | 900k | 11%",
      },
    ],
    snippet: "# Input\n```\n[Paste the text, code, or data to process]\n```",
    color: "#64748b",
    priority: "core",
  },
  {
    id: "output_format",
    name: "Output Format",
    patterns: [
      /^#{1,3}\s*(output|format|response format|expected output|output format|formatting)/im,
      /^(response format|output format|expected output|format)\s*[:]/im,
      /^<(output_format|format|response_format|output)>/im,
      /^\*\*\s*(output|format|output format)\s*[:]*\s*\*\*/im,
      /^respond (in|with|using)\b/im,
    ],
    summary: "Defines the shape of the answer so it is immediately usable.",
    explanation:
      "Format instructions reduce back-and-forth by telling the model exactly how to organize the response.",
    whenToUse:
      "Use when the output needs to plug into a workflow, spreadsheet, UI, report, or downstream automation.",
    examples: [
      {
        label: "JSON",
        content:
          'Output Format: Return valid JSON with keys "summary", "risks", and "next_steps".',
      },
      {
        label: "Checklist",
        content:
          "# Output Format\nReturn a markdown checklist with sections for quick wins, deeper fixes, and open questions.",
      },
      {
        label: "Table",
        content:
          "# Output Format\nUse a table with columns: issue, impact, recommendation, owner.",
      },
    ],
    snippet:
      "# Output Format\n[Describe the response structure, headings, schema, or template the AI should follow.]",
    color: "#f59e0b",
    priority: "core",
  },
  {
    id: "examples",
    name: "Examples",
    patterns: [
      /^#{1,3}\s*(examples?|few.?shot|sample|demonstration|input.?output)/im,
      /^(examples?|sample|demonstration)\s*[:]/im,
      /^<(examples?|few_shot|sample)>/im,
      /^\*\*\s*(examples?|few.?shot)\s*[:]*\s*\*\*/im,
      /^(here (is|are) (an? )?examples?|for example)\s*[:]/im,
    ],
    summary: "Shows the pattern you want instead of describing it abstractly.",
    explanation:
      "Few-shot examples are one of the strongest prompt-engineering tools because they demonstrate the desired mapping directly.",
    whenToUse:
      "Use when consistency matters, especially for classification, rewriting, extraction, or structured generation tasks.",
    examples: [
      {
        label: "Classification",
        content:
          'Input: "The app crashes on login."\nOutput: { "category": "bug", "severity": "high", "component": "auth" }',
      },
      {
        label: "Rewrite",
        content:
          'Input: "Can you maybe send this when you get a chance?"\nOutput: "Please send this by 3 PM today."',
      },
      {
        label: "Summarization",
        content:
          'Input: "Customer mentions slow exports, broken filters, and unclear billing."\nOutput: "Top issues: export latency, filtering bugs, billing confusion."',
      },
    ],
    snippet:
      '# Examples\nInput: "[example input]"\nOutput: "[ideal example output]"',
    color: "#10b981",
    priority: "core",
  },
  {
    id: "constraints",
    name: "Constraints",
    patterns: [
      /^#{1,3}\s*(constraints?|rules?|restrictions?|limitations?|boundaries|guardrails|requirements)/im,
      /^(constraints?|rules?|restrictions?|requirements)\s*[:]/im,
      /^<(constraints?|rules?|restrictions?|requirements)>/im,
      /^\*\*\s*(constraints?|rules?)\s*[:]*\s*\*\*/im,
      /^(do not|don'?t|never|always|must)\b/im,
    ],
    summary: "Adds guardrails so the model stays in bounds.",
    explanation:
      "Constraints prevent failure modes such as scope creep, unsupported claims, or overly verbose answers.",
    whenToUse:
      "Use when you know the response can fail in predictable ways and you want to prevent that up front.",
    examples: [
      {
        label: "Brevity",
        content:
          "# Constraints\n- Keep the response under 200 words.\n- Avoid filler and repetition.",
      },
      {
        label: "Evidence",
        content:
          "# Constraints\n- Do not invent facts.\n- Mark uncertainty clearly when evidence is incomplete.",
      },
      {
        label: "Engineering",
        content:
          "# Constraints\n- Never suggest a breaking schema change.\n- Prefer low-risk fixes over full rewrites.",
      },
    ],
    snippet:
      "# Constraints\n- [Rule 1]\n- [Rule 2]\n- [Rule 3]",
    color: "#ef4444",
    priority: "core",
  },
  {
    id: "success_criteria",
    name: "Success Criteria",
    patterns: [
      /^#{1,3}\s*(success criteria|acceptance criteria|definition of done|done looks like|quality bar)/im,
      /^(success criteria|acceptance criteria|definition of done|quality bar)\s*[:]/im,
      /^<(success_criteria|acceptance_criteria|definition_of_done|quality_bar)>/im,
      /^\*\*\s*(success criteria|acceptance criteria|definition of done)\s*[:]*\s*\*\*/im,
      /^(success looks like|the answer is successful if)\b/im,
    ],
    summary: "Defines what a strong answer must accomplish.",
    explanation:
      "Success criteria give the model a target state instead of leaving quality implicit or subjective.",
    whenToUse:
      "Use when quality is more than correctness, such as prioritization, completeness, or business usefulness.",
    examples: [
      {
        label: "Review quality bar",
        content:
          "# Success Criteria\n- Prioritize the top 5 issues by production risk.\n- Every finding includes impact and a fix.",
      },
      {
        label: "Writing target",
        content:
          "# Success Criteria\n- The summary fits on one screen.\n- Every recommendation is clear to a non-technical stakeholder.",
      },
    ],
    snippet:
      "# Success Criteria\n- [What a strong answer must include]\n- [What the output should optimize for]\n- [What \"done\" looks like]",
    color: "#0f766e",
    priority: "advanced",
  },
  {
    id: "assumptions",
    name: "Assumptions",
    patterns: [
      /^#{1,3}\s*(assumptions?|defaults?|working assumptions)/im,
      /^(assumptions?|defaults?|working assumptions)\s*[:]/im,
      /^<(assumptions?|defaults?|working_assumptions)>/im,
      /^\*\*\s*(assumptions?|defaults?)\s*[:]*\s*\*\*/im,
      /^(assume|make the following assumptions)\b/im,
    ],
    summary: "Sets the defaults so the model does not invent them.",
    explanation:
      "Assumptions reduce ambiguity by telling the model what to treat as true unless the input says otherwise.",
    whenToUse:
      "Use when the task depends on implied defaults such as tech stack, user sophistication, or business goals.",
    examples: [
      {
        label: "Product planning",
        content:
          "# Assumptions\n- The team has 2 engineers and 1 designer.\n- We are optimizing for a 6-week MVP, not a full platform.",
      },
      {
        label: "Communication",
        content:
          "# Assumptions\n- The reader understands common SaaS terms.\n- They have not seen this project before.",
      },
    ],
    snippet:
      "# Assumptions\n- [Default fact or condition]\n- [Default fact or condition]",
    color: "#06b6d4",
    priority: "advanced",
  },
  {
    id: "non_goals",
    name: "Non-Goals",
    patterns: [
      /^#{1,3}\s*(non.?goals?|out of scope|not in scope|anti.?goals?)/im,
      /^(non.?goals?|out of scope|not in scope|anti.?goals?)\s*[:]/im,
      /^<(non_goals?|out_of_scope|anti_goals?)>/im,
      /^\*\*\s*(non.?goals?|out of scope)\s*[:]*\s*\*\*/im,
      /^(out of scope|do not optimize for)\b/im,
    ],
    summary: "States what the model should avoid optimizing for.",
    explanation:
      "Non-goals keep the response focused by explicitly removing tempting but unhelpful directions.",
    whenToUse:
      "Use when the model might overreach, over-engineer, or wander into adjacent work you do not want.",
    examples: [
      {
        label: "Engineering scope",
        content:
          "# Non-Goals\n- Do not redesign the full architecture.\n- Do not propose a migration unless it is required to fix the bug.",
      },
      {
        label: "Content scope",
        content:
          "# Non-Goals\n- Do not add motivational language.\n- Do not turn this into a blog post.",
      },
    ],
    snippet:
      "# Non-Goals\n- [What this answer should not try to do]\n- [What is explicitly out of scope]",
    color: "#b45309",
    priority: "advanced",
  },
  {
    id: "clarifying_questions",
    name: "Clarifying Questions",
    patterns: [
      /^#{1,3}\s*(clarifying questions?|questions before answering|ask first|open questions?)/im,
      /^(clarifying questions?|questions before answering|ask first)\s*[:]/im,
      /^<(clarifying_questions?|questions_first|open_questions?)>/im,
      /^\*\*\s*(clarifying questions?|ask first)\s*[:]*\s*\*\*/im,
      /^(ask .*clarifying questions?|before answering, ask)\b/im,
    ],
    summary: "Lets the model ask for missing information before answering.",
    explanation:
      "This section is useful when the right answer depends on details the user may not have supplied yet.",
    whenToUse:
      "Use when incomplete context is common and a bad guess would be more costly than a short follow-up question.",
    examples: [
      {
        label: "Research setup",
        content:
          "# Clarifying Questions\nAsk up to 3 brief questions if the target market, budget, or timeline is missing.",
      },
      {
        label: "Code review",
        content:
          "# Clarifying Questions\nIf the diff is partial, ask for the affected files or the failing test before reviewing.",
      },
    ],
    snippet:
      "# Clarifying Questions\nAsk up to [number] concise questions before answering if critical context is missing.",
    color: "#2563eb",
    priority: "advanced",
  },
  {
    id: "workflow",
    name: "Workflow",
    patterns: [
      /^#{1,3}\s*(workflow|process|approach|steps|method|plan)/im,
      /^(workflow|process|approach|steps|method|plan)\s*[:]/im,
      /^<(workflow|process|approach|steps|method|plan)>/im,
      /^\*\*\s*(workflow|process|approach|steps|plan)\s*[:]*\s*\*\*/im,
      /^(follow this process|use the following steps)\b/im,
    ],
    summary: "Specifies the sequence of steps the model should follow.",
    explanation:
      "A workflow turns a vague request into an ordered procedure, which is especially helpful for complex or multi-part tasks.",
    whenToUse:
      "Use when the work benefits from a repeatable sequence such as analyze, decide, verify, and then answer.",
    examples: [
      {
        label: "Analysis flow",
        content:
          "# Workflow\n1. Summarize the input.\n2. Identify the key issue.\n3. Recommend the most practical next step.",
      },
      {
        label: "Review loop",
        content:
          "# Workflow\n1. Scan for correctness bugs.\n2. Check security and privacy risks.\n3. Verify the fix against the constraints.",
      },
    ],
    snippet:
      "# Workflow\n1. [Step one]\n2. [Step two]\n3. [Step three]",
    color: "#7c3aed",
    priority: "advanced",
  },
  {
    id: "evaluation_rubric",
    name: "Evaluation Rubric",
    patterns: [
      /^#{1,3}\s*(evaluation rubric|rubric|scoring|grading|quality checklist|review criteria)/im,
      /^(evaluation rubric|rubric|scoring|grading|quality checklist|review criteria)\s*[:]/im,
      /^<(evaluation_rubric|rubric|scoring|grading|quality_checklist|review_criteria)>/im,
      /^\*\*\s*(evaluation rubric|rubric|quality checklist)\s*[:]*\s*\*\*/im,
      /^(score|grade|evaluate) .*rubric\b/im,
    ],
    summary: "Gives the model a checklist for judging answer quality.",
    explanation:
      "Rubrics help the model self-check its work against explicit standards instead of stopping at the first plausible answer.",
    whenToUse:
      "Use when you want consistent tradeoffs across dimensions like accuracy, concision, coverage, and actionability.",
    examples: [
      {
        label: "Simple scoring",
        content:
          "# Evaluation Rubric\nScore the answer from 1-5 on clarity, correctness, and usefulness. Revise anything below 4.",
      },
      {
        label: "Checklist",
        content:
          "# Evaluation Rubric\nCheck for factual support, relevance to the task, and whether the output matches the requested format.",
      },
    ],
    snippet:
      "# Evaluation Rubric\nCheck the draft against: [criterion 1], [criterion 2], and [criterion 3] before finalizing.",
    color: "#059669",
    priority: "advanced",
  },
  {
    id: "sources",
    name: "Sources",
    patterns: [
      /^#{1,3}\s*(sources?|references?|citations?|evidence|materials)/im,
      /^(sources?|references?|citations?|evidence|materials)\s*[:]/im,
      /^<(sources?|references?|citations?|evidence|materials)>/im,
      /^\*\*\s*(sources?|references?|citations?)\s*[:]*\s*\*\*/im,
      /^(cite|reference|use only) .*sources?\b/im,
    ],
    summary: "Controls what evidence the model should rely on and how to cite it.",
    explanation:
      "A sources section is useful when evidence quality matters more than brainstorming speed or stylistic polish.",
    whenToUse:
      "Use for research, policy, legal, medical, or any task where unsupported claims are risky.",
    examples: [
      {
        label: "Primary sources only",
        content:
          "# Sources\nUse only official documentation, primary research papers, and the files provided in the prompt.",
      },
      {
        label: "Citation rule",
        content:
          "# Sources\nCite every factual claim with the source title or URL. If no source is available, say so explicitly.",
      },
    ],
    snippet:
      "# Sources\n- Use [allowed source types]\n- Cite [how citations should appear]\n- Do not rely on [disallowed source types]",
    color: "#0369a1",
    priority: "advanced",
  },
  {
    id: "fallback_behavior",
    name: "Fallback Behavior",
    patterns: [
      /^#{1,3}\s*(fallback behavior|fallback|if unsure|uncertainty handling|when uncertain|escalation)/im,
      /^(fallback behavior|fallback|if unsure|when uncertain|escalation)\s*[:]/im,
      /^<(fallback_behavior|fallback|uncertainty|escalation)>/im,
      /^\*\*\s*(fallback behavior|fallback|if unsure)\s*[:]*\s*\*\*/im,
      /^(if you are unsure|when uncertain|if the information is missing)\b/im,
    ],
    summary: "Tells the model what to do when confidence is low or data is missing.",
    explanation:
      "Fallback instructions reduce hallucinations by replacing guesswork with a defined recovery path.",
    whenToUse:
      "Use when incomplete inputs are common and you want the model to fail safely instead of fabricating details.",
    examples: [
      {
        label: "Need more context",
        content:
          '# Fallback Behavior\nIf the input does not support a confident answer, respond with "Need more context" and list the missing details.',
      },
      {
        label: "Safe default",
        content:
          "# Fallback Behavior\nWhen uncertain, give the most conservative recommendation and clearly label the assumption behind it.",
      },
    ],
    snippet:
      '# Fallback Behavior\nIf the information is incomplete or confidence is low, say "[fallback response]" and explain what is missing.',
    color: "#dc2626",
    priority: "advanced",
  },
  {
    id: "tone",
    name: "Tone",
    patterns: [
      /^#{1,3}\s*(tone|style|voice|writing style|communication style)/im,
      /^(tone|style|voice|writing style)\s*[:]/im,
      /^<(tone|style|voice)>/im,
      /^\*\*\s*(tone|style|voice)\s*[:]*\s*\*\*/im,
    ],
    summary: "Aligns the voice and writing style with the situation.",
    explanation:
      "Tone instructions help the response feel appropriate for the audience instead of sounding generic or mismatched.",
    whenToUse:
      "Use when the same content needs to land differently for executives, users, customers, or technical peers.",
    examples: [
      {
        label: "Professional",
        content:
          "Tone: Direct, professional, and concise. Avoid buzzwords and inflated claims.",
      },
      {
        label: "Supportive",
        content:
          "# Tone\nBe calm, empathetic, and practical. Keep the language simple and non-judgmental.",
      },
    ],
    snippet:
      "# Tone\n[Describe the desired voice, level of formality, and writing style.]",
    color: "#14b8a6",
    priority: "advanced",
  },
  {
    id: "audience",
    name: "Audience",
    patterns: [
      /^#{1,3}\s*(audience|target|reader|user|who this is for)/im,
      /^(audience|target|reader)\s*[:]/im,
      /^<(audience|target|reader)>/im,
      /^\*\*\s*(audience|target)\s*[:]*\s*\*\*/im,
      /^(this is for|written for|targeting)\b/im,
    ],
    summary: "Matches the depth and terminology to the reader.",
    explanation:
      "Audience guidance helps the model calibrate assumptions, detail level, and how much jargon it can safely use.",
    whenToUse:
      "Use when the reader's prior knowledge changes what counts as a good explanation.",
    examples: [
      {
        label: "Executive",
        content:
          "Audience: A VP of Product who wants the business impact first and only limited technical detail.",
      },
      {
        label: "Technical",
        content:
          "# Audience\nSenior backend engineers familiar with distributed systems but new to this codebase.",
      },
    ],
    snippet:
      "# Audience\n[Describe who will read the output and what they already know.]",
    color: "#0ea5e9",
    priority: "advanced",
  },
  {
    id: "edge_cases",
    name: "Edge Cases",
    patterns: [
      /^#{1,3}\s*(edge cases?|error handling|special cases?|exceptions?|corner cases?|what if)/im,
      /^(edge cases?|error handling|special cases?)\s*[:]/im,
      /^<(edge_cases?|error_handling|special_cases?)>/im,
      /^\*\*\s*(edge cases?|error handling)\s*[:]*\s*\*\*/im,
    ],
    summary: "Covers weird inputs, failure modes, and boundary conditions.",
    explanation:
      "Edge-case guidance pushes the model beyond the happy path so outputs are more robust and production-ready.",
    whenToUse:
      "Use for code, workflows, data pipelines, or decision rules where unusual inputs can break the result.",
    examples: [
      {
        label: "Parsing",
        content:
          "# Edge Cases\n- What if the input is empty?\n- What if the JSON is invalid?\n- What if a required field is missing?",
      },
      {
        label: "Operations",
        content:
          "# Edge Cases\n- Handle timeouts and rate limits.\n- Explain what to do if an upstream service is unavailable.",
      },
    ],
    snippet:
      "# Edge Cases\n- What if [scenario 1]?\n- What if [scenario 2]?\n- How should failures be handled?",
    color: "#f97316",
    priority: "advanced",
  },
  {
    id: "chain_of_thought",
    name: "Reasoning",
    patterns: [
      /^#{1,3}\s*(chain of thought|reasoning|think step|step.?by.?step|thought process|thinking)/im,
      /^(chain of thought|reasoning|think step by step)\s*[:]/im,
      /^<(chain_of_thought|reasoning|thinking|scratchpad)>/im,
      /^\*\*\s*(chain of thought|reasoning|step.?by.?step)\s*[:]*\s*\*\*/im,
      /^(think|reason|let'?s think)\s*(step by step|through this|carefully|about)/im,
    ],
    summary: "Breaks complex work into explicit reasoning steps or checks.",
    explanation:
      "Reasoning guidance helps on multi-step tasks by making the process explicit instead of relying on the model to choose one silently.",
    whenToUse:
      "Use for planning, debugging, analysis, and other tasks where step order or verification matters.",
    examples: [
      {
        label: "Checklist first",
        content:
          "# Reasoning\nBefore the final answer, list the steps you will take and verify the result against the constraints.",
      },
      {
        label: "Decision trail",
        content:
          "# Reasoning\nExplain the tradeoffs briefly, then give the recommendation and the strongest reason behind it.",
      },
    ],
    snippet:
      "# Reasoning\nBreak the work into clear steps, then verify the answer against the task and constraints before finalizing.",
    color: "#a855f7",
    priority: "advanced",
  },
] as const;

const SECTION_DEFINITION_MAP = new Map<SectionId, SectionDefinition>(
  SECTION_DEFINITIONS.map((section) => [section.id, section])
);

function matchesSectionPatterns(
  patterns: readonly RegExp[],
  candidate: string
): boolean {
  return patterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(candidate);
  });
}

export function findMatchingSectionDefinition(
  candidate: string
): SectionDefinition | null {
  const normalizedCandidate = candidate.trim();
  if (!normalizedCandidate) return null;

  for (const definition of SECTION_DEFINITIONS) {
    if (matchesSectionPatterns(definition.patterns, normalizedCandidate)) {
      return definition;
    }
  }

  return null;
}

export function findMatchingSectionHeading(
  headingText: string
): SectionDefinition | null {
  const normalizedHeading = headingText.trim();
  if (!normalizedHeading) return null;

  const candidates = [
    `# ${normalizedHeading}`,
    `## ${normalizedHeading}`,
    `### ${normalizedHeading}`,
    normalizedHeading,
  ];

  for (const candidate of candidates) {
    const definition = findMatchingSectionDefinition(candidate);
    if (definition) {
      return definition;
    }
  }

  return null;
}

export function getUnusedSections(
  detectedIds: ReadonlySet<SectionId>
): SectionDefinition[] {
  return SECTION_DEFINITIONS.filter((section) => !detectedIds.has(section.id));
}

export function getSectionDefinitionById(
  sectionId: SectionId
): SectionDefinition | null {
  return SECTION_DEFINITION_MAP.get(sectionId) ?? null;
}

export function getSectionCoverage(
  detectedIds: ReadonlySet<SectionId>
): SectionCoverage {
  let coreTotal = 0;
  let coreDetected = 0;
  let advancedTotal = 0;
  let advancedDetected = 0;

  for (const section of SECTION_DEFINITIONS) {
    if (section.priority === "core") {
      coreTotal += 1;
      if (detectedIds.has(section.id)) {
        coreDetected += 1;
      }
      continue;
    }

    advancedTotal += 1;
    if (detectedIds.has(section.id)) {
      advancedDetected += 1;
    }
  }

  return {
    coreDetected,
    coreTotal,
    advancedDetected,
    advancedTotal,
    totalDetected: coreDetected + advancedDetected,
    totalAvailable: SECTION_DEFINITIONS.length,
    corePercent: coreTotal === 0 ? 0 : Math.round((coreDetected / coreTotal) * 100),
  };
}
