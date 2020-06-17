import Ginkgo, {GinkgoElement, GinkgoNode, InputComponent, RefObject} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import Button from "../button/Button";
import "./Upload.scss";

export interface UploadModel {
    key?: string;
    src?: string | ArrayBuffer;
    name?: string;
    size?: number;
    file?: File;
    status?: "ready" | "uploading" | "error" | "finish";
    plan?: number; // 上传进度,比如 90%
    error?: string; // 错误消息
    showMask?: boolean;
    data?: any;
}

export interface UploadProps extends ComponentProps {
    type?: "avatar" | "preview" | "button";
    models?: Array<UploadModel>;
    multi?: boolean;
    reupload?: boolean; // 是否可以重新上传图片,仅仅multi=false有效
    onLookClick?: (item: UploadModel) => void;
    onDelClick?: (item: UploadModel) => void;
    onChange?: (items?: Array<UploadModel>, news?: Array<UploadModel>) => void;
    onAsyncFile?: (item: UploadModel, type: "del" | "add") => Promise<{}>;
    onImageSrc?: (src: string | ArrayBuffer, item?: UploadModel) => string;

    buttonText?: string;
    buttonIcon?: string;
    buttonIconType?: string;
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
    protected static uploadErrorCls;
    protected static uploadErrorTextCls;
    protected static uploadErrorBtnsCls;

    protected static uploadButtonCls;
    protected static uploadButtonInputCls;

    protected fileInputRef?: RefObject<InputComponent> = Ginkgo.createRef();
    protected buttonRef: RefObject<Button<any>> = Ginkgo.createRef();
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
        Upload.uploadErrorCls = this.getThemeClass("upload-error");
        Upload.uploadErrorTextCls = this.getThemeClass("upload-error-text");
        Upload.uploadErrorBtnsCls = this.getThemeClass("upload-error-btns");

        Upload.uploadButtonCls = this.getThemeClass("upload-button");
        Upload.uploadButtonInputCls = this.getThemeClass("upload-input");
    }

    protected drawing(): GinkgoNode | GinkgoElement[] {
        let items = [];
        let type = this.props.type;
        let multi = this.props.multi;
        let reupload = this.props.reupload;
        if (type == "avatar") {
            multi = false;
            reupload = true;
        }

        if (this.props.type == "button") {
            return (
                <div className={Upload.uploadButtonCls}>
                    <Button ref={this.buttonRef}
                            text={this.props.buttonText || "Browse..."}
                            icon={this.props.buttonIcon}
                            iconType={this.props.buttonIconType}/>
                    <input ref={this.fileInputRef} type={"file"}
                           className={Upload.uploadButtonInputCls}
                           onChange={this.onUploadFileChange.bind(this)}/>
                </div>
            )
        } else {
            if (this.items) {
                let cls = [Upload.uploadItemCls];
                if (reupload) {
                    cls.push(Upload.uploadItemReuploadCls);
                }
                for (let item of this.items) {
                    let input;
                    if (reupload) {
                        input = (
                            <input
                                ref={this.fileInputRef}
                                className={Upload.uploadAddItemInputCls}
                                type={"file"}
                                onChange={this.onUploadFileChange.bind(this)}/>
                        );
                    }
                    let mangerEl;
                    if (multi && item.status == "finish") {
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
                                                  this.props.onChange && this.props.onChange(this.items);
                                                  let promise: Promise<{}>, rsv;
                                                  let isNotAsync = false;
                                                  if (this.props.onAsyncFile) {
                                                      promise = this.props.onAsyncFile(item, "del");
                                                  }
                                                  if (!promise) {
                                                      promise = new Promise((resolve, reject) => {
                                                          rsv = resolve;
                                                      });
                                                      isNotAsync = true;
                                                  }

                                                  promise.then(value => {
                                                      this.props.onDelClick && this.props.onDelClick(item);
                                                      this.items.splice(this.items.indexOf(item), 1);
                                                      this.redrawing();
                                                  }).catch(reason => {

                                                  });

                                                  if (!this.props.onAsyncFile || isNotAsync) {
                                                      rsv(item);
                                                  }
                                              }}/>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    let errorEl;
                    if (item.status == "error") {
                        let errorCls = [Upload.uploadItemMaskCls];
                        errorEl = (
                            <div className={errorCls}>
                                <div className={Upload.uploadItemMaskBodyCls}>
                                    <div className={Upload.uploadItemMaskInnerCls}>
                                        <div className={Upload.uploadErrorTextCls}>{item.error}</div>
                                        <div className={Upload.uploadErrorBtnsCls}>
                                            <Icon icon={IconTypes.trash}
                                                  onClick={e => {
                                                      this.props.onChange && this.props.onChange(this.items);
                                                      this.props.onDelClick && this.props.onDelClick(item);
                                                      this.items.splice(this.items.indexOf(item), 1);
                                                      this.redrawing();
                                                  }}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                        cls.push(Upload.uploadErrorCls);
                    }

                    let src = item.src;
                    if (this.props.onImageSrc && src && typeof src == "string" &&
                        !src.startsWith("data:image/")) {
                        src = this.props.onImageSrc(src, item);
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
                                <img src={src}/>
                                {mangerEl}
                                {errorEl}
                            </div>
                            {input}
                        </div>
                    );
                }
            }
            if (multi || items.length == 0) {
                let attr: any = {};
                if (multi) attr.multiple = true;
                items.push(
                    <div key={"upload_add"} className={[Upload.uploadItemCls, Upload.uploadAddItemCls]}>
                        <div className={Upload.uploadAddItemBodyCls}>
                            <Icon className={Upload.uploadAddItemIconCls} icon={IconTypes.plus}/>
                            <span className={Upload.uploadAddItemTextCls}>
                                {this.props.buttonText || "Upload"}
                            </span>
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
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == "models" && this.items != newValue) {
            this.items = newValue;
            return true;
        }
        return false;
    }

    protected onUploadFileChange(e) {
        let input = this.fileInputRef.instance.dom as HTMLInputElement;
        let fileList = input.files;
        let reupload = this.props.reupload;
        if (this.props.type == "avatar") reupload = true;
        if (this.props.type == "button" && !this.props.multi) reupload = true;
        if (reupload) {
            this.items = [];
        }

        let newFiles = [];
        if (fileList && fileList.length > 0) {
            let self = this;
            for (let i = 0; i < fileList.length; i++) {
                let file = fileList.item(i);
                let name = file.name;
                let size = file.size;

                let item: UploadModel = {
                    key: self.items.length + "",
                    name: name,
                    size: size,
                    file: file,
                    status: "ready"
                }

                let promise: Promise<{}>;
                let rsl, isNotAsync = true;
                if (this.props.onAsyncFile) {
                    promise = this.props.onAsyncFile(item, "add");
                    if (promise) isNotAsync = false;
                }
                if (!promise) {
                    promise = new Promise<{}>((resolve, reject) => {
                        rsl = resolve;
                    });
                }

                this.items.push(item);
                promise.then(value => {
                    let reads = new FileReader();
                    reads.readAsDataURL(file);
                    reads.onload = function (e) {
                        let src = this.result;
                        item.src = src;
                        item.status = "finish";
                        self.redrawing();
                    };
                }).catch(reason => {
                    let reads = new FileReader();
                    reads.readAsDataURL(file);
                    reads.onload = function (e) {
                        let src = this.result;
                        item.src = src;
                        self.redrawing();
                    };
                })

                if (isNotAsync && rsl) {
                    rsl(item);
                }

                newFiles.push(file);
            }

            this.props.onChange && this.props.onChange(this.items, newFiles);
        }
    }

    getItems(): Array<UploadModel> {
        return this.items;
    }
}
