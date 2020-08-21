import Ginkgo, {CSSProperties, GinkgoElement, GinkgoNode} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import DisplayImage from "./DisplayImage";
import "./DisplayImageGroup.scss";

export interface DisplayImageGroupModel {
    url: string;
    link?: string;
    style?: CSSProperties;
    bodyStyle?: CSSProperties;
    labelStyle?: CSSProperties;
    type?: "center" | "fit" | "stretch";
    alt?: string;
    data?: any;
    select?: boolean;
}

export interface DisplayImageGroupProps extends ComponentProps {
    models: Array<DisplayImageGroupModel>;
    itemWidth?: number;
    itemHeight?: number;
    type?: "center" | "fit" | "stretch";
    onItemClick?: (e: Event, model: DisplayImageGroupModel) => void;
    splitWidth?: number;
    useSelect?: "multi" | "single";
    itemBodyWidth?: number;
    itemBodyHeight?: number;
    showImageName?: string;
    bodyStyle?: CSSProperties;
    labelStyle?: CSSProperties;
}

export default class DisplayImageGroup<P extends DisplayImageGroupProps> extends Component<P> {
    protected static displayImageGroupCls;
    protected static displayImageGroupItemCls;
    protected static displayImageGroupItemSelCls;
    protected static displayImageGroupItemSelEmptyCls;
    protected static displayImageGroupLabelCls;

    protected buildClassNames(themePrefix: string) {
        super.buildClassNames(themePrefix);

        DisplayImageGroup.displayImageGroupCls = this.getThemeClass("display-image-group");
        DisplayImageGroup.displayImageGroupItemCls = this.getThemeClass("display-image-group-item");
        DisplayImageGroup.displayImageGroupItemSelCls = this.getThemeClass("display-image-group-sel");
        DisplayImageGroup.displayImageGroupItemSelEmptyCls = this.getThemeClass("display-image-group-selempty");
        DisplayImageGroup.displayImageGroupLabelCls = this.getThemeClass("display-image-group-label");
    }

    protected drawing(): GinkgoNode | GinkgoElement[] {
        if (this.props.models) {
            let arr = [];
            for (let m of this.props.models) {
                let cls = [DisplayImageGroup.displayImageGroupItemCls];
                let style = m.bodyStyle || this.props.bodyStyle || {};
                let labelStyle = m.labelStyle || this.props.labelStyle || {};
                if (this.props.splitWidth != null) {
                    style.marginRight = this.props.splitWidth + "px";
                    style.marginBottom = this.props.splitWidth + "px";
                }
                if (this.props.itemBodyWidth) {
                    style.width = this.props.itemBodyWidth;
                }
                if (this.props.itemBodyHeight) {
                    style.height = this.props.itemBodyHeight;
                }
                if (this.props.useSelect != null) cls.push(DisplayImageGroup.displayImageGroupItemSelEmptyCls);
                if (m.select == true) cls.push(DisplayImageGroup.displayImageGroupItemSelCls);
                let label;
                if (this.props.showImageName) {
                    if (m.data && m.data[this.props.showImageName])
                        label = <div className={DisplayImageGroup.displayImageGroupLabelCls}
                                     style={labelStyle}>
                            {m.data[this.props.showImageName]}
                        </div>;
                    else
                        label = <div className={DisplayImageGroup.displayImageGroupLabelCls}
                                     style={labelStyle}>&nsbp;</div>;
                }
                arr.push(<div className={cls}
                              style={style}
                              onClick={e => {
                                  if (this.props.useSelect == "single") {
                                      for (let m of this.props.models) {
                                          m.select = false;
                                      }
                                  }
                                  if (this.props.useSelect != null) {
                                      if (m.select) m.select = false; else m.select = true;
                                      this.setState();
                                  }
                              }}>
                    <DisplayImage width={this.props.itemWidth}
                                  height={this.props.itemHeight}
                                  src={m.url}
                                  link={m.link}
                                  type={m.type || this.props.type}
                                  alt={m.alt}
                                  style={m.style}
                                  onClick={e => {
                                      if (this.props.onItemClick) {
                                          this.props.onItemClick(e, m);
                                      }
                                  }}/>
                    {label}
                </div>);
            }
            return arr;
        }
        return undefined;
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(DisplayImageGroup.displayImageGroupCls);
        return arr;
    }
}
