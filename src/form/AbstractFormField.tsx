import Component, {ComponentProps} from "../component/Component";

export interface AbstractFormFieldProps extends ComponentProps {
    name?: string;
    onChange?: (field: AbstractFormField<AbstractFormFieldProps>, value: any, oldValue?: any) => void;
    disabledFormChange?: boolean;
    /**
     * value属性的替换字段，如果一个数据中包含多个当前组件所需要的值
     * 则可以使用这个字段作为替换，仅在FormPanel中有效
     */
    initField?: string;
}

export class AbstractFormField<P extends AbstractFormFieldProps> extends Component<P> {
    protected onChangeEvents: Array<(field: AbstractFormField<AbstractFormFieldProps>, value: any, oldValue?: any) => void> = [];

    protected compareAfterUpdate(props: P, oldProps: P): boolean {
        if (props['value'] != oldProps['value']) {
            this.setValue(props['value']);
        }
        return false;
    }

    public setValue(value: any): void {
        // 设置表单值
    }

    public getValue(): any {
        // 获取表单值
    }

    public getRowValue(): any {
        // 获取数据字段所选的当前数据
        // 比如combobox有三个数据 {A} {B} {C} 选择B后这个值返回的是B的数据对象
    }

    public getFieldName(): string | null {
        // 获取当前表单组件的名称用于获取值使用
        return this.props.name;
    }

    public validate(): boolean {
        return true;
    }

    public addOnChange(event: (field: AbstractFormField<AbstractFormFieldProps>,
                               value: any, oldValue?: any) => void): void {
        if (!this.props.disabledFormChange) {
            if (this.onChangeEvents.indexOf(event) == -1) {
                this.onChangeEvents.push(event);
            }
        }
    }

    protected triggerOnChangeEvents(field: AbstractFormField<AbstractFormFieldProps>,
                                    value: any, oldValue?: any): void {
        if (this.onChangeEvents) {
            for (let e of this.onChangeEvents) {
                e(field, value, oldValue);
            }
        }
        if (this.props.onChange) {
            this.props.onChange(field, value, oldValue);
        }
    }

    public focus(): void {

    }
}
