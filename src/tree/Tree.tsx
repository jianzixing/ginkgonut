import Ginkgo, {CSSProperties, GinkgoNode} from "ginkgoes";
import Table, {TableCellPlugin, TableItemModel, TableProps} from "../grid/Table";
import Component, {ComponentProps} from "../component/Component";
import TableRow, {TableRowProps} from "../grid/TableRow";
import TreeCell from "./TreeCell";
import {TableColumnModel} from "../grid/TableColumn";
import DataEmpty from "../empty/DataEmpty";
import "./Tree.scss";

export interface TreeListModel {
    parent?: TreeListModel;
    /*树组件时表示当前的层级*/
    deep?: number;
    tableItem?: TableItemModel;
    children?: Array<TreeListModel>;
    show?: boolean;
    expanded?: boolean;
    leaf?: boolean;
    iconType?: string;
    icon?: string;
    checked?: boolean;
}

export interface TreeProps extends ComponentProps {
    data?: Array<any>;
    keyField?: string;
    isInheritExpand?: boolean;
    childrenField?: string;
    onTreeItemClick?: (e: Event, data?: TableItemModel) => void;
    onTreeModelChange?: (tree: Tree<TreeProps>,
                         items: Array<TreeListModel>,
                         trees?: { [key: string]: TreeListModel }) => void;
    onStoreData?: (data: any) => any;

    expandType?: 'plus';
    expandOpenIcon?: string;
    expandCloseIcon?: string;

    iconTypeKey?: string;
    iconKey?: string;
    leafKey?: string;
    expandedKey?: string;
    showCheckbox?: boolean;
    onCheckboxChange?: (item: TableItemModel, checked: boolean, checkItems?: Array<TableItemModel>) => void;
}

export default class Tree<P extends TreeProps> extends Component<P> implements TableCellPlugin {
    protected static treeCls;

    protected treeListItems: Array<TreeListModel> = [];
    protected tableItemModels: Array<TableItemModel> = [];
    protected treeListItemMapping: { [key: string]: TreeListModel } = {};
    protected oldTreeListItemMapping: { [key: string]: TreeListModel } = {};
    protected defaultTreeColumn = [{dataIndex: "text"}];
    protected treeListModelKey: number = 1;

    renderCell(tableRow: TableRow<TableRowProps>,
               columnModel: TableColumnModel,
               value: any,
               index: number): GinkgoNode {
        let text = value,
            key = tableRow.props.tableItem.key,
            treeListItem = key ? this.treeListItemMapping[key] : undefined;

        if (treeListItem) {
            let status: any = "close",
                deep = treeListItem.deep;
            if (treeListItem.expanded) {
                status = "open";
            }
            if (treeListItem.leaf) status = "leaf";
            return (
                <TreeCell
                    treeListItem={treeListItem}
                    column={columnModel}
                    status={status}
                    expandType={this.props.expandType}
                    expandOpenIcon={this.props.expandOpenIcon}
                    expandCloseIcon={this.props.expandCloseIcon}
                    deep={deep}
                    text={text}
                    cellSpace={false}
                    style={columnModel.style}
                    className={columnModel.className}
                    icon={treeListItem.icon}
                    iconType={treeListItem.iconType}
                    data={tableRow.props && tableRow.props.tableItem ? tableRow.props.tableItem.data : undefined}
                    value={value}
                    showCheckbox={this.props.showCheckbox}
                    onExpand={(e) => {
                        if (e.treeListItem) {
                            if (e.treeListItem.expanded) {
                                this.showTreeListItems(e.treeListItem, false);
                                this.expandTreeListItems(e.treeListItem);
                            } else {
                                this.showTreeListItems(e.treeListItem, true);
                                this.expandTreeListItems(e.treeListItem);
                            }
                            this.redrawing();
                        }
                    }}
                    onCheck={(item, sel) => {
                        if (item) {
                            this.setItemChecked(item, sel);
                            this.redrawing();

                            if (this.props.onCheckboxChange) {
                                this.props.onCheckboxChange(item, sel, this.getCheckItems(this.treeListItems));
                            }
                        }
                    }}
                />
            );
        }
    }

    protected setItemChecked(item: TreeListModel, checked: boolean) {
        if (item) {
            item.checked = checked;
            let children = item.children;
            if (children && children.length > 0) {
                for (let c of children) {
                    this.setItemChecked(c, checked);
                }
            }
        }
    }

    protected getCheckItems(items: Array<TreeListModel>): Array<TreeListModel> {
        let arr = [];
        if (items && items.length > 0) {
            for (let item of items) {
                if (item.checked) {
                    arr.push(item);
                }
                let children = item.children;
                let chs = this.getCheckItems(children);
                chs.map(value => arr.push(value));
            }
        }
        return arr;
    }

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        Tree.treeCls = this.getThemeClass("tree");
    }

    compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == 'data' && newValue != oldValue) {
            this.treeListModelKey = 1;
            this.buildTreeStructs(newValue);
            if (this.treeListItems) {
                for (let item of this.treeListItems) {
                    this.expandTreeListItems(item);
                }
            }
            this.tableItemModels = this.buildTableStructs(this.treeListItems);

            if (this.props.onTreeModelChange) {
                this.props.onTreeModelChange(this, this.treeListItems, this.treeListItemMapping);
            }
            return true;
        }
    }

    drawing() {
        if (this.tableItemModels && this.tableItemModels.length > 0) {
            return (
                <Table
                    {...this.buildTableProps()}
                    onItemClick={(e, data) => {
                        if (this.props && this.props.onTreeItemClick) {
                            this.props.onTreeItemClick(e, data.data);
                        }
                    }}
                />
            )
        } else {
            return <DataEmpty/>
        }
    }

    protected buildTableProps(): TableProps {
        return {
            zebra: false,
            columns: this.defaultTreeColumn,
            tableRowBorder: false,
            tableItemModels: this.tableItemModels,
            plugin: {cell: {text: this}},
            width: this.props.width,
            height: this.props.height,
            ignoreCalcWidth: true
        }
    }

    protected buildTreeStructs(data: Array<any> | undefined, deep: number = 1): Array<TreeListModel> | undefined {
        if (deep == 1) {
            this.oldTreeListItemMapping = this.treeListItemMapping;
            this.treeListItems = [];
            this.treeListItemMapping = {};
        }
        if (data && data instanceof Array) {
            let ls: Array<TreeListModel> = [];
            let isIDKey = true;
            for (let dataItem of data) {
                if (dataItem['id'] == null) {
                    isIDKey = false;
                    break;
                }
            }
            data.map((value, index) => {
                let childData = value[this.props.childrenField || "children"];
                let children;
                if (childData != null && childData instanceof Array) {
                    let nextDeep = deep + 1;
                    children = this.buildTreeStructs(childData, nextDeep);
                }

                let key = value[isIDKey ? 'id' : this.props.keyField];
                if (key == null) {
                    key = "tree_cell_" + (this.treeListModelKey++);
                } else {
                    key = "" + key;
                }
                let tableListItem: TableItemModel = {
                    key: key,
                    data: value
                };
                let treeListItem: TreeListModel = {
                    deep: deep,
                    tableItem: tableListItem,
                    children: children,
                    show: true
                };

                if (children) {
                    for (let ch of children) {
                        ch.parent = treeListItem;
                    }
                }

                treeListItem.iconType = value[this.props.iconTypeKey || 'iconType'];
                treeListItem.icon = value[this.props.iconKey || 'icon'];
                treeListItem.leaf = !!value[this.props.leafKey || 'leaf'];
                treeListItem.expanded = value[this.props.expandedKey || 'expanded'];

                if (this.oldTreeListItemMapping[key]
                    && this.oldTreeListItemMapping[key].expanded != treeListItem.expanded
                    && this.props.isInheritExpand != false
                    && (this.props.keyField || isIDKey)) {
                    treeListItem.expanded = this.oldTreeListItemMapping[key].expanded;
                }

                if (treeListItem.expanded == null) {
                    treeListItem.expanded = true;
                }

                if (deep == 1) {
                    this.treeListItems.push(treeListItem);
                }
                this.treeListItemMapping[key] = treeListItem;
                ls.push(treeListItem);
            });
            if (deep == 1) {
                this.oldTreeListItemMapping = {};
            }
            return ls;
        }
        if (deep == 1) {
            this.oldTreeListItemMapping = {};
        }
        return undefined;
    }

    protected buildTableStructs(treeListItems: Array<TreeListModel>): Array<TableItemModel> | undefined {
        let arr: Array<TableItemModel> = [];
        for (let treeListItem of treeListItems) {
            if (treeListItem.tableItem) {
                arr.push(treeListItem.tableItem);
                if (treeListItem.children && treeListItem.children.length > 0) {
                    let childs = this.buildTableStructs(treeListItem.children);
                    if (childs && childs.length > 0) {
                        for (let c of childs) {
                            arr.push(c);
                        }
                    }
                }
            }
        }
        return arr;
    }

    /**
     * 将所有子类全部设置为显示或者不显示
     * @param treeListItem
     * @param show
     */
    protected showTreeListItems(treeListItem: TreeListModel, expanded: boolean): void {
        treeListItem.show = expanded;
        if (treeListItem.tableItem) {
            treeListItem.expanded = expanded;

            if (treeListItem.children && treeListItem.children.length > 0) {
                let cs = treeListItem.children;
                if (cs && cs.length > 0) {
                    for (let item of cs) {
                        item.tableItem.created = true;
                    }
                }
            }
        }
    }

    protected expandTreeListItems(treeListItem: TreeListModel): void {
        if (treeListItem) {
            if (treeListItem.children && treeListItem.children.length > 0) {
                let cs = treeListItem.children;
                if (cs && cs.length > 0) {
                    for (let item of cs) {
                        let parentExpand: boolean = this.isParentExpand(item);
                        if (item.tableItem) {
                            if (parentExpand) {
                                item.tableItem.show = true;
                            } else {
                                item.tableItem.show = false;
                            }
                        }
                        this.expandTreeListItems(item);
                    }
                }
            }
        }
    }

    protected isParentExpand(treeListItem: TreeListModel): boolean {
        if (treeListItem.parent) {
            if (treeListItem.parent.expanded == false) {
                return false;
            } else {
                return this.isParentExpand(treeListItem.parent);
            }
        }
        return true;
    }

    setTreeModelExpanded(keys: Array<string>) {
        if (keys && keys.length > 0 && this.treeListItems && this.treeListItems.length > 0) {
            let has = false;
            for (let key of keys) {
                let tlm = this.treeListItemMapping[key];
                if (tlm) {
                    this.setTreeModelParentExpanded(tlm);
                    this.showTreeListItems(tlm, true);
                    has = true;
                }
            }
            if (has) {
                for (let item of this.treeListItems) {
                    this.expandTreeListItems(item);
                }
                this.redrawing();
            }
        }
    }

    private setTreeModelParentExpanded(item: TreeListModel) {
        item.expanded = true;
        if (item.parent) {
            this.setTreeModelParentExpanded(item.parent);
        }
    }

    getTreeModels(): Array<TreeListModel> {
        return this.treeListItems;
    }

    getTreeModelByKey(key: string): TreeListModel {
        return this.treeListItemMapping[key];
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(Tree.treeCls);
        return arr;
    }
}
