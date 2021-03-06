import Ginkgo, {CSSProperties, GinkgoNode, InputComponent} from "ginkgoes";
import FormField, {FormFieldProps} from "./FormField";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import "./CheckboxField.scss";

export interface CheckboxFieldProps extends FormFieldProps {
    text?: GinkgoNode;
    checked?: boolean;
    value?: boolean;
    checkAlign?: "left" | "center" | "right";
    itemStyle?: CSSProperties;
    selectByIcon?: boolean;
}

export default class CheckboxField<P extends CheckboxFieldProps> extends FormField<P> {
    protected static checkboxItemCls;
    protected static checkboxItemIconCls;
    protected static checkboxItemTextCls;
    protected static checkboxItemTextCenterCls;
    protected static checkboxItemTextLeftCls;
    protected static checkboxItemTextRightCls;

    protected value: boolean = this.props.checked;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        CheckboxField.checkboxItemCls = this.getThemeClass("checkbox-item");
        CheckboxField.checkboxItemIconCls = this.getThemeClass("checkbox-icon");
        CheckboxField.checkboxItemTextCls = this.getThemeClass("checkbox-text");
        CheckboxField.checkboxItemTextCenterCls = this.getThemeClass("checkbox-center");
        CheckboxField.checkboxItemTextLeftCls = this.getThemeClass("checkbox-left");
        CheckboxField.checkboxItemTextRightCls = this.getThemeClass("checkbox-right");
    }

    protected drawingFieldBody() {
        let cls = [CheckboxField.checkboxItemCls];
        let label;
        if (typeof this.props.text == "string" || this.props.text == null) {
            label = <label className={CheckboxField.checkboxItemTextCls}>{this.props.text || ""}</label>;
        } else {
            label = this.props.text;
        }

        return (
            <div className={cls}
                 onClick={e => {
                     if (!this.props.selectByIcon) {
                         this.onFieldClick(e);
                     }
                 }} style={this.props.itemStyle}>
                <Icon className={CheckboxField.checkboxItemIconCls}
                      icon={this.value ? IconTypes._extCheckedSel : IconTypes._extCheckedUnset}
                      onClick={e => {
                          if (this.props.selectByIcon) {
                              this.onFieldClick(e);
                          }
                      }}/>
                {label}
            </div>
        );
    }

    protected getFieldBodyClassName(): string[] | undefined {
        let arr = super.getFieldBodyClassName() || [];
        if (this.props.checkAlign == "left") arr.push(CheckboxField.checkboxItemTextLeftCls);
        if (this.props.checkAlign == "center") arr.push(CheckboxField.checkboxItemTextCenterCls);
        if (this.props.checkAlign == "right") arr.push(CheckboxField.checkboxItemTextRightCls);
        return arr;
    }


    compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if ((key == 'value' || key == 'checked') && this.value != newValue) {
            this.value = newValue;
            this.redrawingFieldBody();
            return false;
        }
    }

    protected onFieldClick(e) {
        if (this.value) {
            this.value = false;
        } else {
            this.value = true;
        }
        this.redrawingFieldBody();
        this.triggerOnChangeEvents(this, this.value);
    }


    setValue(value: any): void {
        let oldValue = this.getValue();
        if (value) {
            this.value = true;
        } else {
            this.value = false;
        }
        this.redrawingFieldBody();

        let newValue = this.getValue();
        if (oldValue != newValue) {
            this.triggerOnChangeEvents(this, this.getValue());
        }
    }

    getValue(): any {
        return !!this.value;
    }

    getRowValue(): any {
        return !!this.value;
    }
}
