import Ginkgo, {GinkgoNode, GinkgoTools, HTMLComponent, InputComponent, RefObject} from "ginkgoes";
import Icon from "../icon/Icon";
import "./Login.scss";
import CookieTools from "../tools/CookieTools";

export interface LoginProps {
    onLoginClick?: (info: { userName: string, password: string }) => void;
}

export default class Login<P extends LoginProps> extends Ginkgo.Component<P> {
    protected remember = false;
    protected checkboxRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected loginCntRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected userNameRef: RefObject<InputComponent> = Ginkgo.createRef();
    protected passwordRef: RefObject<InputComponent> = Ginkgo.createRef();

    render(): GinkgoNode {
        return (
            <div className={"app-login"}>
                <div ref={this.loginCntRef} className={"app-login-cnt"}>
                    <div className={"app-login-title"}>
                        <span>简子行平台登录</span>
                    </div>
                    <div className={"app-login-form"}>
                        <div className={"app-user-name"}>
                            <input ref={this.userNameRef} className={"app-login-input"} placeholder={"请输入用户名"}/>
                            <Icon className={"app-login-icon"} icon={"user"}/>
                        </div>
                        <div className={"app-user-pwd"}>
                            <input ref={this.passwordRef} className={"app-login-input"} placeholder={"请输入密码"}/>
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
                                 if (this.userNameRef.instance && this.passwordRef.instance) {
                                     let userName = this.userNameRef.instance.value;
                                     let password = this.passwordRef.instance.value;

                                     if (this.remember && userName && userName != '') {
                                         CookieTools.setCookie("jianzixing_username", userName);
                                     }

                                     if (this.props.onLoginClick) {
                                         this.props.onLoginClick({userName: "" + userName, password: "" + password});
                                     }
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
            CookieTools.setCookie("jianzixing_remember", "1");
        } else {
            CookieTools.delCookie("jianzixing_username");
            CookieTools.delCookie("jianzixing_remember");
        }
    }

    componentWillMount() {
        this.onResize = this.onResize.bind(this);
        window.addEventListener("resize", this.onResize);
    }

    componentDidMount() {
        this.onResize();

        if (this.userNameRef.instance) {
            let useName = CookieTools.getCookie("jianzixing_username");
            let remember = CookieTools.getCookie("jianzixing_remember");
            if (useName) {
                this.userNameRef.instance.value = "" + useName;
            }
            if (remember == "1") {
                let input = this.checkboxRef.instance.dom;
                if (input && input instanceof HTMLInputElement) {
                    input.checked = true;
                }
            }
        }
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
