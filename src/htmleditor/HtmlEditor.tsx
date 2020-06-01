import Ginkgo, {GinkgoElement, GinkgoNode, HTMLComponent, RefObject} from "ginkgoes";
import Component, {ComponentProps} from "../component/Component";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./HtmlEditor.scss";
import {Submit} from "../http/Request";

export class CustomEditor {
    getValue?(): string;

    onChange?(fn: (value: string) => void): void;

    destroy?(): void;
}

export interface HtmlEditorProps extends ComponentProps {
    editToolbarHeight?: number;
    onDrawingEditor?: (dom: HTMLElement, options?: any) => CustomEditor;
    options?: any;
    onChange?: (value: string) => void;
    onEditorReady?: (editor: any) => void;
    editorAutoHeight?: boolean;
    uploadUrl?: string | Submit;
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

                    let options = this.props.options || {};
                    if (this.props.editorAutoHeight) {
                        options.minHeight = (this.props.height - (this.props.editToolbarHeight || 42)) + "px";
                    } else {
                        options.height = (this.props.height - (this.props.editToolbarHeight || 42)) + "px";
                    }
                    if (this.props.uploadUrl) {
                        let url = this.props.uploadUrl;
                        if (url instanceof Submit) {
                            url = url.getParamUrl();
                        }
                        options.ckfinder = {
                            uploadUrl: url
                        }
                    }

                    ClassicEditor.create(dom, options).then(editor => {
                        this.editor = editor;
                        if (this.props.value) {
                            this.editor.setData(this.value);
                        }
                        editor.model.document.on('change:data', () => {
                            this.onEditorValueChange();
                        })
                        if (this.props.onEditorReady) {
                            this.props.onEditorReady(editor);
                        }
                        console.log("ckeditor init complete");
                    }).catch(error => {
                        console.error(error);
                    });
                }
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
