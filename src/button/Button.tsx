import Ginkgo, {CSSProperties, GinkgoNode, GinkgoElement} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import Menu, {MenuModel, MenuProps, MenuShowing} from "../menu/Menu";
import "./Button.scss";

export interface ButtonProps extends ComponentProps {
    /**
     * default 默认button按钮
     * submit  提交表单按钮
     * resetForm  清空表单内容
     * close   关闭按钮(比如WindowPanel)
     */
    type?: "default" | "submit" | "resetForm" | "close";
    text?: string;
    action?: "default" | "light" | "none";
    disabled?: boolean;
    selected?: boolean;

    icon?: string;
    iconType?: string;
    iconAlign?: "left" | "top" | "right" | "bottom";
    iconColor?: string;
    iconStyle?: CSSProperties;

    size?: "small" | "medium" | "large";
    toggle?: boolean;
    menuType?: "normal" | "bottom" | "splitNormal" | "splitBottom";
    menuModels?: Array<MenuModel>;
    clickCloseMenu?: boolean;
    onMenuItemClick?: (e: Event, value: MenuModel, menu?: Menu<MenuProps>) => void;
    onMenuClose?: (menu: MenuProps) => void
    contentAlign?: "left" | "center" | "right";
    href?: string;
    target?: string;
    outerStyle?: CSSProperties;
    outerClassName?: string;
    pressing?: boolean;
}

export default class Button<P extends ButtonProps> extends Component<P> {
    protected static buttonClsRoot;
    protected static buttonClsDisabled;
    protected static buttonClsOuter;
    protected static buttonClsDefault;
    protected static buttonClsAction;
    protected static buttonClsNone;
    protected static buttonClsInner;
    protected static buttonClsBody;
    protected static buttonClsIcon;
    protected static buttonClsIconRight;
    protected static buttonClsImg;
    protected static buttonClsText;

    protected static buttonClsMedium;
    protected static buttonClsLarge;

    protected static buttonClsIconAlignTop;
    protected static buttonClsIconAlignRight;
    protected static buttonClsIconAlignBottom;

    protected static buttonClsArrow;
    protected static buttonClsSplit;
    protected static buttonClsSplitBottom;
    protected static buttonClsArrowBottom;

    protected static buttonClsOuterLeft;
    protected static buttonClsOuterRight;

    protected static buttonMenus: Array<{ menu: MenuShowing, button: Button<any> }>;

    protected isEnableHovered = true;
    protected isEnableSelected = true;
    protected isEnableWindowResize = true;
    protected isEnableDocumentClick = true;

    /**
     * 当props.type不为default时可能需要额外的事件
     * 比如FormPanel的onSubmit
     */
    protected onTypeEvent: (e) => void;

    defaultProps = {
        isAction: true
    };

    constructor(props) {
        super(props);

        this.checkPressState = this.checkPressState.bind(this);
    }

    protected buildClassNames(themePrefix: string) {
        super.buildClassNames(themePrefix);

        Button.buttonClsRoot = this.getThemeClass("button");
        Button.buttonClsDisabled = this.getThemeClass("btn-disabled");
        Button.buttonClsOuter = this.getThemeClass("btn-outer");
        Button.buttonClsDefault = this.getThemeClass("btn-default");
        Button.buttonClsAction = this.getThemeClass("btn-action");
        Button.buttonClsNone = this.getThemeClass("btn-none");
        Button.buttonClsInner = this.getThemeClass("btn-inner");
        Button.buttonClsBody = this.getThemeClass("btn-body");
        Button.buttonClsIcon = this.getThemeClass("btn-icon");
        Button.buttonClsIconRight = this.getThemeClass("icon-right");
        Button.buttonClsImg = this.getThemeClass("btn-img");
        Button.buttonClsText = this.getThemeClass("btn-text");
        Button.buttonClsMedium = this.getThemeClass("button-medium");
        Button.buttonClsLarge = this.getThemeClass("button-large");
        Button.buttonClsIconAlignTop = this.getThemeClass("btn-align-top");
        Button.buttonClsIconAlignRight = this.getThemeClass("btn-align-right");
        Button.buttonClsIconAlignBottom = this.getThemeClass("btn-align-bottom");
        Button.buttonClsArrow = this.getThemeClass("btn-arrow");
        Button.buttonClsSplit = this.getThemeClass("btn-split");
        Button.buttonClsSplitBottom = this.getThemeClass("btn-split-bottom");
        Button.buttonClsArrowBottom = this.getThemeClass("btn-arrow-bottom");
        Button.buttonClsOuterLeft = this.getThemeClass("btn-outer-left");
        Button.buttonClsOuterRight = this.getThemeClass("btn-outer-right");
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.closeButtonMenus();
    }

    drawing(): GinkgoElement | any {
        let buttonInnerCls = [Button.buttonClsInner],
            buttonOuterCls = [Button.buttonClsOuter],
            buttonTopEl: Array<GinkgoNode> = [],
            buttonTextEl: Array<GinkgoNode> = [],
            buttonBottomEl: Array<GinkgoNode> = [],
            buttonOuterEl: Array<GinkgoNode> = [],
            attrs: any = {},
            iconType = this.props.iconType,
            iconColor = this.props.iconColor,
            iconCls = [Button.buttonClsIcon],
            icon = this.props.icon,
            text = this.props.text,
            iconAlign = this.props.iconAlign,
            menuType = this.props.menuType,
            contentAlign = this.props.contentAlign,
            href = this.props.href,
            target = this.props.target;

        if (this.props.menuModels
            && this.props.menuModels.length > 0
            && !menuType) {
            menuType = "normal";
        }
        if (text) {
            iconCls.push(Button.buttonClsIconRight);
        }
        if (iconType) {
            let style: CSSProperties = this.props.iconStyle || {};
            if (iconColor) style.color = iconColor;
            buttonTextEl.push(
                <span key={1} className={iconCls}>
                    <Icon icon={iconType} style={style}/>
                </span>);
        }
        if (icon) {
            iconCls.push(Button.buttonClsImg);
            let style: CSSProperties = this.props.iconStyle || {};
            buttonTextEl.push(
                <span key={2} className={iconCls}>
                    <img src={icon} style={style}/>
                </span>);
        }

        if (text) {
            if (iconAlign == "right" || iconAlign == "bottom") {
                buttonTextEl.splice(0, 0, <span key={3} className={Button.buttonClsText}>{text}</span>);
            } else {
                buttonTextEl.push(<span key={3} className={Button.buttonClsText}>{text}</span>);
            }
        }

        if (menuType == "normal") {
            let cls = Button.buttonClsArrow;
            buttonBottomEl.push(
                <div key={1} className={cls}>
                    <Icon icon={IconTypes.caretDown}/>
                </div>
            )
        }
        if (menuType == "splitNormal") {
            buttonOuterEl.push(
                <div key={1} className={Button.buttonClsSplit} onClick={() => {
                    this.showButtonMenus();
                }}>
                    <Icon icon={IconTypes.caretDown}/>
                </div>
            )
        }
        if (menuType == "bottom") {
            buttonInnerCls.push(Button.buttonClsArrowBottom);
            let cls = Button.buttonClsArrow;
            buttonBottomEl.push(
                <div key={2} className={cls}>
                    <Icon icon={IconTypes.caretDown}/>
                </div>
            )
        }
        if (menuType == "splitBottom") {
            buttonOuterCls.push(Button.buttonClsSplitBottom);
            buttonOuterEl.push(
                <div key={2} className={Button.buttonClsSplit} onClick={() => {
                    this.showButtonMenus();
                }}>
                    <Icon icon={IconTypes.caretDown}/>
                </div>
            )
        }

        if (contentAlign == "left") buttonOuterCls.push(Button.buttonClsOuterLeft);
        if (contentAlign == "right") buttonOuterCls.push(Button.buttonClsOuterRight);

        if (href) {
            attrs.href = href;
            attrs.target = target || "_blank";
        }

        attrs.style = {...attrs.style || {}, ...this.props.outerStyle || {}};
        if (this.props.outerClassName) {
            let cs = this.props.outerClassName.split(" ");
            cs.filter(value => buttonOuterCls.push(value.trim()));
        }
        return (
            <a
                {...attrs}
                className={buttonOuterCls}
            >
                <div className={buttonInnerCls}>
                    {buttonTopEl}
                    <div className={Button.buttonClsBody}>
                        {buttonTextEl}
                    </div>
                    {buttonBottomEl}
                </div>
                {buttonOuterEl}
            </a>
        );
    }

    private showButtonMenus(): boolean {
        if (!Button.buttonMenus) Button.buttonMenus = [];
        let isShowMenu = false;
        for (let bm of Button.buttonMenus) {
            if (bm.button == this) {
                isShowMenu = true;
            }
        }
        if (isShowMenu) {
            this.setPressing(false);
            this.closeButtonMenus();
            return true;
        } else {
            if (Button.buttonMenus && Button.buttonMenus.length > 0) {
                this.closeButtonMenus();
            }
            let bounds = this.getBounds(null, true);
            Button.buttonMenus.push(
                {
                    menu: Menu.show(
                        <Menu
                            x={bounds.x}
                            y={bounds.y + bounds.h}
                            items={this.props.menuModels}
                            clickCloseMenu={this.props.clickCloseMenu === true}
                            onMenuItemClick={(e: Event, value: MenuModel, menu: Menu<MenuProps>) => {
                                if (this.props.onMenuItemClick) {
                                    this.props.onMenuItemClick(e, value, menu);
                                }
                                if (this.props.clickCloseMenu !== true) {
                                    this.setPressing(false);
                                    this.closeButtonMenus();
                                }
                            }}
                            onMenuClose={menu => {
                                this.setPressing(false);
                                this.clearBoundsParentScrollEvents();
                                Button.buttonMenus = Button.buttonMenus.filter(value => value.menu.component != menu);
                                if (this.props.onMenuClose) {
                                    this.props.onMenuClose(menu);
                                }
                            }}
                        />),
                    button: this
                }
            );
            this.setPressing(true);
        }
        return false;
    }

    protected checkPressState() {
        document.removeEventListener("mouseup", this.checkPressState);
        if (this.isOnPressing) {
            let isShowMenu = false;
            if (Button.buttonMenus && Button.buttonMenus.length > 0) {
                for (let bm of Button.buttonMenus) {
                    if (bm.button == this) isShowMenu = true;
                }
            }
            if (!isShowMenu) {
                this.setPressing(false);
            }
        }
    }

    private closeButtonMenus() {
        if (Button.buttonMenus && Button.buttonMenus.length > 0) {
            Button.buttonMenus.map(value => {
                if (value.button == this) {
                    value.menu.close();
                }
            });
            Button.buttonMenus = Button.buttonMenus.filter(value => value.button != this);
        }
        this.clearBoundsParentScrollEvents();
    }

    protected onWindowResize(e: Event) {
        this.resizeButtonMenus();
    }

    protected onParentScrolling(e) {
        this.closeButtonMenus();
    }

    protected resizeButtonMenus() {
        if (Button.buttonMenus) {
            this.closeButtonMenus();
        }
    }

    protected onClick(e: Event) {
        super.onClick(e);

        if (!this.props.disabled) {
            if (this.props.toggle == true) {
                if (this.isOnPressing) {
                    this.setPressing(false);
                } else {
                    this.setPressing(true);
                }
            }

            if (this.props.menuModels && (
                this.props.menuType == null
                || this.props.menuType == undefined
                || this.props.menuType == "normal"
                || this.props.menuType == "bottom")) {
                e.stopPropagation();
                this.showButtonMenus();
            }
        }

        if (this.onTypeEvent) {
            this.onTypeEvent(e);
        }
    }

    protected onMouseDown(e: MouseEvent) {
        super.onMouseDown(e);
        if (!this.props.disabled) {
            if (this.props.toggle != true) {
                this.setPressing(true);
                document.addEventListener("mouseup", this.checkPressState);
            }
        }
    }

    protected onMouseUp(e: MouseEvent) {
        super.onMouseUp(e);
        if (!this.props.disabled) {
            if (this.props.toggle != true) {
                this.setPressing(false);
            }
        }
    }

    protected onDocumentMouseDown(e: MouseEvent) {
        super.onDocumentMouseDown(e);
        if (Button.buttonMenus && Button.buttonMenus.length > 0) {
            let is = false;
            for (let bm of Button.buttonMenus) {
                if (bm.button == this) {
                    let rootEl = (bm.menu.component as Menu<any>).getRootEl();
                    if (rootEl && this.contains(rootEl, e.target as any)) {
                        is = true;
                    }
                    if (rootEl && this.contains(this.rootEl, e.target as any)) {
                        is = true;
                    }
                    break;
                }
            }
            if (is == false) {
                this.closeButtonMenus();
            }
        }
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == "pressing" && this.isOnPressing != newValue) {
            this.isOnPressing = newValue;
            return true;
        }
        if (key == "selected" && this.isOnSelected != newValue) {
            this.isOnSelected = newValue;
            return true
        }
        return false;
    }

    setTypeEvent(fn: (e) => void) {
        this.onTypeEvent = fn;
    }

    getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(Button.buttonClsRoot);
        if (this.props.size == "medium") {
            arr.push(Button.buttonClsMedium);
        }
        if (this.props.size == "large") {
            arr.push(Button.buttonClsLarge);
        }
        if (this.props.iconAlign == "top") {
            arr.push(Button.buttonClsIconAlignTop);
        }
        if (this.props.iconAlign == "right") {
            arr.push(Button.buttonClsIconAlignRight);
        }
        if (this.props.iconAlign == "bottom") {
            arr.push(Button.buttonClsIconAlignBottom);
        }
        if (this.props.action == "default") {
            arr.push(Button.buttonClsDefault);
        } else if (this.props.action == "light") {
            arr.push(Button.buttonClsAction);
        } else if (this.props.action == "none") {
            arr.push(Button.buttonClsNone);
        } else {
            arr.push(Button.buttonClsDefault);
        }
        if (this.props.disabled) {
            arr.push(Button.buttonClsDisabled);
        }
        return arr;
    }
}
