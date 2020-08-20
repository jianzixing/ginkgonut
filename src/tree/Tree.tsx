import Ginkgo, {CSSProperties, GinkgoNode} from "ginkgoes";
import Table, {TableCellPlugin, TableItemModel, TableProps} from "../grid/Table";
import Component, {ComponentProps} from "../component/Component";
import TableRow, {TableRowProps} from "../grid/TableRow";
import TreeCell from "./TreeCell";
import {TableColumnModel} from "../grid/TableColumn";
import DataEmpty from "../empty/DataEmpty";
import "./Tree.scss";
import {StoreProcessor} from "../store/DataStore";
import Loading from "../loading/Loading";

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
    displayField?: string;
    root?: TreeListModel;
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
    // 选择模式 1子全部选中父才选中 2子只要有一个选择父就选中
    checkboxMode?: "normal" | "anysel";
    onCheckboxChange?: (item: TableItemModel, checked: boolean, checkItems?: Array<TableItemModel>) => void;
    loadingText?: string;
    // 是否默认选中的值
    defaultSelected?: Array<any>;
}

export default class Tree<P extends TreeProps> extends Component<P> implements TableCellPlugin, StoreProcessor {
    protected static treeCls;

    protected treeListItems: Array<TreeListModel> = [];
    protected tableItemModels: Array<TableItemModel> = [];
    protected treeListItemMapping: { [key: string]: TreeListModel } = {};
    protected oldTreeListItemMapping: { [key: string]: TreeListModel } = {};
    protected treeListModelKey: number = 1;
    protected isLoading = false;

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
                                this.tableItemModels = this.buildTableStructs(this.treeListItems);
                            } else {
                                this.showTreeListItems(e.treeListItem, true);
                                this.expandTreeListItems(e.treeListItem);
                                this.tableItemModels = this.buildTableStructs(this.treeListItems);
                            }
                            this.setState();
                        }
                    }}
                    onCheck={(item, sel) => {
                        if (item) {
                            this.setItemChecked(item, sel);
                            this.setItemCheckedParent(item);
                            this.setState();

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

    protected setItemCheckedParent(item: TreeListModel) {
        let parent = item.parent;
        if (parent && parent.children) {
            let all = true, has = false;
            for (let c of parent.children) {
                if (c.checked != true) {
                    all = false;
                }
                if (c.checked == true) {
                    has = true;
                }
            }
            if (all || (this.props.checkboxMode == "anysel" && has == true)) {
                parent.checked = true;
                this.setItemCheckedParent(parent);
            } else {
                parent.checked = false;
                this.setItemCheckedParent(parent);
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
            this.processNewTreeData(newValue);
            return true;
        }
    }

    protected processNewTreeData(newValue) {
        this.treeListModelKey = 1;
        if (this.props.root) {
            let cf = this.props.childrenField || "children";
            let root: any = {...this.props.root};
            root[cf] = newValue;
            newValue = [root];
        }
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
    }

    drawing() {
        if (this.tableItemModels && this.tableItemModels.length > 0) {
            return [
                <Table
                    {...this.buildTableProps()}
                    onItemClick={(e, data) => {
                        if (this.props && this.props.onTreeItemClick) {
                            this.props.onTreeItemClick(e, data.data);
                        }
                    }}
                />,
                this.isLoading ? <Loading text={this.props.loadingText}/> : undefined
            ]
        } else {
            if (this.isLoading) {
                return <Loading text={this.props.loadingText}/>;
            } else {
                return <DataEmpty/>
            }
        }
    }

    protected buildTableProps(): TableProps {
        let cellPlugin: any = {};
        let dataIndex = this.props.displayField || "text";
        cellPlugin[dataIndex] = this;
        return {
            zebra: false,
            columns: [{dataIndex: dataIndex}],
            tableRowBorder: false,
            tableItemModels: this.tableItemModels,
            plugin: {cell: cellPlugin},
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
            let isIDKey = this.hasIDInData(data);
            data.map((value, index) => {
                let childData = value[this.props.childrenField || "children"];
                let children;
                if (childData != null && childData instanceof Array) {
                    let nextDeep = deep + 1;
                    children = this.buildTreeStructs(childData, nextDeep);
                }

                let treeListItem = this.buildTreeListItem(value, isIDKey);
                let key = treeListItem.tableItem.key;
                treeListItem.deep = deep;
                treeListItem.children = children;

                if (this.oldTreeListItemMapping[key]
                    && this.oldTreeListItemMapping[key].expanded != treeListItem.expanded
                    && this.props.isInheritExpand != false
                    && (this.props.keyField || isIDKey)) {
                    treeListItem.expanded = this.oldTreeListItemMapping[key].expanded;
                }

                if (treeListItem.expanded == null) {
                    treeListItem.expanded = true;
                }

                if (children) {
                    for (let ch of children) {
                        ch.parent = treeListItem;
                    }
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

    protected buildTreeListItem(value, isIDKey?: boolean): TreeListModel {
        let defaultSelected = this.props.defaultSelected;
        let primaryKeyValue = value[isIDKey ? 'id' : this.props.keyField];
        let key = primaryKeyValue;
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
            tableItem: tableListItem,
            show: true
        };

        treeListItem.iconType = value[this.props.iconTypeKey || 'iconType'];
        treeListItem.icon = value[this.props.iconKey || 'icon'];
        treeListItem.leaf = !!value[this.props.leafKey || 'leaf'];
        treeListItem.expanded = value[this.props.expandedKey || 'expanded'];

        if (value != null && defaultSelected && defaultSelected instanceof Array) {
            if (defaultSelected.indexOf(primaryKeyValue) >= 0 || defaultSelected.indexOf(value) >= 0) {
                treeListItem.checked = true;
            }
        }

        return treeListItem;
    }

    protected hasIDInData(data) {
        let isIDKey = true;
        if (data) {
            for (let dataItem of data) {
                if (dataItem['id'] == null) {
                    isIDKey = false;
                    break;
                }
            }
        } else {
            return false;
        }
        return isIDKey;
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
                this.setState();
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

    storeBeforeLoad?(): void {
        this.isLoading = true;
        this.setState();
    }

    storeLoaded(data: Object | Object[], total?: number, originData?: any): void {
        this.isLoading = false;
        this.processNewTreeData(data);
        this.setState();
    }
}
