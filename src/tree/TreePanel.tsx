import Ginkgo, {GinkgoElement} from "ginkgoes";
import Panel, {PanelProps} from "../panel/Panel";
import Tree, {TreeProps} from "./Tree";
import "./TreePanel.scss";

export interface TreePanelProps extends PanelProps, TreeProps {

}

export default class TreePanel<P extends TreePanelProps> extends Panel<P> {
    protected static treeClsPanel;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        TreePanel.treeClsPanel = this.getThemeClass("tree-panel");
    }

    protected drawingPanelChild() {
        let newProps: any = {...this.props};
        newProps.ref = undefined;
        return (<Tree {...newProps}/>)
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(TreePanel.treeClsPanel);
        return arr;
    }
}
