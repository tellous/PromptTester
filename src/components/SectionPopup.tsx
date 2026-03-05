import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type { SectionDefinition } from "../sectionData";

interface SectionPopupProps {
  section: SectionDefinition;
  anchorRect: DOMRect;
  onClose: () => void;
}

interface PopupPosition {
  top: number;
  left: number;
}

const POPUP_MARGIN = 12;
const POPUP_GAP = 8;
const DEFAULT_POPUP_WIDTH = 380;

function resolvePopupPosition(
  anchorRect: DOMRect,
  popupWidth: number,
  popupHeight: number
): PopupPosition {
  const left = Math.max(
    POPUP_MARGIN,
    Math.min(
      anchorRect.left,
      window.innerWidth - popupWidth - POPUP_MARGIN
    )
  );

  let top = anchorRect.bottom + POPUP_GAP;
  if (top + popupHeight > window.innerHeight - POPUP_MARGIN) {
    const aboveTop = anchorRect.top - popupHeight - POPUP_GAP;
    if (aboveTop >= POPUP_MARGIN) {
      top = aboveTop;
    } else {
      top = Math.max(
        POPUP_MARGIN,
        window.innerHeight - popupHeight - POPUP_MARGIN
      );
    }
  }

  return { top, left };
}

export default function SectionPopup({
  section,
  anchorRect,
  onClose,
}: SectionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const descriptionId = useId();

  const initialPosition = useMemo(
    () => resolvePopupPosition(anchorRect, DEFAULT_POPUP_WIDTH, 0),
    [anchorRect]
  );

  const applyPosition = useCallback(() => {
    const popup = popupRef.current;
    if (!popup) return;

    const { top, left } = resolvePopupPosition(
      anchorRect,
      popup.offsetWidth || DEFAULT_POPUP_WIDTH,
      popup.offsetHeight || 0
    );

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
  }, [anchorRect]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", applyPosition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", applyPosition);
    };
  }, [applyPosition, onClose]);

  useLayoutEffect(() => {
    applyPosition();
  }, [applyPosition]);

  return (
    <div
      ref={popupRef}
      className="section-popup"
      role="dialog"
      aria-modal="false"
      aria-label={`${section.name} details`}
      aria-describedby={descriptionId}
      style={{
        position: "fixed",
        top: initialPosition.top,
        left: initialPosition.left,
        borderColor: section.color,
        maxHeight: "calc(100vh - 24px)",
        overflowY: "auto",
      }}
    >
      <div className="popup-header" style={{ color: section.color }}>
        <span className="popup-badge" style={{ background: section.color }}>
          {section.name}
        </span>
        <button
          type="button"
          className="popup-close"
          onClick={onClose}
          aria-label={`Close ${section.name} details`}
        >
          &times;
        </button>
      </div>
      <p className="popup-summary">{section.summary}</p>
      <p id={descriptionId} className="popup-explanation">
        {section.explanation}
      </p>
      <div className="popup-meta">
        <span className="tip-label">Best when</span>
        <p className="popup-meta-text">{section.whenToUse}</p>
      </div>
      <div className="popup-tip">
        <span className="tip-label">Starter snippet</span>
        <code>{section.snippet}</code>
      </div>
      <div className="popup-examples">
        <span className="tip-label">Examples</span>
        {section.examples.map((example) => (
          <div key={example.label} className="popup-example">
            <span className="popup-example-label">{example.label}</span>
            <code>{example.content}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
