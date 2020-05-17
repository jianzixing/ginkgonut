import Ginkgo, {GinkgoElement, GinkgoNode, HTMLComponent, InputComponent, RefObject} from "ginkgoes";
import TextField, {TextFieldProps} from "./TextField";
import Button from "../button/Button";
import "./SelectField.scss";

export interface SelectFieldProps extends TextFieldProps {
    buttonText?: string;
    buttonIcon?: string;
    buttonIconType?: string;
    buttonIconAlign?: "left" | "right";
    onButtonClick?: (e, selectField: SelectField<SelectFieldProps>) => void;
    displayField?: string;
    valueField?: string;
}

export class SelectField<P extends SelectFieldProps> extends TextField<P> {
    protected static selectFieldRightCls;

    protected rightElRef: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected rightButtonRef: RefObject<Button<any>> = Ginkgo.createRef();

    protected readonly = true;
    protected fieldBorder = true;
    protected value: any;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        SelectField.selectFieldRightCls = this.getThemeClass("selectfield-right");
    }

    protected drawingFieldRight(): GinkgoNode {
        let text = this.props.buttonText;

        if (!this.props.buttonIcon && !this.props.buttonIconType
            && (!this.props.buttonText || this.props.buttonText.trim() == '')) {
            text = "Select..."
        }
        return (
            <div ref={this.rightElRef}
                 className={SelectField.selectFieldRightCls}>
                <Button ref={this.rightButtonRef}
                        text={text}
                        icon={this.props.buttonIcon}
                        iconType={this.props.buttonIconType}
                        onClick={this.onButtonClick.bind(this)}/>
            </div>
        )
    }

    protected onButtonClick(e) {
        this.props.onButtonClick && this.props.onButtonClick(e, this);
    }

    setValue(value: string | { [key: string]: any }): void {
        if (typeof value == "string") {
            this.inputEl.value = value;
        }
        if (typeof value == "object") {
            let text = value[this.props.displayField || "text"];
            this.inputEl.value = text;
        }

        this.value = value;
    }

    getValue(): any {
        if (typeof this.value == "string") {
            return this.value;
        }
        if (typeof this.value == "object") {
            let value = this.value[this.props.valueField || "id"];
            return value;
        }
    }

    getRowValue(): any {
        return this.value;
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
