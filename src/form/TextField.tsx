import Ginkgo, {GinkgoElement, GinkgoNode, InputComponent} from "ginkgoes";
import FormField, {FormFieldProps} from "./FormField";
import "./TextField.scss";

export interface TextFieldProps extends FormFieldProps {
    placeholder?: string;
    value?: number | string;
    editable?: boolean;
    type?: "text" | "password";
    focusSelection?: boolean;
}

export default class TextField<P extends TextFieldProps> extends FormField<P> {
    protected static textFieldCls;
    protected static textFieldBodyCls;
    protected static textFieldInputCls;

    protected fieldBorder = true;
    protected readonly = false;
    protected inputEl: InputComponent;
    protected value?: any = this.props.value;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        TextField.textFieldCls = this.getThemeClass("textfield");
        TextField.textFieldBodyCls = this.getThemeClass("textfield-body");
        TextField.textFieldInputCls = this.getThemeClass("textfield-input");
    }

    componentReceiveProps(props: P, context?: { oldProps: P; type: "new" | "mounted" }) {
        super.componentReceiveProps(props, context);
    }

    protected drawingFieldBody() {
        let spinner = this.drawingFieldSpinner();
        let inputEl = this.drawingFieldBodyInner();

        return (
            <div className={TextField.textFieldCls}>
                <div className={TextField.textFieldBodyCls}
                     onClick={this.onInputCtClick.bind(this)}>
                    {inputEl}
                </div>
                {spinner}
            </div>
        );
    }

    protected drawingFieldSpinner(): GinkgoNode {
        return null;
    }

    protected drawingFieldBodyInner(): GinkgoNode | GinkgoElement[] {
        let readonlys = false;
        if (this.readonly) readonlys = true;
        if (this.props.editable == false) readonlys = true;
        let attrs = {};
        if (readonlys) attrs = {readonly: readonlys};
        if (this.props.type) attrs['type'] = this.props.type;

        return (
            <input
                ref={c => this.inputEl = c}
                onKeyUp={this.onInputKeyUp.bind(this)}
                className={TextField.textFieldInputCls}
                value={this.value || ""}
                type={"text"}
                {...attrs}
                autocomplete="off"
                placeholder={this.props.placeholder || ""}
                onChange={e => {
                    this.onInputChange(e);
                }}
                onFocus={e => {
                    if (this.props.focusSelection) {
                        this.fieldFocusBorder = true;
                        this.redrawing();
                        let input = this.inputEl.dom as HTMLInputElement;
                        input.setSelectionRange(0, 0);
                        input.setSelectionRange(0, ("" + this.value).length);
                    }
                }}
                onBlur={e => {
                    if (this.props.focusSelection) {
                        this.fieldFocusBorder = false;
                        this.redrawing();
                    }
                }}/>
        );
    }

    protected onInputCtClick(e) {

    }

    protected onInputKeyUp(e) {
        this.validate();
    }

    protected onInputChange(e) {
        this.value = "" + this.inputEl.value;
        this.triggerOnChangeEvents(this, this.value);
    }

    setValue(value: any): void {
        if (this.inputEl) {
            if (value) {
                if (typeof value === "object") {
                    value = JSON.stringify(value);
                }
                this.inputEl.value = value;
                this.value = value;
            } else {
                this.inputEl.value = "";
                this.value = "";
            }
        }
    }

    getValue(): any {
        return this.inputEl.value;
    }

    getRowValue(): any {
        return this.getValue();
    }

    focus(): void {
        if (this.inputEl.dom) {
            (this.inputEl.dom as HTMLInputElement).focus();
        }
    }
}
