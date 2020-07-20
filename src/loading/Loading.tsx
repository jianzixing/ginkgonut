import Ginkgo, {GinkgoElement, HTMLComponent, RefObject} from "ginkgoes";
import "../component/Component.scss";
import "./Loading.scss";

export interface LoadingProps extends GinkgoElement {
    text?: string;
}

export default class Loading<P extends LoadingProps> extends Ginkgo.Component<P> {

    protected rootEl: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected loadingEl: RefObject<HTMLComponent> = Ginkgo.createRef();

    render() {
        return (
            <div ref={this.rootEl} className={["x-component", "x-loading"]}>
                <div className={"x-loading-table"}>
                    <div className={"x-loading-table-cell"}>
                        <div ref={this.loadingEl} className={"x-loading-msg"}>
                            <span>{this.props.text || "Loading..."}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
