import Ginkgo, {CSSProperties, GinkgoElement, GinkgoNode} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import TableCell, {getCellWidth} from "./TableCell";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import {TableCellPlugin, TableItemModel, TableRowPlugin} from "./Table";
import {TableColumnModel} from "./TableColumn";
import "./TableRow.scss";
import ObjectTools from "../tools/ObjectTools";
import DateTools from "../tools/DateTools";

export interface ActionColumnItem {
    icon?: string;
    iconType?: string;
    style?: CSSProperties;
    color?: string;
    size?: number;
    key?: string | number;
    text?: string;
    tooltip?: string;
    onActionClick?: (value: any, data: any) => void;
}

export interface CellEditing {
    showEvent?: "click" | "dbclick" | "show",
    field?: GinkgoElement;
    fieldType?: "check";
    onValue?: (column: TableColumnModel, data: any, value: any) => any;
}

export interface TableRowProps extends ComponentProps {
    zebra?: boolean;
    selected?: boolean;
    onSelected?: (e: Event, data: TableItemModel, multiSelect: boolean) => void;
    onDeselected?: (e: Event, data: TableItemModel, multiSelect: boolean) => void;
    onActionClick?: (e: Event, data: TableItemModel, actionItem: ActionColumnItem) => void;
    onClick?: (e: Event, data?: TableItemModel) => void;
    disableClickSelected?: boolean;
    enableToggleSelected?: boolean;
    tableItem: TableItemModel;
    border?: boolean;
    cellSpace?: boolean;
    columns: Array<TableColumnModel>;
    index: number;
    plugin?: {
        row?: TableRowPlugin,
        cell?: { [dataIndex: string]: TableCellPlugin }
    };
}

export class TableRecord {
    private _data?: any;
    record?: any;
    callback?: () => void;

    get data(): any {
        return this._data;
    }

    set data(value: any) {
        this._data = value;
        if (!this.record) {
            this.record = {...value};
        }
    }

    commit() {
        if (this._data && this.record) {
            for (let key in this._data) {
                this._data[key] = this.record[key];
            }
            if (this.callback) {
                this.callback();
            }
        }
    }

    equals(key: string): boolean {
        if (this._data && this.record && this._data[key] == this.record[key]) {
            return true;
        }
        if (this._data && this.record
            && this._data[key] == null && this.record[key] == false) {
            return true;
        }
        if (this._data && this.record
            && this._data[key] == false && this.record[key] == null) {
            return true;
        }
        return false;
    }
}


export default class TableRow<P extends TableRowProps> extends Component<P> {
    protected static tableClsRowRoot;
    protected static tableClsOdd;
    protected static tableClsRowCells;
    protected static tableClsRowBorder;
    protected static tableClsRowActions;
    protected static tableClsRowActionItem;

    protected isOnSelected = this.props.selected;
    protected isEnableHovered = true;
    protected isEnablePressing = true;
    protected isEnableSelected = true;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        TableRow.tableClsRowRoot = this.getThemeClass("table-row");
        TableRow.tableClsOdd = this.getThemeClass("odd");
        TableRow.tableClsRowCells = this.getThemeClass("cells-el");
        TableRow.tableClsRowBorder = this.getThemeClass("table-row-border");
        TableRow.tableClsRowActions = this.getThemeClass("table-row-actions");
        TableRow.tableClsRowActionItem = this.getThemeClass("action-item");
    }

    protected drawing(): GinkgoElement | undefined | null {
        let plugin = this.props.plugin,
            columns: Array<TableColumnModel> | undefined = this.props.columns,
            els: Array<GinkgoNode> = [],
            tableItem = this.props.tableItem;

        if (tableItem && columns) {
            let record = tableItem.record;
            if (!record) {
                tableItem.record = new TableRecord();
                tableItem.record.data = tableItem.data;
                tableItem.record.callback = this.onCommitRecord.bind(this);
                record = tableItem.record;
            }
            let data = record.record;
            columns.map((column, index) => {
                if (column.show != false) {
                    let cellStyle: CSSProperties = column.style || {};
                    let className = column.className;
                    if (column.width) cellStyle.width = column.width + "px";
                    let cellEl;
                    let pluginCells = plugin ? plugin.cell : undefined;
                    let value = ObjectTools.valueFromTemplate(data, column.dataIndex);
                    if (value == null && column.dataDefault != null) value = column.dataDefault;

                    if (pluginCells && pluginCells[column.dataIndex]) {
                        cellEl = pluginCells[column.dataIndex].renderCell(this, column, value, index);
                        els.push(cellEl);
                    } else {
                        if (column.type == "rownumber") {
                            cellStyle.width = getCellWidth(column) + "px";
                            column.width = getCellWidth(column);

                            els.push(
                                <TableCell
                                    type={column.type}
                                    key={"" + index}
                                    column={column}
                                    style={cellStyle}
                                    className={className}
                                    cellSpace={this.props.cellSpace}
                                    data={data}
                                    value={value}
                                    record={record}
                                    onValueChange={(cellData, cellValue) => {
                                        this.redrawing();
                                    }}
                                >
                                    {(this.props.index || 0) + 1}
                                </TableCell>
                            )
                        } else if (column.type == "checkbox") {
                            cellStyle.width = getCellWidth(column) + "px";
                            column.width = getCellWidth(column);
                            els.push(
                                <TableCell
                                    type={column.type}
                                    key={"" + index}
                                    column={column}
                                    style={cellStyle}
                                    className={className}
                                    cellSpace={this.props.cellSpace}
                                    data={data}
                                    value={value}
                                    record={record}
                                    onClick={(e: Event) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (!this.isOnSelected) {
                                            this.setSelected(true);
                                            if (this.props.onSelected) {
                                                this.props.onSelected(e, tableItem, true);
                                            }
                                        } else {
                                            this.setSelected(false);
                                            if (this.props.onDeselected) {
                                                this.props.onDeselected(e, tableItem, true);
                                            }
                                        }
                                    }}
                                    onValueChange={(cellData, cellValue) => {
                                        this.redrawing();
                                    }}
                                >
                                    <Icon icon={
                                        tableItem.selected == true ? IconTypes._extCheckedSel : IconTypes._extCheckedUnset
                                    }/>
                                </TableCell>
                            )
                        } else if (column.type == "actioncolumn") {
                            let icons = [];
                            if (column.render) {
                                try {
                                    let node = column.render(value, tableItem.data, column);
                                    icons.push(node);
                                } catch (e) {
                                    console.error("column render error", e);
                                }
                            } else {
                                let items = column.items;
                                if (items && items.length > 0) {
                                    for (let item of items) {
                                        let style: CSSProperties = {};
                                        if (item.style) style = {...item.style};
                                        if (item.color) style['color'] = item.color;
                                        if (item.size) style.fontSize = item.size;

                                        if (item.iconType) {
                                            icons.push(
                                                <div className={TableRow.tableClsRowActionItem}
                                                     style={style}
                                                     onClick={e => {
                                                         this.onActionClick(e, item, column, data, value);
                                                     }}>
                                                    <Icon icon={item.iconType}/>
                                                </div>)
                                        } else if (item.icon) {
                                            icons.push(
                                                <div className={TableRow.tableClsRowActionItem}
                                                     style={style}
                                                     onClick={e => {
                                                         this.onActionClick(e, item, column, data, value);
                                                     }}>
                                                    <img src={item.icon}/>
                                                </div>)
                                        } else if (item.text) {
                                            icons.push(
                                                <div className={TableRow.tableClsRowActionItem}
                                                     style={style}
                                                     onClick={e => {
                                                         this.onActionClick(e, item, column, data, value);
                                                     }}>
                                                    <span>{item.text}</span>
                                                </div>)
                                        }
                                    }
                                }
                            }

                            els.push(<TableCell
                                type={column.type}
                                key={"" + index}
                                column={column}
                                style={cellStyle}
                                className={className}
                                hasPadding={false}
                                data={data}
                                value={value}
                                record={record}
                                cellSpace={this.props.cellSpace}
                                onValueChange={(cellData, cellValue) => {
                                    this.redrawing();
                                }}
                            >
                                <div className={TableRow.tableClsRowActions}>
                                    {icons}
                                </div>
                            </TableCell>)
                        } else {
                            let cellValue = value;
                            if (column.render) {
                                try {
                                    let node = column.render(value, tableItem.data, column);
                                    cellValue = node;
                                } catch (e) {
                                    console.error("column render error", e);
                                }
                            } else {
                                if (column.type == "datecolumn") {
                                    let date = DateTools.toDate(cellValue);
                                    if (date) {
                                        cellValue = DateTools.format(date, column.format || "yyyy-MM-dd HH:mm:ss")
                                    } else {
                                        cellValue = column.dataDefault || null;
                                    }
                                } else {
                                    if (value instanceof Array) {
                                        cellValue = value.join(column.dataSplit ? column.dataSplit : ",");
                                    } else if (typeof value == "object") {
                                        cellValue = JSON.stringify(value);
                                    } else if (typeof value == "function") {
                                        cellValue = value.toString();
                                    } else {
                                        cellValue = "" + (cellValue != null ? cellValue : "");
                                    }
                                }
                            }

                            els.push(<TableCell
                                key={"" + index}
                                column={column}
                                style={cellStyle}
                                className={className}
                                data={data}
                                value={value}
                                record={record}
                                cellSpace={this.props.cellSpace}
                                onValueChange={(cellData, cellValue) => {
                                    this.redrawing();
                                }}
                            >
                                {
                                    cellValue ? cellValue : <span>&nbsp;</span>
                                }
                            </TableCell>);
                        }
                    }
                }
            })
        }

        return (
            <div className={TableRow.tableClsRowCells}>
                {els}
            </div>
        );
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == "selected" && this.isOnSelected != newValue) {
            this.setSelected(newValue || false);
        }
        return false;
    }

    protected onCommitRecord() {
        this.redrawing();
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(TableRow.tableClsRowRoot);

        if (this.props.zebra) {
            arr.push(TableRow.tableClsOdd);
        }
        if (this.props.border) {
            arr.push(TableRow.tableClsRowBorder);
        }

        return arr;
    }

    protected onActionClick(e: Event,
                            item: ActionColumnItem,
                            column: TableColumnModel,
                            data,
                            value) {
        e.stopPropagation();
        e.preventDefault();

        try {
            if (item && item.onActionClick) {
                item.onActionClick(value, data);
            }
        } catch (e) {
            console.log("call onActionClick error", e);
        }
        try {
            if (this.props.onActionClick) {
                this.props.onActionClick(e, this.props.tableItem, item);
            }
        } catch (e) {
            console.error(e);
        }
    }

    protected onClick(e: Event) {
        if (this.isEnableSelected) {
            if (!this.isOnSelected) {
                this.setSelected(true);
                if (this.props && !this.props.disableClickSelected) {
                    if (this.props.onSelected) {
                        this.props.onSelected(e, this.props.tableItem, false);
                    }
                }
            } else {
                if (this.props.enableToggleSelected) {
                    this.setSelected(false);
                    if (this.props && !this.props.disableClickSelected) {
                        if (this.props.onDeselected) {
                            this.props.onDeselected(e, this.props.tableItem, false);
                        }
                    }
                } else {
                    this.setSelected(true);
                    if (this.props && !this.props.disableClickSelected) {
                        if (this.props.onSelected) {
                            this.props.onSelected(e, this.props.tableItem, false);
                        }
                    }
                }
            }
        }

        try {
            this.props.onClick && this.props.onClick(e, this.props.tableItem);
        } catch (e) {
            console.error(e);
        }
    }
}
