import Ginkgo, {GinkgoNode, RefObject} from "ginkgoes";
import {AppManagerProps, AppManager} from "./AppPanel";
import Toolbar from "../toolbar/Toolbar";
import Button from "../button/Button";
import GridPanel from "../grid/GridPanel";
import TestBuilder from "./TestBuilder";
import CascaderField from "../form/CascaderField";
import DataStore from "../store/DataStore";
import APIAdmin from "./APIAdmin";
import WindowPanel from "../window/Window";
import FormPanel from "../panel/FormPanel";
import FormFieldSet from "../form/FormFieldSet";

export interface TestManagerProps extends AppManagerProps {
}

export default class TestManager extends AppManager<TestManagerProps> {
    protected panelRef: RefObject<GridPanel<any>> = Ginkgo.createRef();

    render(): GinkgoNode {
        return (
            <GridPanel ref={this.panelRef}
                       key={"ddd"}
                       paging={true}
                       fit={true}
                       columns={[
                           {type: "checkbox"},
                           {title: "Text Grid Column", width: 200, dataIndex: 'text'},
                           {title: "Text Grid Column", width: 200, dataIndex: 'text'},
                           {title: "Text Grid Column", width: 200, dataIndex: 'text'},
                           {title: "Text Grid Column", width: 200, dataIndex: 'text'},
                           {title: "Text Grid Column", width: 200, dataIndex: 'text'}
                       ]}
                       data={[
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                           {text: "Text"},
                       ]}
                       header={false}
                       toolbars={
                           [
                               <Toolbar>
                                   <Button iconType={"plus"}
                                           text={"添加会员"}
                                           onClick={e => {
                                               this.forward(<TestBuilder/>)
                                           }}/>
                                   <CascaderField fieldLabel={"级联选择"} width={300}
                                                  store={new DataStore({api: "http://localhost:3300/cascader_data.json"})}
                                                  value={11}/>
                                   <Button text={"打开窗口"}
                                           onClick={e => {
                                               let pc = "abc";
                                               let mobile = "abc"
                                               WindowPanel.showing(<FormPanel layout={{column: 2, padding: false}}>
                                                   <FormFieldSet legend={"电脑端授权"} style={{margin: 20}}>
                                                       <div
                                                           style={{width: "100%", height: "100%", textAlign: "center"}}>
                                                           <div style={{
                                                               display: "inline-block",
                                                               width: 200,
                                                               height: 200,
                                                               textAlign: "center",
                                                               lineHeight: 200
                                                           }}>
                                                               {pc ? <a href={pc} target={"_blank"}
                                                                        style={{
                                                                            textDecoration: "none",
                                                                            color: '#0f74a8'
                                                                        }}>点击打开授权地址(仅HTTPS)</a>
                                                                   : "获取PC端授权地址失败(检查配置)"}
                                                           </div>
                                                       </div>
                                                   </FormFieldSet>
                                                   <FormFieldSet legend={"手机端授权"} style={{margin: 20}}>
                                                       <div
                                                           style={{width: "100%", height: "100%", textAlign: "center"}}>
                                                           {mobile ? <img style={{display: "inline-block"}} width={200}
                                                                          height={200} src={mobile}/>
                                                               : "获取移动端授权地址失败(检查配置)"}
                                                       </div>
                                                   </FormFieldSet>
                                               </FormPanel>, {title: "第三方平台授权地址", width: 638, height: 400})
                                           }}/>
                               </Toolbar>
                           ]
                       }>

            </GridPanel>
        );
    }

    componentDidMount() {
        // APIAdmin.getAdmins("abc").load();

        this.panelRef.instance.mask();
        setTimeout(() => {
            this.panelRef.instance.unmask();
        }, 1000);
    }
}
