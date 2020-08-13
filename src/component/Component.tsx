import Ginkgo, {
    HTMLComponent,
    GinkgoElement,
    GinkgoNode,
    CSSProperties,
    GinkgoTools,
    RefObject
} from "ginkgoes";
import "./Component.scss";
import DataStore from "../store/DataStore";
import Loading from "../loading/Loading";

export interface ComponentProps extends GinkgoElement {
    permitGroup?: string;
    permitCode?: string;
    hidden?: boolean;
    onClick?: (e: Event) => void;
    onDoubleClick?: (e: Event) => void;
    onMouseEnter?: (e: Event) => void;
    onMouseLeave?: (e: Event) => void;
    onMouseDown?: (e: Event) => void;
    onMouseUp?: (e: Event) => void;
    disabledSelectText?: boolean;
    width?: number;
    height?: number;
    className?: string;
    style?: CSSProperties;

    store?: DataStore;
}

let windowResizeEvents: Array<(e) => void> = [];
window.addEventListener("resize", (e) => {
    if (windowResizeEvents) {
        for (let r of windowResizeEvents) {
            if (r) r(e);
        }
    }
})


export default class Component<P extends ComponentProps> extends Ginkgo.Component<P> {
    protected static componentClsRoot;
    protected static componentClsHovered;
    protected static componentClsPressing;
    protected static componentClsDisabledSelect;
    protected static componentClsEnabledSelect;
    protected static componentClsSelected;
    protected static componentClsHidden;

    protected rootEl?: HTMLComponent;

    // 当前是否被点击或者选择
    protected isOnHovered: boolean = false;
    protected isOnPressing: boolean = false;
    protected isOnSelected: boolean = false;

    // 是否启用点击或者选择
    protected isEnableHovered: boolean = false;
    protected isEnablePressing: boolean = false;
    protected isEnableSelected: boolean = false;

    // 是否启用点击空白处时触发事件
    protected isEnableDocumentClick: boolean = false;
    // 窗口改变时的事件
    protected isEnableWindowResize: boolean = false;


    protected isHidden: boolean = this.props.hidden == null ? false : this.props.hidden;
    protected isDisabledSelectText: boolean = (this.props.disabledSelectText == null ? true : this.props.disabledSelectText);

    protected themePrefix = "x-";
    protected width: number = this.props.width;
    protected height: number = this.props.height;
    protected rootX: number;
    protected rootY: number;
    protected maskEl;

    protected disableCompareProps: Array<string> = ["store"];
    protected boundsParentScrollEventEls: Array<Element>;
    private doubleClickHandler;
    private doubleClickCount;
    private cacheClassNames: Array<string>;

    constructor(props?: any) {
        super(props);

        this.getRootClassName = this.getRootClassName.bind(this);
        this.getRootStyle = this.getRootStyle.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    componentWillMount(): void {
        this.setTheme();
        let props = this.props;
        if (props) {
            for (let key in props) {
                this.compareUpdate && this.compareUpdate(key, props[key], undefined);
            }
        }
    }

    componentWillUnmount?(): void {
        if (this.isEnableDocumentClick) {
            this.unmountDocumentMouseDown();
        }
        if (this.isEnableWindowResize) {
            windowResizeEvents = windowResizeEvents.filter(value => value != this.onWindowResize);
        }

        this.clearBoundsParentScrollEvents();
    }

    componentDidMount(): void {
        this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
        if (this.isEnableDocumentClick) {
            this.mountDocumentMouseDown();
        }
        if (this.isEnableWindowResize) {
            this.onWindowResize = this.onWindowResize.bind(this);
            windowResizeEvents.push(this.onWindowResize);
        }

        this.onParentScrolling = this.onParentScrolling.bind(this);
    }

    componentReceiveProps(props: P, context?) {
        if (props) {
            for (let p in props) {
                let item = props[p];
                if (item instanceof DataStore
                    && (this as any).storeLoaded != null) {
                    item.addProcessor(this as any);
                }
            }
        }
    }

    componentChildChange(children: Array<GinkgoElement>, old: Array<GinkgoElement>): void {

    }

    /**
     * 验证旧的属性和新的属性是否一致，如果一致则不需要重新绘制dom，
     * 相反则需要绘制dom，判断新旧属性是否一致使用的是==号，所以如果
     * 属性值是对象则需要新的对象才会判断需要绘制
     *
     * @param props
     * @param context
     */
    componentWillCompareProps(props: P, context?): void {
        if (props && context && context.oldProps) {
            for (let p in props) {
                if ((!this.disableCompareProps || this.disableCompareProps.indexOf(p) == -1)
                    && p != "children") {
                    let v = context.oldProps[p];
                    this.compareUpdate && this.compareUpdate(p, props[p], v);
                }
            }

            if (this.width != props.width) {
                this.width = props.width;
            }
            if (this.height != props.height) {
                this.height = props.height;
            }
            if (this.isHidden != props.hidden) {
                this.isHidden = props.hidden;
            }
            if (props.disabledSelectText != null && this.isDisabledSelectText != props.disabledSelectText) {
                this.isDisabledSelectText = props.disabledSelectText;
            }
        }
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        return false;
    }

    setTheme(themePrefix?: string) {
        if (!themePrefix) {
            themePrefix = this.themePrefix;
        } else {
            this.themePrefix = themePrefix;
        }
        this.buildClassNames(themePrefix);

        Ginkgo.forEachContent(component => {
            if (component instanceof HTMLComponent) {
                component.reloadClassName();
            }
        }, this);
    }

    protected getThemeClass(className: string): string {
        return this.themePrefix + className;
    }

    protected buildClassNames(themePrefix: string): void {
        Component.componentClsRoot = this.getThemeClass("component");
        Component.componentClsHovered = this.getThemeClass("hovered");
        Component.componentClsPressing = this.getThemeClass("pressing");
        Component.componentClsDisabledSelect = this.getThemeClass("disabled-select-text");
        Component.componentClsEnabledSelect = this.getThemeClass("enabled-select-text");
        Component.componentClsSelected = this.getThemeClass("selected");
        Component.componentClsHidden = this.getThemeClass("hidden");
    }

    render() {
        let events: any = {
            onMouseEnter: this.onMouseEnter,
            onMouseLeave: this.onMouseLeave,
            onClick: this.onClick,
            onMouseDown: this.onMouseDown,
            onMouseUp: this.onMouseUp
        }

        return (
            <div className={this.getRootClassName}
                 style={this.getRootStyle}
                 ref={c => this.rootEl = c}
                 {...events}
            >
                {this.drawing()}
            </div>
        )
    }

    /**
     * 子类继承重写构建自己的元素
     */
    protected drawing(): GinkgoNode | GinkgoElement[] {
        return this.props.children;
    }

    addClassName(cls: Array<string>) {
        this.cacheClassNames = cls;
        this.rootEl.reloadClassName();
        this.cacheClassNames = undefined;
    }

    protected getRootClassName(): string[] {
        let arr = [Component.componentClsRoot];
        if (this.isOnHovered) arr.push(Component.componentClsHovered);
        if (this.isOnPressing) arr.push(Component.componentClsPressing);
        if (this.isOnSelected) arr.push(Component.componentClsSelected);
        if (this.isHidden) arr.push(Component.componentClsHidden);
        if (this.isDisabledSelectText) arr.push(Component.componentClsDisabledSelect);

        if (this.props.className) {
            let className = this.props.className.replace(/\s{2,}/g, ' ');
            let clss = className.split(" ");
            if (clss && clss.length > 0) {
                clss.map(value => arr.push(value));
            }
        }
        if (this.cacheClassNames && this.cacheClassNames.length > 0) {
            this.cacheClassNames.map(value => arr.push(value));
        }

        return arr;
    }

    protected getRootStyle(): CSSProperties {
        let style: CSSProperties | any = {};
        if (this.props.style) {
            for (let key in this.props.style) {
                style[key] = this.props.style[key];
            }
        }

        if (this.width != null) style.width = this.width;
        if (this.height != null) style.height = this.height;
        if (this.rootX != null) style.left = this.rootX;
        if (this.rootY != null) style.top = this.rootY;
        return style;
    }

    protected onMouseEnter(e: Event) {
        if (this.isEnableHovered) {
            this.setHovered(true);
        }
        try {
            this.props.onMouseEnter && this.props.onMouseEnter(e);
        } catch (e) {
            console.error(e);
        }
    }

    protected onMouseLeave(e: Event) {
        if (this.isEnableHovered) {
            this.setHovered(false);
        }
        try {
            this.props.onMouseLeave && this.props.onMouseLeave(e);
        } catch (e) {
            console.error(e);
        }
    }

    protected onClick(e: Event) {
        if (this.doubleClickHandler) {
            clearTimeout(this.doubleClickHandler);
            this.doubleClickHandler = null;
        }
        this.doubleClickCount++;
        if (this.doubleClickCount >= 2) {
            this.doubleClickHandler = null;
            this.doubleClickCount = 0;
            if (this.onDoubleClick) {
                this.onDoubleClick(e);
            }
        } else {
            this.doubleClickHandler = setTimeout(() => {
                clearTimeout(this.doubleClickHandler);
                this.doubleClickCount = 0;
                this.doubleClickHandler = null;
            }, 300);
        }

        if (this.isEnableSelected) {
            if (!this.isOnSelected)
                this.setSelected(true);
            else
                this.setSelected(false);
        }
        try {
            this.props.onClick && this.props.onClick(e);
        } catch (e) {
            console.error(e);
        }
    }

    protected onDoubleClick(e) {
        if (this.props.onDoubleClick) {
            this.props.onDoubleClick(e);
        }
    }

    protected onMouseDown(e: MouseEvent) {
        if (this.isEnablePressing) {
            this.setPressing(true);
        }
        try {
            this.props.onMouseDown && this.props.onMouseDown(e);
        } catch (e) {
            console.error(e);
        }
    }

    protected onMouseUp(e: MouseEvent) {
        if (this.isEnablePressing) {
            this.setPressing(false);
        }
        try {
            this.props.onMouseUp && this.props.onMouseUp(e);
        } catch (e) {
            console.error(e);
        }
    }

    protected mountDocumentMouseDown() {
        document.addEventListener("mousedown", this.onDocumentMouseDown);
    }

    protected unmountDocumentMouseDown() {
        document.removeEventListener("mousedown", this.onDocumentMouseDown);
    }

    protected onDocumentMouseDown(e: MouseEvent) {

    }

    protected onWindowResize(e: Event) {

    }

    protected onParentScrolling(e) {

    }

    setHovered(hovered: boolean = true) {
        this.isOnHovered = hovered;
        this.rootEl && this.rootEl.reloadClassName();
    }

    setSelected(selected: boolean = true) {
        this.isOnSelected = selected;
        this.rootEl && this.rootEl.reloadClassName();
    }

    setPressing(pressing: boolean = true) {
        this.isOnPressing = pressing;
        this.rootEl && this.rootEl.reloadClassName();
    }

    setHidden(hidden: boolean = true) {
        this.isHidden = hidden;
        this.rootEl && this.rootEl.reloadClassName();
    }

    getHidden(): boolean {
        return this.isHidden;
    }

    setDisabledSelectText(select: boolean = true) {
        this.isDisabledSelectText = select;
        this.rootEl && this.rootEl.reloadClassName();
    }

    setSize(width: number, height: number) {
        let el = this.rootEl.dom as HTMLElement;
        let oldWidth = el.offsetWidth;
        let oldHeight = el.offsetHeight;
        if (width >= 0) this.width = width;
        if (height >= 0) this.height = height;
        this.rootEl && this.rootEl.reloadStyle();
        if (oldWidth != el.offsetWidth || oldHeight != el.offsetHeight) {
            this.onSizeChange(width, height);
        }
    }

    getSize(): {
        width: number,
        height: number,
        clientWidth?: number,
        clientHeight?: number,
        scrollWidth?: number,
        scrollHeight?: number
    } {
        if (this.rootEl && this.rootEl.dom) {
            let dom = this.rootEl.dom as HTMLElement;
            return {
                width: dom.offsetWidth,
                height: dom.offsetHeight,
                clientWidth: dom.clientWidth,
                clientHeight: dom.clientHeight,
                scrollWidth: dom.scrollWidth,
                scrollHeight: dom.scrollHeight
            };
        }
    }

    setWidth(width: number) {
        let el = this.rootEl.dom as HTMLElement;
        let oldWidth = el.offsetWidth;
        this.width = width;
        this.rootEl && this.rootEl.reloadStyle();
        if (oldWidth != el.offsetWidth) {
            this.onSizeChange(width, null);
        }
    }

    getWidth(): number {
        if (this.rootEl && this.rootEl.dom) {
            let dom = this.rootEl.dom as HTMLElement;
            return dom.offsetWidth;
        }
    }

    setHeight(height: number) {
        let el = this.rootEl.dom as HTMLElement;
        let oldHeight = el.offsetHeight;
        this.height = height;
        this.rootEl && this.rootEl.reloadStyle();
        if (oldHeight != el.offsetHeight) {
            this.onSizeChange(null, height);
        }
    }

    getHeight(): number {
        if (this.rootEl && this.rootEl.dom) {
            let dom = this.rootEl.dom as HTMLElement;
            return dom.offsetHeight;
        }
    }

    onSizeChange(width: number, height: number): void {

    }

    setXY(x: number, y: number) {
        this.rootX = x;
        this.rootY = y;
        this.rootEl && this.rootEl.reloadStyle();
    }

    getXY(): { x: number, y: number } {
        if (this.rootEl && this.rootEl.dom) {
            let dom = this.rootEl.dom as HTMLElement;
            return {x: dom.offsetLeft, y: dom.offsetTop};
        }
    }

    setX(x: number) {
        this.rootX = x;
        this.rootEl && this.rootEl.reloadStyle();
    }

    getX(): number {
        if (this.rootEl && this.rootEl.dom) {
            let dom = this.rootEl.dom as HTMLElement;
            return dom.offsetLeft;
        }
    }

    setY(y: number) {
        this.rootY = y;
        this.rootEl && this.rootEl.reloadStyle();
    }

    getY(): number {
        if (this.rootEl && this.rootEl.dom) {
            let dom = this.rootEl.dom as HTMLElement;
            return dom.offsetTop;
        }
    }

    mask(text?: string): void {
        if (!this.maskEl) {
            this.maskEl = <Loading key={"$loading_mask"} text={text}/>;
        }
        this.rootEl.append(this.maskEl);
    }

    unmask(): void {
        this.rootEl.remove(this.maskEl);
    }

    getBounds(el?: HTMLComponent | HTMLElement | null, createScrollEvent?: boolean):
        { x: number, y: number, w: number, h: number, cw: number, ch: number } {
        if (!el) el = this.rootEl;
        let obj = GinkgoTools.getBounds(el);

        if (createScrollEvent) {
            this.clearBoundsParentScrollEvents();
            let parents = obj.parents;
            this.boundsParentScrollEventEls = parents;
            if (parents && parents.length > 0) {
                for (let p of parents) {
                    p.addEventListener("scroll", this.onParentScrolling);
                }
            }
        }

        return obj;
    }

    protected clearBoundsParentScrollEvents() {
        if (this.boundsParentScrollEventEls && this.boundsParentScrollEventEls.length > 0) {
            for (let el of this.boundsParentScrollEventEls) {
                el.removeEventListener("scroll", this.onParentScrolling);
            }
            this.boundsParentScrollEventEls = null;
        }
    }

    /**
     * 判断事件的目标元素是否在当前组件内
     * @param e
     */
    protected targetEventInCurrent(e: Event): boolean {
        let target: Element = e.target as Element,
            rootEl: Element | null = this.rootEl.dom;
        if (rootEl && target) return this.contains(rootEl, target);
        return false;
    }

    protected contains(parent: Node | HTMLComponent, target: Node): boolean {
        if (parent instanceof HTMLComponent) {
            parent = parent.dom;
        }
        if (parent && target) {
            if (parent.compareDocumentPosition) {
                let code = parent.compareDocumentPosition(target);
                if (code == 16 || code == 18 || code == 20 || code == 24) {
                    return true;
                }
            }

            if (!parent.compareDocumentPosition && parent.contains) {
                return parent.contains(target);
            }
        }

        return false;
    }
}
