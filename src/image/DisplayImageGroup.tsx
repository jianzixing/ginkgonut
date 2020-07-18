import Ginkgo, {CSSProperties, GinkgoElement, GinkgoNode} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import DisplayImage from "./DisplayImage";
import "./DisplayImageGroup.scss";

export interface DisplayImageGroupModel {
    url: string;
    link?: string;
    style?: CSSProperties;
    type?: "center" | "fit" | "stretch";
    alt?: string;
}

export interface DisplayImageGroupProps extends ComponentProps {
    models: Array<DisplayImageGroupModel>;
    itemWidth?: number;
    itemHeight?: number;
    type?: "center" | "fit" | "stretch";
}

export default class DisplayImageGroup<P extends DisplayImageGroupProps> extends Component<P> {
    protected static displayImageGroupCls;
    protected static displayImageGroupItemCls;

    protected buildClassNames(themePrefix: string) {
        super.buildClassNames(themePrefix);

        DisplayImageGroup.displayImageGroupCls = this.getThemeClass("display-image-group");
        DisplayImageGroup.displayImageGroupItemCls = this.getThemeClass("display-image-group-item");
    }

    protected drawing(): GinkgoNode | GinkgoElement[] {
        if (this.props.models) {
            let arr = [];
            for (let m of this.props.models) {
                arr.push(<div className={DisplayImageGroup.displayImageGroupItemCls}
                              style={m.style || {}}>
                    <DisplayImage width={this.props.itemWidth}
                                  height={this.props.itemHeight}
                                  src={m.url}
                                  link={m.link}
                                  type={m.type || this.props.type}
                                  alt={m.alt}/>
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
