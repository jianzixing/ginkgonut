import Ginkgo, {GinkgoElement, GinkgoNode, HTMLComponent, RefObject} from "ginkgoes";
import {NavModuleModel} from "./AppNavigation";
import "./AppPanel.scss";
import Component from "../component/Component";
import Panel from "../panel/Panel";

export interface AppPanelProps {

}

export interface AppManagerProps {
    navModule?: NavModuleModel;
    navPanel?: AppPanel<AppPanelProps>;
}

export default class AppPanel<P extends AppPanelProps> extends Component<P> {
    private history: Array<GinkgoElement> = [];

    drawing() {
        let children = this.history;
        if (children.length == 0 && this.props.children) {
            for (let c of this.props.children) {
                this.history.push(c);
            }
        }
        // delete 测试新建组件效率以及内存泄露问题
        // children = [this.history[this.history.length - 1]];

        let childEls = [];
        if (children && children.length > 0) {
            let i = 0;
            for (let c of children) {
                let cls = ["x-app-panel-item"];
                if (i == children.length - 1) {
                    cls.push("x-app-panel-show")
                }
                childEls.push(<div className={cls}>{c}</div>);
                i++;
            }
        }

        return childEls;
    }

    componentRenderUpdate(props?: P, state?: {}) {
        if (this.content) {
            let childrens = this.content.children;
            if (childrens && childrens.length > 0) {
                for (let children of childrens) {
                    let nextChild = children.children[0];
                    let content = nextChild.content as Component<any>;
                    if (content instanceof Panel) {
                        content.setClassName(["x-app-panel-body"]);
                    }
                }
            }
        }
    }

    forward(element: GinkgoElement) {
        let ref = Ginkgo.createRef();
        ref.instance = this;
        element['navPanel'] = ref;
        this.history.push(element);
        this.setState();
    }

    back() {
        if (this.history.length > 1) {
            this.history.splice(this.history.length - 1, 1);
        }
        this.setState();
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push("x-app-panel");
        return arr;
    }
}

export class AppManager<P extends AppManagerProps> extends Ginkgo.Component<P> {
    forward(element: GinkgoElement) {
        let props = this.props;
        let ref: RefObject<AppPanel<any>> = props.navPanel as RefObject<AppPanel<any>>;
        if (ref && ref.instance) {
            element['navModule'] = props.navModule;
            ref.instance.forward(element);
        }
    }

    back() {
        let props = this.props;
        let ref: RefObject<AppPanel<any>> = props.navPanel as RefObject<AppPanel<any>>;
        if (ref && ref.instance) {
            ref.instance.back()
        }
    }
}
