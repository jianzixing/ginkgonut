import Ginkgo, {GinkgoElement, GinkgoNode, HTMLComponent, InputComponent, RefObject} from "ginkgoes";
import TextField, {TextFieldProps} from "./TextField";
import Upload, {UploadModel, UploadProps} from "../upload/Upload";
import {Submit} from "../http/Request";
import ObjectTools from "../tools/ObjectTools";
import "./FileUploadField.scss";

type FileUploadResponse = {
    resolve: (...args: any) => void,
    reject: (...args: any) => void,
    item: UploadModel,
    response?: any;
    status?: "ok" | "fail"
};

export interface FileUploadFieldProps extends TextFieldProps {
    uploadType?: "default" | "avatar" | "preview" | "button";
    uploadProps?: UploadProps; // uploadType=preview有效
    buttonText?: string;
    buttonIcon?: string;
    buttonIconType?: string;
    buttonIconAlign?: "left" | "right";

    isSyncUpload?: boolean; // true之后组件选择文件后自动上传并获取当前返回值作为value
    uploadUrl?: string | Submit;
    deleteUrl?: string | Submit;
    valueField?: string;
    onUploadResponse?: (params: FileUploadResponse) => void;
    onDeleteResponse?: (params: FileUploadResponse) => void;
    onImageSrc?: (src: string | ArrayBuffer, item?: UploadModel) => string;
}

export default class FileUploadField<P extends FileUploadFieldProps> extends TextField<P> {
    protected static fileUploadFieldRightCls;

    protected rightElRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected uploadRef: RefObject<Upload<any>> = Ginkgo.createRef();

    protected readonly = true;
    protected fieldBorder = true;
    protected value: FileList;

    protected models: Array<UploadModel>;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        FileUploadField.fileUploadFieldRightCls = this.getThemeClass("fileupload-right");
    }

    protected drawing(): GinkgoElement<any> | string | GinkgoElement[] | undefined | null {
        if (this.props.uploadType != null && this.props.uploadType != "default") {
            this.fieldBorder = false;
        }
        return super.drawing();
    }

    protected drawingFieldBody(): any {
        let uploadType = this.props.uploadType;
        if (uploadType == null || uploadType == "default") {
            return super.drawingFieldBody();
        } else {
            return (<Upload {...this.props.uploadProps || {}}
                            ref={this.uploadRef}
                            type={this.props.uploadType}
                            onImageSrc={this.props.onImageSrc}
                            onAsyncFile={this.onUploadAsyncFile.bind(this)}/>);
        }
    }

    protected drawingFieldRight(): GinkgoNode {
        let uploadType = this.props.uploadType;

        if (uploadType == null || uploadType == "default") {
            return (
                <div ref={this.rightElRef}
                     className={FileUploadField.fileUploadFieldRightCls}>
                    <Upload type={"button"}
                            ref={this.uploadRef}
                            buttonText={this.props.buttonText}
                            buttonIcon={this.props.buttonIcon}
                            buttonIconType={this.props.buttonIconType}
                            onImageSrc={this.props.onImageSrc}
                            onAsyncFile={this.onUploadAsyncFile.bind(this)}/>
                </div>
            )
        }
    }

    protected onUploadAsyncFile(item: UploadModel, type: "del" | "add"): Promise<{}> {
        if (this.props.uploadType == null || this.props.uploadType == "default") {
            let file = item.file;
            let name = file.name;
            let size = file.size;
            this.inputEl.value = name;
        }

        if (this.props.isSyncUpload) {
            if (type == "add") {
                let url = this.props.uploadUrl;
                if (url == null) {
                    throw new Error("FileUploadField if isSyncUpload=true must set uploadUrl");
                }
                if (url instanceof Submit) {
                    url = url.getParamUrl();
                }
                let promise = new Promise((resolve, reject) => {
                    let file = item.file;
                    let name = file.name;
                    let formData = new FormData();
                    formData.append(name, file);
                    Ginkgo.post(url as string, formData)
                        .then(value => {
                            if (this.props.valueField) {
                                let obj = ObjectTools.valueFromTemplate(value, this.props.valueField);
                                if (obj instanceof Array) {
                                    if (obj.length > 0) item.data = obj[0];
                                } else {
                                    item.data = obj;
                                }
                            }

                            if (this.props.onUploadResponse) {
                                this.props.onUploadResponse({resolve, reject, item, response: value, status: "ok"});
                            } else {
                                resolve(value);
                            }

                            if (this.uploadRef.instance) {
                                let arr = [];
                                let items = this.uploadRef.instance.getItems();
                                for (let item of items) {
                                    arr.push(item.data);
                                }
                                if (this.props.uploadType == "avatar") {
                                    this.triggerOnChangeEvents(this, item.data);
                                } else {
                                    this.triggerOnChangeEvents(this, arr);
                                }
                            }
                        })
                        .catch(reason => {
                            if (this.props.onUploadResponse) {
                                this.props.onUploadResponse({resolve, reject, item, response: reason, status: "fail"});
                            } else {
                                item.status = "error";
                                item.error = reason && reason.statusCode ? "Upload Fail" + reason.statusCode : "Upload Fail";
                                reject(reason);
                            }
                        });
                });

                return promise;
            }
            if (type == "del") {
                let url = this.props.deleteUrl;
                if (url == null) {
                    return undefined;
                }
                if (url instanceof Submit) {
                    url = url.getParamUrl();
                }
                if (item.data) {
                    url = (url as string).replace("{value}", item.data);

                    let promise = new Promise((resolve, reject) => {
                        Ginkgo.get(url as string)
                            .then(value => {
                                if (this.props.onDeleteResponse) {
                                    this.props.onDeleteResponse({resolve, reject, item, response: value, status: "ok"});
                                } else {
                                    resolve(value);
                                }

                                if (this.uploadRef.instance) {
                                    let arr = [];
                                    let items = this.uploadRef.instance.getItems();
                                    for (let item of items) {
                                        arr.push(item.data);
                                    }
                                    if (this.props.uploadType == "avatar") {
                                        this.triggerOnChangeEvents(this, null);
                                    } else {
                                        this.triggerOnChangeEvents(this, arr);
                                    }
                                }
                            })
                            .catch(reason => {
                                if (this.props.onDeleteResponse) {
                                    this.props.onDeleteResponse({
                                        resolve,
                                        reject,
                                        item,
                                        response: reason,
                                        status: "fail"
                                    });
                                } else {
                                    item.status = "error";
                                    item.error = reason && reason.statusCode ? "Upload Fail" + reason.statusCode : "Upload Fail";
                                    reject(reason);
                                }
                            })
                    });
                    return promise;
                } else {
                    console.error("missing delete file data");
                }
            }
        } else {
            if (this.uploadRef.instance) {
                let arr = [];
                let items = this.uploadRef.instance.getItems();
                for (let item of items) {
                    arr.push(item.file);
                }
                if (this.props.uploadType == "avatar") {
                    if (arr && arr.length > 0) this.triggerOnChangeEvents(this, arr[0]);
                } else {
                    this.triggerOnChangeEvents(this, arr);
                }
            }
        }

        return undefined;
    }

    componentDidMount() {
        super.componentDidMount();
        if (this.uploadRef && this.uploadRef.instance) {
            this.uploadRef.instance.set("models", this.models);
        }
    }

    setValue(value: string | FileList | string[]): void {
        let uploadType = this.props.uploadType;
        if (uploadType == null || uploadType == "default") {
            if (typeof value === "string") {
                this.inputEl.value = value;
            }
            if (value instanceof FileList) {
                if (value && value.length > 0) {
                    let file = value[0];
                    let name = file.name;
                    let size = file.size;
                    this.inputEl.value = name;
                }
            }
        } else {
            if (value instanceof Array) {
                let models: Array<UploadModel> = [];
                let key = 0;
                for (let v of value) {
                    models.push({
                        key: key + "",
                        src: v,
                        data: v,
                        status: "finish"
                    });
                    key++;
                }
                this.models = models;
                if (this.uploadRef && this.uploadRef.instance) {
                    this.uploadRef.instance.set("models", models);
                }
            } else if (typeof value == "string") {
                let models: Array<UploadModel> = [];
                models.push({
                    key: "0",
                    src: value,
                    data: value,
                    status: "finish"
                })
                this.models = models;
                if (this.uploadRef && this.uploadRef.instance) {
                    this.uploadRef.instance.set("models", models);
                }
            } else if (value instanceof FileList) {
                let models: Array<UploadModel> = [];
                let self = this;
                for (let i = 0; i < value.length; i++) {
                    let file = value.item(i);
                    let reads = new FileReader();
                    reads.readAsDataURL(file);
                    reads.onload = function (e) {
                        let src = this.result;
                        models.push({
                            key: models.length + "",
                            src: src,
                            name: file.name,
                            size: file.size,
                            file: file,
                            status: "ready"
                        });

                        self.models = models;
                        if (self.uploadRef && self.uploadRef.instance) {
                            self.uploadRef.instance.set("models", models);
                        }
                    };
                }
            }
        }
        this.triggerOnChangeEvents(this, this.getValue());
    }

    getValue(): FileList | Array<File> | Array<string> | string {
        let uploadType = this.props.uploadType;
        if (this.uploadRef && this.uploadRef.instance) {
            let items = this.uploadRef.instance.getItems();
            if (items && items.length > 0) {
                let arr = [];
                for (let item of items) {
                    if (this.props.isSyncUpload) {
                        arr.push(item.data);
                    } else {
                        arr.push(item.file);
                    }
                }
                if (uploadType == "avatar" || uploadType == "default" || uploadType == null) {
                    if (arr && arr.length > 0) {
                        return arr[0];
                    } else {
                        return null;
                    }
                }
                return arr;
            }
        }
    }

    getRowValue(): FileList | Array<File> | Array<string> | string {
        return this.getValue();
    }

    componentRenderUpdate() {
        if (this.rightElRef && this.rightElRef.instance
            && this.uploadRef && this.uploadRef.instance
            && (this.props.uploadType == "default"
                || this.props.uploadType == null)) {
            let width = this.uploadRef.instance.getWidth();
            let el = this.rightElRef.instance.dom as HTMLElement;
            el.style.width = width + "px";
        }
    }
}
