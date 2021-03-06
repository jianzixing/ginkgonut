import Ginkgo, {BindComponent, CSSProperties, GinkgoElement, GinkgoNode, HTMLComponent, RefObject} from "ginkgoes";
import Component from "../component/Component";
import Icon from "../icon/Icon";
import {IconTypes} from "../icon/IconTypes";
import {AbstractFormField, AbstractFormFieldProps} from "./AbstractFormField";
import Tooltip, {TooltipManager} from "../tooltips/Tooltip";
import "./FormField.scss";


export interface FormFieldProps extends AbstractFormFieldProps {
    fieldLabel?: string | GinkgoNode;
    labelWidth?: number | string;
    labelStyle?: CSSProperties;
    // label是否有冒号
    colon?: boolean;
    labelAlign?: "left" | "center" | "right";
    labelVAlign?: "top" | "middle" | "bottom";
    disable?: boolean;
    allowBlank?: boolean;
    blankText?: string;
    regex?: RegExp;
    regexText?: string;
    fixMinWidth?: boolean;
    showRequireText?: boolean;
    requireText?: string;
    enableShowError?: boolean;
}

/**
 * 所有表单组件的基类
 */
export default class FormField<P extends FormFieldProps> extends AbstractFormField<P> {
    protected static formFieldCls;
    protected static formFieldDisabledCls;
    protected static formFieldContentCls;
    protected static formFieldBorderCls;
    protected static formFieldBorderInvisibleCls;
    protected static formFieldFocusBorderCls;
    protected static formFieldLabelCls;
    protected static formFieldBodyCls;
    protected static formFieldBodyWidthCls;
    protected static formFieldBodyInnerCls;
    protected static formFieldPickerCls;
    protected static formFieldPickerShadowCls;
    protected static formFieldStatusCls;
    protected static formFieldErrorCls;
    protected static formFieldErrorShowCls;
    protected static formFieldErrorBodyCls;

    protected static labelAlignCenterCls;
    protected static labelAlignRightCls;
    protected static labelAlignTopCls;
    protected static labelAlignBottomCls;

    defaultProps = {
        colon: true
    };

    protected showError: boolean = false;
    protected enableShowError: boolean = this.props.enableShowError == false ? false : true;
    protected fieldBorder: boolean = false;
    protected fieldFocusBorder: boolean = false;
    protected fieldLabelWidth: number | string = this.props.labelWidth;
    protected isEnableDocumentClick = true;
    protected isEnableWindowResize: boolean = true;
    protected extRootClassNames: Array<string>;
    protected pickerLinkElement: { component: any, props: any };
    protected pickerRefObject: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected pickerShadowRefObject = Ginkgo.createRef();
    protected fieldBodyRefObject: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected fieldBodyBindRefObject: RefObject<BindComponent> = Ginkgo.createRef();
    protected fieldRightBindRefObject: RefObject<BindComponent> = Ginkgo.createRef();
    protected fieldErrorTextRefObject: RefObject<HTMLComponent> = Ginkgo.createRef();
    protected errorTooltipsManager: TooltipManager;
    protected errorText?: string;

    protected pickerWidth: number = 0;
    protected isAutoPickerWidth: boolean = true;
    protected pickerAlign: "right" | "left" = "right";

    constructor(props) {
        super(props);
    }

    protected onDocumentMouseDown(e: MouseEvent) {
        if (this.fieldBodyRefObject && this.fieldBodyRefObject.instance) {
            let dom1 = (this.fieldBodyRefObject.instance as HTMLComponent).dom;
            let dom2 = this.pickerRefObject && this.pickerRefObject.instance ?
                (this.pickerRefObject.instance as HTMLComponent).dom : undefined;
            if (dom1 && this.contains(dom1, e.target as Node)
                || dom2 && this.contains(dom2, e.target as Node)) {

            } else {
                this.closePicker();
            }
        }
    }

    protected buildClassNames(themePrefix: string): void {
        super.buildClassNames(themePrefix);

        FormField.formFieldCls = this.getThemeClass("formfield");
        FormField.formFieldDisabledCls = this.getThemeClass("formfield-disabled");
        FormField.formFieldContentCls = this.getThemeClass("field-content");
        FormField.formFieldBorderCls = this.getThemeClass("field-border");
        FormField.formFieldBorderInvisibleCls = this.getThemeClass("field-border-invisible");
        FormField.formFieldFocusBorderCls = this.getThemeClass("field-focus-border");
        FormField.formFieldLabelCls = this.getThemeClass("field-label");
        FormField.formFieldBodyCls = this.getThemeClass("field-body");
        FormField.formFieldBodyWidthCls = this.getThemeClass("field-body-width");
        FormField.formFieldBodyInnerCls = this.getThemeClass("field-body-inner");
        FormField.formFieldPickerCls = this.getThemeClass("field-picker");
        FormField.formFieldPickerShadowCls = this.getThemeClass("field-picker-shadow");
        FormField.formFieldStatusCls = this.getThemeClass("field-status");
        FormField.formFieldErrorCls = this.getThemeClass("field-error");
        FormField.formFieldErrorShowCls = this.getThemeClass("field-error-show");
        FormField.formFieldErrorBodyCls = this.getThemeClass("field-error-body");

        FormField.labelAlignCenterCls = this.getThemeClass("label-align-center");
        FormField.labelAlignRightCls = this.getThemeClass("label-align-right");
        FormField.labelAlignTopCls = this.getThemeClass("label-align-top");
        FormField.labelAlignBottomCls = this.getThemeClass("label-align-bottom");
    }

    protected drawing(): GinkgoElement<any> | string | undefined | null | GinkgoElement[] {
        let labelCss = [FormField.formFieldLabelCls],
            bodyInnerCss = [
                FormField.formFieldBodyInnerCls,
                Component.componentClsEnabledSelect,
                FormField.formFieldBorderCls];

        let labelAlign = this.props.labelAlign;
        let labelVAlign = this.props.labelVAlign;
        let label = this.props.fieldLabel;
        if (label && this.props.colon && typeof label == "string") {
            label += ":";
        }

        if (this.fieldBorder == false) {
            bodyInnerCss.push(FormField.formFieldBorderInvisibleCls);
        }
        if (this.fieldFocusBorder) {
            bodyInnerCss.push(FormField.formFieldFocusBorderCls);
        }
        let bcn = this.getFieldBodyClassName();
        if (bcn) {
            bcn.map(value => bodyInnerCss.push(value));
        }

        if (label && typeof label != "string" && labelVAlign == null) {
            labelVAlign = "top";
        }
        if (labelAlign && labelAlign == "center") {
            labelCss.push(FormField.labelAlignCenterCls);
        }
        if (labelAlign && labelAlign == "right") {
            labelCss.push(FormField.labelAlignRightCls);
        }
        if (labelVAlign && labelVAlign == "top") {
            labelCss.push(FormField.labelAlignTopCls);
        }
        if (labelVAlign && labelVAlign == "bottom") {
            labelCss.push(FormField.labelAlignBottomCls);
        }

        let labelEls = null;
        if (label && label != '') {
            let style: CSSProperties = {...this.props.labelStyle || {}};
            if (typeof label != "string" && !this.props.labelStyle) {
                style.paddingTop = 0;
                style.paddingBottom = 0;
            }
            if (this.fieldLabelWidth) style.width = this.fieldLabelWidth;
            let mustEl;
            if (this.props.allowBlank == false && this.props.showRequireText != false) {
                mustEl = <span style={{color: 'red'}}>
                    {this.props.requireText ? this.props.requireText : "*"}
                </span>;
            }
            labelEls = (
                <label className={labelCss} style={style}>
                    {typeof label == "string" ? <span>{label}</span> : label}
                    {mustEl}
                </label>
            )
        }

        let formFieldBodyClsList = [FormField.formFieldBodyCls];
        if (this.props.fixMinWidth || this.props.fixMinWidth == null) {
            formFieldBodyClsList.push(FormField.formFieldBodyWidthCls);
        }

        return (
            <div className={FormField.formFieldContentCls}>
                {labelEls}
                <div className={formFieldBodyClsList}>
                    <div ref={this.fieldBodyRefObject}
                         className={bodyInnerCss}
                         onMouseEnter={e => {
                             if (this.showError && this.enableShowError) {
                                 let x = e.clientX, y = e.clientY;
                                 this.showErrorTooltips(x, y);
                             }
                         }}
                         onMouseLeave={e => {
                             if (this.errorTooltipsManager) {
                                 this.errorTooltipsManager.close();
                                 this.errorTooltipsManager = null;
                             }
                         }}
                         style={this.props.enableShowError == false ? {borderColor: "transparent"} : null}
                    >
                        <bind ref={this.fieldBodyBindRefObject} render={this.drawingFieldBody.bind(this)}/>
                    </div>
                </div>
                <bind ref={this.fieldRightBindRefObject} render={this.drawingFieldRight.bind(this)}/>
            </div>);
    }

    protected showErrorTooltips(x, y) {
        if (this.errorTooltipsManager) {
            this.errorTooltipsManager.close();
            this.errorTooltipsManager = null;
        }
        if (this.fieldBodyRefObject.instance) {
            this.errorTooltipsManager = Tooltip.show(
                <Tooltip position={"mouse"} x={x} y={y} alignAdjust={10}>
                    <div className={FormField.formFieldErrorCls}>
                        <div className={FormField.formFieldErrorBodyCls}>
                            <Icon icon={IconTypes.exclamationCircle}/>
                            <span ref={this.fieldErrorTextRefObject}>{this.errorText || "This field is required"}</span>
                        </div>
                    </div>
                </Tooltip>,
                this.fieldBodyRefObject.instance);
        }
    }

    protected getFieldBodyClassName(): string[] | undefined {
        return undefined;
    }

    protected drawingFieldBody(): GinkgoNode {
        return null;
    }

    protected drawingFieldPicker(): GinkgoNode {
        return null;
    }

    protected drawingFieldRight(): GinkgoNode {
        return null;
    }

    protected redrawingFieldBody() {
        if (this.fieldBodyBindRefObject && this.fieldBodyBindRefObject.instance) {
            this.fieldBodyBindRefObject.instance.forceRender();
        }
    }

    protected redrawingFieldRight() {
        if (this.fieldBodyBindRefObject && this.fieldBodyBindRefObject.instance) {
            this.fieldBodyBindRefObject.instance.forceRender();
        }
    }

    protected onParentScrolling(e) {
        this.closePicker();
    }

    protected showPicker(cnf?: { pickerCls?: Array<string> }) {
        cnf = cnf || {};
        if (this.fieldBodyRefObject && this.fieldBodyRefObject.instance) {
            if (this.pickerLinkElement) {
                Ginkgo.unmountByElement(this.pickerLinkElement.props, document.body);
                this.pickerLinkElement = null;
            }

            if (!cnf.pickerCls) cnf.pickerCls = [];
            cnf.pickerCls.push(FormField.formFieldPickerCls);

            let picker = this.drawingFieldPicker();
            if (picker) {
                this.pickerLinkElement = Ginkgo.render(
                    <Ginkgo.Fragment>
                        <div className={FormField.formFieldPickerShadowCls}
                             ref={this.pickerShadowRefObject}>
                        </div>
                        <div className={cnf.pickerCls}
                             ref={this.pickerRefObject}>
                            {picker}
                        </div>
                    </Ginkgo.Fragment>, document.body);

                this.resizeFieldPicker(1);
            }
        }
    }

    protected closePicker() {
        if (this.pickerLinkElement && this.pickerLinkElement.props) {
            Ginkgo.unmountByElement(this.pickerLinkElement.props, document.body);
            this.pickerLinkElement = null;
        }
        this.clearBoundsParentScrollEvents();
    }

    protected isPickerShowing() {
        if (this.pickerLinkElement && this.pickerLinkElement.props) return true;
        return false;
    }

    protected onWindowResize(e: Event) {
        super.onWindowResize(e);
        this.resizeFieldPicker(2);
    }

    protected resizeFieldPicker(from: number) {
        if (this.pickerRefObject && this.pickerRefObject.instance) {
            let instance = this.pickerRefObject.instance as HTMLComponent;
            let dom = instance.dom as HTMLElement;
            if (this.isAutoPickerWidth == false) {
                (dom as HTMLDivElement).style.width = null;
            }
            let bounds = this.getBounds(this.fieldBodyRefObject.instance as HTMLComponent,
                from == 1 ? true : false);
            let x = bounds.x - 1,
                y = bounds.y + bounds.h - 1,
                sw = 0,
                sh = 0,
                pickerHeight = dom.offsetHeight;

            let direction = (bounds.ch - y) > pickerHeight ? 'd' : 't';
            if (direction == 't') {
                y = bounds.y - pickerHeight - 1;
                if (y < 0) y = 0;
            }

            if (this.pickerWidth > 0) {
                if (this.pickerAlign == "right") {
                    x = bounds.x + (bounds.w - this.pickerWidth);
                } else {
                    x = bounds.x;
                }
            }

            let shadow = this.pickerShadowRefObject.instance as HTMLComponent;
            if (dom) {
                (dom as HTMLDivElement).style.left = x + "px";
                (dom as HTMLDivElement).style.top = y + "px";
                if (this.isAutoPickerWidth != false) {
                    if (this.pickerWidth > 0) {
                        (dom as HTMLDivElement).style.width = this.pickerWidth + "px";
                    } else {
                        (dom as HTMLDivElement).style.width = bounds.w + "px";
                    }
                }
            }
            if (shadow) {
                sw = (dom as HTMLDivElement).offsetWidth;
                sh = (dom as HTMLDivElement).offsetHeight;
                if (direction == 'd') {
                    sh -= 4;
                    y += 4;
                } else {
                    sh -= 4;
                    y += 3;
                }
                (shadow.dom as HTMLDivElement).style.left = x + "px";
                (shadow.dom as HTMLDivElement).style.top = y + "px";
                if (this.pickerWidth > 0) {
                    (shadow.dom as HTMLDivElement).style.width = this.pickerWidth + "px";
                } else {
                    (shadow.dom as HTMLDivElement).style.width = sw + "px";
                }
                (shadow.dom as HTMLDivElement).style.height = sh + "px";
            }
        }
    }

    protected showErrorMessage() {
        if (this.enableShowError) {
            this.showError = true;
            this.rootEl.reloadClassName();
        }
    }

    protected hideErrorMessage() {
        if (this.enableShowError) {
            this.showError = false;
            this.rootEl.reloadClassName();
        }
    }

    protected getRootClassName(): string[] {
        let arr = super.getRootClassName();
        arr.push(FormField.formFieldCls);
        if (this.showError && this.enableShowError) {
            arr.push(FormField.formFieldErrorShowCls);
        }
        if (this.props.disable) {
            arr.push(FormField.formFieldDisabledCls);
        }
        if (this.extRootClassNames) {
            this.extRootClassNames.map(value => arr.push(value));
        }
        return arr;
    }

    addRootClassName(cls: string) {
        if (this.rootEl) {
            if (!this.extRootClassNames) this.extRootClassNames = [];
            if (this.extRootClassNames.indexOf(cls) < 0) {
                this.extRootClassNames.push(cls);
            }
            this.rootEl.reloadClassName();
        }
    }

    removeRootClassName(cls: string) {
        if (this.extRootClassNames && this.rootEl) {
            this.extRootClassNames = this.extRootClassNames.filter(value => value != cls);
            this.rootEl.reloadClassName();
        }
    }

    public validate(): boolean {
        if (this.enableShowError) {
            let value = this.getValue();
            if (this.props.allowBlank == false) {
                if (value == null || value === "") {
                    this.showError = true;
                    this.errorText = this.props.blankText || "This field is required";
                    if (this.fieldErrorTextRefObject && this.fieldErrorTextRefObject.instance) {
                        this.fieldErrorTextRefObject.instance.overlap(this.errorText);
                    }
                    this.rootEl.reloadClassName();
                    return false;
                } else {
                    if (this.showError == true) {
                        this.showError = false;
                        this.rootEl.reloadClassName();
                    }
                }
            }

            if (this.props.regex) {
                let regex = this.props.regex;
                if (regex.test(value)) {
                    if (this.showError == true) {
                        this.showError = false;
                        this.rootEl.reloadClassName();
                    }
                } else {
                    this.showError = true;
                    this.errorText = this.props.regexText || "This field is not match";
                    if (this.fieldErrorTextRefObject && this.fieldErrorTextRefObject.instance) {
                        this.fieldErrorTextRefObject.instance.overlap(this.errorText);
                    }
                    this.rootEl.reloadClassName();
                    return false;
                }
            }
        }

        return true;
    }

    protected triggerOnChangeEvents(field: AbstractFormField<AbstractFormFieldProps>,
                                    value: any, oldValue?: any): void {
        super.triggerOnChangeEvents(field, value, oldValue);
        this.validate();
    }
}
