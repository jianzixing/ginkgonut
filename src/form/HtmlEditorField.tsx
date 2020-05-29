import FormField, {FormFieldProps} from "./FormField";
import Ginkgo, {GinkgoNode, RefObject} from "ginkgoes";
import HtmlEditor, {HtmlEditorProps} from "../htmleditor/HtmlEditor";

export interface HtmlEditorFieldProps extends FormFieldProps {
    editor?: HtmlEditorProps;
}

export default class HtmlEditorField<P extends HtmlEditorFieldProps> extends FormField<P> {

    protected htmlEditor: RefObject<HtmlEditor<any>> = Ginkgo.createRef();

    protected drawingFieldBody(): GinkgoNode {
        let editorProps = this.props.editor || {};
        if (!editorProps.height && !editorProps.editorAutoHeight) {
            editorProps.height = this.props.height;
        }
        return (
            <HtmlEditor ref={this.htmlEditor}
                        {...editorProps}
                        onChange={value => {
                            this.triggerOnChangeEvents(this, value);
                        }}/>
        );
    }

    getValue(): any {
        if (this.htmlEditor.instance) {
            return this.htmlEditor.instance.getValue();
        }
    }

    setValue(value: any) {
        if (this.htmlEditor.instance) {
            this.htmlEditor.instance.setValue(value);
        }
    }

    getRowValue(): any {
        return this.getValue();
    }
}
