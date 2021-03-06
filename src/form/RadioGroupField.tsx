import Ginkgo, {GinkgoNode, InputComponent} from "ginkgoes";
import FormField, {FormFieldProps} from "./FormField";
import RadioField from "./RadioField";
import "./RadioGroupField.scss";

export interface RadioGroupModel {
    value?: number | string;
    text: GinkgoNode;
    selected?: boolean;
    data?: any;
}

export interface RadioGroupFieldProps extends FormFieldProps {
    itemWidth?: number | string;
    models?: Array<RadioGroupModel>;
    direction?: "horizontal" | "vertical";
    value?: number | string;
    selectByIcon?: boolean;
}

export default class RadioGroupField<P extends RadioGroupFieldProps> extends FormField<P> {
    protected static radioGroupFieldBodyCls;
    protected static radioGroupFieldItemCls;
    protected static radioGroupFieldItemBodyCls;

    protected models: Array<RadioGroupModel> = this.props.models;
    protected value: RadioGroupModel;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        RadioGroupField.radioGroupFieldBodyCls = this.getThemeClass("radiogroup-body");
        RadioGroupField.radioGroupFieldItemCls = this.getThemeClass("radiogroup-item");
        RadioGroupField.radioGroupFieldItemBodyCls = this.getThemeClass("radiogroup-item-body");
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == 'models' && this.models != newValue) {
            this.models = newValue;
            if (this.models && this.value) {
                let has = false, sels = [];
                for (let m of this.models) {
                    if (m.value == this.value.value || m.text == this.value.text) {
                        m.selected = true;
                        has = true;
                    } else {
                        if (m.selected == true) sels.push(m);
                    }
                }
                if (has == false) {
                    this.value = null;
                } else {
                    for (let sel of sels) {
                        sel.selected = false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    protected drawingFieldBody() {
        let items = [];
        if (this.models) {
            for (let m of this.models) {
                if (m.selected) this.value = m;
                let style = {};
                if (this.props.direction == "vertical") {
                    style["width"] = "100%";
                } else {
                    if (this.props.itemWidth) {
                        style["width"] = this.props.itemWidth;
                    } else {
                        style['width'] = 100 / this.models.length + "%";
                    }
                }
                items.push(
                    <div className={RadioGroupField.radioGroupFieldItemCls} style={style}>
                        <div className={RadioGroupField.radioGroupFieldItemBodyCls}>
                            <RadioField text={m.text || ""}
                                        selected={m.selected ? true : false}
                                        disabledFormChange={true}
                                        fixMinWidth={false}
                                        selectByIcon={this.props.selectByIcon}
                                        enableShowError={false}
                                        onChange={e => {
                                            let oldValue = this.value ? this.value.value : undefined;
                                            for (let m2 of this.models) {
                                                m2.selected = false;
                                            }
                                            if (e.value) {
                                                m.selected = true;
                                                this.value = m;
                                            } else {
                                                this.value = this.value = null;
                                            }
                                            this.redrawingFieldBody();


                                            this.triggerOnChangeEvents(this,
                                                this.value ? this.value.value : undefined, oldValue);
                                        }}/>
                        </div>
                    </div>)
            }
        }
        return <div className={RadioGroupField.radioGroupFieldBodyCls}>{items}</div>;
    }

    setValue(value: any): void {
        if (this.models) {
            let oldValue = this.getValue();
            this.setValueModel(value);
            this.redrawingFieldBody();
            let newValue = this.getValue();
            if (oldValue != newValue) {
                this.triggerOnChangeEvents(this, newValue, oldValue);
            }
        }
    }

    private setValueModel(value: any): void {
        for (let m of this.models) {
            m.selected = false;
        }

        let isSetValue = false;
        for (let m of this.models) {
            if (m.value == value || m.data == value) {
                m.selected = true;
                this.value = m;
                isSetValue = true;
                break;
            }
        }
        if (!isSetValue) {
            this.value = null;
        }
    }

    getValue(): any {
        if (this.value) {
            return this.value.value;
        }
    }

    getRowValue(): any {
        if (this.value && this.value.data) {
            return this.value.data;
        }
        return this.value;
    }
}
