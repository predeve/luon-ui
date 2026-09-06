// Generated from src/table.view.tsx.
import { renderTable } from "./table-render.tsx";
import { uiProps } from "./props.ts";
import { attrsView as __attrs, bindView as __bind, componentView as __component, computedView as __computed, liveView as __live, state as __state, watchView as __watch } from "@luon/view";
const __spec = uiProps("Table");
export default __component("Table", (props) => {
    const attrs = __attrs(props, __spec);
    const __view = (props) => renderTable(props);
    return {
        render: (__props) => {
            return __view(__props);
        }
    };
}, __spec, { "file": "/Users/predeve/Developer/luon.dev/luon-packages/ui/src/table.view.tsx" });
