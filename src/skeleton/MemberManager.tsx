import Ginkgo, {GinkgoNode} from "ginkgoes";
import {AppManager, AppManagerProps} from "./AppPanel";
import APIUser from "./APIUser";
import GridPanel from "../grid/GridPanel";
import DataStore from "../store/DataStore";
import Button from "../button/Button";
import Toolbar from "../toolbar/Toolbar";

export interface MemberManagerProps extends AppManagerProps {
}

export default class MemberManager extends AppManager<MemberManagerProps> {
    render(): GinkgoNode {
        return (
            <GridPanel paging={true}
                       fit={true}
                       columns={[
                           {type: "checkbox"},
                           {title: "头像", width: 60, dataIndex: 'avatar'},
                           {title: "用户名", width: 200, dataIndex: 'userName'},
                           {title: "等级", width: 100, dataIndex: 'TableUserLevel'},
                           {title: "积分", width: 100, dataIndex: 'TableIntegral'},
                           {title: "openid", width: 100, dataIndex: 'openid'},
                           {title: "昵称", width: 100, dataIndex: 'nick'},
                           {
                               title: "性别", width: 100, dataIndex: 'gender', render: data => {
                                   if (data == '0') return '女';
                                   else if (data == '1') return '男';
                                   else return '未知';
                               }
                           },
                           {title: "生日", width: 200, dataIndex: 'birthday'},
                           {title: "邮件地址", width: 260, dataIndex: 'email'},
                           {type: "actioncolumn"}
                       ]}
                       header={false}
                       store={new DataStore({api: APIUser.getUsers(), module: MemberManager.name})}
                       toolbars={
                           [
                               <Toolbar>
                                   <Button iconType={"plus"}
                                           text={"添加会员"}
                                           onClick={e => {
                                           }}/>
                               </Toolbar>
                           ]
                       }>

            </GridPanel>
        );
    }
}
