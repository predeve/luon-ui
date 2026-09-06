// Generated from src/term.tsx.
import { jsx as _jsx } from "@luon/view/jsx-runtime";
import { uiProps } from "./props.ts";
import { bindView as __bind, liveView as __live, namedViews as __namedViews } from "@luon/view";
const __specs = {
    Term: uiProps("Term"),
};
export const { Term, } = __namedViews({
    Term: function Term(props) {
        const Tag = props.as || "span";
        return _jsx(Tag, { ...props.$attrs, class: "notranslate", "data-luon-term": "", translate: "no", children: props.children });
    },
}, (name) => __specs[name], { "file": "/Users/predeve/Developer/luon.dev/luon-packages/ui/src/term.tsx" });
