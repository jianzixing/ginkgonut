import Ginkgo, {CSSProperties, GinkgoElement, GinkgoNode, HTMLComponent, RefObject} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import "./DisplayImage.scss";

export interface DisplayImageProps extends ComponentProps {
    type?: "center" | "fit" | "stretch";
    src: string;
    empty?: string;
    link?: string;
}

export default class DisplayImage<P extends DisplayImageProps> extends Component<P> {
    protected static imageCls;
    protected static imageHrefCls;
    protected static imagePicCls;
    protected static imageCenterCls;
    protected static imageFitCls;

    protected value = this.props.src;
    protected imgRef: RefObject<HTMLComponent> = Ginkgo.createRef();

    set src(src: string) {
        this.value = src;
        this.redrawing();
    }

    protected buildClassNames(themePrefix: string) {
        super.buildClassNames(themePrefix);

        DisplayImage.imageCls = this.getThemeClass("image");
        DisplayImage.imageHrefCls = this.getThemeClass("image-href");
        DisplayImage.imagePicCls = this.getThemeClass("image-pic");
        DisplayImage.imageCenterCls = this.getThemeClass("image-center");
        DisplayImage.imageFitCls = this.getThemeClass("image-fit");
    }

    protected drawing(): GinkgoNode | GinkgoElement[] {
        if (this.props.link) {
            return (
                <a className={DisplayImage.imageHrefCls} href={this.props.link} target={"_blank"}>
                    <img ref={this.imgRef} className={DisplayImage.imagePicCls} src={this.value || this.props.empty}/>
                </a>
            )
        } else {
            return (
                <img ref={this.imgRef} className={DisplayImage.imagePicCls} src={this.value || this.props.empty}/>
            )
        }
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == "src" && this.value != newValue) {
            this.value = newValue;
            this.redrawing();
        }
        return false;
    }

    protected onAfterDrawing() {
        if (this.imgRef.instance) {
            let el = this.imgRef.instance.dom as HTMLImageElement;
            let root = this.rootEl.dom as HTMLElement;
            let pw = root.offsetWidth, ph = root.offsetHeight;

            let image = new Image();
            image.src = el.src;
            image.onload = () => {
                let w = image.width,
                    h = image.height,
                    pos = {w: 0, h: 0, t: 0, l: 0};

                if (this.props.type == "center" || this.props.type == null) {
                    if (w > h) {
                        pos.w = pw;
                        pos.h = pw / w * h;
                        pos.l = 0;
                        pos.t = (ph - pos.h) / 2;
                    } else {
                        pos.h = ph;
                        pos.w = ph / h * w;
                        pos.l = (pw - pos.w) / 2;
                        pos.t = 0;
                    }
                }

                if (this.props.type == "fit") {
                    if (w > h) {
                        pos.h = ph;
                        pos.w = ph / h * w;
                        pos.l = (pw - pos.w) / 2;
                        pos.t = 0;
                    } else {
                        pos.w = pw;
                        pos.h = pw / w * h;
                        pos.l = 0;
                        pos.t = (ph - pos.h) / 2;
                    }
                }
                if (this.props.type == "stretch") {
                    pos.w = pw;
                    pos.h = ph;
                    pos.l = 0;
                    pos.t = 0;
                }

                el.style.width = pos.w + "px";
                el.style.height = pos.h + "px";
                el.style.top = pos.t + "px";
                el.style.left = pos.l + "px";
            }
        }
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(DisplayImage.imageCls);
        return arr;
    }

    protected getRootStyle(): CSSProperties {
        let style = super.getRootStyle();
        if (this.width == null) style.width = 30;
        if (this.height == null) style.height = 30;
        return style;
    }
}
