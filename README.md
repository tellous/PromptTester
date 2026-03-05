# Prompt Tester

Prompt Tester is a React + TypeScript app for analyzing prompt structure.
It detects common prompt sections (Role, Context, Task, Constraints, etc.), visualizes coverage, and suggests missing sections.

## Run Locally

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run lint
```

## How It Works

1. `App.tsx` stores the current prompt text.
2. `detectSections.ts` scans the text and maps each detected section to line ranges.
3. UI components render score, editor highlights, and suggested missing sections.
4. Clicking a recommendation inserts a starter snippet for that section.

## Component Purpose

### Core Components (used in `App.tsx`)

| File | Purpose |
| --- | --- |
| `src/components/PromptEditor.tsx` | Main editor UI. Supports Code and WYSIWYG modes, renders section highlights and badges, and opens section help popups. |
| `src/components/ScoreBar.tsx` | Shows prompt coverage score (`detected / total` sections) and quality label. |
| `src/components/RecommendationPills.tsx` | Shows missing sections as clickable pills and inserts section templates through `onInsert`. |
| `src/components/SectionPopup.tsx` | Displays section explanation and tip when a section badge is clicked. |

### Editor Support Components

| File | Purpose |
| --- | --- |
| `src/components/SectionDecorationExtension.ts` | TipTap/ProseMirror extension that applies section block decorations and badges in WYSIWYG mode. |

## Non-Component Modules

| File | Purpose |
| --- | --- |
| `src/sectionData.ts` | Source of truth for section definitions, regex patterns, colors, explanations, and tips. |
| `src/detectSections.ts` | Section detection logic and helper for detected section IDs. |

## Styling

| File | Purpose |
| --- | --- |
| `src/App.css` | Main app styles (layout, editor layers, popup, score bar, pills, WYSIWYG visuals). |
| `src/index.css` | Global/base styles. |
