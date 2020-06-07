import Ginkgo, {RefObject} from "ginkgoes";
import Panel, {PanelProps} from "../panel/Panel";
import TreeGrid, {TreeGridProps} from "./TreeGrid";

export interface TreeGridPanelProps extends PanelProps, TreeGridProps {

}

export default class TreeGridPanel<P extends TreeGridPanelProps> extends Panel<P> {
    protected treeGridRef: RefObject<TreeGrid<any>> = Ginkgo.createRef();

    protected drawingPanelChild() {
        let newProps: any = {...this.props};
        newProps.ref = this.treeGridRef;
        return (<TreeGrid {...newProps}/>)
    }

    updateTree(): void {
        if (this.treeGridRef.instance) {
            this.treeGridRef.instance.redrawing();
        }
    }
}
