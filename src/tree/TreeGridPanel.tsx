import Ginkgo from "ginkgoes";
import Panel, {PanelProps} from "../panel/Panel";
import TreeGrid, {TreeGridProps} from "./TreeGrid";

export interface TreeGridPanelProps extends PanelProps, TreeGridProps {

}

export default class TreeGridPanel<P extends TreeGridPanelProps> extends Panel<P> {
    protected drawingPanelChild() {
        let newProps: any = {...this.props};
        newProps.ref = undefined;
        return (<TreeGrid {...newProps}/>)
    }
}
