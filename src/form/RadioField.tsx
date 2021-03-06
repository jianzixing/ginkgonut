import Ginkgo, {GinkgoNode, InputComponent} from "ginkgoes";
import FormField, {FormFieldProps} from "./FormField";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import "./RadioField.scss";

export interface RadioFieldProps extends FormFieldProps {
    text?: GinkgoNode;
    selected?: boolean;
    value?: boolean;
    selectByIcon?: boolean;
}

export default class RadioField<P extends RadioFieldProps> extends FormField<P> {
    protected static radioItemCls;
    protected static radioItemIconCls;
    protected static radioItemTextCls;

    protected value: boolean = this.props.selected;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        RadioField.radioItemCls = this.getThemeClass("radio-item");
        RadioField.radioItemIconCls = this.getThemeClass("radio-icon");
        RadioField.radioItemTextCls = this.getThemeClass("radio-text");
    }

    protected drawingFieldBody() {
        let label;
        if (typeof this.props.text == "string" || this.props.text == null) {
            label = <label className={RadioField.radioItemTextCls}>{this.props.text || ""}</label>;
        } else {
            label = this.props.text;
        }

        return (
            <div className={RadioField.radioItemCls}
                 onClick={e => {
                     if (!this.props.selectByIcon) {
                         this.onFieldClick(e);
                     }
                 }}>
                <Icon className={RadioField.radioItemIconCls}
                      icon={this.value ? IconTypes.dotCircle : IconTypes.circle}
                      onClick={e => {
                          if (this.props.selectByIcon) {
                              this.onFieldClick(e);
                          }
                      }}/>
                {label}
            </div>
        );
    }

    compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if ((key == 'value' || key == 'selected') && this.value != newValue) {
            this.value = newValue;
            this.redrawingFieldBody();
            return false;
        }
    }

    protected onFieldClick(e) {
        let oldValue = this.getValue();
        if (this.value) {
            this.value = false;
        } else {
            this.value = true;
        }
        this.redrawingFieldBody();
        this.triggerOnChangeEvents(this, this.value);
        let newValue = this.getValue();
        if (oldValue != newValue) {
            this.triggerOnChangeEvents(this, newValue);
        }
    }


    setValue(value: any): void {
        if (value) {
            this.value = true;
        } else {
            this.value = false;
        }
        this.redrawingFieldBody();
    }

    getValue(): any {
        return !!this.value;
    }

    getRowValue(): any {
        return !!this.value;
    }
}
