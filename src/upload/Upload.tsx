import Ginkgo, {GinkgoElement, GinkgoNode, InputComponent, RefObject} from "ginkgoes";
import "./Upload.scss";
import Component, {ComponentProps} from "../component/Component";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";

export interface UploadModel {
    key?: string;
    src?: string | ArrayBuffer;
    name?: string;
    size?: number;
    file?: File;
    status?: "ready" | "error" | "uploaded";
    showMask?: boolean;
    data?: any;
}

export interface UploadProps extends ComponentProps {
    models?: Array<UploadModel>;
    multi?: boolean;
    reupload?: boolean; // 是否可以重新上传图片,仅仅multi=false有效
    onLookClick?: (item: UploadModel) => void;
    onDelClick?: (item: UploadModel) => void;
}

export default class Upload<P extends UploadProps> extends Component<P> {
    protected static uploadBodyCls;
    protected static uploadAddItemCls;
    protected static uploadAddItemBodyCls;
    protected static uploadAddItemIconCls;
    protected static uploadAddItemTextCls;
    protected static uploadItemCls;
    protected static uploadItemImgCls;
    protected static uploadItemReuploadCls;
    protected static uploadItemMaskCls;
    protected static uploadItemMaskShowCls;
    protected static uploadItemMaskBodyCls;
    protected static uploadItemMaskInnerCls;
    protected static uploadAddItemInputCls;

    protected fileInputRef?: RefObject<InputComponent> = Ginkgo.createRef();
    protected items?: Array<UploadModel> = [];

    protected buildClassNames(themePrefix: string) {
        super.buildClassNames(themePrefix);

        Upload.uploadBodyCls = this.getThemeClass("upload-body");
        Upload.uploadAddItemCls = this.getThemeClass("upload-add-item");
        Upload.uploadAddItemBodyCls = this.getThemeClass("upload-add-body");
        Upload.uploadAddItemIconCls = this.getThemeClass("upload-add-icon");
        Upload.uploadAddItemTextCls = this.getThemeClass("upload-add-text");
        Upload.uploadAddItemInputCls = this.getThemeClass("upload-add-input");
        Upload.uploadItemCls = this.getThemeClass("upload-item");
        Upload.uploadItemImgCls = this.getThemeClass("upload-item-img");
        Upload.uploadItemReuploadCls = this.getThemeClass("upload-item-reupload");
        Upload.uploadItemMaskCls = this.getThemeClass("upload-item-mask");
        Upload.uploadItemMaskShowCls = this.getThemeClass("upload-item-mask-show");
        Upload.uploadItemMaskBodyCls = this.getThemeClass("upload-item-mask-body");
        Upload.uploadItemMaskInnerCls = this.getThemeClass("upload-item-mask-inner");
    }

    protected drawing(): GinkgoNode | GinkgoElement[] {
        let items = [];
        if (this.items) {
            let cls = [Upload.uploadItemCls];
            if (this.props.reupload) {
                cls.push(Upload.uploadItemReuploadCls);
            }
            for (let item of this.items) {
                let input;
                if (this.props.reupload) {
                    input = (
                        <input
                            ref={this.fileInputRef}
                            className={Upload.uploadAddItemInputCls}
                            type={"file"}
                            onChange={this.onUploadFileChange.bind(this)}/>
                    );
                }
                let mangerEl;
                if (this.props.multi) {
                    let cls = [Upload.uploadItemMaskCls];
                    if (item.showMask) {
                        cls.push(Upload.uploadItemMaskShowCls);
                    }
                    mangerEl = (
                        <div className={cls}>
                            <div className={Upload.uploadItemMaskBodyCls}>
                                <div className={Upload.uploadItemMaskInnerCls}>
                                    <Icon icon={IconTypes.eye}
                                          onClick={e => {
                                              this.props.onLookClick && this.props.onLookClick(item);
                                          }}/>
                                    <Icon icon={IconTypes.trash}
                                          onClick={e => {
                                              this.items.splice(this.items.indexOf(item), 1);
                                              this.redrawing();

                                              this.props.onDelClick && this.props.onDelClick(item);
                                          }}/>
                                </div>
                            </div>
                        </div>
                    );
                }
                items.push(
                    <div key={item.key} className={cls}
                         onMouseEnter={e => {
                             for (let item of this.items) item.showMask = false;
                             item.showMask = true;
                             this.redrawing();
                         }}
                         onMouseLeave={e => {
                             for (let item of this.items) item.showMask = false;
                             this.redrawing();
                         }}>
                        <div className={Upload.uploadItemImgCls}>
                            <img src={item.src}/>
                            {mangerEl}
                        </div>
                        {input}
                    </div>
                );
            }
        }
        if (this.props.multi || items.length == 0) {
            let attr: any = {};
            if (this.props.multi) attr.multiple = true;
            items.push(
                <div key={"upload_add"} className={[Upload.uploadItemCls, Upload.uploadAddItemCls]}>
                    <div className={Upload.uploadAddItemBodyCls}>
                        <Icon className={Upload.uploadAddItemIconCls} icon={IconTypes.plus}/>
                        <span className={Upload.uploadAddItemTextCls}>Upload</span>
                    </div>
                    <input
                        ref={this.fileInputRef}
                        className={Upload.uploadAddItemInputCls}
                        type={"file"}
                        {...attr}
                        onChange={this.onUploadFileChange.bind(this)}/>
                </div>
            )
        }
        return (
            <div className={Upload.uploadBodyCls}>
                {items}
            </div>
        );
    }

    protected onUploadFileChange(e) {
        let input = this.fileInputRef.instance.dom as HTMLInputElement;
        let fileList = input.files;
        if (this.props.reupload) {
            this.items = [];
        }
        if (fileList && fileList.length > 0) {
            let self = this;
            for (let i = 0; i < fileList.length; i++) {
                let file = fileList.item(i);
                let name = file.name;
                let size = file.size;
                let reads = new FileReader();
                reads.readAsDataURL(file);
                reads.onload = function (e) {
                    let src = this.result;
                    self.items.push({
                        key: self.items.length + "",
                        src: src,
                        name: name,
                        size: size,
                        file: file,
                        status: "ready"
                    });

                    self.redrawing();
                };
            }
        }
    }

    getItems(): Array<UploadModel> {
        return this.items;
    }
}
