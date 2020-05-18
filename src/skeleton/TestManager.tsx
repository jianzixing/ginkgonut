import Ginkgo, {GinkgoNode} from "ginkgoes";
import {AppManagerProps, AppManager} from "./AppPanel";
import Toolbar from "../toolbar/Toolbar";
import Button from "../button/Button";
import GridPanel from "../grid/GridPanel";
import TestBuilder from "./TestBuilder";
import CascaderField from "../form/CascaderField";
import DataStore from "../store/DataStore";
import APIAdmin from "./APIAdmin";

export interface TestManagerProps extends AppManagerProps {
}

export default class TestManager extends AppManager<TestManagerProps> {
    render(): GinkgoNode {
        return (
            <GridPanel key={"ddd"}
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
                               </Toolbar>
                           ]
                       }>

            </GridPanel>
        );
    }

    componentDidMount() {
        // APIAdmin.getAdmins("abc").load();
    }
}
