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

        let value = this.value;
        if (this.value == null) value = '';
        return (
            <input
                ref={c => this.inputEl = c}
                onKeyUp={this.onInputKeyUp.bind(this)}
                className={TextField.textFieldInputCls}
                value={value}
                type={"text"}
                {...attrs}
                autocomplete="off"
                placeholder={this.props.placeholder || ""}
                onChange={e => {
                    this.onInputChange(e);
                }}
                onInput={e => {
                    this.onInputEvent(e);
                }}
                onFocus={e => {
                    this.onInputFocus(e);
                }}
                onBlur={e => {
                    if (this.props.focusSelection) {
                        this.fieldFocusBorder = false;
                        this.setState();
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

    protected onInputEvent(e) {

    }

    protected onInputFocus(e) {
        if (this.props.focusSelection) {
            this.fieldFocusBorder = true;
            this.setState();
            let input = this.inputEl.dom as HTMLInputElement;
            input.setSelectionRange(0, 0);
            input.setSelectionRange(0, ("" + this.value).length);
        }
    }

    setValue(value: any): void {
        if (this.inputEl) {
            if (value != null) {
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
        if (this.inputEl) {
            return this.inputEl.value;
        }
        return null;
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
