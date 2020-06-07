import Ginkgo, {CSSProperties, GinkgoNode} from "ginkgoes";
import Tree, {TreeListModel, TreeProps} from "./Tree";
import Grid, {GridProps} from "../grid/Grid";

export interface TreeGridProps extends TreeProps, GridProps {
    treeDataIndex?: string;
}

export default class TreeGrid<P extends TreeGridProps> extends Tree<P> {
    constructor(props: P) {
        super(props);
    }

    drawing() {
        return (
            <Grid
                {...this.buildGridProps()}
                onItemClick={(e, data) => {
                    if (this.props && this.props.onTreeItemClick) {
                        this.props.onTreeItemClick(e, data.data);
                    }
                }}
                onParseData={(data) => {
                    this.treeListItemMapping = {};
                    this.buildTreeStructs(data);
                    let items = this.buildTableStructs(this.treeListItems);
                    if (this.treeListItems) {
                        for (let item of this.treeListItems) {
                            this.expandTreeListItems(item);
                        }
                    }
                    return items;
                }}
            />
        )
    }

    protected buildGridProps(): GridProps {
        let cell: any = {};
        if (this.props.treeDataIndex) {
            cell[this.props.treeDataIndex] = this;
        } else {
            cell["text"] = this;
        }
        return {
            zebra: false,
            columns: this.props.columns,
            tableRowBorder: false,
            data: this.props.data,
            plugin: {cell: cell},
            ...this.props,
            models: this.tableItemModels
        }
    }
}
