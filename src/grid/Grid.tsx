import Ginkgo, {CSSProperties, GinkgoElement, HTMLComponent, RefObject} from "ginkgoes";
import Table, {
    TableBodyPlugin,
    TableCellPlugin,
    TableItemModel, TableProps,
    TableRowPlugin
} from "./Table";
import Component from "../component/Component";
import {TableColumnModel} from "./TableColumn";
import TableColumnGroup, {TableColumnGroupProps} from "./TableColumnGroup";
import {StoreProcessor} from "../store/DataStore";
import Loading from "../loading/Loading";
import {getCellWidth, getFixCellWidth, isFixCellWidth} from "./TableCell";
import './Grid.scss';

export interface GridBodyPlugin extends TableBodyPlugin {

}

export interface GridRowPlugin extends TableRowPlugin {

}

export interface GridCellPlugin extends TableCellPlugin {

}

export interface GridProps extends TableProps {
    columns: Array<TableColumnModel>;
    columnTextAlign?: "left" | "center" | "right";
    /*列头右边框*/
    columnSpace?: boolean;
    plugin?: {
        body?: GridBodyPlugin,
        row?: GridRowPlugin,
        cell?: { [dataIndex: string]: GridCellPlugin }
    };
    data?: Array<any>;
    models?: Array<TableItemModel>;
    /*列宽度保持表格总宽度*/
    fit?: boolean;
    /*自动计算高度*/
    autoHeight?: boolean;
    onSelectChange?: (sel: Array<TableItemModel>, data?: { data: TableItemModel, type: number }) => void;
    onParseData?: (data: any) => Array<TableItemModel>;
}

export default class Grid<P extends GridProps> extends Component<P> implements StoreProcessor {
    protected static gridClsRoot;
    protected static gridClsBody;
    protected static gridClsInner;
    protected static gridClsTable;
    protected static gridClsResize;
    protected static clsColumnResizeLine;

    protected columnLineRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected gridBodyRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected columnsRef: TableColumnGroup<TableColumnGroupProps>;
    protected tableRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected tableComponentRef: Table<any>;
    protected onAutoHeight: (autoHeight: number) => void;

    protected hasGridResizeCls = false;
    protected tableItemModels?: Array<TableItemModel> | undefined;
    protected isLoading?: boolean = false;

    protected columns: Array<TableColumnModel> = this.props.columns;
    protected tableWidth = 0;
    protected tableClientWidth = 0;

    defaultProps = {
        zebra: true,
        tableRowBorder: true
    };

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        Grid.gridClsRoot = this.getThemeClass("grid");
        Grid.gridClsBody = this.getThemeClass("grid-body");
        Grid.gridClsInner = this.getThemeClass("grid-inner");
        Grid.gridClsTable = this.getThemeClass("grid-table");
        Grid.gridClsResize = this.getThemeClass("grid-resize");
        Grid.clsColumnResizeLine = this.getThemeClass("column-resize-line");
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == "data" && newValue != oldValue) {
            this.tableItemModels = this.data2TableItemModels(newValue);
            return true;
        }
        if (key == "columns" && newValue != oldValue) {
            this.columns = newValue;
            return true;
        }
        if (key == "models" && newValue != oldValue) {
            this.tableItemModels = newValue;
            return true;
        }
        return false;
    }

    protected data2TableItemModels(data: any): Array<TableItemModel> | undefined {
        if (this.props && this.props.models && this.props.models.length > 0) {
            return this.props.models;
        } else {
            if (this.props.onParseData) {
                return this.props.onParseData(data);
            } else if (data && data instanceof Array) {
                let arr: Array<TableItemModel> = new Array<TableItemModel>();
                data.map((value, index) => {
                    let item = {
                        key: "" + index,
                        data: value
                    };
                    arr.push(item);
                });
                return arr;
            }
        }
        return undefined;
    }

    protected drawing(): GinkgoElement | undefined | null {
        let columns: Array<TableColumnModel> = this.columns || [],
            gridTableClsNames = [Grid.gridClsTable];

        return (
            <div ref={this.gridBodyRef} className={Grid.gridClsBody}>
                <TableColumnGroup
                    key={"grid_column"}
                    ref={(component: any) => this.columnsRef = component}
                    columnPositionRef={this.gridBodyRef}
                    columnResizeLineRef={this.columnLineRef}
                    columns={columns}
                    textAlign={this.props.columnTextAlign}
                    fit={this.props.fit}
                    fitBaseRef={this.tableRef}
                    columnSpace={this.props.columnSpace}
                    tableWidth={this.tableClientWidth}
                    onColumnResize={(type, column, oldWidth) => {
                        if (type == "start") {
                            this.hasGridResizeCls = true;
                            this.rootEl.reloadClassName();
                        }
                        if (type == "finish") {
                            this.hasGridResizeCls = false;
                            // this.rootEl.reloadClassName();
                            // this.tableComponentRef && this.tableComponentRef.redrawing();
                            this.redrawing();
                        }
                    }}
                    onColumnMenuChange={((type, data) => {
                        this.onColumnChange(type, data);
                    })}
                />
                <div key={"grid_body"}
                     className={Grid.gridClsInner}>
                    <div ref={this.tableRef}
                         className={gridTableClsNames}
                         onScroll={(e) => {
                             this.onTableScroll(e);
                         }}
                    >
                        <Table
                            {...this.props}
                            disableClickSelected={this.props.disableClickSelected}
                            enableToggleSelected={this.props.enableToggleSelected}
                            width={this.tableWidth}
                            height={undefined}
                            ref={c => this.tableComponentRef = (c as Table<any>)}
                            tableItemModels={this.tableItemModels}
                            columns={columns}
                            onSelected={(e: Event, data: TableItemModel, sel?: Array<TableItemModel>) => {
                                if (this.tableItemModels) {
                                    let allSel = true;
                                    this.tableItemModels.map(tableItemModel => {
                                        if (tableItemModel.selected != true) {
                                            allSel = false;
                                        }
                                    });
                                    if (allSel && this.props.columns) {
                                        let arr = columns.filter(column => column.type == "checkbox");
                                        arr.map(column => column.checked = true);
                                        this.columnsRef.redrawing();
                                    } else if (!allSel) {
                                        let arr = columns.filter(column => column.type == "checkbox");
                                        let isRe = false;
                                        arr.map(column => {
                                            if (column.checked != false) {
                                                column.checked = false;
                                                isRe = true;
                                            }
                                        });
                                        if (isRe) {
                                            this.redrawing();
                                        }
                                    }
                                }
                                if (this.props.onSelected) {
                                    this.props.onSelected(e, data.data, sel);
                                }
                                if (this.props.onSelectChange) {
                                    this.props.onSelectChange(sel, {data: data, type: 1});
                                }
                            }}
                            onDeselected={(e: Event, data: TableItemModel, sel?: Array<TableItemModel>) => {
                                if (this.props.columns) {
                                    let arr = columns.filter(column => column.type == "checkbox");
                                    arr.map(column => column.checked = false);
                                }
                                this.redrawing();

                                if (this.props.onDeselected) {
                                    this.props.onDeselected(e, data.data, sel);
                                }
                                if (this.props.onSelectChange) {
                                    this.props.onSelectChange(sel, {data: data, type: 2});
                                }
                            }}
                        />
                    </div>
                    {this.isLoading ? <Loading/> : undefined}
                </div>
                <div key={"grid_line"} ref={this.columnLineRef} className={Grid.clsColumnResizeLine}></div>

            </div>
        )
    }

    protected onAfterDrawing() {
        super.onAfterDrawing();
        this.calTableWidth();
        this.calGridHeight();
    }

    onSizeChange(width: number, height: number): void {
        super.onSizeChange(width, height);
        this.calTableWidth();
        this.calGridHeight();
    }

    protected calTableWidth() {
        if (this.columnsRef && this.props.fit) {
            for (let c of this.columns) {
                if (c.originWidth == null) {
                    c.originWidth = c.width;
                }
            }
            this.columnsRef.calGroupColumnWidth();
        }

        let totalWidth = 0;
        for (let c of this.columns) {
            if (c.show != false) {
                totalWidth += getCellWidth(c);
            }
        }
        this.tableWidth = totalWidth;
        this.tableComponentRef.setWidth(totalWidth);
        let tableRef = this.tableRef.instance.dom as HTMLElement;
        this.tableClientWidth = totalWidth + (tableRef.offsetWidth - tableRef.clientWidth);
        this.redrawing(false);
    }

    protected calGridHeight() {
        if (this.props.autoHeight) {
            let columnSize = this.columnsRef.getSize();
            let tableSize = this.tableComponentRef.getSize();
            let tableParent = this.tableRef.instance.dom as HTMLElement;

            let columnHeight = columnSize.height + (columnSize.height - columnSize.clientHeight);
            let tableHeight = tableSize.height + (tableParent.offsetHeight - tableParent.clientHeight);
            let autoHeight = columnHeight + tableHeight;
            if (this.onAutoHeight) {
                this.onAutoHeight(autoHeight);
            } else {
                this.setHeight(columnHeight + tableHeight);
            }
        }
    }

    setOnAutoHeight(fn: (authHeight: number) => void) {
        this.onAutoHeight = fn;
    }

    protected onColumnChange(type: string, data: TableColumnModel) {
        let columns: Array<TableColumnModel> = this.columns || [];

        if (type == 'sortAsc' || type == 'sortDesc') {
            let index = columns.indexOf(data);
            columns.splice(index, 1, {...data});
        }
        if (type == 'checked') {
            if (this.tableItemModels) {
                this.tableItemModels = [...this.tableItemModels];
                let tableItemModels = this.tableItemModels;
                if (tableItemModels) {
                    for (let tableItemModel of tableItemModels) {
                        tableItemModel.selected = data.checked;
                    }
                }
            }
        }
        this.redrawing();

        if (type == 'checked') {
            let arr = [];
            if (this.tableItemModels) {
                for (let item of this.tableItemModels) {
                    if (item.selected == true) arr.push(item);
                }
            }
            this.props.onSelectChange && this.props.onSelectChange(arr, {data: undefined, type: 3});
        }
    }

    getSelects(): Array<TableItemModel> {
        let arr = [];
        if (this.tableItemModels) {
            for (let item of this.tableItemModels) {
                if (item.selected == true) arr.push(item);
            }
        }
        return arr;
    }

    getTableItemModels(): Array<TableItemModel> {
        return this.tableItemModels;
    }

    protected onTableScroll(e: Event) {
        let columnsEl: TableColumnGroup<TableColumnGroupProps> | null = this.columnsRef,
            tableEl = this.tableRef.instance ? this.tableRef.instance.dom : undefined;
        if (columnsEl && tableEl) {
            columnsEl.setScrollLeft(tableEl.scrollLeft);
        }
    }

    protected resetTableScroll() {
        let columnsEl: TableColumnGroup<TableColumnGroupProps> | null = this.columnsRef,
            tableEl = this.tableRef.instance ? this.tableRef.instance.dom : undefined;
        if (columnsEl && tableEl) {
            columnsEl.setScrollLeft(0);
            (tableEl as HTMLElement).scrollLeft = 0;
            (tableEl as HTMLElement).scrollTop = 0;
        }
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(Grid.gridClsRoot);
        if (this.hasGridResizeCls) {
            arr.push(Grid.gridClsResize);
        }
        return arr;
    }


    storeBeforeLoad?(): void {
        this.isLoading = true;
        this.redrawing();
    }

    storeLoaded(data: Object | Object[], total?: number, originData?: any): void {
        this.isLoading = false;

        if (data instanceof Array) {
            this.tableItemModels = this.data2TableItemModels(data);
        } else {
            this.tableItemModels = [];
        }
        this.redrawing();
        this.resetTableScroll();
    }
}
