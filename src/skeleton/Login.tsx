import Ginkgo, {GinkgoNode, GinkgoTools, HTMLComponent, InputComponent, QueryObject, RefObject} from "ginkgoes";
import Icon from "../icon/Icon";
import CookieTools from "../tools/CookieTools";
import "./Login.scss";

export interface LoginProps {
    enableValidCode?: boolean;
    onLoginClick?: (info: { userName: string, password: string, code: string }, login: Login<any>) => void;
    codeUrl?: string;
    checkLogin?: boolean;
}

export default class Login<P extends LoginProps> extends Ginkgo.Component<P> {
    protected remember = false;
    protected status = 0;
    protected loginText = "登录";
    protected error = false;
    protected errorText;
    protected checkLogin = this.props.checkLogin;

    protected codeUrl = this.props.codeUrl;
    protected currCodeUrl = this.props.codeUrl;

    protected checkboxRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected loginCntRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected userNameRef: RefObject<InputComponent> = Ginkgo.createRef();
    protected passwordRef: RefObject<InputComponent> = Ginkgo.createRef();
    protected codeRef: RefObject<InputComponent> = Ginkgo.createRef();
    protected errorRef: QueryObject<HTMLComponent> = Ginkgo.createQuery(this, ".app-login-error");

    render(): GinkgoNode {
        let hasCode = this.props.enableValidCode;
        let errCls = ["app-login-error"];
        if (this.error) {
            errCls.push("app-login-error-show");
        }

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
                        <div className={"app-user-pwd " + (hasCode ? "" : "app-user-pwd-last")}>
                            <input ref={this.passwordRef} className={"app-login-input"} placeholder={"请输入密码"}/>
                            <Icon className={"app-login-icon"} icon={"lock"}/>
                        </div>
                        {hasCode ?
                            <div className={"app-user-code"}>
                                <div className={"app-login-input app-login-code"}>
                                    <input ref={this.codeRef} placeholder={"验证码"}/>
                                    <img src={this.currCodeUrl}
                                         onClick={e => {
                                             if (this.codeUrl.indexOf("?") >= 0) {
                                                 this.currCodeUrl = this.codeUrl + "&t=" + (new Date()).getTime();
                                             } else {
                                                 this.currCodeUrl = this.codeUrl + "?t=" + (new Date()).getTime();
                                             }
                                             this.forceRender();
                                         }}/>
                                </div>
                                <Icon className={"app-login-icon"} icon={"user-shield"}/>
                            </div> : undefined
                        }
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
                                 if (this.userNameRef.instance && this.passwordRef.instance && this.status == 0) {
                                     let userName = this.userNameRef.instance.value;
                                     let password = this.passwordRef.instance.value;
                                     let code = this.codeRef.instance.value;

                                     if (!userName || userName == "") {
                                         this.showErrorTips();
                                         return;
                                     }
                                     if (!password || password == "") {
                                         this.showErrorTips();
                                         return;
                                     }
                                     if (this.props.enableValidCode && (!code || code == "")) {
                                         this.showErrorTips("验证码不能为空");
                                         return;
                                     }

                                     if (this.remember && userName && userName != '') {
                                         CookieTools.setCookie("jianzixing_username", userName);
                                     }

                                     if (this.props.onLoginClick) {
                                         this.props.onLoginClick(
                                             {
                                                 userName: "" + userName,
                                                 password: "" + password,
                                                 code: "" + code
                                             },
                                             this);
                                     }
                                 }
                             }}>
                            <span>{this.loginText}</span>
                        </div>
                    </div>

                    {this.checkLogin ?
                        <div className={"app-login-mask"}>
                            <div className={"app-login-mask-text"}>正在检查是否登录,请稍后</div>
                        </div> : undefined}
                </div>
                <div className={errCls}>
                    <span>{this.errorText ? this.errorText : "用户名或密码不能为空"}</span>
                </div>
            </div>
        );
    }

    componentReceiveProps(props: P, context?: { oldProps: P; type: "new" | "mounted" }) {
        if (this.checkLogin != props.checkLogin) {
            this.checkLogin = props.checkLogin;
            this.forceRender();
        }
    }

    showErrorTips(text?: string) {
        this.error = true;
        this.errorText = text;
        let ins = this.errorRef.instance;
        if (ins) {
            let el = ins.dom as HTMLElement;
            let size = GinkgoTools.getWindowSize();
            this.forceRender();
            el.style.left = (size.width - el.offsetWidth) / 2 + "px";
            ins.animation({
                top: 30
            })
            setTimeout(() => {
                this.error = false;
                this.forceRender();
            }, 3000);
        }
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

    setStatus(text: string, status: number) {
        this.loginText = text;
        this.status = status;
        this.forceRender();
    }
}
