import Ginkgo, {CSSProperties, GinkgoElement, GinkgoNode, HTMLComponent, RefObject} from "ginkgoes";
import TableRow, {ActionColumnItem, TableRecord, TableRowProps} from "./TableRow";
import Component, {ComponentProps} from "../component/Component";
import TableFeatureGroup, {TableFeatureGroupModel} from "./TableFeatureGroup";
import {TableColumnModel} from "./TableColumn";
import "./Table.scss";

export type FeatureTypes = { grouping: TableFeatureGroupModel };

export interface TableBodyPlugin {
    setComponent?(component: Component<any>): void;

    renderBody?(props: TableProps,
                bodyCls: Array<string>): GinkgoNode | undefined;
}

export interface TableRowPlugin {
    setComponent?(component: Component<any>): void;

    renderRow?(props: TableProps,
               tableItemModel: TableItemModel,
               index: number): GinkgoNode | undefined;
}

export interface TableCellPlugin {
    setComponent?(component: Component<any>): void;

    renderCell?(tableRow: TableRow<TableRowProps>,
                columnModel: TableColumnModel,
                value: any,
                index: number): GinkgoNode | undefined;
}

export interface TableProps extends ComponentProps {
    /*是否显示斑马线*/
    zebra?: boolean;
    /*是否显示每行上下边框*/
    tableRowBorder?: boolean;
    /*是否显示每个单元格间隔边框*/
    tableCellBorder?: boolean;
    tableItemModels?: Array<TableItemModel>;
    columns: Array<TableColumnModel>;
    disableClickSelected?: boolean;
    enableToggleSelected?: boolean;
    /*true时表格不再计算总宽度*/
    ignoreCalcWidth?: boolean;
    onSelected?: (e: Event, data: TableItemModel, sel?: Array<TableItemModel>) => void;
    onDeselected?: (e: Event, data: TableItemModel, sel?: Array<TableItemModel>) => void;

    // 包含各种情况的点击
    onItemClick?: (e: Event, data: { data: TableItemModel, actionItem?: ActionColumnItem }) => void;
    onItemDoubleClick?: (e: Event, data: { data: TableItemModel, actionItem?: ActionColumnItem }) => void;

    feature?: FeatureTypes;
    plugin?: {
        body?: TableBodyPlugin,
        row?: TableRowPlugin,
        cell?: { [dataIndex: string]: TableCellPlugin }
    };
    /*如果是可编辑单元格则可以设置是否自动提交*/
    autoCommit?: boolean;
}

export interface TableItemModel {
    key?: string;
    selected?: boolean;
    data?: { [key: string]: any };
    // 数据修改时使用,比如单元格修改
    record?: TableRecord;
    show?: boolean;
    created?: boolean;
}


export default class Table<P extends TableProps> extends Component<P> {
    protected static tableClsRoot;
    protected static tableClsBody;

    protected tableFeatureGroup?: TableFeatureGroup;
    protected tableItemModels = this.props.tableItemModels;
    protected columns: Array<TableColumnModel> = this.props.columns;

    defaultProps = {
        zebra: true,
        tableRowBorder: true
    };

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        Table.tableClsRoot = this.getThemeClass("table");
        Table.tableClsBody = this.getThemeClass("table-body-el");
    }

    protected drawing(): GinkgoElement | undefined | null {
        let plugin = this.props.plugin,

            items: Array<GinkgoNode> = [],
            tableItemModels: Array<TableItemModel> | undefined = this.tableItemModels,
            columns: Array<TableColumnModel> = this.columns,
            bodyCls = [Table.tableClsBody];

        if (plugin && plugin.body) {
            plugin.body.setComponent(this);
            items.push(plugin.body.renderBody(this.props, bodyCls));
        } else {
            if (tableItemModels && tableItemModels.length > 0) {
                tableItemModels.map((value, index) => {
                    if (plugin && plugin.row) {
                        if (this.isShowRow(value)) {
                            plugin.row.setComponent(this);
                            items.push(plugin.row.renderRow(this.props, value, index));
                        }
                    } else {
                        let {feature} = this.props;
                        if (feature && feature.grouping.enabled) {
                            if (this.isShowRow(value)) {
                                if (!this.tableFeatureGroup) {
                                    this.tableFeatureGroup = new TableFeatureGroup();
                                }

                                this.tableFeatureGroup.renderItems(
                                    this.props, items, value, this, this.themePrefix
                                );
                            }
                        } else {
                            if (this.isShowRow(value)) {
                                items.push(
                                    <TableRow
                                        key={value.key != null ? value.key : "row_" + index}
                                        tableItem={value}
                                        hidden={value.show == false}
                                        disableClickSelected={this.props.disableClickSelected}
                                        enableToggleSelected={this.props.enableToggleSelected}
                                        zebra={this.props.zebra && index % 2 == 1}
                                        border={this.props.tableRowBorder}
                                        selected={value.selected}
                                        cellSpace={this.props.tableCellBorder}
                                        plugin={plugin}
                                        columns={columns}
                                        index={index}
                                        autoCommit={this.props.autoCommit}
                                        onSelected={(e, data: TableItemModel, multiSelect) => {
                                            if (tableItemModels) {
                                                if (!multiSelect && this.props.enableToggleSelected != true) {
                                                    tableItemModels.map((v) => {
                                                        v.selected = false;
                                                    });
                                                }
                                                data.selected = true;
                                                this.redrawing();

                                                if (this.props.onSelected) {
                                                    let sels = [];
                                                    if (tableItemModels) {
                                                        tableItemModels.map((v) => {
                                                            if (v.selected) sels.push(v);
                                                        });
                                                    }
                                                    this.props.onSelected(e, data, sels);
                                                }
                                            }
                                        }}
                                        onDeselected={(e, data: TableItemModel, multiSelect) => {
                                            if (this.props.enableToggleSelected == true || multiSelect == true) {
                                                data.selected = false;
                                                this.redrawing();
                                            }

                                            if (this.props.onDeselected) {
                                                let sels = [];
                                                if (tableItemModels) {
                                                    tableItemModels.map((v) => {
                                                        if (v.selected) sels.push(v);
                                                    });
                                                }
                                                this.props.onDeselected(e, data, sels);
                                            }
                                        }}
                                        onClick={(e, data: TableItemModel) => {
                                            if (this.props.onItemClick) {
                                                this.props.onItemClick(e, {data: data});
                                            }
                                        }}
                                        onDoubleClick={(e, data: TableItemModel) => {
                                            if (this.props.onItemDoubleClick) {
                                                this.props.onItemDoubleClick(e, {data: data});
                                            }
                                        }}
                                        onActionClick={(e, data: TableItemModel, actionItem) => {
                                            if (this.props.onItemClick) {
                                                this.props.onItemClick(e, {data: data ? data.data : null, actionItem})
                                            }
                                        }}/>
                                );
                            }
                        }
                    }
                });
            }
        }

        return (
            <div
                className={bodyCls.join(" ")}
            >
                {items}
            </div>
        )
    }

    protected isShowRow(item: TableItemModel) {
        if (item.show != false || item.created) {
            return true;
        }
        return false;
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == "tableItemModels" && newValue != oldValue) {
            this.tableItemModels = newValue;
        }
        if (key == "columns" && newValue != oldValue) {
            this.columns = newValue;
            return true;
        }
        return false;
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(Table.tableClsRoot);
        return arr;
    }
}
