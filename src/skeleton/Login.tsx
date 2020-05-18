import Ginkgo, {GinkgoNode, GinkgoTools, HTMLComponent, RefObject} from "ginkgoes";
import Icon from "../icon/Icon";
import "./Login.scss";

export interface LoginProps {
    onLoginSuccess?: () => void;
}

export default class Login<P extends LoginProps> extends Ginkgo.Component<P> {
    protected remember = false;
    protected checkboxRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected loginCntRef: RefObject<HTMLComponent> = Ginkgo.createRef();

    render(): GinkgoNode {
        return (
            <div className={"app-login"}>
                <div ref={this.loginCntRef} className={"app-login-cnt"}>
                    <div className={"app-login-title"}>
                        <span>简子行平台登录</span>
                    </div>
                    <div className={"app-login-form"}>
                        <div className={"app-user-name"}>
                            <input className={"app-login-input"} placeholder={"请输入用户名"}/>
                            <Icon className={"app-login-icon"} icon={"user"}/>
                        </div>
                        <div className={"app-user-pwd"}>
                            <input className={"app-login-input"} placeholder={"请输入密码"}/>
                            <Icon className={"app-login-icon"} icon={"lock"}/>
                        </div>
                        <div className={"app-remember"}>
                            <div className={"app-remember-ck"}
                                 onClick={e => {
                                     if (this.remember) {
                                         this.remember = false;
                                         this.onRememberChange();
                                     } else {
                                         this.remember = true;
                                         this.onRememberChange();
                                     }

                                     let input = this.checkboxRef.instance.dom;
                                     if (input && input instanceof HTMLInputElement) {
                                         input.checked = this.remember;
                                     }
                                 }}>
                                <input ref={this.checkboxRef} type={"checkbox"}
                                       onChange={e => {
                                           let input = this.checkboxRef.instance.dom;
                                           if (input && input instanceof HTMLInputElement) {
                                               this.remember = input.checked;
                                               this.onRememberChange();
                                           }
                                       }}/>
                                <span>记住用户名</span>
                            </div>
                        </div>
                        <div className={"app-submit"}
                             onClick={e => {
                                 if (this.props.onLoginSuccess) {
                                     this.props.onLoginSuccess();
                                 }
                             }}>
                            <span>登录</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    onRememberChange() {
        if (this.remember) {

        }
    }

    componentWillMount() {
        this.onResize = this.onResize.bind(this);
        window.addEventListener("resize", this.onResize);
    }

    componentDidMount() {
        this.onResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
    }

    onResize() {
        let size = GinkgoTools.getWindowSize();
        document.body.style.width = size.width + "px";
        document.body.style.height = size.height + "px";
        if (this.loginCntRef && this.loginCntRef.instance) {
            let el = this.loginCntRef.instance.dom as HTMLElement;
            el.style.marginTop = (size.height - el.offsetHeight - 80) / 2 + "px";
        }
    }
}
