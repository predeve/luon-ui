// Generated from src/chart.view.tsx.
import { renderChart } from "./chart-svg.tsx";
import { uiProps } from "./props.ts";
import { attrsView as __attrs, bindView as __bind, componentView as __component, computedView as __computed, liveView as __live, state as __state, watchView as __watch } from "@luon/view";
const __spec = uiProps("Chart");
export default __component("Chart", (props) => {
    const attrs = __attrs(props, __spec);
    const __view = (props) => renderChart(props);
    return {
        render: (__props) => {
            return __view(__props);
        }
    };
}, __spec);
