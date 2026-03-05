import type { Editor } from "@tiptap/react";

export const FORMATTING_ACTIONS = [
  { id: "bold", label: "Bold" },
  { id: "italic", label: "Italic" },
  { id: "heading-1", label: "H1" },
  { id: "heading-2", label: "H2" },
  { id: "bullet-list", label: "Bullets" },
  { id: "ordered-list", label: "Numbered" },
  { id: "blockquote", label: "Quote" },
  { id: "code-block", label: "Code" },
] as const;

export type FormattingActionId = (typeof FORMATTING_ACTIONS)[number]["id"];

export interface CodeSelectionState {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export type CodeFormatResult = CodeSelectionState;

interface LineRange {
  start: number;
  end: number;
  block: string;
}

function replaceRange(
  text: string,
  start: number,
  end: number,
  replacement: string
): string {
  return `${text.slice(0, start)}${replacement}${text.slice(end)}`;
}

function clampSelection(
  text: string,
  selectionStart: number,
  selectionEnd: number
): CodeSelectionState {
  const maxIndex = text.length;
  const start = Math.max(0, Math.min(selectionStart, maxIndex));
  const end = Math.max(start, Math.min(selectionEnd, maxIndex));

  return { text, selectionStart: start, selectionEnd: end };
}

function getSelectedLineRange(
  text: string,
  selectionStart: number,
  selectionEnd: number
): LineRange {
  const start = text.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const nextNewline = text.indexOf("\n", selectionEnd);
  const end = nextNewline === -1 ? text.length : nextNewline;

  return {
    start,
    end,
    block: text.slice(start, end),
  };
}

function applyInlineMarker(
  state: CodeSelectionState,
  marker: string
): CodeFormatResult {
  const { text, selectionStart, selectionEnd } = state;

  if (selectionStart === selectionEnd) {
    const insertion = `${marker}${marker}`;
    const nextText = replaceRange(text, selectionStart, selectionEnd, insertion);
    const nextCursor = selectionStart + marker.length;

    return {
      text: nextText,
      selectionStart: nextCursor,
      selectionEnd: nextCursor,
    };
  }

  const hasSurroundingMarkers =
    selectionStart >= marker.length &&
    text.slice(selectionStart - marker.length, selectionStart) === marker &&
    text.slice(selectionEnd, selectionEnd + marker.length) === marker;

  if (hasSurroundingMarkers) {
    const before = text.slice(0, selectionStart - marker.length);
    const selected = text.slice(selectionStart, selectionEnd);
    const after = text.slice(selectionEnd + marker.length);
    const nextText = `${before}${selected}${after}`;

    return {
      text: nextText,
      selectionStart: selectionStart - marker.length,
      selectionEnd: selectionEnd - marker.length,
    };
  }

  const selected = text.slice(selectionStart, selectionEnd);
  const wrapped = `${marker}${selected}${marker}`;
  const nextText = replaceRange(text, selectionStart, selectionEnd, wrapped);

  return {
    text: nextText,
    selectionStart: selectionStart + marker.length,
    selectionEnd: selectionEnd + marker.length,
  };
}

function transformSelectedLines(
  state: CodeSelectionState,
  transform: (lines: string[]) => string[]
): CodeFormatResult {
  const range = getSelectedLineRange(
    state.text,
    state.selectionStart,
    state.selectionEnd
  );
  const nextBlock = transform(range.block.split("\n")).join("\n");
  const nextText = replaceRange(state.text, range.start, range.end, nextBlock);

  return {
    text: nextText,
    selectionStart: range.start,
    selectionEnd: range.start + nextBlock.length,
  };
}

function toggleHeading(
  state: CodeSelectionState,
  level: 1 | 2
): CodeFormatResult {
  const headingPattern = new RegExp(`^#{${level}}\\s+`);

  return transformSelectedLines(state, (lines) => {
    const nonBlankLines = lines.filter((line) => line.trim().length > 0);
    const allMatch =
      nonBlankLines.length > 0 &&
      nonBlankLines.every((line) => headingPattern.test(line));

    return lines.map((line) => {
      if (!line.trim()) return line;

      const stripped = line.replace(/^#{1,6}\s+/, "");
      return allMatch ? stripped : `${"#".repeat(level)} ${stripped}`;
    });
  });
}

function toggleBulletList(state: CodeSelectionState): CodeFormatResult {
  const bulletPattern = /^(\s*)-\s+/;

  return transformSelectedLines(state, (lines) => {
    const nonBlankLines = lines.filter((line) => line.trim().length > 0);
    const allBullets =
      nonBlankLines.length > 0 &&
      nonBlankLines.every((line) => bulletPattern.test(line));

    return lines.map((line) => {
      if (!line.trim()) return line;

      if (allBullets) {
        return line.replace(bulletPattern, "$1");
      }

      const [, indent = "", content = line.trim()] =
        line.match(/^(\s*)(.*)$/) ?? [];
      const normalizedContent = content.replace(
        /^(-\s+|\d+\.\s+|>\s+|#{1,6}\s+)/,
        ""
      );

      return `${indent}- ${normalizedContent}`;
    });
  });
}

function toggleOrderedList(state: CodeSelectionState): CodeFormatResult {
  const orderedPattern = /^(\s*)\d+\.\s+/;

  return transformSelectedLines(state, (lines) => {
    const nonBlankLines = lines.filter((line) => line.trim().length > 0);
    const allOrdered =
      nonBlankLines.length > 0 &&
      nonBlankLines.every((line) => orderedPattern.test(line));

    let itemNumber = 1;

    return lines.map((line) => {
      if (!line.trim()) return line;

      if (allOrdered) {
        return line.replace(orderedPattern, "$1");
      }

      const [, indent = "", content = line.trim()] =
        line.match(/^(\s*)(.*)$/) ?? [];
      const normalizedContent = content.replace(
        /^(-\s+|\d+\.\s+|>\s+|#{1,6}\s+)/,
        ""
      );
      const formatted = `${indent}${itemNumber}. ${normalizedContent}`;
      itemNumber += 1;
      return formatted;
    });
  });
}

function toggleBlockquote(state: CodeSelectionState): CodeFormatResult {
  const blockquotePattern = /^(\s*)>\s+/;

  return transformSelectedLines(state, (lines) => {
    const nonBlankLines = lines.filter((line) => line.trim().length > 0);
    const allQuoted =
      nonBlankLines.length > 0 &&
      nonBlankLines.every((line) => blockquotePattern.test(line));

    return lines.map((line) => {
      if (!line.trim()) return line;

      if (allQuoted) {
        return line.replace(blockquotePattern, "$1");
      }

      const [, indent = "", content = line.trim()] =
        line.match(/^(\s*)(.*)$/) ?? [];
      const normalizedContent = content.replace(/^>\s+/, "");
      return `${indent}> ${normalizedContent}`;
    });
  });
}

function toggleCodeBlock(state: CodeSelectionState): CodeFormatResult {
  const range = getSelectedLineRange(
    state.text,
    state.selectionStart,
    state.selectionEnd
  );
  const trimmedBlock = range.block.trim();
  const fencedPattern = /^```[^\n]*\n[\s\S]*\n```$/;

  if (state.selectionStart === state.selectionEnd && !trimmedBlock) {
    const insertion = "```\n\n```";
    const nextText = replaceRange(
      state.text,
      state.selectionStart,
      state.selectionEnd,
      insertion
    );
    const nextCursor = state.selectionStart + 4;

    return {
      text: nextText,
      selectionStart: nextCursor,
      selectionEnd: nextCursor,
    };
  }

  if (fencedPattern.test(trimmedBlock)) {
    const unfenced = trimmedBlock
      .replace(/^```[^\n]*\n/, "")
      .replace(/\n```$/, "");
    const nextText = replaceRange(state.text, range.start, range.end, unfenced);

    return {
      text: nextText,
      selectionStart: range.start,
      selectionEnd: range.start + unfenced.length,
    };
  }

  const blockContent = range.block || "";
  const fencedContent = `\`\`\`\n${blockContent}\n\`\`\``;
  const nextText = replaceRange(state.text, range.start, range.end, fencedContent);

  return {
    text: nextText,
    selectionStart: range.start + 4,
    selectionEnd: range.start + 4 + blockContent.length,
  };
}

function isInlineMarkerActive(
  state: CodeSelectionState,
  marker: string
): boolean {
  const { text, selectionStart, selectionEnd } = state;
  if (selectionStart === selectionEnd) return false;

  return (
    selectionStart >= marker.length &&
    text.slice(selectionStart - marker.length, selectionStart) === marker &&
    text.slice(selectionEnd, selectionEnd + marker.length) === marker
  );
}

function areSelectedLinesMatching(
  state: CodeSelectionState,
  pattern: RegExp
): boolean {
  const lines = getSelectedLineRange(
    state.text,
    state.selectionStart,
    state.selectionEnd
  ).block.split("\n");
  const nonBlankLines = lines.filter((line) => line.trim().length > 0);

  return (
    nonBlankLines.length > 0 &&
    nonBlankLines.every((line) => pattern.test(line))
  );
}

export function canRunEditorFormatting(
  editor: Editor,
  actionId: FormattingActionId
): boolean {
  switch (actionId) {
    case "bold":
      return editor
        .can()
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleBold()
        .run();
    case "italic":
      return editor
        .can()
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleItalic()
        .run();
    case "heading-1":
      return editor
        .can()
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleHeading({ level: 1 })
        .run();
    case "heading-2":
      return editor
        .can()
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleHeading({ level: 2 })
        .run();
    case "bullet-list":
      return editor
        .can()
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleBulletList()
        .run();
    case "ordered-list":
      return editor
        .can()
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleOrderedList()
        .run();
    case "blockquote":
      return editor
        .can()
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleBlockquote()
        .run();
    case "code-block":
      return editor
        .can()
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleCodeBlock()
        .run();
  }
}

export function runEditorFormatting(
  editor: Editor,
  actionId: FormattingActionId
): void {
  switch (actionId) {
    case "bold":
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleBold()
        .run();
      return;
    case "italic":
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleItalic()
        .run();
      return;
    case "heading-1":
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleHeading({ level: 1 })
        .run();
      return;
    case "heading-2":
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleHeading({ level: 2 })
        .run();
      return;
    case "bullet-list":
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleBulletList()
        .run();
      return;
    case "ordered-list":
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleOrderedList()
        .run();
      return;
    case "blockquote":
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleBlockquote()
        .run();
      return;
    case "code-block":
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .toggleCodeBlock()
        .run();
      return;
  }
}

export function isEditorFormattingActive(
  editor: Editor,
  actionId: FormattingActionId
): boolean {
  switch (actionId) {
    case "bold":
      return editor.isActive("bold");
    case "italic":
      return editor.isActive("italic");
    case "heading-1":
      return editor.isActive("heading", { level: 1 });
    case "heading-2":
      return editor.isActive("heading", { level: 2 });
    case "bullet-list":
      return editor.isActive("bulletList");
    case "ordered-list":
      return editor.isActive("orderedList");
    case "blockquote":
      return editor.isActive("blockquote");
    case "code-block":
      return editor.isActive("codeBlock");
  }
}

export function applyCodeFormatting(
  state: CodeSelectionState,
  actionId: FormattingActionId
): CodeFormatResult {
  const normalizedState = clampSelection(
    state.text,
    state.selectionStart,
    state.selectionEnd
  );

  switch (actionId) {
    case "bold":
      return applyInlineMarker(normalizedState, "**");
    case "italic":
      return applyInlineMarker(normalizedState, "*");
    case "heading-1":
      return toggleHeading(normalizedState, 1);
    case "heading-2":
      return toggleHeading(normalizedState, 2);
    case "bullet-list":
      return toggleBulletList(normalizedState);
    case "ordered-list":
      return toggleOrderedList(normalizedState);
    case "blockquote":
      return toggleBlockquote(normalizedState);
    case "code-block":
      return toggleCodeBlock(normalizedState);
  }
}

export function isCodeFormattingActive(
  state: CodeSelectionState,
  actionId: FormattingActionId
): boolean {
  const normalizedState = clampSelection(
    state.text,
    state.selectionStart,
    state.selectionEnd
  );

  switch (actionId) {
    case "bold":
      return isInlineMarkerActive(normalizedState, "**");
    case "italic":
      return isInlineMarkerActive(normalizedState, "*");
    case "heading-1":
      return areSelectedLinesMatching(normalizedState, /^#\s+/);
    case "heading-2":
      return areSelectedLinesMatching(normalizedState, /^##\s+/);
    case "bullet-list":
      return areSelectedLinesMatching(normalizedState, /^(\s*)-\s+/);
    case "ordered-list":
      return areSelectedLinesMatching(normalizedState, /^(\s*)\d+\.\s+/);
    case "blockquote":
      return areSelectedLinesMatching(normalizedState, /^(\s*)>\s+/);
    case "code-block":
      return /^```[^\n]*\n[\s\S]*\n```$/.test(
        getSelectedLineRange(
          normalizedState.text,
          normalizedState.selectionStart,
          normalizedState.selectionEnd
        ).block.trim()
      );
  }
}
