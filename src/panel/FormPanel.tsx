import Ginkgo, {GinkgoElement, GinkgoNode, RefObject} from "ginkgoes";
import Panel, {PanelProps} from "./Panel";
import FormLayout, {FormLayoutProps} from "../layout/FormLayout";
import {AbstractFormField, AbstractFormFieldProps} from "../form/AbstractFormField";
import Button, {ButtonProps} from "../button/Button";

export interface FormPanelProps extends PanelProps {
    layout?: FormLayoutProps | boolean;
    values?: { [key: string]: any };
    formValues?: { [key: string]: any };
    onSubmit?: (values: { [key: string]: any }, formData?: FormData) => void;
    onChange?: (form: FormPanel<any>, values: { [key: string]: any }, formData?: FormData) => void;
}

export default class FormPanel<P extends FormPanelProps> extends Panel<P> {
    protected formLayoutRef: RefObject<FormLayout> = Ginkgo.createRef();
    protected formValues = this.props.formValues || {};
    protected values = this.props.values;

    constructor(props: P) {
        super(props);
        this.onFormFieldsChange = this.onFormFieldsChange.bind(this);
        this.onFormSubmitClick = this.onFormSubmitClick.bind(this);
    }

    protected drawingPanelChild(): GinkgoNode | GinkgoElement[] {
        if (this.props.layout == false) {
            return this.props.children;
        } else {
            return (
                <FormLayout {...this.props.layout || {}}
                            ref={this.formLayoutRef}>
                    {this.props.children}
                </FormLayout>
            );
        }
    }

    componentRenderUpdate() {
        super.componentRenderUpdate();
        Ginkgo.forEachChildren(component => {
            if (component instanceof AbstractFormField) {
                component.addOnChange(this.onFormFieldsChange);
            }
        }, this);

        Ginkgo.forEachChildren(component => {
            if (component instanceof Button) {
                let props = component.props as ButtonProps;
                if (props.type == "submit") {
                    component.setTypeEvent(this.onFormSubmitClick);
                }
                if (props.type == "resetForm") {
                    component.setTypeEvent((e) => {
                        this.resetFormValue();
                    });
                }
            }
        }, this.wrapperEl);
    }

    protected compareUpdate(key: string, newValue: any, oldValue: any): boolean {
        if (key == "values" && newValue != oldValue) {
            this.values = newValue;
            if (this.values) {
                this.setValues(this.values);
            }
            return true;
        }
        return false;
    }

    protected lockScroll(): boolean {
        return true;
    }

    protected onFormFieldsChange(field: AbstractFormField<AbstractFormFieldProps>, value: any, oldValue: any) {
        if (this.formValues && field.props && field.props.name) {
            (this.formValues as any)[field.props.name] = value;
            if (this.props.onChange) {
                this.props.onChange(this, this.formValues, this.getFormData());
            }
        }
    }

    protected onFormSubmitClick(e) {
        if (this.validate() && this.props.onSubmit) {
            this.props.onSubmit(this.getValues(), this.getFormData());
        }
    }

    getValues(): any {
        return this.formValues;
    }

    getFormData(): FormData {
        let formData = new FormData();
        if (this.formValues) {
            for (let key in this.formValues) {
                formData.append(key, this.formValues[key]);
            }
        }
        return formData;
    }

    validate(): boolean {
        let isValid = true;
        Ginkgo.forEachChildren(component => {
            if (component instanceof AbstractFormField) {
                let validate = component.validate();
                if (!validate) {
                    isValid = false;
                    return false;
                }
            }
        }, this);

        return isValid;
    }

    resetFormValue() {
        Ginkgo.forEachChildren(component => {
            if (component instanceof AbstractFormField) {
                component.setValue(null);
            }
        }, this);
    }

    setValues(values: any): void {
        setTimeout(() => {
            Ginkgo.forEachChildren(component => {
                if (component instanceof AbstractFormField) {
                    let name = component.getFieldName();
                    if (name && (component.props as AbstractFormFieldProps).formValueSkip != true) {
                        let value = values[name];
                        if (component.props["initField"]) {
                            value = values[component.props["initField"]];
                        }
                        component.setValue(value);

                        let cv = component.getValue();
                        let cn = component.getFieldName();
                        if (cn) {
                            (this.formValues as any)[cn] = cv;
                        }
                    }
                }
            }, this);
        });
    }
}


