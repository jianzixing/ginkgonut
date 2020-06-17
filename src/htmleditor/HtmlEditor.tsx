import Ginkgo, {GinkgoElement, GinkgoNode, HTMLComponent, RefObject} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./HtmlEditor.scss";
import {Submit} from "../http/Request";
import {ObjectTools} from "../ginkgonut";

export class CustomEditor {
    getValue?(): string;

    onChange?(fn: (value: string) => void): void;

    destroy?(): void;
}

export interface HtmlEditorProps extends ComponentProps {
    fitParent?: boolean;
    editToolbarHeight?: number;
    onDrawingEditor?: (dom: HTMLElement, options?: any) => CustomEditor;
    options?: any;
    onChange?: (value: string) => void;
    onEditorPlugin?: (editor: any) => void;
    onEditorReady?: (editor: any) => void;
    editorAutoHeight?: boolean;
    uploadUrl?: string | Submit;
    uploadFileData?: string;
    previewUploadFile?: (file: string) => string | string;
    uploadResponse?: (resolve, reject, data) => boolean;
    uploadByCustom?: (resolve, reject, file) => void;
    value?: string;
}

export default class HtmlEditor<P extends HtmlEditorProps> extends Component<P> {
    protected static htmlEditorCls;
    protected static htmlEditorBodyCls;

    protected bodyRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected customEditor: CustomEditor;
    protected editor: any;

    protected value = this.props.value;

    protected buildClassNames(themePrefix: string) {
        super.buildClassNames(themePrefix);

        HtmlEditor.htmlEditorCls = this.getThemeClass("html-editor");
        HtmlEditor.htmlEditorBodyCls = this.getThemeClass("html-editor-body");
    }

    protected drawing(): GinkgoNode | GinkgoElement[] {
        return (
            <div ref={this.bodyRef} className={HtmlEditor.htmlEditorBodyCls}>

            </div>
        )
    }

    protected onAfterDrawing() {
        if (this.bodyRef.instance) {
            let dom = this.bodyRef.instance.dom as HTMLElement;
            if (dom) {
                if (this.props.onDrawingEditor) {
                    this.customEditor = this.props.onDrawingEditor(dom, this.props.options);
                    if (this.props.onChange) {
                        this.customEditor.onChange(this.props.onChange);
                    }
                } else {
                    if (this.editor) {
                        try {
                            this.editor.destroy();
                        } catch (e) {
                        }
                        this.editor = null;
                    }

                    function CKEditorHeightPlugin(editor) {
                        this.editor = editor;
                    }

                    CKEditorHeightPlugin.prototype.init = function () {
                        const minHeight = this.editor.config.get('minHeight');
                        const height = this.editor.config.get('height');
                        const width = this.editor.config.get('width');

                        if (minHeight || height || width) {
                            let style = {};
                            if (minHeight) {
                                style['minHeight'] = minHeight;
                            }
                            if (height) {
                                style['height'] = height;
                            }
                            if (width) {
                                style['width'] = width;
                            }
                            this.editor.ui.view.editable.extendTemplate({
                                attributes: {
                                    style: style
                                }
                            });
                        }
                    };
                    ClassicEditor.builtinPlugins.push(CKEditorHeightPlugin);
                    if (this.props.onEditorPlugin) {
                        this.props.onEditorPlugin(ClassicEditor);
                    }

                    let options = this.props.options || {};
                    if (this.props.editorAutoHeight) {
                        options.minHeight = (this.props.height - (this.props.editToolbarHeight || 42)) + "px";
                    } else {
                        if (this.props.fitParent) {
                            options.height = "calc(100% - 42px)";
                        } else {
                            options.height = (this.props.height - (this.props.editToolbarHeight || 42)) + "px";
                        }
                    }

                    ClassicEditor.create(dom, options).then(editor => {
                        this.editor = editor;
                        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                            return new UploadAdapter(loader, this.props);
                        };
                        if (this.value) {
                            this.editor.setData(this.value);
                        }
                        editor.model.document.on('change:data', () => {
                            this.onEditorValueChange();
                        })
                        if (this.props.onEditorReady) {
                            this.props.onEditorReady(editor);
                        }
                        console.log("ckeditor init complete");

                        if (this.props.fitParent) this.setEditorHeight();
                    }).catch(error => {
                        console.error(error);
                    });
                }
            }
        }
    }

    private setEditorHeight() {
        let root = this.rootEl.dom as HTMLElement;
        if (root) {
            let editorDom = root.querySelector('.ck.ck-content.ck-editor__editable') as HTMLElement;
            if (editorDom) {
                let parent = editorDom;
                let i = 0
                while (parent != root) {
                    if (i == 0) {
                        parent.style.height = "calc(100% - 42px)";
                    } else {
                        parent.style.height = '100%';
                    }
                    parent = parent.parentElement;
                    i++;
                }
                parent.style.height = '100%';
            }
        }
    }

    onEditorValueChange(): void {
        this.value = this.editor.getData();
        if (this.props.onChange) {
            this.props.onChange(this.value);
        }
    }

    getValue(): string {
        if (this.props.onDrawingEditor) {
            if (this.customEditor) {
                return this.customEditor.getValue();
            }
        } else if (this.editor) {
            return this.editor.getData();
        }
    }

    setValue(value?: string) {
        if (this.editor) {
            this.editor.setData(value);
            this.value = value;
        } else {
            this.value = value;
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        if (this.customEditor && this.customEditor.destroy) {
            this.customEditor.destroy();
            this.customEditor = null;
        }
        if (this.editor) {
            try {
                this.editor.destroy();
            } catch (e) {
            }
            this.editor = null;
        }
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(HtmlEditor.htmlEditorCls);
        return arr;
    }
}

class UploadAdapter {
    private loader;
    private props: HtmlEditorProps;

    constructor(loader, props: HtmlEditorProps) {
        this.loader = loader;
        this.props = props;
    }

    upload() {
        return new Promise((resolve, reject) => {
            let filePromise = this.loader.file;
            filePromise.then(file => {
                if (this.props.uploadByCustom) {
                    this.props.uploadByCustom(resolve, reject, file);
                } else {
                    if (this.props.uploadUrl instanceof Submit) {
                        this.props.uploadUrl.addExtParams({file: file})
                            .load(data => {
                                this.responseProcessor(resolve, reject, data);
                            }, message => {
                                reject(message);
                            });
                    } else {
                        const data = new FormData();
                        data.append('file', file);
                        Ginkgo.post(this.props.uploadUrl, data, {withCredentials: true})
                            .then(value => {
                                this.responseProcessor(resolve, reject, value);
                            })
                            .catch(reason => {
                                reject(reason);
                            })
                    }
                }
            })
        });
    }

    private responseProcessor(resolve, reject, data) {
        let next = true;
        if (this.props.uploadResponse) {
            next = this.props.uploadResponse(resolve, reject, data);
        }
        if (next) {
            let fileName = data;
            if (this.props.uploadFileData) {
                fileName = ObjectTools.valueFromTemplate(data, this.props.uploadFileData);
                if (this.props.previewUploadFile) {
                    if (typeof this.props.previewUploadFile == "function") {
                        fileName = this.props.previewUploadFile(fileName);
                    } else if (typeof this.props.previewUploadFile == "string") {
                        fileName = (this.props.previewUploadFile as string)
                            .replace("{file}", fileName);
                    }
                }
            }
            resolve({
                default: fileName
            })
        }
    }

    abort() {
    }
}
