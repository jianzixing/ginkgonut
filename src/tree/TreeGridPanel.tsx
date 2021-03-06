import Ginkgo, {RefObject} from "ginkgoes";
import Panel, {PanelProps} from "../panel/Panel";
import TreeGrid, {TreeGridProps} from "./TreeGrid";
import {TreeListModel} from "./Tree";

export interface TreeGridPanelProps extends PanelProps, TreeGridProps {
    treeGridRef?: RefObject<TreeGrid<any>>;
}

export default class TreeGridPanel<P extends TreeGridPanelProps> extends Panel<P> {
    protected treeGridRef: RefObject<TreeGrid<any>> = Ginkgo.createRef();

    protected drawingPanelChild() {
        let newProps: any = {...this.props};
        return (<TreeGrid {...newProps} ref={component => {
            this.treeGridRef.instance = component as TreeGrid<any>;
            if (newProps.treeGridRef) {
                newProps.treeGridRef.instance = component;
            }
        }}/>)
    }

    updateTree(): void {
        if (this.treeGridRef.instance) {
            this.treeGridRef.instance.setState();
        }
    }

    getTreeModels(): Array<TreeListModel> {
        if (this.treeGridRef.instance) {
            return this.treeGridRef.instance.getTreeModels();
        }
    }

    getTreeModelByKey(key: string): TreeListModel {
        if (this.treeGridRef.instance) {
            return this.treeGridRef.instance.getTreeModelByKey(key);
        }
    }
}
