import Ginkgo, {GinkgoNode, RefObject} from "ginkgoes";
import TextField, {TextFieldProps} from "./TextField";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import DatePicker from "../datepicker/DatePicker";
import "./DateTimeField.scss";
import DateTools from "../tools/DateTools";

export interface DateFieldProps extends TextFieldProps {
    format?: string;
    formatTime?: boolean;
    showTime?: boolean;
}

export default class DateTimeField<P extends DateFieldProps> extends TextField<P> {
    protected static dateFieldSpinnerCls;
    protected static dateFieldSpinnerItemCls;

    protected pickerWidth = 310;
    protected datePicker: RefObject<DatePicker<any>> = Ginkgo.createRef();

    protected value: Date;

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        DateTimeField.dateFieldSpinnerCls = this.getThemeClass("datefield-spinner");
        DateTimeField.dateFieldSpinnerItemCls = this.getThemeClass("datefield-spinner-item");
    }

    protected drawingFieldSpinner() {
        return (
            <div className={DateTimeField.dateFieldSpinnerCls}>
                <div className={DateTimeField.dateFieldSpinnerItemCls}
                     onClick={this.onSpinnerDownClick.bind(this)}>
                    <Icon icon={IconTypes.calendar}/>
                </div>
            </div>
        );
    }

    protected drawingFieldPicker(): GinkgoNode {
        return (
            <DatePicker
                border={false}
                ref={this.datePicker}
                date={this.value}
                showTime={this.props.showTime}
                onSelectedDate={date => {
                    this.value = date;
                    if (this.props.format) {
                        this.triggerOnChangeEvents(this, DateTools.format(this.value, this.props.format));
                    } else {
                        this.triggerOnChangeEvents(this, this.value);
                    }
                    this.closePicker();
                    this.fillInputValue();
                }}
            />);
    }

    protected resizeFieldPicker(from: number) {
        super.resizeFieldPicker(from);
    }

    protected onSpinnerDownClick(e) {
        if (this.isPickerShowing()) {
            this.closePicker();
        } else {
            this.showPicker();
        }
    }

    protected fillInputValue() {
        if (this.value) {
            let defFormat = "yyyy-MM-dd HH:mm:ss";
            if (this.props.formatTime != true && this.props.showTime != true) {
                defFormat = "yyyy-MM-dd";
            }
            this.inputEl.value = DateTools.format(this.value, this.props.format ? this.props.format : defFormat);
        } else {
            this.inputEl.value = "";
        }
    }

    setValue(value: Date | string): void {
        super.setValue(value);

        if (value instanceof Date) {
            this.value = value;
        } else if (typeof value === "string") {
            let date = DateTools.toDate(value);
            this.value = date;
        } else {
            this.value = null;
        }

        this.fillInputValue();
    }

    getValue(): any {
        if (this.value) {
            if (this.props.format) {
                return DateTools.format(this.value, this.props.format);
            }
            return this.value;
        }
    }

    getRowValue(): any {
        return this.value;
    }
}
