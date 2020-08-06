import Ginkgo from "ginkgoes";
import Component, {ComponentProps} from "./Component";

export default class Container<P extends ComponentProps> extends Component<P> {
    protected isEnableParentSize = true;

    componentUpdateProps(props: P, context?) {
        super.componentUpdateProps(props, context);
        this.setState({});
    }

    /**
     * 重新设置组件配置，比如窗口改变则会从上依次调用
     * 1 如果是布局组件则组件样式布局及大小完成后调用该方法
     * 2 如果是自定义组件则只需要覆盖该方法或者不需要任何改动
     */
    layout(): void {
        if (this.isEnableParentSize) {
            this.layoutParentSize();
        }
        this.doLayout();
        Ginkgo.forEachContent(component => {
            if (component instanceof Container) {
                component.layout();
            }
        }, this, Container);
    }

    doLayout(): void {

    }

    layoutParentSize() {
        let w, h;
        let parent = this.rootEl.dom.parentElement;
        if (parent) {
            if (this.props.width < 0 || !this.props.width) {
                w = parent.offsetWidth;
            }
            if (this.props.height < 0 || !this.props.height) {
                h = parent.offsetHeight;
            }
            if (w || h) {
                this.setSize(w, h);
            }
        }
    }
}
