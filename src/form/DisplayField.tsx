import Ginkgo, {GinkgoNode} from "ginkgoes";
import FormField, {FormFieldProps} from "./FormField";

export interface DisplayFieldProps extends FormFieldProps {
    emptyText?: string;
    value?: any;
    displayField?: string;
    valueField?: string;
    render?: (value: any) => GinkgoNode;
}

export default class DisplayField<P extends DisplayFieldProps> extends FormField<P> {

    protected value: any = this.props.value;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == "value" && newValue != oldValue) {
            if (this.props.valueField) {
                this.value = newValue[this.props.valueField];
            } else {
                this.value = newValue;
            }
        }
        return false;
    }

    protected drawingFieldBody(): GinkgoNode {
        let text = this.props.emptyText || "";
        if (this.value && (this.props.displayField || this.props.valueField)) {
            text = this.value[this.props.displayField || "text"];
        } else if (this.value) {
            text = this.value;
        }

        if (this.props.render) {
            return this.props.render(this.value);
        }

        if (typeof text == "object" && text['module']) {
            return (text)
        } else {
            return (
                <span setInnerHTML={text}></span>
            )
        }
    }


    setValue(value: any): void {
        let oldValue = this.getValue();
        if (this.props.valueField) {
            this.value = value[this.props.valueField];
        } else {
            this.value = value;
        }
        this.redrawingFieldBody();
        let newValue = this.getValue();
        if (oldValue != newValue) {
            this.triggerOnChangeEvents(this, newValue);
        }
    }

    getValue(): any {
        if (this.props.valueField) {
            return this.props.value[this.props.valueField];
        }
        return this.props.value;
    }

    getRowValue(): any {
        return this.value;
    }
}
