import Ginkgo, {
    BindComponent,
    CSSProperties,
    GinkgoNode,
    RefObject
} from "ginkgoes";
import TextField, {TextFieldProps} from "./TextField";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import {StoreProcessor} from "../store/DataStore";
import Loading from "../loading/Loading";
import DataEmpty from "../empty/DataEmpty";
import "./ComboboxField.scss";

export interface ComboboxModel {
    value?: number | string;
    text: string;
    selected?: boolean;
    data?: any;
}

export interface ComboboxFieldProps extends TextFieldProps {
    placeholder?: string;
    models?: Array<ComboboxModel>;
    data?: Array<any>;
    valueField?: string;
    displayField?: string;
    renderDisplayField?: (item: ComboboxModel, value: string) => GinkgoNode;
    selectData?: any;
    queryField?: string;
    remote?: boolean;

    picker?: (data: any, fns: any) => GinkgoNode;
}

export default class ComboboxField<P extends ComboboxFieldProps> extends TextField<P>
    implements StoreProcessor {
    protected static comboboxFieldSpinnerCls;
    protected static comboboxFieldSpinnerItemCls;
    protected static comboboxFieldPicker;
    protected static comboboxFieldPickerCnt;
    protected static comboboxFieldPickerList;
    protected static comboboxFieldPickerItem;
    protected static comboboxFieldPickerSelected;
    protected static comboboxFieldEmpty;

    protected comboboxValue: ComboboxModel;
    protected cacheSetValue: any;
    protected data = this.props.data;
    protected models?: Array<ComboboxModel> = this.props.models;
    protected pickerBindRef: RefObject<BindComponent> = Ginkgo.createRef();
    protected isLoading?: boolean = false;
    protected loadCount: number = 0;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        ComboboxField.comboboxFieldSpinnerCls = this.getThemeClass("comboboxfield-spinner");
        ComboboxField.comboboxFieldSpinnerItemCls = this.getThemeClass("comboboxfield-spinner-item");
        ComboboxField.comboboxFieldPicker = this.getThemeClass("comboboxfield-picker");
        ComboboxField.comboboxFieldPickerCnt = this.getThemeClass("comboboxfield-picker-cnt");
        ComboboxField.comboboxFieldPickerList = this.getThemeClass("comboboxfield-picker-list");
        ComboboxField.comboboxFieldPickerItem = this.getThemeClass("comboboxfield-picker-item");
        ComboboxField.comboboxFieldPickerSelected = this.getThemeClass("picker-item-selected");
        ComboboxField.comboboxFieldEmpty = this.getThemeClass("comboboxfield-empty");
    }

    protected drawingFieldSpinner() {
        return (
            <div className={ComboboxField.comboboxFieldSpinnerCls}>
                <div className={ComboboxField.comboboxFieldSpinnerItemCls}
                     onClick={this.onSpinnerDownClick.bind(this)}>
                    <Icon icon={IconTypes.caretDown}/>
                </div>
            </div>
        );
    }

    protected onInputCtClick(e) {
        if (this.props.editable == false) {
            this.onSpinnerDownClick(e);
        }
    }

    protected onInputFocus(e) {
        super.onInputFocus(e);
        this.onInputEvent(e);
    }

    protected onInputEvent(e) {
        if (this.props.remote) {
            let value = this.inputEl.value;
            if (this.props.store) {
                let store = this.props.store;
                let p: any = {};
                if (this.props.queryField) {
                    p[this.props.queryField] = value;
                } else {
                    p['keyword'] = value;
                }
                try {
                    if (this.isPickerShowing()) {
                    } else {
                        this.showPicker();
                    }
                } catch (e) {
                }
                store.load(p);
            } else {
                console.warn("ComboboxField remote load data , but store is empty.")
            }
        }
    }

    protected onSpinnerDownClick(e) {
        if (this.isPickerShowing()) {
            this.closePicker();
        } else {
            this.showPicker({pickerCls: [ComboboxField.comboboxFieldPickerCnt]});
            if (this.props.store) {
                this.props.store.load();
            }
        }
    }

    protected drawingFieldPicker(): GinkgoNode {
        return <bind ref={this.pickerBindRef} render={this.buildFieldPicker.bind(this)}/>;
    }

    protected buildFieldPicker(): GinkgoNode {
        if (this.props.picker) {
            let list = null, style: CSSProperties = {};
            if (this.isLoading) {
                list = (
                    <Loading/>
                );
                style.height = 80;
            } else {
                let self = this;
                list = this.props.picker(this.data, {
                    onSelectData(sel: ComboboxModel) {
                        self.onItemClick(null, sel);
                    },
                    closePicker() {
                        self.closePicker();
                    }
                });
                if (list == null) {
                    list = (
                        <DataEmpty/>
                    )
                }
            }
            return (
                <div
                    className={ComboboxField.comboboxFieldPicker}
                    style={style}>
                    {list}
                </div>)
        } else {
            if (this.props.data && !this.props.models) {
                this.models = this.data2Models(this.props.data);
            }

            let models = this.filterPickerModels(this.models);
            let list = null, style: CSSProperties = {};

            if (this.isLoading) {
                list = (
                    <Loading/>
                );
                style.height = 80;
            } else {
                let items = [];
                if (models) {
                    for (let dt of models) {
                        let cls = [ComboboxField.comboboxFieldPickerItem];
                        if (dt.selected) {
                            cls.push(ComboboxField.comboboxFieldPickerSelected);
                            if (this.inputEl) this.inputEl.value = dt.text;
                        }

                        let text: any = dt.text;
                        if (this.props.renderDisplayField) {
                            text = this.props.renderDisplayField(dt, text);
                        }
                        items.push(<li className={cls} onClick={(e) => {
                            this.onItemClick(e, dt);
                        }}>{text}</li>);
                    }
                }

                if (items && items.length > 0) {
                    list = (
                        <ul className={ComboboxField.comboboxFieldPickerList}>
                            {items}
                        </ul>
                    );
                } else {
                    list = (
                        <DataEmpty/>
                    )
                }
            }

            return (
                <div
                    className={ComboboxField.comboboxFieldPicker}
                    style={style}>
                    {list}
                </div>)
        }
    }

    protected filterPickerModels(models: Array<ComboboxModel>) {
        return models;
    }

    protected onItemClick(e, sel: ComboboxModel) {
        this.comboboxValue = sel;
        if (this.inputEl) {
            this.inputEl.value = this.comboboxValue.text;
            super.value = this.comboboxValue.text;
            this.triggerOnChangeEvents(this, this.getValue());
        }
        this.closePicker();
    }

    protected data2Models(data) {
        let models: Array<ComboboxModel> = [];
        for (let dt of data) {
            let item = {
                value: dt[this.props.valueField || 'id'],
                text: typeof dt == "object" ? dt[this.props.displayField || 'text'] : dt,
                selected: this.props.selectData ? this.props.selectData == dt : false,
                data: dt
            };
            if (item.value == null) {
                item.value = item.text;
            }
            models.push(item);
        }
        return models;
    }

    protected redrawingPickerBody() {
        this.pickerBindRef.instance.forceRender();
        this.resizeFieldPicker(2);
    }

    storeBeforeLoad(): void {
        if (this.pickerBindRef && this.pickerBindRef.instance) {
            this.isLoading = true;
            this.redrawingPickerBody();
        }
    }

    storeLoaded(data: Object | Array<Object>, total?: number, originData?: any): void {
        this.isLoading = false;
        this.loadCount++;
        if (data && data instanceof Array) {
            this.data = data;
            this.models = this.data2Models(data);
            if (this.pickerBindRef && this.pickerBindRef.instance) {
                this.redrawingPickerBody();
            }
        } else {
            this.models = [];
            this.data = [];
            if (this.pickerBindRef && this.pickerBindRef.instance) {
                this.redrawingPickerBody();
            }
        }

        if (this.cacheSetValue) {
            let value = this.cacheSetValue;
            this.cacheSetValue = undefined;
            this.setValue(value);
        }
    }

    setValue(value: any): void {
        if (!this.models || this.models.length == 0) {
            if (this.props.data && !this.props.models) {
                this.models = this.data2Models(this.props.data);
            }
            if (this.props.store && !this.props.models && this.loadCount == 0) {
                this.cacheSetValue = value;
                this.props.store.load();
                return;
            }
        }

        let oldValue = this.getValue();
        if (typeof value == "object") {
            let v = value[this.props.valueField || "id"];
            let isSetValue = false;
            if (this.models) {
                for (let model of this.models) {
                    if (model.value == v) {
                        this.comboboxValue = model;
                        super.value = model.text;
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
                this.comboboxValue = cv;
                super.value = cv.text;
            }
            this.redrawingFieldBody();
        } else {
            let isSetValue = false;
            if (this.models) {
                for (let model of this.models) {
                    if (model.value == value) {
                        this.comboboxValue = model;
                        super.value = model.text;
                        isSetValue = true;
                    }
                }
            }

            if (!isSetValue) {
                if (value) {
                    this.comboboxValue = {
                        text: value
                    }
                    super.value = this.comboboxValue.text;
                }
            } else {
                this.redrawingFieldBody();
            }
        }
        if (this.comboboxValue) {
            this.inputEl.value = this.comboboxValue.text || "";
        }
        let newValue = this.getValue();
        if (oldValue != newValue) {
            this.triggerOnChangeEvents(this, newValue, oldValue);
        }
    }

    getValue(): any {
        if (this.comboboxValue != null && this.comboboxValue.value != null) {
            return this.comboboxValue.value;
        }
        if (this.comboboxValue != null && this.comboboxValue.text != null) {
            return this.comboboxValue.text;
        }
        if (this.comboboxValue != null && this.comboboxValue.data != null) {
            return this.comboboxValue.data;
        }
        return super.getValue();
    }

    getRowValue(): any {
        if (this.comboboxValue && this.comboboxValue.data) {
            return this.comboboxValue.data;
        }
        return this.comboboxValue || super.value;
    }
}
