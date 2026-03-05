import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { CodeEditorController } from "./CodeEditorView";
import {
  FORMATTING_ACTIONS,
  canRunEditorFormatting,
  isEditorFormattingActive,
  runEditorFormatting,
} from "../textFormatting";

interface TextFormattingToolbarProps {
  editor: Editor | null;
  codeEditor: CodeEditorController | null;
  codeRevision: number;
  view: "code" | "wysiwyg";
}

export default function TextFormattingToolbar({
  editor,
  codeEditor,
  codeRevision,
  view,
}: TextFormattingToolbarProps) {
  const [, setEditorRevision] = useState(0);
  const codeSelectionVersion = view === "code" ? codeRevision : 0;

  const preserveViewportPosition = useCallback((action: () => void) => {
    const scrollTop = window.scrollY;
    let attempts = 0;
    const maxAttempts = 4;

    action();

    const restoreScroll = () => {
      window.scrollTo({ top: scrollTop });
      attempts += 1;
      if (attempts < maxAttempts) {
        requestAnimationFrame(restoreScroll);
      }
    };

    requestAnimationFrame(restoreScroll);
  }, []);

  useEffect(() => {
    if (!editor) return;

    const updateToolbar = () => {
      setEditorRevision((revision) => revision + 1);
    };

    updateToolbar();
    editor.on("selectionUpdate", updateToolbar);
    editor.on("transaction", updateToolbar);
    editor.on("focus", updateToolbar);
    editor.on("blur", updateToolbar);

    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("transaction", updateToolbar);
      editor.off("focus", updateToolbar);
      editor.off("blur", updateToolbar);
    };
  }, [editor]);

  return (
    <div className="format-toolbar">
      <div className="format-toolbar-header">
        <span className="format-toolbar-title">Formatting</span>
      </div>
      <div
        className="format-toolbar-actions"
        role="toolbar"
        aria-label="Text formatting controls"
        data-selection-version={codeSelectionVersion}
      >
        {FORMATTING_ACTIONS.map((action) => {
          const isCodeMode = view === "code";
          const isActive = isCodeMode
            ? codeEditor?.isFormattingActive(action.id) ?? false
            : editor
              ? isEditorFormattingActive(editor, action.id)
              : false;
          const canRun = isCodeMode
            ? codeEditor?.canApplyFormatting() ?? false
            : editor
              ? canRunEditorFormatting(editor, action.id)
              : false;

          return (
            <button
              key={action.id}
              type="button"
              className={`format-btn${isActive ? " is-active" : ""}`}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={() => {
                preserveViewportPosition(() => {
                  if (isCodeMode) {
                    codeEditor?.applyFormatting(action.id);
                    return;
                  }

                  if (!editor) return;
                  runEditorFormatting(editor, action.id);
                });
              }}
              disabled={!canRun}
              aria-pressed={isActive}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
