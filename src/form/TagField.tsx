import Ginkgo, {GinkgoElement, GinkgoNode, InputComponent, RefObject} from "ginkgoes";
import ComboboxField, {ComboboxFieldProps, ComboboxModel} from "./ComboboxField";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import "./TagField.scss";

export interface TagFieldProps extends ComboboxFieldProps {
    useInputValue?: boolean;
    queryField?: string;
    remote?: boolean;
}

export default class TagField<P extends TagFieldProps> extends ComboboxField<P> {
    protected static tagFieldTagsCls;
    protected static tagFieldTagCls;
    protected static tagFieldTagInputCls;
    protected static tagFieldTagInputInnerCls;
    protected static tagFieldTagInputCtCls;
    protected static tagFieldTagNameCls;
    protected static tagFieldTagIconCls;

    protected tagInputRef: RefObject<InputComponent> = Ginkgo.createRef();
    protected values: Array<ComboboxModel> = [];
    protected tagInputValue: string;
    protected isFilterModels: boolean = false;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        TagField.tagFieldTagsCls = this.getThemeClass("tagfield-tags");
        TagField.tagFieldTagCls = this.getThemeClass("tagfield-tag");
        TagField.tagFieldTagInputCls = this.getThemeClass("tagfield-input");
        TagField.tagFieldTagInputInnerCls = this.getThemeClass("tagfield-input-inner");
        TagField.tagFieldTagInputCtCls = this.getThemeClass("tagfield-input-ct");
        TagField.tagFieldTagNameCls = this.getThemeClass("tagfield-tag-name");
        TagField.tagFieldTagIconCls = this.getThemeClass("tagfield-tag-icon");
    }

    protected onItemClick(e, sel: ComboboxModel) {
        this.tagInputValue = undefined;
        this.values.push(sel);
        this.redrawingFieldBody();
        this.triggerOnChangeEvents(this, this.getValue());
    }

    protected drawingFieldBodyInner(): GinkgoNode | GinkgoElement[] {
        let items = [];
        if (this.values) {
            for (let v of this.values) {
                items.push(
                    <li className={TagField.tagFieldTagCls}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            this.closePicker();
                        }}>
                        <div className={TagField.tagFieldTagNameCls}>{v.text}</div>
                        <Icon className={TagField.tagFieldTagIconCls}
                              icon={IconTypes.close}
                              onClick={e => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  this.closePicker();
                                  this.values = this.values.filter(value => value != v);
                                  this.redrawingFieldBody();
                                  this.triggerOnChangeEvents(this, this.getValue());
                              }}/>
                    </li>
                );
            }
        }

        let tagSpanEl;
        if (this.tagInputValue) {
            tagSpanEl = <span className={TagField.tagFieldTagInputCtCls}>{this.tagInputValue}</span>
        } else {
            tagSpanEl = <span className={TagField.tagFieldTagInputCtCls}>&nbsp;</span>
        }
        items.push(<li className={TagField.tagFieldTagInputCls}>
            <input className={TagField.tagFieldTagInputInnerCls}
                   ref={this.tagInputRef}
                   type={"text"}
                   value={this.tagInputValue || ""}
                   onInput={e => {
                       this.tagInputValue = this.tagInputRef.instance.value + "";
                       this.redrawingFieldBody();

                       this.onInputChange(this.tagInputValue);
                   }}
                   onFocus={e => {
                       this.onInputChange(this.tagInputValue);
                   }}
                   onKeyDown={e => {
                       if (e.keyCode == 13) {
                           this.closePicker();
                       }
                   }}/>
            {tagSpanEl}
        </li>);
        return <ul className={TagField.tagFieldTagsCls}
                   onClick={e => {
                       (this.tagInputRef.instance.dom as HTMLInputElement).focus();
                   }}>{items}</ul>;
    }

    protected closePicker() {
        super.closePicker();
        if (this.props.useInputValue && this.tagInputValue && this.tagInputValue.trim() != '') {
            this.values.push({
                text: this.tagInputValue,
                data: this.tagInputValue
            });
            this.tagInputValue = undefined;
            this.redrawingFieldBody();
        }
    }

    protected onInputChange(value?: string) {
        if (this.props.remote) {
            if (this.props.store) {
                let store = this.props.store;
                let p: any = {};
                if (this.props.queryField) {
                    p[this.props.queryField] = value;
                } else {
                    p['keyword'] = value;
                }
                store.load(p);
            } else {
                console.warn("TagField remote load data , but store is empty.")
            }
        } else {
            this.isFilterModels = true;
            try {
                if (this.isPickerShowing()) {
                    this.redrawingPickerBody();
                } else {
                    this.showPicker();
                }

            } catch (e) {
            }
            this.isFilterModels = false;
        }
    }

    protected filterPickerModels(models: Array<ComboboxModel>) {
        if (models && this.isFilterModels && this.tagInputValue && this.tagInputValue.trim() != '') {
            let ms = [];
            for (let m of models) {
                if (m.text && m.text.indexOf(this.tagInputValue) >= 0) {
                    ms.push(m);
                }
            }
            return ms;
        }
        return models;
    }

    setValue(value: any): void {
        this.values = [];
        if (value instanceof Array) {
            for (let v of value) {
                this.setValueSingle(v);
            }
            this.redrawingFieldBody();
        } else if (typeof value == "object") {
            this.setValueSingle(value);
            this.redrawingFieldBody();
        } else if (typeof value == "string") {
            let cv: ComboboxModel = {
                text: value
            }
            this.values.push(cv);
            this.redrawingFieldBody();
        } else {
            this.redrawingFieldBody();
        }
    }

    protected setValueSingle(value: any) {
        if (typeof value == "object") {
            let v = value[this.props.valueField || "id"];
            let isSetValue = false;
            if (this.models) {
                for (let model of this.models) {
                    if (model.value == v) {
                        this.values.push(model);
                        isSetValue = true;
                    }
                }
            }

            if (!isSetValue) {
                let text = value[this.props.displayField || "text"];
                let cv: ComboboxModel = {
                    value: v,
                    text: text,
                    selected: true,
                    data: value
                }
                this.values.push(cv);
            }
        } else {
            let isSetValue = false;
            if (this.models) {
                for (let model of this.models) {
                    if (model.value == value) {
                        this.values.push(model);
                        isSetValue = true;
                    }
                }
            }

            if (!isSetValue) {
                let cv: ComboboxModel = {
                    text: value
                }
                this.values.push(cv);
            }
        }
    }

    getValue(): any {
        let values = [];
        if (this.values) {
            this.values.map(value => {
                if (value.value) values.push(value.value);
            });
        }
        if (values.length == 0) {
            this.values.map(value => {
                if (value.text) values.push(value.text);
            });
        }
        return values.length > 0 ? values : undefined;
    }

    getRowValue(): any {
        if (this.values) {
            return this.values.filter(value => value.data);
        }
        return this.values;
    }
}
