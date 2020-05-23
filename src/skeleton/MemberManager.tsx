import Ginkgo, {GinkgoNode} from "ginkgoes";
import {AppManager, AppManagerProps} from "./AppPanel";
import APIUser from "./APIUser";
import GridPanel from "../grid/GridPanel";
import DataStore from "../store/DataStore";
import Button from "../button/Button";
import Toolbar from "../toolbar/Toolbar";
import {IconTypes} from "../icon/IconTypes";
import DisplayImage from "../image/DisplayImage";

export interface MemberManagerProps extends AppManagerProps {
}

export default class MemberManager extends AppManager<MemberManagerProps> {
    render(): GinkgoNode {
        return (
            <GridPanel paging={true}
                       fit={true}
                       columns={[
                           {type: "checkbox"},
                           {
                               title: "头像", width: 60, dataIndex: 'avatar', render: data => {
                                   return <DisplayImage type={"fit"} width={40} height={40}
                                                        src={"http://t9.baidu.com/it/u=3363001160,1163944807&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1590816975&t=eaad431500913e9a2a090c1aab99b46f"}/>
                               }
                           },
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
                           {
                               type: "actioncolumn", items: [
                                   {
                                       iconType: IconTypes.trash
                                   },
                                   {
                                       iconType: IconTypes.times
                                   },
                                   {
                                       text: "删除",
                                       size: 14
                                   }
                               ]
                           }
                       ]}
                       header={false}
                       store={new DataStore({api: APIUser.getUsers(), module: MemberManager.name, autoLoad: true})}
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
