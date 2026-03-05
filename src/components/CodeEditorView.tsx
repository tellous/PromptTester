import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { DetectedSection } from "../detectSections";
import type { SectionDefinition } from "../sectionData";
import SectionPopup from "./SectionPopup";
import {
  applyCodeFormatting,
  isCodeFormattingActive,
  type CodeSelectionState,
  type FormattingActionId,
} from "../textFormatting";

interface CodeEditorViewProps {
  value: string;
  onChange: (value: string) => void;
  sections: DetectedSection[];
  placeholder: string;
  onControllerChange?: (controller: CodeEditorController | null) => void;
  onSelectionChange?: () => void;
}

interface PopupState {
  section: SectionDefinition;
  rect: DOMRect;
}

export interface CodeEditorController {
  applyFormatting: (actionId: FormattingActionId) => void;
  isFormattingActive: (actionId: FormattingActionId) => boolean;
  canApplyFormatting: () => boolean;
}

export default function CodeEditorView({
  value,
  onChange,
  sections,
  placeholder,
  onControllerChange,
  onSelectionChange,
}: CodeEditorViewProps) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelectionRef = useRef<Pick<
    CodeSelectionState,
    "selectionStart" | "selectionEnd"
  > | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "1px";
    textarea.style.height = `${textarea.scrollHeight}px`;

    const pendingSelection = pendingSelectionRef.current;
    if (pendingSelection) {
      const scrollTop = window.scrollY;
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(
        pendingSelection.selectionStart,
        pendingSelection.selectionEnd
      );
      pendingSelectionRef.current = null;
      window.scrollTo({ top: scrollTop });
      onSelectionChange?.();
    }
  }, [onSelectionChange, value]);

  const lines = useMemo(() => value.split("\n"), [value]);
  const lineToSection = useMemo(() => {
    const sectionMap = new Map<number, DetectedSection>();
    for (const section of sections) {
      sectionMap.set(section.startLine, section);
    }
    return sectionMap;
  }, [sections]);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, []);

  const getSelectionState = useCallback((): CodeSelectionState => {
    const textarea = textareaRef.current;
    return {
      text: valueRef.current,
      selectionStart: textarea?.selectionStart ?? 0,
      selectionEnd: textarea?.selectionEnd ?? 0,
    };
  }, []);

  const notifySelectionChange = useCallback(() => {
    onSelectionChange?.();
  }, [onSelectionChange]);

  const handleTextareaChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      if (popup) {
        closePopup();
      }
      onChangeRef.current(event.target.value);
      notifySelectionChange();
    },
    [closePopup, notifySelectionChange, popup]
  );

  const handleBadgeClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>, section: SectionDefinition) => {
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      setPopup({ section, rect });
    },
    []
  );

  const applyFormatting = useCallback(
    (actionId: FormattingActionId) => {
      const result = applyCodeFormatting(getSelectionState(), actionId);
      pendingSelectionRef.current = {
        selectionStart: result.selectionStart,
        selectionEnd: result.selectionEnd,
      };

      if (popup) {
        closePopup();
      }

      onChangeRef.current(result.text);
    },
    [closePopup, getSelectionState, popup]
  );

  const controller = useMemo<CodeEditorController>(
    () => ({
      applyFormatting,
      isFormattingActive: (actionId) =>
        isCodeFormattingActive(getSelectionState(), actionId),
      canApplyFormatting: () => Boolean(textareaRef.current),
    }),
    [applyFormatting, getSelectionState]
  );

  useEffect(() => {
    onControllerChange?.(controller);

    return () => {
      onControllerChange?.(null);
    };
  }, [controller, onControllerChange]);

  function renderBackdrop() {
    const elements: ReactNode[] = [];
    let lineIndex = 0;

    while (lineIndex < lines.length) {
      const section = lineToSection.get(lineIndex);
      if (section) {
        const sectionLines = lines.slice(section.startLine, section.endLine + 1);
        elements.push(
          <div
            key={`bd-${lineIndex}`}
            className="section-highlight"
            style={{
              borderColor: section.definition.color,
              background: `${section.definition.color}0a`,
            }}
          >
            {sectionLines.map((line, sectionLineIndex) => (
              <div key={sectionLineIndex} className="overlay-line">
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        );
        lineIndex = section.endLine + 1;
        continue;
      }

      elements.push(
        <div key={`bd-l-${lineIndex}`} className="overlay-line">
          {lines[lineIndex] || "\u00A0"}
        </div>
      );
      lineIndex += 1;
    }

    return elements;
  }

  function renderBadges() {
    const elements: ReactNode[] = [];
    let lineIndex = 0;

    while (lineIndex < lines.length) {
      const section = lineToSection.get(lineIndex);
      if (section) {
        const sectionLines = lines.slice(section.startLine, section.endLine + 1);
        elements.push(
          <div key={`bz-${lineIndex}`} className="section-badge-zone">
            <span
              className="section-label"
              style={{ background: section.definition.color }}
              onClick={(event) => handleBadgeClick(event, section.definition)}
            >
              {section.definition.name}
            </span>
            {sectionLines.map((line, sectionLineIndex) => (
              <div key={sectionLineIndex} className="overlay-line">
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        );
        lineIndex = section.endLine + 1;
        continue;
      }

      elements.push(
        <div key={`bz-l-${lineIndex}`} className="overlay-line">
          {lines[lineIndex] || "\u00A0"}
        </div>
      );
      lineIndex += 1;
    }

    return elements;
  }

  return (
    <>
      <div className="editor-wrapper">
        <div className="editor-backdrop" aria-hidden="true">
          {renderBackdrop()}
        </div>
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={value}
          onChange={handleTextareaChange}
          onSelect={notifySelectionChange}
          onKeyUp={notifySelectionChange}
          onClick={notifySelectionChange}
          onFocus={notifySelectionChange}
          onBlur={notifySelectionChange}
          placeholder={placeholder}
          spellCheck={false}
        />
        <div className="editor-overlay" aria-hidden="true">
          {renderBadges()}
        </div>
      </div>

      {popup && (
        <SectionPopup
          section={popup.section}
          anchorRect={popup.rect}
          onClose={closePopup}
        />
      )}
    </>
  );
}
