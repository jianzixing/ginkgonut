import Ginkgo, {GinkgoNode, InputComponent} from "ginkgoes";
import FormField, {FormFieldProps} from "./FormField";
import CheckboxField from "./CheckboxField";
import "./CheckboxGroupField.scss";
import ObjectTools from "../tools/ObjectTools";

export interface CheckboxGroupModel {
    value?: number | string;
    text: GinkgoNode;
    checked?: boolean;
    data?: any;
}

export interface CheckboxGroupFieldProps extends FormFieldProps {
    itemWidth?: number | string;
    models?: Array<CheckboxGroupModel>;
    direction?: "horizontal" | "vertical";
    value?: Array<number | string> | number | string;
    selectByIcon?: boolean;
    onSelected?: (field: CheckboxGroupField<any>, value: CheckboxGroupModel, isCheck: boolean) => void;
}

export default class CheckboxGroupField<P extends CheckboxGroupFieldProps> extends FormField<P> {
    protected static checkboxGroupFieldBodyCls;
    protected static checkboxGroupFieldItemCls;
    protected static checkboxGroupFieldItemBodyCls;

    protected models: Array<CheckboxGroupModel> = this.props.models;
    protected value: Array<CheckboxGroupModel> = [];

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        CheckboxGroupField.checkboxGroupFieldBodyCls = this.getThemeClass("checkboxgroup-body");
        CheckboxGroupField.checkboxGroupFieldItemCls = this.getThemeClass("checkboxgroup-item");
        CheckboxGroupField.checkboxGroupFieldItemBodyCls = this.getThemeClass("checkboxgroup-item-body");
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == 'models' && this.models != newValue) {
            this.models = newValue;
            if (this.models) {
                for (let m of this.models) {
                    if (this.isInValue(m)) {
                        m.checked = true;
                    } else {
                        m.checked = false;
                    }
                }
                if (this.value) {
                    for (let v of this.value) {
                        let has = false;
                        for (let m of this.models) {
                            if (this.isInValueImpl(v, m) == true) {
                                has = true;
                                break;
                            }
                        }
                        if (!has) {
                            this.value.splice(this.value.indexOf(v), 1);
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }

    protected isInValue(v: CheckboxGroupModel): boolean {
        let is = false;
        if (this.value) {
            for (let v1 of this.value) {
                if (this.isInValueImpl(v, v1) == true) return true;
            }
        }
        return is;
    }

    private isInValueImpl(v, v1): boolean {
        if (v1 != null && v1 == v) return true;
        if (v1.value != null && v1.value == v.value) return true;
        if (v1.data != null && v1.data == v.data) return true;
        return null;
    }

    protected drawingFieldBody() {
        let items = [];
        if (this.models) {
            for (let m of this.models) {
                if (m.checked && !this.isInValue(m)) {
                    this.value.push(m);
                }
                let style = {};
                if (this.props.direction == "vertical") {
                    style["width"] = "100%";
                } else {
                    if (this.props.itemWidth) {
                        style["width"] = this.props.itemWidth;
                    } else {
                        style["width"] = 100 / this.models.length + "%";
                    }
                }
                items.push(
                    <div className={CheckboxGroupField.checkboxGroupFieldItemCls} style={style}>
                        <div className={CheckboxGroupField.checkboxGroupFieldItemBodyCls}>
                            <CheckboxField text={m.text || ""}
                                           checked={m.checked ? true : false}
                                           disabledFormChange={true}
                                           fixMinWidth={false}
                                           selectByIcon={this.props.selectByIcon}
                                           enableShowError={false}
                                           onChange={e => {
                                               let oldValue = [];
                                               this.value.map(i => {
                                                   if (i.value != null) oldValue.push(i.value)
                                               });
                                               if (e.value) {
                                                   if (!this.isInValue(m)) this.value.push(m);
                                               } else {
                                                   this.value = this.value.filter(value => {
                                                       return this.isInValueImpl(value, m) != true;
                                                   });
                                               }
                                               let newValues = [];
                                               this.value.map(i => {
                                                   if (i.value != null) newValues.push(i.value);
                                               })
                                               this.triggerOnChangeEvents(this,
                                                   newValues.length > 0 ? newValues : undefined,
                                                   oldValue.length > 0 ? oldValue : undefined);
                                               if (this.props.onSelected) {
                                                   this.props.onSelected(this, m, !!e.value);
                                               }
                                           }}/>
                        </div>
                    </div>)
            }
        }
        return <div className={CheckboxGroupField.checkboxGroupFieldBodyCls}>{items}</div>;
    }

    setValue(value: any): void {
        if (this.models) {
            let oldValue = this.getValue();
            this.setValueModel(value);
            this.redrawingFieldBody();
            let newValue = this.getValue();
            if (!ObjectTools.objectEqualArray(oldValue, newValue, false)) {
                this.triggerOnChangeEvents(this, newValue, oldValue);
            }
        }
    }

    private setValueModel(value: any) {
        for (let m of this.models) {
            m.checked = false;
        }
        let isSetValue = false;
        if (value instanceof Array) {
            for (let v of value) {
                let b = this.setValueSingle(v);
                if (b) isSetValue = true;
            }
        } else {
            isSetValue = this.setValueSingle(value);
        }

        if (!isSetValue) {
            this.value = [];
        }
    }

    private setValueSingle(value: any): boolean {
        let isSetValue = false;
        for (let m of this.models) {
            if (m.value == value || m.data == value) {
                m.checked = true;
                if (!this.isInValue(m)) {
                    this.value.push(m);
                }
                isSetValue = true;
            }
        }
        return isSetValue;
    }

    getValue(): any {
        if (this.value) {
            let values = [];
            this.value.map(value => {
                values.push(value.value);
            });
            if (values && values.length > 0) return values;
        }
    }

    getRowValue(): any {
        if (this.value) {
            return this.value.filter(value => value.data);
        }
        return this.value;
    }
}
