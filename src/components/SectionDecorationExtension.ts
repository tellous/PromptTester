import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import {
  findMatchingSectionHeading,
  type SectionId,
  type SectionDefinition,
} from "../sectionData";

const pluginKey = new PluginKey("sectionDecorations");
export const WYSIWYG_SECTION_BADGE_CLICK_EVENT =
  "promptlint:wysiwyg-section-badge-click";

export interface WysiwygSectionBadgeClickDetail {
  sectionId: SectionId;
  rect: DOMRect;
}

export const SectionDecorationExtension = Extension.create({
  name: "sectionDecoration",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pluginKey,
        props: {
          decorations(state) {
            const { doc } = state;
            const decos: Decoration[] = [];
            let current: SectionDefinition | null = null;

            // Single pass over top-level nodes
            doc.forEach((node, pos) => {
              if (node.type.name === "heading") {
                current = findMatchingSectionHeading(node.textContent.trim());

                if (current) {
                  // Badge widget at the end of the heading (inside the heading element)
                  const sec = current;
                  decos.push(
                    Decoration.widget(
                      pos + node.nodeSize - 1,
                      () => {
                        const el = document.createElement("span");
                        el.className = "wysiwyg-section-badge";
                        el.setAttribute("contenteditable", "false");
                        el.style.background = sec.color;
                        el.textContent = sec.name;
                        el.addEventListener("mousedown", (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        });
                        el.addEventListener("click", (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          window.dispatchEvent(
                            new CustomEvent<WysiwygSectionBadgeClickDetail>(
                              WYSIWYG_SECTION_BADGE_CLICK_EVENT,
                              {
                                detail: {
                                  sectionId: sec.id,
                                  rect: el.getBoundingClientRect(),
                                },
                              }
                            )
                          );
                        });
                        return el;
                      },
                      { side: 1, key: `badge-${pos}-${sec.id}` }
                    )
                  );
                }
              }

              // Color every top-level block that's inside a section
              if (current) {
                decos.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "wysiwyg-section-block",
                    style: `--sc:${current.color};--sb:${current.color}0d;`,
                  })
                );
              }
            });

            return DecorationSet.create(doc, decos);
          },
        },
      }),
    ];
  },
});
