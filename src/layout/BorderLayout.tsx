import Ginkgo, {
    CSSProperties,
    GinkgoComponent,
    GinkgoElement,
    GinkgoNode,
    HTMLComponent,
    RefObject
} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import Panel from "../panel/Panel";
import Moving, {MovingProps} from "../dragdrop/Moving";
import {IconTypes} from "../icon/IconTypes";
import Icon from "../icon/Icon";
import Container from "../component/Container";
import "./BorderLayout.scss";

export interface BorderLayoutProps extends ComponentProps {

}

export default class BorderLayout<P extends BorderLayoutProps> extends Container<P> {
    protected static borderLayoutCls;
    protected static borderLayoutClsBody;
    protected static borderLayoutClsSplit;
    protected static borderLayoutClsSplitV;
    protected static borderLayoutClsSplitH;
    protected static collapseCls;
    protected static collapseLeftCls;
    protected static collapseBottomCls;
    protected static collapseIconCls;
    protected static splitActiveCls;

    protected defaultSplitWidth = 10;
    protected defaultMinSize = 40;
    protected childrenRefs: {
        north?: { ref: RefObject<BorderLayoutItem<any>>, split?: RefObject<Moving<any>>, disableSplit: boolean },
        south?: { ref: RefObject<BorderLayoutItem<any>>, split?: RefObject<Moving<any>>, disableSplit: boolean }
        east?: { ref: RefObject<BorderLayoutItem<any>>, split?: RefObject<Moving<any>>, disableSplit: boolean }
        west?: { ref: RefObject<BorderLayoutItem<any>>, split?: RefObject<Moving<any>>, disableSplit: boolean }
        center?: { ref: RefObject<BorderLayoutItem<any>>, split?: RefObject<Moving<any>>, disableSplit: boolean }
    } = {};

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        BorderLayout.borderLayoutCls = this.getThemeClass("border-layout");
        BorderLayout.borderLayoutClsBody = this.getThemeClass("border-layout-body");
        BorderLayout.borderLayoutClsSplit = this.getThemeClass("border-layout-split");
        BorderLayout.borderLayoutClsSplitV = this.getThemeClass("split-v");
        BorderLayout.borderLayoutClsSplitH = this.getThemeClass("split-h");
        BorderLayout.collapseCls = this.getThemeClass("collapse-el");
        BorderLayout.collapseLeftCls = this.getThemeClass("collapse-split-left");
        BorderLayout.collapseBottomCls = this.getThemeClass("collapse-split-bottom");
        BorderLayout.collapseIconCls = this.getThemeClass("collapse-icon");
        BorderLayout.splitActiveCls = this.getThemeClass("split-active");
    }

    protected drawing(): GinkgoElement | undefined | null | GinkgoElement[] {
        let childEls: Array<GinkgoNode> = [];

        this.childrenRefs = {};
        let hasCenter = false;
        for (let c of this.props.children) {
            if (Ginkgo.instanceofComponent(c, BorderLayoutItem)) {
                let props = c as BorderLayoutItemProps,
                    refItem: RefObject<BorderLayoutItem<any>> = Ginkgo.createRef(),
                    refSplit: RefObject<Moving<MovingProps>>;

                props.ref = refItem;
                childEls.push(props);

                if (props.split == true) {
                    let style: CSSProperties = {},
                        splitCls = [BorderLayout.borderLayoutClsSplit],
                        collapseCls = [BorderLayout.collapseCls],
                        iconType = "", fixX = false, fixY = false;

                    refSplit = Ginkgo.createRef();
                    if (props.type == "north") {
                        style.height = this.defaultSplitWidth + "px";
                        splitCls.push(BorderLayout.borderLayoutClsSplitV);
                        collapseCls.push(BorderLayout.collapseBottomCls);
                        iconType = IconTypes.caretUp;
                        fixX = true;
                    }
                    if (props.type == "south") {
                        style.height = this.defaultSplitWidth + "px";
                        splitCls.push(BorderLayout.borderLayoutClsSplitV);
                        collapseCls.push(BorderLayout.collapseBottomCls);
                        iconType = IconTypes.caretDown;
                        fixX = true;
                    }
                    if (props.type == "east") {
                        style.width = this.defaultSplitWidth + "px";
                        splitCls.push(BorderLayout.borderLayoutClsSplitH);
                        collapseCls.push(BorderLayout.collapseLeftCls);
                        iconType = IconTypes.caretRight;
                        fixY = true;
                    }
                    if (props.type == "west") {
                        style.width = this.defaultSplitWidth + "px";
                        splitCls.push(BorderLayout.borderLayoutClsSplitH);
                        collapseCls.push(BorderLayout.collapseLeftCls);
                        iconType = IconTypes.caretLeft;
                        fixY = true;
                    }

                    let collapseSplitEl;
                    if (props && props.children
                        && props.children[0]
                        && props.children[0]['collapse']) {
                        collapseSplitEl = (
                            <div className={collapseCls.join(" ")}
                                 onClick={e => {
                                     if (props && props.children && props.children.length > 0) {
                                         let layoutItem = Ginkgo.getComponentByProps(props);
                                         let cmp = Ginkgo.getComponentByProps(props.children[0]);
                                         if (layoutItem && layoutItem instanceof BorderLayoutItem
                                             && cmp && cmp instanceof Panel) {
                                             layoutItem.onPanelCollapseClick(e, cmp);
                                         }
                                     }
                                 }}>
                                <div className={BorderLayout.collapseIconCls}>
                                    <Icon icon={iconType}/>
                                </div>
                            </div>
                        );
                    }

                    childEls.push(
                        <Moving
                            ref={refSplit}
                            className={splitCls.join(" ")}
                            style={style}
                            movingClassName={BorderLayout.splitActiveCls}
                            movingSelf={true}
                            fixX={fixX}
                            fixY={fixY}
                            data={refItem}
                            onFinishMoving={(point, data: RefObject<BorderLayoutItem<any>>) => {
                                if (fixY && point && point.x) {
                                    if (data) {
                                        let width = data.instance.getSize().width;
                                        if (data.instance.props.type == "east") {
                                            data.instance.setWidth(width + point.x);
                                        } else {
                                            data.instance.setWidth(width - point.x);
                                        }
                                        this.layout();
                                    }
                                }

                                if (fixX && point && point.y) {
                                    if (data) {
                                        let height = data.instance.getSize().height;
                                        if (data.instance.props.type == "south") {
                                            data.instance.setHeight(height + point.y);
                                        } else {
                                            data.instance.setHeight(height - point.y);
                                        }
                                        this.layout();
                                    }
                                }
                            }}
                            onMoving={(point, layoutItem: RefObject<BorderLayoutItem<any>>) => {
                                let max = this.getLayoutMaxSize(layoutItem);
                                if (max > 0) {
                                    let data = layoutItem.instance;
                                    if (data.props.type == "north" && point.y) {
                                        let height = data.getSize().height;
                                        let h = height - point.y;
                                        if (h >= max || h <= this.defaultMinSize) return false;
                                    }
                                    if (data.props.type == "south" && point.y) {
                                        let height = data.getSize().height;
                                        let h = height + point.y;
                                        if (h >= max || h <= this.defaultMinSize) return false;
                                    }
                                    if (data.props.type == "east" && point.x) {
                                        let width = data.getSize().width;
                                        let w = width + point.x;
                                        if (w >= max || w <= this.defaultMinSize) return false;
                                    }
                                    if (data.props.type == "west" && point.x) {
                                        let width = data.getSize().width;
                                        let w = width - point.x;
                                        if (w >= max || w <= this.defaultMinSize) return false;
                                    }
                                }
                                return true;
                            }}
                        >
                            {collapseSplitEl}
                        </Moving>);
                }

                if (props.type == "north") this.childrenRefs.north = {
                    ref: refItem,
                    split: refSplit,
                    disableSplit: false
                };
                if (props.type == "south") this.childrenRefs.south = {
                    ref: refItem,
                    split: refSplit,
                    disableSplit: false
                };
                if (props.type == "east") this.childrenRefs.east = {ref: refItem, split: refSplit, disableSplit: false};
                if (props.type == "west") this.childrenRefs.west = {ref: refItem, split: refSplit, disableSplit: false};
                if (props.type == "center") {
                    this.childrenRefs.center = {ref: refItem, disableSplit: false};
                    hasCenter = true;
                }
            } else {
                throw Error("BorderLayout children must is BorderLayoutItem");
            }
        }

        if (!hasCenter && childEls.length > 1) {
            throw Error("borderlayout have multiple children and have no center type item.");
        }

        if (childEls == null || childEls.length == 0) {
            childEls = this.props.children;
        }
        return (
            <div className={BorderLayout.borderLayoutClsBody}>
                {childEls}
            </div>
        )
    }

    getLayoutMaxSize(item: RefObject<BorderLayoutItem<BorderLayoutItemProps>>): number {
        let north = this.childrenRefs.north,
            south = this.childrenRefs.south,
            east = this.childrenRefs.east,
            west = this.childrenRefs.west,
            center = this.childrenRefs.center,

            height = this.getHeight(),
            width = this.getWidth();

        if (item.instance.props.type == "north") {
            let maxHeight = this.defaultMinSize;
            if (south) {
                maxHeight += south.ref ? south.ref.instance.getSize().height : 0;
                if (south.split && south.split.instance) {
                    maxHeight += south.split.instance.getHeight();
                }
            }
            return height - maxHeight;
        }
        if (item.instance.props.type == "south") {
            let maxHeight = this.defaultMinSize;
            if (north) {
                maxHeight += north.ref ? north.ref.instance.getSize().height : 0;
                if (north.split && north.split.instance) {
                    maxHeight += north.split.instance.getHeight();
                }
            }
            return height - maxHeight;
        }
        if (item.instance.props.type == "west") {
            let maxWidth = this.defaultMinSize;
            if (east) {
                maxWidth += east.ref ? east.ref.instance.getSize().width : 0;
                if (east.split && east.split.instance) {
                    maxWidth += east.split.instance.getWidth();
                }
            }
            return width - maxWidth;
        }
        if (item.instance.props.type == "east") {
            let maxWidth = this.defaultMinSize;
            if (west) {
                maxWidth += west.ref ? west.ref.instance.getSize().width : 0;
                if (west.split && west.split.instance) {
                    maxWidth += west.split.instance.getWidth();
                }
            }
            return width - maxWidth;
        }
        return 0;
    }

    componentRenderUpdate() {
        this.setState({}, () => {
            this.doLayout();
        }, false)
    }

    onSizeChange(width: number, height: number): void {
        this.doLayout();
    }

    doLayout() {
        let north = this.childrenRefs.north,
            south = this.childrenRefs.south,
            east = this.childrenRefs.east,
            west = this.childrenRefs.west,
            center = this.childrenRefs.center,

            height = this.getHeight(),
            width = this.getWidth(),
            northY = 0,
            southY = 0,
            westX = 0,
            eastX = 0,
            weWidth = 0,
            northHeight = 0,
            westWith = 0,
            northSplitHeight = 0,
            westSplitWidth = 0;

        if (north) {
            northHeight = north.ref ? north.ref.instance.getSize().height : 0;
            northY += northHeight;
            if (north.split && north.split.instance) {
                north.split.instance.setWidth(width);
                northY += north.split.instance.getHeight();
                northSplitHeight += north.split.instance.getHeight();
            }
            southY += northY;
        }
        if (south) {
            southY += south.ref ? south.ref.instance.getSize().height : 0;
            if (south.split && south.split.instance) {
                south.split.instance.setWidth(width);
                southY += south.split.instance.getHeight();
            }
        }
        let centerHeight = height - southY;
        southY = northY + centerHeight;


        if (west) {
            westX += west.ref ? west.ref.instance.getSize().width : 0;
            westWith += west.ref ? west.ref.instance.getSize().width : 0;
            if (west.split && west.split.instance) {
                west.split.instance.setHeight(centerHeight);
                westX += west.split.instance.getWidth();
                westWith += west.split.instance.getWidth();
                westSplitWidth += west.split.instance.getWidth();
            }

            if (west.ref) {
                west.ref.instance.setSize(undefined, centerHeight);
            }
            eastX += westX;
            weWidth += westX;
        }

        if (east) {
            weWidth += east.ref ? east.ref.instance.getSize().width : 0;
            if (east.split && east.split.instance) {
                east.split.instance.setHeight(centerHeight);
                weWidth += east.split.instance.getWidth();
                eastX += east.split.instance.getWidth();
            }
            if (east.ref) {
                east.ref.instance.setSize(undefined, centerHeight);
            }
        }

        let centerWidth = width - weWidth;
        if (center) {
            eastX += centerWidth;
            if (center.ref) {
                center.ref.instance.setSize(centerWidth, centerHeight);
            }
        }

        if (north && north.ref) {
            north.ref.instance.setXY(0, 0);
            if (north.split && north.split.instance) {
                north.split.instance.setXY(undefined, northHeight);
            }
        }
        if (south && south.ref) {
            south.ref.instance.setXY(0, southY + northSplitHeight);
            if (south.split && south.split.instance) {
                south.split.instance.setXY(undefined, southY);
            }
        }
        if (west && west.ref) {
            west.ref.instance.setXY(0, northY);
            if (west.split && west.split.instance) {
                west.split.instance.setXY(undefined, northY);
                west.split.instance.setXY(westWith - westSplitWidth, undefined);

            }
        }
        if (east && east.ref) {
            east.ref.instance.setXY(eastX, northY);
            if (east.split && east.split.instance) {
                east.split.instance.setXY(undefined, northY);
                east.split.instance.setXY(eastX - westSplitWidth, undefined);
            }
        }
        if (center && center.ref) {
            center.ref.instance.setXY(westWith, northY);
        }

        north && north.ref && north.ref.instance.layout();
        south && south.ref && south.ref.instance.layout();
        east && east.ref && east.ref.instance.layout();
        west && west.ref && west.ref.instance.layout();
        center && center.ref && center.ref.instance.layout();
    }

    setDisableSplitByItem(bli: BorderLayoutItem<any>, disable: boolean) {
        if (disable) {
            for (let cr in this.childrenRefs) {
                let item = this.childrenRefs[cr];
                if (item && item.split && item.ref) {
                    item.disableSplit = true;
                    let moving = (item.split as RefObject<Moving<any>>).instance;
                    if (moving && bli == item.ref) {
                        moving.disableMoving();
                    }
                }
            }
        } else {
            for (let cr in this.childrenRefs) {
                let item = this.childrenRefs[cr];
                if (item && item.split && item.ref) {
                    item.disableSplit = true;
                    let moving = (item.split as RefObject<Moving<any>>).instance;
                    if (moving && bli == item.ref) {
                        moving.enableMoving();
                    }
                }
            }
        }
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(BorderLayout.borderLayoutCls);
        return arr;
    }

    setSplitArrow(item: BorderLayoutItem<BorderLayoutItemProps>, collapse: boolean) {
        let ref = this.childrenRefs[item.props.type];
        if (ref) {
            let moving = ref.split.instance;
            let props = item.props;
            if (moving) {
                let el = moving.query('.' + BorderLayout.collapseIconCls);
                if (el) {
                    let iconType;
                    if (props.type == "north") {
                        if (collapse) {
                            iconType = IconTypes.caretDown;
                        } else {
                            iconType = IconTypes.caretUp;
                        }
                    }
                    if (props.type == "south") {
                        if (collapse) {
                            iconType = IconTypes.caretUp;
                        } else {
                            iconType = IconTypes.caretDown;
                        }
                    }
                    if (props.type == "east") {
                        if (collapse) {
                            iconType = IconTypes.caretLeft;
                        } else {
                            iconType = IconTypes.caretRight;
                        }
                    }
                    if (props.type == "west") {
                        if (collapse) {
                            iconType = IconTypes.caretRight;
                        } else {
                            iconType = IconTypes.caretLeft;
                        }
                    }
                    el.overlap(<Icon icon={iconType}/>);
                }
            }
        }
    }
}

export interface BorderLayoutItemProps extends ComponentProps {
    type: "east" | "center" | "west" | "south" | "north";
    width?: number
    split?: boolean;
}

export class BorderLayoutItem<P extends BorderLayoutItemProps> extends Container<P> {
    protected static northCls;
    protected static southCls;
    protected static eastCls;
    protected static westCls;
    protected static centerCls;

    protected releaseWidth: number = -1;
    protected isEnableParentSize = false;

    componentWillMount(): void {
        super.componentWillMount();
    }

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        BorderLayoutItem.northCls = this.getThemeClass("border-layout-north");
        BorderLayoutItem.southCls = this.getThemeClass("border-layout-south");
        BorderLayoutItem.eastCls = this.getThemeClass("border-layout-east");
        BorderLayoutItem.westCls = this.getThemeClass("border-layout-west");
        BorderLayoutItem.centerCls = this.getThemeClass("border-layout-center");
    }

    protected drawing(): GinkgoElement | undefined | null | GinkgoElement[] {
        if (this.props && this.props.children && this.props.children.length > 1) {
            throw Error("BorderLayoutItem children only one Component");
        }
        return this.props.children;
    }

    componentDidMount(): void {
        super.componentDidMount();

        if (this.children && this.children.length > 0) {
            let child = this.children[0];
            if (child && child instanceof Panel) {
                if (this.props.type == "north") child.set("", "top");
                if (this.props.type == "south") child.setCollapseType("bottom");
                if (this.props.type == "west") child.setCollapseType("left");
                if (this.props.type == "east") child.setCollapseType("right");
                if (this.props.type == "center") child.setCollapse(false);

                child.setOnCollapseClick(this.onPanelCollapseClick.bind(this));
            }
        }
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        if (this.props.type == "north") arr.push(BorderLayoutItem.northCls);
        if (this.props.type == "south") arr.push(BorderLayoutItem.southCls);
        if (this.props.type == "west") arr.push(BorderLayoutItem.westCls);
        if (this.props.type == "east") arr.push(BorderLayoutItem.eastCls);
        if (this.props.type == "center") arr.push(BorderLayoutItem.centerCls);
        return arr;
    }

    isCollapse(): boolean {
        if (this.children && this.children.length > 0) {
            let child = this.children[0];
            if (child && child instanceof Panel) {
                console.log(child.isCollapse());
                return child.isCollapse();
            }
        }
        return false;
    }

    onPanelCollapseClick(e, panel: Panel<any>) {
        let rootEl = this.rootEl,
            width = panel.getOriginalWidth(),
            realWidth = panel.getWidth(),
            minWidth = panel.getHeaderMinWidth(),
            isSetHeader = false;

        if (panel.isCollapse()) {
            let rootDom = (this.rootEl.dom as HTMLElement)
            rootDom.style.transform = "translateX(" + (-width) + "px)";
            this.releaseWidth = -1;

            if (!isSetHeader) {
                isSetHeader = true;
                panel.setHeaderAlign("top");
                panel.setCollapseOpen();
            }

            this.setWidth(width);
            panel.setWidth(width);
            panel.layout();

            rootDom.style.zIndex = "20";
            rootEl.animation({
                translateX: 0,
                easing: 'linear',
                duration: 300,
                complete: (anim) => {
                    let parent = this.parent;
                    if (parent instanceof BorderLayout) {
                        parent.setDisableSplitByItem(this, false);
                        parent.layout();
                        rootDom.style.zIndex = null;

                        parent.setSplitArrow(this, false);
                    }
                }
            });
        } else {
            let parent = this.parent;
            this.releaseWidth = minWidth;
            if (parent instanceof BorderLayout) {
                parent.setDisableSplitByItem(this, true);
                parent.layout();
            }
            rootEl.animation({
                translateX: -width,
                easing: 'linear',
                duration: 200,
                complete: (anim) => {
                    if (!isSetHeader) {
                        isSetHeader = true;
                        panel.setHeaderAlign("left");
                        panel.setCollapseClose();
                        this.releaseWidth = -1;
                        this.setWidth(minWidth);

                        if (this.parent && this.parent instanceof BorderLayout) {
                            this.parent.setSplitArrow(this, true);
                        }

                        rootEl.animation({
                            translateX: 0,
                            easing: 'linear',
                            duration: 100,
                        });
                    }
                }
            });
        }

        return true;
    }

    getSize(): { width: number; height: number } {
        let wh = super.getSize();
        if (this.releaseWidth != -1) wh.width = this.releaseWidth;
        return wh;
    }

    doLayout() {
        let children = this.children,
            width = this.getWidth(),
            height = this.getHeight();
        if (children && children.length > 0) {
            let c = children[0];
            if (c instanceof Container) {
                let oldWidth = c.getWidth(),
                    oldHeight = c.getHeight();
                if (oldWidth != width || oldHeight != height) {
                    c.setSize(width, height);
                    c.layout();
                }
            } else if (c instanceof Component) {
                let oldWidth = c.getWidth(),
                    oldHeight = c.getHeight();
                if (oldWidth != width || oldHeight != height) {
                    c.setSize(width, height);
                }
            } else if (c instanceof HTMLComponent) {
                let dom = c.dom;
                if (dom && dom instanceof HTMLElement) {
                    dom.style.width = width + "px";
                    dom.style.height = height + "px";
                }
            } else {
                console.error("can't set children component size, only set by Component or HTMLComponent");
            }
        }
    }
}
