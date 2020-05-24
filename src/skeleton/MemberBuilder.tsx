import Ginkgo, {GinkgoNode} from "ginkgoes";

import "./MemberBuilder.scss";
import {AppManager, AppManagerProps} from "./AppPanel";
import FormPanel from "../panel/FormPanel";
import Button from "../button/Button";
import Toolbar from "../toolbar/Toolbar";
import DisplayImage from "../image/DisplayImage";
import Upload from "../upload/Upload";
import FormLayout, {FormLayoutTitle} from "../layout/FormLayout";
import HiddenField from "../form/HiddenField";
import TextField from "../form/TextField";
import {IconTypes} from "../icon/IconTypes";
import RadioGroupField from "../form/RadioGroupField";
import DateTimeField from "../form/DateTimeField";
import {getImageDownload} from "./App";

export interface MemberBuilderProps extends AppManagerProps {
    values?: any;
}

export default class MemberBuilder<P extends MemberBuilderProps> extends AppManager<P> {
    protected headerLogo;

    render(): GinkgoNode {
        let values = this.props.values;
        if (values) {
            this.headerLogo = getImageDownload(this.props.values['avatar']);
        }
        if (values['nick']) {
            values['nick'] = decodeURIComponent(values['nick']);
        }
        return (
            <FormPanel
                layout={false}
                toolbars={[
                    <Toolbar>
                        <Button iconType={"reply"}
                                iconColor={"#b8288a"}
                                text={"返回列表"}
                                onClick={e => {
                                    this.back();
                                }}/>
                        <Button iconType={"save"}
                                iconColor={"#4c82b1"}
                                text={"保存会员"}
                                type={"submit"}/>
                    </Toolbar>
                ]}
                onSubmit={(values, formData) => {
                    console.log(values);
                }}
                values={values}>

                <div className={"mg-member-builder"}>
                    <div className={"mg-member-builder-left"}>
                        <div className={"mg-member-builder-split"}></div>
                        <div className={"mg-member-builder-header"}>
                            <DisplayImage width={150} height={150}
                                          src={this.headerLogo}
                                          style={{margin: "12px"}}/>
                            <Upload type={"button"} buttonText={"选择头像"} style={{margin: "0px 0px 10px"}}
                                    onChange={(items, news) => {
                                        if (items && items.length > 0) {
                                            let reads = new FileReader();
                                            reads.readAsDataURL(items[0].file);
                                            reads.onload = (e) => {
                                                let src = reads.result;
                                                this.headerLogo = src;
                                                this.forceRender();
                                            };
                                        }
                                    }}/>
                        </div>
                        <div className={"mg-member-builder-text"}>
                            <span>注：添加会员信息，其中*为必填信息</span>
                        </div>
                    </div>
                    <div className={"mg-member-builder-right"}>
                        <FormLayout bodyWidth={600}>
                            <FormLayoutTitle text={"基本信息"} iconType={IconTypes.boxOpen}/>
                            <HiddenField name={"id"}/>
                            <TextField name={"userName"} fieldLabel={"用户名*"} placeholder={"请填写用户名"}
                                       allowBlank={false}/>
                            <TextField name={"password"} type={"password"} fieldLabel={"密码*"} placeholder={"请填写密码"}
                                       allowBlank={false}/>
                            <TextField name={"password2"} type={"password"} fieldLabel={"重复密码*"} placeholder={"请填写密码"}
                                       allowBlank={false}/>
                            <TextField name={"nick"} fieldLabel={"昵称"}/>
                            <RadioGroupField name={"gender"} fieldLabel={"性别"}
                                             models={[
                                                 {value: 0, text: '保密', selected: true},
                                                 {value: 1, text: '男'},
                                                 {value: 2, text: '女'}]}/>
                            <DateTimeField name={"birthday"} fieldLabel={"出生日期"}/>
                            <RadioGroupField name={"enable"} fieldLabel={"是否激活"}
                                             models={[
                                                 {value: 1, text: '激活', selected: true},
                                                 {value: 0, text: '冻结'}]}/>

                            <FormLayoutTitle text={"通信信息"} iconType={IconTypes.boxOpen}/>
                            <TextField name={"email"} fieldLabel={"E-Mail"}/>
                            <TextField name={"phone"} fieldLabel={"移动电话"}/>

                            <FormLayoutTitle text={"其它信息"} iconType={IconTypes.boxOpen}/>
                            <RadioGroupField name={"isMarried"} fieldLabel={"是否结婚"}
                                             models={[
                                                 {value: 1, text: '已结婚'},
                                                 {value: 0, text: '未结婚'}]}/>
                        </FormLayout>
                    </div>
                </div>
            </FormPanel>
        )
    }
}
