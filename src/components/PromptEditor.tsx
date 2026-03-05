import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import type { DetectedSection } from "../detectSections";
import {
  getSectionDefinitionById,
  type SectionDefinition,
} from "../sectionData";
import CodeEditorView, { type CodeEditorController } from "./CodeEditorView";
import SectionPopup from "./SectionPopup";
import {
  SectionDecorationExtension,
  WYSIWYG_SECTION_BADGE_CLICK_EVENT,
  type WysiwygSectionBadgeClickDetail,
} from "./SectionDecorationExtension";

interface PromptEditorProps {
  value: string;
  onChange: (val: string) => void;
  sections: DetectedSection[];
  view: "code" | "wysiwyg";
  onEditorChange?: (editor: Editor | null) => void;
  onCodeEditorChange?: (controller: CodeEditorController | null) => void;
  onCodeSelectionChange?: () => void;
}

const EDITOR_PLACEHOLDER =
  "Paste a prompt here, or click See Example to start.";

function getEditorMarkdown(editor: Editor | null): string {
  if (!editor) return "";

  const markdownStorage = (editor.storage as {
    markdown?: { getMarkdown?: () => string };
  }).markdown;
  if (markdownStorage?.getMarkdown) {
    return markdownStorage.getMarkdown();
  }

  return editor.getText();
}

export default function PromptEditor({
  value,
  onChange,
  sections,
  view,
  onEditorChange,
  onCodeEditorChange,
  onCodeSelectionChange,
}: PromptEditorProps) {
  const isEmpty = value.trim().length === 0;
  const [popup, setPopup] = useState<{
    section: SectionDefinition;
    rect: DOMRect;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      SectionDecorationExtension,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "wysiwyg-content",
        spellcheck: "false",
      },
    },
    onUpdate({ editor }) {
      onChange(getEditorMarkdown(editor));
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentMarkdown = getEditorMarkdown(editor);
    if (value !== currentMarkdown) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (view !== "wysiwyg" || !editor) return;

    const currentMarkdown = getEditorMarkdown(editor);
    if (value !== currentMarkdown) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value, view]);

  useEffect(() => {
    onEditorChange?.(editor);

    return () => {
      onEditorChange?.(null);
    };
  }, [editor, onEditorChange]);

  useEffect(() => {
    function handleBadgeClick(event: Event) {
      const { detail } = event as CustomEvent<WysiwygSectionBadgeClickDetail>;
      const section = getSectionDefinitionById(detail.sectionId);
      if (!section) return;

      setPopup({
        section,
        rect: detail.rect,
      });
    }

    window.addEventListener(
      WYSIWYG_SECTION_BADGE_CLICK_EVENT,
      handleBadgeClick as EventListener
    );

    return () => {
      window.removeEventListener(
        WYSIWYG_SECTION_BADGE_CLICK_EVENT,
        handleBadgeClick as EventListener
      );
    };
  }, []);

  return (
    <div className="editor-container">
      {view === "code" && (
        <CodeEditorView
          value={value}
          onChange={onChange}
          sections={sections}
          placeholder={EDITOR_PLACEHOLDER}
          onControllerChange={onCodeEditorChange}
          onSelectionChange={onCodeSelectionChange}
        />
      )}

      {view === "wysiwyg" && (
        <div className="wysiwyg-wrapper">
          <div className="wysiwyg-editor-area">
            {isEmpty && (
              <div className="wysiwyg-placeholder" aria-hidden="true">
                {EDITOR_PLACEHOLDER}
              </div>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {view === "wysiwyg" && popup && (
        <SectionPopup
          section={popup.section}
          anchorRect={popup.rect}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
