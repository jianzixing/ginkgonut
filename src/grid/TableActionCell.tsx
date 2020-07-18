import Ginkgo, {CSSProperties, GinkgoElement, GinkgoNode} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import "./TableActionCell.scss";
import {ActionColumnItem} from "./TableRow";
import {TableColumnModel} from "./TableColumn";
import Icon from "../icon/Icon";
import {Tooltip} from "../ginkgonut";

export interface TableActionCellProps extends ComponentProps {
    item: ActionColumnItem;
    column: TableColumnModel;
    data: any;
    value: any;
}

export default class TableActionCell<P extends TableActionCellProps> extends Component<P> {
    protected static rootCls;
    protected static actionItemCls;
    protected handler;
    protected toolTip;
    protected xy: { x: number, y: number } = {x: 0, y: 0};

    protected buildClassNames(themePrefix: string) {
        super.buildClassNames(themePrefix);

        TableActionCell.rootCls = this.getThemeClass("action-item");
        TableActionCell.actionItemCls = this.getThemeClass("action-item-text");
    }

    protected drawing(): GinkgoNode | GinkgoElement[] {
        let item = this.props.item;
        if (item.iconType) {
            return <Icon icon={item.iconType}/>
        } else if (item.icon) {
            return <img src={item.icon}/>
        } else if (item.text) {
            return <span>{item.text}</span>
        }
    }

    componentDidMount() {
        super.componentDidMount();
        let dom = this.rootEl.dom;
        if (dom) {
            dom.addEventListener("mousemove", (evt: any) => {
                this.xy.x = evt.pageX;
                this.xy.y = evt.pageY;
            });
        }
    }

    protected onMouseEnter(e: Event) {
        super.onMouseEnter(e);
        let item = this.props.item;
        if (item.tooltip) {
            if (this.handler) {
                clearTimeout(this.handler);
                this.handler = null;
            }
            this.handler = setTimeout(() => {
                this.toolTip = Tooltip.show(<Tooltip x={this.xy.x}
                                                     y={this.xy.y}
                                                     alignAdjust={16}
                                                     position={"mouse"}>
                    <span>{item.tooltip}</span>
                </Tooltip>)
            }, 200);
        }
    }

    protected onMouseLeave(e: Event) {
        super.onMouseLeave(e);
        if (this.toolTip) {
            this.toolTip.close();
        }
        clearTimeout(this.handler);
        this.handler = null;
    }

    protected onClick(e: Event) {
        let item = this.props.item;
        if (item.onActionClick) {
            item.onActionClick(this.props.value, this.props.data);
        }
    }

    protected getRootClassName(): string[] {
        let item = this.props.item;
        let arr = super.getRootClassName();
        arr.push(TableActionCell.rootCls);
        if (item.text) {
            arr.push(TableActionCell.actionItemCls);
        }
        return arr;
    }

    protected getRootStyle(): CSSProperties {
        let item = this.props.item;
        let style = super.getRootStyle();
        if (item.style) {
            for (let k in item.style) {
                style[k] = item.style[k];
            }
        }
        return style;
    }
}
