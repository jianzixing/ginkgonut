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
                       columnTextAlign={"center"}
                       tableCellBorder={false}
                       columns={[
                           {type: "checkbox"},
                           {
                               title: "头像", width: 60, dataIndex: 'avatar', render: data => {
                                   return <DisplayImage type={"fit"} width={40} height={40}
                                                        src={"http://thirdwx.qlogo.cn/mmopen/Q3auHgzwzM4jcureRpRnRumgeywo3yU0nSU3ApjQqzHIo3LfbSF5dgovILrPC5TnvR4LdqWejZ8ENcEUaEiccoQ/132"}/>
                               }
                           },
                           {title: "用户名", width: 200, dataIndex: 'userName'},
                           {title: "等级", width: 100, dataIndex: 'TableUserLevel.name', dataDefault: "ELSE"},
                           {title: "积分", width: 100, dataIndex: 'TableIntegral.amount', dataDefault: "0"},
                           {title: "openid", width: 100, dataIndex: 'openid'},
                           {title: "昵称", width: 100, dataIndex: 'nick'},
                           {
                               title: "性别", width: 100, dataIndex: 'gender', render: data => {
                                   if (data == '0') return '女';
                                   else if (data == '1') return '男';
                                   else return '未知';
                               }
                           },
                           {type: "datecolumn", title: "生日", width: 200, dataIndex: 'birthday', format: "yyyy/MM/dd"},
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
