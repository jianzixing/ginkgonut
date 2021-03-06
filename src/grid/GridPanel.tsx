import Ginkgo, {GinkgoElement, GinkgoNode, HTMLComponent, RefObject} from "ginkgoes";
import Panel, {PanelProps} from "../panel/Panel";
import Grid, {GridProps} from "./Grid";
import PagingToolbar, {PagingToolbarProps} from "../toolbar/PagingToolbar";
import {ToolbarProps} from "../toolbar/Toolbar";
import "./GridPanel.scss";
import {TableItemModel} from "./Table";

export interface GridPanelProps extends PanelProps, GridProps {
    paging?: boolean | PagingToolbarProps;
    pagingHideLabel?: boolean;
}

export default class GridPanel<P extends GridPanelProps> extends Panel<P> {
    protected static gridPanelBodyCls;

    protected gridPanelBodyRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected gridRef: RefObject<Grid<any>> = Ginkgo.createRef();
    protected gridWidth: number;
    protected gridHeight: number;

    public grid: Grid<any>;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        GridPanel.gridPanelBodyCls = this.getThemeClass("gridpanel-body");
    }

    protected drawingPanelChild(): GinkgoNode | GinkgoElement[] {
        return [
            <div ref={this.gridPanelBodyRef} className={GridPanel.gridPanelBodyCls}>
                <Grid
                    {...this.props}
                    width={this.gridWidth}
                    height={this.gridHeight}
                    ref={(c: Grid<any>) => {
                        this.gridRef.instance = c;
                        this.grid = c;
                        c.setOnAutoHeight((authHeight: number) => {
                            this.setGridPanelSize(null, authHeight);
                            let height = authHeight;
                            let toolbar = 0;
                            if (this.toolbarTopEl) toolbar += this.toolbarTopEl.height;
                            if (this.toolbarBottomEl) toolbar += this.toolbarBottomEl.height;
                            if (this.headerEl) {
                                let headerEl = this.headerEl.dom as HTMLElement;
                                height += headerEl.offsetHeight;
                            }
                            height += toolbar;
                            this.setHeight(height);
                        });
                    }}
                />
            </div>
        ];
    }

    componentRenderUpdate() {
        this.setGridPanelSize();
    }

    protected getToolbars(): Array<ToolbarProps> {
        let toolbars = super.getToolbars();
        toolbars = toolbars ? [...toolbars] : [];
        if (this.props.paging) {
            if (typeof this.props.paging == "object") {
                let props = this.props;
                props.paging['store'] = props.store;
                if (!props.paging['align']) {
                    props.paging['align'] = "bottom";
                    // props.paging['border'] = "top";
                } else if (!props.paging['border']) {
                    if (props.paging['align'] == "top") {
                        // props.paging['border'] = "bottom";
                    }
                    if (props.paging['align'] == "bottom") {
                        // props.paging['border'] = "top";
                    }
                }
                toolbars.push(this.props.paging as ToolbarProps);
            } else {
                toolbars.push(<PagingToolbar
                    store={this.props.store}
                    hideLabel={this.props.pagingHideLabel === true}
                    align={"bottom"}
                    border={"top"}
                />);
            }
        }
        return toolbars;
    }

    private setGridPanelSize(width?: number, height?: number) {
        if (this.gridPanelBodyRef
            && this.gridPanelBodyRef.instance
            && this.gridRef
            && this.gridRef.instance
            && this.props.autoHeight) {
            let dom = this.gridPanelBodyRef.instance.dom as HTMLElement;
            let grid = this.gridRef.instance;
            this.gridWidth = dom.offsetWidth;
            this.gridHeight = dom.offsetHeight;
            grid.setSize(width ? width : this.gridWidth, height ? height : this.gridHeight);
        }
    }

    getSelects(): Array<TableItemModel> {
        if (this.gridRef && this.gridRef.instance) {
            return this.gridRef.instance.getSelects();
        }
    }

    getTableItemModels(): Array<TableItemModel> {
        if (this.gridRef && this.gridRef.instance) {
            return this.gridRef.instance.getTableItemModels();
        }
    }
}
