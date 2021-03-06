import Ginkgo, {CSSProperties, GinkgoElement, GinkgoNode, RefObject} from "ginkgoes";
import WindowPanel, {WindowProps, WindowWrapper} from "./Window";
import Button, {ButtonProps} from "../button/Button";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import TextField from "../form/TextField";
import TextAreaField from "../form/TextAreaField";
import Progress, {ProgressProps} from "../progress/Progress";
import "./MessageBox.scss";

export interface MessageBoxProps extends WindowProps, ProgressProps {
    type?: "alert" | "confirm" | "prompt" | "progress" | "wait" | "custom";
    onOkClick?: (e, value?: string) => void;
    onCancelClick?: (e) => void;
    content?: GinkgoNode;
    multiLineInput?: boolean;
    buttons?: Array<ButtonProps>;
    value?: string;
}

// 全局对话框实例只允许有一个
let globalMessageBox: WindowWrapper;
export default class MessageBox<P extends MessageBoxProps> extends WindowPanel<P> {
    protected static messageBoxCls;
    protected static messageBoxBodyCls;
    protected static messageBoxIconBoxCls;
    protected static messageBoxIconCls;
    protected static messageBoxTextCls;
    protected static messageBoxContentCls;
    protected static messageBoxInnerCls;
    protected static messageBoxToolbarCls;
    protected static messageBoxPromptTextCls;
    protected static messageBoxProgressTextCls;
    protected static messageBoxPromptInputCls;

    protected isAllowResizable = false;
    protected inputRef: RefObject<TextAreaField<any>> = Ginkgo.createRef();
    protected progressRef: RefObject<Progress<any>> = Ginkgo.createRef();
    protected waitMessageBoxHandler;
    protected percent: number = this.props.percent || 0;

    defaultProps = {
        resizable: false,
        maskLayer: true,
        title: "MessageBox",
        closable: true
    };

    public static show(props: MessageBoxProps) {
        if (globalMessageBox) {
            globalMessageBox.close();
            globalMessageBox = null;
        }
        let wrapper: WindowWrapper = WindowPanel.open(props);
        globalMessageBox = wrapper;
        return wrapper;
    }

    public static showAlert(title: string, content: string) {
        return MessageBox.show(<MessageBox title={title} content={content}/>);
    }

    public static showConfirm(title: string, content: string,
                              onOkClick: (e) => void,
                              onCancelClick?: (e) => void) {
        return MessageBox.show(<MessageBox type={"confirm"}
                                           title={title}
                                           content={content}
                                           onOkClick={(e, value) => {
                                               onOkClick && onOkClick(e)
                                           }}
                                           onCancelClick={e => onCancelClick && onCancelClick(e)}/>)
    }

    public static showPrompt(title: string, content: string,
                             onOkClick: (e, value) => void,
                             value?: string,
                             onCancelClick?: (e) => void) {
        return MessageBox.show(<MessageBox type={"prompt"}
                                           title={title}
                                           content={content}
                                           value={value}
                                           onOkClick={(e, value) => {
                                               onOkClick && onOkClick(e, value)
                                           }}
                                           onCancelClick={e => onCancelClick && onCancelClick(e)}/>)
    }

    public static showWait() {
        return MessageBox.show(<MessageBox type={"wait"}/>)
    }

    public static close(props: MessageBoxProps) {
        Ginkgo.unmountByElement(props, document.body);
    }

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        MessageBox.messageBoxCls = this.getThemeClass("message-box");
        MessageBox.messageBoxBodyCls = this.getThemeClass("message-box-body");
        MessageBox.messageBoxIconBoxCls = this.getThemeClass("message-box-icon-box");
        MessageBox.messageBoxIconCls = this.getThemeClass("message-box-icon");
        MessageBox.messageBoxTextCls = this.getThemeClass("message-box-text");
        MessageBox.messageBoxContentCls = this.getThemeClass("message-box-content");
        MessageBox.messageBoxInnerCls = this.getThemeClass("message-box-inner");
        MessageBox.messageBoxToolbarCls = this.getThemeClass("message-box-toolbar");

        MessageBox.messageBoxPromptTextCls = this.getThemeClass("message-box-prompt-text");
        MessageBox.messageBoxPromptInputCls = this.getThemeClass("message-box-prompt-input");
        MessageBox.messageBoxProgressTextCls = this.getThemeClass("message-box-progress-text");
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this.waitMessageBoxHandler) {
            clearTimeout(this.waitMessageBoxHandler);
            this.waitMessageBoxHandler = null;
        }
    }

    protected drawing(): GinkgoElement | undefined | null {
        if (this.props.type == "wait") {
            this.isShowHeader = false;
            if (this.waitMessageBoxHandler) {
                clearTimeout(this.waitMessageBoxHandler);
                this.waitMessageBoxHandler = null;
            }
            this.waitMessageBoxHandler = setInterval(() => {
                this.setPercent(this.percent);
                this.percent += 20;
                if (this.percent > 100) this.percent = 0;
            }, 300);
        }
        return super.drawing();
    }

    protected drawingWindowChildren(): GinkgoElement | Array<GinkgoElement> {
        let buttons = [],
            content = [];
        if (this.props.type == "confirm") {
            buttons.push(<Button text={"Yes"} width={75}
                                 onClick={this.onYesClick.bind(this)}/>);
            buttons.push(<Button text={"No"} width={75} style={{marginLeft: 10}}
                                 onClick={this.onNoClick.bind(this)}/>);
            content.push(
                <div className={MessageBox.messageBoxContentCls}>
                    <div className={MessageBox.messageBoxIconBoxCls}>
                        <Icon className={MessageBox.messageBoxIconCls} icon={IconTypes.questionCircle}/>
                    </div>
                    <div className={MessageBox.messageBoxTextCls}>
                        <span>{this.props.content}</span>
                    </div>
                </div>
            )
        } else if (this.props.type == "prompt") {
            buttons.push(<Button text={"Yes"} width={75}
                                 onClick={this.onYesClick.bind(this)}/>);
            buttons.push(<Button text={"Cancel"} width={75} style={{marginLeft: 10}}
                                 onClick={this.onNoClick.bind(this)}/>);

            content.push(<span className={MessageBox.messageBoxPromptTextCls}>{this.props.content}</span>);
            let defaultValue = this.props.value;
            if (this.props.multiLineInput) {
                content.push(<TextAreaField ref={this.inputRef}
                                            className={MessageBox.messageBoxPromptInputCls}
                                            {...defaultValue ? {value: defaultValue} : {}}/>)
            } else {
                content.push(<TextField ref={this.inputRef}
                                        className={MessageBox.messageBoxPromptInputCls}
                                        {...defaultValue ? {value: defaultValue} : {}}/>);
            }
        } else if (this.props.type == "progress") {
            content.push(<span className={MessageBox.messageBoxProgressTextCls}>{this.props.content}</span>);
            content.push(<Progress ref={this.progressRef}
                                   style={{width: "100%"}}
                                   percent={this.props.percent}
                                   text={this.props.text || "completed"}
                                   onTextRender={this.props.onTextRender}/>);
        } else if (this.props.type == "wait") {
            content.push(<Progress ref={this.progressRef}
                                   style={{width: "100%"}}
                                   percent={this.props.percent}/>);
        } else if (this.props.type == "custom") {
            if (this.props.buttons) {
                let i = 0;
                for (let btn of this.props.buttons) {
                    let style = btn.style || {};
                    if (style.width == null) {
                        style.minWidth = 75;
                    }
                    if (i != 0) {
                        if (style.marginLeft == null) {
                            style.marginLeft = 10;
                        }
                    }
                    btn.style = style;
                    buttons.push(btn);
                    i++;
                }
            }
            content.push(<span>{this.props.content}</span>);
        } else {
            buttons.push(<Button text={"OK"} width={75} onClick={this.onOKClick.bind(this)}/>);
            content.push(<span>{this.props.content}</span>);
        }

        let toolbar;
        if (buttons && buttons.length > 0) {
            toolbar = (
                <div className={MessageBox.messageBoxToolbarCls}>
                    {buttons}
                </div>
            )
        }

        return (
            <div className={MessageBox.messageBoxCls}>
                <div className={MessageBox.messageBoxBodyCls}>
                    <div className={MessageBox.messageBoxInnerCls}>
                        {content}
                    </div>
                </div>
                {toolbar}
            </div>
        );
    }

    protected onOKClick(e) {
        if (this.props.windowWrapper) {
            this.props.windowWrapper.close();
        }
        if (this.props.onWindowClose) {
            this.props.onWindowClose(e);
        }

        let text;
        if (this.inputRef && this.inputRef.instance) {
            text = this.inputRef.instance.getValue();
        }

        if (this.props.onOkClick) {
            this.props.onOkClick(e, text);
        }
    }

    protected onYesClick(e) {
        this.onOKClick(e);
    }

    protected onNoClick(e) {
        if (this.props.windowWrapper) {
            this.props.windowWrapper.close();
        }
        if (this.props.onWindowClose) {
            this.props.onWindowClose(e);
        }
        if (this.props.onCancelClick) {
            this.props.onCancelClick(e);
        }
    }

    componentWillReceiveProps(props: P, context?) {
        this.width = 250;
        if (this.props.multiLineInput && this.props.type == "prompt") {
            this.width = 350;
        }
        if (this.props.type == "custom") {
            this.width = null;
        }
        if (this.props.width > 0) {
            this.width = this.props.width;
        }
    }

    protected getRootStyle(): CSSProperties {
        let style = super.getRootStyle(true);
        style.minHeight = 130;
        if (this.props.type == "wait") {
            style.minHeight = 40;
        }
        if (this.props.type == "custom") {
            style.minWidth = 300;
        }
        return style;
    }

    setPercent(percent?: number) {
        if (this.progressRef && this.progressRef.instance) {
            this.progressRef.instance.setPercent(percent);
        }
    }
}
