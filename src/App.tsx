import { useState, useMemo, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { detectSectionIds, detectSections } from "./detectSections";
import {
  getUnusedSections,
  type SectionDefinition,
} from "./sectionData";
import {
  EXAMPLE_PROMPT,
  appendSectionSnippet,
  getSectionSnippet,
} from "./promptTemplates";
import PromptEditor from "./components/PromptEditor";
import type { CodeEditorController } from "./components/CodeEditorView";
import RecommendationPills from "./components/RecommendationPills";
import ScoreBar from "./components/ScoreBar";
import TextFormattingToolbar from "./components/TextFormattingToolbar";
import "./App.css";

export default function App() {
  const [text, setText] = useState("");
  const [view, setView] = useState<"code" | "wysiwyg">("wysiwyg");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [codeEditor, setCodeEditor] = useState<CodeEditorController | null>(
    null
  );
  const [codeRevision, setCodeRevision] = useState(0);

  const sections = useMemo(() => detectSections(text), [text]);
  const detectedIds = useMemo(() => detectSectionIds(text), [text]);
  const unused = useMemo(() => getUnusedSections(detectedIds), [detectedIds]);

  const keepViewportStable = useCallback(() => {
    const scrollTop = window.scrollY;
    let attempts = 0;
    const maxAttempts = 4;

    const restoreScroll = () => {
      window.scrollTo({ top: scrollTop });
      attempts += 1;
      if (attempts < maxAttempts) {
        requestAnimationFrame(restoreScroll);
      }
    };

    requestAnimationFrame(restoreScroll);
  }, []);

  const scrollPageToBottom = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 6;

    const scrollToBottom = () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
      });
      attempts += 1;
      if (attempts < maxAttempts) {
        requestAnimationFrame(scrollToBottom);
      }
    };

    requestAnimationFrame(scrollToBottom);
  }, []);

  const handleInsert = useCallback(
    (section: SectionDefinition) => {
      const snippet = getSectionSnippet(section);
      setText((prev) => appendSectionSnippet(prev, snippet));
      scrollPageToBottom();
    },
    [scrollPageToBottom]
  );

  const handleToggleView = useCallback(() => {
    keepViewportStable();
    setView((prev) => (prev === "code" ? "wysiwyg" : "code"));
  }, [keepViewportStable]);

  const handleUseExample = useCallback(() => {
    const confirmed = window.confirm(
      "Replace current content with the example prompt?"
    );
    if (!confirmed) return;
    keepViewportStable();
    setText(EXAMPLE_PROMPT);
  }, [keepViewportStable]);

  const handleCodeSelectionChange = useCallback(() => {
    setCodeRevision((revision) => revision + 1);
  }, []);

  const toggleLabel =
    view === "code"
      ? "Switch to Formatted View"
      : "Switch to Source View";

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top-row">
          <div className="header-left">
            <h1>
              <span className="logo-icon">&gt;_</span> Prompt Tester
            </h1>
            <span className="tagline">
              Build clearer prompts.
            </span>
          </div>
          <ScoreBar detectedIds={detectedIds} />
        </div>
        <RecommendationPills unusedSections={unused} onInsert={handleInsert} />
        <div className="editor-mode-bar affix-toggle-bar">
          <button
            type="button"
            className="mode-toggle-btn example-toggle-btn"
            onClick={handleUseExample}
            aria-label="See example"
          >
            See Example
          </button>
          <button
            type="button"
            className="mode-toggle-btn"
            onClick={handleToggleView}
            aria-label={toggleLabel}
          >
            {toggleLabel}
          </button>
        </div>
        <TextFormattingToolbar
          editor={editor}
          codeEditor={codeEditor}
          codeRevision={codeRevision}
          view={view}
        />
      </header>

      <main className="app-main">
        <PromptEditor
          value={text}
          onChange={setText}
          sections={sections}
          view={view}
          onEditorChange={setEditor}
          onCodeEditorChange={setCodeEditor}
          onCodeSelectionChange={handleCodeSelectionChange}
        />
      </main>
    </div>
  );
}
