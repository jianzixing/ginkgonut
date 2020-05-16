import Ginkgo, {GinkgoElement, GinkgoNode, HTMLComponent, InputComponent, RefObject} from "ginkgoes";
import TextField, {TextFieldProps} from "./TextField";
import Button from "../button/Button";
import "./FileUploadField.scss";
import Upload, {UploadModel, UploadProps} from "../upload/Upload";

export interface FileUploadFieldProps extends TextFieldProps {
    uploadType?: "default" | "preview";
    uploadProps?: UploadProps; // uploadType=preview有效
    buttonText?: string;
    buttonIcon?: string;
    buttonIconType?: string;
    buttonIconAlign?: "left" | "right";
    onButtonClick?: (e) => void;
}

export class FileUploadField<P extends FileUploadFieldProps> extends TextField<P> {
    protected static fileUploadFieldRightCls;
    protected static fileUploadFieldInputCls;

    protected rightElRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected rightButtonRef: RefObject<Button<any>> = Ginkgo.createRef();
    protected fileInputRef: RefObject<InputComponent> = Ginkgo.createRef();
    protected uploadRef: RefObject<Upload<any>> = Ginkgo.createRef();

    protected readonly = true;
    protected fieldBorder = true;
    protected value: FileList;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        FileUploadField.fileUploadFieldRightCls = this.getThemeClass("fileupload-right");
        FileUploadField.fileUploadFieldInputCls = this.getThemeClass("fileupload-input");
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
                            onAsyncFile={this.onUploadAsyncFile.bind(this)}/>);
        }
    }

    protected drawingFieldRight(): GinkgoNode {
        let text = this.props.buttonText;
        let uploadType = this.props.uploadType;

        if (uploadType == null || uploadType == "default") {
            if (!this.props.buttonIcon && !this.props.buttonIconType
                && (!this.props.buttonText || this.props.buttonText.trim() == '')) {
                text = "Browse..."
            }
            return (
                <div ref={this.rightElRef}
                     className={FileUploadField.fileUploadFieldRightCls}>
                    <Button ref={this.rightButtonRef}
                            text={text}
                            icon={this.props.buttonIcon}
                            iconType={this.props.buttonIconType}
                            onClick={this.onUploadButtonClick.bind(this)}/>
                    <input ref={this.fileInputRef} type={"file"}
                           className={FileUploadField.fileUploadFieldInputCls}
                           onChange={this.onUploadFileChange.bind(this)}/>
                </div>
            )
        }
    }

    protected onUploadAsyncFile(item: UploadModel, type: "del" | "add"): Promise<{}> {
        let promise = new Promise((resolve, reject) => {
            let file = item.file;
            let name = file.name;
            let formData = new FormData();
            formData.append(name, file);
            Ginkgo.post("", formData)
                .then(value => {

                })
                .catch(reason => {

                });
        });

        return undefined;
    }

    protected onUploadButtonClick(e) {
        this.props.onButtonClick && this.props.onButtonClick(e);
    }

    protected onUploadFileChange(e) {
        let input = this.fileInputRef.instance.dom as HTMLInputElement;
        let fileList = input.files;
        this.value = fileList;
        if (fileList && fileList.length > 0) {
            let file = fileList[0];
            let name = file.name;
            let size = file.size;
            this.inputEl.value = name;
        }

        this.triggerOnChangeEvents(this, this.value);
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
                        src: v
                    });
                    key++;
                }
                if (this.uploadRef && this.uploadRef.instance) {
                    this.uploadRef.instance.update("models", models);
                }
            } else if (typeof value == "string") {
                let models: Array<UploadModel> = [];
                models.push({
                    key: "0",
                    src: value
                })
                if (this.uploadRef && this.uploadRef.instance) {
                    this.uploadRef.instance.update("models", models);
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

                        if (self.uploadRef && self.uploadRef.instance) {
                            self.uploadRef.instance.update("models", models);
                        }
                    };
                }
            }
        }
    }

    getValue(): FileList | Array<File> {
        let uploadType = this.props.uploadType;
        if (uploadType == null || uploadType == "default") {
            return this.value;
        } else {
            if (this.uploadRef && this.uploadRef.instance) {
                let items = this.uploadRef.instance.getItems();
                if (items && items.length > 0) {
                    let arr = [];
                    for (let item of items) {
                        arr.push(item.file);
                    }
                    return arr;
                }
            }
        }
    }

    getRowValue(): FileList | Array<File> {
        return this.getValue();
    }

    protected onAfterDrawing() {
        super.onAfterDrawing();

        if (this.rightElRef && this.rightElRef.instance
            && this.rightButtonRef && this.rightButtonRef.instance) {
            let width = this.rightButtonRef.instance.getWidth();
            let el = this.rightElRef.instance.dom as HTMLElement;
            el.style.width = width + "px";
        }
    }
}
