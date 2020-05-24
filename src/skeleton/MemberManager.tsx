import Ginkgo, {GinkgoNode} from "ginkgoes";
import {AppManager, AppManagerProps} from "./AppPanel";
import APIUser from "./APIUser";
import GridPanel from "../grid/GridPanel";
import DataStore from "../store/DataStore";
import Button from "../button/Button";
import Toolbar from "../toolbar/Toolbar";
import {IconTypes} from "../icon/IconTypes";
import DisplayImage from "../image/DisplayImage";
import MemberBuilder from "./MemberBuilder";
import MessageBox from "../window/MessageBox";
import {getImageDownload} from "./App";

export interface MemberManagerProps extends AppManagerProps {
}

export default class MemberManager extends AppManager<MemberManagerProps> {
    protected store = new DataStore({api: APIUser.getUsers(), module: MemberManager.name, autoLoad: true});

    render(): GinkgoNode {
        return (
            <GridPanel paging={true}
                       columnTextAlign={"center"}
                       columns={[
                           {type: "checkbox"},
                           {
                               title: "头像", width: 60, dataIndex: 'avatar', render: data => {
                                   if (data) {
                                       if (!data.startsWith("http://")) {
                                           data = getImageDownload(data);
                                       }
                                   }
                                   return <DisplayImage width={40} height={40} src={data}/>;
                               }
                           },
                           {title: "用户名", width: 200, dataIndex: 'userName'},
                           {title: "等级", width: 100, dataIndex: 'TableUserLevel.name', dataDefault: "[其他]"},
                           {title: "积分", width: 100, dataIndex: 'TableIntegral.amount', dataDefault: "0"},
                           {title: "openid", width: 100, dataIndex: 'openid'},
                           {
                               title: "昵称", width: 100, dataIndex: 'nick', render: data => {
                                   return data ? decodeURIComponent(data) : "";
                               }
                           },
                           {
                               title: "性别", width: 100, dataIndex: 'gender', render: data => {
                                   if (data == '0') return '女';
                                   else if (data == '1') return '男';
                                   else return '未知';
                               }
                           },
                           {type: "datecolumn", title: "生日", width: 100, dataIndex: 'birthday', format: "yyyy/MM/dd"},
                           {title: "邮件地址", width: 260, dataIndex: 'email'},
                           {
                               title: "操作", width: 80, type: "actioncolumn", items: [
                                   {
                                       iconType: IconTypes.trash,
                                       size: 15,
                                       onActionClick: (value, data) => {
                                           console.log(value, data);
                                           MessageBox.showConfirm("删除管理员", "确定删除管理吗？", (e) => {
                                               this.store.load();
                                           })
                                       }
                                   },
                                   {
                                       iconType: "edit",
                                       size: 15,
                                       onActionClick: (value, data) => {
                                           this.forward(<MemberBuilder values={data}/>)
                                       }
                                   }
                               ],
                           }
                       ]}
                       header={false}
                       store={this.store}
                       toolbars={
                           [
                               <Toolbar>
                                   <Button iconType={"plus"}
                                           text={"添加会员"}
                                           onClick={e => {
                                               this.forward(<MemberBuilder/>)
                                           }}/>
                               </Toolbar>
                           ]
                       }>

            </GridPanel>
        );
    }
}
